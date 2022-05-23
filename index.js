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

  const recursiveBreed = (pkmnIndex, pkmnToHatch, breedModal) => {
    if (
      pkmnIndex < numberOfBreed &&
      breedModal.classList.contains("active") &&
      pkmnIndex < pkmToHatch.length
    ) {
      pkmToHatch[pkmnIndex].children[4].click();
      setTimeout(
        () => recursiveBreed(pkmnIndex++, pkmnToHatch, breedModal),
        1000
      );
    } else {
      logger("BREEDING: END", false);
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
    numberOfBreed = 0;
  };

  autoBreedingEventHandler.addEventListener("breed", breed);

  const autoclick = (time = 10) => {
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

  const autoBreedingFunc = () => {
    logger("AUTOBREEDING: ON");
    autoBreedingInterval = setInterval(() => {
      const eggs = htmlArrayToArray(
        document.getElementsByClassName("hatching")
      );
      let hatchedEggs = 0;
      if (eggs.length > 0) {
        eggs.forEach((egg) => egg.click());
        hatchedEggs++;
      }
      if (hatchedEggs > 0) {
        // open day care
        document
          .querySelector("[data-town='Pokemon Day Care']")
          .dispatchEvent(new Event("click"));
        setTimeout(() => {
          autoBreedingEventHandler.dispatchEvent(new Event("breed"));
        }, 3000);
      }
      hatchedEggs = 0;
    }, 10000);
  };

  const stopAutoBredding = () => {
    clearInterval(autoBreedingInterval);
    logger("AUTOBREEDING: OFF", false);
  };

  unsafeWindow.autoclick = autoclick;
  unsafeWindow.stop = stop;
  unsafeWindow.autobreeding = autoBreedingFunc;
  unsafeWindow.stopAutobreeding = stopAutoBredding;
  unsafeWindow._a = autoclick;
  unsafeWindow._s = stop;
  unsafeWindow._ab = autoBreedingFunc;
  unsafeWindow._sab = stopAutoBredding;
})();
