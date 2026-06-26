// ===== Điều khiển (input) =====
// Xử lý vỗ cánh và lắng nghe sự kiện chuột/chạm/bàn phím.

const rotateNotice = document.getElementById('rotate-notice');

function flap() {
  // Bỏ qua thao tác khi đang hiện thông báo "xoay dọc" (điện thoại nằm ngang)
  if (rotateNotice && getComputedStyle(rotateNotice).display !== 'none') return;

  if (state === 'idle') {
    state = 'playing';
    bird.vy = FLAP;
    bird.flapTimer = 0.2;
    spawnPoop();
    return;
  }
  if (state === 'playing') {
    bird.vy = FLAP;
    bird.flapTimer = 0.2;
    spawnPoop();
  }
  if (state === 'dead') {
    initGame();
    state = 'idle';
    updateUI();
  }
}

document.addEventListener('click', flap);
document.addEventListener('touchstart', e => { e.preventDefault(); flap(); }, { passive: false });
document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); flap(); }
});
