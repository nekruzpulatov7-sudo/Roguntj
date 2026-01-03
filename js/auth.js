import { getUsers, saveUsers, saveCurrentUser } from './storage.js';

// Регистрация
export async function registerUser(username, password) {
    const users = getUsers();
    if(users.find(u => u.username === username)){
        return { success: false, message: 'Пользователь с таким именем уже существует' };
    }

    const newUser = {
        id: Date.now(),
        username,
        password
    };

    users.push(newUser);
    saveUsers(users);
    return { success: true, message: 'Регистрация успешна' };
}

// Вход
export async function loginUser(username, password){
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if(!user){
        return { success: false, message: 'Неверное имя пользователя или пароль' };
    }

    saveCurrentUser(user);
    return { success: true, message: 'Вход успешен' };
}

// Проверка авторизации
export function requireAuth(){
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if(!user){
        window.location.href = 'login.html';
        return false;
    }
    return true;
}
