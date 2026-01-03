// js/favorites.js
import { getCurrentUser } from './auth.js';

export function getFavorites() {
    const user = getCurrentUser();
    if(!user) return [];
    const allFavs = JSON.parse(localStorage.getItem('favorites')) || {};
    return allFavs[user.id] || [];
}

export function toggleFavorite(adId) {
    const user = getCurrentUser();
    if(!user) return alert('Вы должны войти, чтобы добавлять в избранное');

    const allFavs = JSON.parse(localStorage.getItem('favorites')) || {};
    let userFavs = allFavs[user.id] || [];

    if(userFavs.includes(adId)) {
        userFavs = userFavs.filter(id => id !== adId);
    } else {
        userFavs.push(adId);
    }

    allFavs[user.id] = userFavs;
    localStorage.setItem('favorites', JSON.stringify(allFavs));
}
