document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     HERO VIDEO & CURSOR BEHAVIOR
     ========================================================================== */
  const video = document.getElementById('hero-video');
  const cursor = document.querySelector('.hero-content h1 span.cursor');
  let hasEnded = false;

  // Detect mobile view (screen width <= 768px)
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (video && !isMobile) {
    // Dynamically assign source only on desktop to prevent mobile from loading the video
    video.src = 'assets/hero.mp4';
    video.load();

    // Freeze video on the last frame and show cursor
    video.addEventListener('ended', () => {
      hasEnded = true;
      video.currentTime = Math.max(0, video.duration - 0.001);
      video.pause();
      if (cursor) {
        cursor.style.opacity = '1';
        cursor.style.animation = 'blink 1s step-end infinite';
      }
    });

    // Prevent video from restarting if it already ended
    video.addEventListener('play', () => {
      if (hasEnded) {
        video.pause();
        video.currentTime = Math.max(0, video.duration - 0.001);
      } else {
        if (cursor) {
          cursor.style.opacity = '0';
          cursor.style.animation = 'none';
        }
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

    // Fallback: If video is already playing, hide cursor
    if (!video.paused && !hasEnded) {
      if (cursor) {
        cursor.style.opacity = '0';
        cursor.style.animation = 'none';
      }
    }
  } else if (video && isMobile) {
    // Remove video completely on mobile to save performance and memory
    video.remove();
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
