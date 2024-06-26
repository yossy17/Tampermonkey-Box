// ==UserScript==
// @name                Link Editor
// @description         指定された要素にtitle属性を追加し、関連する<a>タグにtarget属性を追加します
// @version             1.0.0
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
  const STORAGE_KEY = "linkEditorSelectorTitlePairs"; // ローカルストレージのキー
  const UI_ID = "linkEditor"; // UIの基本ID
  const SHORTCUT_KEY = {
    altKey: true,
    keyCode: 48, // '0'キーのKeyCode
  };

  // グローバル状態
  let selectorTitlePairs = []; // セレクタとタイトルのペアを保存する配列
  let settingsPanel = null; // 設定パネルのDOM要素

  // ユーティリティ関数
  // 単一要素の取得
  const $ = (selector, context = document) => context.querySelector(selector);
  // 複数要素の取得
  const $$ = (selector, context = document) =>
    context.querySelectorAll(selector);

  // ストレージ関数
  // ローカルストレージからデータを読み込む
  function loadSelectorTitlePairs() {
    const storedData = GM_getValue(STORAGE_KEY, []);
    selectorTitlePairs = Array.isArray(storedData) ? storedData : [];
  }

  // ローカルストレージにデータを保存する
  function saveSelectorTitlePairs() {
    GM_setValue(STORAGE_KEY, selectorTitlePairs);
  }

  // コア機能
  // 要素にtitle属性と関連する<a>タグにtarget属性を追加する
  function addTitleAndTargetToElements() {
    selectorTitlePairs.forEach(
      ({ title, selector, isEnabled, urlPattern, openInNewTab }) => {
        if (matchesCurrentURL(urlPattern)) {
          $$(selector).forEach((element) => {
            const innerText = element.textContent.trim();
            if (innerText) {
              if (isEnabled) {
                element.setAttribute("title", innerText);
              } else {
                element.removeAttribute("title");
              }
            }
            const relatedATag = element.closest("a");
            if (relatedATag) {
              if (isEnabled && openInNewTab) {
                relatedATag.setAttribute("target", "_blank");
              } else {
                relatedATag.removeAttribute("target");
              }
            }
          });
        }
      }
    );
  }

  // DOM変更を監視し、新しい要素に対して処理を適用する
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
  // セレクタとタイトルのペアを表す要素を作成する
  function createPairElement({
    title = "",
    selector = "",
    isEnabled = true,
    urlPattern = getCurrentURLPattern(),
    openInNewTab = false,
  } = {}) {
    const pairDiv = document.createElement("div");
    pairDiv.className = `${UI_ID}__content__pair`;

    // ペア要素のHTML構造を設定
    pairDiv.innerHTML = `
      <label>Title: <input type="text" class="${UI_ID}__content__pair__title" placeholder="Title" value="${title}"></label>
      <label>Selector: <input type="text" class="${UI_ID}__content__pair__selector" placeholder="Selector" value="${selector}"></label>
      <label>URLPattern: <input type="text" class="${UI_ID}__content__pair__urlPattern" placeholder="URLPattern" value="${urlPattern}"></label>
      <label><input type="checkbox" class="${UI_ID}__content__pair__onOffSwitchingBtn" ${isEnabled ? "checked" : ""}>ON/OFF</label>
      <label class="${UI_ID}__content__pair__openInNewTabLabel ${isEnabled ? "" : "disabled"}">
        <input type="checkbox" class="${UI_ID}__content__pair__openInNewTabBtn" ${openInNewTab ? "checked" : ""} ${isEnabled ? "" : "disabled"}>
        Open link in a new tab
      </label>
      <div class="${UI_ID}__content__pair__ctrlBtn">
        <button class="${UI_ID}__content__pair__ctrlBtn__moveUpBtn">▲</button>
        <button class="${UI_ID}__content__pair__ctrlBtn__moveDownBtn">▼</button>
        <button class="${UI_ID}__content__pair__ctrlBtn__removeBtn">🗑️</button>
      </div>
    `;

    // 入力とチェックボックスの変更を監視
    ["input", "change"].forEach((eventType) => {
      pairDiv.addEventListener(eventType, (e) => {
        if (
          e.target.classList.contains(
            `${UI_ID}__content__pair__onOffSwitchingBtn`
          )
        ) {
          const openInNewTabLabel = pairDiv.querySelector(
            `.${UI_ID}__content__pair__openInNewTabLabel`
          );
          const openInNewTabBtn = pairDiv.querySelector(
            `.${UI_ID}__content__pair__openInNewTabBtn`
          );
          if (e.target.checked) {
            openInNewTabLabel.classList.remove("disabled");
            openInNewTabBtn.disabled = false;
          } else {
            openInNewTabLabel.classList.add("disabled");
            openInNewTabBtn.disabled = true;
          }
        }
        updateSelectorTitlePairs();
        addTitleAndTargetToElements();
      });
    });

    // 削除ボタンのイベントリスナー
    pairDiv
      .querySelector(`.${UI_ID}__content__pair__ctrlBtn__removeBtn`)
      .addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this selector?")) {
          pairDiv.remove();
          updateSelectorTitlePairs();
        }
      });

    // 上下移動ボタンのイベントリスナー
    pairDiv
      .querySelector(`.${UI_ID}__content__pair__ctrlBtn__moveUpBtn`)
      .addEventListener("click", () => movePair(pairDiv, -1));
    pairDiv
      .querySelector(`.${UI_ID}__content__pair__ctrlBtn__moveDownBtn`)
      .addEventListener("click", () => movePair(pairDiv, 1));

    return pairDiv;
  }

  // ペア要素を上下に移動する
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

  // セレクタとタイトルのペアを更新する
  function updateSelectorTitlePairs() {
    selectorTitlePairs = Array.from($$(".linkEditor__content__pair"))
      .map((pairElement) => ({
        title: $(`.${UI_ID}__content__pair__title`, pairElement).value.trim(),
        selector: $(
          `.${UI_ID}__content__pair__selector`,
          pairElement
        ).value.trim(),
        isEnabled: $(`.${UI_ID}__content__pair__onOffSwitchingBtn`, pairElement)
          .checked,
        urlPattern: $(
          `.${UI_ID}__content__pair__urlPattern`,
          pairElement
        ).value.trim(),
        openInNewTab: $(
          `.${UI_ID}__content__pair__openInNewTabBtn`,
          pairElement
        ).checked,
      }))
      .filter(({ selector }) => selector);

    saveSelectorTitlePairs();
    addTitleAndTargetToElements();

    if (settingsPanel) {
      $("#totalCount", settingsPanel).textContent =
        `Total: ${selectorTitlePairs.length}`;
    }
  }

  // 現在のURLパターンを取得する
  function getCurrentURLPattern() {
    return `${window.location.origin}/*`;
  }

  // 現在のURLがパターンにマッチするかチェックする
  function matchesCurrentURL(urlPattern) {
    try {
      return new RegExp(urlPattern).test(window.location.href);
    } catch (error) {
      console.error("URL matching error:", error);
      return false;
    }
  }

  // 設定UIを開く
  function openSettingsUI() {
    if (settingsPanel) {
      settingsPanel.style.display =
        settingsPanel.style.display === "none" ? "block" : "none";
    } else {
      settingsPanel = createSettingsUI();
      updateSettingsContent();
    }
  }

  // 設定UIを作成する
  function createSettingsUI() {
    const settingsDiv = document.createElement("div");
    settingsDiv.id = UI_ID;
    settingsDiv.className = UI_ID;

    // 設定パネルのHTML構造を設定
    settingsDiv.innerHTML = `
      <div class="${UI_ID}__header">
        <h3 class="${UI_ID}__header__title">⚙️Setting</h3>
        <span id="totalCount" class="${UI_ID}__header__totalCount">Total: ${selectorTitlePairs.length}</span>
        <button class="${UI_ID}__header__closeBtn">×</button>
      </div>
      <div class="${UI_ID}__content"></div>
      <button id="${UI_ID}__addBtn" class="${UI_ID}__addBtn">+</button>
    `;

    // スタイルを追加
    GM_addStyle(`
      @import url("https://fonts.googleapis.com/css2?family=Roboto&display=swap");
      .linkEditor {
        font-family: "Roboto", sans-serif;
        user-select: none;
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        width: 1000px;
        min-width: 300px;
        font-weight: 400;
        font-size: 12px;
        font-style: normal;
        margin: 0;
        padding: 0 15px 15px;
        background-color: #fff;
        color: #333;
        position: fixed;
        top: 20px;
        left: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
        z-index: calc(infinity);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15);
        pointer-events: auto;
        resize: horizontal;
        overflow: auto;
      }
      .linkEditor__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 65px;
        cursor: grab;
        border-bottom: 1px solid #c9c9c9;
        resize: horizontal;
      }
      .linkEditor__header:active {
        cursor: grabbing;
      }
      .linkEditor__header__title {
        font-size: 18px;
        color: #333;
      }
      .linkEditor__header__totalCount {
        font-size: 16px;
        color: #333;
      }
      .linkEditor__header__closeBtn {
        font-size: 20px;
        cursor: pointer;
        color: #888;
        transition: color 0.3s ease;
      }
      .linkEditor__header__closeBtn:hover {
        color: #555;
      }
      .linkEditor__content {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 15px;
        margin-block: 10px;
        min-width: 250px;
        height: 480px;
        overflow-y: auto;
        scroll-snap-type: y mandatory;
      }
      .linkEditor__content__pair {
        display: flex;
        justify-content: center;
        flex-direction: column;
        height: 230px;
        border: 1px solid #ccc;
        padding: 0 8px;
        border-radius: 4px;
        background-color: #f9f9f9;
        scroll-snap-align: start;
      }
      .linkEditor__content__pair label {
        font-weight: bold;
        margin-bottom: 4px;
      }
      .linkEditor__content__pair label:nth-child(-n+3) {
        display: flex;
        flex-flow: column;
      }
      .linkEditor__content__pair label:nth-child(n+4) {
        display: flex;
        align-items: center;
      }
      .linkEditor__content__pair__openInNewTabLabel.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .linkEditor__content__pair__openInNewTabLabel.disabled input {
        pointer-events: none;
        cursor: not-allowed;
      }
      .linkEditor__content__pair__title, .linkEditor__content__pair__selector, .linkEditor__content__pair__urlPattern {
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 5px;
      }
      .linkEditor__content__pair__ctrlBtn {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .linkEditor__content__pair__ctrlBtn__removeBtn {
        margin-left: auto;
      }
      .linkEditor__content__pair__ctrlBtn__moveUpBtn {
        margin-right: 5px;
      }
      .linkEditor__content__pair__ctrlBtn__moveDownBtn {
        margin-left: 5px;
      }
      .linkEditor__content__pair__ctrlBtn__moveUpBtn, .linkEditor__content__pair__ctrlBtn__moveDownBtn, .linkEditor__content__pair__ctrlBtn__removeBtn {
        background-color: #f9f9f9;
        padding: 6px 8px;
        border: 1px solid #ccc;
        border-radius: 8px;
        cursor: pointer;
      }
      .linkEditor__content__pair__ctrlBtn__moveUpBtn:hover, .linkEditor__content__pair__ctrlBtn__moveDownBtn:hover, .linkEditor__content__pair__ctrlBtn__removeBtn:hover {
        background-color: #f0f0f0;
        color: #555;
      }
      .linkEditor__addBtn {
        position: relative;
        bottom: 0;
        padding: 8px 12px;
        background-color: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
      }
      .linkEditor__addBtn:hover {
        background-color: #e0e0e0;
      }/*# sourceMappingURL=Setting_Panel.css.map */
    `);

    document.body.appendChild(settingsDiv);

    // 閉じるボタンのイベントリスナー
    settingsDiv
      .querySelector(`.${UI_ID}__header__closeBtn`)
      .addEventListener("click", () => {
        settingsDiv.style.display = "none";
      });

    // 追加ボタンのイベントリスナー
    settingsDiv
      .querySelector(`#${UI_ID}__addBtn`)
      .addEventListener("click", () => {
        const settingsContent = settingsDiv.querySelector(`.${UI_ID}__content`);
        settingsContent.appendChild(
          createPairElement({ urlPattern: getCurrentURLPattern() })
        );
        updateSelectorTitlePairs();
      });

    // ドラッグ可能に設定
    setupDraggable(settingsDiv);

    return settingsDiv;
  }

  // 設定内容を更新する
  function updateSettingsContent() {
    if (!settingsPanel) return;

    const settingsContent = settingsPanel.querySelector(`.${UI_ID}__content`);
    settingsContent.innerHTML = "";

    selectorTitlePairs.forEach((pair) => {
      settingsContent.appendChild(createPairElement(pair));
    });

    settingsPanel.querySelector("#totalCount").textContent =
      `Total: ${selectorTitlePairs.length}`;
  }

  // 要素をドラッグ可能にする
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

  // 初期化
  function init() {
    loadSelectorTitlePairs(); // ストレージからデータを読み込む
    observeDOMChanges(); // DOM変更の監視を開始
    addTitleAndTargetToElements(); // 初期要素に属性を追加
    GM_registerMenuCommand("⚙️Open Setting", openSettingsUI); // メニューコマンドを登録
    // ショートカットキーのイベントリスナーを追加
    document.addEventListener("keydown", (e) => {
      if (e.altKey && e.keyCode === SHORTCUT_KEY.keyCode) {
        openSettingsUI();
      }
    });
  }

  // スクリプトの実行を開始
  init();
})();
