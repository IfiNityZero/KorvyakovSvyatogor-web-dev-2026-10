// Страница «Оформить заказ».

function createOrderCard(dish) {
    const card = createDishCard(dish);
    const button = card.querySelector('.dish__button');

    button.classList.add('dish__remove');
    button.textContent = 'Удалить';

    return card;
}

function renderOrderCards() {
    const container = document.getElementById('order-dishes');
    const empty = document.getElementById('order-empty');
    const content = document.getElementById('order-content');

    const chosen = CATEGORY_ORDER
        .map(function (category) {
            return selectedDishes[category] ? findDish(selectedDishes[category]) : null;
        })
        .filter(Boolean);

    container.innerHTML = '';

    chosen.forEach(function (dish) {
        container.append(createOrderCard(dish));
    });

    const isEmpty = chosen.length === 0;

    empty.hidden = !isEmpty;
    content.hidden = isEmpty;
    container.hidden = isEmpty;
}

function buildOrderPayload(form) {
    const payload = {
        full_name: form.elements.full_name.value.trim(),
        email: form.elements.email.value.trim(),
        subscribe: form.elements.subscribe.checked ? 1 : 0,
        phone: form.elements.phone.value.trim(),
        delivery_address: form.elements.delivery_address.value.trim(),
        delivery_type: form.elements.delivery_type.value,
        comment: form.elements.comment.value.trim()
    };

    if (payload.delivery_type === 'by_time') {
        payload.delivery_time = form.elements.delivery_time.value;
    }

    CATEGORY_ORDER.forEach(function (category) {
        const keyword = selectedDishes[category];

        if (keyword) {
            payload[ORDER_FIELDS[category]] = findDish(keyword).id;
        }
    });

    return payload;
}

function resetOrderPage() {
    resetSelectedDishes();
    document.getElementById('order-form').reset();
    renderOrderCards();
    updateOrderSummary();
}

async function submitOrder(form) {
    const error = getOrderError(selectedDishes);

    if (error) {
        showNotification(error);
        return;
    }

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const deliveryType = form.elements.delivery_type.value;
    const deliveryTime = form.elements.delivery_time.value;

    if (deliveryType === 'by_time' && !deliveryTime) {
        showNotification('Укажите время доставки');
        return;
    }

    try {
        await createOrder(buildOrderPayload(form));

        clearOrderStorage();
        resetOrderPage();
        showNotification('Заказ успешно оформлен');
    } catch (error) {
        showNotification('Не удалось оформить заказ: ' + error.message);
    }
}

async function initOrderPage() {
    await loadDishes();

    loadSelectedFromStorage();
    renderOrderCards();
    updateOrderSummary();

    const form = document.getElementById('order-form');

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        submitOrder(form);
    });

    document.addEventListener('click', function (event) {
        const button = event.target.closest('.dish__remove');

        if (!button) {
            return;
        }

        const card = button.closest('.dish');
        const keyword = card.dataset.dish;

        removeDish(keyword);
        card.remove();

        const container = document.getElementById('order-dishes');

        if (container.children.length === 0) {
            renderOrderCards();
        }
    });
}

initOrderPage();
