// ============================================================
// 模式清单：想改时长、加新模式（比如长休息），只需要改这个数组
// 格式：{ id: "英文标识", name: "按钮上显示的名字", minutes: 分钟数, note: "状态行提示语" }
// （和昨天倒计时墙的 EVENTS 数组是同一个设计思想：数据驱动）
// ============================================================
const MODES = [
  { id: "focus", name: "专注", minutes: 25, note: "关掉干扰，冲刺一个番茄" },
  { id: "break", name: "休息", minutes: 5, note: "起来走走，喝口水" },
  { id: "long", name: "长休息", minutes: 15, note: "远眺一下，好好放松" },

];

// ===== 状态：全页面只有这几个变量是"真相"，界面都是它们的影子 =====
let currentMode = MODES[0];
let totalSeconds = currentMode.minutes * 60; // 剩余秒数
let timerId = null;   // 定时器的身份证：启动时记下编号，停止时凭它叫停
let running = false;  // 现在是否在走
let tomatoCount = 0;  // 今天完成的专注番茄数

const $ = (id) => document.getElementById(id);

// 把秒数格式化成 25:00 这种样子
function format(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

// 唯一的渲染函数：变量一变，界面跟着变
function render() {
  $("time").textContent = format(totalSeconds);
  $("mode-name").textContent = currentMode.name;
  $("tomato-count").textContent = tomatoCount;

  // 开始按钮的四种文案：跑着=暂停，走完了=重新开始，暂停中途=继续，整点=开始
  const fullSeconds = currentMode.minutes * 60;
  $("start-btn").textContent = running
    ? "暂停"
    : totalSeconds === 0
      ? "重新开始"
      : totalSeconds === fullSeconds
        ? "开始"
        : "继续";

  // 当前模式的按钮高亮
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.id === currentMode.id);
  });

  // 浏览器标签页标题实时显示剩余时间（切去别的窗口也能瞄到进度）
  document.title = running ? format(totalSeconds) + " · 番茄钟" : "🍅 番茄钟";
}

// 每秒被 setInterval 叫一次
function tick() {
  totalSeconds = totalSeconds - 1;
  if (totalSeconds <= 0) {
    totalSeconds = 0;
    stopTimer();
    beep();
    if (currentMode.id === "focus") {
      tomatoCount = tomatoCount + 1;
      $("status").textContent = "🎉 完成一个番茄！休息一下吧";
    } else {
      $("status").textContent = "⏰ 休息结束，开始下一个专注";
    }
  }
  render();
}

function startTimer() {
  if (running) return; // 防抖：连点也不会开出第二个定时器
  running = true;
  timerId = setInterval(tick, 1000); // 每隔 1000 毫秒叫一次 tick
  render();
}

function stopTimer() {
  running = false;
  clearInterval(timerId); // 和 setInterval 成对出现：不清掉它就会永远跑下去
  render();
}

// 切换模式（重置按钮也复用它）：回到整点、停表
function switchMode(mode) {
  currentMode = mode;
  totalSeconds = mode.minutes * 60;
  stopTimer();
  $("status").textContent = mode.note;
}

// ===== 事件绑定 =====
$("start-btn").addEventListener("click", () => {
  if (running) {
    stopTimer();
    $("status").textContent = "已暂停";
  } else if (totalSeconds === 0) {
    switchMode(currentMode); // 走完了再按 = 重新开始当前模式
    startTimer();
  } else {
    startTimer();
  }
});

$("reset-btn").addEventListener("click", () => switchMode(currentMode));

// ===== 按 MODES 自动生成模式按钮：以后加新模式，这里一行都不用改 =====
$("mode-bar").innerHTML = MODES.map(
  (m) => `<button class="mode-btn" data-id="${m.id}">${m.name} ${m.minutes} 分</button>`
).join("");

document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const mode = MODES.find((m) => m.id === btn.dataset.id);
    if (mode) switchMode(mode);
  });
});

// ===== 用 Web Audio 合成一声"叮"：不需要任何音频文件 =====
// 原理：振荡器发声（880 赫兹）→ 音量旋钮 1 秒内从 0.3 淡到接近 0
function beep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
  osc.start();
  osc.stop(ctx.currentTime + 1);
}

render();
