// ==UserScript==
// @name         PokeCAutoClick
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  An autoclicker script for Pokéclicker
// @author       longleh
// @match        https://www.pokeclicker.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pokeclicker.com
// @grant        unsafeWindow
// ==/UserScript==

// ms, 50 = 0.05sec
let clickAttackTime = 50;
let clickAttackIntervalId = 0;
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
  const isRunning = () => clickAttackIntervalId !== 0;

  const autoClickGym = () => {
    GymBattle.clickAttack();
  };

  const autoClickDungeon = () => {
    DungeonRunner.handleClick();
  };

  const autoclickFighting = () => {
    if (Battle.enemyPokemon()?.isAlive()) {
      Battle.clickAttack();
    }
  };

  const autoclick = () => {
    logger("AUTOCLICKER: ON");
    clickAttackIntervalId = setInterval(() => {
      switch (App.game.gameState) {
        case GameConstants.GameState.dungeon:
          autoClickDungeon();
          break;
        case GameConstants.GameState.gym:
          autoClickGym();
          break;
        case GameConstants.GameState.fighting:
          autoclickFighting();
          break;
        default:
          break;
      }
    }, clickAttackTime);
  };

  const stopAutoclick = () => {
    logger("AUTOCLICKER: OFF", loggerType.off);
    clearInterval(clickAttackIntervalId);
    clickAttackIntervalId = 0;
  };

  const generateInput = () => {
    const inputContainer = document.createElement("div");
    inputContainer.className = "pokebot-feature-container";
    const span = document.createElement("span");
    span.innerText = "Click";
    const button = document.createElement("button");
    button.className = "pokebot-button pokebot-enable";
    button.innerHTML = "ENABLE";
    button.addEventListener("click", () => {
      if (isRunning()) {
        button.classList.remove("pokebot-disable");
        button.classList.add("pokebot-enable");
        button.innerText = "ENABLE";
        stopAutoclick();
      } else {
        button.classList.remove("pokebot-enable");
        button.classList.add("pokebot-disable");
        button.innerText = "DISABLE";
        autoclick();
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
        logger("GENERATING AUTOCLICK INTERFACE", loggerType.info);
        generateInput();
        clearInterval(interfaceIntervalId);
        interfaceIntervalId = 0;
      }
    }, 5000);
  };

  waitForInterface();

  logger("AUTOCLICKER SCRIPT: LOADED", loggerType.info);
})();
