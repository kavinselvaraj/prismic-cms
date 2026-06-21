import { createHash } from "node:crypto";
import type { FlightMessages } from "./messages";

export function createLabelVersion(messages: FlightMessages) {
  return createHash("sha256")
    .update(JSON.stringify(messages))
    .digest("hex");
}
