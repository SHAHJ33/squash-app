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
const colorPicker = document.getElementById("shape-color");

let shape = "square";
let markings = [];
let setName = "";
let currentTime = 0; // elapsed time
let totalTime = 1000;
let repositionTime = 3;
let isSessionActive = false;
let timerId = null;
let isPaused = false;
let savedSets = [];

const OUTLINE_COLOR = "#FF0000";
const MARK_COLOR = "FFFFFF"; 

window.onload = function () {
  reset();
};

let markToDraw = null;

// Draw the court
function drawCourt() {
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
    if (markToDraw != null) {
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
    ctx.arc(position.x, position.y, 20, 0, 2 * Math.PI); // Circle with radius 20
    ctx.fill();
  } else if (type === "square") {
    ctx.beginPath();
    ctx.fillRect(
      position.x - size.width / 2,
      position.y - size.height / 2,
      size.width,
      size.height
    );
    if(mark.isSelected) {
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
    markNameInput.value = currentSelectedMark.name;
    markDurationInput.valueAsNumber = currentSelectedMark.duration;
    colorPicker.value = currentSelectedMark.color;
    currentSelectedMark.isSelected = true;
    markings = markings.map( mark => {
        if(mark.id == currentSelectedMark.id) {
          return {...mark, isSelected: true }
        }
        else {
          return {...mark, isSelected: false }
        }
    });

  } else {
    
    // show the editor
    markEditor.style.display = "inline";
    markNameInput.value = "Short";
    markDurationInput.valueAsNumber = 2;

    currentSelectedMark = {
      id: Date.now(),
      name: markNameInput.value,
      duration: markDurationInput.valueAsNumber,
      type: shape,
      position,
      size,
      color: colorPicker.value,
      isSelected: true,
    };
    
    markings.forEach( mark => {
      mark.isSelected = false;
    });

    markings.push(currentSelectedMark);
  }

  drawCourt();
});

function findMark(x, y) {
  let result = null;

  markings.forEach((mark) => {
    if (
      x >= mark.position.x - 10 &&
      x <= mark.position.x + 10 &&
      y >= mark.position.y - 10 &&
      y <= mark.position.y + 10
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

    currentSelectedMark.name = markNameInput.value;
    currentSelectedMark.duration = markDurationInput.valueAsNumber;
    currentSelectedMark.color = colorPicker.value;

    markings.push(currentSelectedMark);
    currentSelectedMark = null;
  }
  markEditor.style.display = "none";
  
  drawCourt();
});

deleteMarkBtn.addEventListener("click", () => {
  if (currentSelectedMark != null) {
    markings = markings.filter((m) => m.id != currentSelectedMark.id);
    currentSelectedMark = null;
  }
  markEditor.style.display = "none";
  
  drawCourt();
});

// Stop session
saveSetBtn.addEventListener("click", () => {
  if (setNameInput.value == "") {
    alert("Set name cannot be empty.");
    return;
  }

  if (setDurationInput.value == "") {
    alert("Set duration cannot be empty.");
    return;
  }

  if (setRepositionInput.value == "") {
    alert("Set reposition time cannot be empty.");
    return;
  }

  if (savedSets.find((s) => s.name == setNameInput.value)) {
    alert("Set name should be unique.");
    return;
  }

  if (markings.length == 0) {
    alert(
      "Cannot save an empty set. The set should have 1 or more markings on the court."
    );
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
  saveSetBtn.style.display = "inline";
  
});

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
    saveSetBtn.style.display = "inline";
  }
}

function replaySet(set) {
  reset();
  saveSetBtn.style.display = "none";

  setName = set.name;
  setNameInput.value = set.name;
  setDurationInput.value = set.duration;
  setRepositionInput.value = set.reposition;

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
  clearInterval(timerId);
  
  setNameInput.value = "";
  setDurationInput.value = "";
  setRepositionInput.value = "";
  markEditor.style.display = "none";

  drawCourt();
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
  drawCourt();

  markTimeout = setTimeout(() => {
    markToDraw = null;
    drawCourt();
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

function disabeButtons() {
  saveSetBtn.style.display = "disable";
}
