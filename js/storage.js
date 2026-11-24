// Сохранение выбранных блюд в localStorage.
// В хранилище лежат только идентификаторы (keyword) выбранных блюд.

const ORDER_STORAGE_KEY = 'foodConstructOrder';

function readOrderFromStorage() {
    try {
        const saved = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY));
        return saved && typeof saved === 'object' ? saved : {};
    } catch (error) {
        console.warn('Не удалось прочитать заказ из localStorage:', error);
        return {};
    }
}

function saveOrderToStorage(selected) {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(selected));
}

function clearOrderStorage() {
    localStorage.removeItem(ORDER_STORAGE_KEY);
}
