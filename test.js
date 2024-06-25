// ==UserScript==
// @name                Link Editor with Element Inspector
// @description         Adds title attribute to specified elements, target attribute to related <a> tags, and includes an element inspector
// @version             1.1.0
// @author              Yos_sy17 (modified by Assistant)
// @match               *://*/*
// @namespace           http://tampermonkey.net/
// @icon                data:image/
// @license             MIT
// @run-at              document-end
// @grant               GM_addStyle
// @grant               GM_registerMenuCommand
// @grant               GM_setValue
// @grant               GM_getValue
// ==/UserScript==

(function () {
  "use strict";

  const STORAGE_KEY = "linkEditorSelectorMemoPairs";
  let selectorMemoPairs = [];

  function loadSelectorMemoPairs() {
    const storedData = GM_getValue(STORAGE_KEY, []);
    if (Array.isArray(storedData)) {
      selectorMemoPairs = storedData;
    }
  }

  function saveSelectorMemoPairs() {
    GM_setValue(STORAGE_KEY, selectorMemoPairs);
  }

  function addTitleAndTargetToElements() {
    selectorMemoPairs.forEach(
      ({ memo, selector, isEnabled, urlPattern, openInNewTab }) => {
        try {
          if (isEnabled && matchesCurrentURL(urlPattern)) {
            document.querySelectorAll(selector).forEach((element) => {
              // Find related <a> tags and add attributes
              const relatedATags = element.closest("a");
              if (relatedATags) {
                if (!relatedATags.title) {
                  relatedATags.title = memo; // Use memo as title attribute
                }
                if (openInNewTab) {
                  relatedATags.setAttribute("target", "_blank");
                } else {
                  relatedATags.removeAttribute("target");
                }
              }
            });
          }
        } catch (error) {
          console.error("Error adding title and target:", error);
        }
      }
    );
  }

  function observeDOMChanges() {
    const observer = new MutationObserver((mutationsList) => {
      mutationsList.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          addTitleAndTargetToElements();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function createPairElement({
    memo = "",
    selector = "",
    isEnabled = true,
    urlPattern = getCurrentURLPattern(),
    openInNewTab = false,
  } = {}) {
    const pairDiv = document.createElement("div");
    pairDiv.className = "linkEditorContainer__selector-pair";

    pairDiv.innerHTML = `
      <label>Title:</label>
      <input type="text" class="linkEditorContainer__memo-input" placeholder="Memo" value="${memo}">
      <label>Selector:</label>
      <input type="text" class="linkEditorContainer__selector-input" placeholder="Selector" value="${selector}">
      <label>URL Pattern:</label>
      <input type="text" class="linkEditorContainer__url-pattern-input" placeholder="URL Pattern" value="${urlPattern}">
      <div class="linkEditorContainer__toggle__checkbox">
        <label for="linkEditorContainer__open-in-new-tab-checkbox">On / OFF</label>
        <input type="checkbox" class="linkEditorContainer__on-off-switching__checkbox" ${isEnabled ? "checked" : ""}>
        <label for="linkEditorContainer__open-in-new-tab-checkbox">Open in new tab:</label>
        <input type="checkbox" id="linkEditorContainer__open-in-new-tab-checkbox" class="linkEditorContainer__open-in-new-tab-checkbox" ${openInNewTab ? "checked" : ""}>
      </div>
      <div class="linkEditorContainer__btn-wrapper">
        <div class="linkEditorContainer__move-btn">
          <button class="linkEditorContainer__move-up-btn">◀</button>
          <button class="linkEditorContainer__move-down-btn">▶</button>
        </div>
        <button class="linkEditorContainer__remove-btn">🗑️</button>
      </div>
    `;

    const memoInput = pairDiv.querySelector(".linkEditorContainer__memo-input");
    const selectorInput = pairDiv.querySelector(
      ".linkEditorContainer__selector-input"
    );
    const urlPatternInput = pairDiv.querySelector(
      ".linkEditorContainer__url-pattern-input"
    );
    const toggleCheckbox = pairDiv.querySelector(
      ".linkEditorContainer__on-off-switching__checkbox"
    );
    const openInNewTabCheckbox = pairDiv.querySelector(
      ".linkEditorContainer__open-in-new-tab-checkbox"
    );

    memoInput.addEventListener("input", updateSelectorMemoPairs);
    selectorInput.addEventListener("input", updateSelectorMemoPairs);
    urlPatternInput.addEventListener("input", updateSelectorMemoPairs);
    toggleCheckbox.addEventListener("change", updateSelectorMemoPairs);
    openInNewTabCheckbox.addEventListener("change", updateSelectorMemoPairs);

    pairDiv
      .querySelector(".linkEditorContainer__remove-btn")
      .addEventListener("click", () => {
        if (confirm("Are you sure you want to remove this selector?")) {
          pairDiv.remove();
          updateSelectorMemoPairs();
        }
      });

    pairDiv
      .querySelector(".linkEditorContainer__move-up-btn")
      .addEventListener("click", () => {
        movePair(pairDiv, -1);
      });

    pairDiv
      .querySelector(".linkEditorContainer__move-down-btn")
      .addEventListener("click", () => {
        movePair(pairDiv, 1);
      });

    return pairDiv;
  }

  function movePair(pairDiv, direction) {
    const parent = pairDiv.parentNode;
    const currentIndex = Array.from(parent.children).indexOf(pairDiv);
    const newIndex = currentIndex + direction;

    if (newIndex >= 0 && newIndex < parent.children.length) {
      if (direction === 1) {
        parent.insertBefore(pairDiv, parent.children[newIndex].nextSibling);
      } else {
        parent.insertBefore(pairDiv, parent.children[newIndex]);
      }
      updateSelectorMemoPairs();
    }
  }

  function updateSelectorMemoPairs() {
    const pairElements = document.querySelectorAll(
      ".linkEditorContainer__selector-pair"
    );
    selectorMemoPairs = Array.from(pairElements)
      .map((pairElement) => ({
        memo: pairElement
          .querySelector(".linkEditorContainer__memo-input")
          .value.trim(),
        selector: pairElement
          .querySelector(".linkEditorContainer__selector-input")
          .value.trim(),
        isEnabled: pairElement.querySelector(
          ".linkEditorContainer__on-off-switching__checkbox"
        ).checked,
        urlPattern: pairElement
          .querySelector(".linkEditorContainer__url-pattern-input")
          .value.trim(),
        openInNewTab: pairElement.querySelector(
          ".linkEditorContainer__open-in-new-tab-checkbox"
        ).checked,
      }))
      .filter(({ selector }) => selector);

    saveSelectorMemoPairs();
    addTitleAndTargetToElements();

    // Update the total count in the header
    document.getElementById("totalCount").textContent =
      `Total: ${selectorMemoPairs.length}`;
  }

  function getCurrentURLPattern() {
    return window.location.origin + "/*"; // Default matches all paths
  }

  function matchesCurrentURL(urlPattern) {
    const currentURL = window.location.href;
    try {
      const regex = new RegExp(urlPattern);
      return regex.test(currentURL);
    } catch (error) {
      console.error("Error matching URL:", error);
      return false;
    }
  }

  function createSettingsUI() {
    let settingsDiv = document.getElementById("linkEditorContainer");
    if (!settingsDiv) {
      settingsDiv = document.createElement("div");
      settingsDiv.id = "linkEditorContainer";
      settingsDiv.className = "linkEditorContainer";

      settingsDiv.innerHTML = `
        <div class="linkEditorContainer__header">
          <h3>⚙️Settings</h3>
          <span id="totalCount">Total: ${selectorMemoPairs.length}</span>
          <button class="linkEditorContainer__close-btn">×</button>
        </div>
        <div class="linkEditorContainer__content"></div>
        <button id="add-selector" class="linkEditorContainer__add-btn">+</button>
        <button id="toggle-inspect" class="linkEditorContainer__inspect-btn">🔍</button>
      `;

      GM_addStyle(`
        .linkEditorContainer {
          font-family: "Noto Sans JP", sans-serif;
          margin: 0;
          padding: 0 15px;
          box-sizing: border-box;
          position: fixed;
          top: 20px;
          left: 20px;
          background: #fff;
          color: #000;
          border: 1px solid #ccc;
          border-radius: 8px;
          z-index: 2147483647;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          pointer-events: auto;
          width: 1000px;
          min-width: 350px;
          min-height: 660px;
          max-height: 660px;
          resize: both;
          overflow: auto;
        }

        .linkEditorContainer__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 65px;
          cursor: grab;
          margin-block: 5px;
          border-bottom: 1px solid #eee;
          resize: horizontal;
        }

        .linkEditorContainer__header:active {
          cursor: grabbing;
        }

        .linkEditorContainer__header h3 {
          margin: 0;
          font-size: 18px;
          color: #333;
        }

        .linkEditorContainer__header #totalCount {
          font-size: 16px;
          color: #333;
        }

        .linkEditorContainer__header button {
          font-size: 20px;
          cursor: pointer;
          color: #888;
          transition: color 0.3s ease;
        }

        .linkEditorContainer__header button:hover {
          color: #555;
        }

        .linkEditorContainer__content {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
          margin-block: 10px;
          max-height: 525px;
          overflow-y: auto;
        }

        .linkEditorContainer__add-btn {
          padding: 8px 12px;
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .linkEditorContainer__add-btn:hover {
          background-color: #e0e0e0;
        }

        .linkEditorContainer__toggle__checkbox {
          display: flex;
        }

        .linkEditorContainer__on-off-switching__checkbox,
        .linkEditorContainer__open-in-new-tab-checkbox {
          margin-left: 8px;
        }

        input[type="checkbox"] {
          display: block !important;
        }

        .linkEditorContainer__selector-pair {
          display: flex;
          flex-direction: column;
          border: 1px solid #ccc;
          padding: 8px;
          border-radius: 4px;
          background-color: #f9f9f9;
        }

        .linkEditorContainer__selector-pair label {
          font-weight: bold;
          margin-bottom: 4px;
        }

        .linkEditorContainer__memo-input,
        .linkEditorContainer__selector-input,
        .linkEditorContainer__url-pattern-input {
          flex: 1;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .linkEditorContainer__btn-wrapper,
        .linkEditorContainer__checkbox,
        .linkEditorContainer__move-btn {
          display: flex;
        }

        .linkEditorContainer__remove-btn,
        .linkEditorContainer__move-up-btn,
        .linkEditorContainer__move-down-btn {
          font-size: 16px;
          padding: 4px 8px;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s ease, color 0.3s ease;
          border-radius: 4px;
        }

        .linkEditorContainer__remove-btn:hover,
        .linkEditorContainer__move-up-btn:hover,
        .linkEditorContainer__move-down-btn:hover {
          background-color: #f0f0f0;
          color: #555;
        }
      `);

      document.body.appendChild(settingsDiv);
    }

    const closeBtn = settingsDiv.querySelector(
      ".linkEditorContainer__close-btn"
    );
    closeBtn.addEventListener("click", () => {
      settingsDiv.style.display = "none";
    });

    const addBtn = settingsDiv.querySelector("#add-selector");
    addBtn.addEventListener("click", () => {
      const pairElement = createPairElement();
      settingsDiv
        .querySelector(".linkEditorContainer__content")
        .appendChild(pairElement);
      updateSelectorMemoPairs();
    });

    const contentDiv = settingsDiv.querySelector(
      ".linkEditorContainer__content"
    );
    selectorMemoPairs.forEach((pair) => {
      const pairElement = createPairElement(pair);
      contentDiv.appendChild(pairElement);
    });

    // Add the toggle inspect button event listener
    const inspectBtn = settingsDiv.querySelector("#toggle-inspect");
    inspectBtn.addEventListener("click", () => {
      if (inspectBtn.textContent === "🔍") {
        startInspecting();
        inspectBtn.textContent = "Stop 🔍";
      } else {
        stopInspecting();
        inspectBtn.textContent = "🔍";
      }
    });
  }

  function startInspecting() {
    document.body.addEventListener("click", inspectElement, true);
  }

  function stopInspecting() {
    document.body.removeEventListener("click", inspectElement, true);
  }

  function inspectElement(event) {
    event.preventDefault();
    event.stopPropagation();

    const element = event.target;
    const classNames = element.className
      ? `.${element.className.split(" ").join(".")}`
      : "";
    const idName = element.id ? `#${element.id}` : "";
    const selector = `${element.tagName.toLowerCase()}${idName}${classNames}`;
    console.log("Selector:", selector);

    const settingsDiv = document.getElementById("linkEditorContainer");
    const lastPairElement = settingsDiv.querySelector(
      ".linkEditorContainer__selector-pair:last-child"
    );
    const selectorInput = lastPairElement.querySelector(
      ".linkEditorContainer__selector-input"
    );
    selectorInput.value = selector;

    stopInspecting();
    const inspectBtn = settingsDiv.querySelector("#toggle-inspect");
    inspectBtn.textContent = "🔍";
  }

  loadSelectorMemoPairs();
  createSettingsUI();
  addTitleAndTargetToElements();
  observeDOMChanges();

  GM_registerMenuCommand("⚙️Settings", () => {
    const settingsDiv = document.getElementById("linkEditorContainer");
    settingsDiv.style.display = "block";
  });
})();
