const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

const gridSize = 50;
const tileCount = canvas.width / gridSize;
const maxTileCount = tileCount * tileCount;

let score = 0;
let gameOver = false;
let gameClear = false;

// ==========================================
// 1. 画像・動画の読み込み設定
// ==========================================
const appleImg = new Image();
appleImg.src = 'apple.png';

const headVideo = document.createElement('video');
headVideo.src = 'snake_head.mp4';
headVideo.loop = true;
headVideo.muted = true;
headVideo.playsInline = true;
headVideo.setAttribute('muted', '');
headVideo.setAttribute('playsinline', '');

headVideo.load();

// 画面クリックやキー入力で背景動画と頭動画の自動再生ブロックを解除
const playAllVideos = () => {
  headVideo.play().catch(() => {});
  document.querySelectorAll('.side-bg video').forEach(v => v.play().catch(() => {}));
};

document.addEventListener('click', playAllVideos);
document.addEventListener('keydown', playAllVideos);

// ==========================================
// 2. 初期位置 & 操作
// ==========================================
let snake = [
  { x: 6, y: 6 },
  { x: 6, y: 7 },
  { x: 6, y: 8 }
];

let dx = 0;
let dy = -1;
let apple = { x: 3, y: 3 };

document.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
  }

  if (e.key === 'r' || e.key === 'R') {
    resetGame();
    return;
  }

  if (gameOver || gameClear) return;

  if (e.key === 'ArrowUp' && dy !== 1) { dx = 0; dy = -1; }
  else if (e.key === 'ArrowDown' && dy !== -1) { dx = 0; dy = 1; }
  else if (e.key === 'ArrowLeft' && dx !== 1) { dx = -1; dy = 0; }
  else if (e.key === 'ArrowRight' && dx !== -1) { dx = 1; dy = 0; }
});

// ==========================================
// 3. ゲーム更新
// ==========================================
function update() {
  if (gameOver || gameClear) return;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver = true;
    return;
  }

  for (let segment of snake) {
    if (head.x === segment.x && head.y === segment.y) {
      gameOver = true;
      return;
    }
  }

  snake.unshift(head);

  if (head.x === apple.x && head.y === apple.y) {
    score += 10;
    scoreElement.textContent = score;

    if (snake.length === maxTileCount) {
      gameClear = true;
      return;
    }

    spawnApple();
  } else {
    snake.pop();
  }
}

function spawnApple() {
  while (true) {
    const candidateX = Math.floor(Math.random() * tileCount);
    const candidateY = Math.floor(Math.random() * tileCount);

    let isOnSnake = false;
    for (let segment of snake) {
      if (segment.x === candidateX && segment.y === candidateY) {
        isOnSnake = true;
        break;
      }
    }

    if (!isOnSnake) {
      apple.x = candidateX;
      apple.y = candidateY;
      break;
    }
  }
}

// ==========================================
// 4. 描画処理
// ==========================================
function draw() {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const drawSize = gridSize - 2;

  // 1. リンゴ（画像）の描画
  if (!gameClear) {
    if (appleImg.complete && appleImg.naturalWidth !== 0) {
      ctx.drawImage(appleImg, apple.x * gridSize + 1, apple.y * gridSize + 1, drawSize, drawSize);
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(apple.x * gridSize + gridSize / 2, apple.y * gridSize + gridSize / 2, drawSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. 胴体の描画
  for (let i = 1; i < snake.length; i++) {
    ctx.fillStyle = '#10b981';
    ctx.fillRect(snake[i].x * gridSize + 1, snake[i].y * gridSize + 1, drawSize, drawSize);
  }

  // 3. 蛇の頭（動画）の描画
  const head = snake[0];
  if (headVideo.readyState >= 2 && !headVideo.paused) {
    ctx.drawImage(headVideo, head.x * gridSize + 1, head.y * gridSize + 1, drawSize, drawSize);
  } else {
    headVideo.play().catch(() => {});
    ctx.fillStyle = '#34d399';
    ctx.fillRect(head.x * gridSize + 1, head.y * gridSize + 1, drawSize, drawSize);
  }

  // 4. ゲームオーバー画面
  if (gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`SCORE: ${score}`, canvas.width / 2, canvas.height / 2 + 10);

    ctx.fillStyle = '#ffffff';
    ctx.font = '18px sans-serif';
    ctx.fillText('Rキーでリトライ', canvas.width / 2, canvas.height / 2 + 55);
  }

  // 5. ゲームクリア画面
  if (gameClear) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME CLEAR! 🎉', canvas.width / 2, canvas.height / 2 - 40);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`SCORE: ${score}`, canvas.width / 2, canvas.height / 2 + 10);

    ctx.fillStyle = '#ffffff';
    ctx.font = '18px sans-serif';
    ctx.fillText('Rキーでリトライ', canvas.width / 2, canvas.height / 2 + 55);
  }
}

function resetGame() {
  snake = [
    { x: 6, y: 6 },
    { x: 6, y: 7 },
    { x: 6, y: 8 }
  ];
  dx = 0;
  dy = -1;
  score = 0;
  scoreElement.textContent = score;
  gameOver = false;
  gameClear = false;
  spawnApple();
}

// 350ms間隔で更新
setInterval(() => {
  update();
  draw();
}, 350);