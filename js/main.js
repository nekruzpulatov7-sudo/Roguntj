import { getAds, getCurrentUser } from './storage.js';

const adsContainer = document.getElementById('ads-container');
const searchInput = document.getElementById('search-input');
const regionFilter = document.getElementById('region-filter');
const categoryFilter = document.getElementById('category-filter');
const userMenu = document.getElementById('user-menu');

// 1. Отображение меню пользователя (Войти или Профиль)
function renderUserMenu() {
    const user = getCurrentUser();
    if (user) {
        userMenu.innerHTML = `
            <a href="profile.html" class="nav-link">Мои объявления</a>
            <span class="user-name">| ${user.email.split('@')[0]}</span>
        `;
    } else {
        userMenu.innerHTML = `<a href="login.html" class="btn-login">Войти</a>`;
    }
}

// 2. Функция создания карточки товара
function createAdCard(ad) {
    const card = document.createElement('div');
    card.className = 'ad-card';
    
    // Берем первое фото из массива картинок
    const imageSrc = ad.images && ad.images.length > 0 ? ad.images[0] : 'img/no-photo.png';

    card.innerHTML = `
        <div class="ad-image">
            <img src="${imageSrc}" alt="${ad.title}">
        </div>
        <div class="ad-details">
            <h3 class="ad-title">${ad.title}</h3>
            <p class="ad-price">${Number(ad.price).toLocaleString()} TJS</p>
            <div class="ad-info">
                <span>📍 ${ad.region}</span>
                <span>📅 ${ad.createdAt}</span>
            </div>
        </div>
    `;

    // При клике на карточку — переходим к деталям (позже создадим detail.html)
    card.addEventListener('click', () => {
        window.location.href = `detail.html?id=${ad.id}`;
    });

    return card;
}

// 3. Главная функция фильтрации и отрисовки
function updateAds() {
    const allAds = getAds();
    const searchText = searchInput.value.toLowerCase();
    const selectedRegion = regionFilter.value;
    const selectedCategory = categoryFilter.value;

    const filtered = allAds.filter(ad => {
        const matchesSearch = ad.title.toLowerCase().includes(searchText);
        const matchesRegion = !selectedRegion || ad.region === selectedRegion;
        const matchesCategory = !selectedCategory || ad.category === selectedCategory;
        return matchesSearch && matchesRegion && matchesCategory;
    });

    adsContainer.innerHTML = '';
    
    if (filtered.length === 0) {
        adsContainer.innerHTML = '<p class="no-results">Ничего не найдено. Попробуйте изменить фильтры.</p>';
        return;
    }

    // Сначала показываем новые (сортировка по ID/времени)
    filtered.sort((a, b) => b.id - a.id).forEach(ad => {
        adsContainer.appendChild(createAdCard(ad));
    });
}

// Слушатели событий
searchInput.addEventListener('input', updateAds);
regionFilter.addEventListener('change', updateAds);
categoryFilter.addEventListener('change', updateAds);

// Запуск при загрузке
renderUserMenu();
updateAds();