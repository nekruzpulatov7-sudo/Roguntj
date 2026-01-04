/**
 * Rogun.tj - Главный скрипт отрисовки и интерфейса
 * Версия: 2.4 (Полная фильтрация: Категории + Транспорт + Цена)
 */
import { getAds, saveAds, getCurrentUser } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ТЕМА ---
    const savedTheme = localStorage.getItem('theme');
    const themeBtn = document.getElementById('theme-toggle');
    if (savedTheme === 'dark') document.body.classList.add('dark-mode');
    
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeBtn.textContent = isDark ? "☀️" : "🌙";
        });
    }

    // --- 2. ИНИЦИАЛИЗАЦИЯ ФИЛЬТРОВ ---
    const searchInput = document.getElementById('search-input');
    const regionFilter = document.getElementById('region-filter');
    const brandFilter = document.getElementById('brand-filter'); // Селектор Марка
    const fuelFilter = document.getElementById('fuel-filter');   // Селектор Топливо
    const priceToFilter = document.getElementById('price-to');   // Поле Цена до
    const categoryItems = document.querySelectorAll('.category-item');

    // Навешиваем обработчики на все элементы управления
    const allControls = [searchInput, regionFilter, brandFilter, fuelFilter, priceToFilter];
    allControls.forEach(control => {
        if (control) {
            // 'input' для текста и чисел, 'change' для списков
            control.addEventListener('input', () => debounceRender());
            control.addEventListener('change', () => renderAds());
        }
    });

    // Клик по категориям (рубрикам)
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('active')) {
                item.classList.remove('active');
            } else {
                categoryItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            }
            renderAds();
        });
    });

    // Запуск первой отрисовки
    renderAds();
});

let searchTimeout;
function debounceRender() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => renderAds(), 300);
}

/**
 * ГЛАВНАЯ ФУНКЦИЯ ФИЛЬТРАЦИИ И ОТРИСОВКИ
 */
export function renderAds() {
    let ads = getAds() || [];
    const list = document.getElementById('ads-list') || document.getElementById('ads-container');
    const countLabel = document.getElementById('ads-count');

    if (!list) return;

    // Читаем текущие значения фильтров
    const query = document.getElementById('search-input')?.value.toLowerCase().trim() || '';
    const region = document.getElementById('region-filter')?.value || '';
    const brand = document.getElementById('brand-filter')?.value || '';
    const fuel = document.getElementById('fuel-filter')?.value || '';
    const priceTo = parseFloat(document.getElementById('price-to')?.value) || Infinity;
    
    const activeCatItem = document.querySelector('.category-item.active');
    const category = activeCatItem ? activeCatItem.dataset.cat : '';

    // Фильтруем массив объявлений
    const filteredAds = ads.filter(ad => {
        // 1. Поиск по названию
        const matchesSearch = ad.title.toLowerCase().includes(query);
        
        // 2. Поиск по региону
        const matchesRegion = !region || ad.region === region;
        
        // 3. Поиск по категории (рубрике)
        const matchesCategory = !category || ad.category === category;
        
        // 4. Поиск по цене (Цена ДО)
        const adPrice = parseFloat(ad.price) || 0;
        const matchesPrice = adPrice <= priceTo;

        // 5. СПЕЦИФИЧЕСКИЕ ФИЛЬТРЫ (Марка и Топливо)
        // Они срабатывают только если выбрана марка/топливо в фильтре
        const matchesBrand = !brand || (ad.params && ad.params.brand === brand);
        const matchesFuel = !fuel || (ad.params && ad.params.fuel === fuel);

        return matchesSearch && matchesRegion && matchesCategory && matchesPrice && matchesBrand && matchesFuel;
    });

    // Очистка списка
    list.innerHTML = '';

    // Если ничего не нашли
    if (filteredAds.length === 0) {
        list.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; opacity: 0.5;">
                <div style="font-size: 50px;">🔍</div>
                <h3>Ничего не нашли</h3>
                <p>Попробуйте сбросить фильтры или изменить запрос</p>
            </div>`;
        if (countLabel) countLabel.innerText = "0";
        return;
    }

    if (countLabel) countLabel.innerText = filteredAds.length;

    // Сортировка (сначала новые) и отрисовка
    [...filteredAds]
        .sort((a, b) => (b.id || 0) - (a.id || 0))
        .forEach((ad, index) => {
            const card = createAdCard(ad);
            card.style.animationDelay = `${index * 0.05}s`;
            list.appendChild(card);
        });
}

/**
 * СОЗДАНИЕ КАРТОЧКИ ОБЪЯВЛЕНИЯ
 */
function createAdCard(ad) {
    const card = document.createElement('div');
    card.className = 'product-card animate-card';

    const isFav = getFavorites().includes(ad.id);
    const imageSrc = ad.images && ad.images[0] ? ad.images[0] : 'https://via.placeholder.com/400x300?text=Нет+фото';
    
    // Превью параметров (Марка • Модель • Год)
    let paramsPreview = "";
    if (ad.params) {
        paramsPreview = Object.values(ad.params)
            .filter(val => val && val.toString().trim() !== "")
            .slice(0, 3)
            .join(' • ');
    }

    card.innerHTML = `
        <div class="fav-btn ${isFav ? 'active' : ''}" data-id="${ad.id}">
            <svg viewBox="0 0 24 24" fill="${isFav ? '#ff4757' : 'rgba(0,0,0,0.2)'}" stroke="${isFav ? '#ff4757' : '#fff'}" stroke-width="2" width="22" height="22">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        </div>
        <div class="card-clickable-area" onclick="location.href='detail.html?id=${ad.id}'">
            <div class="image-container">
                <img src="${imageSrc}" alt="${ad.title}">
                <div class="region-badge">📍 ${ad.region || 'Рогун'}</div>
            </div>
            <div class="info">
                <div class="price">${Number(ad.price || 0).toLocaleString()} <span>TJS</span></div>
                <div class="title">${ad.title}</div>
                ${paramsPreview ? `<div class="params-preview">${paramsPreview}</div>` : ''}
                <div class="card-footer">
                    <span class="cat-name">${ad.category || 'Разное'}</span>
                    <span class="date">${ad.createdAt || ''}</span>
                </div>
            </div>
        </div>
    `;

    // Обработка кнопки избранного
    card.querySelector('.fav-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(ad.id);
        renderAds(); // Обновляем экран
    });

    return card;
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
}

function toggleFavorite(id) {
    let favs = getFavorites();
    const index = favs.indexOf(id);
    if (index === -1) favs.push(id);
    else favs.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(favs));
}