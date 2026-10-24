(() => {
  // interactive-invitation/dist/share-config.mjs
  var SHARE_CONFIG = Object.freeze({
    title: "丁树凯 & 叶小妹｜我们要结婚啦",
    description: "2026.11.22，邀请你来分享成家的欢喜。轻点，拆开我们的互动喜帖。",
    timelineTitle: "丁树凯 & 叶小妹要结婚啦｜2026.11.22，婚礼见",
    image: "assets/share-cover-square.jpg",
    // Enable only after a permitted official account and JS-safe domain are connected.
    signatureEndpoint: null
  });

  // interactive-invitation/dist/wechat-share.mjs
  function signingURL(input) {
    const url = new URL(input);
    url.hash = "";
    return url.href;
  }
  function buildShareData(pageURL, config = SHARE_CONFIG) {
    const root = new URL("./", pageURL);
    return { title: config.title, desc: config.description, link: root.href, imgUrl: new URL(config.image, root).href };
  }
  var sdkPromise;
  function loadWeChatSDK() {
    if (window.wx) return Promise.resolve(window.wx);
    if (!sdkPromise) sdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://res.wx.qq.com/open/js/jweixin-1.6.0.js";
      script.async = true;
      script.onload = () => window.wx ? resolve(window.wx) : reject(Error("sdk unavailable"));
      script.onerror = () => reject(Error("sdk unavailable"));
      document.head.append(script);
    });
    return sdkPromise;
  }
  async function configureWeChatShare({
    pageURL,
    isWeChat,
    config = SHARE_CONFIG,
    fetcher = globalThis.fetch,
    loadSDK = loadWeChatSDK,
    timeoutMs = 8e3
  } = {}) {
    if (!config.signatureEndpoint) return { state: "unconfigured" };
    if (!isWeChat) return { state: "outside-wechat" };
    const controller = new AbortController();
    let timer;
    try {
      const timedOut = new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(Error("setup timeout"));
        }, timeoutMs);
      });
      const setup = async () => {
        const endpoint = new URL(config.signatureEndpoint, pageURL);
        if (endpoint.protocol !== "https:") throw Error("https endpoint required");
        const response = await fetcher(endpoint.href, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: signingURL(pageURL) }),
          signal: controller.signal,
          credentials: "omit"
        });
        if (!response.ok) throw Error("signature unavailable");
        const data = await response.json();
        if (typeof data.appId !== "string" || !data.appId || !Number.isSafeInteger(data.timestamp) || data.timestamp <= 0 || typeof data.nonceStr !== "string" || !data.nonceStr || !/^[a-f0-9]{40}$/i.test(data.signature)) throw Error("invalid signature");
        const sdk = await loadSDK();
        if (controller.signal.aborted) throw Error("setup cancelled");
        return await new Promise((resolve, reject) => {
          sdk.error(() => reject(Error("sdk configuration failed")));
          sdk.ready(() => {
            if (controller.signal.aborted) return;
            try {
              let completed = 0;
              const success = () => {
                if (++completed === 2) resolve({ state: "configured" });
              };
              const fail = () => reject(Error("metadata unavailable"));
              const share = buildShareData(pageURL, config);
              sdk.updateAppMessageShareData({ ...share, success, fail });
              sdk.updateTimelineShareData({ title: config.timelineTitle, link: share.link, imgUrl: share.imgUrl, success, fail });
            } catch (error) {
              reject(error);
            }
          });
          sdk.config({
            debug: false,
            appId: data.appId,
            timestamp: data.timestamp,
            nonceStr: data.nonceStr,
            signature: data.signature,
            jsApiList: ["updateAppMessageShareData", "updateTimelineShareData"]
          });
        });
      };
      return await Promise.race([setup(), timedOut]);
    } catch {
      return { state: "unavailable" };
    } finally {
      clearTimeout(timer);
      controller.abort();
    }
  }
  if (typeof document !== "undefined") {
    const entryURL = window.location.href;
    configureWeChatShare({ pageURL: entryURL, isWeChat: /MicroMessenger/i.test(navigator.userAgent) }).then((result) => {
      document.documentElement.dataset.wechatShare = result.state;
      document.dispatchEvent(new CustomEvent("wechat-share-state", { detail: result }));
    });
  }

  // interactive-invitation/dist/share-page.mjs
  var invitationText = "我们，把日子过成了一个家。\n2026年11月22日，想请你来喝杯喜酒。\n轻点小卡片，拆开我们的喜讯 ♡\n—— 丁树凯 & 叶小妹";
  var texts = { title: SHARE_CONFIG.title, description: SHARE_CONFIG.description, invitation: invitationText };
  var tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectTab(tab) {
    for (const item of tabs) {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute("aria-controls")).hidden = !selected;
    }
  }
  for (const tab of tabs) {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (event) => {
      const index = tabs.indexOf(tab);
      let next;
      if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
      if (event.key === "ArrowLeft") next = tabs[(index + tabs.length - 1) % tabs.length];
      if (event.key === "Home") next = tabs[0];
      if (event.key === "End") next = tabs.at(-1);
      if (next) {
        event.preventDefault();
        selectTab(next);
        next.focus();
      }
    });
  }
  var toastTimer;
  function toast(text) {
    const element = document.getElementById("copy-status");
    element.textContent = text;
    element.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.hidden = true, 3200);
  }
  for (const button of document.querySelectorAll("[data-copy]")) {
    button.addEventListener("click", async () => {
      const text = texts[button.dataset.copy];
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
        else {
          const area = document.createElement("textarea");
          area.value = text;
          area.style.cssText = "position:fixed;left:-9999px";
          document.body.append(area);
          area.select();
          const copied = document.execCommand("copy");
          area.remove();
          button.focus();
          if (!copied) throw Error("copy unavailable");
        }
        toast("已复制，可以粘贴到卡片设置或微信里。");
      } catch {
        toast("请长按上方文字选择复制。");
      }
    });
  }
  function updateStatus(state) {
    const text = {
      configured: "微信封面已配置 · 请用右上角菜单试发验证",
      unavailable: "微信分享暂未接通 · 请柬仍可正常打开",
      unconfigured: "封面与文案已备好 · 微信卡片待接通",
      "outside-wechat": "请在微信中打开，检查卡片分享效果"
    }[state];
    if (text) document.getElementById("share-status").textContent = text;
  }
  document.addEventListener("wechat-share-state", (event) => updateStatus(event.detail.state));
  updateStatus(document.documentElement.dataset.wechatShare);
  for (const link of document.querySelectorAll('a[href="./"]')) link.href = buildShareData(location.href).link;
})();
