/**
 * fish.js — Interactive fish that swim, avoid the mouse, and blow bubbles.
 * Part of The Well Church water theme.
 *
 * Note: innerHTML is used only with hardcoded SVG template literals below —
 * no user input is ever interpolated, so there is no XSS risk.
 */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var tank = document.querySelector('.fish-tank');
  if (!tank) return;

  // ---- Configuration ----
  var FISH_COUNT = window.innerWidth < 768 ? 4 : 7;
  var MOUSE_RADIUS = 150;
  var BASE_SPEED = 0.6;
  var FLEE_FORCE = 0.18;
  var EDGE_MARGIN = 80;
  var EDGE_FORCE = 0.04;
  var DAMPING = 0.992;
  var MAX_SPEED = 3.5;
  var BUBBLE_CHANCE = 0.003;
  var MAX_BUBBLES = 15;
  var DIR_CHANGE_MIN = 3000;
  var DIR_CHANGE_MAX = 8000;

  // ---- Mouse tracking ----
  var mouseX = -9999, mouseY = -9999;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mouseleave', function () {
    mouseX = -9999;
    mouseY = -9999;
  });

  // Touch: scatter fish briefly on tap
  document.addEventListener('touchstart', function (e) {
    if (e.touches.length) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
      setTimeout(function () { mouseX = -9999; mouseY = -9999; }, 1200);
    }
  }, { passive: true });

  // ---- Fish SVG templates (all face RIGHT, hardcoded — no user input) ----
  var TEMPLATES = [
    // 0 — Clownfish (orange / white stripes)
    '<svg viewBox="0 0 64 40"><path d="M4,20Q4,6 20,6L42,8Q56,12 56,20 56,28 42,32L20,34Q4,34 4,20Z" fill="#ff8c42"/><path d="M24,6L24,34" stroke="#fff" stroke-width="3" opacity=".85"/><path d="M36,7L36,33" stroke="#fff" stroke-width="3" opacity=".85"/><path d="M56,20L64,12 64,28Z" fill="#ff6b1a"/><path d="M20,4Q28,0 36,4" fill="#ff8c42"/><circle cx="12" cy="18" r="2.5" fill="#222"/><circle cx="12.6" cy="17.4" r=".8" fill="#fff"/></svg>',
    // 1 — Blue tang (blue / yellow tail)
    '<svg viewBox="0 0 64 36"><path d="M4,18Q4,4 22,4L44,6Q58,10 58,18 58,26 44,30L22,32Q4,32 4,18Z" fill="#2196f3"/><path d="M22,8Q38,18 22,28" stroke="#0d47a1" stroke-width="3.5" fill="none" opacity=".5"/><path d="M54,18L64,10 64,26Z" fill="#ffd700"/><circle cx="12" cy="16" r="2.5" fill="#222"/><circle cx="12.5" cy="15.5" r=".8" fill="#fff"/></svg>',
    // 2 — Angelfish (gold / dark stripes, tall)
    '<svg viewBox="0 0 50 58"><path d="M8,29Q8,6 25,3 42,6 42,29 42,52 25,55 8,52 8,29Z" fill="#ffc107"/><line x1="14" y1="14" x2="36" y2="14" stroke="#5d4000" stroke-width="2" opacity=".4"/><line x1="12" y1="22" x2="38" y2="22" stroke="#5d4000" stroke-width="2" opacity=".4"/><line x1="12" y1="36" x2="38" y2="36" stroke="#5d4000" stroke-width="2" opacity=".4"/><path d="M42,29L50,22 50,36Z" fill="#ffb300"/><path d="M25,3L29,0 21,0Z" fill="#ffb300" opacity=".7"/><path d="M25,55L29,58 21,58Z" fill="#ffb300" opacity=".7"/><circle cx="15" cy="27" r="2.5" fill="#222"/><circle cx="15.5" cy="26.5" r=".8" fill="#fff"/></svg>',
    // 3 — Neon tetra (silver / blue-red neon stripes)
    '<svg viewBox="0 0 48 26"><path d="M3,13Q3,3 15,3L33,3Q43,3 43,13 43,23 33,23L15,23Q3,23 3,13Z" fill="#cfd8dc"/><line x1="8" y1="11" x2="35" y2="11" stroke="#00bcd4" stroke-width="3" opacity=".9"/><line x1="22" y1="15" x2="35" y2="15" stroke="#f44336" stroke-width="2.5" opacity=".75"/><path d="M43,13L48,7 48,19Z" fill="#b0bec5"/><circle cx="8" cy="11" r="2" fill="#222"/><circle cx="8.4" cy="10.6" r=".6" fill="#fff"/></svg>',
    // 4 — Green guppy (green body / orange fantail)
    '<svg viewBox="0 0 58 32"><path d="M4,16Q4,4 18,4L36,4Q46,4 46,16 46,28 36,28L18,28Q4,28 4,16Z" fill="#4caf50"/><ellipse cx="28" cy="16" rx="10" ry="6" fill="#2e7d32" opacity=".3"/><path d="M46,16Q52,4 58,8 54,16 58,24 52,28 46,16Z" fill="#ff7043"/><path d="M22,2Q26,0 30,2" fill="#4caf50" opacity=".6"/><circle cx="11" cy="14" r="2.2" fill="#222"/><circle cx="11.4" cy="13.6" r=".7" fill="#fff"/></svg>',
    // 5 — Purple reef fish (purple / lavender stripe)
    '<svg viewBox="0 0 60 38"><path d="M5,19Q5,5 22,5L40,7Q54,11 54,19 54,27 40,31L22,33Q5,33 5,19Z" fill="#9c27b0"/><ellipse cx="30" cy="19" rx="12" ry="7" fill="#7b1fa2" opacity=".3"/><path d="M18,5L18,33" stroke="#e1bee7" stroke-width="2" opacity=".5"/><path d="M54,19L60,12 60,26Z" fill="#ab47bc"/><path d="M22,3Q28,0 34,3" fill="#9c27b0" opacity=".6"/><circle cx="12" cy="17" r="2.3" fill="#222"/><circle cx="12.5" cy="16.5" r=".7" fill="#fff"/></svg>',
    // 6 — Red koi (red-white, broad)
    '<svg viewBox="0 0 66 42"><path d="M5,21Q5,5 24,5L44,7Q60,12 60,21 60,30 44,35L24,37Q5,37 5,21Z" fill="#e53935"/><ellipse cx="20" cy="21" rx="9" ry="8" fill="#fff" opacity=".7"/><ellipse cx="38" cy="18" rx="7" ry="6" fill="#fff" opacity=".5"/><path d="M60,21L66,13 66,29Z" fill="#c62828"/><path d="M24,3Q30,0 36,3" fill="#e53935" opacity=".7"/><circle cx="12" cy="19" r="2.5" fill="#222"/><circle cx="12.5" cy="18.5" r=".8" fill="#fff"/></svg>'
  ];

  // ---- State ----
  var fishes = [];
  var activeBubbles = 0;

  function rand(min, max) { return min + Math.random() * (max - min); }

  function createFish(i) {
    var tpl = TEMPLATES[i % TEMPLATES.length];
    var size = rand(36, 64);
    var el = document.createElement('div');
    el.className = 'fish';
    el.innerHTML = tpl; // safe — hardcoded SVG only
    el.style.width = size + 'px';
    // Vary wiggle speed per fish
    var svg = el.querySelector('svg');
    if (svg) svg.style.animationDuration = rand(0.6, 1.2).toFixed(2) + 's';
    tank.appendChild(el);

    var angle = Math.random() * Math.PI * 2;
    var speed = BASE_SPEED * rand(0.6, 1.4);

    return {
      el: el,
      x: rand(50, window.innerWidth - 50),
      y: rand(50, window.innerHeight - 50),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed: speed,
      size: size,
      nextDir: Date.now() + rand(DIR_CHANGE_MIN, DIR_CHANGE_MAX)
    };
  }

  // ---- Animation loop ----
  function update() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var now = Date.now();

    for (var i = 0; i < fishes.length; i++) {
      var f = fishes[i];

      // Mouse avoidance
      var dx = f.x - mouseX;
      var dy = f.y - mouseY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 1) {
        var strength = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        f.vx += (dx / dist) * strength * FLEE_FORCE;
        f.vy += (dy / dist) * strength * FLEE_FORCE;
      }

      // Random direction nudge
      if (now > f.nextDir) {
        var a = Math.random() * Math.PI * 2;
        f.vx += Math.cos(a) * f.speed * 0.5;
        f.vy += Math.sin(a) * f.speed * 0.5;
        f.nextDir = now + rand(DIR_CHANGE_MIN, DIR_CHANGE_MAX);
      }

      // Edge avoidance (soft turn)
      if (f.x < EDGE_MARGIN) f.vx += EDGE_FORCE;
      else if (f.x > w - EDGE_MARGIN) f.vx -= EDGE_FORCE;
      if (f.y < EDGE_MARGIN) f.vy += EDGE_FORCE;
      else if (f.y > h - EDGE_MARGIN) f.vy -= EDGE_FORCE;

      // Damping
      f.vx *= DAMPING;
      f.vy *= DAMPING;

      // Clamp max speed
      var spd = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
      if (spd > MAX_SPEED) {
        f.vx = (f.vx / spd) * MAX_SPEED;
        f.vy = (f.vy / spd) * MAX_SPEED;
      }

      // Ensure minimum speed
      if (spd < f.speed * 0.3 && spd > 0.01) {
        var boost = f.speed * 0.5 / spd;
        f.vx *= boost;
        f.vy *= boost;
      }

      // Update position
      f.x += f.vx;
      f.y += f.vy;

      // Hard wrap (safety net)
      if (f.x < -f.size * 2) f.x = w + f.size;
      if (f.x > w + f.size * 2) f.x = -f.size;
      if (f.y < -f.size * 2) f.y = h + f.size;
      if (f.y > h + f.size * 2) f.y = -f.size;

      // Render — flip based on swimming direction, tilt based on vertical movement
      var scaleX = f.vx < 0 ? -1 : 1;
      var tilt = Math.atan2(f.vy, Math.abs(f.vx)) * 15;
      f.el.style.transform =
        'translate(' + (f.x - f.size * 0.5).toFixed(1) + 'px,' +
        (f.y - f.size * 0.5).toFixed(1) + 'px) scaleX(' + scaleX +
        ') rotate(' + tilt.toFixed(1) + 'deg)';

      // Bubble spawning
      if (activeBubbles < MAX_BUBBLES && Math.random() < BUBBLE_CHANCE) {
        spawnBubble(f);
      }
    }

    requestAnimationFrame(update);
  }

  function spawnBubble(f) {
    activeBubbles++;
    var b = document.createElement('span');
    b.className = 'fish-bubble';
    var sz = rand(3, 7);
    b.style.width = sz + 'px';
    b.style.height = sz + 'px';
    // Spawn near fish mouth (front of fish based on direction)
    var mouthX = f.vx > 0 ? f.x + f.size * 0.35 : f.x - f.size * 0.35;
    b.style.left = mouthX + 'px';
    b.style.top = (f.y - f.size * 0.1) + 'px';
    tank.appendChild(b);
    b.addEventListener('animationend', function () {
      b.remove();
      activeBubbles--;
    });
  }

  // ---- Initialize ----
  for (var i = 0; i < FISH_COUNT; i++) {
    fishes.push(createFish(i));
  }

  requestAnimationFrame(update);
})();
