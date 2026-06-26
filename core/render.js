// ===== Phần vẽ (render) =====
// Toàn bộ hàm vẽ lên canvas: lợn, phân, ống, nền/sao, điểm số, bảng overlay.

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

function drawPoop(p) {
  const x = Math.round(p.x), y = Math.round(p.y), s = p.size;
  ctx.globalAlpha = Math.min(1, p.life / 0.4); // mờ dần lúc sắp biến mất
  // Bãi phân xếp tầng kiểu pixel
  ctx.fillStyle = '#7a4a21';
  ctx.beginPath(); ctx.ellipse(x, y, s, s * 0.7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8c5a2b';
  ctx.beginPath(); ctx.ellipse(x, y - s * 0.7, s * 0.72, s * 0.55, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#9c662f';
  ctx.beginPath(); ctx.ellipse(x, y - s * 1.25, s * 0.42, s * 0.42, 0, 0, Math.PI * 2); ctx.fill();
  // Đốm sáng nhỏ cho có khối
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(x - 1, Math.round(y - s * 1.4), 2, 2);
  ctx.globalAlpha = 1;
}

// Pipe drawing with pixel Mario-style caps
function drawPipe(px, topH, botY) {
  const capH = 18, capW = PIPE_W + 4, capX = px - 2;

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

// Vẽ một ngôi sao 4 cánh lấp lánh
function drawStar(sx, sy, r, alpha) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(sx, sy - r);
  ctx.lineTo(sx + r * 0.26, sy - r * 0.26);
  ctx.lineTo(sx + r, sy);
  ctx.lineTo(sx + r * 0.26, sy + r * 0.26);
  ctx.lineTo(sx, sy + r);
  ctx.lineTo(sx - r * 0.26, sy + r * 0.26);
  ctx.lineTo(sx - r, sy);
  ctx.lineTo(sx - r * 0.26, sy - r * 0.26);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawBackground() {
  // Sky
  ctx.fillStyle = '#ffd9ec';
  ctx.fillRect(0, 0, W, H - GROUND_H);

  // Sao lấp lánh rải rác trên trời (nhấp nháy nhẹ theo thời gian)
  const stars = [
    [W * 0.12, H * 0.14, 5],
    [W * 0.28, H * 0.30, 3.5],
    [W * 0.18, H * 0.52, 4],
    [W * 0.40, H * 0.12, 4.5],
    [W * 0.55, H * 0.22, 3],
    [W * 0.70, H * 0.10, 5],
    [W * 0.84, H * 0.28, 3.5],
    [W * 0.92, H * 0.16, 4],
    [W * 0.62, H * 0.50, 4.5],
    [W * 0.33, H * 0.66, 3.5],
    [W * 0.78, H * 0.62, 4]
  ];
  stars.forEach(([sx, sy, r], i) => {
    const tw = 0.5 + 0.5 * Math.sin(frameCount * 2 + i * 1.3); // 0..1 nhấp nháy
    drawStar(sx, sy, r * (0.7 + 0.3 * tw), 0.35 + 0.5 * tw);
  });

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

// Tách chữ thành nhiều dòng cho vừa chiều rộng cho trước
function wrapText(text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Draw overlay boxes (Start/Dead)
function drawOverlay(title, sub) {
  const pad = 22;
  const rectW = Math.min(W - 60, 320);
  const innerW = rectW - pad * 2;

  // Chuẩn bị các dòng chữ phụ (tự xuống dòng nếu dài)
  ctx.font = '14px monospace';
  // Tôn trọng chỗ ngắt dòng thủ công (\n), phần còn lại tự xuống dòng nếu vẫn dài
  const subLines = sub.split('\n').flatMap(part => wrapText(part, innerW));

  // Chiều cao khung co theo nội dung
  let contentH = 30 + subLines.length * 20;        // tiêu đề + các dòng phụ
  if (state === 'dead') contentH += 14 + 22 + 24;  // khoảng cách + điểm + nút chơi lại

  const rectH = contentH + pad * 2;
  const rectX = (W - rectW) / 2;
  const rectY = (H - rectH) / 2;

  ctx.fillStyle = 'rgba(0,0,0,0.42)';
  ctx.fillRect(rectX, rectY, rectW, rectH);
  ctx.strokeStyle = '#ff6fb0';
  ctx.lineWidth = 3;
  ctx.strokeRect(rectX, rectY, rectW, rectH);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  let y = rectY + pad;

  // Tiêu đề
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(title, W / 2, y);
  y += 30;

  // Chữ phụ (có thể nhiều dòng)
  ctx.font = '14px monospace';
  ctx.fillStyle = '#ffd1ea';
  for (const ln of subLines) {
    ctx.fillText(ln, W / 2, y);
    y += 20;
  }

  if (state === 'dead') {
    y += 14;
    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.fillText('Điểm: ' + score + '  |  Kỷ lục: ' + best, W / 2, y);
    y += 22;
    ctx.fillStyle = '#ffb3d9';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('[ Nhấn để chơi lại ]', W / 2, y);
  }

  ctx.textBaseline = 'alphabetic'; // trả lại mặc định cho các phần vẽ khác
}
