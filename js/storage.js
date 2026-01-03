// js/storage.js

// 1. Получение всех объявлений
export function getAds() {
    try {
        const data = localStorage.getItem('ads');
        // Проверяем, что данные существуют и это не строка "undefined"
        if (!data || data === "undefined") return [];
        return JSON.parse(data);
    } catch (e) {
        console.error("Ошибка чтения базы объявлений:", e);
        return [];
    }
}

// 2. Сохранение объявлений
export function saveAds(ads) {
    try {
        localStorage.setItem('ads', JSON.stringify(ads));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert('Ошибка: Память переполнена! Пожалуйста, удалите старые объявления или загружайте фото меньшего размера.');
            throw e; 
        }
        console.error("Ошибка записи объявлений:", e);
    }
}

// 3. Получение списка зарегистрированных пользователей
export function getUsers() {
    try {
        const data = localStorage.getItem('users');
        if (!data || data === "undefined") return [];
        return JSON.parse(data);
    } catch (e) {
        console.error("Ошибка чтения списка пользователей:", e);
        return [];
    }
}

// 4. Сохранение списка пользователей
export function saveUsers(users) {
    try {
        localStorage.setItem('users', JSON.stringify(users));
    } catch (e) {
        console.error("Ошибка записи пользователей:", e);
    }
}

// 5. Получение текущего вошедшего пользователя
export function getCurrentUser() {
    try {
        const data = localStorage.getItem('currentUser');
        // Важная проверка: если данных нет или там записана ошибка
        if (!data || data === "undefined" || data === "null") return null;
        return JSON.parse(data);
    } catch (e) {
        console.error("Ошибка чтения текущего пользователя:", e);
        return null;
    }
}

// 6. Сохранение текущего пользователя (авторизация)
export function saveCurrentUser(user) {
    try {
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('currentUser');
        }
    } catch (e) {
        console.error("Ошибка сохранения сессии пользователя:", e);
    }
}

// 7. Функция для выхода из системы (полезный бонус)
export function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}