import { getCurrentUser } from './auth.js';
import { getAds, saveAds } from './storage.js';

const user = getCurrentUser();
if (!user) {
    window.location.href = 'login.html';
}

const form = document.getElementById('edit-form');
const message = document.getElementById('message');
const titleInput = document.getElementById('title');
const priceInput = document.getElementById('price');
const phoneInput = document.getElementById('phone');
const categoryInput = document.getElementById('category');
const imagesInput = document.getElementById('images');
const imagePreview = document.getElementById('image-preview');

const adId = parseInt(new URLSearchParams(window.location.search).get('id'));
let ads = getAds();
let ad = ads.find(a => a.id === adId);

if (!ad || ad.ownerId !== user.id) {
    alert('Объявление не найдено или вы не владелец');
    window.location.href = 'profile.html';
}

// Заполнение формы существующими данными
titleInput.value = ad.title;
priceInput.value = ad.price;
phoneInput.value = ad.phone || '';
categoryInput.value = ad.category;

// Превью существующих изображений
function showImages() {
    imagePreview.innerHTML = '';
    ad.images?.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        imagePreview.appendChild(img);
    });
}
showImages();

// Загрузка новых изображений
imagesInput.addEventListener('change', e => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = ev => {
            ad.images = ad.images || [];
            ad.images.push(ev.target.result);
            showImages();
        };
        reader.readAsDataURL(file);
    });
});

form.addEventListener('submit', e => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const price = priceInput.value.trim();
    const phone = phoneInput.value.trim();
    const category = categoryInput.value;

    if (!title || !price || !category) {
        message.innerText = 'Пожалуйста, заполните все обязательные поля';
        return;
    }

    // Сохраняем изменения
    ad.title = title;
    ad.price = price;
    ad.phone = phone;
    ad.category = category;

    saveAds(ads);
    message.innerText = 'Объявление успешно обновлено!';
    setTimeout(() => {
        window.location.href = 'profile.html';
    }, 1000);
});
