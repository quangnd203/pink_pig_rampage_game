// ===== Âm thanh (sound) =====
// Quản lý nhạc nền: bật/tắt loa, phát meme_1 khi chơi, meme_2 khi game over.

const bgmPlay = new Audio('assets/sounds/meme_1.mp3');
const bgmDead = new Audio('assets/sounds/meme_2.mp3');
bgmPlay.loop = true;
bgmDead.loop = false;

let soundEnabled = true; // mặc định loa bật

const soundBtn = document.getElementById('sound-btn');
const iconOn = document.getElementById('icon-sound-on');
const iconOff = document.getElementById('icon-sound-off');

function updateSoundIcon() {
  iconOn.style.display = soundEnabled ? '' : 'none';
  iconOff.style.display = soundEnabled ? 'none' : '';
}
updateSoundIcon();

// Toggle bật/tắt loa
soundBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // không lan xuống canvas/body gây flap
  soundEnabled = !soundEnabled;
  updateSoundIcon();

  // Nếu đang tắt loa giữa chừng thì dừng hết nhạc
  if (!soundEnabled) {
    bgmPlay.pause();
    bgmPlay.currentTime = 0;
    bgmDead.pause();
    bgmDead.currentTime = 0;
  }
});

soundBtn.addEventListener('touchstart', (e) => {
  e.stopPropagation(); // chặn touch lan ra ngoài
  e.preventDefault();
  soundEnabled = !soundEnabled;
  updateSoundIcon();

  if (!soundEnabled) {
    bgmPlay.pause();
    bgmPlay.currentTime = 0;
    bgmDead.pause();
    bgmDead.currentTime = 0;
  }
}, { passive: false });

// Phát nhạc khi bắt đầu chơi (idle -> playing)
function playBgm() {
  if (!soundEnabled) return;
  bgmDead.pause();
  bgmDead.currentTime = 0;
  bgmPlay.currentTime = 0;
  bgmPlay.play().catch(() => {}); // bắt lỗi autoplay policy
}

// Dừng nhạc chơi, phát nhạc game over
function playDeadBgm() {
  bgmPlay.pause();
  bgmPlay.currentTime = 0;
  if (!soundEnabled) return;
  bgmDead.currentTime = 0;
  bgmDead.play().catch(() => {});
}

// Dừng tất cả nhạc (khi từ dead quay về idle)
function stopAllBgm() {
  bgmPlay.pause();
  bgmPlay.currentTime = 0;
  bgmDead.pause();
  bgmDead.currentTime = 0;
}

// Hiện/ẩn nút loa
function showSoundBtn() {
  soundBtn.style.display = '';
}
function hideSoundBtn() {
  soundBtn.style.display = 'none';
}
