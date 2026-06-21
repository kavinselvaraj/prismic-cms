package com.ibe.prismicapi.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ibe.prismicapi.config.PrismicGatewayProperties;
import com.ibe.prismicapi.model.LabelsGatewayResponse;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PrismicLabelsGatewayService {

  private final PrismicGatewayProperties properties;
  private final ObjectMapper objectMapper;
  private final HttpClient httpClient;
  private final Map<String, CachedLabelsResponse> cache = new ConcurrentHashMap<>();

  public PrismicLabelsGatewayService(
      PrismicGatewayProperties properties,
      ObjectMapper objectMapper
  ) {
    this.properties = properties;
    this.objectMapper = objectMapper;
    this.httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(20))
        .build();
  }

  public LabelsGatewayResponse getLabels(String locale, boolean refresh) {
    validateConfiguration();

    String normalizedLocale = normalizeAppLocale(locale);
    CachedLabelsResponse cachedResponse = cache.get(normalizedLocale);

    if (!refresh && cachedResponse != null && !cachedResponse.isExpired()) {
      return cachedResponse.response();
    }

    LabelsGatewayResponse freshResponse = fetchLabelsFromPrismic(normalizedLocale);
    cache.put(normalizedLocale, new CachedLabelsResponse(
        freshResponse,
        Instant.now().plusSeconds(properties.getCacheTtlSeconds())
    ));

    return freshResponse;
  }

  private LabelsGatewayResponse fetchLabelsFromPrismic(String locale) {
    String prismicLocale = toPrismicLocale(locale);
    String repositoryName = properties.getRepositoryName();
    String masterRef = fetchMasterRef(repositoryName);
    JsonNode ibeDocument = fetchSingleDocument(repositoryName, masterRef, prismicLocale, "ibe");
    Set<String> expectedTypes = Set.copyOf(properties.getLabelDocumentTypes());
    List<String> childIds = extractChildDocumentIds(ibeDocument.path("data"), expectedTypes);

    if (childIds.size() != expectedTypes.size()) {
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY,
          "Prismic parent `ibe` is missing one or more linked label documents"
      );
    }

    List<JsonNode> childDocuments = fetchDocumentsByIds(repositoryName, masterRef, prismicLocale, childIds);
    Map<String, JsonNode> documents = new LinkedHashMap<>();

    documents.put("ibe", minimizeDocument(ibeDocument));
    for (JsonNode childDocument : childDocuments) {
      String type = childDocument.path("type").asText();
      documents.put(type, minimizeDocument(childDocument));
    }

    return new LabelsGatewayResponse(
        locale,
        prismicLocale,
        "prismic-java-api",
        false,
        repositoryName,
        Instant.now(),
        documents
    );
  }

  private String fetchMasterRef(String repositoryName) {
    JsonNode apiRoot = getJson(buildApiRootUrl(repositoryName));

    for (JsonNode ref : apiRoot.path("refs")) {
      if (ref.path("isMasterRef").asBoolean(false)) {
        return ref.path("ref").asText();
      }
    }

    throw new ResponseStatusException(
        HttpStatus.BAD_GATEWAY,
        "Unable to resolve Prismic master ref"
    );
  }

  private JsonNode fetchSingleDocument(
      String repositoryName,
      String ref,
      String prismicLocale,
      String documentType
  ) {
    String predicate = "[[at(document.type,\"" + documentType + "\")]]";
    JsonNode response = getJson(buildSearchUrl(repositoryName, ref, prismicLocale, predicate));
    JsonNode results = response.path("results");

    if (!results.isArray() || results.isEmpty()) {
      throw new ResponseStatusException(
          HttpStatus.NOT_FOUND,
          "No Prismic document found for type `" + documentType + "` and locale `" + prismicLocale + "`"
      );
    }

    return results.get(0);
  }

  private List<JsonNode> fetchDocumentsByIds(
      String repositoryName,
      String ref,
      String prismicLocale,
      List<String> documentIds
  ) {
    String ids = documentIds.stream()
        .map(id -> "\"" + id + "\"")
        .collect(Collectors.joining(","));
    String predicate = "[[in(document.id,[" + ids + "])]]";
    JsonNode response = getJson(buildSearchUrl(repositoryName, ref, prismicLocale, predicate));
    List<JsonNode> results = new ArrayList<>();

    response.path("results").forEach(results::add);

    return results;
  }

  private List<String> extractChildDocumentIds(JsonNode dataNode, Set<String> expectedTypes) {
    List<String> childIds = new ArrayList<>();
    dataNode.fields().forEachRemaining(field -> {
      JsonNode value = field.getValue();
      String documentType = value.path("type").asText();
      String documentId = value.path("id").asText();

      if (expectedTypes.contains(documentType) && !documentId.isBlank()) {
        childIds.add(documentId);
      }
    });

    return childIds;
  }

  private JsonNode minimizeDocument(JsonNode document) {
    Map<String, Object> minimized = new LinkedHashMap<>();
    minimized.put("id", document.path("id").asText());
    minimized.put("type", document.path("type").asText());
    minimized.put("lang", document.path("lang").asText());
    minimized.put("data", document.path("data"));

    return objectMapper.valueToTree(minimized);
  }

  private JsonNode getJson(String url) {
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(url))
        .timeout(Duration.ofSeconds(20))
        .GET()
        .build();

    try {
      HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

      if (response.statusCode() >= 400) {
        throw new ResponseStatusException(
            HttpStatus.BAD_GATEWAY,
            "Prismic request failed with status " + response.statusCode()
        );
      }

      return objectMapper.readTree(response.body());
    } catch (IOException | InterruptedException exception) {
      Thread.currentThread().interrupt();
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY,
          "Unable to retrieve data from Prismic",
          exception
      );
    }
  }

  private String buildApiRootUrl(String repositoryName) {
    return withAccessToken("https://" + repositoryName + ".cdn.prismic.io/api/v2");
  }

  private String buildSearchUrl(
      String repositoryName,
      String ref,
      String prismicLocale,
      String predicate
  ) {
    String encodedRef = urlEncode(ref);
    String encodedLocale = urlEncode(prismicLocale);
    String encodedPredicate = urlEncode(predicate);
    String url = "https://" + repositoryName + ".cdn.prismic.io/api/v2/documents/search"
        + "?ref=" + encodedRef
        + "&lang=" + encodedLocale
        + "&pageSize=100"
        + "&q=" + encodedPredicate;

    return withAccessToken(url);
  }

  private String withAccessToken(String url) {
    if (properties.getAccessToken() == null || properties.getAccessToken().isBlank()) {
      return url;
    }

    String separator = url.contains("?") ? "&" : "?";
    return url + separator + "access_token=" + urlEncode(properties.getAccessToken());
  }

  private String urlEncode(String value) {
    return URLEncoder.encode(value, StandardCharsets.UTF_8);
  }

  private String normalizeAppLocale(String locale) {
    return switch (locale.toLowerCase()) {
      case "en", "en-us" -> "en";
      case "ja", "ja-jp" -> "ja";
      default -> locale.toLowerCase();
    };
  }

  private String toPrismicLocale(String locale) {
    return switch (locale) {
      case "en" -> "en-us";
      case "ja" -> "ja-jp";
      default -> locale;
    };
  }

  private void validateConfiguration() {
    if (properties.getRepositoryName() == null || properties.getRepositoryName().isBlank()) {
      throw new ResponseStatusException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "PRISMIC_REPOSITORY_NAME is required"
      );
    }
  }

  private record CachedLabelsResponse(LabelsGatewayResponse response, Instant expiresAt) {
    private boolean isExpired() {
      return Instant.now().isAfter(expiresAt);
    }
  }
}
