import type { KeyboardEvent } from "react";

/**
 * onKeyDown for whole-number inputs: blocks every typed character that isn't
 * a digit ("." "-" "e" "+" …). Editing keys and shortcuts still work.
 */
export function blockNonDigitKeys(e: KeyboardEvent<HTMLInputElement>) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key.length === 1 && !/^[0-9]$/.test(e.key)) e.preventDefault();
}

/**
 * Keeps only the whole-number part of typed or pasted text, so "$1,500.75"
 * becomes "1500" rather than "150075".
 */
export function toWholeNumberText(value: string) {
  return value.split(".")[0].replace(/\D/g, "");
}
