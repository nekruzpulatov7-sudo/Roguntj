/**
 * Rogun.tj - Модуль управления данными (LocalStorage)
 * Финальная версия с поддержкой удаления и редактирования
 */

// --- ОБЪЯВЛЕНИЯ (ADS) ---

// 1. Получение всех объявлений
export function getAds() {
    try {
        const data = localStorage.getItem('ads');
        if (!data || data === "undefined" || data === "null") return [];
        return JSON.parse(data);
    } catch (e) {
        console.error("Ошибка чтения базы объявлений:", e);
        return [];
    }
}

// 2. Сохранение всего массива объявлений (перезапись)
export function saveAds(ads) {
    try {
        localStorage.setItem('ads', JSON.stringify(ads));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert('Ошибка: Память браузера переполнена! Фото слишком тяжелые.');
        }
        console.error("Ошибка записи объявлений:", e);
    }
}

// 3. Добавление одного нового объявления в список
export function saveAd(newAd) {
    const ads = getAds();
    ads.push(newAd);
    saveAds(ads);
}

// 4. Удаление объявления по ID
export function deleteAd(adId) {
    let ads = getAds();
    ads = ads.filter(ad => ad.id !== adId);
    saveAds(ads);
}

// --- ПОЛЬЗОВАТЕЛИ (USERS) ---

// 5. Получение списка всех пользователей
export function getUsers() {
    try {
        const data = localStorage.getItem('users');
        if (!data || data === "undefined" || data === "null") return [];
        return JSON.parse(data);
    } catch (e) {
        console.error("Ошибка чтения списка пользователей:", e);
        return [];
    }
}

// 6. Сохранение списка пользователей
export function saveUsers(users) {
    try {
        localStorage.setItem('users', JSON.stringify(users));
    } catch (e) {
        console.error("Ошибка сохранения пользователей:", e);
    }
}

// --- СЕССИЯ (AUTH) ---

// 7. Получение текущего вошедшего пользователя
export function getCurrentUser() {
    try {
        const data = localStorage.getItem('currentUser');
        if (!data || data === "undefined" || data === "null") return null;
        return JSON.parse(data);
    } catch (e) {
        console.error("Ошибка получения текущего пользователя:", e);
        return null;
    }
}

// 8. Сохранение сессии (вход)
export function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}

// Псевдоним для совместимости
export function saveCurrentUser(user) {
    setCurrentUser(user);
}

// 9. Выход из системы
export function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}