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
})();
