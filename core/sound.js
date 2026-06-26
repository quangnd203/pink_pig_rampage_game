// ===== Âm thanh (sound) =====
// Dùng Web Audio API: giải mã file thành buffer PCM rồi lặp thẳng buffer đó.
// Nhờ vậy nhạc nền lặp lại liền mạch, KHÔNG bị khựng ở điểm nối vòng lặp (lỗi của
// thẻ <audio loop> trên iOS). Cũng tránh luôn lỗi autoplay/iOS chặn nhạc game over.

let soundEnabled = true;     // mặc định loa bật

const soundBtn = document.getElementById('sound-btn');
const iconOn = document.getElementById('icon-sound-on');
const iconOff = document.getElementById('icon-sound-off');

let audioCtx = null;         // AudioContext (tạo sớm, ngủ đông tới khi người dùng chạm)
let bufferPlay = null;       // meme_1 đã giải mã -> lặp mượt
let bufferDead = null;       // meme_2 đã giải mã (nhạc game over)
let srcPlay = null;          // nguồn nhạc nền đang phát (giữ để dừng được)
let srcDead = null;          // nguồn nhạc game over đang phát

// Chạy cb khi context đã thực sự "running". Nếu đang ngủ thì resume rồi mới chạy.
// (resume() trên Safari cũ có thể không trả về Promise -> kiểm tra .then cho chắc)
function whenRunning(cb) {
  if (!audioCtx) return;
  if (audioCtx.state === 'running') { cb(); return; }
  const p = audioCtx.resume();
  if (p && p.then) p.then(cb).catch(() => {}); else cb();
}

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

// Tạo context + GIẢI MÃ sẵn cả 2 file NGAY khi vào trang.
// Giải mã không cần thao tác người dùng (chỉ phát mới cần), nên làm sớm để đến lúc
// người chơi chạm là buffer đã sẵn sàng -> phát được ngay trong cú chạm đó (iOS cần vậy).
function initAudio() {
  if (audioCtx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  audioCtx = new AC(); // sinh ra ở trạng thái "suspended" tới khi resume trong user gesture
  loadSound('assets/sounds/meme_1.mp3').then(b => {
    bufferPlay = b;
    // iOS hay giải mã trễ (xong sau cú chạm đầu): hễ giải mã xong mà người chơi đang
    // trong ván thì phát ngay, không lệ thuộc vào cờ dễ bị reset lúc game over.
    if (state === 'playing') whenRunning(startPlayLoop);
  }).catch(() => {});
  loadSound('assets/sounds/meme_2.mp3').then(b => { bufferDead = b; }).catch(() => {});
}
initAudio(); // chạy ngay khi nạp file này

// Mở khóa âm thanh trong cú chạm/bấm đầu tiên (bắt buộc trên iOS).
function unlockAudio() {
  if (!audioCtx) { initAudio(); }
  if (!audioCtx) return;
  audioCtx.resume(); // iOS: đánh thức context trong user gesture
  // Phát thêm 1 buffer im lặng để chắc chắn context được mở khóa ngay trong cú chạm.
  const silent = audioCtx.createBufferSource();
  silent.buffer = audioCtx.createBuffer(1, 1, 22050);
  silent.connect(audioCtx.destination);
  silent.start(0);
}

function stopPlayLoop() {
  if (srcPlay) { try { srcPlay.stop(); } catch (e) {} srcPlay = null; }
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
  if (!soundEnabled || !audioCtx) return;
  stopDead();
  // Nếu buffer đã sẵn sàng thì phát ngay (khi context running). Nếu chưa giải mã xong,
  // hàm giải mã ở initAudio sẽ tự phát khi xong vì lúc đó state === 'playing'.
  if (bufferPlay) whenRunning(startPlayLoop);
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
