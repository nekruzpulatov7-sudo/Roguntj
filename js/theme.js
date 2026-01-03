function initTheme(btnId) {
    const btn = document.getElementById(btnId);
    const saved = localStorage.getItem('theme') || 'light';

    document.documentElement.setAttribute('data-theme', saved);

    if (btn) {
        btn.innerText = saved === 'dark' ? '☀️' : '🌙';
        btn.onclick = () => {
            const next = saved === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', next);
            location.reload();
        };
    }
}
