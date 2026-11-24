// Страница «Заказы»: список заказов, просмотр, редактирование и удаление.

let orders = [];
let currentOrderId = null;

function escapeHtml(value) {
    return String(value === undefined || value === null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function normalizeDate(value) {
    return new Date(String(value).replace(' ', 'T'));
}

function formatDate(value) {
    const date = normalizeDate(value);

    if (isNaN(date.getTime())) {
        return String(value || '');
    }

    const pad = number => String(number).padStart(2, '0');

    return pad(date.getDate()) + '.' + pad(date.getMonth() + 1) + '.' + date.getFullYear() +
        ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
}

function formatTime(value) {
    return String(value || '').slice(0, 5);
}

function getDishById(id) {
    return dishes.find(dish => Number(dish.id) === Number(id));
}

function getOrderItems(order) {
    return CATEGORY_ORDER
        .map(function (category) {
            const id = order[ORDER_FIELDS[category]];
            return id ? getDishById(id) : null;
        })
        .filter(Boolean);
}

function getOrderTotal(order) {
    return getOrderItems(order).reduce(function (sum, dish) {
        return sum + dish.price;
    }, 0);
}

function getDeliveryText(order) {
    if (order.delivery_type === 'by_time') {
        return formatTime(order.delivery_time);
    }

    return 'Как можно скорее (с 7:00 до 23:00)';
}

function getOrder(id) {
    return orders.find(order => Number(order.id) === Number(id));
}

// ===== Список заказов =====
function createOrderRow(order, number) {
    const tr = document.createElement('tr');
    tr.dataset.id = order.id;

    const composition = getOrderItems(order).map(dish => dish.name).join(', ');

    tr.innerHTML =
        '<td class="orders__td">' + number + '</td>' +
        '<td class="orders__td">' + formatDate(order.created_at) + '</td>' +
        '<td class="orders__td">' + escapeHtml(composition) + '</td>' +
        '<td class="orders__td">' + getOrderTotal(order) + '&#8381;</td>' +
        '<td class="orders__td">' + escapeHtml(getDeliveryText(order)) + '</td>' +
        '<td class="orders__td orders__actions">' +
        '<button class="orders__action" type="button" data-action="view">Подробнее</button>' +
        '<button class="orders__action" type="button" data-action="edit">Редактирование</button>' +
        '<button class="orders__action" type="button" data-action="delete">Удаление</button>' +
        '</td>';

    return tr;
}

function renderOrders() {
    const tbody = document.getElementById('orders-body');
    const empty = document.getElementById('orders-empty');
    const table = document.getElementById('orders-table');

    tbody.innerHTML = '';

    if (orders.length === 0) {
        empty.hidden = false;
        table.hidden = true;
        return;
    }

    empty.hidden = true;
    table.hidden = false;

    orders.forEach(function (order, index) {
        tbody.append(createOrderRow(order, index + 1));
    });
}

function sortOrders() {
    orders.sort(function (a, b) {
        return normalizeDate(b.created_at) - normalizeDate(a.created_at);
    });
}

// ===== Модальные окна =====
function openModal(id) {
    document.getElementById(id).hidden = false;
}

function closeModal(id) {
    document.getElementById(id).hidden = true;
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(function (modal) {
        modal.hidden = true;
    });
}

function fillComposition(container, order) {
    container.innerHTML = getOrderItems(order).map(function (dish) {
        return '<p class="modal__row">' +
            '<span class="modal__label">' + CATEGORY_LABELS[dish.category] + '</span>' +
            '<span class="modal__value">' + escapeHtml(dish.name) + ' (' + dish.price + '&#8381;)</span>' +
            '</p>';
    }).join('');
}

function openViewModal(order) {
    const body = document.getElementById('view-body');

    body.innerHTML =
        '<p class="modal__row"><span class="modal__label">Дата оформления</span>' +
        '<span class="modal__value">' + formatDate(order.created_at) + '</span></p>' +
        '<h4 class="modal__subtitle">Доставка</h4>' +
        '<p class="modal__row"><span class="modal__label">Имя получателя</span>' +
        '<span class="modal__value">' + escapeHtml(order.full_name) + '</span></p>' +
        '<p class="modal__row"><span class="modal__label">Адрес доставки</span>' +
        '<span class="modal__value">' + escapeHtml(order.delivery_address) + '</span></p>' +
        '<p class="modal__row"><span class="modal__label">Время доставки</span>' +
        '<span class="modal__value">' + escapeHtml(getDeliveryText(order)) + '</span></p>' +
        '<p class="modal__row"><span class="modal__label">Телефон</span>' +
        '<span class="modal__value">' + escapeHtml(order.phone) + '</span></p>' +
        '<p class="modal__row"><span class="modal__label">Email</span>' +
        '<span class="modal__value">' + escapeHtml(order.email) + '</span></p>' +
        '<h4 class="modal__subtitle">Комментарий</h4>' +
        '<p class="modal__text">' + escapeHtml(order.comment || '—') + '</p>' +
        '<h4 class="modal__subtitle">Состав заказа</h4>' +
        '<div id="view-composition"></div>' +
        '<p class="modal__total">Стоимость: ' + getOrderTotal(order) + '&#8381;</p>';

    fillComposition(document.getElementById('view-composition'), order);

    openModal('modal-view');
}

function openEditModal(order) {
    const form = document.getElementById('edit-form');

    currentOrderId = order.id;

    document.getElementById('edit-date').textContent = formatDate(order.created_at);
    form.elements.full_name.value = order.full_name || '';
    form.elements.delivery_address.value = order.delivery_address || '';
    form.elements.phone.value = order.phone || '';
    form.elements.email.value = order.email || '';
    form.elements.comment.value = order.comment || '';
    form.elements.delivery_time.value = formatTime(order.delivery_time);
    form.elements.delivery_type.value = order.delivery_type || 'now';

    fillComposition(document.getElementById('edit-composition'), order);

    openModal('modal-edit');
}

function openDeleteModal(order) {
    currentOrderId = order.id;
    openModal('modal-delete');
}

// ===== Отправка изменений =====
async function saveOrderChanges(event) {
    event.preventDefault();

    const form = document.getElementById('edit-form');
    const order = getOrder(currentOrderId);

    if (!order) {
        return;
    }

    const data = {
        full_name: form.elements.full_name.value.trim(),
        email: form.elements.email.value.trim(),
        phone: form.elements.phone.value.trim(),
        delivery_address: form.elements.delivery_address.value.trim(),
        delivery_type: form.elements.delivery_type.value,
        comment: form.elements.comment.value.trim()
    };

    if (data.delivery_type === 'by_time') {
        data.delivery_time = form.elements.delivery_time.value;
    }

    try {
        const updated = await updateOrder(order.id, data);

        Object.assign(order, data, updated || {});

        closeAllModals();
        renderOrders();
        showNotification('Заказ успешно изменён');
    } catch (error) {
        showNotification('Не удалось изменить заказ: ' + error.message);
    }
}

async function confirmDelete() {
    try {
        await deleteOrder(currentOrderId);

        orders = orders.filter(function (order) {
            return Number(order.id) !== Number(currentOrderId);
        });

        closeAllModals();
        renderOrders();
        showNotification('Заказ успешно удалён');
    } catch (error) {
        showNotification('Не удалось удалить заказ: ' + error.message);
    }
}

// ===== Инициализация =====
document.addEventListener('click', function (event) {
    const closeButton = event.target.closest('[data-close]');

    if (closeButton) {
        closeButton.closest('.modal').hidden = true;
        return;
    }

    if (event.target.classList.contains('modal')) {
        event.target.hidden = true;
        return;
    }

    const actionButton = event.target.closest('.orders__action');

    if (!actionButton) {
        return;
    }

    const row = actionButton.closest('tr');
    const order = getOrder(row.dataset.id);

    if (!order) {
        return;
    }

    if (actionButton.dataset.action === 'view') {
        openViewModal(order);
    } else if (actionButton.dataset.action === 'edit') {
        openEditModal(order);
    } else if (actionButton.dataset.action === 'delete') {
        openDeleteModal(order);
    }
});

document.getElementById('edit-form').addEventListener('submit', saveOrderChanges);
document.getElementById('delete-confirm').addEventListener('click', confirmDelete);

async function initOrdersPage() {
    await loadDishes();

    try {
        orders = await getOrders();
    } catch (error) {
        orders = [];
        showNotification('Не удалось загрузить заказы: ' + error.message);
    }

    sortOrders();
    renderOrders();
}

initOrdersPage();
