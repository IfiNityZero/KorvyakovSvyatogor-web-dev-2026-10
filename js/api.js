// Работа с серверным API (https://amd.dedyn.io:15243).
// Чтобы отправлять заказы на сервер, укажите здесь свой api_key (UUID).
// Пока ключ не указан, приложение работает в демонстрационном режиме
// и хранит заказы в localStorage браузера.

const API_BASE_URL = 'https://amd.dedyn.io:15243';
const API_KEY = 'd3792683-e66e-4d04-867a-4905fa35dbf5'; // ключ пользователя (UUID); можно заменить на свой
const DEMO_ORDERS_KEY = 'foodConstructOrders';
const API_REQUEST_TIMEOUT = 8000;

const ORDER_FIELDS = {
    soup: 'soup_id',
    main_course: 'main_course_id',
    salad: 'salad_id',
    drink: 'drink_id',
    dessert: 'dessert_id'
};

function isDemoMode() {
    return API_KEY.trim() === '';
}

async function apiRequest(path, options) {
    const url = new URL(API_BASE_URL + path);
    url.searchParams.set('api_key', API_KEY);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT);

    let response;

    try {
        response = await fetch(url.toString(), Object.assign({}, options, { signal: controller.signal }));
    } catch (error) {
        throw new Error('Сервер API недоступен');
    } finally {
        clearTimeout(timer);
    }
    const data = await response.json().catch(function () {
        return {};
    });

    if (!response.ok) {
        throw new Error(data.error || 'Ошибка запроса: ' + response.status);
    }

    return data;
}

function readDemoOrders() {
    try {
        const orders = JSON.parse(localStorage.getItem(DEMO_ORDERS_KEY));
        return Array.isArray(orders) ? orders : [];
    } catch (error) {
        return [];
    }
}

function writeDemoOrders(orders) {
    localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(orders));
}

async function createOrder(order) {
    if (isDemoMode()) {
        const orders = readDemoOrders();
        const now = new Date().toISOString();
        const nextId = orders.reduce(function (max, item) {
            return Math.max(max, Number(item.id) || 0);
        }, 0) + 1;

        const created = Object.assign({}, order, {
            id: nextId,
            created_at: now,
            updated_at: now
        });

        orders.push(created);
        writeDemoOrders(orders);

        return created;
    }

    return apiRequest('/labs/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
    });
}

async function getOrders() {
    if (isDemoMode()) {
        return readDemoOrders();
    }

    return apiRequest('/labs/api/orders');
}

async function updateOrder(id, data) {
    if (isDemoMode()) {
        const orders = readDemoOrders();
        const index = orders.findIndex(function (item) {
            return Number(item.id) === Number(id);
        });

        if (index === -1) {
            throw new Error('Заказ не найден');
        }

        orders[index] = Object.assign({}, orders[index], data, {
            updated_at: new Date().toISOString()
        });

        writeDemoOrders(orders);

        return orders[index];
    }

    return apiRequest('/labs/api/orders/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

async function deleteOrder(id) {
    if (isDemoMode()) {
        const orders = readDemoOrders().filter(function (item) {
            return Number(item.id) !== Number(id);
        });

        writeDemoOrders(orders);

        return { id: id };
    }

    return apiRequest('/labs/api/orders/' + id, {
        method: 'DELETE'
    });
}
