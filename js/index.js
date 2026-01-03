import { getAds } from './storage.js';
import { getFavorites, toggleFavorite } from './favorites.js';
import { initTheme } from './theme.js';
import { filterAds } from './render.js';

let ads = [];
let currentCategory = null;
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
    ads = getAds();
    initTheme('theme-toggle');
    initCategories();
    initSearch();
    updateAdsDisplay();
});

function updateAdsDisplay() {
    const list = document.getElementById('ads-list');
    const count = document.getElementById('ads-count');
    const filtered = filterAds(ads, currentCategory, currentSearch);

    count.innerText = filtered.length;
    list.innerHTML = filtered.length
        ? filtered.map(ad => `
            <div class="product-card">
                <img src="${ad.images?.[0] || 'https://via.placeholder.com/300'}" onclick="window.location.href='detail.html?id=${ad.id}'">
                <div class="price">${ad.price} TJS</div>
                <div class="title">${ad.title}</div>
                <div class="category">${ad.category}</div>
                <div class="fav-icon" onclick="toggleFav(event, ${ad.id})">
                    ${getFavorites().includes(ad.id) ? '★' : '☆'}
                </div>
            </div>
        `).join('')
        : '<div class="empty-state">Ничего не найдено</div>';
}

function toggleFav(e, id) {
    e.stopPropagation();
    toggleFavorite(id);
    updateAdsDisplay();
}

function initCategories() {
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = currentCategory === btn.dataset.cat ? null : btn.dataset.cat;
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            if (currentCategory) btn.classList.add('active');
            updateAdsDisplay();
        });
    });
}

function initSearch() {
    document.getElementById('search-input').addEventListener('input', e => {
        currentSearch = e.target.value;
        updateAdsDisplay();
    });
}
