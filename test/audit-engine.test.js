import test from 'node:test';
import assert from 'node:assert/strict';

import { analyzeCard, keywordCoverage } from '../src/audit-engine.js';

const competitors = [
  { name: 'Strong Brand', score: 88, price: 1200, images: 10, rating: 4.8, reviews: 900 },
  { name: 'Budget Brand', score: 70, price: 950, images: 6, rating: 4.4, reviews: 240 }
];

test('keyword coverage rewards titles with buyer search terms', () => {
  const coverage = keywordCoverage('Термобутылка спортивная металлическая 750 мл', [
    'термобутылка',
    'спортивная бутылка',
    'металлическая бутылка'
  ]);

  assert.ok(coverage >= 65);
});

test('weak cards receive actionable recommendations', () => {
  const report = analyzeCard(
    {
      title: 'Бутылка',
      keywords: ['термобутылка', 'бутылка для спорта'],
      images: 3,
      videos: 0,
      rating: 4.1,
      reviews: 12,
      price: 1490,
      oldPrice: 1490,
      characteristics: 4,
      answeredQuestions: 0,
      hasInfographic: false,
      hasLifestylePhoto: false,
      hasSizeChart: false
    },
    competitors
  );

  assert.ok(report.total < 60);
  assert.ok(report.actions.length >= 3);
  assert.equal(report.risk, 'High risk');
});
