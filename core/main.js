// ===== Vòng lặp game (main) =====
// Cập nhật trạng thái mỗi khung hình, vẽ lại, và khởi chạy vòng lặp.

function update(dt) {
  if (state === 'playing') {
    frameCount += dt;
    bgOffset = (bgOffset + PIPE_SPEED * 0.7 * dt) % 30;

    bird.vy += GRAVITY * dt;
    bird.y  += bird.vy * dt;

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
      playDeadBgm();  // dừng meme_1, phát meme_2
      updateUI();
    }
  } else if (state === 'idle') {
    bird.y = H * 0.44 + Math.sin(frameCount * 3) * 8;
    frameCount += dt;
  }

  // Cập nhật phân: rơi theo trọng lực, trôi lùi theo cảnh (khi đang chơi), mờ dần rồi biến mất
  const worldDrift = (state === 'playing') ? PIPE_SPEED : 0;
  for (const poop of poops) {
    poop.vy += GRAVITY * dt;
    poop.x  += (poop.vx - worldDrift) * dt;
    poop.y  += poop.vy * dt;
    poop.life -= dt;
  }
  poops = poops.filter(p => p.life > 0 && p.x > -20 && p.y < H - GROUND_H + 10);

  // Ải sương mù: trong vùng điểm thì mây kéo vào + sương hiện dần (~0.9s),
  // ra khỏi vùng thì mây trôi đi + sương tan (~0.6s).
  const inFogZone = (state === 'playing' &&
    ((score >= 25 && score <= 34) || (score >= 61 && score <= 75)));
  if (inFogZone) fogIntro = Math.min(1, fogIntro + dt / 1.8); // mây kéo vào từ tốn ~1.8s
  else           fogIntro = Math.max(0, fogIntro - dt / 0.9);
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  drawBackground();

  for (const p of pipes) drawPipe(p.x, p.topH, p.botY);

  for (const p of poops) drawPoop(p); // vẽ phân trước để nằm sau lợn

  drawBird(bird.x, bird.y);

  // Ải sương mù (25-34đ và 61-75đ): mây kéo vào 2 bên, mù dần rồi tan khi qua vùng
  if (fogIntro > 0) {
    const raw = (score >= 61) ? (score - 61) / 14 : (score - 25) / 9; // vùng 2 / vùng 1
    const t = Math.max(0, Math.min(1, raw));            // 0 ở đầu vùng -> 1 ở cuối vùng
    drawFog(bird.x, bird.y, 0.78 + t * 0.22, fogIntro); // mù dần: 0.78 -> 1.0
  }

  if (state === 'playing' || state === 'dead') drawScore();

  if (state === 'idle') {
    drawOverlay('PINK PIG RAMPAGE', 'Nhấn Space hoặc chạm vào\nmàn hình để bay!');
  } else if (state === 'dead') {
    drawOverlay('GAME OVER', 'Trư hồng toang rồi!');
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

requestAnimationFrame(loop);
