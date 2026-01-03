document.addEventListener('DOMContentLoaded', () => {
    initTheme('theme-toggle');
    renderAds();
});

function renderAds() {
    const ads = getAds();
    const list = document.getElementById('ads-list');
    const count = document.getElementById('ads-count');

    if (!list) return;

    list.innerHTML = '';
    count.innerText = ads.length;

    ads.forEach(ad => {
        list.appendChild(createAdCard(ad));
    });
}

function createAdCard(ad) {
    const card = document.createElement('div');
    card.className = 'product-card';

    card.onclick = () => {
        location.href = `detail.html?id=${ad.id}`;
    };

    card.innerHTML = `
        <img src="${ad.images?.[0] || 'https://via.placeholder.com/300'}">
        <div class="price">${ad.price} TJS</div>
        <div class="title">${ad.title}</div>
        <div class="fav-icon">${getFavorites().includes(ad.id) ? '★' : '☆'}</div>
    `;

    card.querySelector('.fav-icon').onclick = (e) => {
        e.stopPropagation();
        toggleFavorite(ad.id);
        renderAds();
    };

    return card;
}
