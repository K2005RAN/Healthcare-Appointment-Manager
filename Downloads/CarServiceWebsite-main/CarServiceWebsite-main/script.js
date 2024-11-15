document.addEventListener('DOMContentLoaded', () => {
    const dropdowns = document.querySelectorAll('.nav-item');
    
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('mouseenter', () => {
            dropdown.querySelector('.dropdown-content').style.display = 'block';
        });
        
        dropdown.addEventListener('mouseleave', () => {
            timer = setTimeout(() => {
                dropdown.querySelector('.dropdown-content').style.display = 'none';
            }, 100); // Adds a slight delay before hiding the dropdown
        });
    });
});