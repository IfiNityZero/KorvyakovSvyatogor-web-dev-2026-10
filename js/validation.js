// Проверка состава заказа при отправке формы и показ уведомлений.

// Доступные комбо: суп + главное + салат + напиток,
// суп + главное + напиток, суп + салат + напиток,
// главное + салат + напиток, главное + напиток.
// Десерт можно добавить к любому заказу.

function getOrderError(selected) {
    const soup = selected.soup;
    const main = selected.main_course;
    const salad = selected.salad;
    const drink = selected.drink;

    const hasCombo =
        (soup && main && salad && drink) ||
        (soup && main && drink) ||
        (soup && salad && drink) ||
        (main && salad && drink) ||
        (main && drink);

    if (hasCombo) {
        return null;
    }

    const nothingSelected = !soup && !main && !salad && !drink;

    if (nothingSelected) {
        return selected.dessert
            ? 'Выберите главное блюдо'
            : 'Ничего не выбрано. Выберите блюда для заказа';
    }

    if (!soup && !main && salad) {
        return 'Выберите суп или главное блюдо';
    }

    if (soup && !main && !salad) {
        return 'Выберите главное блюдо/салат/стартер';
    }

    if (!soup && !main && !salad) {
        return 'Выберите главное блюдо';
    }

    return 'Выберите напиток';
}

function showNotification(text) {
    const notification = document.createElement('div');
    notification.className = 'notification';

    notification.innerHTML = `
        <div class="notification__box">
            <p class="notification__text">${text}</p>
            <button class="notification__button" type="button">Окей &#128076;</button>
        </div>
    `;

    document.body.append(notification);

    notification.querySelector('.notification__button').addEventListener('click', function () {
        notification.remove();
    });
}
