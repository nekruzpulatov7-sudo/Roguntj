/**
 * Rogun.tj - Главный скрипт отрисовки и интерфейса
 * Версия: 2.1 (Стабильная: Избранное, Поиск, Фильтры, Тема)
 */
import { getAds, getCurrentUser } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Инициализация темы
    const savedTheme = localStorage.getItem('theme');
    const themeBtn = document.getElementById('theme-toggle');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeBtn) themeBtn.textContent = "☀️";
    } else {
        if (themeBtn) themeBtn.textContent = "🌙";
    }
    
    // 2. Слушатель переключателя темы
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeBtn.textContent = isDark ? "☀️" : "🌙";
        });
    }

    // 3. Живой поиск и фильтры
    const searchInput = document.getElementById('search-input');
    const regionFilter = document.getElementById('region-filter');
    const categoryItems = document.querySelectorAll('.category-item');

    if (searchInput) {
        searchInput.addEventListener('input', () => renderAds());
    }

    if (regionFilter) {
        regionFilter.addEventListener('change', () => renderAds());
    }

    // Клик по категориям
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            renderAds();
        });
    });

    // 4. Первый запуск отрисовки
    renderAds();
});

/**
 * Основная функция отрисовки объявлений
 */
export function renderAds() {
    let ads = getAds() || [];
    const list = document.getElementById('ads-list') || document.getElementById('ads-container');
    const countLabel = document.getElementById('ads-count');

    if (!list) return;

    const searchInput = document.getElementById('search-input');
    const regionFilter = document.getElementById('region-filter');
    const activeCatItem = document.querySelector('.category-item.active');

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const region = regionFilter ? regionFilter.value : '';
    const category = activeCatItem ? activeCatItem.dataset.cat : '';

    // Логика для страницы избранного
    if (window.location.pathname.includes('favorites.html')) {
        const favIds = getFavorites();
        ads = ads.filter(ad => favIds.includes(ad.id));
    }

    // Глобальная фильтрация
    const filteredAds = ads.filter(ad => {
        const matchesSearch = ad.title.toLowerCase().includes(query);
        const matchesRegion = !region || ad.region === region;
        const matchesCategory = !category || ad.category === category;
        return matchesSearch && matchesRegion && matchesCategory;
    });

    list.innerHTML = '';

    if (filteredAds.length === 0) {
        list.innerHTML = `
            <div class="no-ads" style="grid-column: 1/-1; text-align: center; padding: 80px 20px; color: #888;">
                <div style="font-size: 50px; opacity: 0.5;">🔍</div>
                <h3 style="margin-top: 15px;">Ничего не найдено</h3>
                <p>Попробуйте изменить запрос или категорию</p>
            </div>`;
        if (countLabel) countLabel.innerText = "0";
        return;
    }

    if (countLabel) countLabel.innerText = filteredAds.length;

    // Сортировка (новые сверху) и отрисовка
    [...filteredAds].sort((a, b) => (b.id || 0) - (a.id || 0)).forEach(ad => {
        list.appendChild(createAdCard(ad));
    });
}

/**
 * Создание карточки товара (DOM-элемент)
 */
function createAdCard(ad) {
    const card = document.createElement('div');
    card.className = 'product-card';

    let paramsPreview = "";
    if (ad.params) {
        paramsPreview = Object.values(ad.params)
            .filter(val => val && val.toString().trim() !== "")
            .join(' • ');
    }

    const isFav = getFavorites().includes(ad.id);
    const imageSrc = ad.images && ad.images[0] ? ad.images[0] : 'https://via.placeholder.com/400x300?text=Нет+фото';
    const displayDate = ad.createdAt || new Date().toLocaleDateString();

    card.innerHTML = `
        <div class="fav-btn ${isFav ? 'active' : ''}" title="${isFav ? 'Удалить из избранного' : 'В избранное'}">
            <svg viewBox="0 0 24 24" fill="${isFav ? '#ff4757' : 'none'}" stroke="${isFav ? '#ff4757' : 'currentColor'}" stroke-width="2" width="20" height="20">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        </div>
        <div class="card-clickable-area" onclick="location.href='detail.html?id=${ad.id}'" style="cursor:pointer">
            <img src="${imageSrc}" alt="${ad.title}" loading="lazy">
            <div class="info">
                <div class="price">${Number(ad.price || 0).toLocaleString()} TJS</div>
                <div class="title">${ad.title}</div>
                ${paramsPreview ? `<div class="params-preview" style="font-size:12px; color:#666; margin-bottom:8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${paramsPreview}</div>` : ''}
                <div class="card-footer">
                    <span class="region-tag">📍 ${ad.region || 'Рогун'}</span>
                    <span class="date" style="font-size:11px; color:#999;">${displayDate}</span>
                </div>
            </div>
        </div>
    `;

    // Логика кнопки "Избранное"
    const favBtn = card.querySelector('.fav-btn');
    favBtn.onclick = (e) => {
        e.stopPropagation(); 
        const added = toggleFavorite(ad.id);
        favBtn.classList.toggle('active');
        const svg = favBtn.querySelector('svg');
        
        if (added) {
            svg.setAttribute('fill', '#ff4757');
            svg.setAttribute('stroke', '#ff4757');
        } else {
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            
            // Плавное удаление если мы на странице избранного
            if (window.location.pathname.includes('favorites.html')) {
                card.style.transition = '0.3s ease';
                card.style.transform = 'scale(0.8)';
                card.style.opacity = '0';
                setTimeout(() => renderAds(), 300);
            }
        }
    };

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

// Глобальная смена темы (для доступа из HTML через onclick)
window.toggleTheme = function() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = isDark ? "☀️" : "🌙";
};