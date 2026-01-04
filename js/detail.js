import { getAds } from './storage.js';
import { getFavorites, toggleFavorite } from './favorites.js';

let currentAd = null;
let currentSlide = 0;
let allAds = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Инициализация темы перед рендером
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // 2. Получение ID из URL
    const params = new URLSearchParams(window.location.search);
    const adId = parseInt(params.get('id'));
    
    allAds = getAds();
    currentAd = allAds.find(a => a.id === adId);

    // 3. Проверка существования объявления
    if (!currentAd) {
        document.querySelector('.container').innerHTML = `
            <div style="text-align:center; padding:100px 20px;">
                <h1>Объявление не найдено</h1>
                <a href="index.html" class="btn" style="display:inline-block; margin-top:20px;">На главную</a>
            </div>`;
        return;
    }

    // 4. Отрисовка
    renderDetail();
    renderSimilarAds();
    updateFavButton();
});

function renderDetail() {
    // Основная информация
    document.getElementById('ad-title').innerText = currentAd.title;
    document.getElementById('ad-price').innerText = Number(currentAd.price).toLocaleString() + " TJS";
    document.getElementById('ad-description').innerText = currentAd.description || "Описание отсутствует.";
    
    // Регион и дата (если есть в объекте)
    const regionEl = document.getElementById('ad-region');
    if (regionEl) regionEl.innerText = currentAd.region || "Рогун";

    // Рендер фото
    const mainPhoto = document.getElementById('main-photo');
    if (currentAd.images && currentAd.images.length > 0) {
        mainPhoto.src = currentAd.images[0];

        const thumbContainer = document.getElementById('thumbnails');
        thumbContainer.innerHTML = currentAd.images.map((img, index) => `
            <img src="${img}" class="thumb ${index === 0 ? 'active' : ''}" onclick="setSlide(${index})">
        `).join('');
    }

    // Рендер доп. параметров
    const paramsDiv = document.getElementById('ad-params');
    if (currentAd.params && Object.keys(currentAd.params).length > 0) {
        paramsDiv.innerHTML = Object.entries(currentAd.params)
            .map(([key, val]) => val ? `<div class="param-item"><b>${key}:</b> ${val}</div>` : '')
            .join('');
    }
}

/**
 * СЛАЙДЕР
 */
window.setSlide = function(index) {
    if (!currentAd.images[index]) return;
    currentSlide = index;
    document.getElementById('main-photo').src = currentAd.images[index];
    
    const thumbs = document.querySelectorAll('.thumb');
    thumbs.forEach((t, i) => {
        t.classList.toggle('active', i === index);
    });
};

window.changeSlide = function(step) {
    let next = currentSlide + step;
    if (next >= currentAd.images.length) next = 0;
    if (next < 0) next = currentAd.images.length - 1;
    setSlide(next);
};

/**
 * КОНТАКТЫ
 */
window.revealPhone = function() {
    const btn = document.getElementById('show-phone-btn');
    const text = document.getElementById('phone-text');
    if (currentAd.phone) {
        text.innerText = currentAd.phone;
        btn.classList.add('revealed');
        btn.style.background = "#e2e8f0";
        btn.style.color = "#475569";
        btn.onclick = null;
    }
};

/**
 * ИЗБРАННОЕ
 */
window.toggleFav = function() {
    toggleFavorite(currentAd.id);
    updateFavButton();
};

function updateFavButton() {
    const favBtn = document.getElementById('fav-btn');
    if (!favBtn) return;
    
    const isFav = getFavorites().includes(currentAd.id);
    const icon = favBtn.querySelector('svg') || favBtn; // если в кнопке есть иконка
    
    if (isFav) {
        favBtn.classList.add('active');
        favBtn.style.color = "#ff4757";
        // Если используете текст вместо иконки:
        // favBtn.innerText = "❤️ В избранном";
    } else {
        favBtn.classList.remove('active');
        favBtn.style.color = "currentColor";
        // favBtn.innerText = "🤍 В избранное";
    }
}

/**
 * ПОХОЖИЕ ОБЪЯВЛЕНИЯ
 */
function renderSimilarAds() {
    const list = document.getElementById('similar-ads-list');
    const section = document.getElementById('similar-section');
    if (!list) return;

    const similar = allAds
        .filter(item => item.category === currentAd.category && item.id !== currentAd.id)
        .slice(0, 4);

    if (similar.length > 0) {
        if (section) section.style.display = 'block';
        list.innerHTML = similar.map(item => `
            <div class="similar-card" onclick="location.href='detail.html?id=${item.id}'" 
                 style="background: var(--card-bg, #fff); border-radius:15px; cursor:pointer; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
                <img src="${item.images[0]}" style="width:100%; height:140px; object-fit:cover;">
                <div style="padding:10px;">
                    <div style="color:#28a745; font-weight:800;">${Number(item.price).toLocaleString()} TJS</div>
                    <div style="font-size:13px; margin:5px 0; height:32px; overflow:hidden;">${item.title}</div>
                </div>
            </div>
        `).join('');
    } else if (section) {
        section.style.display = 'none';
    }
}