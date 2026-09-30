import { test } from "node:test";
import assert from "node:assert/strict";
import { gramsPerMeter, metersToGrams, gramsToMeters, metersPerSpool, spoolRemaining, printCost, sellingPrice } from "../src/index.js";

const near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b}`);

test("PLA 1.75 mm weighs ~2.98 g/m and ~335 m per kg", () => {
  near(gramsPerMeter("PLA", 1.75), 2.982, 0.01);
  near(metersPerSpool("PLA"), 335.3, 0.5);
});
test("other materials per kg (1.75 mm)", () => {
  near(metersPerSpool("PETG"), 327.4, 0.5);
  near(metersPerSpool("ABS"), 399.8, 0.5);
});
test("2.85 mm PLA ≈ 126 m per kg", () => near(metersPerSpool("PLA", 2.85), 126.4, 0.5));
test("round trip", () => near(gramsToMeters(metersToGrams(100)), 100, 1e-9));
test("custom density", () => near(gramsPerMeter(1.0, 1.75), 2.405, 0.001));
test("spool remaining", () => {
  const r = spoolRemaining({ grossGrams: 480, emptySpoolGrams: 250, needGrams: 150 });
  assert.equal(r.grams, 230); near(r.meters, 77.1, 0.2); assert.equal(r.enough, true);
});
test("print cost example: 50 g, 3 h ≈ $1.50", () => {
  const c = printCost({ grams: 50, hours: 3 });
  near(c.filament, 1.00); near(c.electricity, 0.0612, 0.001); near(c.wear, 0.30); near(c.total, 1.4973, 0.001);
});
test("selling price example: $5 cost, 9.5% + $0.45, 30% margin ≈ $9.01", () => {
  const s = sellingPrice({ cost: 5 });
  near(s.price, 9.0083, 0.001); near(s.fees, 1.3058, 0.001); near(s.profit, 2.7025, 0.001);
});
test("invalid fee + margin throws", () => assert.throws(() => sellingPrice({ cost: 5, feeRate: 0.6, margin: 0.5 })));
test("unknown material throws", () => assert.throws(() => gramsPerMeter("Unobtainium")));
