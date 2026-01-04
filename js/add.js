import { getCurrentUser } from './auth.js';
import { getAds, saveAds } from './storage.js';

const user = getCurrentUser();
// Если пользователь не авторизован — отправляем на вход
if (!user) window.location.href = 'login.html';

const form = document.getElementById('add-form');
const categorySelect = document.getElementById('category');
const dynamicContainer = document.getElementById('dynamic-params');
const imageInput = document.getElementById('image');

/**
 * 1. КОНФИГУРАЦИЯ УМНЫХ ПОЛЕЙ (Somon Style)
 */
const categoryConfig = {
    "Транспорт": [
        { label: "Марка и модель", id: "model", type: "text", placeholder: "Напр: Toyota Camry" },
        { label: "Год выпуска", id: "year", type: "number", placeholder: "2022" },
        { label: "Тип кузова", id: "body", type: "select", options: ["Седан", "Внедорожник", "Хэтчбек", "Микроавтобус", "Купе"] },
        { label: "Пробег (км)", id: "mileage", type: "number" },
        { label: "Топливо", id: "fuel", type: "select", options: ["Бензин", "Дизель", "Газ", "Гибрид", "Электро"] },
        { label: "Коробка передач", id: "transmission", type: "select", options: ["Автомат", "Механика"] }
    ],
    "Недвижимость": [
        { label: "Тип объекта", id: "realty_type", type: "select", options: ["Квартира", "Дом / Дача", "Участок", "Офис / Магазин"] },
        { label: "Количество комнат", id: "rooms", type: "select", options: ["1", "2", "3", "4", "5+"] },
        { label: "Этаж", id: "floor", type: "text", placeholder: "Напр: 3 из 9" },
        { label: "Общая площадь (м²)", id: "area", type: "number" }
    ],
    "Электроника и Бытовая Техника": [
        { label: "Состояние", id: "condition", type: "select", options: ["Новый", "Б/У (в идеале)", "Б/У (среднее)"] },
        { label: "Объем памяти", id: "memory", type: "text", placeholder: "Напр: 256 GB" },
        { label: "Цвет", id: "color", type: "text" }
    ],
    "Магазин Одежда": [
        { label: "Тип", id: "clothing_type", type: "select", options: ["Мужская", "Женская", "Детская"] },
        { label: "Размер", id: "size", type: "text", placeholder: "Напр: L или 42" }
    ],
    "Строительство и Ремонт": [
        { label: "Тип товара", id: "build_type", type: "text", placeholder: "Напр: Цемент, Кирпич" },
        { label: "Доставка", id: "delivery", type: "select", options: ["Есть доставка", "Самовывоз"] }
    ],
    "Животные": [
        { label: "Вид животного", id: "animal_kind", type: "text", placeholder: "Напр: Породистый бык" },
        { label: "Возраст", id: "animal_age", type: "text" }
    ],
    "Услуги и Вакансии": [
        { label: "Опыт работы", id: "experience", type: "select", options: ["Без опыта", "1-3 года", "Более 5 лет"] },
        { label: "График", id: "schedule", type: "select", options: ["Полный день", "Удаленно", "Подработка"] }
    ]
};

/**
 * 2. ЛОГИКА ОРИСОВКИ ДИНАМИЧЕСКИХ ПОЛЕЙ
 */
categorySelect.addEventListener('change', (e) => {
    const category = e.target.value;
    dynamicContainer.innerHTML = ''; // Очищаем старые поля

    if (categoryConfig[category]) {
        categoryConfig[category].forEach(param => {
            const div = document.createElement('div');
            div.className = 'form-group';
            
            let inputHtml = '';
            if (param.type === 'select') {
                inputHtml = `<select class="param-input" data-label="${param.label}">
                    ${param.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                </select>`;
            } else {
                inputHtml = `<input type="${param.type}" class="param-input" data-label="${param.label}" placeholder="${param.placeholder || ''}">`;
            }

            div.innerHTML = `<label>${param.label}</label>${inputHtml}`;
            dynamicContainer.appendChild(div);
        });
    }
});

/**
 * 3. СЖАТИЕ ИЗОБРАЖЕНИЙ
 */
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
            resolve(canvas.toDataURL('image/jpeg', 0.7)); 
        };
    });
}

/**
 * 4. ОБРАБОТКА ФОРМЫ
 */
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Основные данные
    const title = document.getElementById('title').value.trim();
    const price = document.getElementById('price').value.trim();
    const category = categorySelect.value;
    const region = document.getElementById('region').value;
    const phone = document.getElementById('phone').value.trim();
    const description = document.getElementById('description').value.trim();

    // Валидация телефона
    const phoneRegex = /^(?:\+992|992)?\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        alert("Введите корректный номер телефона (например, 900112233)");
        return;
    }

    // Собираем умные поля
    const extraParams = {};
    document.querySelectorAll('.param-input').forEach(input => {
        const label = input.getAttribute('data-label');
        if (input.value) extraParams[label] = input.value;
    });

    // Обработка фото
    let imgData = '';
    const file = imageInput.files[0];
    if (file) {
        const reader = new FileReader();
        const base64 = await new Promise(r => {
            reader.onload = ev => r(ev.target.result);
            reader.readAsDataURL(file);
        });
        imgData = await compressImage(base64);
    }

    // Создаем объект объявления
    const ads = getAds();
    const newAd = {
        id: Date.now(),
        title,
        price: Number(price),
        category,
        region,
        phone,
        description,
        params: extraParams, // Умные поля уходят сюда
        images: imgData ? [imgData] : ['https://via.placeholder.com/600x400?text=Нет+фото'],
        ownerId: user.id,
        createdAt: new Date().toLocaleDateString('ru-RU'),
        views: 0
    };

    try {
        ads.push(newAd);
        saveAds(ads);
        alert("Объявление успешно опубликовано!");
        window.location.href = 'index.html';
    } catch (err) {
        alert("Ошибка сохранения. Возможно, фото слишком большое.");
    }
});