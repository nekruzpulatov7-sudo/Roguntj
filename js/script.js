/**
 * Rogun.tj - Главный скрипт отрисовки и интерфейса
 * Версия: 2.5 (Синхронизировано с HTML-разметкой)
 */
import { getAds, getCurrentUser } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ТЕМА ---
    const savedTheme = localStorage.getItem('theme');
    const themeBtn = document.getElementById('theme-toggle');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeBtn) themeBtn.textContent = "☀️";
    }
    
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeBtn.textContent = isDark ? "☀️" : "🌙";
        });
    }

    // --- 2. ИНИЦИАЛИЗАЦИЯ ФИЛЬТРОВ (Исправлены ID под ваш HTML) ---
    const searchInput = document.getElementById('search-input');
    const regionFilter = document.getElementById('region-filter');
    const brandFilter = document.getElementById('filter-brand'); // Исправлено: filter-brand
    const fuelFilter = document.getElementById('filter-fuel');   // Исправлено: filter-fuel
    const priceToFilter = document.getElementById('price-to');
    const transportBlock = document.getElementById('transport-filters');
    const categoryItems = document.querySelectorAll('.category-item');

    // Навешиваем обработчики
    const controls = [searchInput, regionFilter, brandFilter, fuelFilter, priceToFilter];
    controls.forEach(control => {
        if (control) {
            // Используем input для мгновенной реакции на всё
            control.addEventListener('input', () => debounceRender());
        }
    });

    // Клик по категориям
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Переключение активного класса
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Показываем/скрываем блок авто-фильтров
            if (transportBlock) {
                if (item.dataset.cat === 'Транспорт') {
                    transportBlock.style.display = 'grid';
                } else {
                    transportBlock.style.display = 'none';
                    // Сбрасываем значения, если ушли из транспорта
                    if (brandFilter) brandFilter.value = "";
                    if (fuelFilter) fuelFilter.value = "";
                }
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
 * ГЛАВНАЯ ФУНКЦИЯ ФИЛЬТРАЦИИ
 */
export function renderAds() {
    const ads = getAds() || [];
    const list = document.getElementById('ads-container') || document.getElementById('ads-list');
    
    if (!list) return;

    // Считываем значения (с защитой от отсутствия элементов)
    const query = document.getElementById('search-input')?.value.toLowerCase().trim() || '';
    const region = document.getElementById('region-filter')?.value || '';
    const brand = document.getElementById('filter-brand')?.value || '';
    const fuel = document.getElementById('filter-fuel')?.value || '';
    const priceTo = parseFloat(document.getElementById('price-to')?.value) || Infinity;
    
    const activeCatItem = document.querySelector('.category-item.active');
    const category = activeCatItem ? activeCatItem.dataset.cat : '';

    const filteredAds = ads.filter(ad => {
        const matchesSearch = ad.title.toLowerCase().includes(query) || 
                             (ad.description && ad.description.toLowerCase().includes(query));
        const matchesRegion = !region || ad.region === region;
        const matchesCategory = !category || ad.category === category;
        const adPrice = parseFloat(ad.price) || 0;
        const matchesPrice = adPrice <= priceTo;

        // Фильтры для авто
        let matchesAuto = true;
        if (category === 'Транспорт') {
            const matchesBrand = !brand || (ad.params && ad.params.brand === brand);
            const matchesFuel = !fuel || (ad.params && ad.params.fuel === fuel);
            matchesAuto = matchesBrand && matchesFuel;
        }

        return matchesSearch && matchesRegion && matchesCategory && matchesPrice && matchesAuto;
    });

    list.innerHTML = '';

    if (filteredAds.length === 0) {
        list.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: gray;">
                <div style="font-size: 40px;">🔍</div>
                <p>Ничего не найдено</p>
            </div>`;
        return;
    }

    // Сортировка и рендер
    [...filteredAds]
        .sort((a, b) => (b.id || 0) - (a.id || 0))
        .forEach((ad, index) => {
            const card = createAdCard(ad);
            card.style.animationDelay = `${index * 0.05}s`;
            list.appendChild(card);
        });
}

/**
 * СОЗДАНИЕ КАРТОЧКИ
 */
function createAdCard(ad) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const isFav = getFavorites().includes(ad.id);
    const imageSrc = ad.images && ad.images[0] ? ad.images[0] : 'https://via.placeholder.com/400x300?text=Нет+фото';
    
    let paramsPreview = "";
    if (ad.params) {
        paramsPreview = Object.values(ad.params)
            .filter(val => val && val.toString().trim() !== "")
            .slice(0, 3)
            .join(' • ');
    }

    card.innerHTML = `
        <div class="fav-btn ${isFav ? 'active' : ''}" data-id="${ad.id}" style="position: absolute; right: 10px; top: 10px; z-index: 10; background: rgba(255,255,255,0.8); border-radius: 50%; padding: 5px; cursor: pointer;">
            <svg viewBox="0 0 24 24" fill="${isFav ? '#ff4757' : 'none'}" stroke="${isFav ? '#ff4757' : '#888'}" stroke-width="2" width="20" height="20">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        </div>
        <div onclick="location.href='detail.html?id=${ad.id}'">
            <img src="${imageSrc}" alt="${ad.title}" style="width:100%; height:160px; object-fit:cover;">
            <div class="info" style="padding: 12px;">
                <div class="price" style="color: #28a745; font-weight: 800; font-size: 17px;">${Number(ad.price || 0).toLocaleString()} TJS</div>
                <div class="title" style="font-size: 14px; margin: 4px 0; height: 38px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${ad.title}</div>
                <div style="font-size: 11px; color: #888;">📍 ${ad.region || 'Рогун'} ${paramsPreview ? '• ' + paramsPreview : ''}</div>
            </div>
        </div>
    `;

    card.querySelector('.fav-btn').onclick = (e) => {
        e.stopPropagation();
        toggleFavorite(ad.id);
        renderAds();
    };

    return card;
}

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