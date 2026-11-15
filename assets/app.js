/**
 * PORTFOLIO NGUYỄN TIẾN SƠN · INF2501
 * Siêu Hiệu Ứng Sinh Động · Hệ Thống Tên Lửa & Bụi Sao Vệt Chuột (Comet Cursor)
 * 3D Tilt Cards & Tương Tác Âm Nhạc Sư Phạm
 */

(function () {
  'use strict';

  // =========================================================================
  // AUDIO SYNTHESIZER (WEB AUDIO API - ZERO DEPENDENCY)
  // =========================================================================
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Pentatonic Celestial Chimes & Arpeggio (Sư phạm Âm nhạc K20G)
  function playCelestialChime(isExtended = false) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      
      // Extended pentatonic melody: C5, D5, E5, G5, A5, B5, C6, E6
      const freqs = isExtended 
        ? [523.25, 587.33, 659.25, 783.99, 880.00, 987.77, 1046.50, 1318.51]
        : [523.25, 659.25, 783.99, 987.77, 1046.50];
        
      const now = ctx.currentTime;
      const step = isExtended ? 0.09 : 0.12;

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * step);

        gain.gain.setValueAtTime(0, now + idx * step);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * step + 0.035);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * step + 1.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * step);
        osc.stop(now + idx * step + 1.35);
      });
    } catch (err) {
      console.warn('Audio note allowed yet:', err);
    }
  }

  // Rocket Launch Engine Roar & Whoosh (Âm thanh tên lửa gầm phóng)
  function playRocketLaunchSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // 1. Noise buffer for booster fire
      const bufferSize = ctx.sampleRate * 1.6;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass sweep (200Hz -> 1000Hz -> 300Hz)
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(240, now);
      filter.frequency.exponentialRampToValueAtTime(1050, now + 0.35);
      filter.frequency.exponentialRampToValueAtTime(320, now + 1.5);
      filter.Q.setValueAtTime(3.2, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.01, now);
      noiseGain.gain.linearRampToValueAtTime(0.32, now + 0.22);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.55);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 1.6);

      // 2. Sub-bass rumble
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(115, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 1.4);

      oscGain.gain.setValueAtTime(0.22, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.4);
    } catch (e) {
      console.warn('Rocket sound error:', e);
    }
  }

  // =========================================================================
  // ROCKET VECTOR SVG DEFINITION
  // =========================================================================
  function getRocketSvgMarkup() {
    return `
      <svg viewBox="0 0 64 64" fill="none" class="flying-rocket-svg" xmlns="http://www.w3.org/2000/svg">
        <!-- Thruster Flame -->
        <g class="rocket-flame-path">
          <path d="M32 46 C27 53 28 63 32 65 C36 63 37 53 32 46 Z" fill="url(#rkFireGrad)" />
          <path d="M32 48 C29 53 30 59 32 61 C34 59 35 53 32 48 Z" fill="#fff3b0" />
        </g>
        <!-- Wings / Fins -->
        <path d="M20 34 L11 45 C10 47 12 49 15 48 L22 44 Z" fill="#e11d48" />
        <path d="M44 34 L53 45 C54 47 52 49 49 48 L42 44 Z" fill="#e11d48" />
        <path d="M30 38 L34 38 L33 46 L31 46 Z" fill="#7f1d1d" />
        <!-- Fuselage Body -->
        <path d="M32 6 C23 18 21 30 21 43 L43 43 C43 30 41 18 32 6 Z" fill="url(#rkBodyGrad)" />
        <!-- Nose Cap -->
        <path d="M32 6 C28 13 25 19 25 24 L39 24 C39 19 36 13 32 6 Z" fill="#f43f5e" />
        <!-- Cyan Stripe -->
        <path d="M21 36 L43 36 L43 39 L21 39 Z" fill="#38bdf8" />
        <!-- Cockpit Glass -->
        <circle cx="32" cy="29" r="5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.6" />
        <circle cx="30.5" cy="27.5" r="1.5" fill="#ffffff" />
        <defs>
          <linearGradient id="rkFireGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffd166" />
            <stop offset="45%" stop-color="#ff7b00" />
            <stop offset="100%" stop-color="#ff0044" />
          </linearGradient>
          <linearGradient id="rkBodyGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="45%" stop-color="#e2e8f0" />
            <stop offset="100%" stop-color="#cbd5e1" />
          </linearGradient>
        </defs>
      </svg>
    `;
  }

  // =========================================================================
  // FLYING ROCKET ENGINE
  // =========================================================================
  function launchFlyingRocket(options = {}) {
    playRocketLaunchSound();

    const startX = options.startX !== undefined ? options.startX : -100;
    const startY = options.startY !== undefined ? options.startY : window.innerHeight * 0.75;
    const endX = options.endX !== undefined ? options.endX : window.innerWidth + 120;
    const endY = options.endY !== undefined ? options.endY : window.innerHeight * 0.15;
    const duration = options.duration || 3200;

    const rocketEl = document.createElement('div');
    rocketEl.className = 'flying-rocket-container';
    rocketEl.title = 'Nhấn vào tên lửa để tăng tốc bứt phá!';
    rocketEl.innerHTML = getRocketSvgMarkup();
    document.body.appendChild(rocketEl);

    const dx = endX - startX;
    const dy = endY - startY;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI + 90;

    rocketEl.style.transform = `translate(${startX}px, ${startY}px) rotate(${angleDeg}deg) scale(0.9)`;

    let startTime = performance.now();
    let isBoosted = false;

    rocketEl.addEventListener('click', () => {
      if (isBoosted) return;
      isBoosted = true;
      playCelestialChime(true);
      spawnBurstEffects(currentX, currentY);
      showToast('🚀 BỨT PHÁ TỐC ĐỘ: 100% NĂNG LƯỢNG SỐ! ✨');
      rocketEl.style.filter = 'drop-shadow(0 0 30px #ffd166) drop-shadow(0 0 50px #ff4500)';
    });

    let currentX = startX;
    let currentY = startY;
    let lastParticleTime = 0;

    function animate(now) {
      let elapsed = now - startTime;
      let progress = Math.min(elapsed / (isBoosted ? duration * 0.55 : duration), 1);

      const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      currentX = startX + dx * ease;
      currentY = startY + dy * ease;

      rocketEl.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${angleDeg}deg) scale(${isBoosted ? 1.3 : 0.95})`;

      if (now - lastParticleTime > (isBoosted ? 18 : 32)) {
        lastParticleTime = now;
        spawnRocketParticle(currentX + 33, currentY + 33, angleRad);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        rocketEl.remove();
      }
    }

    requestAnimationFrame(animate);
  }

  function spawnRocketParticle(x, y, angleRad) {
    const p = document.createElement('div');
    p.className = 'rocket-particle';
    const size = Math.random() * 9 + 4;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;

    const colors = ['#ffd166', '#ffaa00', '#ff4500', '#ffffff', '#38bdf8'];
    const col = colors[Math.floor(Math.random() * colors.length)];
    p.style.backgroundColor = col;
    p.style.boxShadow = `0 0 12px ${col}, 0 0 22px #ff4500`;

    const backwardDist = 38;
    const px = x - Math.cos(angleRad) * backwardDist + (Math.random() - 0.5) * 14;
    const py = y - Math.sin(angleRad) * backwardDist + (Math.random() - 0.5) * 14;

    p.style.left = `${px}px`;
    p.style.top = `${py}px`;

    const driftX = -Math.cos(angleRad) * (Math.random() * 45 + 20) + (Math.random() - 0.5) * 22;
    const driftY = -Math.sin(angleRad) * (Math.random() * 45 + 20) + (Math.random() - 0.5) * 22;
    p.style.setProperty('--dx', `${driftX}px`);
    p.style.setProperty('--dy', `${driftY}px`);

    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1000);

    if (Math.random() > 0.55) {
      const smoke = document.createElement('div');
      smoke.className = 'rocket-smoke-puff';
      const sSize = Math.random() * 20 + 10;
      smoke.style.width = `${sSize}px`;
      smoke.style.height = `${sSize}px`;
      smoke.style.left = `${px - sSize / 2}px`;
      smoke.style.top = `${py - sSize / 2}px`;
      document.body.appendChild(smoke);
      setTimeout(() => smoke.remove(), 1300);
    }
  }

  // Shooting star / Meteorite
  function spawnShootingStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    const startX = Math.random() * (window.innerWidth * 0.7);
    const startY = Math.random() * (window.innerHeight * 0.4);
    star.style.left = `${startX}px`;
    star.style.top = `${startY}px`;

    const angle = -(Math.random() * 20 + 25);
    star.style.setProperty('--angle', `${angle}deg`);
    star.style.setProperty('--tx', `${Math.random() * 250 + 380}px`);
    star.style.setProperty('--ty', `${Math.random() * 150 + 220}px`);

    document.body.appendChild(star);
    setTimeout(() => star.remove(), 1600);
  }

  // =========================================================================
  // COMET CURSOR STARDUST TRAIL (VỆT SAO BĂNG THEO CHUỘT SIÊU LUNG LINH)
  // =========================================================================
  function initCometCursor() {
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;

    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);

      if (dist > 8 && now - lastTime > 25) {
        lastTime = now;
        lastX = e.clientX;
        lastY = e.clientY;

        const star = document.createElement('div');
        star.className = 'cursor-stardust';

        const size = Math.random() * 6 + 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        const colors = ['#ffd166', '#38bdf8', '#ff6b6b', '#c084fc', '#ffffff'];
        const col = colors[Math.floor(Math.random() * colors.length)];
        star.style.backgroundColor = col;
        star.style.boxShadow = `0 0 10px ${col}, 0 0 18px ${col}`;

        star.style.left = `${e.clientX}px`;
        star.style.top = `${e.clientY}px`;

        document.body.appendChild(star);
        setTimeout(() => star.remove(), 600);
      }
    }, { passive: true });
  }

  // =========================================================================
  // 3D TILT EFFECT ON CARDS & STAT ITEMS (NGHIÊNG 3D THEO GÓC NHÌN)
  // =========================================================================
  function init3DCardTilt() {
    const cards = document.querySelectorAll('.card, .stat-item, .sample-poster');
    cards.forEach((card) => {
      let glare = card.querySelector('.card-glare');
      if (!glare) {
        glare = document.createElement('div');
        glare.className = 'card-glare';
        card.prepend(glare);
      }

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -9;
        const rotateY = ((x - centerX) / centerX) * 9;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)`;
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
      });
    });
  }

  // =========================================================================
  // SCROLL PROGRESS BAR
  // =========================================================================
  function initScrollProgress() {
    let progressBar = document.getElementById('scroll-progress');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.id = 'scroll-progress';
      document.body.appendChild(progressBar);
    }

    window.addEventListener('scroll', () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      progressBar.style.width = scrolled + '%';
    }, { passive: true });
  }

  // =========================================================================
  // MAGIC PARTICLES CANVAS
  // =========================================================================
  function initMagicCanvas() {
    let canvas = document.getElementById('magic-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'magic-canvas';
      document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });

    const particleCount = Math.min(55, Math.floor((width * height) / 19000));
    const particles = [];
    const colors = [
      'rgba(255, 209, 102, ', // Gold
      'rgba(56, 189, 248, ',  // Cyan
      'rgba(192, 132, 252, ', // Purple
      'rgba(255, 69, 0, ',    // Flame Orange
      'rgba(255, 255, 255, '  // White
    ];

    class Particle {
      constructor() {
        this.reset(true);
      }
      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 10;
        this.size = Math.random() * 2.4 + 0.8;
        this.baseAlpha = Math.random() * 0.65 + 0.25;
        this.alpha = this.baseAlpha;
        this.twinkleSpeed = Math.random() * 0.03 + 0.01;
        this.twinkleDir = 1;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = -(Math.random() * 0.55 + 0.25);
        this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
      }
      update(mouse) {
        this.x += this.vx;
        this.y += this.vy;

        this.alpha += this.twinkleSpeed * this.twinkleDir;
        if (this.alpha > 0.9) this.twinkleDir = -1;
        if (this.alpha < 0.15) this.twinkleDir = 1;

        if (mouse.x !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const force = (140 - dist) / 140;
            this.x += (dx / dist) * force * 1.3;
            this.y += (dy / dist) * force * 1.3;
          }
        }

        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.reset(false);
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.colorPrefix + this.alpha + ')';
        ctx.shadowBlur = this.size * 3.5;
        ctx.shadowColor = this.colorPrefix + '0.8)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    let isVisible = true;
    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
    });

    function render() {
      if (isVisible) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 95) {
              const lineAlpha = (1 - dist / 95) * 0.18;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(255, 209, 102, ${lineAlpha})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }

        for (const p of particles) {
          p.update(mouse);
          p.draw();
        }
      }
      requestAnimationFrame(render);
    }

    render();
  }

  // =========================================================================
  // BURST PARTICLES & TOAST NOTIFICATION
  // =========================================================================
  function spawnBurstEffects(x, y) {
    const symbols = ['🚀', '✨', '♪', '⭐', '✦', '🔥', '♫', '𝄞'];
    const count = 14;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'floating-fx-note';
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;

      const tx = (Math.random() - 0.5) * 200;
      const ty = -(Math.random() * 150 + 75);
      const tr = (Math.random() - 0.5) * 80;
      el.style.setProperty('--tx', `${tx}px`);
      el.style.setProperty('--ty', `${ty}px`);
      el.style.setProperty('--tr', `${tr}deg`);
      el.style.color = Math.random() > 0.5 ? '#ffd166' : '#ff4500';

      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1900);
    }
  }

  let toastTimeout = null;
  function showToast(msg) {
    let toast = document.querySelector('.toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.innerHTML = msg;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // =========================================================================
  // THEME SWITCHER
  // =========================================================================
  function initThemeSwitcher() {
    const savedTheme = localStorage.getItem('pts_portfolio_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  function toggleTheme(btn) {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('pts_portfolio_theme', next);

    if (btn) {
      btn.innerHTML = next === 'dark' ? '🌙 Dạ Yến' : '☀️ Ánh Dương';
    }
    showToast(next === 'dark' ? '✨ Đã chuyển sang Chế độ Dạ Yến Vũ Trụ' : '☀️ Đã chuyển sang Chế độ Ánh Sáng Tinh Tế');
  }

  // =========================================================================
  // INJECT NAVIGATION CONTROLS (PHÓNG TÊN LỬA, VIBE NHẠC, ĐỔI MÀU)
  // =========================================================================
  function injectNavControls() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let controls = nav.querySelector('.nav-controls');
    if (!controls) {
      controls = document.createElement('div');
      controls.className = 'nav-controls';

      // 1. Epic Rocket Launch Button (Phóng đội hình tên lửa)
      const rocketBtn = document.createElement('button');
      rocketBtn.type = 'button';
      rocketBtn.className = 'btn-ctrl btn-rocket-launch';
      rocketBtn.title = 'Phóng đội hình tên lửa bứt phá không gian!';
      rocketBtn.innerHTML = `<span class="rocket-icon">🚀</span> <span>Phóng Tên Lửa</span>`;
      rocketBtn.addEventListener('click', () => {
        const rect = rocketBtn.getBoundingClientRect();
        spawnBurstEffects(rect.left + rect.width / 2, rect.top);
        showToast('🚀 ĐANG PHÓNG ĐỘI HÌNH TÊN LỬA VŨ TRỤ... VÚT! 🔥');
        
        // Rocket 1
        launchFlyingRocket({
          startX: -100,
          startY: window.innerHeight * 0.85,
          endX: window.innerWidth + 150,
          endY: window.innerHeight * 0.1,
          duration: 2700
        });

        // Rocket 2 (chasing right behind)
        setTimeout(() => {
          launchFlyingRocket({
            startX: -120,
            startY: window.innerHeight * 0.92,
            endX: window.innerWidth + 180,
            endY: window.innerHeight * 0.22,
            duration: 2500
          });
        }, 350);
      });
      controls.appendChild(rocketBtn);

      // 2. Music Vibe Button
      const musicBtn = document.createElement('button');
      musicBtn.type = 'button';
      musicBtn.className = 'btn-ctrl btn-music-vibe';
      musicBtn.title = 'Bật giai điệu Sư phạm Âm nhạc K20G';
      musicBtn.innerHTML = `
        <span class="eq-bars">
          <span class="eq-bar"></span>
          <span class="eq-bar"></span>
          <span class="eq-bar"></span>
          <span class="eq-bar"></span>
        </span>
        <span>Vibe Nhạc</span>
      `;
      musicBtn.addEventListener('click', () => {
        playCelestialChime(true);
        const rect = musicBtn.getBoundingClientRect();
        spawnBurstEffects(rect.left + rect.width / 2, rect.top);
        showToast('🎵 Giai điệu Âm vang · Sư phạm Âm nhạc K20G SPAN! ✨');
      });
      controls.appendChild(musicBtn);

      // 3. Theme Toggle Button
      const themeBtn = document.createElement('button');
      themeBtn.type = 'button';
      themeBtn.className = 'btn-ctrl btn-theme-toggle';
      themeBtn.title = 'Đổi chế độ màu';
      const curTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      themeBtn.innerHTML = curTheme === 'dark' ? '🌙 Dạ Yến' : '☀️ Ánh Dương';
      themeBtn.addEventListener('click', () => {
        toggleTheme(themeBtn);
      });
      controls.appendChild(themeBtn);

      nav.appendChild(controls);
    }
  }

  // =========================================================================
  // HYPERDRIVE ROCKET BACK TO TOP
  // =========================================================================
  function initRocketBackToTop() {
    let btn = document.getElementById('back-to-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'back-to-top';
      btn.type = 'button';
      btn.title = 'Phóng tên lửa lên đầu trang!';
      btn.setAttribute('aria-label', 'Phóng tên lửa lên đầu trang');
      document.body.appendChild(btn);
    }

    btn.innerHTML = `
      <svg viewBox="0 0 64 64" fill="none" class="btt-rocket-icon" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 46 C27 53 28 63 32 65 C36 63 37 53 32 46 Z" fill="#ff7b00" class="rocket-flame-path" />
        <path d="M20 34 L11 45 C10 47 12 49 15 48 L22 44 Z" fill="#e11d48" />
        <path d="M44 34 L53 45 C54 47 52 49 49 48 L42 44 Z" fill="#e11d48" />
        <path d="M32 6 C23 18 21 30 21 43 L43 43 C43 30 41 18 32 6 Z" fill="#ffffff" />
        <path d="M32 6 C28 13 25 19 25 24 L39 24 C39 19 36 13 32 6 Z" fill="#f43f5e" />
        <circle cx="32" cy="29" r="4.5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />
      </svg>
    `;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        btn.classList.add('show');
      } else {
        btn.classList.remove('show');
      }
    }, { passive: true });

    let isLaunching = false;
    btn.addEventListener('click', () => {
      if (isLaunching) return;
      isLaunching = true;
      playRocketLaunchSound();

      const rect = btn.getBoundingClientRect();
      spawnBurstEffects(rect.left + 28, rect.top);

      btn.classList.add('launching');
      showToast('🚀 PHÓNG LÊN ĐẦU TRANG... 3, 2, 1 CẤT CÁNH! 🔥');

      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        btn.classList.remove('launching');
        isLaunching = false;
      }, 1300);
    });
  }

  // =========================================================================
  // LIVE SPACE TRAFFIC & COSMIC SATELLITE
  // =========================================================================
  function initAmbientCosmos() {
    // 1. Initial rocket flight
    setTimeout(() => {
      launchFlyingRocket({
        startX: -80,
        startY: window.innerHeight * 0.7,
        endX: window.innerWidth + 120,
        endY: window.innerHeight * 0.2,
        duration: 3300
      });
    }, 2500);

    // 2. Periodic ambient rockets every 15-22s
    setInterval(() => {
      if (document.hidden) return;
      const fromLeft = Math.random() > 0.35;
      if (fromLeft) {
        launchFlyingRocket({
          startX: -100,
          startY: Math.random() * (window.innerHeight * 0.5) + window.innerHeight * 0.35,
          endX: window.innerWidth + 120,
          endY: Math.random() * (window.innerHeight * 0.3),
          duration: Math.random() * 800 + 2800
        });
      } else {
        launchFlyingRocket({
          startX: window.innerWidth + 100,
          startY: Math.random() * (window.innerHeight * 0.4) + window.innerHeight * 0.45,
          endX: -120,
          endY: Math.random() * (window.innerHeight * 0.25),
          duration: Math.random() * 800 + 3000
        });
      }
    }, 16000);

    // 3. Periodic shooting stars / meteors
    setInterval(() => {
      if (document.hidden) return;
      spawnShootingStar();
      if (Math.random() > 0.5) {
        setTimeout(spawnShootingStar, 400);
      }
    }, 6000);

    // 4. Double-click anywhere to launch an interceptor rocket!
    window.addEventListener('dblclick', (e) => {
      playRocketLaunchSound();
      showToast('🚀 ĐÃ KÍCH HOẠT TÊN LỬA THEO YÊU CẦU! 🔥');
      launchFlyingRocket({
        startX: e.clientX - 200,
        startY: window.innerHeight + 80,
        endX: e.clientX + 320,
        endY: -100,
        duration: 2200
      });
    });

    // 5. Inject floating satellite
    let sat = document.querySelector('.cosmic-satellite');
    if (!sat) {
      sat = document.createElement('div');
      sat.className = 'cosmic-satellite';
      sat.innerHTML = `
        <svg width="42" height="42" viewBox="0 0 64 64" fill="none">
          <rect x="22" y="22" width="20" height="20" rx="4" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/>
          <circle cx="32" cy="32" r="4" fill="#ffd166"/>
          <!-- Solar wings -->
          <rect x="2" y="26" width="16" height="12" rx="2" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
          <line x1="7" y1="26" x2="7" y2="38" stroke="#ffffff" stroke-width="1"/>
          <line x1="13" y1="26" x2="13" y2="38" stroke="#ffffff" stroke-width="1"/>
          <rect x="46" y="26" width="16" height="12" rx="2" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
          <line x1="51" y1="26" x2="51" y2="38" stroke="#ffffff" stroke-width="1"/>
          <line x1="57" y1="26" x2="57" y2="38" stroke="#ffffff" stroke-width="1"/>
        </svg>
      `;
      document.body.appendChild(sat);
    }
  }

  // =========================================================================
  // HERO ORBIT ROCKET & LIVE SYMPHONY WAVEFORM
  // =========================================================================
  function initHeroOrbitRocket() {
    const orbitRocket = document.querySelector('.hero-orbit-rocket');
    if (orbitRocket) {
      orbitRocket.innerHTML = `
        <div class="rocket-glow-pulse"></div>
        <svg viewBox="0 0 64 64" fill="none" class="flying-rocket-svg" style="width: 44px; height: 44px;" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 46 C27 53 28 63 32 65 C36 63 37 53 32 46 Z" fill="#ff7b00" class="rocket-flame-path" />
          <path d="M20 34 L11 45 C10 47 12 49 15 48 L22 44 Z" fill="#e11d48" />
          <path d="M44 34 L53 45 C54 47 52 49 49 48 L42 44 Z" fill="#e11d48" />
          <path d="M32 6 C23 18 21 30 21 43 L43 43 C43 30 41 18 32 6 Z" fill="#ffffff" />
          <path d="M32 6 C28 13 25 19 25 24 L39 24 C39 19 36 13 32 6 Z" fill="#f43f5e" />
          <circle cx="32" cy="29" r="4.5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />
        </svg>
      `;

      orbitRocket.addEventListener('click', () => {
        playRocketLaunchSound();
        const rect = orbitRocket.getBoundingClientRect();
        spawnBurstEffects(rect.left + 22, rect.top);
        showToast('🚀 TÊN LỬA K20G KHỞI HÀNH BAY VÒNG HÀO QUANG! ✨');

        launchFlyingRocket({
          startX: rect.left,
          startY: rect.top,
          endX: window.innerWidth + 120,
          endY: rect.top - 280,
          duration: 2500
        });
      });
    }

    // Live Symphony Waveform in Hero
    const waveformCard = document.querySelector('.hero-waveform-card');
    if (waveformCard) {
      waveformCard.addEventListener('click', () => {
        playCelestialChime(true);
        const rect = waveformCard.getBoundingClientRect();
        spawnBurstEffects(rect.left + rect.width / 2, rect.top);
        showToast('🎵 GIAI ĐIỆU SƯ PHẠM ÂM NHẠC · NHỊP ĐIỆU CÔNG NGHỆ! 🎶');

        // Vigorously animate wave bars
        const bars = waveformCard.querySelectorAll('.wave-bar');
        bars.forEach((b, i) => {
          b.style.animationDuration = '0.35s';
          setTimeout(() => {
            b.style.animationDuration = '1s';
          }, 3500);
        });
      });
    }
  }

  // =========================================================================
  // CODE & PROMPT COPY BUTTONS
  // =========================================================================
  function initCopyButtons() {
    const preBlocks = document.querySelectorAll('pre');
    preBlocks.forEach((pre) => {
      if (pre.parentElement && pre.parentElement.classList.contains('code-wrapper')) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'code-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'copy-btn';
      copyBtn.innerHTML = '📋 Sao chép';

      copyBtn.addEventListener('click', () => {
        const text = pre.innerText.trim();
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.innerHTML = '✓ Đã chép! ✨';
          showToast('✨ Đã sao chép nội dung vào Clipboard!');
          setTimeout(() => {
            copyBtn.innerHTML = '📋 Sao chép';
          }, 2000);
        }).catch(() => {
          copyBtn.innerHTML = '✓ Đã chọn';
        });
      });

      wrapper.appendChild(copyBtn);
    });
  }

  // =========================================================================
  // SCROLLSPY FOR DETAIL PAGES
  // =========================================================================
  function initScrollspy() {
    const sideLinks = document.querySelectorAll('.side a[href^="#"]');
    if (!sideLinks.length) return;

    const sections = [];
    sideLinks.forEach((link) => {
      const id = link.getAttribute('href').slice(1);
      const sec = document.getElementById(id);
      if (sec) sections.push({ link, sec });
    });

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 160;
      let current = null;
      for (const item of sections) {
        if (item.sec.offsetTop <= scrollPos) {
          current = item;
        }
      }
      sideLinks.forEach((l) => l.classList.remove('active'));
      if (current) current.link.classList.add('active');
    }, { passive: true });
  }

  // =========================================================================
  // DROPDOWN ACCESSIBILITY & AUTO-CLOSE
  // =========================================================================
  function initDropdown() {
    const detailsList = document.querySelectorAll('.menu details');
    document.addEventListener('click', (e) => {
      detailsList.forEach((d) => {
        if (!d.contains(e.target)) {
          d.removeAttribute('open');
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        detailsList.forEach((d) => d.removeAttribute('open'));
      }
    });
  }

  // =========================================================================
  // INITIALIZATION ON DOM READY
  // =========================================================================
  function init() {
    initThemeSwitcher();
    initScrollProgress();
    initMagicCanvas();
    initCometCursor();
    injectNavControls();
    initRocketBackToTop();
    initAmbientCosmos();
    initHeroOrbitRocket();
    init3DCardTilt();
    initCopyButtons();
    initScrollspy();
    initDropdown();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
