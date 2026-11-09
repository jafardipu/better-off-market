import { FieldErrors } from "react-hook-form";
import { ZodError } from "zod";

function firstErrorMessage(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;

  if (
    "message" in value &&
    typeof (value as { message?: unknown }).message === "string"
  ) {
    return (value as { message: string }).message;
  }

  for (const nested of Object.values(value as Record<string, unknown>)) {
    const message = firstErrorMessage(nested);
    if (message) return message;
  }

  return undefined;
}

/** Accepts RHF FieldErrors or a ZodError-like object and returns the first message. */
export const zodFormErrorModification = (
  err: ZodError | FieldErrors | Record<string, unknown>,
) => {
  return firstErrorMessage(err) || "Please recheck the form completion.";
};