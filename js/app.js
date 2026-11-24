// Точка входа страницы «Собрать ланч».

async function init() {
    await loadDishes();

    loadSelectedFromStorage();
    renderDishes();
    markSelectedCards();
    updateOrderPanel();
}

init();
