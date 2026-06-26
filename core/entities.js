// ===== Đối tượng trong game =====
// Logic của lợn (phân, trạng thái vỗ), ống (sinh ra, độ khó) và va chạm.

// Lợn ị ra phân khi vỗ cánh 💩 (bắn ra phía sau-dưới rồi rơi theo trọng lực)
function spawnPoop() {
  poops.push({
    x: bird.x - 13,                  // phía sau mông lợn
    y: bird.y + 8,                   // dưới bụng
    vx: -50 - Math.random() * 40,    // bắn ngược ra sau
    vy: 20 + Math.random() * 50,     // rơi xuống
    size: 3.7 + Math.random() * 1.3,
    life: 1.3                        // số giây tồn tại trước khi mờ hẳn
  });
}

// Biên độ đung đưa của ống tăng dần theo điểm (troll công bằng: dạy người chơi từ từ)
function pipeAmplitude() {
  if (score < 10) return 0;                              // 0-9đ: ống đứng im, cho làm quen
  if (score < 25) return Math.random() < 0.5 ? 28 : 0;   // 10-24đ: thỉnh thoảng 1 ống nhúc nhích nhẹ
  if (score <= 34) return 0;                             // 25-34đ: ải sương mù, ống đứng im
  if (score <= 60) return 46;                            // 35-60đ: nhiều ống đung đưa biên độ lớn
  return 0;                                              // >60đ: tạm đứng im - dành chỗ cho thử thách mới
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
    const cx = p.x - 2, cw = PIPE_W + 4;
    if (bx + bw > cx + 2 && bx < cx + cw - 2) {
      if (by < p.topH || by + bh > p.botY) return true;
    }
  }
  return false;
}
