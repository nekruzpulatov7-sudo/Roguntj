import { getUsers, saveUsers, saveCurrentUser } from './storage.js';

/**
 * Регистрация нового пользователя
 */
export async function registerUser(username, password, phone) {
    const users = getUsers();
    
    if (users.find(u => u.username === username)) {
        return { success: false, message: 'Этот логин уже занят' };
    }

    const newUser = {
        id: Date.now(),
        username: username,
        password: password,
        phone: phone,
        verified: true, // Ставим true, так как проверку делаем в процессе
        createdAt: new Date().toLocaleDateString()
    };

    users.push(newUser);
    saveUsers(users);
    saveCurrentUser(newUser); // Сразу логиним после регистрации
    return { success: true, message: 'Регистрация успешна!' };
}

/**
 * Вход в систему
 */
export async function loginUser(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return { success: false, message: 'Неверный логин или пароль' };
    }

    saveCurrentUser(user);
    return { success: true, message: 'Вход выполнен' };
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
 * СИСТЕМА ВЕРИФИКАЦИИ ЧЕРЕЗ TELEGRAM
 * Вызывается при регистрации или входе
 */
export function verifyViaTelegram(phoneNumber) {
    return new Promise((resolve) => {
        // 1. Генерируем код
        const generatedCode = Math.floor(1000 + Math.random() * 9000);
        
        // 2. Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'sms-modal'; // Используем ваши стили
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:10000;';
        
        modal.innerHTML = `
            <div style="background:white; padding:30px; border-radius:24px; max-width:380px; width:90%; text-align:center; font-family:sans-serif;">
                <h2 style="margin:0 0 10px 0; color:#333;">Подтверждение</h2>
                <p style="color:#666; font-size:14px;">Чтобы подтвердить номер <b>${phoneNumber}</b>, нажмите кнопку ниже и запустите бота.</p>
                
                <button id="tg-open-btn" style="background:#0088cc; color:white; border:none; width:100%; padding:15px; border-radius:12px; font-weight:bold; cursor:pointer; margin-bottom:20px; display:flex; align-items:center; justify-content:center; gap:10px;">
                    ✈️ Открыть Telegram
                </button>

                <div style="border-top:1px solid #eee; padding-top:20px;">
                    <p style="font-size:13px; margin-bottom:10px; color:#888;">Введите полученный код:</p>
                    <input type="text" id="tg-code-input" maxlength="4" placeholder="0000" style="width:120px; padding:12px; text-align:center; font-size:24px; font-weight:bold; border:2px solid #ddd; border-radius:10px; letter-spacing:4px;">
                </div>

                <button id="tg-confirm-btn" style="background:#28a745; color:white; border:none; width:100%; padding:15px; border-radius:12px; font-weight:bold; cursor:pointer; margin-top:20px;">Подтвердить</button>
                <button id="tg-close-btn" style="background:none; border:none; color:#999; margin-top:15px; cursor:pointer;">Отмена</button>
                
                <p style="margin-top:15px; font-size:11px; color:#bbb;">Если бот не открылся, код для теста: <b style="color:#28a745;">${generatedCode}</b></p>
            </div>
        `;

        document.body.appendChild(modal);

        // Кнопка открытия Telegram
        document.getElementById('tg-open-btn').onclick = () => {
            // ЗАМЕНИТЕ 'YourRogunBot' на имя вашего бота в будущем
            const botUsername = 'YourRogunBot'; 
            window.open(`https://t.me/${botUsername}?start=${generatedCode}`, '_blank');
        };

        // Кнопка проверки кода
        document.getElementById('tg-confirm-btn').onclick = () => {
            const entered = document.getElementById('tg-code-input').value;
            if (entered == generatedCode) {
                modal.remove();
                resolve(true);
            } else {
                alert("Неверный код! Проверьте сообщение в Telegram.");
            }
        };

        // Кнопка закрытия
        document.getElementById('tg-close-btn').onclick = () => {
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