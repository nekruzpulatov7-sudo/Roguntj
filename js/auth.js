import { getUsers, saveUsers, saveCurrentUser } from './storage.js';

/**
 * Регистрация нового пользователя с проверкой имени
 */
export async function registerUser(username, password) {
    const users = getUsers();
    
    // Проверка на существование
    if (users.find(u => u.username === username)) {
        return { success: false, message: 'Пользователь с таким именем уже существует' };
    }

    const newUser = {
        id: Date.now(),
        username: username,
        password: password,
        createdAt: new Date().toLocaleDateString()
    };

    users.push(newUser);
    saveUsers(users);
    return { success: true, message: 'Регистрация успешна! Теперь войдите.' };
}

/**
 * Вход в систему
 */
export async function loginUser(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return { success: false, message: 'Неверное имя пользователя или пароль' };
    }

    saveCurrentUser(user);
    return { success: true, message: 'Вход выполнен успешно' };
}

/**
 * Проверка авторизации (защита страниц)
 */
export function requireAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    return user;
}

/**
 * СИСТЕМА ВЕРИФИКАЦИИ НОМЕРА (SMS Simulation)
 * Вызывается перед публикацией объявления
 */
export function verifyPhone(phoneNumber) {
    return new Promise((resolve) => {
        // Создаем модальное окно динамически
        const modal = document.createElement('div');
        modal.className = 'sms-modal';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="sms-content">
                <h2 style="margin-bottom:10px;">Подтверждение</h2>
                <p>Введите код из SMS, отправленный на <br><b style="color:#007bff;">${phoneNumber}</b></p>
                
                <div class="sms-code-input">
                    <input type="text" class="code-digit" maxlength="1" pattern="[0-9]*" inputmode="numeric" autofocus>
                    <input type="text" class="code-digit" maxlength="1" pattern="[0-9]*" inputmode="numeric">
                    <input type="text" class="code-digit" maxlength="1" pattern="[0-9]*" inputmode="numeric">
                    <input type="text" class="code-digit" maxlength="1" pattern="[0-9]*" inputmode="numeric">
                </div>
                
                <button id="confirm-sms-btn" class="cat-btn active" style="width:100%; padding:15px; margin-top:10px;">Подтвердить номер</button>
                <button id="close-sms-btn" style="background:none; border:none; margin-top:15px; color:#888; cursor:pointer;">Отмена</button>
                <p style="margin-top:20px; font-size:12px; color: #aaa;">Тестовый код для проекта: <span style="color:#28a745; font-weight:bold;">1234</span></p>
            </div>
        `;

        document.body.appendChild(modal);

        const inputs = modal.querySelectorAll('.code-digit');
        const confirmBtn = modal.getElementById('confirm-sms-btn');
        const closeBtn = modal.getElementById('close-sms-btn');

        // Автофокус и переключение между ячейками
        inputs.forEach((input, index) => {
            input.addEventListener('keyup', (e) => {
                if (e.key >= 0 && e.key <= 9) {
                    if (index < 3) inputs[index + 1].focus();
                } else if (e.key === 'Backspace') {
                    if (index > 0) inputs[index - 1].focus();
                }
            });
        });

        // Кнопка подтверждения
        confirmBtn.onclick = () => {
            const code = Array.from(inputs).map(i => i.value).join('');
            if (code === "1234") {
                modal.remove();
                resolve(true);
            } else {
                alert("Неверный код! Попробуйте 1234");
                inputs.forEach(i => i.value = '');
                inputs[0].focus();
            }
        };

        // Закрытие
        closeBtn.onclick = () => {
            modal.remove();
            resolve(false);
        };
    });
}

/**
 * Выход из системы
 */
export function logoutUser() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}