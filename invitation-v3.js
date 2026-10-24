(() => {
  // interactive-invitation/dist/interaction.mjs?v=3
  var WEDDING = Object.freeze({
    couple: "丁树凯 & 叶小妹",
    date: "2026年11月22日",
    address: "安徽省宿州市灵璧县韦集镇陈园村浦庄丁府"
  });
  var SCENES = [
    { id: "desk", title: "拆开喜讯", line: "有一件喜事，想与你分享" },
    { id: "childhood", title: "小朋友长大啦", line: "轻点旧照片，看看长大后的我们" },
    { id: "home", title: "推门成家", line: "把两个人的日子，过成一个家" },
    { id: "gallery", title: "我们的相册", line: "十八张照片，装下一些小欢喜" },
    { id: "candy", title: "分你一颗喜糖", line: "把甜蜜和好运，也分给你" },
    { id: "invite", title: "婚礼见", line: "最想分享这份欢喜的人，是你" }
  ];
  var captions = [
    "把今天的笑容，留给往后的每一天。",
    "牵起手，日子就有了方向。",
    "一起站在，温柔的光里。",
    "花在身旁，你在心上。",
    "好日子，从你我开始。",
    "把答案写在同一张照片里。",
    "今天，披上所有的温柔。",
    "隔着头纱，也藏不住笑意。",
    "合影一张，开心加倍。",
    "今天的爱心，请查收。",
    "新郎已就位。",
    "新娘也已就位。",
    "同一束光，照着两个人。",
    "圆圆的镜子，装下刚刚好的我们。",
    "一起走向，新的日常。",
    "站在你身旁，就是最好的位置。",
    "各自比个心，也一起比个心。",
    "这颗心，终于合在一起。"
  ];
  var PHOTOS = captions.map((caption, index) => {
    const number = index + 1;
    const id = String(number).padStart(2, "0");
    const group = [1, 2, 3, 4, 5, 13, 14, 15].includes(number) ? "window" : [6, 7, 8, 16].includes(number) ? "light" : "heart";
    return { id, src: `assets/photos/${id}.webp`, group, caption };
  });
  var WISHES = [
    ["今日份甜蜜", "愿你的生活，也有恰到好处的甜。"],
    ["好运正在路上", "愿想见的人，和想做的事，都能如愿。"],
    ["平凡也闪光", "愿每个普通日子，都有值得开心的小事。"],
    ["有人分享", "愿你遇到的欢喜，总有人愿意听。"],
    ["笑容常在", "愿你嘴角上扬的理由，越来越多。"],
    ["好好吃饭", "愿你每次回家，都有热饭和牵挂。"],
    ["慢慢来就好", "愿你按自己的节奏，过喜欢的生活。"],
    ["相聚有期", "愿忙碌之后，总能和重要的人坐在一起。"],
    ["心愿发芽", "愿你悄悄种下的期待，都能慢慢长大。"],
    ["被温柔以待", "愿你走到哪里，都能遇到善意。"],
    ["喜事连连", "愿今天这份喜气，也带给你一份好运。"],
    ["把快乐带走", "愿这颗小喜糖，甜到你今天的心里。"]
  ];
  function wrapIndex(index, count) {
    return count > 0 ? (index % count + count) % count : 0;
  }
  function photosForGroup(group = "all") {
    return group === "all" ? PHOTOS : PHOTOS.filter((photo) => photo.group === group);
  }
  function nextWish(previous = null, random = Math.random) {
    const choices = WISHES.map((_, i) => i).filter((i) => i !== previous);
    return choices[Math.min(choices.length - 1, Math.max(0, Math.floor(random() * choices.length)))];
  }
  function clampProgress(value) {
    return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
  }
  function progressFromDrag({ startProgress, deltaX, leafWidth, side }) {
    const direction = side === "left" ? -1 : 1;
    return clampProgress(startProgress + deltaX * direction / Math.max(1, leafWidth * 0.8));
  }
  function settleDoor(progress) {
    return clampProgress(progress) >= 0.38 ? 1 : 0;
  }
  function initialState() {
    return { scene: "desk", deskOpened: false, doorProgress: 0, infoOpen: false, sound: false, children: { groom: false, bride: false }, albumGroup: "all", photoIndex: 0, candyOpen: false, wishIndex: null, candyDraws: 0, stamp: "", secrets: [] };
  }
  function transition(state2, action) {
    switch (action.type) {
      case "OPEN_DESK":
        return { ...state2, deskOpened: true };
      case "SCENE":
        return SCENES.some((scene) => scene.id === action.scene) ? { ...state2, scene: action.scene } : state2;
      case "DOOR":
        return { ...state2, doorProgress: clampProgress(action.progress) };
      case "INFO":
        return { ...state2, infoOpen: !!action.open };
      case "SOUND":
        return { ...state2, sound: !state2.sound };
      case "SET_SOUND":
        return { ...state2, sound: !!action.enabled };
      case "CHILD":
        return ["groom", "bride"].includes(action.person) ? { ...state2, children: { ...state2.children, [action.person]: !state2.children[action.person] } } : state2;
      case "ALBUM_GROUP":
        return { ...state2, albumGroup: action.group, photoIndex: 0 };
      case "PHOTO":
        return { ...state2, photoIndex: wrapIndex(action.index, photosForGroup(state2.albumGroup).length) };
      case "CANDY":
        return { ...state2, candyOpen: true, wishIndex: action.wish ?? state2.wishIndex, candyDraws: state2.candyDraws + (Number.isInteger(action.wish) ? 1 : 0) };
      case "STAMP":
        return { ...state2, stamp: action.word };
      case "SECRET":
        return { ...state2, secrets: [.../* @__PURE__ */ new Set([...state2.secrets, action.id])] };
      case "REPLAY": {
        if (state2.scene === "desk") return { ...state2, deskOpened: false };
        if (state2.scene === "home") return { ...state2, doorProgress: 0 };
        if (state2.scene === "childhood") return { ...state2, children: { groom: false, bride: false } };
        if (state2.scene === "gallery") return { ...state2, albumGroup: "all", photoIndex: 0 };
        if (state2.scene === "candy") return { ...state2, candyOpen: false, wishIndex: null, candyDraws: 0 };
        return { ...state2, stamp: "" };
      }
      default:
        return state2;
    }
  }
  function weddingCalendar() {
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Tree and Leaf//Wedding//ZH",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      "UID:shukai-xiaomei-20261122@wedding.local",
      "DTSTAMP:20261024T000000Z",
      "DTSTART;VALUE=DATE:20261122",
      "DTEND;VALUE=DATE:20261123",
      "SUMMARY:丁树凯与叶小妹的婚礼",
      `LOCATION:${WEDDING.address}`,
      "DESCRIPTION:来喝杯喜酒，一起热闹一下。开席时间请以新人后续通知为准。",
      "END:VEVENT",
      "END:VCALENDAR",
      ""
    ].join("\r\n");
  }

  // interactive-invitation/dist/chapters.mjs?v=3
  function createChapters({ getState, dispatch, navigate, playEffect, showInfo: showInfo2, announce: announce2, tell: tell2, hearts: hearts2 }) {
    const $2 = (id) => document.getElementById(id);
    let albumKey = "";
    let lastWish = null;
    let lastStamp = "";
    let photoReturnFocus;
    let chapterReturnFocus;
    let swipe;
    const modalOpen = (dialog) => {
      if (typeof dialog.showModal === "function") {
        if (!dialog.open) dialog.showModal();
      } else dialog.setAttribute("open", "");
    };
    const modalClose = (dialog) => typeof dialog.close === "function" ? dialog.close() : dialog.removeAttribute("open");
    function changePhoto(delta) {
      dispatch({ type: "PHOTO", index: getState().photoIndex + delta });
      $2("photo-zone").classList.remove("zoomed");
      $2("photo-zoom").textContent = "放大";
      playEffect("flip");
    }
    function makeThumb(photo, index, container) {
      const button = document.createElement("button");
      button.className = "album-thumb";
      button.type = "button";
      button.dataset.photoIndex = String(index);
      button.setAttribute("aria-label", `查看第${index + 1}张婚纱照`);
      const image = document.createElement("img");
      image.src = photo.src;
      image.alt = "";
      image.loading = "lazy";
      image.draggable = false;
      button.append(image);
      button.addEventListener("click", () => {
        dispatch({ type: "PHOTO", index });
        playEffect("flip");
      });
      container.append(button);
    }
    function renderAlbum(state2) {
      if (state2.scene !== "gallery" && !$2("photo-dialog").open) return;
      const photos = photosForGroup(state2.albumGroup);
      const key = state2.albumGroup;
      if (albumKey !== key || !$2("album-thumbnails").children.length) {
        albumKey = key;
        $2("album-thumbnails").replaceChildren();
        $2("viewer-thumbnails").replaceChildren();
        photos.forEach((photo2, index) => {
          makeThumb(photo2, index, $2("album-thumbnails"));
          makeThumb(photo2, index, $2("viewer-thumbnails"));
        });
      }
      const photo = photos[state2.photoIndex];
      if (!photo) return;
      for (const id of ["album-photo", "photo-full"]) {
        const image = $2(id);
        if (image.getAttribute("src") !== photo.src) image.src = photo.src;
        image.alt = `婚纱照第${photo.id}张：${photo.caption}`;
      }
      $2("album-caption").textContent = photo.caption;
      $2("photo-caption").textContent = photo.caption;
      const position = `${String(state2.photoIndex + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`;
      $2("album-count").textContent = position;
      $2("photo-position").textContent = position;
      document.querySelectorAll("[data-group]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.group === state2.albumGroup)));
      for (const containerId of ["album-thumbnails", "viewer-thumbnails"]) {
        const container = $2(containerId);
        [...container.children].forEach((button, index) => button.setAttribute("aria-pressed", String(index === state2.photoIndex)));
        const selected = container.children[state2.photoIndex];
        if (selected) {
          const left = selected.offsetLeft - container.offsetLeft;
          if (left < container.scrollLeft || left + selected.offsetWidth > container.scrollLeft + container.clientWidth) container.scrollTo({ left: Math.max(0, left - container.clientWidth / 2 + selected.offsetWidth / 2), behavior: "auto" });
        }
      }
    }
    function openPhotos(trigger) {
      photoReturnFocus = trigger || document.activeElement;
      modalOpen($2("photo-dialog"));
      renderAlbum(getState());
      $2("photo-close").focus({ preventScroll: true });
    }
    function closePhotos() {
      modalClose($2("photo-dialog"));
      $2("photo-zone").classList.remove("zoomed");
      $2("photo-zoom").textContent = "放大";
      photoReturnFocus?.focus?.({ preventScroll: true });
    }
    function drawCandy() {
      dispatch({ type: "CANDY", wish: nextWish(getState().wishIndex) });
      playEffect("candy");
      hearts2(51, 62, false);
    }
    function render2(state2) {
      for (const person of ["groom", "bride"]) {
        const button = $2(`child-${person}`);
        const flipped = state2.children[person];
        button.classList.toggle("flipped", flipped);
        button.setAttribute("aria-pressed", String(flipped));
        button.setAttribute("aria-label", `${flipped ? "翻回" : "翻开"}${person === "groom" ? "丁树凯" : "叶小妹"}的童年照片`);
      }
      $2("child-story").innerHTML = state2.children.groom && state2.children.bride ? "从小朋友，到小两口。<br>往后的故事，我们一起写。" : "小时候，各自长大。<br>后来，决定一起成家。";
      renderAlbum(state2);
      $2("candy-scene").classList.toggle("opened", state2.candyOpen);
      $2("candy-draw").querySelector("span").textContent = state2.candyOpen ? "再抽一颗喜糖" : "打开喜糖盒";
      document.querySelectorAll("[data-candy]").forEach((button) => {
        button.disabled = !state2.candyOpen;
        button.tabIndex = state2.candyOpen ? 0 : -1;
      });
      if (state2.wishIndex !== lastWish) {
        lastWish = state2.wishIndex;
        const wish = WISHES[state2.wishIndex];
        $2("wish-title").textContent = wish ? wish[0] : "有一份甜蜜等你拆开";
        $2("wish-body").textContent = wish ? wish[1] : "点开喜糖盒，看看我们为你藏了什么。";
        $2("wish-slip").classList.remove("new-wish");
        if (wish) {
          void $2("wish-slip").offsetWidth;
          $2("wish-slip").classList.add("new-wish");
          announce2(`${wish[0]}：${wish[1]}`);
        }
      }
      $2("wish-count").textContent = state2.candyDraws ? `你已经收下 ${state2.candyDraws} 颗甜蜜` : "一颗喜糖，一句祝福";
      $2("blessing-stamp").hidden = !state2.stamp;
      if (state2.stamp !== lastStamp) {
        lastStamp = state2.stamp;
        $2("blessing-stamp").replaceChildren(...Array.from(state2.stamp).map((letter) => {
          const span = document.createElement("span");
          span.textContent = letter;
          return span;
        }));
        $2("blessing-stamp").setAttribute("aria-label", state2.stamp);
        $2("blessing-stamp").style.animation = "none";
        void $2("blessing-stamp").offsetWidth;
        $2("blessing-stamp").style.animation = "";
      }
      document.querySelectorAll("[data-stamp]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.stamp === state2.stamp)));
      $2("secret-count").textContent = state2.secrets.length ? `你发现了 ${state2.secrets.length} / 3 个小彩蛋。小欢喜，都藏在日常里。` : "小彩蛋，也藏在日常里。";
      document.querySelectorAll("[data-chapter]").forEach((button) => button.setAttribute("aria-current", button.dataset.chapter === state2.scene ? "step" : "false"));
    }
    for (const person of ["groom", "bride"]) $2(`child-${person}`).addEventListener("click", () => {
      dispatch({ type: "CHILD", person });
      playEffect("flip");
    });
    $2("child-next").addEventListener("click", () => navigate("home"));
    $2("gallery-continue").addEventListener("click", () => navigate("candy"));
    $2("candy-continue").addEventListener("click", () => navigate("invite"));
    document.querySelectorAll("[data-group]").forEach((button) => button.addEventListener("click", () => dispatch({ type: "ALBUM_GROUP", group: button.dataset.group })));
    $2("album-prev").addEventListener("click", () => changePhoto(-1));
    $2("album-next").addEventListener("click", () => changePhoto(1));
    $2("viewer-prev").addEventListener("click", () => changePhoto(-1));
    $2("viewer-next").addEventListener("click", () => changePhoto(1));
    $2("album-open").addEventListener("click", (event) => openPhotos(event.currentTarget));
    $2("album-full").addEventListener("click", (event) => openPhotos(event.currentTarget));
    $2("photo-close").addEventListener("click", closePhotos);
    $2("photo-dialog").addEventListener("click", (event) => {
      if (event.target === $2("photo-dialog")) closePhotos();
    });
    $2("photo-dialog").addEventListener("cancel", () => {
      $2("photo-zone").classList.remove("zoomed");
      $2("photo-zoom").textContent = "放大";
    });
    $2("photo-dialog").addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        changePhoto(event.key === "ArrowLeft" ? -1 : 1);
      }
    });
    $2("photo-zoom").addEventListener("click", () => {
      const zoomed = $2("photo-zone").classList.toggle("zoomed");
      $2("photo-zoom").textContent = zoomed ? "还原" : "放大";
    });
    $2("photo-zone").addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;
      swipe = { x: event.clientX, y: event.clientY, id: event.pointerId };
    });
    $2("photo-zone").addEventListener("pointerup", (event) => {
      if (!swipe || swipe.id !== event.pointerId) return;
      const x = event.clientX - swipe.x, y = event.clientY - swipe.y;
      swipe = null;
      if (Math.abs(x) > 40 && Math.abs(x) > Math.abs(y) * 1.3) changePhoto(x < 0 ? 1 : -1);
    });
    $2("photo-zone").addEventListener("pointercancel", () => {
      swipe = null;
    });
    $2("candy-draw").addEventListener("click", drawCandy);
    document.querySelectorAll("[data-candy]").forEach((button) => button.addEventListener("click", drawCandy));
    document.querySelectorAll("[data-stamp]").forEach((button) => button.addEventListener("click", () => {
      dispatch({ type: "STAMP", word: button.dataset.stamp });
      playEffect("candy");
      tell2("这枚祝福，已经盖在这张喜帖上。");
    }));
    $2("final-info").addEventListener("click", (event) => showInfo2(event.currentTarget));
    $2("tea-secret").addEventListener("click", () => {
      dispatch({ type: "SECRET", id: "tea" });
      $2("tea-steam").classList.remove("active");
      void $2("tea-steam").offsetWidth;
      $2("tea-steam").classList.add("active");
      tell2("喜茶已沏好，等你来做客。");
      playEffect("flip");
    });
    $2("cat-secret").addEventListener("click", () => {
      dispatch({ type: "SECRET", id: "cat" });
      hearts2(10, 82);
      tell2("门口的纸片小猫，替我们说：欢迎光临。");
    });
    SCENES.forEach((scene, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chapter-list-button";
      button.dataset.chapter = scene.id;
      const number = document.createElement("span");
      number.textContent = String(index + 1).padStart(2, "0");
      const name = document.createElement("b");
      name.textContent = scene.title;
      button.append(number, name);
      button.addEventListener("click", () => {
        modalClose($2("chapters-dialog"));
        navigate(scene.id);
        chapterReturnFocus?.focus?.({ preventScroll: true });
      });
      $2("chapter-list").append(button);
      const dot = document.createElement("i");
      dot.dataset.sceneDot = scene.id;
      $2("chapter-dots").append(dot);
    });
    $2("chapter-picker").addEventListener("click", (event) => {
      chapterReturnFocus = event.currentTarget;
      modalOpen($2("chapters-dialog"));
      $2("chapters-close").focus({ preventScroll: true });
    });
    $2("chapters-close").addEventListener("click", () => {
      modalClose($2("chapters-dialog"));
      chapterReturnFocus?.focus?.({ preventScroll: true });
    });
    $2("chapters-dialog").addEventListener("click", (event) => {
      if (event.target === $2("chapters-dialog")) modalClose($2("chapters-dialog"));
    });
    return { render: render2 };
  }

  // interactive-invitation/dist/sound.mjs?v=3
  function createSoundtrack({ element, onChange, onBlocked }) {
    let desired = false;
    let context;
    let request = 0;
    element.volume = 0.55;
    async function setEnabled(enabled) {
      desired = !!enabled;
      const current = ++request;
      if (!desired) {
        element.pause();
        onChange(false);
        return false;
      }
      try {
        await element.play();
        if (current !== request || !desired) {
          if (!desired) element.pause();
          return false;
        }
        onChange(true);
        return true;
      } catch {
        if (current !== request) return false;
        desired = false;
        onChange(false);
        onBlocked();
        return false;
      }
    }
    function effect(kind = "open") {
      if (!desired || document.hidden) return;
      try {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) return;
        context || (context = new Context());
        context.resume().catch(() => {
        });
        const tap = kind === "tap";
        const notes = tap ? [1046.5] : kind === "light" ? [392, 523.25, 659.25] : kind === "candy" ? [659.25, 880, 1046.5] : kind === "heart" ? [659.25, 783.99] : kind === "flip" ? [740] : [523.25, 659.25, 783.99];
        notes.forEach((frequency, index) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          const time = context.currentTime + index * 0.075;
          oscillator.type = "sine";
          oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(tap ? 0.045 : 0.055, time + 8e-3);
          gain.gain.exponentialRampToValueAtTime(1e-4, time + (tap ? 0.075 : 0.3));
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.start(time);
          oscillator.stop(time + (tap ? 0.085 : 0.33));
          oscillator.onended = () => {
            oscillator.disconnect();
            gain.disconnect();
          };
        });
      } catch {
      }
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        ++request;
        element.pause();
        context?.suspend();
      } else if (desired) setEnabled(true);
    });
    return { setEnabled, effect, isEnabled: () => desired };
  }

  // interactive-invitation/dist/experience-model.mjs?v=3
  var secretIds = ["tea", "heart", "cat"];
  function fitPhotoFrame(sourceWidth, sourceHeight, maxWidth, maxHeight) {
    if (![sourceWidth, sourceHeight, maxWidth, maxHeight].every((n) => Number.isFinite(n) && n > 0) || maxWidth < 17 || maxHeight < 37) return { width: 0, height: 0, imageWidth: 0, imageHeight: 0 };
    const scale = Math.min((maxWidth - 16) / sourceWidth, (maxHeight - 36) / sourceHeight);
    const imageWidth = sourceWidth * scale, imageHeight = sourceHeight * scale;
    return { width: imageWidth + 16, height: imageHeight + 36, imageWidth, imageHeight };
  }
  function sanitizeGuestName(value) {
    if (typeof value !== "string") return "亲爱的你";
    const name = Array.from(value.replace(/[\u0000-\u001f\u007f]/g, "").trim().replace(/\s+/g, " ")).slice(0, 12).join("");
    return name || "亲爱的你";
  }
  function readMemory(raw) {
    const defaults = { favorite: "03", secrets: [], night: false };
    try {
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object" || Array.isArray(data)) return defaults;
      return { favorite: /^(0[1-9]|1[0-8])$/.test(data.favorite) ? data.favorite : "03", secrets: [...new Set((Array.isArray(data.secrets) ? data.secrets : []).filter((id) => secretIds.includes(id)))], night: data.night === true };
    } catch {
      return defaults;
    }
  }
  function daysUntilWedding(now = /* @__PURE__ */ new Date()) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Shanghai", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(now).map((p) => [p.type, p.value]));
    return Math.round((Date.UTC(2026, 10, 22) - Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day))) / 864e5);
  }
  function allSecretsFound(secrets) {
    return secretIds.every((id) => secrets.includes(id));
  }

  // interactive-invitation/dist/experience.mjs?v=3
  function createExperience({ getState, playEffect, tell: tell2, hearts: hearts2 }) {
    const $2 = (id) => document.getElementById(id);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let memory;
    try {
      memory = readMemory(localStorage.getItem("tree-leaf-guest-v3"));
    } catch {
      memory = readMemory(null);
    }
    let favorite = memory.favorite, night = memory.night;
    let previous = { deskOpened: false, joined: false, candyDraws: 0, stamp: "", doorProgress: 0 };
    let frameAnimation, pageAnimation, selectedSrc = "", lastSaved = "", nextDateCheck = 0;
    function save(state2) {
      const raw = JSON.stringify({ favorite, night, secrets: state2.secrets });
      if (raw === lastSaved) return;
      lastSaved = raw;
      try {
        localStorage.setItem("tree-leaf-guest-v3", raw);
      } catch {
      }
    }
    function confetti(count = 18) {
      if (reduced || document.hidden) return;
      const colors = ["#f4c18f", "#b14458", "#dba1ad", "#78856a", "#fff4dd"];
      for (let i = 0; i < count; i++) {
        const piece = document.createElement("i");
        piece.style.cssText = `--x:${10 + Math.random() * 80}%;--drift:${(Math.random() - 0.5) * 160}px;--delay:${Math.random() * 0.3}s;--turn:${Math.random() * 540 - 270}deg;background:${colors[i % colors.length]}`;
        $2("paper-confetti").append(piece);
        piece.addEventListener("animationend", () => piece.remove(), { once: true });
      }
    }
    function fitAlbum() {
      const image = $2("album-photo"), area = document.querySelector(".album-main");
      if (!image.naturalWidth || !area.clientWidth) return;
      const frame = fitPhotoFrame(image.naturalWidth, image.naturalHeight, area.clientWidth, area.clientHeight);
      if (!frame.width) return;
      area.style.setProperty("--frame-width", `${frame.width}px`);
      area.style.setProperty("--frame-height", `${frame.height}px`);
    }
    $2("album-photo").addEventListener("load", fitAlbum);
    if (typeof ResizeObserver === "function") new ResizeObserver(fitAlbum).observe(document.querySelector(".album-main"));
    else window.addEventListener("resize", fitAlbum);
    for (let i = 0; i < 11; i++) {
      const bulb = document.createElement("i");
      bulb.style.setProperty("--bulb", i);
      $2("fairy-lights").append(bulb);
    }
    $2("home-light").addEventListener("click", () => {
      night = !night;
      render2(getState());
      playEffect("light");
      if (night) {
        confetti(8);
        tell2("日落以后，也有一盏灯，为你留着。");
      }
    });
    $2("album-keep").addEventListener("click", () => {
      const state2 = getState(), photo = photosForGroup(state2.albumGroup)[state2.photoIndex];
      if (!photo) return;
      favorite = photo.id;
      render2(state2);
      playEffect("heart");
      hearts2(60, 65, false);
      tell2("这张照片，会出现在最后送你的纪念票里。");
    });
    document.querySelectorAll("[data-candy]").forEach((button) => button.addEventListener("click", () => {
      const flavors = { strawberry: "草莓味 · 把心动分给你", cream: "奶糖味 · 日子慢慢甜", peach: "蜜桃味 · 好运正当时" };
      $2("candy-flavor").textContent = flavors[button.dataset.candy];
    }));
    function enter(scene, from) {
      if (scene === from) return;
      pageAnimation?.cancel();
      if (!reduced && $2("page-ribbon").animate) {
        pageAnimation = $2("page-ribbon").animate([{ transform: "translateX(-120%) rotate(-8deg)", opacity: 0 }, { transform: "translateX(-10%) rotate(-8deg)", opacity: 1, offset: 0.28 }, { transform: "translateX(120%) rotate(-8deg)", opacity: 0 }], { duration: 650, easing: "cubic-bezier(.2,.7,.3,1)" });
      }
      if (scene === "gallery") requestAnimationFrame(fitAlbum);
      if (scene === "invite") confetti(14);
    }
    function render2(state2) {
      const joined = state2.children.groom && state2.children.bride;
      document.querySelector(".child-cards").classList.toggle("joined", joined);
      $2("child-thread").classList.toggle("visible", joined);
      $2("invitation").dataset.night = String(night);
      const light = $2("home-light"), open = state2.doorProgress >= 0.99;
      light.disabled = !open;
      light.setAttribute("aria-hidden", String(!open));
      light.setAttribute("aria-pressed", String(night));
      light.setAttribute("aria-label", night ? "让小家回到白天" : "点亮小家的晚灯");
      light.querySelector("small").textContent = night ? "回到白天" : "点亮小家";
      light.querySelector("span").textContent = night ? "☾" : "☀";
      const photo = photosForGroup(state2.albumGroup)[state2.photoIndex];
      if (photo) {
        const kept = photo.id === favorite;
        $2("album-keep").textContent = kept ? "♥ 这张已选好" : "♡ 选这张做纪念";
        $2("album-keep").setAttribute("aria-pressed", String(kept));
        if (state2.scene === "gallery" && selectedSrc !== photo.src) {
          selectedSrc = photo.src;
          fitAlbum();
          frameAnimation?.cancel();
          if (!reduced && $2("album-open").animate) frameAnimation = $2("album-open").animate([{ opacity: 0.3, translate: "12px 0", rotate: "2deg" }, { opacity: 1, translate: "0 0", rotate: "0deg" }], { duration: 350, easing: "ease-out" });
        }
      }
      document.querySelectorAll("[data-memory]").forEach((stamp) => {
        const found = state2.secrets.includes(stamp.dataset.memory);
        stamp.classList.toggle("collected", found);
        stamp.setAttribute("aria-label", `${stamp.querySelector("small").textContent}，${found ? "已收集" : "未发现"}`);
      });
      if (Date.now() >= nextDateCheck) {
        nextDateCheck = Date.now() + 6e4;
        const days = daysUntilWedding();
        $2("wedding-countdown").textContent = days > 0 ? `距离好日子，还有 ${days} 天` : days === 0 ? "就是今天，婚礼见。" : "好日子，值得好好珍藏。";
      }
      if (state2.deskOpened && !previous.deskOpened) confetti(24);
      if (joined && !previous.joined) hearts2(50, 49, false);
      if (state2.candyDraws > previous.candyDraws) confetti(previous.candyDraws === 0 ? 22 : 7);
      if (!state2.candyOpen) $2("candy-flavor").textContent = "";
      if (state2.stamp && state2.stamp !== previous.stamp) confetti(24);
      previous = { deskOpened: state2.deskOpened, joined, candyDraws: state2.candyDraws, stamp: state2.stamp, doorProgress: state2.doorProgress };
      save(state2);
    }
    return { render: render2, enter, initialSecrets: memory.secrets, getFavorite: () => PHOTOS.find((p) => p.id === favorite) || PHOTOS[2], hasSpecialStamp: () => allSecretsFound(getState().secrets) };
  }

  // interactive-invitation/dist/keepsake.mjs?v=3
  function createKeepsake({ getState, getPhoto, hasSpecialStamp }) {
    const $2 = (id) => document.getElementById(id);
    const dialog = $2("keepsake-dialog");
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "small-button";
    retry.textContent = "重新展开纪念票";
    retry.hidden = true;
    document.querySelector(".keepsake-preview").append(retry);
    let returnFocus2, request = 0, previewUrl, debounce;
    const images = /* @__PURE__ */ new Map();
    function loadImage(src) {
      if (!images.has(src)) images.set(src, new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => {
          images.delete(src);
          reject(new Error("image unavailable"));
        };
        img.src = src;
      }));
      return images.get(src);
    }
    function sprig(ctx, x, y, turn) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(turn);
      ctx.strokeStyle = "#738060";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(10, -40, -5, -90, 12, -140);
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const side = i % 2 ? -1 : 1;
        ctx.save();
        ctx.translate(3, -20 - i * 24);
        ctx.rotate(side * 0.8);
        ctx.fillStyle = i % 2 ? "#85906b" : "#657957";
        ctx.beginPath();
        ctx.ellipse(side * 13, 0, 19, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = "#ce8e94";
      for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * 2 / 5;
        ctx.beginPath();
        ctx.ellipse(11 + Math.cos(a) * 12, -145 + Math.sin(a) * 12, 10, 7, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#c4a16c";
      ctx.beginPath();
      ctx.arc(11, -145, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    function drawTicket(image, guest, stamp, special) {
      const canvas = document.createElement("canvas");
      canvas.width = 900;
      canvas.height = 1460;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas unavailable");
      ctx.fillStyle = "#e6bab4";
      ctx.fillRect(0, 0, 900, 1460);
      ctx.fillStyle = "#fff1d9";
      ctx.fillRect(23, 23, 854, 1414);
      ctx.strokeStyle = "#c7a581";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 8]);
      ctx.strokeRect(42, 42, 816, 1376);
      ctx.setLineDash([]);
      sprig(ctx, 95, 210, -0.45);
      sprig(ctx, 805, 210, 0.45);
      sprig(ctx, 95, 1400, -0.5);
      sprig(ctx, 805, 1400, 0.5);
      ctx.textAlign = "center";
      ctx.fillStyle = "#8a3341";
      const serif = '"Songti SC",STSong,"Noto Serif CJK SC",serif';
      ctx.font = `23px ${serif}`;
      ctx.fillText("树 与 叶  ·  喜 事 邮 局", 450, 91);
      ctx.font = `bold 43px ${serif}`;
      ctx.fillText("把这份欢喜，寄给你", 450, 163);
      ctx.font = `29px ${serif}`;
      ctx.fillStyle = "#8f6953";
      ctx.fillText(`致 · ${guest}`, 450, 222);
      const scale = Math.min(654 / image.naturalWidth, 555 / image.naturalHeight);
      const w = image.naturalWidth * scale, h = image.naturalHeight * scale, x = (900 - w) / 2, y = 280 + (555 - h) / 2;
      ctx.save();
      ctx.shadowColor = "#78523b33";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 9;
      ctx.fillStyle = "#fffaf0";
      ctx.fillRect(x - 15, y - 15, w + 30, h + 69);
      ctx.restore();
      ctx.drawImage(image, x, y, w, h);
      ctx.font = `22px ${serif}`;
      ctx.fillStyle = "#98634f";
      ctx.fillText("这份喜悦，想和你分享。", 450, y + h + 39);
      ctx.strokeStyle = "#c6a17e";
      ctx.setLineDash([7, 12]);
      ctx.beginPath();
      ctx.moveTo(65, 934);
      ctx.lineTo(835, 934);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#e6bab4";
      for (const edge of [23, 877]) {
        ctx.beginPath();
        ctx.arc(edge, 934, 23, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#8a3341";
      ctx.font = `bold 39px ${serif}`;
      ctx.fillText("丁树凯  &  叶小妹", 450, 1006);
      ctx.font = "68px Georgia,serif";
      ctx.fillText("2026.11.22", 450, 1089);
      ctx.font = `24px ${serif}`;
      ctx.fillStyle = "#99745b";
      ctx.fillText("星期日  ·  期待与你相聚", 450, 1134);
      ctx.font = `26px ${serif}`;
      ctx.fillStyle = "#8c493e";
      ctx.fillText("安徽省宿州市灵璧县", 450, 1197);
      ctx.fillText("韦集镇陈园村浦庄丁府", 450, 1234);
      ctx.font = `24px ${serif}`;
      ctx.fillText("喜酒一起喝，欢喜一起分。", 410, 1320);
      ctx.save();
      ctx.translate(724, 1324);
      ctx.rotate(-0.16);
      ctx.strokeStyle = "#ad4350";
      ctx.lineWidth = 2;
      ctx.strokeRect(-55, -55, 110, 110);
      ctx.strokeRect(-49, -49, 98, 98);
      ctx.font = `bold 28px ${serif}`;
      ctx.fillStyle = "#ad4350";
      ctx.fillText(stamp.slice(0, 2), 0, -7);
      ctx.fillText(stamp.slice(2), 0, 29);
      ctx.restore();
      ctx.font = `20px ${serif}`;
      ctx.fillStyle = "#8b765c";
      ctx.fillText(special ? "三枚彩蛋已集齐 · 小屋珍藏纪念" : "邀你，共赴一个好日子", 450, 1394);
      return canvas;
    }
    async function updatePreview() {
      const current = ++request;
      $2("keepsake-download").disabled = true;
      retry.hidden = true;
      document.querySelector(".keepsake-preview").setAttribute("aria-busy", "true");
      $2("keepsake-status").hidden = false;
      $2("keepsake-status").textContent = "正在把欢喜装进小票…";
      try {
        const photo = getPhoto();
        const image = await loadImage(photo.src);
        if (document.fonts?.ready) await document.fonts.ready;
        const canvas = drawTicket(image, sanitizeGuestName($2("keepsake-name").value), getState().stamp || "婚礼见", hasSpecialStamp());
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
        if (current !== request || !dialog.open) return;
        if (!blob) throw new Error("export unavailable");
        const old = previewUrl;
        previewUrl = URL.createObjectURL(blob);
        $2("keepsake-image").src = previewUrl;
        $2("keepsake-image").alt = `写给${sanitizeGuestName($2("keepsake-name").value)}的婚礼纪念票`;
        if (old) URL.revokeObjectURL(old);
        document.querySelector(".keepsake-preview").setAttribute("aria-busy", "false");
        $2("keepsake-status").hidden = true;
        $2("keepsake-download").disabled = false;
      } catch {
        if (current !== request) return;
        document.querySelector(".keepsake-preview").setAttribute("aria-busy", "false");
        $2("keepsake-status").textContent = "小票暂时没展开，可以再试一次。";
        retry.hidden = false;
      }
    }
    function close() {
      clearTimeout(debounce);
      ++request;
      dialog.close();
      returnFocus2?.focus?.({ preventScroll: true });
    }
    $2("keepsake-open").addEventListener("click", (event) => {
      returnFocus2 = event.currentTarget;
      if (!dialog.open) dialog.showModal();
      $2("keepsake-close").focus({ preventScroll: true });
      updatePreview();
    });
    $2("keepsake-close").addEventListener("click", close);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) close();
    });
    dialog.addEventListener("cancel", () => {
      clearTimeout(debounce);
      ++request;
    });
    $2("keepsake-name").addEventListener("input", () => {
      clearTimeout(debounce);
      ++request;
      $2("keepsake-download").disabled = true;
      document.querySelector(".keepsake-preview").setAttribute("aria-busy", "true");
      debounce = setTimeout(updatePreview, 180);
    });
    retry.addEventListener("click", updatePreview);
    $2("keepsake-download").addEventListener("click", () => {
      if (!previewUrl) return;
      const a = document.createElement("a");
      a.href = previewUrl;
      a.download = `树与叶的婚礼纪念票-${sanitizeGuestName($2("keepsake-name").value).replace(/[\\/:*?"<>|]/g, "")}.png`;
      document.body.append(a);
      a.click();
      a.remove();
    });
  }

  // interactive-invitation/dist/app.mjs
  var $ = (id) => document.getElementById(id);
  var root = $("invitation");
  var state = initialState();
  var drag = null;
  var suppressDoorClickUntil = 0;
  var toastTimeout;
  var sound;
  var chapters;
  var experience;
  var messageTimeout;
  var returnFocus;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function announce(message) {
    $("announcement").textContent = message;
  }
  function update(action) {
    state = transition(state, action);
    render();
  }
  function render() {
    root.dataset.scene = state.scene;
    root.dataset.deskOpen = String(state.deskOpened);
    const sceneIndex = SCENES.findIndex((scene) => scene.id === state.scene);
    SCENES.forEach((scene) => {
      $(`${scene.id}-scene`).hidden = state.scene !== scene.id;
    });
    $("chapter-count").textContent = `${String(sceneIndex + 1).padStart(2, "0")} / 06`;
    $("chapter-name").textContent = SCENES[sceneIndex].title;
    $("scene-prev").disabled = sceneIndex === 0;
    $("scene-next").setAttribute("aria-label", sceneIndex === SCENES.length - 1 ? "回到开头" : "下一幕");
    $("scene-next").querySelector("small").textContent = sceneIndex === SCENES.length - 1 ? "回开头" : "下一幕";
    document.querySelectorAll("[data-scene-dot]").forEach((dot) => dot.classList.toggle("active", dot.dataset.sceneDot === state.scene));
    $("envelope").disabled = state.deskOpened;
    $("envelope").setAttribute("aria-hidden", String(state.deskOpened));
    $("send-heart").disabled = !state.deskOpened;
    $("desk-action").querySelector("span").textContent = state.deskOpened ? "认识小时候的我们" : "有声拆开喜讯";
    const open = state.doorProgress >= 0.99;
    $("home-scene").classList.toggle("is-open", open);
    $("doorway").style.setProperty("--left-angle", `${-105 * state.doorProgress}deg`);
    $("doorway").style.setProperty("--right-angle", `${105 * state.doorProgress}deg`);
    $("door-instruction").style.opacity = String(Math.max(0, 1 - state.doorProgress * 4));
    for (const id of ["door-left", "door-right"]) {
      $(id).setAttribute("aria-expanded", String(open));
      $(id).tabIndex = open ? -1 : 0;
    }
    $("home-action").querySelector("span").textContent = open ? "翻翻我们的相册" : "推开我们的小家";
    $("sound").setAttribute("aria-pressed", String(state.sound));
    $("sound").setAttribute("aria-label", state.sound ? "关闭配乐及音效" : "开启参考配乐");
    $("sound-label").textContent = state.sound ? "配乐开" : "配乐关";
    chapters?.render(state);
    experience?.render(state);
  }
  function chime(kind = "open") {
    sound?.effect(kind);
  }
  function tell(message) {
    clearTimeout(messageTimeout);
    $("floating-message").textContent = message;
    $("floating-message").hidden = false;
    messageTimeout = setTimeout(() => {
      $("floating-message").hidden = true;
    }, 2800);
  }
  function hearts(x = 52, y = 52, withSound = true) {
    if (withSound) chime("heart");
    if (reducedMotion) return;
    for (let i = 0; i < 9; i++) {
      const heart = document.createElement("span");
      heart.className = "heart-particle";
      heart.textContent = i % 2 ? "♡" : "♥";
      const values = { x: `${x}%`, y: `${y}%`, dx: `${(Math.random() - 0.5) * 125}px`, dy: `${-45 - Math.random() * 100}px`, turn: `${(Math.random() - 0.5) * 65}deg`, size: `${13 + Math.random() * 15}px` };
      for (const [key, value] of Object.entries(values)) heart.style.setProperty(`--${key}`, value);
      $("heart-particles").append(heart);
      heart.addEventListener("animationend", () => heart.remove(), { once: true });
    }
  }
  function openDesk(withMusic = true) {
    if (state.deskOpened) {
      chime("tap");
      goScene("childhood");
      return;
    }
    sound.setEnabled(withMusic);
    update({ type: "OPEN_DESK" });
    chime();
    announce("喜讯已拆开，我们结婚啦。可以点一下我们的比心，或前往小家。");
  }
  function goScene(scene) {
    const previousScene = state.scene;
    drag = null;
    root.dataset.dragging = "false";
    if (state.scene === "home" && state.doorProgress > 0 && state.doorProgress < 1) update({ type: "DOOR", progress: settleDoor(state.doorProgress) });
    update({ type: "SCENE", scene });
    experience?.enter(scene, previousScene);
    clearTimeout(messageTimeout);
    $("floating-message").hidden = true;
    $("heart-particles").replaceChildren();
    const chapter = SCENES.find((item) => item.id === scene);
    announce(`${chapter.title}。${chapter.line}。`);
  }
  function openDoor() {
    update({ type: "DOOR", progress: 1 });
    chime();
    announce("门已打开，欢迎来我们的小家。下方可以前往我们的相册。");
  }
  function startDrag(event) {
    if (event.button !== 0 || !event.isPrimary || state.doorProgress >= 0.99) return;
    drag = { id: event.pointerId, x: event.clientX, progress: state.doorProgress, side: event.currentTarget.dataset.side, width: $("doorway").clientWidth / 2, distance: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
    root.dataset.dragging = "true";
  }
  function moveDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const deltaX = event.clientX - drag.x;
    drag.distance = Math.max(drag.distance, Math.abs(deltaX));
    update({ type: "DOOR", progress: progressFromDrag({ startProgress: drag.progress, deltaX, leafWidth: drag.width, side: drag.side }) });
  }
  function finishDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const moved = drag.distance >= 8;
    drag = null;
    root.dataset.dragging = "false";
    suppressDoorClickUntil = Date.now() + 450;
    const next = event.type === "pointercancel" || moved ? settleDoor(state.doorProgress) : 1;
    if (next) openDoor();
    else update({ type: "DOOR", progress: 0 });
  }
  function showInfo(trigger) {
    returnFocus = trigger || document.activeElement;
    update({ type: "INFO", open: true });
    const dialog = $("info-dialog");
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else dialog.setAttribute("open", "");
    $("info-close").focus({ preventScroll: true });
  }
  function hideInfo() {
    const dialog = $("info-dialog");
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    update({ type: "INFO", open: false });
    returnFocus?.focus?.({ preventScroll: true });
  }
  function toast(message) {
    clearTimeout(toastTimeout);
    $("toast").textContent = message;
    $("toast").hidden = false;
    toastTimeout = setTimeout(() => {
      $("toast").hidden = true;
    }, 2600);
  }
  function saveDate() {
    const file = new Blob([weddingCalendar()], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = "丁树凯与叶小妹的婚礼-20261122.ics";
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1e4);
    toast("已生成婚礼日历文件");
  }
  async function copyAddress() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("fallback");
      await navigator.clipboard.writeText(WEDDING.address);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = WEDDING.address;
      textarea.style.cssText = "position:fixed;left:-9999px;top:0";
      $("info-dialog").append(textarea);
      textarea.focus();
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      if (!copied) {
        toast("请长按上方地址复制");
        return;
      }
    }
    toast("喜宴地址已复制");
  }
  $("envelope").addEventListener("click", () => openDesk(true));
  $("desk-action").addEventListener("click", () => openDesk(true));
  $("quiet-open").addEventListener("click", () => openDesk(false));
  $("send-heart").addEventListener("click", () => {
    update({ type: "SECRET", id: "heart" });
    hearts();
    announce("收到你的爱心，我们婚礼见。");
  });
  $("scene-prev").addEventListener("click", () => {
    const index = SCENES.findIndex((scene) => scene.id === state.scene);
    if (index > 0) goScene(SCENES[index - 1].id);
  });
  $("scene-next").addEventListener("click", () => {
    const index = SCENES.findIndex((scene) => scene.id === state.scene);
    goScene(SCENES[(index + 1) % SCENES.length].id);
  });
  $("home-action").addEventListener("click", () => {
    if (state.doorProgress >= 0.99) {
      chime("tap");
      goScene("gallery");
    } else openDoor();
  });
  $("replay").addEventListener("click", () => {
    drag = null;
    root.dataset.dragging = "false";
    $("heart-particles").replaceChildren();
    update({ type: "REPLAY" });
    announce("这一幕已收好，可以再玩一次。");
  });
  $("sound").addEventListener("click", () => sound.setEnabled(!sound.isEnabled()));
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || button.disabled) return;
    if (button.matches("#sound,#quiet-open,#envelope,#desk-action,#home-action,#home-light,#album-keep,.door-leaf,#send-heart,#tea-secret,#cat-secret,#child-groom,#child-bride,#album-prev,#album-next,#viewer-prev,#viewer-next,#candy-draw,[data-candy],[data-stamp],[data-photo-index]")) return;
    chime("tap");
  });
  $("info-open").addEventListener("click", (event) => showInfo(event.currentTarget));
  $("info-close").addEventListener("click", hideInfo);
  $("info-dialog").addEventListener("cancel", () => update({ type: "INFO", open: false }));
  $("info-dialog").addEventListener("click", (event) => {
    if (event.target === $("info-dialog")) hideInfo();
  });
  $("save-date").addEventListener("click", saveDate);
  $("copy-address").addEventListener("click", copyAddress);
  $("retry-assets").addEventListener("click", () => window.location.reload());
  for (const id of ["door-left", "door-right"]) {
    const leaf = $(id);
    leaf.addEventListener("pointerdown", startDrag);
    leaf.addEventListener("pointermove", moveDrag);
    leaf.addEventListener("pointerup", finishDrag);
    leaf.addEventListener("pointercancel", finishDrag);
    leaf.addEventListener("click", (event) => {
      if (event.detail === 0 || Date.now() > suppressDoorClickUntil) openDoor();
    });
  }
  sound = createSoundtrack({ element: $("soundtrack"), onChange: (enabled) => update({ type: "SET_SOUND", enabled }), onBlocked: () => tell("点一下右上角的配乐开关，就能有声打开。") });
  chapters = createChapters({ getState: () => state, dispatch: update, navigate: goScene, playEffect: chime, showInfo, announce, tell, hearts });
  experience = createExperience({ getState: () => state, playEffect: chime, tell, hearts });
  state = { ...state, secrets: experience.initialSecrets };
  createKeepsake({ getState: () => state, getPhoto: experience.getFavorite, hasSpecialStamp: experience.hasSpecialStamp });
  render();
  var assets = [...new Set([...document.querySelectorAll(".desk-scene img")].map((img) => img.src).concat(new URL("assets/door-pair.webp", window.location.href).href))];
  $("loading-count").textContent = `0 / ${assets.length}`;
  var loaded = 0;
  Promise.all(assets.map((src) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      loaded++;
      $("loading-count").textContent = `${loaded} / ${assets.length}`;
      resolve();
    };
    image.onerror = () => reject(new Error(src));
    image.src = src;
  }))).then(() => {
    $("stage").setAttribute("aria-busy", "false");
    $("loading-screen").classList.add("loaded");
    setTimeout(() => {
      $("loading-screen").hidden = true;
    }, reducedMotion ? 0 : 450);
  }).catch(() => {
    $("asset-error").hidden = false;
    $("stage").setAttribute("aria-busy", "false");
  });
})();
