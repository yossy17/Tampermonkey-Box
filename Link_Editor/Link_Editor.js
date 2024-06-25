// ==UserScript==
// @name                Link Editor
// @description         指定された要素にtitle属性を追加し、関連する<a>タグにtarget属性を追加します
// @version             1.1.0
// @author              Yos_sy17
// @match               *://*/*
// @namespace           http://tampermonkey.net/
// @icon                https://freeiconshop.com/wp-content/uploads/edd/link-open-flat.png
// @license             MIT
// @run-at              document-end
// @grant               GM_addStyle
// @grant               GM_registerMenuCommand
// @grant               GM_setValue
// @grant               GM_getValue
// ==/UserScript==

(function () {
  "use strict";

  // 定数
  const STORAGE_KEY = "linkEditorSelectorTitlePairs";
  const UI_ID = "linkEditorContainer";
  const SHORTCUT_KEY = {
    altKey: true,
    keyCode: 48, // 0キー
  };

  // 状態
  let selectorTitlePairs = [];

  // ユーティリティ関数
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) =>
    context.querySelectorAll(selector);

  // ストレージ関数
  function loadSelectorTitlePairs() {
    const storedData = GM_getValue(STORAGE_KEY, []);
    selectorTitlePairs = Array.isArray(storedData) ? storedData : [];
  }

  function saveSelectorTitlePairs() {
    GM_setValue(STORAGE_KEY, selectorTitlePairs);
  }

  // コア機能
  function addTitleAndTargetToElements() {
    selectorTitlePairs.forEach(
      ({ title, selector, isEnabled, urlPattern, openInNewTab }) => {
        if (isEnabled && matchesCurrentURL(urlPattern)) {
          $$(selector).forEach((element) => {
            const innerText = element.textContent.trim();
            if (innerText) {
              element.setAttribute("title", innerText);
            }
            const relatedATag = element.closest("a");
            if (relatedATag) {
              relatedATag.target = openInNewTab ? "_blank" : "";
            }
          });
        }
      }
    );
  }

  function observeDOMChanges() {
    const observer = new MutationObserver((mutations) => {
      if (
        mutations.some(
          (mutation) =>
            mutation.type === "childList" && mutation.addedNodes.length > 0
        )
      ) {
        addTitleAndTargetToElements();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // UI関数
  function createPairElement({
    title = "",
    selector = "",
    isEnabled = true,
    urlPattern = getCurrentURLPattern(),
    openInNewTab = false,
  } = {}) {
    const pairDiv = document.createElement("div");
    pairDiv.className = "linkEditorContainer__selector-pair";

    pairDiv.innerHTML = `
      <label>タイトル: <input type="text" class="linkEditorContainer__title-input" placeholder="タイトル" value="${title}"></label>
      <label>セレクタ: <input type="text" class="linkEditorContainer__selector-input" placeholder="セレクタ" value="${selector}"></label>
      <label>URLパターン: <input type="text" class="linkEditorContainer__url-pattern-input" placeholder="URLパターン" value="${urlPattern}"></label>
      <label><input type="checkbox" class="linkEditorContainer__on-off-switching__checkbox" ${isEnabled ? "checked" : ""}> 有効</label>
      <label><input type="checkbox" class="linkEditorContainer__open-in-new-tab-checkbox" ${openInNewTab ? "checked" : ""}> 新しいタブで開く</label>
      <div class="linkEditorContainer__btn-wrapper">
        <button class="linkEditorContainer__move-up-btn">▲</button>
        <button class="linkEditorContainer__move-down-btn">▼</button>
        <button class="linkEditorContainer__remove-btn">🗑️</button>
      </div>
    `;

    ["input", "change"].forEach((eventType) => {
      pairDiv.addEventListener(eventType, updateSelectorTitlePairs);
    });

    pairDiv
      .querySelector(".linkEditorContainer__remove-btn")
      .addEventListener("click", () => {
        if (confirm("このセレクタを削除してもよろしいですか？")) {
          pairDiv.remove();
          updateSelectorTitlePairs();
        }
      });

    pairDiv
      .querySelector(".linkEditorContainer__move-up-btn")
      .addEventListener("click", () => movePair(pairDiv, -1));
    pairDiv
      .querySelector(".linkEditorContainer__move-down-btn")
      .addEventListener("click", () => movePair(pairDiv, 1));

    return pairDiv;
  }

  function movePair(pairDiv, direction) {
    const parent = pairDiv.parentNode;
    const index = Array.from(parent.children).indexOf(pairDiv);
    const newIndex = index + direction;

    if (newIndex >= 0 && newIndex < parent.children.length) {
      parent.insertBefore(
        pairDiv,
        parent.children[newIndex + (direction > 0 ? 1 : 0)]
      );
      updateSelectorTitlePairs();
    }
  }

  function updateSelectorTitlePairs() {
    selectorTitlePairs = Array.from($$(".linkEditorContainer__selector-pair"))
      .map((pairElement) => ({
        title: $(".linkEditorContainer__title-input", pairElement).value.trim(),
        selector: $(
          ".linkEditorContainer__selector-input",
          pairElement
        ).value.trim(),
        isEnabled: $(
          ".linkEditorContainer__on-off-switching__checkbox",
          pairElement
        ).checked,
        urlPattern: $(
          ".linkEditorContainer__url-pattern-input",
          pairElement
        ).value.trim(),
        openInNewTab: $(
          ".linkEditorContainer__open-in-new-tab-checkbox",
          pairElement
        ).checked,
      }))
      .filter(({ selector }) => selector);

    saveSelectorTitlePairs();
    addTitleAndTargetToElements();

    $("#totalCount").textContent = `合計: ${selectorTitlePairs.length}`;
  }

  function getCurrentURLPattern() {
    return `${window.location.origin}/*`;
  }

  function matchesCurrentURL(urlPattern) {
    try {
      return new RegExp(urlPattern).test(window.location.href);
    } catch (error) {
      console.error("URLマッチングエラー:", error);
      return false;
    }
  }

  function createSettingsUI() {
    let settingsDiv = $(UI_ID);
    if (!settingsDiv) {
      settingsDiv = document.createElement("div");
      settingsDiv.id = UI_ID;
      settingsDiv.className = UI_ID;

      settingsDiv.innerHTML = `
        <div class="${UI_ID}__header">
          <h3>⚙️設定</h3>
          <span id="totalCount">合計: ${selectorTitlePairs.length}</span>
          <button class="${UI_ID}__close-btn">×</button>
        </div>
        <div class="${UI_ID}__content"></div>
        <button id="add-selector" class="${UI_ID}__add-btn">+</button>
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
          max-height: 500px;
          overflow-y: auto;
          scroll-snap-type: y mandatory;
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
          scroll-snap-align: start;
        }

        .linkEditorContainer__selector-pair label {
          font-weight: bold;
          margin-bottom: 4px;
        }

        .linkEditorContainer__title-input,
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

    const settingsContent = $(`.${UI_ID}__content`);
    settingsContent.innerHTML = "";

    selectorTitlePairs.forEach((pair) => {
      settingsContent.appendChild(createPairElement(pair));
    });

    $("#add-selector").addEventListener("click", () => {
      settingsContent.appendChild(
        createPairElement({ urlPattern: getCurrentURLPattern() })
      );
      updateSelectorTitlePairs();
    });

    $(`.${UI_ID}__close-btn`).addEventListener("click", () => {
      settingsDiv.style.display = "none";
    });

    setupDraggable(settingsDiv);
  }

  function setupDraggable(element) {
    let isDragging = false;
    let initialX,
      initialY,
      xOffset = 0,
      yOffset = 0;

    const dragStart = (e) => {
      if (e.target.closest(`.${UI_ID}__header`)) {
        isDragging = true;
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      }
    };

    const dragEnd = () => (isDragging = false);

    const drag = (e) => {
      if (isDragging) {
        e.preventDefault();
        xOffset = e.clientX - initialX;
        yOffset = e.clientY - initialY;
        element.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
      }
    };

    $(`.${UI_ID}__header`, element).addEventListener("mousedown", dragStart);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);
  }

  function openSettingsUI() {
    const settingsDiv = $(UI_ID);
    if (settingsDiv) {
      settingsDiv.style.display =
        settingsDiv.style.display === "none" ? "block" : "none";
    } else {
      createSettingsUI();
    }
  }

  // 初期化
  function init() {
    loadSelectorTitlePairs();
    observeDOMChanges();
    addTitleAndTargetToElements();
    GM_registerMenuCommand("⚙️設定を開く", openSettingsUI);
    document.addEventListener("keydown", (e) => {
      if (e.altKey && e.keyCode === SHORTCUT_KEY.keyCode) {
        openSettingsUI();
      }
    });
  }

  init();
})();
