import { getCurrentUser } from './auth.js';
import { getAds } from './storage.js';

export function deleteAd(adId) {
    const user = getCurrentUser();
    if (!user) return alert('Вы должны войти в систему');

    const ads = getAds();
    const ad = ads.find(a => a.id === adId);

    if (!ad) return alert('Объявление не найдено');
    if (ad.ownerId !== user.id) return alert('Вы не можете удалить чужое объявление');

    const updatedAds = ads.filter(a => a.id !== adId);
    localStorage.setItem('ads', JSON.stringify(updatedAds));
    alert('Объявление удалено');
    window.location.reload();
}
