document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     HERO VIDEO & CURSOR BEHAVIOR
     ========================================================================== */
  const video = document.getElementById('hero-video');
  const loader = document.getElementById('loader');
  
  const eyebrowEl = document.querySelector('.hero-content .eyebrow');
  const headingEl = document.querySelector('.hero-content h1');
  const taglineEl = document.querySelector('.hero-content .tagline');

  // Keep original texts to type out
  const eyebrowText = eyebrowEl ? eyebrowEl.textContent.trim() : "Software Engineer";
  const taglineText = taglineEl ? taglineEl.textContent.trim() : "Java · Spring Boot · Fintech Solutions";
  const line1Text = "Thanuja";
  const line2Text = "Lakshitha";

  // Initially clear text content to prepare for typing effect
  if (eyebrowEl) eyebrowEl.textContent = '';
  if (headingEl) headingEl.innerHTML = '';
  if (taglineEl) taglineEl.textContent = '';

  let hasEnded = false;
  let loaderHidden = false;

  // Detect mobile view (screen width <= 768px)
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  const typeText = (element, text, speed, callback) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
      } else {
        clearInterval(interval);
        if (callback) callback();
      }
    }, speed);
  };

  const typeHeading = (element, line1, line2, speed, callback) => {
    let index = 0;
    const fullText = line1 + "\n" + line2;
    let currentHTML = "";
    const interval = setInterval(() => {
      if (index < fullText.length) {
        const char = fullText.charAt(index);
        if (char === "\n") {
          currentHTML += "<br>";
        } else {
          currentHTML += char;
        }
        element.innerHTML = currentHTML + '<span class="cursor">_</span>';
        index++;
      } else {
        clearInterval(interval);
        if (callback) callback();
      }
    }, speed);
  };

  const startTyping = () => {
    if (eyebrowEl) {
      typeText(eyebrowEl, eyebrowText, 40, () => {
        if (headingEl) {
          typeHeading(headingEl, line1Text, line2Text, 70, () => {
            if (taglineEl) {
              typeText(taglineEl, taglineText, 30, () => {
                // Keep cursor blinking after typing finishes
                const finalCursor = headingEl.querySelector('span.cursor');
                if (finalCursor) {
                  finalCursor.style.animation = 'blink 1s step-end infinite';
                }
              });
            }
          });
        }
      });
    }
  };

  const hideLoader = () => {
    if (loaderHidden) return;
    loaderHidden = true;
    if (loader) {
      loader.classList.add('fade-out');
      // Start typing animation after the loader fade-out transition (600ms)
      setTimeout(startTyping, 600);
    } else {
      startTyping();
    }
  };

  /* ==========================================================================
     HERO VIDEO & ADAPTIVE STREAMING (OPTIMIZED FOR WEAK CONNECTIVITY)
     ========================================================================== */
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSaveData = connection ? connection.saveData : false;
  const isSlowNetwork = connection ? (/2g|3g/.test(connection.effectiveType) || isSaveData) : false;
  const isUltraSlow = connection ? (/slow-2g|2g/.test(connection.effectiveType) || isSaveData) : false;

  const posterSrc = isMobile ? 'assets/hero-poster-mobile.webp' : 'assets/hero-poster.webp';

  const triggerReveal = () => {
    hideLoader();
    if (video && video.paused && !hasEnded && video.src) {
      video.play().catch(() => {});
    }
  };

  if (video) {
    video.poster = posterSrc;

    // Adaptive source selection:
    // - On ultra-slow / data-saver: show crisp WebP poster, avoid heavy video downloads
    // - On mobile or slow desktop (3G): stream mobile.mp4 (5.1MB, saves ~3.8MB)
    // - On fast desktop (4G/broadband): stream hero.mp4 (8.9MB)
    if (!isUltraSlow) {
      const selectedSrc = (isMobile || isSlowNetwork) ? 'assets/mobile.mp4' : 'assets/hero.mp4';
      video.src = selectedSrc;
      video.load();

      // Reveal as soon as first frame is decoded (loadeddata / readyState >= 2)
      // Never block on canplaythrough on weak connections!
      if (video.readyState >= 2) {
        triggerReveal();
      } else {
        video.addEventListener('loadeddata', triggerReveal, { once: true });
        video.addEventListener('canplay', triggerReveal, { once: true });
      }
    } else {
      console.log('Data-saver or 2G network: serving optimized poster without video download.');
      setTimeout(hideLoader, 500);
    }

    // Safety fallback timeout: reveal page within 1200ms max so weak networks never stall on loader
    setTimeout(hideLoader, 1200);

    // Freeze video on the last frame
    video.addEventListener('ended', () => {
      hasEnded = true;
      video.currentTime = Math.max(0, video.duration - 0.001);
      video.pause();
    });

    // Prevent video from restarting if it already ended
    video.addEventListener('play', () => {
      if (hasEnded) {
        video.pause();
        video.currentTime = Math.max(0, video.duration - 0.001);
      }
    });

    // Control playback explicitly when scrolling in/out of view
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!hasEnded && video.src) {
            video.play().catch(err => {
              console.log("Autoplay prevented or interrupted:", err);
            });
          } else {
            video.pause();
            if (hasEnded) video.currentTime = Math.max(0, video.duration - 0.001);
          }
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.1 });

    videoObserver.observe(video);
  } else {
    window.addEventListener('load', hideLoader);
    setTimeout(hideLoader, 800);
  }

  /* ==========================================================================
     NAVBAR BACKGROUND TRANSITION
     ========================================================================== */
  const nav = document.getElementById('nav');
  const handleScroll = () => {
    if (window.scrollY > window.innerHeight * 0.7) {
      nav.classList.add('nav--solid');
    } else {
      nav.classList.remove('nav--solid');
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial check

  /* ==========================================================================
     ACTIVE NAVIGATION LINK HIGHLIGHTING
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('#nav ul li a');

  const navObserverOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px', // Trigger when section occupies the active middle portion
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, navObserverOptions);

  sections.forEach(section => {
    navObserver.observe(section);
  });

  /* ==========================================================================
     SCROLL REVEAL EFFECT
     ========================================================================== */
  const reveals = document.querySelectorAll('.reveal');
  
  const revealObserverOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px', // Trigger slightly before element enters viewport
    threshold: 0.1
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once visible, we can unobserve to prevent repeated triggers
        revealObserver.unobserve(entry.target);
      }
    });
  }, revealObserverOptions);

  reveals.forEach(reveal => {
    revealObserver.observe(reveal);
  });
  
  /* ==========================================================================
     CONSTELLATION NETWORK: CONNECTED DOTS & LINES (ALL SECTIONS EXCEPT HERO)
     ========================================================================== */
  function initConstellationNetwork() {
    const canvas = document.getElementById('constellation-canvas');
    const hero = document.getElementById('hero');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let mouseX = -9999;
    let mouseY = -9999;
    let isMouseActive = false;
    let isBelowHero = false;
    let animId = null;

    const isMobile = window.innerWidth <= 768;
    const PARTICLE_COUNT = isMobile ? 38 : 70;
    const MAX_DIST = isMobile ? 95 : 135;
    const MOUSE_DIST = isMobile ? 110 : 160;
    const particles = [];

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particles.length === 0) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            radius: Math.random() * 1.4 + 1.2
          });
        }
      }
    }

    resize();
    window.addEventListener('resize', resize);

    // Global cursor tracking
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMouseActive = true;
    });

    window.addEventListener('mouseleave', () => {
      isMouseActive = false;
      mouseX = -9999;
      mouseY = -9999;
    });

    // Touch support for mobile devices
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
        isMouseActive = true;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isMouseActive = false;
    });

    // Scroll listener: activates only below the hero section
    function checkScroll() {
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
      if (heroBottom <= window.innerHeight * 0.5) {
        if (!isBelowHero) {
          isBelowHero = true;
          canvas.classList.add('active');
          if (!animId) loop();
        }
      } else {
        if (isBelowHero) {
          isBelowHero = false;
          canvas.classList.remove('active');
        }
      }
    }

    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();

    function loop() {
      if (!isBelowHero) {
        animId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Update particle drift
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Screen wrapping for infinite smooth drift
        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        else if (p.y > height + 10) p.y = -10;
      }

      // 2. Draw lines connecting nearby dots
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.16;
            ctx.strokeStyle = `rgba(74, 222, 128, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // 3. Draw lines connecting cursor to nearby dots with subtle magnetic reaction
      if (isMouseActive && mouseX >= 0 && mouseY >= 0) {
        for (let i = 0; i < particles.length; i++) {
          const dx = particles[i].x - mouseX;
          const dy = particles[i].y - mouseY;
          const dist = Math.hypot(dx, dy);

          if (dist < MOUSE_DIST) {
            const alpha = (1 - dist / MOUSE_DIST) * 0.38;
            ctx.strokeStyle = `rgba(74, 222, 128, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();

            // Subtle gentle pull toward cursor
            const force = (1 - dist / MOUSE_DIST) * 0.015;
            particles[i].x -= dx * force;
            particles[i].y -= dy * force;
          }
        }
      }

      // 4. Draw the dots
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.fillStyle = 'rgba(74, 222, 128, 0.48)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(loop);
    }
  }

  initConstellationNetwork();
});
