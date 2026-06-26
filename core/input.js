// ===== Điều khiển (input) =====
// Xử lý vỗ cánh và lắng nghe sự kiện chuột/chạm/bàn phím.

const rotateNotice = document.getElementById('rotate-notice');

function flap() {
  // Bỏ qua thao tác khi đang hiện thông báo "xoay dọc" (điện thoại nằm ngang)
  if (rotateNotice && getComputedStyle(rotateNotice).display !== 'none') return;

  unlockAudio(); // mở khóa âm thanh ngay lần tương tác đầu (cho iOS phát được meme_2)

  if (state === 'idle') {
    state = 'playing';
    bird.vy = FLAP;
    bird.flapTimer = 0.2;
    spawnPoop();
    hideSoundBtn();  // ẩn icon loa khi bắt đầu chơi
    playBgm();       // phát meme_1.mp3 loop
    return;
  }
  if (state === 'playing') {
    bird.vy = FLAP;
    bird.flapTimer = 0.2;
    spawnPoop();
  }
  if (state === 'dead') {
    stopAllBgm();    // dừng hết nhạc
    initGame();
    state = 'idle';
    updateUI();
    showSoundBtn();  // hiện lại icon loa ở màn chờ
  }
}

document.addEventListener('click', flap);
document.addEventListener('touchstart', e => { e.preventDefault(); flap(); }, { passive: false });
document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); flap(); }
});
