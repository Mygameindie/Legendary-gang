
// ===== JSON FILES AND COLOR PALETTE =====
const jsonFiles = [

	'bottomunderwear1.json', 'bottomunderwear2.json', 'bottomunderwear3.json', 'bottomunderwear4.json',
	'topunderwear1.json', 'topunderwear2.json', 'topunderwear3.json', 'topunderwear4.json',
	'onepiece1.json', 'onepiece3.json', 'onepiece4.json',
	'socks1.json', 'socks2.json', 'socks3.json', 'socks4.json',
	'boxers1.json', 'boxers2.json', 'boxers3.json', 'boxers4.json',
	'sweatshirt1.json', 'sweatshirt2.json', 'sweatshirt3.json', 'sweatshirt4.json', 'bodysuit2.json',
	'shoes1.json', 'shoes2.json', 'shoes3.json', 'shoes4.json',
	'pants1.json', 'pants2.json', 'pants3.json', 'pants4.json',
	'skirt1.json', 'skirt2.json', 'skirt3.json', 'skirt4.json',
	'top1.json', 'top2.json', 'top3.json', 'top4.json',
	'dress1.json', 'dress2.json', 'dress3.json', 'dress4.json',
	'jacket1.json', 'jacket2.json', 'jacket3.json', 'jacket4.json',
	'dress1w.json', 'dress2w.json', 'dress3w.json', 'dress4w.json',
	'skirt1w.json', 'skirt2w.json', 'skirt3w.json', 'skirt4w.json',
	'accessories1.json', 'accessories2.json', 'accessories3.json', 'accessories4.json',
	'hat1.json', 'hat2.json', 'hat3.json', 'hat4.json', 'glove1.json', 'scarf4.json', 'leaf1.json'


];

const colorPalette = [
	{ name: 'Original', value: 'none' },
	{ name: 'Red', value: 'hue-rotate(0deg)' },
	{ name: 'Blue', value: 'hue-rotate(240deg)' },
	{ name: 'Green', value: 'hue-rotate(120deg)' },
	{ name: 'Purple', value: 'hue-rotate(270deg)' },
	{ name: 'Orange', value: 'hue-rotate(30deg)' },
	{ name: 'Pink', value: 'hue-rotate(320deg)' },
	{ name: 'Yellow', value: 'hue-rotate(60deg)' },
	{ name: 'Cyan', value: 'hue-rotate(180deg)' }
];

let currentlySelectedItem = null;

// ===== HELPERS =====
function getZIndex(categoryName) {
	const zIndexMap = {
		bottomunderwear: 3,
		topunderwear: 4,
		onepiece: 5,
		socks: 5,
		boxer: 6,
		sweatshirt: 7,
		shoe: 8,
		pants: 9,
		skirt: 10,
		top: 11,
		dress: 12,
		jacket: 13,
		accessories: 14,
		hat: 15,
		top3: 11,
		pants3: 9,
		skirt3: 10,
		shoes3: 8,
		jacket3: 13
	};
	return zIndexMap[categoryName] || 0;
}

async function loadItemFile(file) {
	try {
		const response = await fetch(file);
		if (!response.ok) throw new Error(`Error loading file: ${file}`);
		return await response.json();
	} catch (error) {
		console.error(`Failed to load ${file}:`, error);
		return [];
	}
}
// === LAZY LOADING FUNCTIONS ===

// Load only the default preset items on start
async function loadInitialItems() {
	await loadCategoryItemsForPreset("default");
}

// Load all items in a given preset's categories
async function loadCategoryItemsForPreset(presetName) {
	const items = presets[presetName];
	if (!items) return;
	for (const { category } of items) {
		await loadCategory(category);
	}
}

async function loadCategory(categoryName) {
	if (document.querySelector(`.${categoryName}`)) return;

	isLoadingCategory = true;
	const messageEl = document.getElementById("loading-message");
	if (messageEl) messageEl.textContent = `Loading ${categoryName}...`;

	startCountdown(10); // Start countdown for category load

	const start = performance.now();

	const file = `${categoryName}.json`;
	const data = await loadItemFile(file);
	const baseContainer = document.querySelector('.base-container');

	const batchSize = 8;
	for (let i = 0; i < data.length; i += batchSize) {
		const batch = data.slice(i, i + batchSize);
		await Promise.all(batch.map(async item => {
			const itemId = item.id.endsWith('.png') ? item.id : `${item.id}.png`;
			const img = document.createElement('img');
			img.id = itemId;
			img.src = item.src;
			img.alt = item.alt;
			img.classList.add(categoryName);
			img.style.visibility = item.visibility || "hidden";
			img.style.position = 'absolute';
			img.style.zIndex = getZIndex(categoryName);
			baseContainer.appendChild(img);
		}));
		await new Promise(resolve => setTimeout(resolve, 100));
	}

	// Ensure at least 10 seconds
	const elapsed = performance.now() - start;
	if (elapsed < 10000) {
		await new Promise(resolve => setTimeout(resolve, 10000 - elapsed));
	}

	logLoadTime(`Category "${categoryName}"`, start);
	isLoadingCategory = false;
}



function hideSpecificCategories(categories) {
	// Collect all items in one pass instead of per category
	const allItems = [];
	categories.forEach(category => {
		allItems.push(...document.querySelectorAll(`.${category}`));
	});

	// Hide them all in a single loop
	allItems.forEach(item => {
		if (item.style.visibility !== 'hidden') {
			item.style.visibility = 'hidden';
		}
	});
}

let toggleCooldown = false;

function toggleVisibility(itemId, categoryName) {
	if (toggleCooldown) return;
	toggleCooldown = true;

	// Hide all other items in this category
	const categoryItems = document.querySelectorAll(`.${categoryName}`);
	let selectedItem = null;

	categoryItems.forEach(item => {
		if (item.id === itemId) {
			selectedItem = item;
		} else if (item.style.visibility !== 'hidden') {
			item.style.visibility = 'hidden';
		}
	});

	if (!selectedItem) {
		toggleCooldown = false;
		return;
	}

	// Toggle selected item
	selectedItem.style.visibility =
		selectedItem.style.visibility === 'visible' ? 'hidden' : 'visible';

	// Small cooldown to avoid rapid clicks causing crashes
	setTimeout(() => {
		toggleCooldown = false;
	}, 20); // Adjust delay as needed


	// Handle special category conflicts
	if (selectedItem.style.visibility === 'visible') {
		if (categoryName === 'onepiece1') {
			hideSpecificCategories(['topunderwear1', 'bottomunderwear1']);
		} else if (categoryName === 'dress1') {
			hideSpecificCategories(['top1', 'pants1', 'skirt1', 'sweatshirt1']);
		} else if (categoryName === 'dress2') {
			hideSpecificCategories(['top2', 'pants2', 'skirt2', 'sweatshirt2']);
		} else if (categoryName === 'dress3') {
			hideSpecificCategories(['top3', 'pants3', 'skirt3', 'sweatshirt3']);
		} else if (categoryName === 'dress4') {
			hideSpecificCategories(['top4', 'pants4', 'skirt4', 'sweatshirt4']);
		} else if (
			categoryName.startsWith('top1') || categoryName.startsWith('pants1') ||
			categoryName.startsWith('skirt1') || categoryName.startsWith('sweatshirt1')
		) {
			hideSpecificCategories(['dress1']);
		} else if (
			categoryName.startsWith('top2') || categoryName.startsWith('pants2') ||
			categoryName.startsWith('skirt2') || categoryName.startsWith('sweatshirt2')
		) {
			hideSpecificCategories(['dress2']);
		} else if (
			categoryName.startsWith('top3') || categoryName.startsWith('pants3') ||
			categoryName.startsWith('skirt3') || categoryName.startsWith('sweatshirt3')
		) {
			hideSpecificCategories(['dress3']);
		} else if (
			categoryName.startsWith('top4') || categoryName.startsWith('pants4') ||
			categoryName.startsWith('skirt4') || categoryName.startsWith('sweatshirt4')
		) {
			hideSpecificCategories(['dress4']);
		} else if (categoryName === 'topunderwear1' || categoryName === 'bottomunderwear1') {
			hideSpecificCategories(['onepiece1']);
		}
	}
}
// ===== EXACT NAMED-COLOR RECOLOR (per-pixel, preserves alpha) =====
const NAMED_HUES = {
  Original: null,
  Red: 0, Orange: 30, Yellow: 60, Green: 120,
  Cyan: 180, Blue: 240, Purple: 270, Pink: 320
};

const _recolorCache = new Map(); // key: itemId|ColorName -> dataURL

function _rgbToHsl(r,g,b){
  r/=255; g/=255; b/=255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max+min)/2;
  if (max === min) { h = 0; s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d/(2 - max - min) : d/(max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h*360, s, l];
}

function _hslToRgb(h,s,l){
  h/=360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = t => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const r = Math.round(hue2rgb(h + 1/3) * 255);
  const g = Math.round(hue2rgb(h) * 255);
  const b = Math.round(hue2rgb(h - 1/3) * 255);
  return [r,g,b];
}

// Store original src once (so "Original" restores it)
function _ensureOriginalSrc(img){
  if (!img.dataset.originalSrc) {
    img.dataset.originalSrc = img.src || img.dataset.src || '';
  }
}

// Main API: set item to named color (true recolor)
async function setItemNamedColor(itemId, colorName){
  const el = document.getElementById(itemId);
  if (!el) return;

  // Restore original
  if (!colorName || colorName === 'Original' || NAMED_HUES[colorName] == null) {
    _ensureOriginalSrc(el);
    const orig = el.dataset.originalSrc;
    if (orig) el.src = orig;
    el.style.filter = ''; // clear any old filters
    return;
  }

  // Make sure the bitmap is loaded and CORS-safe for canvas
  if (!el.src && el.dataset && el.dataset.src) el.src = el.dataset.src;
  if (!el.crossOrigin) el.crossOrigin = 'anonymous';

  await new Promise(res => {
    if (el.complete && el.naturalWidth) res();
    else el.onload = () => res();
  });

  const targetHue = NAMED_HUES[colorName];
  const cacheKey = `${itemId}|${colorName}`;
  if (_recolorCache.has(cacheKey)) {
    el.src = _recolorCache.get(cacheKey);
    el.style.filter = '';
    return;
  }

  _ensureOriginalSrc(el);

  // Draw and recolor pixels
  const w = el.naturalWidth, h = el.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  try {
    ctx.drawImage(el, 0, 0, w, h);
  } catch (e) {
    // CORS-tainted fallback: use hue-rotate as last resort
    el.style.filter = `hue-rotate(${targetHue}deg) saturate(1.1)`;
    return;
  }

  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const a = d[i+3];
    if (a === 0) continue; // keep transparent pixels
    const r = d[i], g = d[i+1], b = d[i+2];

    // skip greys very near black/white to avoid nasty tints
    const [hue, sat, light] = _rgbToHsl(r,g,b);
    if (light < 0.03 || light > 0.97) continue;

    // keep S/L, only set hue to target
    const [nr, ng, nb] = _hslToRgb(targetHue, sat, light);
    d[i] = nr; d[i+1] = ng; d[i+2] = nb;
  }

  ctx.putImageData(imgData, 0, 0);
  const url = canvas.toDataURL('image/png');
  _recolorCache.set(cacheKey, url);
  el.src = url;
  el.style.filter = '';
}
/* === Color Swatch Fixups (append only) === */
(() => {
  // 1) Bridge: some code reads window.currentlySelectedItem but it's declared with `let`.
  try {
    if (!('currentlySelectedItem' in window)) {
      Object.defineProperty(window, 'currentlySelectedItem', {
        get(){ try { return typeof currentlySelectedItem !== 'undefined' ? currentlySelectedItem : null; } catch(e){ return null; } },
        set(v){ try { currentlySelectedItem = v; } catch(e) { /* no-op */ } }
      });
    }
  } catch (e) { /* ignore */ }

  // 2) Idempotent, safe createColorPicker (in case a later stub overwrote the real one)
  function buildPickerOnce() {
    if (document.querySelector('.color-picker-container')) return; // already built

    const container = document.createElement('div');
    container.className = 'color-picker-container';
    container.style.display = 'none';

    const title = document.createElement('h4');
    title.textContent = 'Choose Color:';
    container.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'color-grid';

    // Use your existing palette so the swatch-upgrade can convert them to circles
    (window.colorPalette || []).forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'color-button';
      btn.textContent = c.name;
      // keep old behavior for fallback (CSS filter)
      btn.onclick = () => window.applyColorToItem?.(c.value);
      grid.appendChild(btn);
    });

    container.appendChild(grid);

    const close = document.createElement('button');
    close.className = 'close-color-picker';
    close.textContent = 'Close';
    close.onclick = () => window.hideColorPicker?.();
    container.appendChild(close);

    (document.querySelector('.controls') || document.body).appendChild(container);
  }

  // Replace/restore global createColorPicker to the safe one (append-only override).
  window.createColorPicker = function() { buildPickerOnce(); };

  // Build immediately if not present (covers the case where a stub ran earlier)
  buildPickerOnce();
})();
// --- SAFE COLOR PICKER (null-safe + calls setItemNamedColor) ---
function createColorPicker() {
  // idempotent: only create once
  if (document.querySelector('.color-picker-container')) return;

  const container = document.createElement('div');
  container.classList.add('color-picker-container');
  container.style.display = 'none';

  const title = document.createElement('h4');
  title.textContent = 'Choose Color:';
  container.appendChild(title);

  const grid = document.createElement('div');
  grid.classList.add('color-grid');
  colorPalette.forEach(color => {
    const btn = document.createElement('button');
    btn.classList.add('color-button');
    btn.textContent = color.name;
    btn.onclick = () => {
      if (!currentlySelectedItem) return;
      setItemNamedColor(currentlySelectedItem, color.name);
      hideColorPicker();
    };
    grid.appendChild(btn);
  });
  container.appendChild(grid);

  const close = document.createElement('button');
  close.textContent = 'Close';
  close.classList.add('close-color-picker');
  close.onclick = hideColorPicker;
  container.appendChild(close);

  const host = document.querySelector('.controls') || document.body;
  host.appendChild(container);
}

function ensureColorPicker() {
  if (!document.querySelector('.color-picker-container')) createColorPicker();
}

function showColorPicker(itemId) {
  currentlySelectedItem = itemId;
  ensureColorPicker();
  const el = document.querySelector('.color-picker-container');
  if (el) el.style.display = 'block';
}

function hideColorPicker() {
  const el = document.querySelector('.color-picker-container');
  if (el) el.style.display = 'none';
  currentlySelectedItem = null;
}

// Make sure it exists early (prevents null.style errors)
document.addEventListener('DOMContentLoaded', ensureColorPicker);

// ===== COLOR PICKER =====
function createColorPicker() {
	const container = document.createElement('div');
	container.classList.add('color-picker-container');
	container.style.display = 'none';

	const title = document.createElement('h4');
	title.textContent = 'Choose Color:';
	container.appendChild(title);

	const grid = document.createElement('div');
	grid.classList.add('color-grid');
	colorPalette.forEach(color => {
		const btn = document.createElement('button');
		btn.classList.add('color-button');
		btn.textContent = color.name;
		btn.onclick = () => applyColorToItem(color.value);
		grid.appendChild(btn);
	});
	container.appendChild(grid);

	const close = document.createElement('button');
	close.textContent = 'Close';
	close.classList.add('close-color-picker');
	close.onclick = hideColorPicker;
	container.appendChild(close);

	document.querySelector('.controls').appendChild(container);
}

function showColorPicker(itemId) {
	currentlySelectedItem = itemId;
	document.querySelector('.color-picker-container').style.display = 'block';
}

function hideColorPicker() {
	document.querySelector('.color-picker-container').style.display = 'none';
	currentlySelectedItem = null;
}

function applyColorToItem(filterValue) {
	if (!currentlySelectedItem) return;
	const item = document.getElementById(currentlySelectedItem);
	item.style.filter = (filterValue === 'none') ? '' : filterValue;
	hideColorPicker();
}

// ===== LOAD ITEMS =====
// Load items in batches to reduce load time and improve responsiveness

async function loadItemsInBatches(batchSize = 50, delay = 1) {
	const baseContainer = document.querySelector('.base-container');
	const controlsContainer = document.querySelector('.controls');

	// Create color picker first
	createColorPicker();

	for (let i = 0; i < jsonFiles.length; i += batchSize) {
		const batch = jsonFiles.slice(i, i + batchSize);

		await Promise.all(batch.map(async file => {
			const data = await loadItemFile(file);
			const categoryName = file.replace('.json', '');
			const categoryContainer = document.createElement('div');
			categoryContainer.classList.add('category');

			const categoryHeading = document.createElement('h3');
			categoryHeading.textContent = categoryName;
			categoryContainer.appendChild(categoryHeading);

			data.forEach(item => {
				const itemId = item.id.endsWith('.png') ? item.id : `${item.id}.png`;

				const img = document.createElement('img');
				img.id = itemId;
				img.src = item.src;
				img.alt = item.alt;
				img.classList.add(categoryName);
				img.setAttribute('data-file', file);
				img.style.visibility = item.visibility === "visible" ? "visible" : "hidden";
				img.style.position = 'absolute';
				img.style.zIndex = getZIndex(categoryName);
				baseContainer.appendChild(img);

				// Create container for buttons
				const buttonContainer = document.createElement('div');
				buttonContainer.classList.add('button-container');

				// Create a wrapper to stack buttons vertically
				const buttonWrap = document.createElement('div');
				buttonWrap.classList.add('button-wrap');

				// Main item button
				const button = document.createElement('img');
				const buttonFile = item.src.replace('.png', 'b.png');
				button.src = buttonFile;
				button.alt = item.alt + ' Button';
				button.classList.add('item-button');
				button.onclick = () => toggleVisibility(itemId, categoryName);
				buttonWrap.appendChild(button);

				// Color change button
				const colorButton = document.createElement('button');
				colorButton.textContent = '🎨';
				colorButton.classList.add('color-change-button');
				colorButton.onclick = (e) => {
					e.stopPropagation();
					const targetItem = document.getElementById(itemId);
					if (targetItem.style.visibility === 'hidden') {
						toggleVisibility(itemId, categoryName);
					}
					showColorPicker(itemId);
				};
				buttonWrap.appendChild(colorButton);

				// Add stacked buttonWrap to container
				buttonContainer.appendChild(buttonWrap);
				categoryContainer.appendChild(buttonContainer);
			});

			//controlsContainer.appendChild(categoryContainer);
		}));

		await new Promise(resolve => setTimeout(resolve, 50));
	}
}

// ===== LAYOUT AND GAME =====
function adjustCanvasLayout() {
	const base = document.querySelector('.base-container');
	const controls = document.querySelector('.controls');
	const isMobile = window.innerWidth <= 600;
	base.classList.toggle('mobile-layout', isMobile);
	base.classList.toggle('desktop-layout', !isMobile);
	controls.classList.toggle('mobile-controls', isMobile);
	controls.classList.toggle('desktop-controls', !isMobile);
}

function enterGame() {
	document.querySelector('.main-menu').style.display = 'none';
	document.querySelector('.game-container').style.display = 'block';

	const audio = document.getElementById("backgroundMusic");
	const musicBtn = document.getElementById("musicToggleButton");

	if (audio && musicBtn && audio.paused) {
		musicBtn.click(); // simulate the user clicking the Music On button
	}
}

function blurButton(event) {
	event.preventDefault();
	event.target.blur();
}

function handleButtonPressRelease(buttonClass, imageId) {
	const button = document.querySelector(buttonClass);
	if (button) {
		const press = e => {
			blurButton(e);
			document.getElementById(imageId).style.display = 'block';
		};
		const release = e => {
			blurButton(e);
			document.getElementById(imageId).style.display = 'none';
		};
		button.addEventListener('mousedown', press);
		button.addEventListener('mouseup', release);
		button.addEventListener('touchstart', press, { passive: false });
		button.addEventListener('touchend', release, { passive: false });
	}
}

document.addEventListener('DOMContentLoaded', () => {
	handleButtonPressRelease('.button-1', 'base2-image');
	handleButtonPressRelease('.button-2', 'base3-image');
	handleButtonPressRelease('.button-3', 'base4-image');
	handleButtonPressRelease('.button-4', 'base5-image');
});

window.onload = () => {
	loadItemsInBatches();
	adjustCanvasLayout();

	const loadingScreen = document.getElementById('loading-screen');
	if (loadingScreen) {
		loadingScreen.style.display = 'none';
	}
};

window.addEventListener('resize', adjustCanvasLayout);



function createColorPicker() {
	// Truncated for brevity
}





// ===== LOAD ITEMS (OPTIMIZED) =====

window.addEventListener('load', () => {
	loadCategoryItemsForPreset("default").then(() => {
		adjustCanvasLayout();
		console.log("✅ Default items loaded, waiting for Start...");
	});

	const startBtn = document.getElementById("startButton");
	if (startBtn) {
		startBtn.addEventListener("click", () => {
			console.log("🚀 Starting full game load...");
			initializeGameSafe();
		});
	}
});

function applyWindEffect() {
	for (let i = 1; i <= 10; i++) {
		for (let v = 1; v <= 4; v++) {
			const skirtNormal = document.getElementById(`skirt${v}_${i}.png`);
			const skirtWind = document.getElementById(`skirt${v}_${i}w.png`);
			const dressNormal = document.getElementById(`dress${v}_${i}.png`);
			const dressWind = document.getElementById(`dress${v}_${i}w.png`);

			if (skirtNormal && skirtWind && skirtNormal.style.visibility === 'visible') {
				skirtNormal.style.visibility = 'hidden';
				skirtWind.style.visibility = 'visible';
			}
			if (dressNormal && dressWind && dressNormal.style.visibility === 'visible') {
				dressNormal.style.visibility = 'hidden';
				dressWind.style.visibility = 'visible';
			}
		}
	}
}

function removeWindEffect() {
	for (let i = 1; i <= 10; i++) {
		for (let v = 1; v <= 4; v++) {
			const skirtNormal = document.getElementById(`skirt${v}_${i}.png`);
			const skirtWind = document.getElementById(`skirt${v}_${i}w.png`);
			const dressNormal = document.getElementById(`dress${v}_${i}.png`);
			const dressWind = document.getElementById(`dress${v}_${i}w.png`);

			if (skirtWind && skirtNormal && skirtWind.style.visibility === 'visible') {
				skirtWind.style.visibility = 'hidden';
				skirtNormal.style.visibility = 'visible';
			}
			if (dressWind && dressNormal && dressWind.style.visibility === 'visible') {
				dressWind.style.visibility = 'hidden';
				dressNormal.style.visibility = 'visible';
			}
		}
	}
}
document.addEventListener("DOMContentLoaded", () => {
	const windButton = document.getElementById("wind-button");

	if (windButton) {
		windButton.addEventListener("mousedown", applyWindEffect);
		windButton.addEventListener("mouseup", removeWindEffect);
		windButton.addEventListener("mouseleave", removeWindEffect);
		windButton.addEventListener("touchstart", e => {
			e.preventDefault();
			applyWindEffect();
		}, { passive: false });
		windButton.addEventListener("touchend", e => {
			e.preventDefault();
			removeWindEffect();
		}, { passive: false });
	}
});



const MAX_VISIBLE_ITEMS = 6;
const PRELOAD_BUFFER = 4;
let allItemsData = [];
let visibleStartIndex = 0;
let initialRenderDone = false;

function initVirtualizedItems(files) {
	allItemsData = files.map(file => ({ file, element: null }));
	visibleStartIndex = 0;
	slowRenderVisibleItems(); // First render: extra slow
}

async function slowRenderVisibleItems() {
	const container = document.getElementById("item-container");
	if (!container) return;

	const endIndex = Math.min(visibleStartIndex + MAX_VISIBLE_ITEMS, allItemsData.length);

	for (let i = visibleStartIndex; i < endIndex; i++) {
		await renderSingleItem(i, container);
		await new Promise(res => setTimeout(res, 100)); // Slow delay
	}

	// Once slow load finishes, allow full rendering
	initialRenderDone = true;
	renderVisibleItems();
}

async function renderVisibleItems() {
	if (!initialRenderDone) return; // Skip if first render still running

	const container = document.getElementById("item-container");
	if (!container) return;

	const endIndex = Math.min(visibleStartIndex + MAX_VISIBLE_ITEMS + PRELOAD_BUFFER, allItemsData.length);

	// Remove off-screen items
Array.from(container.children).forEach(el => {
    const index = parseInt(el.dataset.index, 10);
    if (index < visibleStartIndex - PRELOAD_BUFFER || index >= endIndex) {
        el.src = "";
        el.removeAttribute("src");
        el.remove();
        if (allItemsData[index]) allItemsData[index].element = null;
    }
});

	// Load and append visible items with delay
	for (let i = visibleStartIndex; i < endIndex; i++) {
		if (!allItemsData[i].element) {
			await renderSingleItem(i, container);
			await new Promise(res => setTimeout(res, 50)); // Small delay
		}
	}
}

async function renderSingleItem(i, container) {
	const itemData = allItemsData[i];
	const itemEl = document.createElement("img");
	itemEl.dataset.index = i;
	itemEl.loading = "lazy";
	itemEl.alt = itemData.file;
	itemEl.style.opacity = 0;
	itemEl.style.transition = "opacity 0.3s ease-in-out";
	itemData.element = itemEl;

	try {
		const data = await loadItemFile(itemData.file);
		itemEl.src = data.image || data;
		requestAnimationFrame(() => {
			itemEl.style.opacity = 1;
		});
	} catch (err) {
		console.error("Load failed:", err);
	}

	container.appendChild(itemEl);
}

let scrollTimeout = null;

function handleVirtualScroll() {
	if (scrollTimeout) return;
	scrollTimeout = setTimeout(() => {
		const scrollPos = window.scrollY;
		const itemHeight = 150;
		const itemsPerRow = Math.floor(window.innerWidth / 150);
		const newStartIndex = Math.max(0, Math.floor(scrollPos / itemHeight) * itemsPerRow);

		if (Math.abs(newStartIndex - visibleStartIndex) >= itemsPerRow) {
			visibleStartIndex = newStartIndex;
			renderVisibleItems();
		}
		scrollTimeout = null;
	}, 50);
}

