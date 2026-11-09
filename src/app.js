import { analyzeCard } from './audit-engine.js';
import { competitors, demoCard } from './demo-data.js';

const state = structuredClone(demoCard);

const fields = {
  title: document.querySelector('#titleInput'),
  keywords: document.querySelector('#keywordsInput'),
  images: document.querySelector('#imageInput'),
  videos: document.querySelector('#videoInput'),
  rating: document.querySelector('#ratingInput'),
  reviews: document.querySelector('#reviewsInput'),
  price: document.querySelector('#priceInput'),
  oldPrice: document.querySelector('#oldPriceInput')
};

function syncInputs(card) {
  fields.title.value = card.title;
  fields.keywords.value = card.keywords.join('\n');
  fields.images.value = card.images;
  fields.videos.value = card.videos;
  fields.rating.value = card.rating;
  fields.reviews.value = card.reviews;
  fields.price.value = card.price;
  fields.oldPrice.value = card.oldPrice;
}

function readInputs() {
  state.title = fields.title.value;
  state.keywords = fields.keywords.value.split('\n').map((item) => item.trim()).filter(Boolean);
  state.images = Number(fields.images.value);
  state.videos = Number(fields.videos.value);
  state.rating = Number(fields.rating.value);
  state.reviews = Number(fields.reviews.value);
  state.price = Number(fields.price.value);
  state.oldPrice = Number(fields.oldPrice.value);
}

function metricTemplate(metric) {
  const safeValue = Math.max(0, Math.min(100, metric.value));
  return `
    <article class="metric">
      <div class="metric-top">
        <span>${metric.label}</span>
        <strong>${safeValue}</strong>
      </div>
      <div class="bar"><span style="width: ${safeValue}%"></span></div>
    </article>
  `;
}

function renderCompetitors() {
  const rows = competitors
    .map(
      (competitor) => `
        <div class="row">
          <strong>${competitor.name}</strong>
          <span>${competitor.score}</span>
          <span>${competitor.price.toLocaleString('ru-RU')} ₽</span>
          <span>${competitor.images} media</span>
          <span>${competitor.rating.toFixed(1)} ★</span>
        </div>
      `
    )
    .join('');

  document.querySelector('#competitorTable').innerHTML = `
    <div class="row head">
      <span>Brand</span>
      <span>Score</span>
      <span>Price</span>
      <span>Visuals</span>
      <span>Rating</span>
    </div>
    ${rows}
  `;
}

function render() {
  readInputs();
  const report = analyzeCard(state, competitors);

  document.querySelector('#scoreValue').textContent = report.total;
  document.querySelector('#scoreGrade').textContent = `Grade ${report.grade}`;
  document.querySelector('#riskLevel').textContent = report.risk;
  document.querySelector('#metricGrid').innerHTML = report.metrics.map(metricTemplate).join('');
  document.querySelector('#actionCount').textContent = `${report.actions.length} tasks`;
  document.querySelector('#actionPlan').innerHTML = report.actions
    .map(
      (action) => `
        <li>
          <span class="priority">${action.priority}</span>
          <strong>${action.title}</strong>
          <p>${action.detail}</p>
        </li>
      `
    )
    .join('');

  renderCompetitors();
}

Object.values(fields).forEach((field) => field.addEventListener('input', render));
document.querySelector('#resetButton').addEventListener('click', () => {
  Object.assign(state, structuredClone(demoCard));
  syncInputs(state);
  render();
});

syncInputs(state);
render();
