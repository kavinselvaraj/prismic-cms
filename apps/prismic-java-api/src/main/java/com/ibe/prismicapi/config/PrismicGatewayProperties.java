package com.ibe.prismicapi.config;

import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.prismic")
public class PrismicGatewayProperties {

  private String repositoryName;
  private String accessToken;
  private long cacheTtlSeconds = 300;
  private List<String> labelDocumentTypes = new ArrayList<>();

  public String getRepositoryName() {
    return repositoryName;
  }

  public void setRepositoryName(String repositoryName) {
    this.repositoryName = repositoryName;
  }

  public String getAccessToken() {
    return accessToken;
  }

  public void setAccessToken(String accessToken) {
    this.accessToken = accessToken;
  }

  public long getCacheTtlSeconds() {
    return cacheTtlSeconds;
  }

  public void setCacheTtlSeconds(long cacheTtlSeconds) {
    this.cacheTtlSeconds = cacheTtlSeconds;
  }

  public List<String> getLabelDocumentTypes() {
    return labelDocumentTypes;
  }

  public void setLabelDocumentTypes(List<String> labelDocumentTypes) {
    this.labelDocumentTypes = labelDocumentTypes;
  }
}
