/**
 * Rogun.tj - Главный контроллер списка объявлений
 * Версия: 3.0 (Интеграция с Somon Style и умными фильтрами)
 */
import { getAds, SOMON_STRUCTURE } from './storage.js';
import { getFavorites, toggleFavorite } from './favorites.js';

// Глобальные переменные состояния
let allAds = [];
let currentCategory = null;
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Загружаем данные
    allAds = getAds();

    // 2. Инициализируем компоненты
    initCategories();
    initSearch();
    initExtraFilters();
    initTheme();

    // 3. Первичная отрисовка
    updateAdsDisplay();
});

/**
 * Инициализация категорий (верхнее меню)
 */
function initCategories() {
    const catButtons = document.querySelectorAll('.cat-btn');
    const transportFilters = document.getElementById('transport-filters');

    catButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Переключение активного класса
            catButtons.forEach(b => b.classList.remove('active'));
            
            if (currentCategory === btn.dataset.cat) {
                currentCategory = null; // Сброс, если нажали на ту же категорию
            } else {
                currentCategory = btn.dataset.cat;
                btn.classList.add('active');
            }

            // Показываем блок доп. фильтров (например, для Транспорта)
            if (transportFilters) {
                transportFilters.style.display = currentCategory === 'Транспорт' ? 'grid' : 'none';
            }

            updateAdsDisplay();
        });
    });
}

/**
 * Поиск по тексту
 */
function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.toLowerCase();
            updateAdsDisplay();
        });
    }
}

/**
 * Инициализация выпадающих списков (Марки машин и т.д.)
 */
function initExtraFilters() {
    const brandSelect = document.getElementById('filter-brand');
    const regionSelect = document.getElementById('region-filter');
    const fuelSelect = document.getElementById('filter-fuel');

    // Заполняем марки машин из SOMON_STRUCTURE
    if (brandSelect && SOMON_STRUCTURE["Транспорт"]) {
        const brands = SOMON_STRUCTURE["Транспорт"]["Легковые автомобили"];
        brands.forEach(brand => {
            const opt = document.createElement('option');
            opt.value = brand;
            opt.textContent = brand;
            brandSelect.appendChild(opt);
        });
    }

    // Слушатели на изменение всех селектов
    [brandSelect, regionSelect, fuelSelect].forEach(select => {
        if (select) select.addEventListener('change', updateAdsDisplay);
    });
}

/**
 * ГЛАВНАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ СПИСКА
 */
function updateAdsDisplay() {
    const list = document.getElementById('ads-list');
    const countLabel = document.getElementById('ads-count');
    
    // Получаем значения фильтров
    const selectedBrand = document.getElementById('filter-brand')?.value || "";
    const selectedRegion = document.getElementById('region-filter')?.value || "";
    const selectedFuel = document.getElementById('filter-fuel')?.value || "";

    // Фильтрация массива
    const filtered = allAds.filter(ad => {
        const matchSearch = ad.title.toLowerCase().includes(currentSearch);
        const matchCat = !currentCategory || ad.category === currentCategory;
        const matchRegion = !selectedRegion || ad.region === selectedRegion;
        
        // Фильтрация по "умным" полям (params), если они есть
        const matchBrand = !selectedBrand || (ad.params && ad.params["Марка и модель"] === selectedBrand);
        const matchFuel = !selectedFuel || (ad.params && ad.params["Топливо"] === selectedFuel);

        return matchSearch && matchCat && matchRegion && matchBrand && matchFuel;
    });

    // Обновляем счетчик
    if (countLabel) countLabel.innerText = filtered.length;

    // Рендер карточек
    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <p>Ничего не найдено по вашему запросу</p>
            </div>`;
        return;
    }

    list.innerHTML = filtered.map(ad => renderCard(ad)).join('');
}

/**
 * Создание HTML кода карточки
 */
function renderCard(ad) {
    const isFav = getFavorites().includes(ad.id);
    const price = Number(ad.price).toLocaleString('ru-RU');
    
    return `
        <div class="product-card">
            <div class="ad-image" onclick="window.location.href='detail.html?id=${ad.id}'">
                <img src="${ad.images?.[0] || 'img/no-photo.png'}" alt="${ad.title}">
            </div>
            <div class="ad-info">
                <div class="price">${price} TJS</div>
                <div class="title" onclick="window.location.href='detail.html?id=${ad.id}'">${ad.title}</div>
                <div class="category">${ad.category}</div>
                <div class="location">📍 ${ad.region || 'Рогун'}</div>
                <div class="fav-icon ${isFav ? 'active' : ''}" data-id="${ad.id}">
                    ${isFav ? '★' : '☆'}
                </div>
            </div>
        </div>
    `;
}

// Делегирование события для кнопки избранного
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('fav-icon')) {
        const id = parseInt(e.target.dataset.id);
        toggleFavorite(id);
        updateAdsDisplay(); // Перерисовываем, чтобы звезда сменилась
    }
});

/**
 * Простая инициализация темы (если нет в отдельном файле)
 */
function initTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
}