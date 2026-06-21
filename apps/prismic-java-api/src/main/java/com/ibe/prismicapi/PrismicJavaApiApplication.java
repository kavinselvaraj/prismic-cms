package com.ibe.prismicapi;

import com.ibe.prismicapi.config.PrismicGatewayProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(PrismicGatewayProperties.class)
public class PrismicJavaApiApplication {

  public static void main(String[] args) {
    SpringApplication.run(PrismicJavaApiApplication.class, args);
  }
}
