# filament-calc

Tiny, **dependency-free** JavaScript library for 3D printing filament math:

- meters ↔ grams for PLA, PETG, ABS, ASA, TPU, Nylon, PC and PLA-CF (1.75 or 2.85 mm)
- filament left on a spool (weigh it on a kitchen scale)
- real cost per print (filament + electricity + printer wear + failures)
- selling price that covers marketplace fees and your margin

> Prefer a UI? Use the free online versions on **[SizeBench 3D printing calculators](https://sizebench.com/3d-printing)** (EN / PT / ES).

## Install
```bash
npm install filament-calc      # or copy src/ into your project
```

## Usage
```js
import { metersToGrams, metersPerSpool, spoolRemaining, printCost, sellingPrice } from "filament-calc";

metersToGrams(100, "PLA");            // 298.2  (grams)
metersPerSpool("PETG");               // 327.4  (meters in 1 kg, 1.75 mm)
spoolRemaining({ grossGrams: 480, emptySpoolGrams: 250, needGrams: 150 });
// { grams: 230, meters: 77.1, enough: true }

printCost({ grams: 50, hours: 3 }).total;   // 1.50  ($, with defaults below)
sellingPrice({ cost: 5 }).price;            // 9.01  (9.5% + $0.45 fees, 30% margin)
```

## Formulas
| | Formula |
|---|---|
| Grams per meter | `π × (d ÷ 2)² × density` (mm² = cm³ per meter) |
| Print cost | `(filament + electricity + wear) × (1 + failure rate) + extras` |
| Electricity | `watts × hours ÷ 1000 × price per kWh` |
| Printer wear | `printer price ÷ lifetime hours × print hours` |
| Selling price | `(cost + fixed fee) ÷ (1 − fee rate − margin)` |

Defaults (override any of them): $20/kg filament, 120 W average draw, $0.17/kWh, $400 printer, 4,000 h lifetime, 10% failures, 9.5% + $0.45 marketplace fees, 30% margin.

## Meters per 1 kg spool (1.75 mm)
| Material | Density | Meters/kg |
|---|---|---|
| PLA | 1.24 | 335 m |
| PETG | 1.27 | 327 m |
| ABS | 1.04 | 400 m |
| ASA | 1.07 | 389 m |
| TPU | 1.21 | 344 m |
| Nylon | 1.14 | 365 m |
| PC | 1.20 | 346 m |

Full chart with print temperatures: [3D printer filament chart](https://sizebench.com/3d-printer-filament-chart).

## Contributing
New materials, corrections and translations are very welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). Run tests with `npm test` (Node 18+).

## License
MIT © [SizeBench](https://sizebench.com)
