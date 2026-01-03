import { getCurrentUser } from './auth.js';
import { getAds, saveAds } from './storage.js';

const user = getCurrentUser();
if (!user) window.location.href = 'login.html';

const form = document.getElementById('add-form');
const imageInput = document.getElementById('image');
const preview = document.getElementById('image-preview');

// Функция сжатия изображения (чтобы проект не "падал")
async function compressImage(base64Str) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.7)); // Качество 70%
        };
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const price = document.getElementById('price').value.trim();
    const category = document.getElementById('category').value;
    const region = document.getElementById('region').value; // Новый элемент в HTML
    const phone = document.getElementById('phone').value.trim();

    // Валидация телефона (Таджикистан: +992 или просто 9 цифр)
    const phoneRegex = /^(?:\+992|992)?\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        alert("Введите корректный номер телефона (например, 900112233)");
        return;
    }

    let imgData = '';
    const file = imageInput.files[0];
    if (file) {
        const reader = new FileReader();
        const base64 = await new Promise(r => {
            reader.onload = e => r(e.target.result);
            reader.readAsDataURL(file);
        });
        imgData = await compressImage(base64);
    }

    const ads = getAds();
    const newAd = {
        id: Date.now(),
        title,
        price: Number(price),
        category,
        region,
        phone,
        images: imgData ? [imgData] : [],
        ownerId: user.id,
        createdAt: new Date().toLocaleDateString('ru-RU'), // Дата
        views: 0
    };

    ads.push(newAd);
    saveAds(ads);
    alert("Объявление успешно опубликовано!");
    window.location.href = 'index.html';
});