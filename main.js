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

  if (video && !isMobile) {
    // Dynamically assign source only on desktop to prevent mobile from loading the video
    video.src = 'assets/hero.mp4';
    video.load();

    // Hide loader once video starts playing
    if (video.readyState >= 3) {
      hideLoader();
    } else {
      video.addEventListener('canplaythrough', hideLoader);
      video.addEventListener('loadeddata', hideLoader);
      // Fallback timeout in case video loading is slow/blocked
      setTimeout(hideLoader, 4000);
    }

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
          if (!hasEnded) {
            video.play().catch(err => {
              console.log("Autoplay prevented or interrupted:", err);
            });
          } else {
            video.pause();
            video.currentTime = Math.max(0, video.duration - 0.001);
          }
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.1 });

    videoObserver.observe(video);

  } else {
    console.log('Mobile view detected');
    if (video) {
      console.log('Setting mobile video source');
      video.src = 'assets/mobile.mp4';
      video.poster = 'assets/mobile-view.png';
      video.load();
    }
    // Hide loader once mobile video is ready and start playback
    if (video && video.readyState >= 3) {
      console.log('Mobile video ready, hiding loader and playing');
      hideLoader();
      video.play().catch(err => console.log('Autoplay prevented:', err));
    } else if (video) {
      console.log('Waiting for mobile video events');
      video.addEventListener('canplaythrough', () => {
        console.log('Mobile video canplaythrough');
        hideLoader();
        video.play().catch(err => console.log('Autoplay prevented:', err));
      });
      video.addEventListener('loadeddata', () => {
        console.log('Mobile video loadeddata');
        hideLoader();
        video.play().catch(err => console.log('Autoplay prevented:', err));
      });
      // Fallback timeout
      setTimeout(() => {
        console.log('Mobile video fallback timeout');
        hideLoader();
        video.play().catch(err => console.log('Autoplay prevented:', err));
      }, 4000);
    } else {
      // No video element fallback
      console.log('No video element fallback');
      window.addEventListener('load', hideLoader);
      setTimeout(hideLoader, 1500);
    }
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
});
