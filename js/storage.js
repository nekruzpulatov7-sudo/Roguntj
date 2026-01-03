/**
 * Rogun.tj - Модуль управления данными (LocalStorage)
 * Версия: 2.0 (Стабильная)
 */

// --- ОБЪЯВЛЕНИЯ (ADS) ---

/**
 * Получить все объявления из базы
 */
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

/**
 * Сохранить весь массив объявлений (перезапись)
 */
export function saveAds(ads) {
    try {
        localStorage.setItem('ads', JSON.stringify(ads));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert('Ошибка: Память браузера переполнена! Попробуйте загрузить меньше фото или уменьшить их размер.');
        }
        console.error("Ошибка записи объявлений:", e);
    }
}

/**
 * Добавить одно новое объявление
 */
export function saveAd(newAd) {
    const ads = getAds();
    ads.push(newAd);
    saveAds(ads);
}

/**
 * Удалить объявление по его ID
 */
export function deleteAd(adId) {
    let ads = getAds();
    // Фильтруем массив, оставляя всё, кроме указанного ID
    ads = ads.filter(ad => ad.id !== adId);
    saveAds(ads);
}

// --- ПОЛЬЗОВАТЕЛИ (USERS) ---

/**
 * Получить список зарегистрированных пользователей
 */
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

/**
 * Сохранить список пользователей
 */
export function saveUsers(users) {
    try {
        localStorage.setItem('users', JSON.stringify(users));
    } catch (e) {
        console.error("Ошибка сохранения пользователей:", e);
    }
}

// --- СЕССИЯ (АВТОРИЗАЦИЯ) ---

/**
 * Получить данные текущего вошедшего пользователя
 */
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

/**
 * Сохранить данные текущей сессии (вход в систему)
 */
export function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}

/**
 * Псевдоним для совместимости с другими модулями
 */
export function saveCurrentUser(user) {
    setCurrentUser(user);
}

/**
 * Выход из системы с редиректом
 */
export function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}