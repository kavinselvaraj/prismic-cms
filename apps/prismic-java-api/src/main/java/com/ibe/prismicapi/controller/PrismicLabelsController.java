package com.ibe.prismicapi.controller;

import com.ibe.prismicapi.model.LabelsGatewayResponse;
import com.ibe.prismicapi.service.PrismicLabelsGatewayService;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/prismic")
public class PrismicLabelsController {

  private final PrismicLabelsGatewayService labelsGatewayService;

  public PrismicLabelsController(PrismicLabelsGatewayService labelsGatewayService) {
    this.labelsGatewayService = labelsGatewayService;
  }

  @GetMapping("/labels/{locale}")
  public ResponseEntity<LabelsGatewayResponse> getLabels(
      @PathVariable String locale,
      @RequestParam(defaultValue = "false") boolean refresh
  ) {
    LabelsGatewayResponse response = labelsGatewayService.getLabels(locale, refresh);

    return ResponseEntity.ok()
        .cacheControl(CacheControl.noStore())
        .body(response);
  }
}
