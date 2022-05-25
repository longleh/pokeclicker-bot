// ==UserScript==
// @name         PokeCAutoGym
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Launch the gym of the town you're currently in (for free)
// @author       longleh
// @match        https://www.pokeclicker.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pokeclicker.com
// @grant        unsafeWindow
// ==/UserScript==

// ms, 50 = 0.05sec
let autoGymTimer = 50;
let autoGymIntervalId = 0;
let interfaceIntervalId = 0;

const loggerType = {
  on: "green",
  off: "red",
  info: "purple",
};

const logger = (message, type = loggerType.on) => {
  console.log(`%c ${message}`, `color: ${type}`);
};

(function () {
  "use strict";
  const isRunning = () => autoGymIntervalId !== 0;
  const inTownWithGym = () => App.game.gameState === GameConstants.GameState.town && GameConstants.getGymIndex(player.town().name) !== -1

  const autogym = () => {
    logger("AUTOGYM: ON");
    autoGymIntervalId = setInterval(() => {
        if (inTownWithGym()) {
          const townContent = player.town().content;
          let gymFound = false;
          townContent.forEach((c) => {
            if (!gymFound && c instanceof Gym) {
              c.onclick();
              gymFound = true;
            }
          })
      }
    }, autoGymTimer);
  };

  const stopAutoGym = () => {
    logger("AUTOGYM: OFF", loggerType.off);
    clearInterval(autoGymIntervalId);
    autoGymIntervalId = 0;
  };

  const generateInput = () => {
    const inputContainer = document.createElement("div");
    inputContainer.className = "pokebot-feature-container";
    const span = document.createElement("span");
    span.innerText = "Gym";
    const button = document.createElement("button");
    button.className = "pokebot-button pokebot-enable";
    button.innerHTML = "ENABLE";
    button.addEventListener("click", () => {
      if (isRunning()) {
        button.classList.remove("pokebot-disable");
        button.classList.add("pokebot-enable");
        button.innerText = "ENABLE";
        stopAutoGym();
      } else {
        button.classList.remove("pokebot-enable");
        button.classList.add("pokebot-disable");
        button.innerText = "DISABLE";
        autogym();
      }
    });
    inputContainer.appendChild(span);
    inputContainer.appendChild(button);
    document
      .getElementById("pokebot-interface-body")
      .appendChild(inputContainer);
  };

  const waitForInterface = () => {
    interfaceIntervalId = setInterval(() => {
      if (
        document.getElementById("pokebot-interface-body") &&
        unsafeWindow.getComputedStyle(
          document.getElementById("pokebot-interface-body")
        ).display !== "none"
      ) {
    logger("GENERATING AUTOGYM INTERFACE", loggerType.info);
        generateInput();
        clearInterval(interfaceIntervalId);
        interfaceIntervalId = 0;
      }
    }, 5000);
  };

  waitForInterface();

  logger("AUTOGYM SCRIPT: LOADED", loggerType.info);
})();
