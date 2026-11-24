// Загрузка данных о блюдах.
// Данные приходят с сервера в формате JSON.
// Если сервер недоступен, используются локальные данные из data/dishes.json,
// чтобы страницу можно было открыть без сети.

const DISHES_API_URL = 'https://amd.dedyn.io:15243/labs/api/dishes';
const DISHES_REQUEST_TIMEOUT = 4000;

let dishes = [];

async function loadDishes() {
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), DISHES_REQUEST_TIMEOUT);

        let response;

        try {
            response = await fetch(DISHES_API_URL, { signal: controller.signal });
        } finally {
            clearTimeout(timer);
        }

        if (!response.ok) {
            throw new Error('Сервер вернул статус ' + response.status);
        }

        dishes = await response.json();
    } catch (error) {
        console.warn('Не удалось загрузить блюда через API, используются локальные данные:', error);

        const response = await fetch('data/dishes.json');
        dishes = await response.json();
    }

    return dishes;
}
