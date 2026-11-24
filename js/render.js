// Отображение блюд на странице.
// Скрипт перебирает массив dishes, создаёт карточки и добавляет их в нужные секции.

const CATEGORY_LABELS = {
    soup: 'Суп',
    main_course: 'Главное блюдо',
    salad: 'Салат/стартер',
    drink: 'Напиток',
    dessert: 'Десерт'
};

const CATEGORY_ORDER = ['soup', 'main_course', 'salad', 'drink', 'dessert'];

function createDishCard(dish) {
    const card = document.createElement('div');
    card.className = 'dish';
    card.dataset.dish = dish.keyword;
    card.dataset.kind = dish.kind;
    card.innerHTML = `
        <img class="dish__img" src="${dish.image}" width="400" height="300" alt="${dish.name}">
        <p class="dish__price">${dish.price}&#8381;</p>
        <p class="dish__name">${dish.name}</p>
        <p class="dish__count">${dish.count}</p>
        <button class="dish__button" type="button">Добавить</button>
    `;
    return card;
}

function renderDishes() {
    const containers = document.querySelectorAll('.dishes[data-category]');

    containers.forEach(function (container) {
        const category = container.dataset.category;

        // блюда каждой категории выводятся в алфавитном порядке
        const list = dishes
            .filter(dish => dish.category === category)
            .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

        container.innerHTML = '';

        list.forEach(dish => container.append(createDishCard(dish)));
    });
}

