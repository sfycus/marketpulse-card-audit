# MarketPulse Card Audit

![Preview](docs/preview.svg)

Interactive dashboard for auditing marketplace product cards on Wildberries, Ozon and Yandex Market. The project turns seller data into a clear score, competitor comparison and prioritized action plan.

## Why it looks good in a portfolio

- Real business use case: product-card audit for marketplace sellers.
- Clean frontend architecture with separated demo data, scoring engine and UI layer.
- No heavy framework dependency: the demo runs as a static web app.
- Shows product thinking: score, risks, competitor gaps and next steps.

## Features

- Conversion score from 0 to 100.
- Checks title quality, SEO keywords, media completeness, reviews, trust signals and price position.
- Generates a prioritized improvement plan.
- Compares the selected product with competitors.
- Includes a realistic demo dataset for a marketplace seller.

## Run

```bash
npm run check
npm run dev
```

Open `http://localhost:5173`.

If Python on your machine is configured differently, any static server works:

```bash
npx serve .
```

## Project Structure

```text
src/audit-engine.js  scoring and business logic
src/demo-data.js     realistic demo dataset
src/app.js           UI rendering and interactions
src/styles.css       dashboard styling
```

## Demo Scenario

The sample card is a reusable thermal bottle. The dashboard highlights missing lifestyle media, weak keyword coverage and review risks, then produces a short task list for improving conversion.
