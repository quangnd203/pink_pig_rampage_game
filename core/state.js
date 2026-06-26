// ===== Trạng thái game & kỷ lục =====
// Biến trạng thái, khởi tạo ván chơi, lưu/đọc kỷ lục và cập nhật giao diện.

let state = 'idle';
let bird, pipes, poops, score, best, frameCount, bgOffset, pipeTimer, lastTime;
let fogIntro; // tiến trình ải sương (0..1): mây kéo vào + sương hiện dần

function initGame() {
  bird = { x: 80, y: H * 0.44, vy: 0 };
  pipes = [];
  poops = [];
  score = 0;
  frameCount = 0;
  bgOffset = 0;
  pipeTimer = 0;
  lastTime = null;
  fogIntro = 0;
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

function updateUI() {
  document.getElementById('best-display').textContent = 'Kỷ lục: ' + best;
}

best = loadBest();
updateUI(); // hiển thị kỷ lục đã lưu ngay khi mở game
