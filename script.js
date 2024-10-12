const canvas = document.getElementById("courtCanvas");
const ctx = canvas.getContext("2d");
const sessionNameInput = document.getElementById("sessionName");
const timerDisplay = document.getElementById("timer");
const startSessionBtn = document.getElementById("startSessionBtn");
const endSessionBtn = document.getElementById("endSessionBtn");
const resumeSessionBtn = document.getElementById("resumeSessionBtn");
const savedSessionsList = document.getElementById("savedSessionsList");
const clearCanvasBtn = document.getElementById("clearCanvasBtn");

let selectedShape = "circle";
let markings = [];
let sessionName = "";
let currentTime = 0; // elapsed time
let isSessionActive = false;
let timerId = null;
let isPaused = false;
let savedSessions = [];

window.onload = function() {
  drawCourt();
}

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

 markings.forEach(drawShape);
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


// Place shape on click
canvas.addEventListener("click", (event) => {
  if (!isSessionActive) return;

  const rect = canvas.getBoundingClientRect();
  const position = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };

  // Pause the session
  isPaused = true;

  // Save the shape and current time
  markings.push({ type: selectedShape, position, time: currentTime });
  drawShape({ type: selectedShape, position });

  // Resume after a brief pause
  setTimeout(() => {
    isPaused = false;
  }, 1000); // Pause for 1 second
});

// Start session
startSessionBtn.addEventListener("click", () => {
  sessionName = sessionNameInput.value;

    if( savedSessions.find( s => s.name == sessionName) ) 
    {
        return;
    }


  if (sessionName) {
    isSessionActive = true;
    currentTime = 0;
    markings = [];
    clearCanvas();
    startTimer();
    toggleButtons();
  }
});

// Stop session
endSessionBtn.addEventListener("click", () => {
  isSessionActive = false;
  clearInterval(timerId);
  saveSession();
  markings = [];
  clearCanvas();
  toggleButtons();
  currentTime = 0;
  updateTimerDisplay();
});

// Resume session
resumeSessionBtn.addEventListener("click", () => {
  isPaused = false;
});

// Save session to list
function saveSession() {
  const newSession = { name: sessionName, time: currentTime, markings };
  savedSessions.push(newSession);
  updateSavedSessionsList();
}

// Update saved sessions list
function updateSavedSessionsList() {
  savedSessionsList.innerHTML = "";
  savedSessions.forEach((session, index) => {
    const li = document.createElement("li");
    li.textContent = `${session.name} - ${formatTime(session.time)}`;

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
    savedSessions = savedSessions.filter(s => s.name != session.name);
    updateSavedSessionsList();
    markings = [];  
    clearCanvas();
}

function loadSession(session) {
  sessionNameInput.innerHTML = session.name;
  markings = session.markings;
  clearCanvas()
}

// Replay session
function replaySession(session) {
  return;
  clearCanvas();
  drawCourt();
  currentTime = 0;
  const replayDuration = session.totalTime;

  timerId = setInterval(() => {
    if (currentTime >= replayDuration) {
      clearInterval(timerId);
      return;
    }
    currentTime++;
    updateTimerDisplay();
  }, 1000);

  session.markings.forEach((mark) => {
    setTimeout(() => {
      drawShape(mark);
    }, mark.time * 1000);
  });
}

// Start the timer
function startTimer() {
  timerId = setInterval(() => {
    if (!isPaused) {
      currentTime++;
      updateTimerDisplay();
    //   if (currentTime >= totalTime) {
    //     clearInterval(timerId);
    //     endSessionBtn.click(); // End session automatically
    //   }
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


