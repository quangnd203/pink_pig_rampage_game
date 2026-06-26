// ===== Âm thanh (sound) =====
// Dùng Web Audio API: giải mã file thành buffer PCM rồi lặp thẳng buffer đó.
// Nhờ vậy nhạc nền lặp lại liền mạch, KHÔNG bị khựng ở điểm nối vòng lặp (lỗi của
// thẻ <audio loop> trên iOS). Cũng tránh luôn lỗi autoplay/iOS chặn nhạc game over.

let soundEnabled = true;     // mặc định loa bật

const soundBtn = document.getElementById('sound-btn');
const iconOn = document.getElementById('icon-sound-on');
const iconOff = document.getElementById('icon-sound-off');

let audioCtx = null;         // AudioContext (tạo trong thao tác đầu của người dùng)
let bufferPlay = null;       // meme_1 đã giải mã -> lặp mượt
let bufferDead = null;       // meme_2 đã giải mã (nhạc game over)
let srcPlay = null;          // nguồn nhạc nền đang phát (giữ để dừng được)
let srcDead = null;          // nguồn nhạc game over đang phát
let wantPlayLoop = false;    // muốn phát nhạc nền nhưng buffer chưa tải xong

function updateSoundIcon() {
  iconOn.style.display = soundEnabled ? '' : 'none';
  iconOff.style.display = soundEnabled ? 'none' : '';
}
updateSoundIcon();

// Tải file rồi giải mã thành AudioBuffer (dùng dạng callback để chạy cả Safari cũ)
function loadSound(url) {
  return fetch(url)
    .then(r => r.arrayBuffer())
    .then(buf => new Promise((resolve, reject) => {
      audioCtx.decodeAudioData(buf, resolve, reject);
    }));
}

// Mở khóa + tải nhạc ngay trong cú chạm/bấm đầu tiên (bắt buộc trên iOS).
function unlockAudio() {
  if (audioCtx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  audioCtx = new AC();
  audioCtx.resume(); // iOS: phải resume trong user gesture
  // iOS: chỉ resume() là chưa đủ — phải phát một âm thanh NGAY trong cú chạm này để
  // mở khóa context. Phát 1 buffer rỗng (im lặng) để ép mở khóa, vì meme_1 còn đang
  // tải bất đồng bộ (xong sau khi chạm kết thúc) nên không kịp dùng để mở khóa.
  const silent = audioCtx.createBufferSource();
  silent.buffer = audioCtx.createBuffer(1, 1, 22050);
  silent.connect(audioCtx.destination);
  silent.start(0);
  loadSound('assets/sounds/meme_1.mp3').then(b => {
    bufferPlay = b;
    if (wantPlayLoop) startPlayLoop(); // tải xong mà đang cần phát thì phát ngay
  }).catch(() => {});
  loadSound('assets/sounds/meme_2.mp3').then(b => { bufferDead = b; }).catch(() => {});
}

function stopPlayLoop() {
  if (srcPlay) { try { srcPlay.stop(); } catch (e) {} srcPlay = null; }
  wantPlayLoop = false;
}
function stopDead() {
  if (srcDead) { try { srcDead.stop(); } catch (e) {} srcDead = null; }
}

// Phát nhạc nền và bật lặp liền mạch
function startPlayLoop() {
  if (!soundEnabled || !audioCtx || !bufferPlay) return;
  stopPlayLoop(); // tránh phát chồng
  srcPlay = audioCtx.createBufferSource();
  srcPlay.buffer = bufferPlay;
  srcPlay.loop = true;
  srcPlay.connect(audioCtx.destination);
  srcPlay.start();
}

// Toggle bật/tắt loa
function toggleSound() {
  soundEnabled = !soundEnabled;
  updateSoundIcon();
  if (!soundEnabled) { stopPlayLoop(); stopDead(); } // tắt giữa chừng -> dừng hết
}
soundBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // không lan xuống canvas/body gây flap
  toggleSound();
});
soundBtn.addEventListener('touchstart', (e) => {
  e.stopPropagation(); // chặn touch lan ra ngoài
  e.preventDefault();
  toggleSound();
}, { passive: false });

// Phát nhạc khi bắt đầu chơi (idle -> playing)
function playBgm() {
  if (!soundEnabled) return;
  stopDead();
  if (audioCtx) audioCtx.resume();
  if (bufferPlay) startPlayLoop();
  else wantPlayLoop = true; // chưa tải xong -> phát ngay khi xong
}

// Dừng nhạc nền, phát nhạc game over (lặp lại)
function playDeadBgm() {
  stopPlayLoop();
  if (!soundEnabled || !audioCtx || !bufferDead) return;
  stopDead();
  srcDead = audioCtx.createBufferSource();
  srcDead.buffer = bufferDead;
  srcDead.loop = true;
  srcDead.connect(audioCtx.destination);
  srcDead.start();
}

// Dừng tất cả nhạc (khi từ dead quay về idle)
function stopAllBgm() {
  stopPlayLoop();
  stopDead();
}

// Hiện/ẩn nút loa
function showSoundBtn() {
  soundBtn.style.display = '';
}
function hideSoundBtn() {
  soundBtn.style.display = 'none';
}
