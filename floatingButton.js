document.addEventListener('DOMContentLoaded', () => {
    const floatingButton = document.getElementById('floatingButton');
    const tooltip = floatingButton.querySelector('.tooltip');

    floatingButton.addEventListener('click', () => {
        floatingButton.classList.toggle('active');
    });

    document.addEventListener('click', (event) => {
        if (!floatingButton.contains(event.target) && floatingButton.classList.contains('active')) {
            floatingButton.classList.remove('active');
        }
    });
});
