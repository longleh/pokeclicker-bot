// ==UserScript==
// @name         Pokeclicker Bot
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  simple bot injected on pokéclicker
// @author       longleh
// @match        https://www.pokeclicker.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pokeclicker.com
// @grant        unsafeWindow
// ==/UserScript==

const htmlArrayToArray = (htmlArray) => {
  if (htmlArray.length === 0) return [];
  return [...htmlArray];
};

const logger = (message, on = true) => {
  const color = on ? "green" : "red";
  console.log(`%c ${message}`, `color: ${color}`);
};

(function () {
  "use strict";
  let autoClickInterval;
  let autoBreedingInterval;
  let numberOfBreed = 0;
  const enemy = document.getElementsByClassName("enemy")?.[0];
  const autoBreedingEventHandler = document.createElement("div");

  const recursiveBreed = (pkmnIndex, pkmnToHatch) => {
    if (pkmnIndex < numberOfBreed && pkmnIndex < pkmnToHatch.length) {
      pkmnToHatch[pkmnIndex].children[4].click();
      setTimeout(() => recursiveBreed(pkmnIndex + 1, pkmnToHatch), 1000);
    } else {
      logger("BREEDING: END", false);
      numberOfBreed = 0;
      return "OK";
    }
  };

  const breed = () => {
    const pkmToHatch = htmlArrayToArray(
      document.querySelectorAll("li.eggSlot:not([style*=display])")
    );
    logger("BREEDING: START");
    const breedModal = document.getElementById("breeding-pokemon");
    recursiveBreed(0, pkmToHatch, breedModal);
  };

  autoBreedingEventHandler.addEventListener("breed", breed);

  const autoclick = (time = 60) => {
    logger("AUTOCLICK: ON");
    autoClickInterval = setInterval(() => {
      enemy.click();
    }, time);
    return autoClickInterval;
  };

  const stop = () => {
    clearInterval(autoClickInterval);
    logger("AUTOCLICK: OFF", false);
  };

  const openDayCare = () => {
    if (numberOfBreed > 0) {
      // open day care
      document
        .querySelector("[data-town='Pokemon Day Care']")
        .dispatchEvent(new Event("click"));
      setTimeout(() => {
        autoBreedingEventHandler.dispatchEvent(new Event("breed"));
      }, 2000);
    }
  };

  const recursiveEggHatching = (numberOfEggs) => {
    if (numberOfEggs === 0) {
      return openDayCare();
    }
    const e = htmlArrayToArray(document.getElementsByClassName("hatching"));
    e[0].click();
    setTimeout(() => recursiveEggHatching(numberOfEggs - 1), 1000);
  };

  const autoBreedingFunc = () => {
    logger("AUTOBREEDING: ON");
    autoBreedingInterval = setInterval(() => {
      const eggs = htmlArrayToArray(
        document.getElementsByClassName("hatching")
      );
      if (eggs.length > 0) {
        numberOfBreed = eggs.length;
        recursiveEggHatching(numberOfBreed);
      }
    }, 10000);
  };

  const stopAutoBredding = () => {
    clearInterval(autoBreedingInterval);
    logger("AUTOBREEDING: OFF", false);
  };

  const generateInput = (label, onListener, offListener) => {
    const inputContainer = document.createElement("div");
    inputContainer.style.display = 'flex'
    inputContainer.style.margin = '8px'
    inputContainer.style.justifyContent = 'space-evenly'
    const span = document.createElement("span");
    span.innerText = label;
    const checkbox = document.createElement("input");
    checkbox.type = 'checkbox'
    checkbox.addEventListener("change", (event) => {
      if (event.currentTarget.checked) {
        onListener();
      } else {
        offListener();
      }
    });
    inputContainer.appendChild(span);
    inputContainer.appendChild(checkbox);
    return inputContainer
  };

  const generateInterface = () => {
    const container = document.createElement("div");
    container.className =
      "pokebot card sortable border-secondary mb-3 sortable-chosen";
    container.style.zIndex = "999";
    const cardHeader = document.createElement("div");
    cardHeader.className = "card-header p-0";
    const cardHeaderText = document.createElement("span");
    cardHeaderText.innerText = "Pokeclicker Bot";
    const cardBody = document.createElement("div");
    cardBody.className = "card-body p-0 show";
    const autoclickInput = generateInput('Autoclick', autoclick, stop)
    const autoBreedingInput = generateInput('AutoBreeding', autoBreedingFunc, stopAutoBredding)
    cardHeader.appendChild(cardHeaderText);
    container.appendChild(cardHeader);
    cardBody.appendChild(autoclickInput)
    cardBody.appendChild(autoBreedingInput)
    container.appendChild(cardBody);

    document.getElementById("right-column").appendChild(container);
  };

  const waitForGame = () => {
    const intervalGameId = setInterval(() => {
      if (
        unsafeWindow.getComputedStyle(document.getElementById("game"))
          .display !== "none"
      ) {
        logger("GENERATING INTERFACE");
        generateInterface();
        clearInterval(intervalGameId);
      } else {
        logger("WAITING FOR THE GAME TO LAUNCH INTERFACE", false);
      }
    }, 5000);
  };

  // waitForGame();

  unsafeWindow.autoclick = autoclick;
  unsafeWindow.stop = stop;
  unsafeWindow.autobreeding = autoBreedingFunc;
  unsafeWindow.stopAutobreeding = stopAutoBredding;
  unsafeWindow._a = autoclick;
  unsafeWindow._s = stop;
  unsafeWindow._ab = autoBreedingFunc;
  unsafeWindow._sab = stopAutoBredding;
})();
