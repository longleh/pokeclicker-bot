// ==UserScript==
// @name         PokeCAutoBreeding
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  An autoclicker script for Pokéclicker
// @author       longleh
// @match        https://www.pokeclicker.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pokeclicker.com
// @grant        unsafeWindow
// ==/UserScript==

// ms, 50 = 0.05sec
let autoBreedingTime = 4000;
let autoBreedIntervalId = 0;
let interfaceIntervalId = 0;

// App.game.breeding._eggList[3]().hatch()

/*
      if (App.game.breeding.canBreedPokemon()) {
        const hatchList = PartyController.getHatcherySortedList();
        const pkmnToHatch = hatchList.length > 0 ? hatchList[0] : null;
        App.game.breeding.addPokemonToHatchery(pkmn);
      }

*/

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
  const isRunning = () => autoBreedIntervalId !== 0;
  const shouldBreedNewPokemon = () => !!App.game.breeding.canBreedPokemon() && App.game.breeding.queueList().length === 0

  const autobreedRecursive = (index) => {
    const eggs = App.game.breeding._eggList;
    if (index >= eggs.length) {
      return;
    }
    if (eggs[index]().canHatch()) {
      App.game.breeding.hatchPokemonEgg(index);
      // re-check the current index in case of shuffle
      return autobreedRecursive(index);
    }
    return autobreedRecursive(++index);
  };

  const checkForHatchingRecursive = (index) => {
    if (!!!App.game.breeding.canBreedPokemon()) {
      return;
    }
    const hatchList = PartyController.getHatcherySortedList();
    const pkmnToHatch = hatchList.length > 0 ? hatchList[index] : null;
    if (!pkmnToHatch) {
      
      return;
    }
    if (BreedingController.visible(pkmnToHatch)())
      App.game.breeding.addPokemonToHatchery(pkmnToHatch);
    checkForHatchingRecursive(++index);
  };

  const autobreed = () => {
    logger("AUTOBREEDING: ON");
    autoBreedIntervalId = setInterval(() => {
      autobreedRecursive(0);
      if (shouldBreedNewPokemon()) {
        BreedingController.openBreedingModal();
        setTimeout(() => {
          checkForHatchingRecursive(0);
          App.game.breeding.checkCloseModal();
        }, 1500);
      }
    }, autoBreedingTime);
  };

  const stopAutobreed = () => {
    logger("AUTOBREEDING: OFF", loggerType.off);
    clearInterval(autoBreedIntervalId);
    autoBreedIntervalId = 0;
  };

  const generateInput = () => {
    const inputContainer = document.createElement("div");
    inputContainer.className = "pokebot-feature-container";
    const span = document.createElement("span");
    span.innerText = "Breeding";
    const button = document.createElement("button");
    button.className = "pokebot-button pokebot-enable";
    button.innerHTML = "ENABLE";
    button.addEventListener("click", () => {
      if (isRunning()) {
        button.classList.remove("pokebot-disable");
        button.classList.add("pokebot-enable");
        button.innerText = "ENABLE";
        stopAutobreed();
      } else {
        button.classList.remove("pokebot-enable");
        button.classList.add("pokebot-disable");
        button.innerText = "DISABLE";
        autobreed();
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
        logger("GENERATING AUTOBREED INTERFACE", loggerType.info);
        generateInput();
        clearInterval(interfaceIntervalId);
        interfaceIntervalId = 0;
      }
    }, 5000);
  };

  waitForInterface();

  logger("AUTOBREDD SCRIPT: LOADED", loggerType.info);
})();
