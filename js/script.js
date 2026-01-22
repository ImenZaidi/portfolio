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

    // Download CV as PDF
    const downloadCvBtn = document.getElementById('download-cv');
    if (downloadCvBtn) {
        downloadCvBtn.addEventListener('click', function (e) {
            e.preventDefault();
            
            // Check if html2pdf is available
            if (typeof html2pdf === 'undefined') {
                alert('PDF generation library is not loaded. Please refresh the page.');
                return;
            }
            
            const cvContent = document.getElementById('cv-content');
            if (!cvContent) {
                console.error('CV content not found');
                alert('CV content not found. Please check the page.');
                return;
            }

            // Show loading state
            const originalText = this.innerHTML;
            this.disabled = true;
            this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...';

            // Clone the CV content for PDF generation
            const cvClone = cvContent.cloneNode(true);
            cvClone.id = 'cv-content-clone';
            cvClone.style.display = 'block';
            cvClone.style.position = 'absolute';
            cvClone.style.left = '0';
            cvClone.style.top = '0';
            cvClone.style.width = '800px';
            cvClone.style.maxWidth = '800px';
            cvClone.style.background = 'white';
            cvClone.style.zIndex = '9999';
            cvClone.style.padding = '0';
            cvClone.style.margin = '0';
            cvClone.style.overflow = 'visible';
            
            // Append clone to body so Bootstrap grid works properly
            document.body.appendChild(cvClone);

            // Force a reflow to ensure styles are applied
            cvClone.offsetHeight;

            // Wait for clone to be in DOM and styles to apply
            setTimeout(() => {
                // Convert all images to data URLs to avoid CORS/tainted canvas issues
                const images = cvClone.querySelectorAll('img');
                const imagePromises = Array.from(images).map(img => {
                    return new Promise((resolve) => {
                        const imgSrc = img.src || img.getAttribute('src');
                        if (!imgSrc) {
                            resolve();
                            return;
                        }

                        // If already a data URL, skip conversion
                        if (imgSrc.startsWith('data:')) {
                            resolve();
                            return;
                        }

                        // Check if we're in file:// protocol (local testing only)
                        const isFileProtocol = window.location.protocol === 'file:';
                        
                        // For file:// protocol (local testing), show placeholder
                        // On GitHub Pages (https://), fetch will work fine with relative URLs
                        if (isFileProtocol) {
                            console.warn('File:// protocol detected (local testing). Image will show as placeholder. On GitHub Pages (https://), images will work normally.');
                            const placeholder = document.createElement('div');
                            placeholder.style.width = img.width || '120px';
                            placeholder.style.height = img.height || '120px';
                            placeholder.style.backgroundColor = '#e9ecef';
                            placeholder.style.borderRadius = '50%';
                            placeholder.style.display = 'inline-block';
                            placeholder.style.border = '2px solid #dee2e6';
                            if (img.parentNode) {
                                img.parentNode.replaceChild(placeholder, img);
                            }
                            resolve();
                            return;
                        }
                        
                        // For http/https (GitHub Pages), use fetch to convert image to data URL
                        fetch(imgSrc)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Failed to fetch image');
                                }
                                return response.blob();
                            })
                            .then(blob => {
                                return new Promise((resolveBlob) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        img.src = reader.result;
                                        resolveBlob();
                                    };
                                    reader.onerror = () => {
                                        console.warn('Failed to read image blob');
                                        // Remove image if we can't convert it
                                        img.style.display = 'none';
                                        resolveBlob();
                                    };
                                    reader.readAsDataURL(blob);
                                });
                            })
                            .then(() => {
                                resolve();
                            })
                            .catch(error => {
                                console.warn('Failed to fetch image as blob, removing image to avoid tainted canvas:', error);
                                // If we can't fetch the image, remove it entirely to prevent tainted canvas
                                // Replace with a placeholder div to maintain layout
                                const placeholder = document.createElement('div');
                                placeholder.style.width = img.width || '120px';
                                placeholder.style.height = img.height || '120px';
                                placeholder.style.backgroundColor = '#f0f0f0';
                                placeholder.style.borderRadius = '50%';
                                placeholder.style.display = 'inline-block';
                                if (img.parentNode) {
                                    img.parentNode.replaceChild(placeholder, img);
                                } else {
                                    img.remove();
                                }
                                resolve();
                            });
                    });
                });

                Promise.all(imagePromises).then(() => {
                    // Final check: remove any images that are still not data URLs to prevent tainted canvas
                    const remainingImages = cvClone.querySelectorAll('img');
                    
                    remainingImages.forEach(img => {
                        const imgSrc = img.src || img.getAttribute('src') || '';
                        // Remove any images that couldn't be converted to data URLs
                        // This should only happen if fetch failed (e.g., 404, network error)
                        if (imgSrc && !imgSrc.startsWith('data:')) {
                            console.warn('Removing image that could not be converted to data URL:', imgSrc);
                            const placeholder = document.createElement('div');
                            placeholder.style.width = img.width || '120px';
                            placeholder.style.height = img.height || '120px';
                            placeholder.style.backgroundColor = '#e9ecef';
                            placeholder.style.borderRadius = '50%';
                            placeholder.style.display = 'inline-block';
                            placeholder.style.border = '2px solid #dee2e6';
                            if (img.parentNode) {
                                img.parentNode.replaceChild(placeholder, img);
                            } else {
                                img.remove();
                            }
                        }
                    });
                    
                    // Small delay to ensure everything is rendered
                    setTimeout(() => {
                        // Verify content exists and has height
                        if (!cvClone || cvClone.scrollHeight === 0) {
                            console.error('CV content is empty or has no height');
                            if (cvClone.parentNode) {
                                cvClone.parentNode.removeChild(cvClone);
                            }
                            alert('Error: CV content is empty. Please check the content.');
                            this.disabled = false;
                            this.innerHTML = originalText;
                            return;
                        }

                        // Configure PDF options
                        const opt = {
                            margin: [10, 10, 10, 10],
                            filename: 'Imen_Zaidi_CV.pdf',
                            image: { type: 'jpeg', quality: 0.98 },
                            html2canvas: { 
                                scale: 2,
                                useCORS: false,
                                allowTaint: false, // No tainted canvas since we removed file:// images
                                logging: false,
                                width: cvClone.scrollWidth || 800,
                                height: cvClone.scrollHeight,
                                windowWidth: cvClone.scrollWidth || 800,
                                windowHeight: cvClone.scrollHeight,
                                x: 0,
                                y: 0,
                                scrollX: 0,
                                scrollY: 0,
                                backgroundColor: '#ffffff',
                                removeContainer: true
                            },
                            jsPDF: { 
                                unit: 'mm', 
                                format: 'a4', 
                                orientation: 'portrait' 
                            },
                            pagebreak: { 
                                mode: ['avoid-all', 'css', 'legacy'],
                                before: '.row',
                                after: '.row',
                                avoid: ['.row', 'h6', 'h1', 'h4']
                            }
                        };

                        // Generate and download PDF
                        html2pdf().set(opt).from(cvClone).save().then(() => {
                            // Remove clone from DOM
                            if (cvClone.parentNode) {
                                cvClone.parentNode.removeChild(cvClone);
                            }
                            
                            // Reset button state
                            this.disabled = false;
                            this.innerHTML = originalText;
                        }).catch((error) => {
                            console.error('Error generating PDF:', error);
                            // Remove clone from DOM even on error
                            if (cvClone.parentNode) {
                                cvClone.parentNode.removeChild(cvClone);
                            }
                            
                            alert('Error generating PDF: ' + (error.message || 'Unknown error'));
                            this.disabled = false;
                            this.innerHTML = originalText;
                        });
                    }, 100);
                });
            }, 300);
        });
    }
});
