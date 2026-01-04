import { getCurrentUser } from './auth.js';
import { getAds, saveAds } from './storage.js';
import { getFavorites, toggleFavorite } from './favorites.js';

// 1. ПРОВЕРКА АВТОРИЗАЦИИ
const user = getCurrentUser();
if (!user) {
    window.location.href = 'login.html';
}

// 2. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
document.addEventListener('DOMContentLoaded', () => {
    // Применяем темную тему, если она была выбрана
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Вывод информации о пользователе
    const profileInfo = document.getElementById('profile-info');
    if (profileInfo) {
        profileInfo.innerHTML = `
            <div class="user-details">
                <h2>${user.username}</h2>
                <p><strong>Email:</strong> ${user.email || 'не указан'}</p>
                <p><strong>ID пользователя:</strong> ${user.id}</p>
            </div>
            <button id="logout-btn" class="btn-logout">Выйти из аккаунта</button>
        `;

        // Логика выхода
        document.getElementById('logout-btn').onclick = () => {
            if (confirm('Выйти из профиля?')) {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            }
        };
    }

    renderMyAds();
    renderFavorites();
});

// 3. ФУНКЦИЯ ВЫВОДА МОИХ ОБЪЯВЛЕНИЙ
function renderMyAds() {
    const userAdsContainer = document.getElementById('user-ads');
    if (!userAdsContainer) return;

    // Фильтруем объявления, где userId совпадает с ID текущего пользователя
    const allAds = getAds();
    const myAds = allAds.filter(ad => ad.userId === user.id || ad.ownerId === user.id);

    if (myAds.length === 0) {
        userAdsContainer.innerHTML = '<div class="empty-msg">У вас пока нет активных объявлений.</div>';
        return;
    }

    userAdsContainer.innerHTML = myAds.map(ad => `
        <div class="product-card">
            <img src="${ad.images[0] || 'https://via.placeholder.com/300'}" alt="${ad.title}">
            <div class="info" style="padding: 10px;">
                <div class="price" style="font-weight: bold; color: #28a745;">${Number(ad.price).toLocaleString()} TJS</div>
                <div class="title" style="margin: 5px 0; font-size: 14px; height: 32px; overflow: hidden;">${ad.title}</div>
                <div class="manage-actions" style="display: flex; gap: 5px; margin-top: 10px;">
                    <button class="btn-delete" onclick="deleteAd(${ad.id})" style="flex: 1;">Удалить</button>
                </div>
            </div>
        </div>
    `).join('');
}

// 4. ФУНКЦИЯ ВЫВОДА ИЗБРАННОГО
function renderFavorites() {
    const favContainer = document.getElementById('favorites-list');
    if (!favContainer) return;

    const allAds = getAds();
    const favIds = getFavorites();
    const favAds = allAds.filter(ad => favIds.includes(ad.id));

    if (favAds.length === 0) {
        favContainer.innerHTML = '<div class="empty-msg">Список избранного пуст.</div>';
        return;
    }

    favContainer.innerHTML = favAds.map(ad => `
        <div class="product-card">
            <img src="${ad.images[0] || 'https://via.placeholder.com/300'}" onclick="location.href='detail.html?id=${ad.id}'" style="cursor:pointer;">
            <div class="info" style="padding: 10px;">
                <div class="price" style="font-weight: bold; color: #28a745;">${Number(ad.price).toLocaleString()} TJS</div>
                <div class="title" style="margin: 5px 0;">${ad.title}</div>
                <button class="btn-delete" onclick="removeFavorite(${ad.id})" style="width: 100%; background: #f1f5f9; color: #333;">Убрать из избранного</button>
            </div>
        </div>
    `).join('');
}

// 5. ГЛОБАЛЬНЫЕ ФУНКЦИИ УПРАВЛЕНИЯ (доступны для onclick)
window.deleteAd = function(id) {
    if (confirm('Вы уверены, что хотите окончательно удалить это объявление?')) {
        const allAds = getAds();
        const filtered = allAds.filter(a => Number(a.id) !== Number(id));
        saveAds(filtered);
        renderMyAds(); // Перерисовываем список без перезагрузки страницы
    }
};

window.removeFavorite = function(id) {
    toggleFavorite(id);
    renderFavorites();
};