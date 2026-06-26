// ===== Cấu hình chung & canvas =====
// Khởi tạo canvas, các hằng số vật lý/đồ họa, và xử lý co giãn kích thước.

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let W, H;
const GRAVITY = 420;      // px/s²  - rơi chậm hơn cho dễ chơi
const FLAP = -225;        // px/s   - vỗ cánh nhẹ và mượt hơn
const PIPE_W = 64;
const GAP = 165;
const PIPE_SPEED = 150;   // px/s   (= 2.5 × 60)
const PIPE_INTERVAL = 80 / 60; // giây giữa 2 ống (= 80 frames / 60fps)
const GROUND_H = 45;
const OSC_SPEED = 1.8;    // rad/s - tốc độ ống đung đưa lên xuống

function resize() {
  // Canvas vẽ đúng theo kích thước hiển thị của khung (CSS quyết định khung cao/thấp)
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width);
  canvas.height = Math.round(rect.height);
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
