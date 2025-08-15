// Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });

        // Form submission
        document.getElementById('wishForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const sibling = document.getElementById('sibling').value;
            
            alert(`Thank you ${name}! Your Rakhi wishes for ${sibling} have been sent. ❤️`);
            
            // Reset form
            this.reset();
        });

        // Animation for message cards on scroll
        document.addEventListener('DOMContentLoaded', function() {
            const cards = document.querySelectorAll('.message-card');
            
            cards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            });
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, { threshold: 0.1 });
            
            cards.forEach(card => {
                observer.observe(card);
            });
            
            // Floating rakhis animation
            const rakhis = document.querySelectorAll('.rakhi-floating');
            rakhis.forEach((rakhi, index) => {
                rakhi.style.animation = `float ${6 + index}s ease-in-out infinite`;
            });
        });