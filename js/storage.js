/**
 * Rogun.tj - Модуль управления данными (LocalStorage)
 */

// --- ОБЪЯВЛЕНИЯ ---

// Получение всех объявлений
export function getAds() {
    try {
        const data = localStorage.getItem('ads');
        // Проверка на пустоту или некорректные данные
        if (!data || data === "undefined" || data === "null") return [];
        return JSON.parse(data);
    } catch (e) {
        console.error("Ошибка чтения базы объявлений:", e);
        return [];
    }
}

// Сохранение массива объявлений
export function saveAds(ads) {
    try {
        localStorage.setItem('ads', JSON.stringify(ads));
    } catch (e) {
        // Обработка переполнения памяти (LocalStorage ограничен ~5-10 МБ)
        if (e.name === 'QuotaExceededError') {
            alert('Ошибка: Память браузера переполнена! Попробуйте загружать фото меньшего размера или удалите старые объявления.');
        }
        console.error("Ошибка записи объявлений:", e);
    }
}

// --- ПОЛЬЗОВАТЕЛИ ---

// Получение списка всех зарегистрированных пользователей
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

// Сохранение списка пользователей
export function saveUsers(users) {
    try {
        localStorage.setItem('users', JSON.stringify(users));
    } catch (e) {
        console.error("Ошибка сохранения пользователей:", e);
    }
}

// --- ТЕКУЩАЯ СЕССИЯ (КТО ВОШЕЛ) ---

// Получение данных вошедшего пользователя
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

// Сохранение текущего пользователя (вход)
export function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}

// Альтернативное имя (для совместимости)
export function saveCurrentUser(user) {
    setCurrentUser(user);
}

// Выход из системы
export function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}