// js/storage.js

export function getAds() {
    try {
        return JSON.parse(localStorage.getItem('ads') || '[]');
    } catch (e) {
        console.error("Ошибка чтения базы данных", e);
        return [];
    }
}

export function saveAds(ads) {
    try {
        localStorage.setItem('ads', JSON.stringify(ads));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert('Ошибка: Память браузера переполнена! Удалите старые объявления или используйте фото поменьше.');
            throw e; // Пробрасываем ошибку для обработки в форме
        }
    }
}

export function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

export function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

export function saveCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}