const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let W, H;
const GRAVITY = 504;      // px/s²  (= 0.14 × 60²)
const FLAP = -240;        // px/s   (= -4 × 60)
const PIPE_W = 64;
const GAP = 160;
const PIPE_SPEED = 150;   // px/s   (= 2.5 × 60)
const PIPE_INTERVAL = 80 / 60; // giây giữa 2 ống (= 80 frames / 60fps)
const GROUND_H = 45;
const OSC_SPEED = 1.8;    // rad/s - tốc độ ống đung đưa lên xuống

function resize() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  W = canvas.width;
  H = canvas.height;
  ctx.imageSmoothingEnabled = false;
}
resize();
window.addEventListener('resize', () => {
  resize();
  if (state === 'idle' && bird) {
    bird.y = H * 0.44;
  }
});

let state = 'idle';
let bird, pipes, score, best, frameCount, bgOffset, pipeTimer, lastTime;

function initGame() {
  bird = { x: 80, y: H * 0.44, vy: 0, frame: 0, flapTimer: 0 };
  pipes = [];
  score = 0;
  frameCount = 0;
  bgOffset = 0;
  pipeTimer = 0;
  lastTime = null;
}
initGame();

// Kỷ lục lưu trong bộ nhớ trình duyệt (localStorage) - chỉ mất khi người chơi xóa dữ liệu duyệt web
const BEST_KEY = 'pinkPigRampageBest';
function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch (e) {
    return 0; // localStorage có thể bị chặn (chế độ ẩn danh) - không làm hỏng game
  }
}
function saveBest() {
  try {
    localStorage.setItem(BEST_KEY, best);
  } catch (e) { /* bỏ qua nếu không ghi được */ }
}
best = loadBest();
updateUI(); // hiển thị kỷ lục đã lưu ngay khi mở game

// Pixel flying pig drawing 🐷 (pink body, angel wings, snout)
function drawBird(x, y, flapState) {
  const bx = Math.round(x - 14);
  const by = Math.round(y - 12);

  const PINK   = '#f78fb3';
  const PINK_D = '#e0608f';
  const SNOUT  = '#f06fa0';
  const NOSTR  = '#9e3a63';
  const OUTLINE = '#b04a72';

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(bx + 2, by + 23, 26, 4);

  // Curly tail (đuôi xoắn phía sau)
  ctx.strokeStyle = PINK_D;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bx + 2, by + 14);
  ctx.bezierCurveTo(bx - 4, by + 12, bx - 4, by + 18, bx, by + 18);
  ctx.stroke();

  // Ears (tai - vẽ trước thân để nằm dưới)
  ctx.fillStyle = PINK_D;
  ctx.fillRect(bx + 4, by - 1, 6, 6);
  ctx.fillRect(bx + 16, by - 1, 6, 6);

  // Body pixels - pink (thân tròn mập)
  const body = [
    [5,2,16,6],
    [3,6,22,12],
    [5,16,16,6],
  ];
  ctx.fillStyle = PINK;
  body.forEach(([rx,ry,rw,rh]) => ctx.fillRect(bx+rx, by+ry, rw, rh));

  // Angel wings - white (cánh thiên thần vỗ theo trạng thái)
  ctx.fillStyle = '#ffffff';
  if (flapState === 'up') {
    ctx.fillRect(bx+4, by+2, 12, 6);
    ctx.fillRect(bx+2, by, 8, 5);
  } else if (flapState === 'down') {
    ctx.fillRect(bx+4, by+15, 12, 6);
    ctx.fillRect(bx+2, by+18, 8, 5);
  } else {
    ctx.fillRect(bx+3, by+8, 13, 7);
  }
  // wing outline
  ctx.strokeStyle = '#d9d9e0';
  ctx.lineWidth = 1;
  if (flapState === 'mid') ctx.strokeRect(bx+3, by+8, 13, 7);

  // Snout - mõm lợn (phía trước, hướng bay)
  ctx.fillStyle = SNOUT;
  ctx.fillRect(bx+20, by+8, 8, 9);
  ctx.fillStyle = NOSTR;
  ctx.fillRect(bx+22, by+10, 2, 5);
  ctx.fillRect(bx+25, by+10, 2, 5);

  // Eye white
  ctx.fillStyle = '#fff';
  ctx.fillRect(bx+15, by+4, 7, 7);
  // Pupil
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(bx+18, by+6, 3, 3);
  // Eye shine
  ctx.fillStyle = '#fff';
  ctx.fillRect(bx+18, by+6, 1, 1);

  // Body outline
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(bx+3, by+6, 22, 12);
  ctx.strokeRect(bx+20, by+8, 8, 9);
}

// Pipe drawing with pixel Mario-style caps
function drawPipe(px, topH, botY) {
  const capH = 18, capW = PIPE_W + 8, capX = px - 4;

  // Top pipe body
  const tg = ctx.createLinearGradient(px, 0, px + PIPE_W, 0);
  tg.addColorStop(0, '#ff85c0');
  tg.addColorStop(0.3, '#ffa6d4');
  tg.addColorStop(0.7, '#e84d96');
  tg.addColorStop(1, '#d13d82');
  ctx.fillStyle = tg;
  ctx.fillRect(px, 0, PIPE_W, topH - capH);

  // Top pipe cap
  const capGrad = ctx.createLinearGradient(capX, 0, capX + capW, 0);
  capGrad.addColorStop(0, '#ff85c0');
  capGrad.addColorStop(0.25, '#ffb3da');
  capGrad.addColorStop(0.65, '#e84d96');
  capGrad.addColorStop(1, '#c2326f');
  ctx.fillStyle = capGrad;
  ctx.fillRect(capX, topH - capH, capW, capH);

  // Cap highlight
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(capX + 2, topH - capH + 2, 8, capH - 4);

  // Pipe outline top
  ctx.strokeStyle = '#a82e6a';
  ctx.lineWidth = 2;
  ctx.strokeRect(px, 0, PIPE_W, topH - capH);
  ctx.strokeRect(capX, topH - capH, capW, capH);

  // Dark inner line
  ctx.fillStyle = '#a82e6a';
  ctx.fillRect(px + PIPE_W * 0.6, 0, 4, topH - capH);

  // Bottom pipe
  const bh = H - GROUND_H - botY - capH;
  ctx.fillStyle = tg;
  ctx.fillRect(px, botY + capH, PIPE_W, bh);

  const capGrad2 = ctx.createLinearGradient(capX, 0, capX + capW, 0);
  capGrad2.addColorStop(0, '#ff85c0');
  capGrad2.addColorStop(0.25, '#ffb3da');
  capGrad2.addColorStop(0.65, '#e84d96');
  capGrad2.addColorStop(1, '#c2326f');
  ctx.fillStyle = capGrad2;
  ctx.fillRect(capX, botY, capW, capH);

  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(capX + 2, botY + 2, 8, capH - 4);

  ctx.strokeStyle = '#a82e6a';
  ctx.lineWidth = 2;
  ctx.strokeRect(px, botY + capH, PIPE_W, bh - 2);
  ctx.strokeRect(capX, botY, capW, capH);

  ctx.fillStyle = '#a82e6a';
  ctx.fillRect(px + PIPE_W * 0.6, botY + capH, 4, bh);
}

function drawBackground() {
  // Sky
  ctx.fillStyle = '#ffd9ec';
  ctx.fillRect(0, 0, W, H - GROUND_H);

  // Subtle cloud streaks
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  const cloudHeights = [H * 0.16, H * 0.4, H * 0.68];
  cloudHeights.forEach(y => {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y + 10);
    ctx.stroke();
  });

  // Sparkles / plus signs
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  const sparkles = [
    [W * 0.75, H * 0.24],
    [W * 0.87, H * 0.4],
    [W * 0.8, H * 0.6],
    [W * 0.65, H * 0.32],
    [W * 0.95, H * 0.54]
  ];
  sparkles.forEach(([sx,sy]) => {
    ctx.fillRect(sx-1, sy-4, 2, 8);
    ctx.fillRect(sx-4, sy-1, 8, 2);
  });

  // Ground
  const gy = H - GROUND_H;
  ctx.fillStyle = '#f29ec6';
  ctx.fillRect(0, gy, W, GROUND_H);
  ctx.fillStyle = '#d975a8';
  ctx.fillRect(0, gy, W, 8);

  // Ground pixel stripes
  ctx.fillStyle = '#e487b4';
  for (let i = -30; i < W + 30; i += 30) {
    ctx.fillRect(i - bgOffset, gy + 12, 18, 8);
  }

  ctx.strokeStyle = '#b0517e';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, gy, W, GROUND_H);
}

// Draw Score
function drawScore() {
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#a8326f';
  ctx.lineWidth = 4;
  ctx.strokeText(score, W / 2, H * 0.2);
  ctx.fillText(score, W / 2, H * 0.2);
}

// Draw overlay boxes (Start/Dead)
function drawOverlay(title, sub) {
  const rectH = 200;
  const rectW = Math.min(W - 80, 320);
  const rectX = (W - rectW) / 2;
  const rectY = H / 2 - 100;

  ctx.fillStyle = 'rgba(0,0,0,0.42)';
  ctx.fillRect(rectX, rectY, rectW, rectH);
  ctx.strokeStyle = '#ff6fb0';
  ctx.lineWidth = 3;
  ctx.strokeRect(rectX, rectY, rectW, rectH);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(title, W / 2, rectY + 60);

  ctx.font = '14px monospace';
  ctx.fillStyle = '#ffd1ea';
  ctx.fillText(sub, W / 2, rectY + 100);

  if (state === 'dead') {
    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.fillText('Điểm: ' + score + '  |  Kỷ lục: ' + best, W / 2, rectY + 140);
    ctx.fillStyle = '#ffb3d9';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('[ Nhấn để chơi lại ]', W / 2, rectY + 170);
  }
}

function getFlapState() {
  if (bird.flapTimer > 0) return 'up';
  if (bird.vy > 3) return 'down';
  return 'mid';
}

// Biên độ đung đưa của ống tăng dần theo điểm (troll công bằng: dạy người chơi từ từ)
function pipeAmplitude() {
  if (score < 10) return 0;                              // 0-10đ: ống đứng im, cho làm quen
  if (score < 25) return Math.random() < 0.5 ? 28 : 0;   // 10-25đ: thỉnh thoảng 1 ống nhúc nhích nhẹ
  return 46;                                             // 25+đ: nhiều ống đung đưa biên độ lớn
}

function spawnPipe() {
  const minTop = 60, maxTop = H - GROUND_H - GAP - 60;
  // Giới hạn biên độ để khe luôn nằm trong vùng hợp lệ khi dao động
  const amp = Math.min(pipeAmplitude(), (maxTop - minTop) / 2);
  const baseTop = (minTop + amp) + Math.random() * ((maxTop - amp) - (minTop + amp));
  pipes.push({
    x: W + 10,
    topH: baseTop,
    baseTop,
    amp,
    phase: Math.random() * Math.PI * 2, // lệch nhịp mỗi ống cho tự nhiên
    botY: baseTop + GAP,
    scored: false
  });
}

function checkCollision() {
  const bx = bird.x - 12, by = bird.y - 10, bw = 26, bh = 20;

  if (bird.y + 12 >= H - GROUND_H) return true;
  if (bird.y - 12 <= 0) return true;

  for (const p of pipes) {
    const cx = p.x - 4, cw = PIPE_W + 8;
    if (bx + bw > cx + 4 && bx < cx + cw - 4) {
      if (by < p.topH || by + bh > p.botY) return true;
    }
  }
  return false;
}

function flap() {
  if (state === 'idle') {
    state = 'playing';
    bird.vy = FLAP;
    bird.flapTimer = 0.2;
    document.getElementById('hint').style.display = 'none';
    return;
  }
  if (state === 'playing') {
    bird.vy = FLAP;
    bird.flapTimer = 0.2;
  }
  if (state === 'dead') {
    initGame();
    state = 'idle';
    updateUI();
    document.getElementById('hint').style.display = 'block';
  }
}

function updateUI() {
  document.getElementById('score-display').textContent = 'Điểm: ' + score;
  document.getElementById('best-display').textContent = 'Kỷ lục: ' + best;
}

function update(dt) {
  if (state === 'playing') {
    frameCount += dt;
    bgOffset = (bgOffset + PIPE_SPEED * 0.7 * dt) % 30;

    bird.vy += GRAVITY * dt;
    bird.y  += bird.vy * dt;
    if (bird.flapTimer > 0) bird.flapTimer -= dt;

    pipeTimer += dt;
    if (pipeTimer >= PIPE_INTERVAL) {
      pipeTimer -= PIPE_INTERVAL;
      spawnPipe();
    }

    for (const p of pipes) {
      p.x -= PIPE_SPEED * dt;
      // Ống đung đưa: khe trôi lên xuống đều đặn quanh vị trí gốc (học được, không random)
      if (p.amp > 0) {
        p.topH = p.baseTop + Math.sin(frameCount * OSC_SPEED + p.phase) * p.amp;
        p.botY = p.topH + GAP;
      }
      if (!p.scored && p.x + PIPE_W < bird.x) {
        p.scored = true;
        score++;
        if (score > best) { best = score; saveBest(); }
        updateUI();
      }
    }

    pipes = pipes.filter(p => p.x + PIPE_W + 8 > 0);

    if (checkCollision()) {
      state = 'dead';
      updateUI();
    }
  } else if (state === 'idle') {
    bird.y = H * 0.44 + Math.sin(frameCount * 3) * 8;
    frameCount += dt;
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  drawBackground();

  for (const p of pipes) drawPipe(p.x, p.topH, p.botY);

  drawBird(bird.x, bird.y, getFlapState());

  if (state === 'playing' || state === 'dead') drawScore();

  if (state === 'idle') {
    drawOverlay('PINK PIG RAMPAGE', 'Nhấn để bắt đầu bay!');
  } else if (state === 'dead') {
    drawOverlay('GAME OVER', 'Chú heo đã ngã rồi!');
  }
}

function loop(timestamp) {
  if (lastTime == null) lastTime = timestamp;
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // tối đa 50ms để tránh jump khi tab bị ẩn
  lastTime = timestamp;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener('click', flap);
document.addEventListener('touchstart', e => { e.preventDefault(); flap(); }, { passive: false });
document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); flap(); }
});

requestAnimationFrame(loop);
