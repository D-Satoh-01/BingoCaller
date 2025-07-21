const rangeSelect = document.getElementById("rangeSelect");
const durationSelect = document.getElementById("durationSelect");
const rollButton = document.getElementById("rollButton");
const numberDisplay = document.getElementById("numberDisplay");
const historyList = document.getElementById("historyList");
const statusMessage = document.getElementById("statusMessage");

const rollSound1 = document.getElementById("rollSound1");
const rollSound2 = document.getElementById("rollSound2");
const decideSound = document.getElementById("decideSound");

let totalNumbers = 75;
let selectedNumbers = [];
let rolling = false;
let soundSwitched = false;

function resetGame() {
  selectedNumbers = [];
  historyList.innerHTML = "";
  numberDisplay.textContent = "?";
  statusMessage.textContent = "";
}

function getAvailableNumbers() {
  const available = [];
  for (let i = 1; i <= totalNumbers; i++) {
    if (!selectedNumbers.includes(i)) {
      available.push(i);
    }
  }
  return available;
}

function startRoll() {
  if (rolling) return;

  totalNumbers = parseInt(rangeSelect.value);
  const duration = parseFloat(durationSelect.value);

  const available = getAvailableNumbers();
  if (available.length === 0) {
    statusMessage.textContent = "終了";
    return;
  }

  resetAudio();

  rolling = true;
  soundSwitched = false;
  let elapsed = 0;
  const startTime = performance.now();

  // 音声初期再生（ループなし）
  if (duration > 0) {
    if (duration === 2.8) {
      rollSound2.play();
    } else {
      rollSound1.play(); // 再生開始
    }
  }

  function intervalFunc() {
    if (!rolling) return;

    const now = performance.now();
    elapsed = now - startTime;
    const remaining = duration * 1000 - elapsed;

    // 2.8秒前にroll_1を止めてroll_2を再生
    if (!soundSwitched && duration !== 2.8 && remaining <= 2800) {
      rollSound1.pause();
      rollSound1.currentTime = 0;
      rollSound2.play();
      soundSwitched = true;
    }

    if (remaining <= 0) {
      finalizeNumber();
      return;
    }

    // 表示変化速度
    let interval = 100;
    if (remaining <= 1800) {
      interval = 600;
    } else if (remaining <= 2800) {
      interval = 200;
    }

    const pool = getAvailableNumbers();
    const currentNumber = pool[Math.floor(Math.random() * pool.length)];
    numberDisplay.textContent = currentNumber;

    setTimeout(intervalFunc, interval);
  }

  if (duration === 0) {
    finalizeNumber();
  } else {
    intervalFunc();
  }
}

function finalizeNumber() {
  rolling = false;
  resetAudio();

  const pool = getAvailableNumbers();
  const finalNumber = pool[Math.floor(Math.random() * pool.length)];

  numberDisplay.textContent = finalNumber;
  selectedNumbers.push(finalNumber);

  if (selectedNumbers.length === 1) {
    document.querySelector(".historyTitle").classList.remove("hidden");
  }

  const div = document.createElement("div");
  div.textContent = finalNumber;
  historyList.insertBefore(div, historyList.firstChild);

  decideSound.play();

  if (selectedNumbers.length === totalNumbers) {
    statusMessage.textContent = "終了";
  }
}

function resetAudio() {
  rollSound1.pause();
  rollSound1.currentTime = 0;
  rollSound2.pause();
  rollSound2.currentTime = 0;
}

rollButton.addEventListener("click", startRoll);
rangeSelect.addEventListener("change", resetGame);

// スペースキーでもロール開始
document.addEventListener("keydown", (e) => {
  // 入力フォームなどでスペースを押したときに発火しないよう制限
  if (e.code === "Space" && !e.repeat && !rolling) {
    e.preventDefault(); // スクロールなどのデフォルト動作を防止
    startRoll();
  }
});