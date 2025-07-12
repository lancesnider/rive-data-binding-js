import { Rive, Fit, Alignment, Layout } from "@rive-app/webgl2";
import "./styles.css";

const el = document.getElementById("rive-canvas");
const textEl = document.getElementById("your-name");

const GAME_DURATION = 60; // seconds
const TARGET_WIDTH = 141; // pixels
const TARGET_HEIGHT = 100; // pixels
const ARTBOARD_WIDTH = 800; // pixels
const ARTBOARD_HEIGHT = 600; // pixels
const TIME_UI_WIDTH = 200;
const TARGET_SPEED = 800; // ms

const numberOfBullets = 8; // how many bullets instances in the Rive file

// TO DO: This is just fake dat that needs to be stored somewhere
const gameData = {
  score: 0,
  timeLeft: 0,
  name: "",
  highScores: [
    {
      name: "AAA",
      score: 10
    },
    {
      name: "BBB",
      score: 8
    },
    {
      name: "CCC",
      score: 5
    },
    {
      name: "DDD",
      score: 3
    },
    {
      name: "7484",
      score: 1
    },
    {
      name: "AA111A",
      score: 10
    },
    {
      name: "BBB",
      score: 80
    },
    {
      name: "CC22C",
      score: 52
    },
    {
      name: "D33DD",
      score: 1
    },
    {
      name: "EE4E",
      score: 5
    }
  ]
}

const inputs = {
  bulletHoles: []
}
let targetIntervalId = undefined;

const placeTarget = () => {
  const halfTargetWidth = TARGET_WIDTH / 2;
  const halfTargetHeight = TARGET_HEIGHT / 2;

  // random x and y positions within the artboard bounds
  const y = Math.random() * (ARTBOARD_HEIGHT - TARGET_HEIGHT) + halfTargetHeight;
  inputs.targetY.value = y;

  // if target is above 410, x position must be at least 200px from the edge
  // This keeps it off the score and time UI elements
  if (y < 410) {
    const x = Math.random() * (ARTBOARD_WIDTH - TARGET_WIDTH) + halfTargetWidth;
    inputs.targetX.value = x;
  } else {
    const x = Math.random() * (ARTBOARD_WIDTH - TARGET_WIDTH - (TIME_UI_WIDTH * 2)) + halfTargetWidth + TIME_UI_WIDTH;
    inputs.targetX.value = x;
  }

  // create an interval to call this again in 1 second. If this is called before 1 second, cancel interval
  clearInterval(targetIntervalId)
  targetIntervalId = setTimeout(() => {
    placeTarget();
  }, TARGET_SPEED);
}

const getTop10 = (scores) => {
  // sort by score descending
  const sortedScores = scores.sort((a, b) => b.score - a.score);
  // slice top 10
  return sortedScores.slice(0, 10);
}

const initTextInput = (vmi) => {
  const focused = vmi.boolean("inputFocused");
  const textValue = vmi.string("name");

  // Listen for focus changes from Rive (click)
  focused.on((value) => {
    if (value) {
      textEl.focus();
    }
  });

  // listen for focus changes from HTML (tab, remove focus)
  textEl.addEventListener("focus", () => {
    focused.value = true;
  });
  textEl.addEventListener("blur", () => {
    focused.value = false;
  });

  // listen for HTML text value changes
  textEl.addEventListener("input", (event) => {
    const sanitized = event.target.value.replace(/[^a-zA-Z0-9]/g, "")
    const uppercase = sanitized.toUpperCase();

    gameData.name = uppercase;
    textValue.value = uppercase;
  });
}

const updateTime = (seconds) => {
  // convert seconds to minutes and seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedTime = `${minutes.toString()}:${remainingSeconds.toString().padStart(2, '0')}`;

  inputs.timeLeftString.value = formattedTime
}

let currentBulletId = 0

const clickListener = (event) => {
  // get the bounding rectangle of the canvas
  const rect = el.getBoundingClientRect();
  // get the x and y coordinates of the click relative to the canvas
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const currentBullet = inputs.bulletHoles[currentBulletId]

  currentBullet.number("x").value = x;
  currentBullet.number("y").value = y;
  currentBullet.trigger("bangTrigger").trigger();

  currentBulletId += 1;
  if (currentBulletId >= numberOfBullets) {
    currentBulletId = 0;
  }
}
const startGame = () => {
  gameData.score = 0;
  gameData.timeLeft = GAME_DURATION;
  updateTime(gameData.timeLeft);
  inputs.gameState.value = "playing";
  placeTarget()

  // add click listener to the canvas

  // stoppable countdown timer
  const timer = setInterval(() => {
    gameData.timeLeft -= 1;
    updateTime(gameData.timeLeft, inputs.timeLeftString);

    if (gameData.timeLeft <= 0) {
      clearInterval(timer);
      inputs.gameState.value = "gameOver";

      onGameOver();
    }
  }, 1000);

}

const onGameOver = () => {
  clearInterval(targetIntervalId)
  inputs.timeLeftString.value = "0:00";

  if (gameData.score > 0) {
    // TO DO: save high score
    gameData.highScores.push({
      name: gameData.name,
      score: gameData.score
    });
  }

  gameData.highScores = getTop10(gameData.highScores);

  for (let i = 0; i < 10; i++) {
    const highScoreVmi = inputs[`highScoreName${i}`];
    highScoreVmi.number("place").value = i + 1;
    highScoreVmi.string("name").value = gameData.highScores[i]?.name || "";
    highScoreVmi.number("score").value = gameData.highScores[i]?.score || 0;
  }
}

async function main() {
  const r = new Rive({
    src: "kill_comic_sans.riv",
    autoplay: true,
    autoBind: true,
    canvas: el,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    stateMachines: "State Machine 1",
    onLoad: () => {
      const vmi = r.viewModelInstance;

      inputs.gameState = vmi.enum("gameState");
      inputs.timeLeft = vmi.string("timeLeft");
      inputs.score = vmi.number("score");
      inputs.timeLeftString = vmi.string("timeLeft");
      inputs.startGameTrigger = vmi.trigger("startGame");
      inputs.targetHitTrigger = vmi.trigger("targetHit");
      inputs.inputFocused = vmi.boolean("inputFocused");
      inputs.scoreNumber = vmi.number("score");
      inputs.targetX = vmi.number("targetX");
      inputs.targetY = vmi.number("targetY");

      const vmiBulletHoles = vmi.viewModel("property of BulletHoles");

      for (let i = 0; i < numberOfBullets; i++) {
        inputs.bulletHoles[i] = vmiBulletHoles.viewModel(`property of BulletHole ${i + 1}`);
      }
      el.addEventListener("click", clickListener)

      // for loop 10 time
      for (let i = 0; i < 10; i++) {
        inputs[`highScoreName${i}`] = vmi.viewModel(`property of HighScore ${i + 1}`);
      }


      inputs.timeLeftString.value = "0:00"; // initial value

      const startGameTrigger = vmi.trigger("startGame");
      startGameTrigger.on(() => {
        if (inputs.gameState.value !== "playing") {
          inputs.scoreNumber.value = 0;
          startGame();
        }
      })

      const targetHitTrigger = vmi.trigger("targetHit");
      targetHitTrigger.on(() => {
        console.log("target hit");
        gameData.score += 1;
        inputs.scoreNumber.value = gameData.score;
        placeTarget();
      });

      // Set up the "enter name" text input
      initTextInput(vmi);

      // resize rive on init
      r.resizeDrawingSurfaceToCanvas();
    },
  });

  window.addEventListener(
    "resize",
    () => {
      r.resizeDrawingSurfaceToCanvas();
    },
    false
  );
}


main();
