document.addEventListener("DOMContentLoaded", function() {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    // Show the default tab on load
    document.getElementById('about').classList.add('active');
    document.querySelector('.tab[data-content="about"]').classList.add('active');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active state from previously active tab
            tabs.forEach(t => t.classList.remove('active'));

            let contentId = this.getAttribute('data-content');
            contents.forEach(content => {
                content.classList.remove('active');
            });

            // Show selected content and highlight active tab
            document.getElementById(contentId).classList.add('active');
            this.classList.add('active');
        });
    });
});
