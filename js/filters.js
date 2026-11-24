// Фильтрация блюд внутри каждой категории.

function resetFilters(container) {
    container.querySelectorAll('.filters__button').forEach(button => {
        button.classList.remove('active');
    });

    container.querySelectorAll('.dish').forEach(card => {
        card.hidden = false;
    });
}

document.addEventListener('click', function (event) {
    const button = event.target.closest('.filters__button');

    if (!button) {
        return;
    }

    const section = button.closest('.menu-section');
    const kind = button.dataset.kind;
    const isActive = button.classList.contains('active');

    // сбрасываем фильтры этой категории
    section.querySelectorAll('.filters__button').forEach(item => {
        item.classList.remove('active');
    });

    section.querySelectorAll('.dish').forEach(card => {
        card.hidden = false;
    });

    // повторный клик по активному фильтру снимает фильтрацию
    if (isActive) {
        return;
    }

    button.classList.add('active');

    section.querySelectorAll('.dish').forEach(card => {
        card.hidden = card.dataset.kind !== kind;
    });
});
