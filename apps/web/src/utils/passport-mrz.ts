export type MrzPassportData = {
  birthDate: string | null;
  birthDateValid: boolean;
  documentCode: string;
  documentNumber: string;
  documentNumberValid: boolean;
  expiryDate: string | null;
  expiryDateValid: boolean;
  firstName: string;
  issuingCountry: string;
  lastName: string;
  mrzText: string;
  nationality: string;
  optionalData: string;
  personalNumber: string;
  personalNumberValid: boolean;
  rawLine1: string;
  rawLine2: string;
  sex: string;
};

export type MrzExtractionResult = {
  candidateLines: string[];
  parsed: MrzPassportData | null;
};

const MRZ_LINE_LENGTH = 44;

function normalizeMrzCharacters(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9<]/g, "");
}

function padMrzLine(value: string): string {
  if (value.length >= MRZ_LINE_LENGTH) {
    return value.slice(0, MRZ_LINE_LENGTH);
  }

  return value.padEnd(MRZ_LINE_LENGTH, "<");
}

function sanitizeMrzLine(value: string): string {
  return padMrzLine(normalizeMrzCharacters(value));
}

function decodeMrzField(value: string): string {
  return value.replace(/<+/g, " ").trim();
}

function decodeNameField(value: string): { firstName: string; lastName: string } {
  const [lastNameSegment = "", firstNameSegment = ""] = value.split("<<");

  return {
    firstName: decodeMrzField(firstNameSegment),
    lastName: decodeMrzField(lastNameSegment),
  };
}

function charValue(value: string): number {
  if (/^\d$/.test(value)) {
    return Number(value);
  }

  if (value === "<") {
    return 0;
  }

  const alphabetIndex = value.charCodeAt(0) - 55;
  return alphabetIndex >= 10 && alphabetIndex <= 35 ? alphabetIndex : 0;
}

function computeChecksum(value: string): number {
  const weights = [7, 3, 1];

  return value
    .split("")
    .reduce(
      (total, character, index) => total + charValue(character) * weights[index % 3],
      0,
    ) % 10;
}

function validateChecksum(value: string, checkDigit: string): boolean {
  const normalizedCheckDigit = normalizeNumericCharacter(checkDigit);

  if (!/^\d$/.test(normalizedCheckDigit)) {
    return false;
  }

  return computeChecksum(value) === Number(normalizedCheckDigit);
}

function normalizeNumericCharacter(value: string): string {
  return value
    .replace(/[OoQUD]/g, "0")
    .replace(/[Il|]/g, "1")
    .replace(/Z/g, "2")
    .replace(/S/g, "5")
    .replace(/B/g, "8");
}

function normalizeDate(value: string): string | null {
  const normalizedValue = [...value].map(normalizeNumericCharacter).join("");

  if (!/^\d{6}$/.test(normalizedValue)) {
    return null;
  }

  const year = Number(normalizedValue.slice(0, 2));
  const month = Number(normalizedValue.slice(2, 4));
  const day = Number(normalizedValue.slice(4, 6));

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const century = year > 50 ? 1900 : 2000;
  return `${century + year}-${normalizedValue.slice(2, 4)}-${normalizedValue.slice(4, 6)}`;
}

function scoreMrzLine(value: string): number {
  const fillerCount = [...value].filter((character) => character === "<").length;
  const hasPrefix = value.startsWith("P<") ? 10 : 0;

  return hasPrefix + value.length - fillerCount * 0.25;
}

export function extractMrzLines(ocrText: string): string[] {
  const normalizedLines = ocrText
    .split(/\r?\n/)
    .map((line) => normalizeMrzCharacters(line))
    .filter((line) => line.length >= 30);

  const candidates = normalizedLines
    .flatMap((line) => {
      if (line.length <= MRZ_LINE_LENGTH) {
        return [line];
      }

      const windows: string[] = [];

      for (let index = 0; index <= line.length - MRZ_LINE_LENGTH; index += 1) {
        windows.push(line.slice(index, index + MRZ_LINE_LENGTH));
      }

      return windows;
    })
    .map(sanitizeMrzLine);

  const uniqueCandidates = [...new Set(candidates)];

  return uniqueCandidates
    .sort((left, right) => scoreMrzLine(right) - scoreMrzLine(left))
    .slice(0, 6);
}

export function parsePassportMrz(lines: string[]): MrzPassportData | null {
  if (lines.length < 2) {
    return null;
  }

  const line1 = sanitizeMrzLine(lines[0]);
  const line2 = sanitizeMrzLine(lines[1]);

  if (!line1.startsWith("P<")) {
    return null;
  }

  const { firstName, lastName } = decodeNameField(line1.slice(5));
  const documentNumber = decodeMrzField(line2.slice(0, 9));
  const nationality = decodeMrzField(line2.slice(10, 13));
  const birthDateRaw = line2.slice(13, 19);
  const sex = decodeMrzField(line2.slice(20, 21));
  const expiryDateRaw = line2.slice(21, 27);
  const personalNumberRaw = line2.slice(28, 42);

  return {
    birthDate: normalizeDate(birthDateRaw),
    birthDateValid: validateChecksum(birthDateRaw, line2.slice(19, 20)),
    documentCode: decodeMrzField(line1.slice(0, 2)),
    documentNumber,
    documentNumberValid: validateChecksum(line2.slice(0, 9), line2.slice(9, 10)),
    expiryDate: normalizeDate(expiryDateRaw),
    expiryDateValid: validateChecksum(expiryDateRaw, line2.slice(27, 28)),
    firstName,
    issuingCountry: decodeMrzField(line1.slice(2, 5)),
    lastName,
    mrzText: `${line1}\n${line2}`,
    nationality,
    optionalData: decodeMrzField(line2.slice(28)),
    personalNumber: decodeMrzField(personalNumberRaw),
    personalNumberValid: validateChecksum(personalNumberRaw, line2.slice(42, 43)),
    rawLine1: line1,
    rawLine2: line2,
    sex,
  };
}

export function extractAndParsePassportMrz(ocrText: string): MrzExtractionResult {
  const candidateLines = extractMrzLines(ocrText);

  for (let index = 0; index < candidateLines.length - 1; index += 1) {
    const parsed = parsePassportMrz([
      candidateLines[index] ?? "",
      candidateLines[index + 1] ?? "",
    ]);

    if (parsed) {
      return { candidateLines, parsed };
    }
  }

  return {
    candidateLines,
    parsed: null,
  };
}
