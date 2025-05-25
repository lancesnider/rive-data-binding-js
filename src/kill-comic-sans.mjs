import { Rive, Fit, Alignment, Layout } from "@rive-app/webgl2";
import "./styles.css";

const el = document.getElementById("rive-canvas");
const textEl = document.getElementById("your-name");

const GAME_DURATION = 5; // seconds

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

const updateTime = (seconds, timeLeftNumber) => {
  // convert seconds to minutes and seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedTime = `${minutes.toString()}:${remainingSeconds.toString().padStart(2, '0')}`;

  timeLeftNumber.value = formattedTime
}

const startGame = (gameState, timeLeftNumber) => {
  gameData.score = 0;
  gameData.timeLeft = GAME_DURATION;
  updateTime(gameData.timeLeft, timeLeftNumber);
  gameState.value = "playing";

  // stoppable countdown timer
  const timer = setInterval(() => {
    gameData.timeLeft -= 1;
    updateTime(gameData.timeLeft, timeLeftNumber);

    if (gameData.timeLeft <= 0) {
      clearInterval(timer);
      gameState.value = "gameOver";

      onGameOver();
    }
  }, 1000);

}

const onGameOver = () => {
  gameData.highScores.push({
    name: gameData.name,
    score: gameData.score
  });
  gameData.highScores = getTop10(gameData.highScores);
  console.log(gameData.highScores);
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
      console.log("vmi.properties", vmi.properties);

      const gameState = vmi.enum("gameState");
      const timeLeftNumber = vmi.string("timeLeft");
      const scoreNumber = vmi.number("score");

      const startGameTrigger = vmi.trigger("startGame");
      startGameTrigger.on(() => {
        console.log("start game trigger pressed");
        scoreNumber.value = 0;
        startGame(gameState, timeLeftNumber);
      })

      const targetHitTrigger = vmi.trigger("targetHit");
      targetHitTrigger.on(() => {
        console.log("target hit");
        gameData.score += 1;
        scoreNumber.value = gameData.score;
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
