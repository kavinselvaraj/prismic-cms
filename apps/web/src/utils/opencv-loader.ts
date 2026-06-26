let opencvLoaderPromise: Promise<OpenCvNamespace> | null = null;

export type OpenCvNamespace = {
  ADAPTIVE_THRESH_GAUSSIAN_C: number;
  BORDER_DEFAULT: number;
  COLOR_RGBA2GRAY: number;
  CV_8U: number;
  Mat: new () => OpenCvMat;
  MatVector: new () => OpenCvMatVector;
  MORPH_RECT: number;
  Point: new (x: number, y: number) => { x: number; y: number };
  Size: new (width: number, height: number) => { width: number; height: number };
  adaptiveThreshold: (
    source: OpenCvMat,
    destination: OpenCvMat,
    maxValue: number,
    adaptiveMethod: number,
    thresholdType: number,
    blockSize: number,
    c: number,
  ) => void;
  cvtColor: (source: OpenCvMat, destination: OpenCvMat, code: number) => void;
  GaussianBlur: (
    source: OpenCvMat,
    destination: OpenCvMat,
    kernelSize: { width: number; height: number },
    sigmaX: number,
    sigmaY: number,
    borderType: number,
  ) => void;
  getStructuringElement: (
    shape: number,
    kernelSize: { width: number; height: number },
  ) => OpenCvMat;
  imread: (source: HTMLCanvasElement) => OpenCvMat;
  imshow: (canvas: HTMLCanvasElement, mat: OpenCvMat) => void;
  morphologyEx: (
    source: OpenCvMat,
    destination: OpenCvMat,
    operation: number,
    kernel: OpenCvMat,
  ) => void;
  MORPH_CLOSE: number;
  THRESH_BINARY: number;
};

type OpenCvMat = {
  delete: () => void;
};

type OpenCvMatVector = {
  delete: () => void;
};

declare global {
  interface Window {
    cv?: OpenCvNamespace & {
      onRuntimeInitialized?: () => void;
    };
  }
}

function resolveLoadedOpenCv(): OpenCvNamespace | null {
  const cv = window.cv;

  if (!cv?.Mat || !cv?.imshow) {
    return null;
  }

  return cv;
}

export function loadOpenCv(): Promise<OpenCvNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("OpenCV can only be loaded in the browser"));
  }

  const alreadyLoaded = resolveLoadedOpenCv();

  if (alreadyLoaded) {
    return Promise.resolve(alreadyLoaded);
  }

  if (opencvLoaderPromise) {
    return opencvLoaderPromise;
  }

  opencvLoaderPromise = new Promise<OpenCvNamespace>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-opencv-loader="true"]',
    );

    const handleReady = () => {
      const loadedCv = resolveLoadedOpenCv();

      if (!loadedCv) {
        reject(new Error("OpenCV loaded but runtime is not ready"));
        return;
      }

      resolve(loadedCv);
    };

    if (window.cv) {
      window.cv.onRuntimeInitialized = handleReady;
    }

    if (existingScript) {
      existingScript.addEventListener("error", () => {
        reject(new Error("Unable to load OpenCV script"));
      });

      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.dataset.opencvLoader = "true";
    script.src = "https://docs.opencv.org/4.10.0/opencv.js";
    script.onload = () => {
      if (resolveLoadedOpenCv()) {
        handleReady();
        return;
      }

      if (!window.cv) {
        reject(new Error("OpenCV script loaded without exposing cv"));
        return;
      }

      window.cv.onRuntimeInitialized = handleReady;
    };
    script.onerror = () => {
      reject(new Error("Unable to load OpenCV script"));
    };

    document.head.appendChild(script);
  }).catch((error: unknown) => {
    opencvLoaderPromise = null;
    throw error;
  });

  return opencvLoaderPromise;
}
