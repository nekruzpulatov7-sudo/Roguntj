/**
 * Rogun.tj - Главный скрипт отрисовки и интерфейса
 * Версия: 2.2 (Оптимизированный скин и анимации)
 */
import { getAds, saveAds, getCurrentUser } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Инициализация темы ---
    const savedTheme = localStorage.getItem('theme');
    const themeBtn = document.getElementById('theme-toggle');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeBtn) themeBtn.textContent = "☀️";
    } else {
        if (themeBtn) themeBtn.textContent = "🌙";
    }
    
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeBtn.textContent = isDark ? "☀️" : "🌙";
            
            // Анимация кнопки
            themeBtn.style.transform = 'scale(1.2) rotate(360deg)';
            setTimeout(() => themeBtn.style.transform = 'scale(1)', 300);
        });
    }

    // --- 2. Живой поиск и фильтры ---
    const searchInput = document.getElementById('search-input');
    const regionFilter = document.getElementById('region-filter');
    const categoryItems = document.querySelectorAll('.category-item');

    if (searchInput) {
        searchInput.addEventListener('input', () => debounceRender());
    }

    if (regionFilter) {
        regionFilter.addEventListener('change', () => renderAds());
    }

    // Клик по категориям
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

    // --- 3. Первый запуск ---
    renderAds();
});

// Устранение дребезга (debounce) для поиска
let searchTimeout;
function debounceRender() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => renderAds(), 300);
}

/**
 * Основная функция отрисовки объявлений
 */
export function renderAds() {
    let ads = getAds() || [];
    const list = document.getElementById('ads-list') || document.getElementById('ads-container');
    const countLabel = document.getElementById('ads-count');

    if (!list) return;

    // Сбор данных для фильтрации
    const searchInput = document.getElementById('search-input');
    const regionFilter = document.getElementById('region-filter');
    const activeCatItem = document.querySelector('.category-item.active');

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const region = regionFilter ? regionFilter.value : '';
    const category = activeCatItem ? activeCatItem.dataset.cat : '';

    // Логика для страницы избранного
    if (window.location.pathname.includes('favorites.html') || 
        (window.location.search.includes('tab=favs'))) {
        const favIds = getFavorites();
        ads = ads.filter(ad => favIds.includes(ad.id));
    }

    // Глобальная фильтрация
    const filteredAds = ads.filter(ad => {
        const matchesSearch = ad.title.toLowerCase().includes(query) || 
                              (ad.description && ad.description.toLowerCase().includes(query));
        const matchesRegion = !region || ad.region === region;
        const matchesCategory = !category || ad.category === category;
        return matchesSearch && matchesRegion && matchesCategory;
    });

    list.innerHTML = '';

    if (filteredAds.length === 0) {
        list.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <img src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png" width="80" style="opacity: 0.3; filter: grayscale(1);">
                <h3 style="margin-top: 15px; color: #888; font-weight: 600;">Ничего не найдено</h3>
                <p style="color: #aaa; font-size: 14px;">Попробуйте смягчить критерии поиска</p>
            </div>`;
        if (countLabel) countLabel.innerText = "0";
        return;
    }

    if (countLabel) countLabel.innerText = filteredAds.length;

    // Сортировка и отрисовка
    [...filteredAds].sort((a, b) => (b.id || 0) - (a.id || 0)).forEach((ad, index) => {
        const card = createAdCard(ad);
        // Небольшая задержка анимации появления для каждой карточки
        card.style.animationDelay = `${index * 0.05}s`;
        list.appendChild(card);
    });
}

/**
 * Создание DOM-элемента карточки
 */
function createAdCard(ad) {
    const card = document.createElement('div');
    card.className = 'product-card animate-card'; // Добавили класс анимации

    // Форматирование параметров
    let paramsPreview = "";
    if (ad.params) {
        paramsPreview = Object.values(ad.params)
            .filter(val => val && val.toString().trim() !== "")
            .slice(0, 3) // Берем только первые 3 параметра для красоты
            .join(' • ');
    }

    const isFav = getFavorites().includes(ad.id);
    const imageSrc = ad.images && ad.images[0] ? ad.images[0] : 'https://via.placeholder.com/400x300?text=Нет+фото';
    
    // Формат цены
    const formattedPrice = Number(ad.price || 0).toLocaleString('ru-RU');

    card.innerHTML = `
        <div class="fav-btn ${isFav ? 'active' : ''}" data-id="${ad.id}">
            <svg viewBox="0 0 24 24" fill="${isFav ? '#ff4757' : 'rgba(0,0,0,0.2)'}" stroke="${isFav ? '#ff4757' : '#fff'}" stroke-width="2" width="22" height="22">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        </div>
        <div class="card-clickable-area" onclick="location.href='detail.html?id=${ad.id}'">
            <div class="image-container" style="position:relative; height:180px; overflow:hidden;">
                <img src="${imageSrc}" alt="${ad.title}" style="width:100%; height:100%; object-fit:cover;">
                <div class="region-badge">📍 ${ad.region || 'Рогун'}</div>
            </div>
            <div class="info" style="padding:12px;">
                <div class="price" style="font-size:18px; font-weight:800; color:#28a745; margin-bottom:4px;">${formattedPrice} <span style="font-size:12px;">TJS</span></div>
                <div class="title" style="font-size:14px; font-weight:600; color:var(--text-color); height:38px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${ad.title}</div>
                
                ${paramsPreview ? `<div class="params-preview" style="font-size:11px; color:#888; margin-top:6px; background:#f8f9fa; padding:2px 6px; border-radius:4px; display:inline-block;">${paramsPreview}</div>` : ''}
                
                <div class="card-footer" style="margin-top:10px; display:flex; justify-content:space-between; align-items:center; border-top:1px solid #f0f0f0; padding-top:8px;">
                    <span style="font-size:10px; color:#bbb; text-transform:uppercase;">${ad.category || 'Общее'}</span>
                    <span class="date" style="font-size:11px; color:#999;">${ad.date || ad.createdAt || 'Сегодня'}</span>
                </div>
            </div>
        </div>
    `;

    // Логика кнопки "Избранное"
    const favBtn = card.querySelector('.fav-btn');
    favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const adId = parseInt(favBtn.dataset.id);
        const added = toggleFavorite(adId);
        
        favBtn.classList.toggle('active');
        const svg = favBtn.querySelector('svg');
        
        if (added) {
            svg.setAttribute('fill', '#ff4757');
            svg.setAttribute('stroke', '#ff4757');
            favBtn.style.transform = 'scale(1.3)';
            setTimeout(() => favBtn.style.transform = 'scale(1)', 200);
        } else {
            svg.setAttribute('fill', 'rgba(0,0,0,0.2)');
            svg.setAttribute('stroke', '#fff');
            
            // Если мы во вкладке избранного, удаляем карточку
            if (window.location.pathname.includes('favorites.html') || window.location.search.includes('tab=favs')) {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => renderAds(), 300);
            }
        }
    });

    return card;
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

function getFavorites() {
    try {
        const data = localStorage.getItem('favorites');
        return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
}

function toggleFavorite(id) {
    let favs = getFavorites();
    const index = favs.indexOf(id);
    let added = false;
    
    if (index === -1) {
        favs.push(id);
        added = true;
    } else {
        favs.splice(index, 1);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favs));
    return added;
}

// Экспорт функции смены темы для глобального доступа
window.toggleTheme = function() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = isDark ? "☀️" : "🌙";
};