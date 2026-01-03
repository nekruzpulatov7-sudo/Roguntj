// js/storage.js

// Получение всех объявлений
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

// Сохранение объявлений
export function saveAds(ads) {
    try {
        localStorage.setItem('ads', JSON.stringify(ads));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert('Ошибка: Память переполнена! Удалите старые объявления или используйте фото поменьше.');
            throw e; 
        }
        console.error("Ошибка записи объявлений:", e);
    }
}

// Список пользователей
export function getUsers() {
    try {
        const data = localStorage.getItem('users');
        if (!data || data === "undefined") return [];
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

export function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Текущий пользователь
export function getCurrentUser() {
    try {
        const data = localStorage.getItem('currentUser');
        if (!data || data === "undefined" || data === "null") return null;
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

export function saveCurrentUser(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}

export function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}