document.addEventListener('DOMContentLoaded', function () {

    // Navbar Shrink & Active State on Scroll
    const navbar = document.getElementById('mainNav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', function () {
        // Add shadow/background to navbar on scroll
        if (window.scrollY > 50) {
            navbar.classList.add('shadow', 'bg-white');
        } else {
            navbar.classList.remove('shadow');
        }

        // Active link switching
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // Smooth Scrolling & Mobile Menu Close
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            const navbarHeight = navbar.offsetHeight;

            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - navbarHeight + 5, // Offset for fixed navbar
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                const navbarToggler = document.querySelector('.navbar-toggler');
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (window.getComputedStyle(navbarToggler).display !== 'none' && navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            }
        });
    });

    // Appointment Form Validation & Submission
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (this.checkValidity()) {
                // Simulate form submission
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;

                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';

                setTimeout(() => {
                    // Reset form
                    this.reset();
                    this.classList.remove('was-validated');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;

                    // Show "Graduate" Modal styled with Bootstrap
                    const graduateModal = new bootstrap.Modal(document.getElementById('graduateModal'));
                    graduateModal.show();

                    // Original success alert removed in favor of modal
                    // const successAlert = document.getElementById('bookingSuccess');
                    // successAlert.classList.remove('d-none');
                    // setTimeout(() => { successAlert.classList.add('d-none'); }, 5000);

                }, 1500); // Simulate network delay
            }

            this.classList.add('was-validated');
        }, false);
    }
});
