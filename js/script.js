import { getAds, getCurrentUser } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Инициализация темы (сразу при загрузке)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    // 2. Запуск отрисовки
    renderAds();
    
    // 3. Живой поиск
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderAds(e.target.value);
        });
    }
});

/**
 * Основная функция отрисовки объявлений
 */
export function renderAds(searchQuery = '') {
    let ads = getAds() || [];
    const list = document.getElementById('ads-list');
    const count = document.getElementById('ads-count');

    if (!list) return;

    // --- ЛОГИКА ДЛЯ СТРАНИЦЫ ИЗБРАННОГО ---
    // Если в URL есть "favorites.html", фильтруем только лайкнутые
    if (window.location.pathname.includes('favorites.html')) {
        const favIds = getFavorites();
        ads = ads.filter(ad => favIds.includes(ad.id));
    }

    // Фильтрация по поисковому запросу
    const filteredAds = ads.filter(ad => 
        ad.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Очистка списка перед рендером
    list.innerHTML = '';

    // Если товаров нет — выводим сообщение
    if (filteredAds.length === 0) {
        list.innerHTML = `<div class="no-ads">Ничего не найдено</div>`;
        if (count) count.innerText = "0";
        return;
    }

    if (count) count.innerText = filteredAds.length;

    // Рендерим (новые сверху)
    [...filteredAds].reverse().forEach(ad => {
        list.appendChild(createAdCard(ad));
    });
}

/**
 * Создание DOM-элемента карточки
 */
function createAdCard(ad) {
    const card = document.createElement('div');
    card.className = 'product-card';

    // Формируем строку характеристик (BMW • 2020 • Газ)
    let paramsPreview = "";
    if (ad.params) {
        paramsPreview = Object.values(ad.params)
            .filter(val => val && val.toString().trim() !== "")
            .join(' • ');
    }

    const isFav = getFavorites().includes(ad.id);

    card.innerHTML = `
        <div class="card-image" onclick="location.href='detail.html?id=${ad.id}'">
            <img src="${ad.images?.[0] || 'https://via.placeholder.com/300'}" alt="${ad.title}" loading="lazy">
        </div>
        <div class="card-content">
            <div class="price">${ad.price} TJS</div>
            <div class="title" onclick="location.href='detail.html?id=${ad.id}'">${ad.title}</div>
            ${paramsPreview ? `<div class="params-preview">${paramsPreview}</div>` : ''}
            <div class="card-footer">
                <span class="location">${ad.region || 'Таджикистан'}</span>
                <span class="date">${ad.createdAt || ''}</span>
            </div>
            <div class="fav-btn ${isFav ? 'active' : ''}" title="В избранное">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </div>
        </div>
    `;

    // Клик по сердечку
    const favBtn = card.querySelector('.fav-btn');
    favBtn.onclick = (e) => {
        e.stopPropagation(); 
        toggleFavorite(ad.id);
        
        favBtn.classList.toggle('active');
        
        // Если мы на странице избранного — плавно удаляем карточку
        if (window.location.pathname.includes('favorites.html')) {
            card.style.transform = 'scale(0.8)';
            card.style.opacity = '0';
            setTimeout(() => renderAds(), 300);
        }
    };

    return card;
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem('favorites')) || [];
    } catch (e) {
        return [];
    }
}

function toggleFavorite(id) {
    let favs = getFavorites();
    const index = favs.indexOf(id);
    
    if (index === -1) {
        favs.push(id);
    } else {
        favs.splice(index, 1);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favs));
}

// Переключение темы (глобальная функция)
window.toggleTheme = function() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
};