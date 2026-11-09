const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const normalize = (text) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const uniqueWords = (text) => new Set(normalize(text).split(' ').filter(Boolean));

export function keywordCoverage(title, keywords) {
  const titleWords = uniqueWords(title);
  if (!keywords.length) return 0;

  const covered = keywords.filter((keyword) => {
    const words = normalize(keyword).split(' ').filter(Boolean);
    return words.some((word) => titleWords.has(word));
  });

  return Math.round((covered.length / keywords.length) * 100);
}

function scoreTitle(card) {
  const lengthScore = clamp((card.title.length / 95) * 100);
  const coverage = keywordCoverage(card.title, card.keywords);
  const duplicatePenalty = card.title.length - new Set(card.title.split(' ')).size * 4 > 70 ? 12 : 0;

  return clamp(lengthScore * 0.35 + coverage * 0.65 - duplicatePenalty);
}

function scoreMedia(card) {
  const imageScore = clamp((card.images / 10) * 72);
  const videoScore = card.videos > 0 ? 14 : 0;
  const infographicScore = card.hasInfographic ? 8 : 0;
  const lifestyleScore = card.hasLifestylePhoto ? 6 : -8;

  return clamp(imageScore + videoScore + infographicScore + lifestyleScore);
}

function scoreTrust(card) {
  const reviewScore = clamp(Math.log10(card.reviews + 1) * 28);
  const ratingScore = clamp(((card.rating - 3.7) / 1.3) * 55);
  const qaScore = clamp((card.answeredQuestions / 35) * 17);

  return clamp(reviewScore + ratingScore + qaScore);
}

function scoreOffer(card, competitors) {
  const averagePrice = competitors.reduce((sum, item) => sum + item.price, 0) / competitors.length;
  const priceIndex = card.price / averagePrice;
  const discount = card.oldPrice > card.price ? ((card.oldPrice - card.price) / card.oldPrice) * 100 : 0;
  const priceScore = priceIndex <= 1 ? 48 : clamp(48 - (priceIndex - 1) * 90);
  const discountScore = clamp(discount * 1.2, 0, 28);
  const characteristicScore = clamp((card.characteristics / 16) * 24);

  return clamp(priceScore + discountScore + characteristicScore);
}

export function gradeScore(score) {
  if (score >= 85) return 'A';
  if (score >= 72) return 'B';
  if (score >= 58) return 'C';
  if (score >= 42) return 'D';
  return 'F';
}

export function riskLevel(score) {
  if (score >= 75) return 'Low risk';
  if (score >= 58) return 'Medium risk';
  return 'High risk';
}

export function buildActionPlan(card, competitors) {
  const actions = [];
  const bestCompetitor = [...competitors].sort((a, b) => b.score - a.score)[0];
  const coverage = keywordCoverage(card.title, card.keywords);

  if (coverage < 70) {
    actions.push({
      priority: 'High',
      title: 'Rewrite the title around buyer search phrases',
      detail: `Current keyword coverage is ${coverage}%. Add the strongest phrases without turning the title into spam.`
    });
  }

  if (card.images < 9) {
    actions.push({
      priority: 'High',
      title: 'Add a full visual sequence',
      detail: `Competitor ${bestCompetitor.name} uses ${bestCompetitor.images} images. Add close-up, dimensions, scenario and benefit slides.`
    });
  }

  if (!card.hasLifestylePhoto) {
    actions.push({
      priority: 'Medium',
      title: 'Show the product in real usage',
      detail: 'A lifestyle photo helps buyers understand scale, material and daily use cases faster.'
    });
  }

  if (card.videos === 0) {
    actions.push({
      priority: 'Medium',
      title: 'Record a short product video',
      detail: 'A 15-25 second video can explain the lid, size, grip and packaging better than static photos.'
    });
  }

  if (card.rating < 4.6) {
    actions.push({
      priority: 'High',
      title: 'Work through review objections',
      detail: 'Collect the most frequent complaints and answer them in the first infographic slides.'
    });
  }

  if (!card.hasSizeChart) {
    actions.push({
      priority: 'Low',
      title: 'Add a dimensions slide',
      detail: 'Show height, diameter, volume and weight. This reduces returns and support questions.'
    });
  }

  return actions.slice(0, 6);
}

export function analyzeCard(card, competitors) {
  const metrics = [
    { key: 'title', label: 'Title & SEO', value: scoreTitle(card) },
    { key: 'media', label: 'Media Pack', value: scoreMedia(card) },
    { key: 'trust', label: 'Trust Signals', value: scoreTrust(card) },
    { key: 'offer', label: 'Price & Offer', value: scoreOffer(card, competitors) }
  ];

  const total = Math.round(
    metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length
  );

  return {
    total,
    grade: gradeScore(total),
    risk: riskLevel(total),
    metrics: metrics.map((metric) => ({ ...metric, value: Math.round(metric.value) })),
    actions: buildActionPlan(card, competitors),
    keywordCoverage: keywordCoverage(card.title, card.keywords)
  };
}
