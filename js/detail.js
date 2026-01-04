<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Просмотр объявления — Rogun.tj</title>
    <link rel="stylesheet" href="css/style.css">
    <style>
        :root {
            --primary: #007bff;
            --success: #28a745;
            --dark-bg: #1a1a2e;
            --card-bg: #ffffff;
            --text: #333;
        }

        body {
            background-color: #f4f7f6;
            color: var(--text);
            font-family: 'Segoe UI', system-ui, sans-serif;
            margin: 0; padding-bottom: 50px;
        }

        body.dark-mode {
            background-color: #121212;
            --card-bg: #1f1f3a;
            --text: #eee;
        }

        .container { max-width: 1000px; margin: 0 auto; padding: 20px; }

        /* СЛАЙДЕР */
        .gallery-section { display: flex; flex-direction: column; gap: 15px; }
        .main-img-container { 
            position: relative; 
            width: 100%; 
            aspect-ratio: 4/3; 
            background: #e9ecef; 
            border-radius: 20px; 
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        #main-photo { width: 100%; height: 100%; object-fit: cover; transition: 0.3s; }
        
        .nav-btn {
            position: absolute; top: 50%; transform: translateY(-50%);
            background: rgba(255,255,255,0.8); border: none; width: 45px; height: 45px;
            border-radius: 50%; cursor: pointer; font-size: 20px; font-weight: bold;
        }
        .nav-btn:hover { background: #fff; }
        .prev-btn { left: 15px; }
        .next-btn { right: 15px; }

        .thumbnails { display: flex; gap: 10px; overflow-x: auto; padding: 5px; }
        .thumb { 
            width: 80px; height: 60px; object-fit: cover; border-radius: 10px; 
            cursor: pointer; opacity: 0.6; border: 2px solid transparent; 
        }
        .thumb.active { opacity: 1; border-color: var(--primary); }

        /* ИНФО КАРТОЧКА */
        .ad-info-card {
            background: var(--card-bg); padding: 25px; border-radius: 24px;
            margin-top: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .price-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .ad-price { font-size: 32px; font-weight: 800; color: var(--success); }
        .fav-btn { cursor: pointer; background: none; border: none; font-size: 24px; transition: 0.3s; }

        .ad-title { font-size: 24px; font-weight: 700; margin-bottom: 10px; }
        .meta-info { color: #888; font-size: 14px; margin-bottom: 20px; }

        /* ПАРАМЕТРЫ */
        .params-grid { 
            display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
            gap: 15px; background: rgba(0,0,0,0.03); padding: 15px; border-radius: 15px; margin-bottom: 20px;
        }
        .param-item { font-size: 15px; }

        .description { line-height: 1.6; white-space: pre-line; margin-bottom: 30px; }

        /* КНОПКА СВЯЗИ */
        .contact-box {
            position: sticky; bottom: 20px; background: var(--card-bg);
            padding: 15px; border-radius: 20px; box-shadow: 0 -5px 20px rgba(0,0,0,0.1);
            display: flex; gap: 10px; z-index: 100;
        }
        .btn-call {
            flex: 1; background: var(--success); color: white; border: none;
            padding: 18px; border-radius: 15px; font-size: 18px; font-weight: 700;
            cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 10px;
        }

        /* ПОХОЖИЕ */
        .similar-section { margin-top: 40px; }
        .similar-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 15px; margin-top: 15px; }

        @media (max-width: 600px) {
            .container { padding: 10px; }
            .ad-price { font-size: 26px; }
        }
    </style>
</head>
<body>

<header style="background:var(--card-bg); padding: 15px; border-bottom: 1px solid rgba(0,0,0,0.05);">
    <div style="max-width:1000px; margin:0 auto; display:flex; align-items:center; gap:15px;">
        <button onclick="history.back()" style="background:none; border:none; font-size:20px; cursor:pointer;">←</button>
        <h1 onclick="location.href='index.html'" style="margin:0; font-size:20px; color:var(--primary); cursor:pointer;">Rogun<span style="color:var(--success)">.tj</span></h1>
    </div>
</header>

<main class="container">
    <div class="gallery-section">
        <div class="main-img-container">
            <img id="main-photo" src="" alt="Фото товара">
            <button class="nav-btn prev-btn" onclick="changeSlide(-1)">❮</button>
            <button class="nav-btn next-btn" onclick="changeSlide(1)">❯</button>
        </div>
        <div class="thumbnails" id="thumbnails"></div>
    </div>

    <div class="ad-info-card">
        <div class="price-row">
            <div class="ad-price" id="ad-price">... TJS</div>
            <button class="fav-btn" id="fav-btn" onclick="toggleFav()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </button>
        </div>

        <h1 class="ad-title" id="ad-title">Загрузка...</h1>
        <div class="meta-info">
            <span id="ad-region">📍 Рогун</span> • <span id="ad-date">Сегодня</span>
        </div>

        <div class="params-grid" id="ad-params">
            </div>

        <h3 style="margin-bottom: 10px;">Описание</h3>
        <div class="description" id="ad-description">
            Загрузка описания...
        </div>
    </div>

    <section class="similar-section" id="similar-section" style="display:none;">
        <h3 style="margin-bottom:15px;">Похожие объявления</h3>
        <div class="similar-grid" id="similar-ads-list"></div>
    </section>
</main>

<div class="contact-box">
    <button class="btn-call" id="show-phone-btn" onclick="revealPhone()">
        <span>📞</span> <span id="phone-text">Показать номер</span>
    </button>
</div>

<script type="module" src="js/detail.js"></script>

</body>
</html>