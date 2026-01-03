// js/profile.js
import { getCurrentUser } from './auth.js';
import { getAds, saveAds } from './storage.js';

const user = getCurrentUser();
if(!user) window.location.href = 'login.html';

document.getElementById('profile-info').innerHTML = `
    <p><strong>Пользователь:</strong> ${user.username}</p>
    <p><strong>Email:</strong> ${user.email || '-'}</p>
`;

document.getElementById('logout-btn').onclick = () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
};

const myAds = getAds().filter(ad => ad.ownerId === user.id);
const userAdsContainer = document.getElementById('user-ads');
userAdsContainer.innerHTML = myAds.length 
    ? myAds.map(ad => `
        <div class="product-card">
            <img src="${ad.images[0] || 'https://via.placeholder.com/300'}">
            <div class="title">${ad.title}</div>
            <button onclick="deleteAd(${ad.id})">Удалить</button>
        </div>
    `).join('')
    : '<div>У вас нет объявлений</div>';

window.deleteAd = function(id) {
    if(confirm('Удалить объявление?')) {
        const filtered = getAds().filter(a => a.id !== id);
        saveAds(filtered);
        location.reload();
    }
}
