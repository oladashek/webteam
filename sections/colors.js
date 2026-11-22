import { PALETTES } from '../state.js';

/** Контраст по WCAG для двух непрозрачных HEX-цветов. */
function luminance(hex) {
  const channels = hex.replace('#', '').match(/.{2}/g).map(c => parseInt(c, 16) / 255);
  const linear = channels.map(x => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}
function contrast(first, second) {
  const a = luminance(first), b = luminance(second);
  return ((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2);
}

/** Участник №2: цвета. TODO: правила сочетаний, forbidden use, downloadable tokens. */
export function mountColors(root, store) {
  root.innerHTML = `
    <div class="color-layout">
      <fieldset class="palette-list">
        <legend class="eyebrow">SELECT COLOR SYSTEM</legend>
        ${Object.values(PALETTES).map(palette => `
          <label class="palette-item" data-palette-card="${palette.id}">
            <input type="radio" name="palette" value="${palette.id}" />
            <span class="palette-content">
              <strong>${palette.name}</strong><small>${palette.caption}</small>
              <span class="palette-strip" aria-hidden="true">
                <i style="background:${palette.background}"></i>
                <i style="background:${palette.text}"></i>
                <i style="background:${palette.accent}"></i>
              </span>
            </span>
            <span class="palette-arrow" aria-hidden="true">↗</span>
          </label>`).join('')}
      </fieldset>
      <div class="color-poster">
        <span class="eyebrow">LIVE PREVIEW / BRAND COLORS</span>
        <div class="color-poster-big">THIS<br />IS NOT<br /><em>A BUG.</em></div>
        <span class="color-poster-stamp">ERR_404 ©</span>
      </div>
    </div>
    <div class="swatch-grid" aria-label="Текущие фирменные цвета">
      <div class="swatch"><div class="swatch-color" data-swatch="background"></div><span>ФОН</span><code data-hex="background"></code></div>
      <div class="swatch"><div class="swatch-color" data-swatch="text"></div><span>ТЕКСТ</span><code data-hex="text"></code></div>
      <div class="swatch"><div class="swatch-color" data-swatch="accent"></div><span>АКЦЕНТ</span><code data-hex="accent"></code></div>
    </div>
    <div class="contrast-note" id="contrast-note" aria-live="polite"></div>`;

  root.querySelectorAll('input[name="palette"]').forEach(radio => {
    radio.addEventListener('change', () => store.update({ paletteId: radio.value }));
  });

  store.subscribe(state => {
    const palette = PALETTES[state.paletteId];
    root.querySelectorAll('input[name="palette"]').forEach(input => {
      input.checked = input.value === state.paletteId;
      input.closest('.palette-item').classList.toggle('is-selected', input.checked);
    });
    for (const key of ['background', 'text', 'accent']) {
      root.querySelector(`[data-swatch="${key}"]`).style.background = palette[key];
      root.querySelector(`[data-hex="${key}"]`).textContent = palette[key];
    }
    const textRatio = contrast(palette.background, palette.text);
    const buttonRatio = contrast(palette.accent, palette.accentText);
    root.querySelector('#contrast-note').textContent =
      `WCAG: основной текст ${textRatio}:1 · текст на акцентной кнопке ${buttonRatio}:1. Цель для обычного текста — от 4.5:1.`;
  });
}
