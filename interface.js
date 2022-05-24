// ==UserScript==
// @name         PokeCAutoInterface
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  A small interface to enable the auto features
// @author       longleh
// @match        https://www.pokeclicker.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pokeclicker.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// ==/UserScript==

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
  const intervalGameId = 0;
  const generateInterface = () => {
    const container = document.createElement("div");
    container.className = "card sortable border-secondary mb-3 sortable-chosen";
    container.id = "pokebot-interface-header";
    container.style.zIndex = "999";
    const cardHeader = document.createElement("div");
    cardHeader.className = "card-header p-0";
    const cardHeaderText = document.createElement("span");
    cardHeaderText.innerText = "Automation";
    const cardBody = document.createElement("div");
    cardBody.className = "card-body p-0 show";
    cardBody.id = "pokebot-interface-body";
    cardHeader.appendChild(cardHeaderText);
    container.appendChild(cardHeader);
    container.appendChild(cardBody);

    document.getElementById("right-column").appendChild(container);
  };

  const waitForGame = () => {
    const intervalGameId = setInterval(() => {
      if (
        unsafeWindow.getComputedStyle(document.getElementById("game"))
          .display !== "none"
      ) {
        logger("GENERATING INTERFACE", loggerType.info);
        generateInterface();
        clearInterval(intervalGameId);
      }
    }, 5000);
  };

  waitForGame();
  GM_addStyle(".pokebot-feature-container {  display: flex;  justify-content: space-between;  margin: 8px 16px 0px 16px; font-weight: lighter;}.pokebot-button {  width: 40%;  border: none;  border-radius: 10%;  transition: background 0.5s;  font-weight: bold; background: unset;}.pokebot-button.pokebot-enable {  color: #388E3C;}.pokebot-button.pokebot-disable {  color: #D32F2F;}.pokebot-button.pokebot-enable:hover {  background: #C8E6C9;}.pokebot-button.pokebot-disable:hover {  background: #FFCDD2;}")
})();
