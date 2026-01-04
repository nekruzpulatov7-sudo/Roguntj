import { getCurrentUser } from './auth.js';
import { saveAd, SOMON_STRUCTURE, getAds, saveAds } from './storage.js';

// 1. ПРОВЕРКА АВТОРИЗАЦИИ
const user = getCurrentUser();
if (!user) {
    window.location.href = 'login.html';
}

// 2. ЭЛЕМЕНТЫ ФОРМЫ
const form = document.getElementById('add-form');
const categorySelect = document.getElementById('category'); // Основной Select в HTML
const dynamicContainer = document.getElementById('dynamic-params'); // Контейнер для новых списков
const imageInput = document.getElementById('image');

/**
 * 3. ЗАПОЛНЕНИЕ ОСНОВНЫХ КАТЕГОРИЙ ПРИ ЗАГРУЗКЕ
 */
function initCategories() {
    categorySelect.innerHTML = '<option value="">-- Выберите категорию --</option>';
    Object.keys(SOMON_STRUCTURE).forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

/**
 * 4. ЛОГИКА ДИНАМИЧЕСКИХ СПИСКОВ (Цепочка выбора)
 */
categorySelect.addEventListener('change', (e) => {
    const mainCat = e.target.value;
    dynamicContainer.innerHTML = ''; // Чистим всё, что было создано ниже

    if (mainCat && SOMON_STRUCTURE[mainCat]) {
        renderSubCategories(mainCat);
    }
});

// Рендер второго уровня (например: Легковые автомобили, Смартфоны)
function renderSubCategories(mainCat) {
    const subData = SOMON_STRUCTURE[mainCat];
    
    const div = document.createElement('div');
    div.className = 'form-group';
    div.innerHTML = `
        <label>Подкатегория</label>
        <select id="sub-category" required>
            <option value="">-- Выберите подкатегорию --</option>
            ${Object.keys(subData).map(sub => `<option value="${sub}">${sub}</option>`).join('')}
        </select>
    `;

    dynamicContainer.appendChild(div);

    const subSelect = div.querySelector('select');
    subSelect.addEventListener('change', (e) => {
        const subCat = e.target.value;
        // Удаляем третий уровень, если он уже был отрисован
        const existingThird = document.getElementById('third-level-wrapper');
        if (existingThird) existingThird.remove();

        if (subCat && subData[subCat]) {
            renderThirdLevel(mainCat, subCat);
        }
    });
}

// Рендер третьего уровня (например: Toyota, Samsung, или Размеры одежды)
function renderThirdLevel(mainCat, subCat) {
    const items = SOMON_STRUCTURE[mainCat][subCat];
    if (!items || items.length === 0) return;

    const div = document.createElement('div');
    div.id = 'third-level-wrapper';
    div.className = 'form-group';
    
    // Определяем заголовок в зависимости от категории
    let labelText = "Марка / Тип";
    if (mainCat === "Магазин Одежда") labelText = "Размер";
    if (mainCat === "Недвижимость") labelText = "Количество комнат";

    div.innerHTML = `
        <label>${labelText}</label>
        <select id="specific-item" class="param-input" data-label="${labelText}">
            <option value="">-- Выберите из списка --</option>
            ${items.map(item => `<option value="${item}">${item}</option>`).join('')}
        </select>
    `;

    dynamicContainer.appendChild(div);
}

/**
 * 5. СЖАТИЕ ФОТО
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
 * 6. ОТПРАВКА ФОРМЫ
 */
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Публикация...";

    const title = document.getElementById('title').value.trim();
    const price = document.getElementById('price').value.trim();
    const category = categorySelect.value;
    const subCategory = document.getElementById('sub-category')?.value || '';
    const specificItem = document.getElementById('specific-item')?.value || '';
    const region = document.getElementById('region').value;
    const phone = document.getElementById('phone').value.trim();
    const description = document.getElementById('description').value.trim();

    // Валидация телефона (Таджикистан)
    const phoneRegex = /^(?:\+992|992)?\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        alert("Введите корректный номер телефона (например, 900112233)");
        submitBtn.disabled = false;
        submitBtn.textContent = "Опубликовать";
        return;
    }

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

    // Собираем объект
    const newAd = {
        id: Date.now(),
        title,
        price: Number(price),
        category,
        subCategory, // Сохраняем подкатегорию
        specificItem, // Сохраняем марку/модель
        region,
        phone,
        description,
        images: imgData ? [imgData] : ['https://via.placeholder.com/600x400?text=Нет+фото'],
        ownerId: user.id,
        createdAt: new Date().toLocaleDateString('ru-RU'),
        views: 0
    };

    try {
        saveAd(newAd); // Используем функцию из storage.js
        alert("Объявление успешно опубликовано!");
        window.location.href = 'index.html';
    } catch (err) {
        alert("Ошибка сохранения. Лимит памяти браузера исчерпан.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Опубликовать";
    }
});

// Запуск при загрузке страницы
initCategories();