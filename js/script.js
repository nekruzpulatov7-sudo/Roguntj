/**
 * Rogun.tj - Главный скрипт отрисовки и интерфейса
 */
import { getAds, getCurrentUser } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Инициализация темы
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    // 2. Запуск отрисовки (автоматически определяет страницу)
    renderAds();
    
    // 3. Живой поиск (если есть поле ввода)
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
    const list = document.getElementById('ads-list') || document.getElementById('ads-container');
    const count = document.getElementById('ads-count');

    if (!list) return;

    // --- ЛОГИКА ДЛЯ СТРАНИЦЫ ИЗБРАННОГО ---
    if (window.location.pathname.includes('favorites.html')) {
        const favIds = getFavorites();
        ads = ads.filter(ad => favIds.includes(ad.id));
    }

    // --- ФИЛЬТРАЦИЯ ПО ПОИСКУ ---
    const filteredAds = ads.filter(ad => 
        ad.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Очистка списка
    list.innerHTML = '';

    // Если товаров нет
    if (filteredAds.length === 0) {
        list.innerHTML = `<div class="no-ads" style="grid-column: 1/-1; text-align: center; padding: 50px; color: #888;">
                            <h3>Ничего не найдено 🔍</h3>
                            <p>Попробуйте изменить запрос</p>
                          </div>`;
        if (count) count.innerText = "0";
        return;
    }

    if (count) count.innerText = filteredAds.length;

    // Рендерим (новые сверху - используем reverse)
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

    // Формируем строку характеристик
    let paramsPreview = "";
    if (ad.params) {
        paramsPreview = Object.values(ad.params)
            .filter(val => val && val.toString().trim() !== "")
            .join(' • ');
    }

    const isFav = getFavorites().includes(ad.id);
    const imageSrc = ad.images?.[0] || 'https://via.placeholder.com/300x200?text=Нет+фото';
    const displayDate = ad.createdAt || new Date().toLocaleDateString();

    card.innerHTML = `
        <div class="card-image" onclick="location.href='detail.html?id=${ad.id}'">
            <img src="${imageSrc}" alt="${ad.title}" loading="lazy">
        </div>
        <div class="card-content">
            <div class="price">${Number(ad.price).toLocaleString()} TJS</div>
            <div class="title" onclick="location.href='detail.html?id=${ad.id}'">${ad.title}</div>
            ${paramsPreview ? `<div class="params-preview" style="font-size:12px; color:#666; margin-bottom:8px;">${paramsPreview}</div>` : ''}
            <div class="card-footer">
                <span class="location">📍 ${ad.region || 'Рогун'}</span>
                <span class="date">${displayDate}</span>
            </div>
            <div class="fav-btn ${isFav ? 'active' : ''}" title="В избранное">
                <svg viewBox="0 0 24 24" fill="${isFav ? '#ff4757' : 'none'}" stroke="${isFav ? '#ff4757' : 'currentColor'}" stroke-width="2" width="20" height="20">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </div>
        </div>
    `;

    // Логика клика по сердечку
    const favBtn = card.querySelector('.fav-btn');
    favBtn.onclick = (e) => {
        e.stopPropagation(); 
        const active = toggleFavorite(ad.id);
        
        favBtn.classList.toggle('active');
        const svg = favBtn.querySelector('svg');
        
        if (active) {
            svg.setAttribute('fill', '#ff4757');
            svg.setAttribute('stroke', '#ff4757');
        } else {
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
        }
        
        // Если мы на странице избранного — удаляем карточку из вида
        if (window.location.pathname.includes('favorites.html')) {
            card.style.transform = 'scale(0.9)';
            card.style.opacity = '0';
            setTimeout(() => renderAds(), 300);
        }
    };

    return card;
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (FAVORITES) ---

function getFavorites() {
    try {
        const data = localStorage.getItem('favorites');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
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
        added = false;
    }
    
    localStorage.setItem('favorites', JSON.stringify(favs));
    return added;
}

// Глобальная функция смены темы
window.toggleTheme = function() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = isDark ? "☀️" : "🌙";
};