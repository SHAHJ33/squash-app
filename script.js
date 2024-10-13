const canvas = document.getElementById("courtCanvas");
const ctx = canvas.getContext("2d");
const setNameInput = document.getElementById("setName");
const setDurationInput = document.getElementById("setDuration");
const setRepositionInput = document.getElementById("setReposition");
const timerDisplay = document.getElementById("timer");
const savedSessionsList = document.getElementById("savedSessionsList");
const markNameInput = document.getElementById("markName");
const markDurationInput = document.getElementById("markDuration");

const saveSetBtn = document.getElementById("saveSetBtn");
const resetSetBtn = document.getElementById("resetSetBtn");

const markEditor = document.getElementById("markEditor");
const saveMarkBtn = document.getElementById("saveMarkBtn");
const deleteMarkBtn = document.getElementById("deleteMarkBtn");

let selectedMark = "square";
let markings = [];
let setName = "";
let currentTime = 0; // elapsed time
let totalTime = 1000;
let repositionTime = 3;
let isSessionActive = false;
let timerId = null;
let isPaused = false;
let savedSets = [];

window.onload = function () {
  reset();
};

let markToDraw = null;

// Draw the court
function drawCourt() {
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

  // markings.forEach((mark) => {
  //   const startTime = mark.time;
  //   const endTime = mark.time + mark.duration;

  //   if (currentTime >= startTime && currentTime <= endTime) {
  //     drawShape(mark);
  //   }
  // });

  if (markToDraw != null) {
    drawShape(markToDraw);
  }
}

// Draw shapes on the court
function drawShape(mark) {
  ctx.strokeStyle = "#0000FF"; // Marking color (blue)
  ctx.fillStyle = "#0000FF"; // Fill color for shapes
  ctx.lineWidth = 2;

  const { type, position } = mark;

  if (type === "circle") {
    ctx.beginPath();
    ctx.arc(position.x, position.y, 20, 0, 2 * Math.PI); // Circle with radius 20
    ctx.fill();
  } else if (type === "square") {
    ctx.beginPath();
    ctx.fillRect(position.x - 10, position.y - 10, 20, 20);
  }
}

let position = {
  x: null,
  y: null,
};

let currentSelectedMark = null;
// Place shape on click
canvas.addEventListener("click", (event) => {
  if (isSessionActive) return;

  if(currentSelectedMark != null) return;

  // Pause the session
  isPaused = true;
  toggleButtons();

  const rect = canvas.getBoundingClientRect();
  position = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };

  // Save the shape and current time
  drawShape({ type: selectedMark, position });

  // show the editor
  markEditor.style.display = "inline";

   // save the shape here
   markNameInput.value = "";
   markDurationInput.valueAsNumber = "";

  currentSelectedMark = {
    name: markNameInput.value,
    type: selectedMark,
    position,
    duration: markDurationInput.valueAsNumber,
  };

});

saveMarkBtn.addEventListener("click", () => {
  if (currentSelectedMark != null) {
    currentSelectedMark.duration = markDurationInput.valueAsNumber;
    currentSelectedMark.name = markNameInput.value;
    markings.push(currentSelectedMark);

    currentSelectedMark = null;
    markEditor.style.display = "none";
  }
});

deleteMarkBtn.addEventListener("click", () => {
  currentSelectedMark = null;
  markEditor.style.display = "none";
  clearCanvas();
});

// Start session
/*
saveSetBtn.addEventListener("click", () => {
  reset();

  setName = sessionNameInput.value;

  if (savedSets.find((s) => s.name == setName)) {
    return;
  }

  if (setName) {
    isSessionActive = true;
    isPaused = false;
    startTimer();
    toggleButtons();
  }
});
*/
// Stop session
saveSetBtn.addEventListener("click", () => {
  if (setNameInput.value == "") return;

  if (setDurationInput.value == "") return;

  if (setRepositionInput.value == "") return;

  if (savedSets.find((s) => s.name == setNameInput.value)) {
    return;
  }

  if (markings.length == 0) {
    console.log("no markings");
    return;
  }

  saveSet();
  reset();

  setNameInput.value = "";
  setDurationInput.value = "";
  setRepositionInput.value = "";
});

resetSetBtn.addEventListener("click", () => {
  setNameInput.value = "";
  setDurationInput.value = "";
  setRepositionInput.value = "";
  markings = [];
  reset();
});

// Resume session
// resumeSessionBtn.addEventListener("click", () => {
//   isPaused = false;
//   toggleButtons();
//   clearCanvas();
// });

// Save session to list
function saveSet() {
  const newSet = {
    name: setNameInput.value,
    duration: setDurationInput.value,
    reposition: setRepositionInput.value,
    markings,
  };
  savedSets.push(newSet);
  updateSetsList();
}

// Update saved sessions list
function updateSetsList() {
  savedSessionsList.innerHTML = "";
  savedSets.forEach((set, index) => {
    const li = document.createElement("li");
    li.textContent = `${set.name} - ${formatTime(set.duration)}`;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => deleteSet(set);
    li.appendChild(deleteButton);

    const loadButton = document.createElement("button");
    loadButton.textContent = "Replay";
    loadButton.onclick = () => replaySet(set);
    li.appendChild(loadButton);

    savedSessionsList.appendChild(li);
  });
}

function deleteSet(set) {
  savedSets = savedSets.filter((s) => s.name != set.name);
  updateSetsList();

  if (setName == set.name) {
    reset();
  }
}

function replaySet(set) {
  reset();

  setName = set.name;
  setNameInput.value = set.name;

  repositionTime = set.reposition;
  totalTime = set.duration;
  markings = set.markings;
  isSessionActive = true;
  isPaused = false;
  currentTime = 0;

  startTimer();
  startReposition();
  disabeButtons();
}

function reset() {
  isSessionActive = false;
  isPaused = false;
  currentTime = 0;
  totalTime = 1000;
  markings = [];
  markToDraw = null;
  currentSelectedMark = null;
  updateTimerDisplay();
  clearTimeout(markTimeout);
  clearTimeout(repositionTimeout);
  if (timerId != null) {
    clearInterval(timerId);
    timerId = null;
  }
  clearCanvas();
  toggleButtons();
  markEditor.style.display = "none";
}

// Start the timer
function startTimer() {
  timerId = setInterval(() => {
    if (currentTime >= totalTime) {
      reset();
      return;
    }

    if (isSessionActive && !isPaused) {
      currentTime++;
      updateTimerDisplay();
    }
  }, 1000);
}

let repositionTimeout = null;
// 1
function startReposition() {
  clearTimeout(markTimeout);
  repositionTimeout = setTimeout(() => {
    let rnd = Math.floor(Math.random() * markings.length);
    showMarking(markings[rnd]);
  }, repositionTime * 1000);
}

let markTimeout = null;
// 2
function showMarking(mark) {
  clearTimeout(repositionTimeout);
  markToDraw = mark;
  clearCanvas();
  markTimeout = setTimeout(() => {
    markToDraw = null;
    clearCanvas();
    startReposition();
  }, mark.duration * 1000);
}

// Update timer display
function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(currentTime);
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

// Clear canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCourt();
}

// Toggle buttons visibility
function toggleButtons() {
  // startSessionBtn.style.display = isSessionActive ? "none" : "inline";
  // endSessionBtn.style.display = isSessionActive ? "inline" : "none";
  // resumeSessionBtn.style.display =
  //   isSessionActive && isPaused ? "inline" : "none";
}

function disabeButtons() {
  saveSetBtn.style.display = "disable";
}
