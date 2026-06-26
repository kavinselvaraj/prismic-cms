import type { MrzPassportData } from "./passport-mrz";

export type PassportScanResponse = {
  candidateLines: string[];
  passportData: MrzPassportData | null;
  processedPreviewDataUrl: string | null;
  statusMessage: string;
  transcript: string;
};
