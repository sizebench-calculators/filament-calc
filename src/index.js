/**
 * filament-calc: tiny, dependency-free 3D printing filament math.
 * Same formulas as https://sizebench.com/3d-printing
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
export const MATERIALS = require("./materials.json");

function density(material) {
  if (typeof material === "number") return material;
  const m = MATERIALS[material];
  if (!m) throw new Error(`Unknown material "${material}". Pass a density in g/cm³ or one of: ${Object.keys(MATERIALS).join(", ")}`);
  return m.density;
}

/** Cross-section area in mm² (= cm³ per meter of filament). */
export function crossSection(diameterMm = 1.75) {
  return Math.PI * (diameterMm / 2) ** 2;
}

/** Grams per meter of filament. */
export function gramsPerMeter(material = "PLA", diameterMm = 1.75) {
  return crossSection(diameterMm) * density(material);
}

/** Meters of filament → grams. */
export function metersToGrams(meters, material = "PLA", diameterMm = 1.75) {
  return meters * gramsPerMeter(material, diameterMm);
}

/** Grams of filament → meters. */
export function gramsToMeters(grams, material = "PLA", diameterMm = 1.75) {
  return grams / gramsPerMeter(material, diameterMm);
}

/** Meters in a spool of the given net weight (default 1 kg). */
export function metersPerSpool(material = "PLA", diameterMm = 1.75, spoolGrams = 1000) {
  return gramsToMeters(spoolGrams, material, diameterMm);
}

/**
 * Filament left on a spool from its weight on a scale.
 * @returns {{grams:number, meters:number, enough:boolean|null}}
 */
export function spoolRemaining({ grossGrams, emptySpoolGrams = 250, material = "PLA", diameterMm = 1.75, needGrams = 0, margin = 0.05 }) {
  const grams = Math.max(grossGrams - emptySpoolGrams, 0);
  return { grams, meters: gramsToMeters(grams, material, diameterMm), enough: needGrams > 0 ? grams >= needGrams * (1 + margin) : null };
}

/**
 * Cost of one print (filament + electricity + printer wear + failure allowance + extras).
 */
export function printCost({ grams, hours, pricePerKg = 20, watts = 120, pricePerKwh = 0.17, printerPrice = 400, printerLifeHours = 4000, failureRate = 0.10, extras = 0 }) {
  const filament = grams / 1000 * pricePerKg;
  const electricity = watts * hours / 1000 * pricePerKwh;
  const wear = printerLifeHours > 0 ? printerPrice / printerLifeHours * hours : 0;
  const failures = (filament + electricity + wear) * failureRate;
  const total = filament + electricity + wear + failures + extras;
  return { filament, electricity, wear, failures, extras, total, perHour: hours > 0 ? total / hours : 0 };
}

/**
 * Selling price so that marketplace fees (charged on the price) and your margin are covered.
 * price = (cost + fixedFee) / (1 − feeRate − margin)
 */
export function sellingPrice({ cost, feeRate = 0.095, fixedFee = 0.45, margin = 0.30, hours = 0 }) {
  const den = 1 - feeRate - margin;
  if (den <= 0) throw new Error("feeRate + margin must be below 1 (100%)");
  const price = (cost + fixedFee) / den;
  const fees = price * feeRate + fixedFee;
  const profit = price - cost - fees;
  return { price, fees, profit, marginPct: profit / price * 100, profitPerHour: hours > 0 ? profit / hours : null };
}
