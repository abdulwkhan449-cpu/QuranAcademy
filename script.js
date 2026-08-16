document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ===== HAMBURGER MENU =====
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainNav = document.getElementById('mainNav');

    function toggleMenu() {
        const isOpen = mainNav.classList.toggle('open');
        hamburgerBtn.classList.toggle('active');
        hamburgerBtn.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', toggleMenu);
        mainNav.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                if (mainNav.classList.contains('open')) {
                    toggleMenu();
                }
            });
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mainNav.classList.contains('open')) {
                toggleMenu();
            }
        });
    }

    // ===== SCROLL REVEAL =====
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function(el) {
        revealObserver.observe(el);
    });

    // ===== ACTIVE NAV =====
    const navLinks = mainNav ? mainNav.querySelectorAll('a[href^="#"]') : [];
    const sections = [];
    navLinks.forEach(function(link) {
        const targetId = link.getAttribute('href');
        if (targetId && targetId !== '#') {
            const el = document.querySelector(targetId);
            if (el) sections.push({ id: targetId, el: el, link: link });
        }
    });

    function updateActiveNav() {
        let current = '';
        const scrollY = window.scrollY + 140;
        sections.forEach(function(item) {
            const top = item.el.offsetTop;
            const height = item.el.offsetHeight;
            if (scrollY >= top && scrollY < top + height) {
                current = item.id;
            }
        });
        sections.forEach(function(item) {
            item.link.classList.toggle('active', item.id === current);
        });
    }

    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (!scrollTimeout) {
            scrollTimeout = requestAnimationFrame(function() {
                updateActiveNav();
                scrollTimeout = null;
            });
        }
    });
    setTimeout(updateActiveNav, 200);

    // ===== FAQ ACCORDION =====
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function(item) {
        const btn = item.querySelector('.faq-question');
        if (!btn) return;
        btn.addEventListener('click', function() {
            const isOpen = item.classList.toggle('open');
            btn.setAttribute('aria-expanded', isOpen);
            faqItems.forEach(function(other) {
                if (other !== item && other.classList.contains('open')) {
                    other.classList.remove('open');
                    other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                }
            });
        });
    });

    // ===== FORM HELPERS =====
    function getVal(id) { return document.getElementById(id)?.value?.trim() || ''; }

    function setError(id, show) {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('visible', show);
    }

    function showSuccess(id) {
        const el = document.getElementById(id);
        if (el) el.classList.add('visible');
    }

    function hideSuccess(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('visible');
    }

    function showErrorMsg(id) {
        const el = document.getElementById(id);
        if (el) el.classList.add('visible');
    }

    function hideErrorMsg(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('visible');
    }

    function resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) form.reset();
    }

    // ===== TRIAL FORM =====
    const trialForm = document.getElementById('trialForm');
    if (trialForm) {
        trialForm.addEventListener('submit', function(e) {
            e.preventDefault();
            hideSuccess('trialFormSuccess');
            hideErrorMsg('trialFormError');
            ['trialNameError', 'trialEmailError', 'trialPhoneError', 'trialCourseError']
                .forEach(function(id) { setError(id, false); });

            const name = getVal('trialName');
            const parent = getVal('trialParent');
            const email = getVal('trialEmail');
            const phone = getVal('trialPhone');
            const country = getVal('trialCountry');
            const age = getVal('trialAge');
            const course = getVal('trialCourse');
            const time = getVal('trialTime');
            const message = getVal('trialMessage');

            let valid = true;
            if (!name || name.length < 2) { setError('trialNameError', true);
                valid = false; }
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('trialEmailError', true);
                valid = false; }
            if (!phone || phone.length < 6) { setError('trialPhoneError', true);
                valid = false; }
            if (!course) { setError('trialCourseError', true);
                valid = false; }
            if (!valid) return;

            const btn = document.getElementById('trialSubmitBtn');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Submitting...';

            fetch('/api/trial', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, parent, email, phone, country, age, course, time, message })
                })
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    if (data.success) {
                        showSuccess('trialFormSuccess');
                        resetForm('trialForm');
                    } else {
                        showErrorMsg('trialFormError');
                    }
                })
                .catch(function() { showErrorMsg('trialFormError'); })
                .finally(function() {
                    btn.disabled = false;
                    btn.textContent = originalText;
                });
        });
    }

    // ===== STATS COUNTER =====
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length) {
        const statObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseFloat(el.getAttribute('data-count'));
                    let current = 0;
                    const duration = 2000;
                    const startTime = performance.now();

                    function updateCounter(time) {
                        const elapsed = time - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const ease = 1 - Math.pow(1 - progress, 3);
                        current = target * ease;
                        if (Number.isInteger(target)) {
                            el.textContent = Math.floor(current);
                        } else {
                            el.textContent = current.toFixed(1);
                        }
                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        } else {
                            el.textContent = target;
                        }
                    }
                    requestAnimationFrame(updateCounter);
                    statObserver.unobserve(el);
                }
            });
        }, { threshold: 0.3 });

        statNumbers.forEach(function(num) {
            statObserver.observe(num);
        });
    }

    // ===== BLOG READ MORE =====
    document.querySelectorAll('.blog-card .read-more').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            alert('📖 Full article coming soon! Stay tuned for insightful content.');
        });
    });

    document.querySelector('.blog .btn-outline')?.addEventListener('click', function(e) {
        e.preventDefault();
        alert('📚 All articles will be available soon. Check back for new content!');
    });

    // ===== SMOOTH FOOTER LINKS =====
    document.querySelectorAll('.footer a[href^="#"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            const targetId = link.getAttribute('href');
            if (targetId && targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // ===== KEYBOARD TRAP =====
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab' && mainNav && mainNav.classList.contains('open')) {
            const focusable = mainNav.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    console.log('✅ The Insight Quran Academy — premium layout applied.');
});