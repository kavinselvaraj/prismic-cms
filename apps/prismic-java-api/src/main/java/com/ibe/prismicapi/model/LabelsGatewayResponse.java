package com.ibe.prismicapi.model;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;
import java.util.Map;

public record LabelsGatewayResponse(
    String locale,
    String prismicLocale,
    String source,
    boolean cached,
    String repository,
    Instant fetchedAt,
    Map<String, JsonNode> documents
) {
}
