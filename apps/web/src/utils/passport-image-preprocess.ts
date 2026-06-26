function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function grayscaleValue(red: number, green: number, blue: number): number {
  return Math.round(red * 0.299 + green * 0.587 + blue * 0.114);
}

type CropVariant = {
  heightRatio: number;
  label: string;
  topOffsetRatio: number;
  widthInsetRatio: number;
};

export type ProcessedPassportVariant = {
  canvas: HTMLCanvasElement;
  dataUrl: string;
  label: string;
};

const cropVariants: CropVariant[] = [
  {
    label: "bottom-tight",
    heightRatio: 0.2,
    topOffsetRatio: 0.02,
    widthInsetRatio: 0.02,
  },
  {
    label: "bottom-standard",
    heightRatio: 0.28,
    topOffsetRatio: 0.03,
    widthInsetRatio: 0,
  },
  {
    label: "bottom-wide",
    heightRatio: 0.36,
    topOffsetRatio: 0.04,
    widthInsetRatio: 0,
  },
  {
    label: "lower-middle",
    heightRatio: 0.42,
    topOffsetRatio: 0.12,
    widthInsetRatio: 0.03,
  },
];

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function drawMrzRegion(
  sourceCanvas: HTMLCanvasElement,
  cropVariant: CropVariant,
  destinationCanvas: HTMLCanvasElement,
): ImageData {
  const sourceContext = sourceCanvas.getContext("2d");

  if (!sourceContext) {
    throw new Error("Unable to read the source image.");
  }

  const sourceWidth = sourceCanvas.width;
  const insetX = Math.floor(sourceWidth * cropVariant.widthInsetRatio);
  const cropWidth = Math.max(240, sourceWidth - insetX * 2);
  const cropHeight = Math.max(72, Math.floor(sourceCanvas.height * cropVariant.heightRatio));
  const cropTop = Math.max(
    0,
    sourceCanvas.height - cropHeight - Math.floor(sourceCanvas.height * cropVariant.topOffsetRatio),
  );

  const destinationContext = destinationCanvas.getContext("2d");

  if (!destinationContext) {
    throw new Error("Unable to prepare the processed canvas.");
  }

  destinationContext.imageSmoothingEnabled = true;
  destinationContext.drawImage(
    sourceCanvas,
    insetX,
    cropTop,
    cropWidth,
    cropHeight,
    0,
    0,
    destinationCanvas.width,
    destinationCanvas.height,
  );

  return destinationContext.getImageData(
    0,
    0,
    destinationCanvas.width,
    destinationCanvas.height,
  );
}

function enhanceContrast(imageData: ImageData) {
  const { data } = imageData;
  let darkest = 255;
  let brightest = 0;

  for (let index = 0; index < data.length; index += 4) {
    const gray = grayscaleValue(data[index] ?? 0, data[index + 1] ?? 0, data[index + 2] ?? 0);
    darkest = Math.min(darkest, gray);
    brightest = Math.max(brightest, gray);
  }

  const spread = Math.max(1, brightest - darkest);

  for (let index = 0; index < data.length; index += 4) {
    const gray = grayscaleValue(data[index] ?? 0, data[index + 1] ?? 0, data[index + 2] ?? 0);
    const normalized = ((gray - darkest) / spread) * 255;
    const contrast = clamp((normalized - 128) * 1.85 + 128, 0, 255);

    data[index] = contrast;
    data[index + 1] = contrast;
    data[index + 2] = contrast;
    data[index + 3] = 255;
  }
}

function applyAdaptiveThreshold(imageData: ImageData) {
  const { data, width, height } = imageData;
  const grayscale = new Uint8ClampedArray(width * height);

  for (let index = 0; index < grayscale.length; index += 1) {
    const pixelOffset = index * 4;
    grayscale[index] = data[pixelOffset] ?? 0;
  }

  const integral = new Uint32Array((width + 1) * (height + 1));

  for (let y = 1; y <= height; y += 1) {
    let rowSum = 0;

    for (let x = 1; x <= width; x += 1) {
      rowSum += grayscale[(y - 1) * width + (x - 1)] ?? 0;
      integral[y * (width + 1) + x] = integral[(y - 1) * (width + 1) + x] + rowSum;
    }
  }

  const windowRadius = 10;
  const thresholdOffset = 10;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const left = Math.max(0, x - windowRadius);
      const right = Math.min(width - 1, x + windowRadius);
      const top = Math.max(0, y - windowRadius);
      const bottom = Math.min(height - 1, y + windowRadius);

      const area = (right - left + 1) * (bottom - top + 1);
      const sum =
        integral[(bottom + 1) * (width + 1) + (right + 1)] -
        integral[top * (width + 1) + (right + 1)] -
        integral[(bottom + 1) * (width + 1) + left] +
        integral[top * (width + 1) + left];
      const average = sum / area;
      const sourceValue = grayscale[y * width + x] ?? 0;
      const output = sourceValue < average - thresholdOffset ? 0 : 255;
      const pixelOffset = (y * width + x) * 4;

      data[pixelOffset] = output;
      data[pixelOffset + 1] = output;
      data[pixelOffset + 2] = output;
      data[pixelOffset + 3] = 255;
    }
  }
}

export function preprocessPassportImageVariants(
  sourceCanvas: HTMLCanvasElement,
): ProcessedPassportVariant[] {
  return cropVariants.map((cropVariant) => {
    const canvas = createCanvas(1400, 360);
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to prepare the processed canvas.");
    }

    const imageData = drawMrzRegion(sourceCanvas, cropVariant, canvas);
    enhanceContrast(imageData);
    applyAdaptiveThreshold(imageData);
    context.putImageData(imageData, 0, 0);

    return {
      canvas,
      dataUrl: canvas.toDataURL("image/png"),
      label: cropVariant.label,
    };
  });
}
