# 🌙 BroMoon — Лунный календарь для Уфы

![Версия](https://img.shields.io/badge/version-2.0-blue)
![Лицензия](https://img.shields.io/badge/license-MIT-green)
![Статус](https://img.shields.io/badge/status-active-success)

> Элегантный лунный календарь с расчетом лунных дней, фаз Луны и рекомендациями для стрижки, адаптированный для города Уфа (Россия).

[Демо сайта](https://bat801.github.io/bro-moon/) • [Сообщить о проблеме](https://github.com/bat801/bro-moon/issues)

## 📋 О проекте

**BroMoon** — это статический веб-сайт, который показывает:
- Текущий лунный день
- Фазу Луны (Новолуние, Полнолуние, Растущая/Убывающая)
- Время начала и окончания лунных суток
- Благоприятные и неблагоприятные дни для стрижки волос
- Данные для сверки с внешним источником (mirkosmosa.ru)

### Особенности

- 🎨 **Современный дизайн** — тёмная тема с неоновыми акцентами
- 📍 **Локализация** — расчеты для города Уфа (54.4847°N, 55.8825°E)
- ⏰ **Часовой пояс** — Asia/Yekaterinburg (UTC+5)
- 🔄 **Навигация** — просмотр вчерашних и завтрашних дней
- ✂️ **Рекомендации** — подробные описания для каждого лунного дня
- 🔍 **Сверка данных** — дополнительный блок с данными от mirkosmosa.ru

## 🛠️ Технологии

| Технология | Назначение |
|------------|------------|
| HTML5 | Структура страницы |
| CSS3 | Стилизация и анимации |
| JavaScript (ES6) | Логика и расчеты |
| [SunCalc](https://github.com/mourner/suncalc) | Расчет положения Луны |
| [Cloudflare Worker](https://workers.cloudflare.com) | Прокси для парсинга (опционально) |

## 📁 Структура проекта
bro-moon/
├── index.html # Главная страница
├── css/
│ └── style.css # Стили сайта
├── js/
│ ├── app.js # Основная логика приложения
│ ├── lunar-calc.js # Расчеты лунных дней и фаз
│ └── suncalc.js # Библиотека SunCalc (расчет позиции Луны)
└── README.md # Документация

> **Примечание:** Файл `lunar.js` (Lunar-Javascript) не требуется — расчеты выполняются через `lunar-calc.js` + `suncalc.js`.

## 🚀 Быстрый старт

### Локальный запуск

1. **Склонируйте репозиторий**
   ```bash
   git clone https://github.com/bat801/bro-moon.git
   cd bro-moon
Откройте в браузере

Просто дважды кликните по index.html

Или используйте Live Server в VS Code

Никаких зависимостей, сборки или npm install не требуется!

Публикация на GitHub Pages
Создайте репозиторий на GitHub (например, bro-moon)

Загрузите файлы

bash
git init
git add .
git commit -m "Initial commit: BroMoon lunar calendar"
git remote add origin https://github.com/ваш-логин/bro-moon.git
git push -u origin main
Включите GitHub Pages

Перейдите в Settings → Pages

Source: Deploy from a branch

Branch: main / (root)

Сохраните

Дождитесь публикации (обычно 1-2 минуты)

Сайт будет доступен по адресу:

text
https://ваш-логин.github.io/bro-moon/
⚙️ Настройка Cloudflare Worker (опционально)
Для блока сверки данных требуется Cloudflare Worker. Если он не настроен, блок будет показывать ошибку — это не влияет на основную функциональность.

Настройка Worker:
Зарегистрируйтесь на cloudflare.com

Перейдите в Workers & Pages → Create Worker

Вставьте код из файла worker.js (см. ниже)

Сохраните и опубликуйте

Скопируйте URL Worker (вида https://имя.аккаунт.workers.dev)

Обновите URL в js/app.js:

javascript
const VERIFY_WORKER_URL = 'https://ваш-воркер.workers.dev';
Код для Worker:
javascript
export default {
  async fetch(request) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      const response = await fetch('https://mirkosmosa.ru/lunar-calendar', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const html = await response.text();
      const regex = /<li class="moon_desc_default">(.*?)<\/li>/g;
      const lunarDays = [];
      let match;
      while ((match = regex.exec(html)) !== null) {
        let text = match[1].trim();
        if (text.includes('лунный день')) lunarDays.push(text);
      }
      
      return new Response(JSON.stringify({
        today: lunarDays[0] || 'Не найдено',
        tomorrow: lunarDays[1] || 'Не найдено',
        success: true,
        timestamp: new Date().toISOString()
      }), { headers: corsHeaders, status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), { headers: corsHeaders, status: 500 });
    }
  }
};
📊 Блок сверки данных
На сайте присутствует дополнительный блок "Сверка с mirkosmosa.ru", который:

Показывает данные с внешнего источника (mirkosmosa.ru)

Позволяет сравнить расчеты вашего календаря

Обновляется автоматически раз в 10 минут

Имеет кнопку ручного обновления (⟳)

Важно: Блок работает только при настроенном Cloudflare Worker.

📝 Рекомендации по стрижке
Для каждого лунного дня (1–30) в приложении заложены подробные описания влияния стрижки волос. Дни считаются:

Тип дня	Лунные дни
Благоприятные ✨	5, 8, 11, 13, 14, 19, 21, 22, 23, 26, 27, 28
Неблагоприятные ⚠️	Остальные дни
Карточка с рекомендацией меняет цвет в зависимости от благоприятности дня.

🌍 Координаты и часовой пояс
Параметры зафиксированы в коде:

javascript
const UFA_TZ = "Asia/Yekaterinburg";  // UTC+5
const UFA_LAT = 54.4847;               // Широта
const UFA_LON = 55.8825;               // Долгота
Для другого города измените эти значения в файле js/lunar-calc.js.

🧪 Тестирование
Локально — открыть index.html в браузере

Консоль браузера (F12) — проверить отсутствие ошибок

Адаптивность — проверить на мобильных устройствах (ширина 768px и 400px)

📦 Зависимости
Файл	Источник	Лицензия
suncalc.js	SunCalc	BSD-2-Clause
Остальной код написан специально для этого проекта.

🔧 Возможные проблемы и решения
Проблема	Решение
Блок сверки не загружается	Проверьте URL Worker и CORS настройки
Неправильный лунный день	Проверьте системную дату и часовой пояс
Не работают кнопки "Вчера/Завтра"	Проверьте консоль на наличие ошибок JavaScript
Стили не применяются	Убедитесь, что путь к style.css корректен
📄 Лицензия
MIT © bat801

👥 Автор
Лунное Братство — календарь для города Уфа

GitHub: @bat801

Проект: bro-moon

🙏 Благодарности
SunCalc — за точные астрономические расчеты

mirkosmosa.ru — за данные для сверки

Cloudflare — за бесплатный Worker для проксирования

<p align="center"> Сделано с ❤️ для жителей Уфы и всех, кто следит за Луной </p> ```
