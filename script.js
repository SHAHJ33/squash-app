const canvas = document.getElementById("courtCanvas");
const ctx = canvas.getContext("2d");
const sessionNameInput = document.getElementById("sessionName");
const timerDisplay = document.getElementById("timer");
const startSessionBtn = document.getElementById("startSessionBtn");
const endSessionBtn = document.getElementById("endSessionBtn");
const resumeSessionBtn = document.getElementById("resumeSessionBtn");
const savedSessionsList = document.getElementById("savedSessionsList");
const clearCanvasBtn = document.getElementById("clearCanvasBtn");
const shapeNameInput = document.getElementById("shapeName");
const shapeDurationInput = document.getElementById("shapeDuration");

let selectedShape = "circle";
let markings = [];
let sessionName = "";
let currentTime = 0; // elapsed time
let totalTime = 1000;
let isSessionActive = false;
let timerId = null;
let isPaused = false;
let savedSessions = [];

window.onload = function () {
  drawCourt();
};

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

  markings.forEach((mark) => {
    const startTime = mark.time;
    const endTime = mark.time + mark.duration;

    if (currentTime >= startTime && currentTime <= endTime) {
      drawShape(mark);
    }
  });
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
  }
}

let position = {
  x: null,
  y: null,
};

// Place shape on click
canvas.addEventListener("click", (event) => {
  if (!isSessionActive) return;

   // Pause the session
   isPaused = true;
   toggleButtons();

  const rect = canvas.getBoundingClientRect();
  position = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };

  // Save the shape and current time
  drawShape({ type: selectedShape, position });

  // save the shape here
  const shapeName = shapeNameInput.value;
  const shapeDuration = shapeDurationInput.valueAsNumber;

  // shapeType = get this from the side menu
  markings.push({
    name: shapeName,
    type: selectedShape,
    position,
    time: currentTime,
    duration: shapeDuration,
  });
  
});

// Start session
startSessionBtn.addEventListener("click", () => {
  reset();

  sessionName = sessionNameInput.value;

  if (savedSessions.find((s) => s.name == sessionName)) {
    return;
  }

  if (sessionName) {
    isSessionActive = true;
    isPaused = false;
    startTimer();
    toggleButtons();
  }
});

// Stop session
endSessionBtn.addEventListener("click", () => {
  saveSession();
  reset();
});

// Resume session
resumeSessionBtn.addEventListener("click", () => {
  isPaused = false;
  toggleButtons();
  clearCanvas();
});

// Save session to list
function saveSession() {
  const newSession = { name: sessionName, totalTime: currentTime, markings };
  savedSessions.push(newSession);
  updateSavedSessionsList();
}

// Update saved sessions list
function updateSavedSessionsList() {
  savedSessionsList.innerHTML = "";
  savedSessions.forEach((session, index) => {
    const li = document.createElement("li");
    li.textContent = `${session.name} - ${formatTime(session.totalTime)}`;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => deleteSession(session);
    li.appendChild(deleteButton);

    const loadButton = document.createElement("button");
    loadButton.textContent = "Load";
    loadButton.onclick = () => loadSession(session);
    li.appendChild(loadButton);

    savedSessionsList.appendChild(li);
  });
}

function deleteSession(session) {
  savedSessions = savedSessions.filter((s) => s.name != session.name);
  updateSavedSessionsList();

  if (sessionName == session.name) {
    reset();
  }
}

function loadSession(session) {
  reset();

  sessionName = session.name;
  sessionNameInput.innerHTML = session.name;

  totalTime = session.totalTime;
  markings = session.markings;
  isSessionActive = true;
  isPaused = false;

  startTimer();
  disabeButtons();
}

function reset() {
  isSessionActive = false;
  isPaused = false;
  currentTime = 0;
  totalTime = 1000;
  updateTimerDisplay();
  markings = [];
  clearCanvas();
  if (timerId != null) {
    clearInterval(timerId);
    timerId = null;
  }
  toggleButtons();
}

// Start the timer
function startTimer() {
  timerId = setInterval(() => {

    if(currentTime >= totalTime) {
      reset();
      return;
    }

    if (isSessionActive && !isPaused) {
      currentTime++;
      updateTimerDisplay();
      clearCanvas();
    }
  }, 1000);
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
  startSessionBtn.style.display = isSessionActive ? "none" : "inline";
  endSessionBtn.style.display = isSessionActive ? "inline" : "none";
  resumeSessionBtn.style.display =
    isSessionActive && isPaused ? "inline" : "none";
}

function disabeButtons() {
  startSessionBtn.style.display = "none";
  endSessionBtn.style.display = "none";
  resumeSessionBtn.style.display = "none";
}
