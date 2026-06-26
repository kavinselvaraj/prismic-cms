"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import type { MrzPassportData } from "@/utils/passport-mrz";
import type { PassportScanResponse } from "@/utils/passport-scan";

type ScanStatus =
  | "idle"
  | "loading-camera"
  | "uploading"
  | "running-ocr"
  | "success"
  | "error";

type PassportScannerDemoProps = {
  locale: string;
};

type PassportScanErrorResponse = {
  error?: string;
};

export function PassportScannerDemo({ locale }: PassportScannerDemoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [statusMessage, setStatusMessage] = useState(
    "Upload a passport image or capture one from the camera.",
  );
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);
  const [processedPreviewUrl, setProcessedPreviewUrl] = useState<string | null>(
    null,
  );
  const [ocrText, setOcrText] = useState("");
  const [candidateLines, setCandidateLines] = useState<string[]>([]);
  const [passportData, setPassportData] = useState<MrzPassportData | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    return () => {
      revokePreviewUrl(sourcePreviewUrl);
    };
  }, [sourcePreviewUrl]);

  useEffect(() => {
    return () => {
      revokePreviewUrl(processedPreviewUrl);
    };
  }, [processedPreviewUrl]);

  const passportSummary = useMemo(() => {
    if (!passportData) {
      return [];
    }

    return [
      { label: "Document number", value: passportData.documentNumber },
      {
        label: "Passenger",
        value:
          [passportData.firstName, passportData.lastName].filter(Boolean).join(" ") ||
          "Unavailable",
      },
      { label: "Issuing country", value: passportData.issuingCountry || "Unavailable" },
      { label: "Nationality", value: passportData.nationality || "Unavailable" },
      { label: "Birth date", value: passportData.birthDate ?? "Unavailable" },
      { label: "Expiry date", value: passportData.expiryDate ?? "Unavailable" },
      { label: "Sex", value: passportData.sex || "Unavailable" },
    ];
  }, [passportData]);

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setScanStatus("error");
      setStatusMessage("Camera access is not supported in this browser.");
      return;
    }

    try {
      setScanStatus("loading-camera");
      setStatusMessage("Starting the document camera.");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          height: { ideal: 1080 },
          width: { ideal: 1920 },
        },
      });

      cameraStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);
      setScanStatus("idle");
      setStatusMessage("Camera ready. Center the passport MRZ and capture.");
    } catch (error) {
      setScanStatus("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to start the camera.",
      );
    }
  }

  function stopCamera() {
    const stream = cameraStreamRef.current;

    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop();
      }
    }

    cameraStreamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  }

  function resetScanArtifacts() {
    setOcrText("");
    setCandidateLines([]);
    setPassportData(null);
  }

  async function captureFromCamera() {
    const video = videoRef.current;
    const sourceCanvas = sourceCanvasRef.current;

    if (!video || !sourceCanvas || video.videoWidth === 0 || video.videoHeight === 0) {
      setScanStatus("error");
      setStatusMessage("Camera frame is not ready yet.");
      return;
    }

    resetScanArtifacts();
    sourceCanvas.width = video.videoWidth;
    sourceCanvas.height = video.videoHeight;
    const context = sourceCanvas.getContext("2d");

    if (!context) {
      setScanStatus("error");
      setStatusMessage("Unable to create the image capture context.");
      return;
    }

    context.drawImage(video, 0, 0, sourceCanvas.width, sourceCanvas.height);
    const dataUrl = sourceCanvas.toDataURL("image/jpeg", 0.92);
    replacePreview(setSourcePreviewUrl, sourcePreviewUrl, dataUrl);

    const blob = await new Promise<Blob | null>((resolve) => {
      sourceCanvas.toBlob(resolve, "image/jpeg", 0.92);
    });

    if (!blob) {
      setScanStatus("error");
      setStatusMessage("Unable to create the captured image payload.");
      return;
    }

    await submitPassportImage(blob, "camera-capture.jpg");
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    resetScanArtifacts();
    const objectUrl = URL.createObjectURL(file);
    replacePreview(setSourcePreviewUrl, sourcePreviewUrl, objectUrl);

    try {
      await submitPassportImage(file, file.name || "passport-image");
    } finally {
      event.target.value = "";
    }
  }

  async function submitPassportImage(file: Blob, fileName: string) {
    try {
      setScanStatus("uploading");
      setStatusMessage("Uploading passport image to the scan service.");

      const formData = new FormData();
      formData.append("file", file, fileName);

      setScanStatus("running-ocr");
      setStatusMessage("Server-side passport scan is running.");

      const response = await fetch("/api/passport-scan", {
        method: "POST",
        body: formData,
        cache: "no-store",
      });

      const payload = (await response.json().catch(() => undefined)) as
        | PassportScanResponse
        | PassportScanErrorResponse
        | undefined;

      if (!response.ok) {
        const errorPayload = payload as PassportScanErrorResponse | undefined;
        throw new Error(errorPayload?.error ?? "Passport scanning failed.");
      }

      const successPayload = payload as PassportScanResponse | undefined;

      setOcrText(successPayload?.transcript ?? "");
      setCandidateLines(successPayload?.candidateLines ?? []);
      setPassportData(successPayload?.passportData ?? null);

      if (successPayload?.processedPreviewDataUrl) {
        replacePreview(
          setProcessedPreviewUrl,
          processedPreviewUrl,
          successPayload.processedPreviewDataUrl,
        );
      }

      const nextStatusMessage =
        successPayload?.statusMessage ?? "Passport scan completed.";
      setStatusMessage(nextStatusMessage);
      setScanStatus(successPayload?.passportData ? "success" : "error");
    } catch (error) {
      setScanStatus("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Passport scan failed.",
      );
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase text-teal-700">
          Passport scanner demo
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-950">
          Camera to MRZ extraction pipeline
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-700">
          This demo captures a passport image, forwards it to the OpenCV passport
          scan service, and renders the processed MRZ output, OCR transcript, and
          structured passport data for the {locale.toUpperCase()} experience.
        </p>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="grid gap-6">
          <section className="border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Capture source
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Use the rear camera for a live scan or upload an existing passport
                  image.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  Upload image
                </button>
                <button
                  className="border border-teal-700 bg-teal-700 px-4 py-2 text-sm font-medium text-white"
                  onClick={isCameraActive ? stopCamera : startCamera}
                  type="button"
                >
                  {isCameraActive ? "Stop camera" : "Start camera"}
                </button>
                <button
                  className="border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:border-slate-300 disabled:bg-slate-300"
                  disabled={!isCameraActive}
                  onClick={captureFromCamera}
                  type="button"
                >
                  Capture frame
                </button>
              </div>
            </div>

            <input
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
              type="file"
            />

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="overflow-hidden border border-slate-200 bg-slate-950">
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-sm text-slate-200">
                  <span>Live camera</span>
                  <span>{isCameraActive ? "Active" : "Idle"}</span>
                </div>
                <div className="aspect-[4/3] bg-slate-950">
                  <video
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    ref={videoRef}
                  />
                </div>
              </div>

              <div className="overflow-hidden border border-slate-200 bg-slate-50">
                <div className="border-b border-slate-200 px-4 py-3 text-sm text-slate-700">
                  Captured source image
                </div>
                <div className="flex aspect-[4/3] items-center justify-center bg-slate-100">
                  {sourcePreviewUrl ? (
                    // biome-ignore lint/performance/noImgElement: demo preview image
                    <img
                      alt="Passport source preview"
                      className="h-full w-full object-contain"
                      src={sourcePreviewUrl}
                    />
                  ) : (
                    <p className="max-w-xs text-center text-sm text-slate-500">
                      No image yet. Upload a file or capture from the camera.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Server preprocessing and OCR
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  The application proxies the image to the external OpenCV scan
                  service and displays the returned MRZ diagnostics.
                </p>
              </div>
              <StatusBadge scanStatus={scanStatus} />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="overflow-hidden border border-slate-200 bg-slate-50">
                <div className="border-b border-slate-200 px-4 py-3 text-sm text-slate-700">
                  Best processed MRZ output
                </div>
                <div className="flex aspect-[4/3] items-center justify-center bg-slate-100">
                  {processedPreviewUrl ? (
                    // biome-ignore lint/performance/noImgElement: demo preview image
                    <img
                      alt="Preprocessed passport preview"
                      className="h-full w-full object-contain"
                      src={processedPreviewUrl}
                    />
                  ) : (
                    <p className="max-w-xs text-center text-sm text-slate-500">
                      The strongest MRZ crop will appear here after scanning.
                    </p>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 bg-slate-50">
                <div className="border-b border-slate-200 px-4 py-3 text-sm text-slate-700">
                  OCR transcript
                </div>
                <div className="min-h-72 p-4">
                  <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                    {ocrText || "OCR output will appear here."}
                  </pre>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-6">
          <section className="border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Structured passport data
            </h2>
            <p className="mt-1 text-sm text-slate-600">{statusMessage}</p>

            {passportSummary.length > 0 ? (
              <dl className="mt-5 grid gap-3">
                {passportSummary.map((item) => (
                  <div
                    className="grid gap-1 border border-slate-200 bg-slate-50 p-3"
                    key={item.label}
                  >
                    <dt className="text-xs font-semibold uppercase text-slate-500">
                      {item.label}
                    </dt>
                    <dd className="text-sm font-medium text-slate-950">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <div className="mt-5 border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                No structured passport record yet.
              </div>
            )}
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">MRZ candidates</h2>
            <p className="mt-1 text-sm text-slate-600">
              Candidate lines extracted from the OCR transcript before passport
              parsing.
            </p>
            <div className="mt-4 grid gap-2">
              {candidateLines.length > 0 ? (
                candidateLines.map((line, index) => (
                  <code
                    className="block overflow-hidden border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900"
                    key={`${line}-${index}`}
                  >
                    {line}
                  </code>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No MRZ line candidates yet.
                </p>
              )}
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Validation flags</h2>
            <div className="mt-4 grid gap-3">
              <ValidationRow
                label="Document number checksum"
                valid={passportData?.documentNumberValid ?? false}
              />
              <ValidationRow
                label="Birth date checksum"
                valid={passportData?.birthDateValid ?? false}
              />
              <ValidationRow
                label="Expiry date checksum"
                valid={passportData?.expiryDateValid ?? false}
              />
              <ValidationRow
                label="Personal number checksum"
                valid={passportData?.personalNumberValid ?? false}
              />
            </div>
          </section>
        </div>
      </div>

      <canvas className="hidden" ref={sourceCanvasRef} />
    </section>
  );
}

function StatusBadge({ scanStatus }: { scanStatus: ScanStatus }) {
  const label =
    scanStatus === "idle"
      ? "Ready"
      : scanStatus === "loading-camera"
        ? "Camera"
        : scanStatus === "uploading"
          ? "Upload"
          : scanStatus === "running-ocr"
            ? "OCR"
            : scanStatus === "success"
              ? "Parsed"
              : "Error";

  const className =
    scanStatus === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : scanStatus === "error"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span className={`border px-3 py-1 text-sm font-medium ${className}`}>
      {label}
    </span>
  );
}

function ValidationRow({ label, valid }: { label: string; valid: boolean }) {
  return (
    <div className="flex items-center justify-between border border-slate-200 bg-slate-50 px-3 py-2">
      <span className="text-sm text-slate-700">{label}</span>
      <span
        className={
          valid
            ? "text-sm font-semibold text-emerald-700"
            : "text-sm font-semibold text-slate-500"
        }
      >
        {valid ? "Valid" : "Pending"}
      </span>
    </div>
  );
}

function replacePreview(
  setter: Dispatch<SetStateAction<string | null>>,
  currentValue: string | null,
  nextValue: string,
) {
  revokePreviewUrl(currentValue);
  setter(nextValue);
}

function revokePreviewUrl(value: string | null) {
  if (value?.startsWith("blob:")) {
    URL.revokeObjectURL(value);
  }
}
