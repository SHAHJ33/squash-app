const canvas = document.getElementById("courtCanvas");
const ctx = canvas.getContext("2d");

const GameTimerDiv = document.getElementById("GameTimerDiv");
const gameTimeDisplay = document.getElementById("gameTimer");
const setNumberDisplay = document.getElementById("setNumber");

const setTotalInput = document.getElementById("setTotal");
const setDurationInput = document.getElementById("setDuration");
const setRestTimeInput = document.getElementById("setRestTime");
const setRepositionTimeInput = document.getElementById("setRepositionTime");

const markDurationInput = document.getElementById("markDuration");

const playSetBtn = document.getElementById("playSetBtn");
const resetSetBtn = document.getElementById("resetSetBtn");

const markEditor = document.getElementById("markEditor");
const saveMarkBtn = document.getElementById("saveMarkBtn");
const deleteMarkBtn = document.getElementById("deleteMarkBtn");
const colorPicker = document.getElementById("shape-color");

const popSound = document.getElementById("popSound");

const OUTLINE_COLOR = "#FF0000";
const MARK_COLOR = "#FFFFFF";

let COLORS = ["#F0F0F0", "#0F0F0F", "#00FF00", "#0000FF", "#000000", "#FFFFFF"];
var colorArray = [
  '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'
];

function GetRandomColor() {
  const hexColors = [];

  for (let i = 0; i < 50; i++) {
    hexColors.push("#" + Math.floor(Math.random() * 16777215).toString(16));
  }

  let rnd = Math.floor(Math.random() * colorArray.length);

  return hexColors[rnd];
}

let markings = [];
let totalSets = 0;
let totalTime = 1000;
let restTime = 0;
let repositionTime = 3;
let isSessionActive = false;
let isPaused = false;
let isResting = false;

window.onload = function () {
  ClearSession();
  WriteOnCanvas("Squash Pro", 300);
};

let markToDraw = null;

// Draw the court
function DrawCourt() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const courtBackground = "#f5deb3"; // Light wood color
  const lineColor = "#ff0000"; // Red for lines

  //   ctx.fillStyle = courtBackground;
  //   ctx.fillRect(20, 20, 640, 975); // Draw the floor of the court

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;

  ctx.beginPath();
  // Draw court lines, walls, service boxes, etc.
  ctx.strokeRect(20, 20, 640, 975); // The court outline

  ctx.moveTo(20, 588); // Draw short line
  ctx.lineTo(660, 588);
  ctx.stroke();

  ctx.moveTo(340, 588); // Draw T-Line
  ctx.lineTo(340, 995);
  ctx.stroke();

  ctx.strokeRect(20, 588, 160, 160); // Left service box
  ctx.strokeRect(510, 588, 150, 168); // Right service box

  if (isSessionActive && !isPaused) {
    if (markToDraw != null && markToDraw.isVisible) {
      drawShape(markToDraw);
    }
  } else {
    markings.forEach((mark) => {
      drawShape(mark);
    });
  }
}

// Draw shapes on the court
function drawShape(mark) {
  ctx.strokeStyle = OUTLINE_COLOR; // Marking color (blue)
  ctx.fillStyle = mark.color; // Fill color for shapes
  ctx.lineWidth = 2;

  const { type, position, size } = mark;

  if (type === "circle") {
    ctx.beginPath();
    ctx.arc(position.x, position.y, size.width, 0, 2 * Math.PI); // Circle with radius 20
    ctx.fill();
    if (mark.isSelected) {
      ctx.stroke();
    }
  } else if (type === "square") {
    ctx.beginPath();
    ctx.fillRect(
      position.x - size.width / 2,
      position.y - size.height / 2,
      size.width,
      size.height
    );
    if (mark.isSelected) {
      ctx.strokeRect(
        position.x - size.width / 2,
        position.y - size.height / 2,
        size.width,
        size.height
      );
    }
  }
}

let position = {
  x: null,
  y: null,
};

let size = {
  width: null,
  height: null,
};

let currentSelectedMark = null;
// Place shape on click
canvas.addEventListener("click", (event) => {
  if (isSessionActive) return;

  const rect = canvas.getBoundingClientRect();
  position = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };

  size = {
    width: 20,
    height: 20,
  };

  currentSelectedMark = findMark(position.x, position.y);
  if (currentSelectedMark != null) {
    // activate the editor and load the mark details
    markEditor.style.display = "inline";
    markDurationInput.valueAsNumber = currentSelectedMark.duration;
    colorPicker.value = currentSelectedMark.color;
    currentSelectedMark.isSelected = true;
    markings = markings.map((mark) => {
      if (mark.id == currentSelectedMark.id) {
        return { ...mark, isSelected: true };
      } else {
        return { ...mark, isSelected: false };
      }
    });
  } else {
    // show the editor
    markEditor.style.display = "inline";
    markDurationInput.valueAsNumber = 1.5;
    colorPicker.value = GetRandomColor();

    currentSelectedMark = {
      id: Date.now(),
      duration: markDurationInput.valueAsNumber,
      type: "circle",
      position,
      size,
      color: colorPicker.value,
      isSelected: true,
      isVisible: true,
    };

    markings.forEach((mark) => {
      mark.isSelected = false;
    });

    markings.push(currentSelectedMark);
  }

  DrawCourt();
});

function findMark(x, y) {
  let result = null;

  markings.forEach((mark) => {
    if (
      x >= mark.position.x - mark.size.width &&
      x <= mark.position.x + mark.size.width &&
      y >= mark.position.y - mark.size.height &&
      y <= mark.position.y + mark.size.height
    ) {
      result = mark;
      return;
    }
  });

  return result;
}

saveMarkBtn.addEventListener("click", () => {
  // update this mark in the list
  if (currentSelectedMark != null) {
    markings = markings.filter((m) => m.id != currentSelectedMark.id);

    currentSelectedMark.duration = markDurationInput.valueAsNumber;
    currentSelectedMark.color = colorPicker.value;
    currentSelectedMark.isSelected = false;

    markings.push(currentSelectedMark);
    currentSelectedMark = null;
  }
  markEditor.style.display = "none";

  DrawCourt();
});

deleteMarkBtn.addEventListener("click", () => {
  if (currentSelectedMark != null) {
    markings = markings.filter((m) => m.id != currentSelectedMark.id);
    currentSelectedMark = null;
  }
  markEditor.style.display = "none";

  DrawCourt();
});

// Stop session
function ValidateFields() {
  if (setTotalInput.value == "") {
    alert("Total sets cannot be empty.");
    return false;
  }

  if (setDurationInput.value == "") {
    alert("Set duration cannot be empty.");
    return false;
  }

  if (setRestTimeInput.value == "") {
    alert("Rest time cannot be empty.");
    return false;
  }

  if (setRepositionTimeInput.value == "") {
    alert("Reposition time cannot be empty.");
    return false;
  }

  if (markings.length == 0) {
    alert("No markings on the court.");
    return false;
  }

  return true;
}

resetSetBtn.addEventListener("click", () => {
  setTotalInput.value = "";
  setDurationInput.value = "";
  setRepositionTimeInput.value = "";
  setRestTimeInput.value = "";

  markings = [];
  ClearSession();
  WriteOnCanvas("Squash Pro", 300);
});

playSetBtn.addEventListener("click", () => {
  if (ValidateFields()) {
    markings.forEach((mark) => {
      mark.isSelected = false;
    });
    StartSession();
  }
});

let currentSet = 0;
function StartSession() {
  totalSets = setTotalInput.valueAsNumber;
  restTime = setRestTimeInput.valueAsNumber;
  repositionTime = setRepositionTimeInput.valueAsNumber;
  duration = setDurationInput.valueAsNumber;
  currentSet = 0;
  isSessionActive = true;
  playSetBtn.disabled = true;
  Reset();
  DrawCourt();
  NextSet();
}

function ClearSession() {
  playSetBtn.disabled = false;
  isSessionActive = false;
  isPaused = false;

  //markings = [];
  markToDraw = null;
  currentSelectedMark = null;

  currentGameTime = 0;
  currentRestTime = 0;

  GameTimerDiv.style = "display: none;";

  gameTimeDisplay.textContent = formatTime(currentGameTime);
  setNumberDisplay.textContent = currentSet.toString();

  clearInterval(gameIntervalId);
  clearInterval(restIntervalId);

  clearTimeout(markTimeout);
  clearTimeout(repositionTimer);
  clearInterval(blinkTimer);

  markEditor.style.display = "none";

  DrawCourt();
}

function DisplayRestTime(t) {
  if(currentSet==1) {
    WriteOnCanvas("Game Starts", 300);
    WriteOnCanvas(" in: " + formatSeconds(t) + " sec", 350);
  } else {
    WriteOnCanvas("Rest Time", 300);
    WriteOnCanvas(formatSeconds(t).toString() + " sec", 350);
  }
}

function Reset() {
  markToDraw = null;
  currentSelectedMark = null;

  currentGameTime = 0;
  currentRestTime = 0;

  // RestTimerDiv.style = "display: none;";
  GameTimerDiv.style = "display: none;";

  gameTimeDisplay.textContent = formatTime(currentGameTime);
  setNumberDisplay.textContent = currentSet.toString();

  clearTimeout(markTimeout);
  clearTimeout(repositionTimer);
  clearInterval(blinkTimer);

  markEditor.style.display = "none";

  isPaused = false;
}

let currentRestTime = 0;
let restIntervalId = null;
function NextSet() {
  if (currentSet < totalSets) {
    currentSet++;
    currentRestTime = 0;
    GameTimerDiv.style = "display: none;";

    isResting = true;
    restIntervalId = setInterval(() => {
      if (currentRestTime < restTime && currentSet > 1) {
        currentRestTime += 0.1;
        DrawCourt();
        DisplayRestTime(currentRestTime);
      } else {
        isResting = false;
        clearInterval(restIntervalId);
        Reset();
        DrawCourt();
        StartSet();
      }
      // show rest time
    }, 100);
  } else {
    ClearSession();
  }
}

let currentGameTime = 0;
let gameIntervalId = null;
// Start the timer
function StartSet() {
  isPaused = false;
  currentGameTime = 0;
  totalTime = duration;
  // RestTimerDiv.style = "display: none;";
  GameTimerDiv.style = "display: inline;";
  gameTimeDisplay.textContent = formatTime(currentGameTime);
  setNumberDisplay.textContent = currentSet.toString();
  gameIntervalId = setInterval(() => {
    if (currentGameTime >= totalTime) {
      clearInterval(gameIntervalId);
      Reset();
      DrawCourt();
      NextSet();
      return;
    }

    if (isSessionActive && !isPaused) {
      currentGameTime++;
      gameTimeDisplay.textContent = formatTime(currentGameTime);
    }
  }, 1000);

  startReposition();
}

let blinkTimer = null;
function startBlinking() {
  blinkTimer = setInterval(() => {
    if (markToDraw != null) {
      markToDraw.isVisible = !markToDraw.isVisible;
      DrawCourt();
    }
  }, 0.25 * 1000);
}

let repositionTimer = null;
// 1
function startReposition() {
  clearTimeout(markTimeout);
  repositionTimer = setTimeout(() => {
    let rnd = Math.floor(Math.random() * markings.length);
    showMarking(markings[rnd]);
  }, repositionTime * 1000);
}

let markTimeout = null;
// 2
function showMarking(mark) {
  popSound.play();
  clearTimeout(repositionTimer);
  markToDraw = mark;
  DrawCourt();
  startBlinking();

  let dT = markToDraw.duration;
  markTimeout = setTimeout(() => {
    clearInterval(blinkTimer);
    markToDraw = null;
    DrawCourt();
    startReposition();
  }, dT * 1000);
}

// Format time as MM:SS
function formatTime(timeInSeconds) {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function formatSeconds(timeInSeconds) {
  const seconds = timeInSeconds % 60;
  return seconds.toFixed(1).toString();
  // return `${String(seconds).padStart(
  //   2,
  //   "0",
  // )}`;
}

function formatMilli(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const milliseconds = (seconds - minutes * 60 - remainingSeconds) * 1000;

  return `${String(remainingSeconds).padStart(
    2,
    "0",
  )}:${String(milliseconds).padStart(
    2,
    "0",
  )}`;
}

function WriteOnCanvas(message, yPos) {
  ctx.font = '50px Arial';
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillText(message, canvas.width/2, yPos);
}

