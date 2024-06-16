// ==UserScript==
// @name                Twitter kaizen
// @namespace           http://tampermonkey.net/
// @version             1.0
// @description         Twitterの表示を改善するスクリプト
// @description:ja      Twitterの表示を改善するスクリプト
// @description:en      Script to improve Twitter display
// @description:zh      改善Twitter显示的脚本
// @description:ko      트위터 표시를 개선하는 스크립트
// @description:ru      Скрипт для улучшения отображения Twitter
// @description:de      Skript zur Verbesserung der Twitter-Anzeige
// @author              Yos_sy17
// @match               https://x.com/*
// @icon                https://www.google.com/s2/favicons?sz=64&domain=x.com
// @license             GPL
// @run-at              document-start
// @downloadURL
// @updateURL
// @require             https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/js/all.min.js
// @grant               GM_addStyle
// ==/UserScript==

(function () {
  "use strict";

  // -----------------------------------------------------------------------------------
  // CSS
  // -----------------------------------------------------------------------------------
  GM_addStyle(`
        /* -----------------------------------------------------------------------------------
        Twitterを取り戻す(アイコンを戻す)
        ----------------------------------------------------------------------------------- */
        /* Main */
        .r-64el8z[href="/home"] > div > svg > g > path, .r-1h3ijdo > .r-1pi2tsx > svg > g > path{
          d: path('M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z') !important;
        }
        /* Splash */
        .r-1blnp2b > g > path{
          d: path('M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z') !important;
        }
        /* Premium */
        .r-eqz5dr[href="/i/premium_sign_up"] > div > div > svg > g > path, .r-1loqt21[href="/i/premium_sign_up"] > div > svg > g > path{
          d: path('M 8.52 3.59 c 0.8 -1.1 2.04 -1.84 3.48 -1.84 s 2.68 0.74 3.49 1.84 c 1.34 -0.21 2.74 0.14 3.76 1.16 s 1.37 2.42 1.16 3.77 c 1.1 0.8 1.84 2.04 1.84 3.48 s -0.74 2.68 -1.84 3.48 c 0.21 1.34 -0.14 2.75 -1.16 3.77 s -2.42 1.37 -3.76 1.16 c -0.8 1.1 -2.05 1.84 -3.49 1.84 s -2.68 -0.74 -3.48 -1.84 c -1.34 0.21 -2.75 -0.14 -3.77 -1.16 c -1.01 -1.02 -1.37 -2.42 -1.16 -3.77 c -1.09 -0.8 -1.84 -2.04 -1.84 -3.48 s 0.75 -2.68 1.84 -3.48 c -0.21 -1.35 0.14 -2.75 1.16 -3.77 s 2.43 -1.37 3.77 -1.16 Z m 3.48 0.16 c -0.85 0 -1.66 0.53 -2.12 1.43 l -0.38 0.77 l -0.82 -0.27 c -0.96 -0.32 -1.91 -0.12 -2.51 0.49 c -0.6 0.6 -0.8 1.54 -0.49 2.51 l 0.27 0.81 l -0.77 0.39 c -0.9 0.46 -1.43 1.27 -1.43 2.12 s 0.53 1.66 1.43 2.12 l 0.77 0.39 l -0.27 0.81 c -0.31 0.97 -0.11 1.91 0.49 2.51 c 0.6 0.61 1.55 0.81 2.51 0.49 l 0.82 -0.27 l 0.38 0.77 c 0.46 0.9 1.27 1.43 2.12 1.43 s 1.66 -0.53 2.12 -1.43 l 0.39 -0.77 l 0.82 0.27 c 0.96 0.32 1.9 0.12 2.51 -0.49 c 0.6 -0.6 0.8 -1.55 0.48 -2.51 l -0.26 -0.81 l 0.76 -0.39 c 0.91 -0.46 1.43 -1.27 1.43 -2.12 s -0.52 -1.66 -1.43 -2.12 l -0.77 -0.39 l 0.27 -0.81 c 0.32 -0.97 0.12 -1.91 -0.48 -2.51 c -0.61 -0.61 -1.55 -0.81 -2.51 -0.49 l -0.82 0.27 l -0.39 -0.77 c -0.46 -0.9 -1.27 -1.43 -2.12 -1.43 Z m 4.74 5.68 l -6.2 6.77 l -3.74 -3.74 l 1.41 -1.42 l 2.26 2.26 l 4.8 -5.23 l 1.47 1.36 Z') !important;
        }
        /* Home */
        .r-eqz5dr[href="/home"] > div > div > svg > g > path{
          d: path('M12,1.696 L0.622,8.807l1.06,1.696L3,9.679V19.5C3,20.881 4.119,22 5.5,22h13c1.381,0 2.5,-1.119 2.5,-2.5V9.679l1.318,0.824 1.06,-1.696L12,1.696ZM12,16.5c-1.933,0 -3.5,-1.567 -3.5,-3.5s1.567,-3.5 3.5,-3.5 3.5,1.567 3.5,3.5 -1.567,3.5 -3.5,3.5Z') !important;
        }

        /* -----------------------------------------------------------------------------------
        全般のボーダーを消す
        ----------------------------------------------------------------------------------- */
        .r-1kqtdi0,
        .r-1igl3o0 {
          border: none !important;
        }

        /* -----------------------------------------------------------------------------------
        左サイドバーのスクロールバーを消す
        ----------------------------------------------------------------------------------- */
        .css-175oi2r.r-1pi2tsx.r-1wtj0ep.r-1rnoaur.r-o96wvk.r-is05cd {
          overflow-y: scroll !important;
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        .css-175oi2r.r-1pi2tsx.r-1wtj0ep.r-1rnoaur.r-o96wvk.r-is05cd::-webkit-scrollbar {
          display:none !important;
        }

        /* -----------------------------------------------------------------------------------
        ”右サイドバーのSubscribe to Premium”を消す
        ----------------------------------------------------------------------------------- */
        .css-175oi2r.r-1habvwh.r-eqz5dr.r-uaa2di.r-1mmae3n.r-3pj75a.r-bnwqim {
          display: none;
        }

        /* -----------------------------------------------------------------------------------
        ”右サイドバーのWho to follow”を消す
        ----------------------------------------------------------------------------------- */
        .css-175oi2r.r-1bro5k0 {
          display: none;
        }

        /* -----------------------------------------------------------------------------------
        UserNameを消す
        ----------------------------------------------------------------------------------- */
        .css-146c3p1.r-dnmrzs.r-1udh08x.r-3s2u2q.r-bcqeeo.r-1ttztb7.r-qvutc0.r-1qd0xha.r-a023e6.r-rjixqe.r-16dba41.r-18u37iz.r-1wvb978 > span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3,
        .css-146c3p1.r-bcqeeo.r-1ttztb7.r-qvutc0.r-1qd0xha.r-a023e6.r-rjixqe.r-16dba41.r-1q142lx.r-n7gxbd {
          display: none;
        }

        /* -----------------------------------------------------------------------------------
        カキコの下のボーダーを消す
        ----------------------------------------------------------------------------------- */
        .r-109y4c4 {
          height: 0 !important;
        }

        /* -----------------------------------------------------------------------------------
        TLの幅を600pxから700pxに、右サイドバーの幅を350pxから250pxに変更
        ----------------------------------------------------------------------------------- */
        .r-1ye8kvj {
          max-width: 700px !important;
        }
        .r-1hycxz {
          width: 250px !important;
        }

        /* -----------------------------------------------------------------------------------
        右サイドバーのWhat’s happeningのステータスを見やすく
        ----------------------------------------------------------------------------------- */
        .css-175oi2r.r-1mmae3n.r-3pj75a.r-o7ynqc.r-6416eg.r-1ny4l3l.r-1loqt21 > div > div > .css-175oi2r.r-1wbh5a2.r-1awozwy.r-18u37iz {
          display: flex;
          flex-flow: column;
        }
        .r-r2y082 {
          max-width: 100%;
        }

        /* -----------------------------------------------------------------------------------
       時計、日付のフォントカラーを変更
        ----------------------------------------------------------------------------------- */

        #date__container__text,
        #time__container__text {
          color: #e7e9ea;
        }
      `);

  // -----------------------------------------------------------------------------------
  // TLの時間を相対時間から絶対時間に変更(HH:MM:SS･mm/dd/yy, week)
  // -----------------------------------------------------------------------------------
  const weekDays = {
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    ja: ["日", "月", "火", "水", "木", "金", "土"],
    zh: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
    ko: ["일", "월", "화", "수", "목", "금", "토"],
    ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    de: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
  };

  const userLang = navigator.language || navigator.userLanguage;
  const langCode = userLang.slice(0, 2);
  const weekDay = weekDays[langCode] || weekDays.en;

  const year = new Date().getFullYear() % 100;

  // 日付をフォーマットされた文字列に変換
  const toFormattedDateString = function (date) {
    const pad = (num) => ("0" + num).slice(-2);
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}･${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${year}, ${weekDay[date.getDay()]}`;
  };

  const updateTimestamps = function () {
    document
      .querySelectorAll(
        'main div[data-testid="primaryColumn"] section article a[href*="/status/"] time'
      )
      .forEach(function (e) {
        const a = e.parentNode;
        const span = document.createElement("span");
        const s0 = e.getAttribute("datetime");
        const s1 = toFormattedDateString(new Date(s0));
        span.textContent = s1;
        span.style.pointerEvents = "none";
        a.appendChild(span);
        a.removeChild(e);
      });
  };

  setInterval(updateTimestamps, 1000);

  // -----------------------------------------------------------------------------------
  // 右サイドバー(システム上はヘッダー)に時間、日付を表示(HH:MM:SS,mm/dd/yy, week)
  // -----------------------------------------------------------------------------------
  function createInfo(type) {
    const nav = document.querySelector(
      'div[class="css-175oi2r r-vacyoi r-ttdzmv"]'
    );

    if (nav && !document.getElementById(`${type}`)) {
      const div = document.createElement("div");
      div.id = `${type}`;
      div.classList.add(
        "css-175oi2r",
        "r-6koalj",
        "r-eqz5dr",
        "r-16y2uox",
        "r-1habvwh",
        "r-cnw61z",
        "r-13qz1uu",
        "r-1loqt21",
        "r-1ny4l3l"
      );

      const container = document.createElement("div");
      container.id = `${type}__container`;
      container.classList.add(
        "css-175oi2r",
        "r-sdzlij",
        "r-dnmrzs",
        "r-1awozwy",
        "r-18u37iz",
        "r-1777fci",
        "r-xyw6el",
        "r-o7ynqc",
        "r-6416eg"
      );
      div.appendChild(container);

      const icon = document.createElement("div");
      icon.id = `${type}__container__icon`;
      icon.classList.add("css-175oi2r");
      container.appendChild(icon);
      icon.innerHTML =
        type === "time"
          ? '<i class="fa-regular fa-clock" style="width: 26.25px; height: 26.25px;"></i>'
          : '<i class="fa-solid fa-calendar-days" style="width: 26.25px; height: 26.25px;"></i>';

      const text = document.createElement("div");
      text.id = `${type}__container__text`;
      text.classList.add(
        "css-146c3p1",
        "r-dnmrzs",
        "r-1udh08x",
        "r-3s2u2q",
        "r-bcqeeo",
        "r-1ttztb7",
        "r-qvutc0",
        "r-1qd0xha",
        "r-adyw6z",
        "r-135wba7",
        "r-16dba41",
        "r-dlybji",
        "r-nazi8o"
      );
      container.appendChild(text);

      const textContent = document.createElement("span");
      textContent.id = `${type}__text__content`;
      textContent.classList.add(
        "1jxf684",
        "r-bcqeeo",
        "r-1ttztb7",
        "r-qvutc0",
        "r-poiln3"
      );
      text.appendChild(textContent);

      function updateInfo() {
        textContent.textContent =
          type === "time"
            ? `${"0" + new Date().getHours()}:${("0" + new Date().getMinutes()).slice(-2)}:${("0" + new Date().getSeconds()).slice(-2)}`
            : `${new Date().getMonth() + 1}/${new Date().getDate()}/${year}, ${weekDay[new Date().getDay()]}`;
      }

      updateInfo();
      if (type === "time") {
        setInterval(updateInfo, 1000);
      }

      nav.appendChild(div);
    }
  }

  window.addEventListener("load", function () {
    createInfo("time");
    createInfo("date");

    const observer = new MutationObserver(() => {
      createInfo("time");
      createInfo("date");
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
