import cv from "@techstark/opencv-js";

export type OpenCvModule = typeof cv;

export function getOpenCv(): OpenCvModule {
  if (!cv || !("Mat" in cv)) {
    throw new Error("OpenCV is not available in the passport scan service.");
  }

  return cv;
}
