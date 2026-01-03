import { getFavorites } from './favorites.js';

export function renderAdCard(ad) {
    return `
        <div class="product-card" onclick="window.location.href='detail.html?id=${ad.id}'">
            <img src="${ad.images?.[0] || 'https://via.placeholder.com/300'}">
            <div class="price">${ad.price} TJS</div>
            <div class="title">${ad.title}</div>
            <div class="category">${ad.category}</div>
            <div class="fav-icon" onclick="event.stopPropagation(); toggleFavorite(${ad.id});">
                ${getFavorites().includes(ad.id) ? '★' : '☆'}
            </div>
        </div>
    `;
}

export function filterAds(ads, category = null, search = '') {
    return ads.filter(ad => {
        const matchCat = category ? ad.category === category : true;
        const matchSearch = ad.title.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });
}
