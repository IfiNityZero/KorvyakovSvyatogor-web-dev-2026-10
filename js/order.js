// Выбор блюд, сохранение заказа и подсчёт итоговой стоимости.

const selectedDishes = {
    soup: null,
    main_course: null,
    salad: null,
    drink: null,
    dessert: null
};

function findDish(keyword) {
    return dishes.find(dish => dish.keyword === keyword);
}

function loadSelectedFromStorage() {
    const saved = readOrderFromStorage();

    CATEGORY_ORDER.forEach(function (category) {
        selectedDishes[category] = saved[category] || null;
    });
}

function resetSelectedDishes() {
    CATEGORY_ORDER.forEach(function (category) {
        selectedDishes[category] = null;
    });
}

function getOrderTotal() {
    return CATEGORY_ORDER.reduce(function (sum, category) {
        const dish = selectedDishes[category] ? findDish(selectedDishes[category]) : null;
        return sum + (dish ? dish.price : 0);
    }, 0);
}

function markSelectedCards() {
    document.querySelectorAll('.dish[data-dish]').forEach(function (card) {
        const dish = findDish(card.dataset.dish);

        if (!dish) {
            return;
        }

        card.classList.toggle('dish--selected', selectedDishes[dish.category] === dish.keyword);
    });
}

function selectDish(keyword) {
    const dish = findDish(keyword);

    if (!dish) {
        return;
    }

    selectedDishes[dish.category] = dish.keyword;
    saveOrderToStorage(selectedDishes);

    markSelectedCards();
    updateOrderPanel();
    updateOrderSummary();
}

function removeDish(keyword) {
    const dish = findDish(keyword);

    if (!dish) {
        return;
    }

    selectedDishes[dish.category] = null;
    saveOrderToStorage(selectedDishes);

    markSelectedCards();
    updateOrderPanel();
    updateOrderSummary();
}

function updateOrderPanel() {
    const panel = document.getElementById('order-panel');

    if (!panel) {
        return;
    }

    const total = getOrderTotal();
    const hasDishes = CATEGORY_ORDER.some(function (category) {
        return Boolean(selectedDishes[category]);
    });

    panel.hidden = !hasDishes;

    if (!hasDishes) {
        return;
    }

    document.getElementById('order-panel-total').textContent = total + '₽';

    const link = document.getElementById('order-panel-link');
    const isValid = getOrderError(selectedDishes) === null;

    link.classList.toggle('order-panel__link--disabled', !isValid);
    link.setAttribute('aria-disabled', String(!isValid));
}

function updateOrderSummary() {
    const summary = document.getElementById('order-summary');

    if (!summary) {
        return;
    }

    let html = '';

    CATEGORY_ORDER.forEach(function (category) {
        const keyword = selectedDishes[category];
        const dish = keyword ? findDish(keyword) : null;

        html += '<div class="order-summary__row">';
        html += '<p class="order-summary__category">' + CATEGORY_LABELS[category] + '</p>';

        if (dish) {
            html += '<p class="order-summary__value">' + dish.name + ' ' + dish.price + '&#8381;</p>';
        } else {
            const emptyText = category === 'main_course' ? 'Не выбрано' : 'Не выбран';
            html += '<p class="order-summary__value order-summary__value--empty">' + emptyText + '</p>';
        }

        html += '</div>';
    });

    html += '<div class="order-summary__row order-summary__row--total">';
    html += '<p class="order-summary__category">Стоимость заказа</p>';
    html += '<p class="order-summary__total">' + getOrderTotal() + '&#8381;</p>';
    html += '</div>';

    summary.innerHTML = html;
}

document.addEventListener('click', function (event) {
    const button = event.target.closest('.dish__button');

    if (!button || button.classList.contains('dish__remove')) {
        return;
    }

    const card = button.closest('.dish');
    selectDish(card.dataset.dish);
});
