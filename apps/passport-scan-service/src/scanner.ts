import sharp from "sharp";
import { PSM, createWorker } from "tesseract.js";
import { extractAndParsePassportMrz, type MrzPassportData } from "./mrz";
import { getOpenCv } from "./opencv";

export type PassportScanResponse = {
  candidateLines: string[];
  passportData: MrzPassportData | null;
  processedPreviewDataUrl: string | null;
  statusMessage: string;
  transcript: string;
};

type CropVariant = {
  heightRatio: number;
  label: string;
  topOffsetRatio: number;
  widthInsetRatio: number;
};

type ProcessedVariant = {
  buffer: Buffer;
  label: string;
  previewDataUrl: string;
};

const cropVariants: CropVariant[] = [
  { label: "bottom-tight", heightRatio: 0.2, topOffsetRatio: 0.02, widthInsetRatio: 0.02 },
  { label: "bottom-standard", heightRatio: 0.28, topOffsetRatio: 0.03, widthInsetRatio: 0 },
  { label: "bottom-wide", heightRatio: 0.36, topOffsetRatio: 0.04, widthInsetRatio: 0 },
  { label: "lower-middle", heightRatio: 0.42, topOffsetRatio: 0.12, widthInsetRatio: 0.03 },
];

function toDataUrl(buffer: Buffer): string {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

function scoreTranscript(transcript: string, candidateLines: string[]): number {
  const normalizedTranscript = transcript.toUpperCase();
  const candidateWeight = candidateLines.length * 20;
  const prefixWeight = normalizedTranscript.includes("P<") ? 30 : 0;
  const fillerWeight = (normalizedTranscript.match(/</g) ?? []).length;

  return candidateWeight + prefixWeight + fillerWeight;
}

async function preprocessWithOpenCv(inputPng: Buffer): Promise<Buffer> {
  const cv = getOpenCv();
  const { data, info } = await sharp(inputPng)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const source = cv.matFromArray(info.height, info.width, cv.CV_8UC4, [...data]);
  const grayscale = new cv.Mat();
  const blurred = new cv.Mat();
  const thresholded = new cv.Mat();
  const morphed = new cv.Mat();
  const rgbaOutput = new cv.Mat();
  const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));

  try {
    cv.cvtColor(source, grayscale, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(
      grayscale,
      blurred,
      new cv.Size(5, 5),
      0,
      0,
      cv.BORDER_DEFAULT,
    );
    cv.adaptiveThreshold(
      blurred,
      thresholded,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY,
      31,
      11,
    );
    cv.morphologyEx(thresholded, morphed, cv.MORPH_CLOSE, kernel);
    cv.cvtColor(morphed, rgbaOutput, cv.COLOR_GRAY2RGBA);

    return await sharp(Buffer.from(rgbaOutput.data), {
      raw: {
        channels: 4,
        height: rgbaOutput.rows,
        width: rgbaOutput.cols,
      },
    })
      .png()
      .toBuffer();
  } finally {
    source.delete();
    grayscale.delete();
    blurred.delete();
    thresholded.delete();
    morphed.delete();
    rgbaOutput.delete();
    kernel.delete();
  }
}

async function preprocessVariant(
  imageBuffer: Buffer,
  cropVariant: CropVariant,
): Promise<ProcessedVariant> {
  const rotated = sharp(imageBuffer).rotate();
  const metadata = await rotated.metadata();
  const sourceWidth = metadata.width;
  const sourceHeight = metadata.height;

  if (!sourceWidth || !sourceHeight) {
    throw new Error("Unable to read the uploaded image dimensions.");
  }

  const insetX = Math.floor(sourceWidth * cropVariant.widthInsetRatio);
  const extractWidth = Math.max(240, sourceWidth - insetX * 2);
  const extractHeight = Math.max(72, Math.floor(sourceHeight * cropVariant.heightRatio));
  const extractTop = Math.max(
    0,
    sourceHeight - extractHeight - Math.floor(sourceHeight * cropVariant.topOffsetRatio),
  );

  const croppedBuffer = await rotated
    .clone()
    .extract({
      height: extractHeight,
      left: insetX,
      top: extractTop,
      width: extractWidth,
    })
    .resize({
      fit: "fill",
      height: 360,
      width: 1400,
    })
    .png()
    .toBuffer();

  const processedBuffer = await preprocessWithOpenCv(croppedBuffer);

  return {
    buffer: processedBuffer,
    label: cropVariant.label,
    previewDataUrl: toDataUrl(processedBuffer),
  };
}

async function createProcessedVariants(imageBuffer: Buffer): Promise<ProcessedVariant[]> {
  return Promise.all(cropVariants.map((cropVariant) => preprocessVariant(imageBuffer, cropVariant)));
}

export async function scanPassportImage(imageBuffer: Buffer): Promise<PassportScanResponse> {
  const variants = await createProcessedVariants(imageBuffer);
  const worker = await createWorker("eng", 1);

  try {
    await worker.setParameters({
      preserve_interword_spaces: "0",
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<",
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
    });

    let bestResponse: PassportScanResponse = {
      candidateLines: [],
      passportData: null,
      processedPreviewDataUrl: null,
      statusMessage: "OCR finished, but no MRZ-like text was detected in the scanned region.",
      transcript: "",
    };
    let bestScore = -1;

    for (const variant of variants) {
      const result = await worker.recognize(variant.buffer);
      const transcript = result.data.text;
      const extraction = extractAndParsePassportMrz(transcript);
      const score = scoreTranscript(transcript, extraction.candidateLines);

      if (extraction.parsed) {
        return {
          candidateLines: extraction.candidateLines,
          passportData: extraction.parsed,
          processedPreviewDataUrl: variant.previewDataUrl,
          statusMessage: "Passport MRZ parsed successfully.",
          transcript,
        };
      }

      if (score > bestScore) {
        bestScore = score;
        bestResponse = {
          candidateLines: extraction.candidateLines,
          passportData: null,
          processedPreviewDataUrl: variant.previewDataUrl,
          statusMessage:
            extraction.candidateLines.length > 0
              ? "OCR found MRZ-like text, but it was not strong enough to parse into a valid passport record."
              : "OCR finished, but no MRZ-like text was detected in the scanned region.",
          transcript,
        };
      }
    }

    return bestResponse;
  } finally {
    await worker.terminate();
  }
}
