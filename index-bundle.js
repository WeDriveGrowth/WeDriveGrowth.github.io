"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };

  // node_modules/bayze-gems-api/dist/esm/strings.js
  var Strings;
  var language = typeof window !== "undefined" ? navigator.language : "";
  var StringMap = class {
  };
  var en_US = class extends StringMap {
    constructor() {
      super(...arguments);
      this.NO_BADGES = "No badges found.";
    }
  };
  var en_GB = class extends en_US {
  };
  var de_DE = class extends StringMap {
    constructor() {
      super(...arguments);
      this.NO_BADGES = "Keine Abzeichen gefunden.";
    }
  };
  function set(language2) {
    switch (language2) {
      default:
      case "en-US":
        Strings = new en_US();
        break;
      case "en-GB":
        Strings = new en_GB();
        break;
      case "de-DE":
        Strings = new de_DE();
        break;
    }
    return Strings;
  }
  Strings = set(language);
  Strings["set"] = set;

  // node_modules/bayze-gems-api/dist/esm/effects-manager.js
  var EffectsManager = class {
    static registerEffect(name, implementation) {
      this.effects[name] = implementation;
    }
    static startEffect(name, target, container) {
      this.effects[name].startEffect(target, container);
    }
    static stopEffect(name) {
      this.effects[name].stopEffect();
    }
  };
  EffectsManager.effects = {};
  if (typeof window !== "undefined") {
    window["EffectsManager"] = EffectsManager;
  }

  // node_modules/bayze-gems-api/dist/esm/effects-confetti.js
  var Particle = class {
    constructor() {
      this.color = "";
      this.x = 0;
      this.y = 0;
      this.diameter = 0;
      this.tilt = 0;
      this.tiltAngleIncrement = 0;
      this.tiltAngle = 0;
    }
  };
  var ConfettiEffect = class {
    static resetParticle(particle, width, height) {
      particle.color = this._colors[Math.random() * this._colors.length | 0];
      particle.x = Math.random() * width;
      particle.y = Math.random() * height - height;
      particle.diameter = Math.random() * 10 + 5;
      particle.tilt = Math.random() * 10 - 10;
      particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
      particle.tiltAngle = 0;
      return particle;
    }
    static _startConfettiInner() {
      let width = window.innerWidth;
      let height = window.innerHeight;
      let canvas = document.createElement("canvas");
      canvas.setAttribute("id", "confetti-canvas");
      canvas.setAttribute("style", "display:block;z-index:999999;pointer-events:none; position:fixed; top:0; left: 0;");
      document.body.appendChild(canvas);
      canvas.width = width;
      canvas.height = height;
      window.addEventListener("resize", function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }, true);
      let context = canvas.getContext("2d");
      while (this.particles.length < this.maxParticleCount)
        this.particles.push(this.resetParticle(new Particle(), width, height));
      this.streamingConfetti = true;
      if (this.animationTimer === null) {
        const runAnimation = () => {
          context.clearRect(0, 0, window.innerWidth, window.innerHeight);
          if (this.particles.length === 0)
            this.animationTimer = null;
          else {
            this.updateParticles();
            this.drawParticles(context);
            this.animationTimer = window.requestAnimationFrame(runAnimation);
          }
        };
        runAnimation();
      }
    }
    static _stopConfettiInner() {
      this.streamingConfetti = false;
    }
    static drawParticles(context) {
      let particle;
      let x;
      for (var i = 0; i < this.particles.length; i++) {
        particle = this.particles[i];
        context.beginPath();
        context.lineWidth = particle.diameter;
        context.strokeStyle = particle.color;
        x = particle.x + particle.tilt;
        context.moveTo(x + particle.diameter / 2, particle.y);
        context.lineTo(x, particle.y + particle.tilt + particle.diameter / 2);
        context.stroke();
      }
    }
    static updateParticles() {
      let width = window.innerWidth;
      let height = window.innerHeight;
      let particle;
      this.waveAngle += 0.01;
      for (var i = 0; i < this.particles.length; i++) {
        particle = this.particles[i];
        if (!this.streamingConfetti && particle.y < -15)
          particle.y = height + 100;
        else {
          particle.tiltAngle += particle.tiltAngleIncrement;
          particle.x += Math.sin(this.waveAngle);
          particle.y += (Math.cos(this.waveAngle) + particle.diameter + this.particleSpeed) * 0.5;
          particle.tilt = Math.sin(particle.tiltAngle) * 15;
        }
        if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
          if (this.streamingConfetti && this.particles.length <= this.maxParticleCount)
            this.resetParticle(particle, width, height);
          else {
            this.particles.splice(i, 1);
            i--;
          }
        }
      }
    }
    startEffect(target, container) {
      ConfettiEffect._startConfettiInner();
    }
    stopEffect() {
      ConfettiEffect._stopConfettiInner();
    }
  };
  ConfettiEffect._colors = ["DodgerBlue", "OliveDrab", "Gold", "Pink", "SlateBlue", "LightBlue", "Violet", "PaleGreen", "SteelBlue", "SandyBrown", "Chocolate", "Crimson"];
  ConfettiEffect.streamingConfetti = false;
  ConfettiEffect.animationTimer = null;
  ConfettiEffect.particles = [];
  ConfettiEffect.waveAngle = 0;
  ConfettiEffect.maxParticleCount = 150;
  ConfettiEffect.particleSpeed = 2;

  // node_modules/bayze-gems-api/dist/esm/gems.js
  var VERSION = "0.1.17";
  var GEMS_state = {};
  var GEMS = class {
    static _debugOut(...args) {
      if (this._debug) {
        console.log(...args);
      }
    }
    static _getTime() {
      const time = new Date();
      const currentDate = time.toISOString().substring(0, 19);
      return currentDate;
    }
    static async _wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    static async _waitForNextEvent(element, name) {
      return new Promise((resolve) => {
        element.addEventListener(name, (e) => resolve(true), { once: true });
      });
    }
    static version() {
      return VERSION;
    }
    static debug(on) {
      this._debug = on;
      console.log("GEMS: debug on: " + this.version());
    }
    static async init(params) {
      console.assert(!!params.appId, "params.appId should not be falsy");
      console.assert(!!params.apiKey, "params.apiKey should not be falsy");
      this.state = __spreadValues({}, params);
      delete this.state.apiKey;
      try {
        if (!params.userId && params.clearCookie) {
          this._setCookie("gems-user-id", "", 365);
        } else if (!params.userId && params.useCookie) {
          params.userId = this._getCookie("gems-user-id");
        }
        let url = this._root + "init/" + params.appId + (params.userId ? "/" + params.userId : "");
        const response = await this._fetch(url, {
          method: params.userId ? "GET" : "POST",
          headers: {
            apikey: params.apiKey
          }
        });
        const result = await response.json();
        this._debugOut("init: result: " + JSON.stringify(result));
        this.state.userId = result.user_id;
        this.state.token = result.token;
        if (params.useCookie) {
          this._setCookie("gems-user-id", this.state.userId, 365);
        }
        return {
          userId: this.state.userId,
          token: this.state.token
        };
      } catch (error) {
        console.error("GEMS API error:");
        console.error(error);
        throw error;
      }
    }
    static setClientCredentials(appId2, userId, token) {
      this.state.appId = appId2;
      this.state.userId = userId;
      this.state.token = token;
    }
    static async event(name, data = {}, options = { displayFirst: true }) {
      var _a;
      let result;
      const body = {
        user_id: this.state.userId,
        tagName: name,
        localTime: this._getTime(),
        data
      };
      if (Object.keys(data).length === 1 && "value" in data) {
        delete body["data"];
        body["value"] = data.value;
      }
      try {
        const response = await this._fetch(this._root + "event", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + this.state.token,
            "Content-Type": "text/plain"
          },
          body: JSON.stringify(body)
        });
        result = await response.json();
        this._debugOut("event: result: " + JSON.stringify(result));
        if (typeof window !== "undefined" && ((_a = result == null ? void 0 : result.achievements) == null ? void 0 : _a.length) > 0) {
          if (options.displayAll) {
            this._debugOut("auto-displaying all achievements");
            for (let a of result.achievements) {
              await this.displayAchievement(a);
            }
          } else if (options.displayFirst) {
            this._debugOut("auto-displaying first achievement");
            if (result.achievements && result.achievements.length > 0) {
              await this.displayAchievement(result.achievements[0]);
            }
          }
        }
        return result.achievements;
      } catch (error) {
        console.error("GEMS API error:");
        console.error(error);
        return null;
      }
    }
    static async displayAchievement(achievement, options = {}) {
      var _a, _b;
      const scrim = document.createElement("div");
      scrim.className = "GEMS-scrim";
      (_a = options.container) != null ? _a : options.container = document.body;
      options.container.appendChild(scrim);
      const frame = document.createElement("div");
      frame.className = "GEMS-achievement-frame";
      const title = document.createElement("h2");
      title.className = "GEMS-achievement-title";
      title.innerText = achievement.title;
      const image = document.createElement("img");
      image.className = "GEMS-achievement-image";
      image.addEventListener("load", (e) => {
        scrim.appendChild(frame);
      });
      image.src = achievement.image;
      const description = document.createElement("h3");
      description.className = "GEMS-achievement-description";
      description.innerText = achievement.description;
      frame.appendChild(title);
      frame.appendChild(image);
      frame.appendChild(description);
      const timerPromise = this._wait(3e3);
      const clickPromise = this._waitForNextEvent(scrim, "click");
      (_b = options.effects) != null ? _b : options.effects = ["confetti"];
      for (const effect of options.effects) {
        this._debugOut("playing effect: " + effect);
        EffectsManager.startEffect(effect, options.centerOn, options.container);
      }
      await Promise.race([timerPromise, clickPromise]);
      for (const effect of options.effects) {
        EffectsManager.stopEffect(effect);
      }
      scrim.remove();
    }
    static async getAllBadges() {
      let result;
      try {
        if (!GEMS_state.token) {
          throw new Error("getAllBadges: Token is missing");
        }
        const response = await this._fetch(this._root + "badges", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${GEMS_state.token}`,
            Accept: "application/json"
          }
        });
        if (!response.ok) {
          throw new Error(`getAllBadges: HTTP error: Status: ${response.status}`);
        }
        result = await response.json();
        result != null ? result : result = [];
        return result;
      } catch (error) {
        console.error("GEMS API error: ");
        console.log(error);
        throw error;
      }
    }
    static async displayBadges(badges, options = {}) {
      const scrim = document.createElement("div");
      scrim.className = options.scrimClassName || "GEMS-badges-scrim";
      const container = document.getElementById(options.containerId || "GEMS-badges-container") || document.body;
      container.appendChild(scrim);
      const frame = document.createElement("div");
      frame.className = options.frameClassName || "GEMS-badges-frame";
      if (badges.length === 0) {
        const message = document.createElement("h2");
        message.innerText = Strings.NO_BADGES;
        frame.appendChild(message);
        scrim.appendChild(frame);
        return;
      }
      badges.forEach((badge) => {
        const imageContainer = document.createElement("div");
        imageContainer.className = "GEMS-badge-imageContainer";
        const image = document.createElement("img");
        image.className = "GEMS-badge-image";
        image.src = badge.image;
        const title = document.createElement("h2");
        title.className = "GEMS-badge-title";
        title.innerText = badge.name;
        const description = document.createElement("h3");
        description.className = "GEMS-badge-description";
        description.innerText = badge.description;
        imageContainer.appendChild(image);
        imageContainer.appendChild(title);
        if (badge.unlockedDate === "") {
          imageContainer.classList.add("GEMS-badge-image--unearned");
        }
        frame.appendChild(imageContainer);
      });
      scrim.appendChild(frame);
    }
    static async displayAllBadges() {
      const result = await this.getAllBadges();
      this.displayBadges(result);
    }
    static async _fetch(url, init) {
      var _a;
      this._debugOut("fetch: " + init.method + ": " + url);
      this._debugOut("    headers: " + JSON.stringify(init.headers));
      this._debugOut("    body   : " + JSON.stringify(init.body));
      let response;
      try {
        if (typeof window !== "undefined") {
          response = fetch(url, init);
        } else {
          const f = (_a = this.state.fetch) != null ? _a : globalThis.fetch;
          if (!f) {
            throw new Error("platform is lacking access to fetch function");
          }
          response = f(url, init);
        }
      } catch (error) {
        console.log("fetch: error response: " + error);
        throw error;
      }
      return response;
    }
    static _setCookie(cname, cvalue, exdays) {
      exdays = cvalue ? exdays : 0;
      const d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1e3);
      let expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
    static _getCookie(cname) {
      let name = cname + "=";
      let ca = document.cookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          let value = c.substring(name.length, c.length);
          if (value === "undefined") {
            value = "";
          }
          return value;
        }
      }
      return "";
    }
  };
  GEMS._root = "https://gemsapi.bayz.ai/user/";
  GEMS.state = {};
  GEMS._debug = false;
  GEMS.EffectsManager = EffectsManager;
  function _createStyle() {
    const style = document.createElement("style");
    const css = `
    .GEMS-scrim {
        display: flex;
        justify-content: center;
        align-items: center;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
    
    .GEMS-achievement-frame {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        border-radius: 5px;
        box-shadow: '4px 8px 36px #F4AAB9';
        background-color: white;
        width:600px;
        height: 400px;
        font-family: Arial, Helvetica, sans-serif;
    }
    
    .GEMS-achievement-title {
        margin: 10px;
    }
    
    .GEMS-achievement-image {
        width: 100;
        height: 100;
        border-radius: 5px;
        box-shadow: '4px 8px 36px #F4AAB9';
    }
    
    .GEMS-achievement-description {
        margin: 10px;
    }

    .GEMS-badges-scrim {
         width: 100%;
         height: fit-content;
         flex-direction: row;
         flex-wrap: wrap;
         justify-content: center;
         align-items: center;
         padding: 20px 10px ;
         background-color: white;
         border-radius: 7px;
         box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
    }

    .GEMS-badges-frame {
        width: fit-content;
        margin-bottom: 5px;
        display: flex;
        flex-wrap: wrap;
        justify-content: start;
        align-items: center;
        flex-direction: row;
        border-radius: 5px;
        font-family: Arial, Helvetica, sans-serif;
    }

    .GEMS-badge-imageContainer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 90px;
        margin-bottom: 5px;
    }

    .GEMS-badge-image {
        width: 50px;
        height: auto;
    }

    .GEMS-badge-image:hover {
        scale: 105%;
    }


    .GEMS-badge-title {
        font-size: .4rem;
        color: rgb(91, 90, 90);
        text-transform: uppercase;
    }

    .GEMS-badge-description {
        font-size: .4rem;
        opacity: 60%;
        max-width: 50%;
        text-align: center;
    }

    .GEMS-badge-image--unearned {
        opacity: 0.5;
        filter: grayscale(80%);
    }

    .GEMS-badge-image--unearned:hover {
        opacity: 0.7;

    }
    `;
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }
  if (typeof window !== "undefined") {
    _createStyle();
    EffectsManager.registerEffect("confetti", new ConfettiEffect());
  }

  // node_modules/bayze-gems-api/dist/esm/index.js
  globalThis["GEMS"] = GEMS;

  // index.ts
  var scoreSpan = document.querySelector("#score");
  var startButton = document.querySelector("#start");
  var playButton = document.querySelector("#play");
  var scoreBox = document.querySelector("#scorebox");
  var finishButton = document.querySelector("#finish");
  startButton.addEventListener("click", start);
  playButton.addEventListener("click", score);
  finishButton.addEventListener("click", finish);
  document.getElementById("version").innerText = GEMS.version();
  GEMS.debug(true);
  var apiKey = "i2slulN)U%7xvMoVACLSEYogOekNQoWE";
  var appId = "37675ac8-c0c0-42e9-8291-0f9529df5d47";
  GEMS.init({ apiKey, appId }).then(() => {
    GEMS.event("Demo-GamePage");
    startButton.disabled = false;
  });
  function start() {
    GEMS.event("Demo-GameStarted");
    scoreSpan.innerText = "0";
    playButton.disabled = false;
    scoreBox.disabled = false;
    startButton.disabled = true;
  }
  function score() {
    let n = Number(scoreSpan.innerText);
    let nNew = Number(scoreBox.value);
    if (isNaN(nNew)) {
      nNew = 0;
    }
    n += nNew;
    scoreSpan.innerText = String(n);
    finishButton.disabled = false;
  }
  function finish() {
    GEMS.event("Demo-GameFinished", { value: Number(scoreSpan.innerText) });
    playButton.disabled = true;
    scoreBox.disabled = true;
    finishButton.disabled = true;
    startButton.disabled = false;
  }
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZV9tb2R1bGVzL2JheXplLWdlbXMtYXBpL2Rpc3QvZXNtL3N0cmluZ3MuanMiLCAibm9kZV9tb2R1bGVzL2JheXplLWdlbXMtYXBpL2Rpc3QvZXNtL2VmZmVjdHMtbWFuYWdlci5qcyIsICJub2RlX21vZHVsZXMvYmF5emUtZ2Vtcy1hcGkvZGlzdC9lc20vZWZmZWN0cy1jb25mZXR0aS5qcyIsICJub2RlX21vZHVsZXMvYmF5emUtZ2Vtcy1hcGkvZGlzdC9lc20vZ2Vtcy5qcyIsICJub2RlX21vZHVsZXMvYmF5emUtZ2Vtcy1hcGkvZGlzdC9lc20vaW5kZXguanMiLCAiaW5kZXgudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vXG4vLyBzdHJpbmcgdGFibGVcbi8vXG4vLyBrZXkgZm9yIGFwaSBpcyBsYW5nK1wiLVwiK2NvdW50cnkgKHNhbWUgYXMgYnJvd2VyJ3MgbmF2aWdhdG9yLmxhbmd1YWdlKVxuLy8gaW50ZXJuYWwga2V5IHN1YnN0aXR1dGVzIFwiX1wiIGZvciBcIi1cIlxuLy9cbi8vIGxhbmcgaXMgSVNPIDYzOS0xICgyIGNoYXIgY29kZSwgbG93ZXIgY2FzZSlcbi8vIGNvdW50cnkgaXMgSVNPIDMxNjYgQUxQSEEtMiAoMiBjaGFyIGNvZGUsIHVwcGVyIGNhc2UpXG4vLyBcbi8vIHZhbHVlIGlzIHN0cmluZyB0byB1c2UgaW4gVUlcbi8vIHVzYWdlOlxuLy8gYWxlcnQoU3RyaW5ncy5OT19CQURHRVMpO1xuLy8gU3RyaW5nTWFwcy5zZXRcbi8vXG4vL1xuLy8gZXhwb3J0ZWQgdmFyaWFibGUgYW5kIGRlZmF1bHQgYmVoYXZpb3Jcbi8vXG5leHBvcnQgbGV0IFN0cmluZ3M7XG4vLyBieSBkZWZhdWx0LCB1c2UgdGhlIGJyb3dzZXIncyBsYW5ndWFnZSBzZXR0aW5nXG5jb25zdCBsYW5ndWFnZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSA/IG5hdmlnYXRvci5sYW5ndWFnZSA6IFwiXCI7XG4vLyBiYXNlIGZ1bmN0aW9uYWxpdHlcbmNsYXNzIFN0cmluZ01hcCB7XG59XG4vL1xuLy8gc3RyaW5nIHRhYmxlc1xuLy9cbmNsYXNzIGVuX1VTIGV4dGVuZHMgU3RyaW5nTWFwIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5OT19CQURHRVMgPSBcIk5vIGJhZGdlcyBmb3VuZC5cIjtcbiAgICB9XG59XG5jbGFzcyBlbl9HQiBleHRlbmRzIGVuX1VTIHtcbn1cbmNsYXNzIGRlX0RFIGV4dGVuZHMgU3RyaW5nTWFwIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5OT19CQURHRVMgPSBcIktlaW5lIEFiemVpY2hlbiBnZWZ1bmRlbi5cIjtcbiAgICB9XG59XG4vL1xuLy8gc2V0IGZ1bmN0aW9uYWxpdHlcbi8vXG5mdW5jdGlvbiBzZXQobGFuZ3VhZ2UpIHtcbiAgICBzd2l0Y2ggKGxhbmd1YWdlKSB7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNhc2UgXCJlbi1VU1wiOlxuICAgICAgICAgICAgU3RyaW5ncyA9IG5ldyBlbl9VUygpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJlbi1HQlwiOlxuICAgICAgICAgICAgU3RyaW5ncyA9IG5ldyBlbl9HQigpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJkZS1ERVwiOlxuICAgICAgICAgICAgU3RyaW5ncyA9IG5ldyBkZV9ERSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBTdHJpbmdzO1xufVxuLy8gaW5zdGFsbCB0aGUgXCJzZXRcIiBmdW5jdGlvbiBpbiB0aGUgU3RyaW5ncyBvYmplY3RcblN0cmluZ3MgPSBzZXQobGFuZ3VhZ2UpO1xuU3RyaW5nc1tcInNldFwiXSA9IHNldDtcbiIsICJleHBvcnQgY2xhc3MgRWZmZWN0c01hbmFnZXIge1xuICAgIHN0YXRpYyByZWdpc3RlckVmZmVjdChuYW1lLCBpbXBsZW1lbnRhdGlvbikge1xuICAgICAgICB0aGlzLmVmZmVjdHNbbmFtZV0gPSBpbXBsZW1lbnRhdGlvbjtcbiAgICB9XG4gICAgc3RhdGljIHN0YXJ0RWZmZWN0KG5hbWUsIHRhcmdldCwgY29udGFpbmVyKSB7XG4gICAgICAgIHRoaXMuZWZmZWN0c1tuYW1lXS5zdGFydEVmZmVjdCh0YXJnZXQsIGNvbnRhaW5lcik7XG4gICAgfVxuICAgIHN0YXRpYyBzdG9wRWZmZWN0KG5hbWUpIHtcbiAgICAgICAgdGhpcy5lZmZlY3RzW25hbWVdLnN0b3BFZmZlY3QoKTtcbiAgICB9XG59XG5FZmZlY3RzTWFuYWdlci5lZmZlY3RzID0ge307XG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIC8vIGluIGJyb3dzZXJcbiAgICB3aW5kb3dbXCJFZmZlY3RzTWFuYWdlclwiXSA9IEVmZmVjdHNNYW5hZ2VyO1xufVxuIiwgIi8vXG4vLyBjb25mZXR0aSBlZmZlY3Rcbi8vIGNyZWRpdHM6XG4vLyBjb25mZXR0aSBieSBtYXRodXN1bW11dCwgTUlUIGxpY2Vuc2U6IGh0dHBzOi8vd3d3LmNzc3NjcmlwdC5jb20vY29uZmV0dGktZmFsbGluZy1hbmltYXRpb24vXG4vL1xuY2xhc3MgUGFydGljbGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNvbG9yID0gXCJcIjtcbiAgICAgICAgdGhpcy54ID0gMDtcbiAgICAgICAgdGhpcy55ID0gMDtcbiAgICAgICAgdGhpcy5kaWFtZXRlciA9IDA7XG4gICAgICAgIHRoaXMudGlsdCA9IDA7XG4gICAgICAgIHRoaXMudGlsdEFuZ2xlSW5jcmVtZW50ID0gMDtcbiAgICAgICAgdGhpcy50aWx0QW5nbGUgPSAwO1xuICAgIH1cbn1cbjtcbmV4cG9ydCBjbGFzcyBDb25mZXR0aUVmZmVjdCB7XG4gICAgc3RhdGljIHJlc2V0UGFydGljbGUocGFydGljbGUsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgcGFydGljbGUuY29sb3IgPSB0aGlzLl9jb2xvcnNbKE1hdGgucmFuZG9tKCkgKiB0aGlzLl9jb2xvcnMubGVuZ3RoKSB8IDBdO1xuICAgICAgICBwYXJ0aWNsZS54ID0gTWF0aC5yYW5kb20oKSAqIHdpZHRoO1xuICAgICAgICBwYXJ0aWNsZS55ID0gTWF0aC5yYW5kb20oKSAqIGhlaWdodCAtIGhlaWdodDtcbiAgICAgICAgcGFydGljbGUuZGlhbWV0ZXIgPSBNYXRoLnJhbmRvbSgpICogMTAgKyA1O1xuICAgICAgICBwYXJ0aWNsZS50aWx0ID0gTWF0aC5yYW5kb20oKSAqIDEwIC0gMTA7XG4gICAgICAgIHBhcnRpY2xlLnRpbHRBbmdsZUluY3JlbWVudCA9IE1hdGgucmFuZG9tKCkgKiAwLjA3ICsgMC4wNTtcbiAgICAgICAgcGFydGljbGUudGlsdEFuZ2xlID0gMDtcbiAgICAgICAgcmV0dXJuIHBhcnRpY2xlO1xuICAgIH1cbiAgICBzdGF0aWMgX3N0YXJ0Q29uZmV0dGlJbm5lcigpIHtcbiAgICAgICAgbGV0IHdpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgIGxldCBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgICBjYW52YXMuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJjb25mZXR0aS1jYW52YXNcIik7XG4gICAgICAgIGNhbnZhcy5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBcImRpc3BsYXk6YmxvY2s7ei1pbmRleDo5OTk5OTk7cG9pbnRlci1ldmVudHM6bm9uZTsgcG9zaXRpb246Zml4ZWQ7IHRvcDowOyBsZWZ0OiAwO1wiKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpO1xuICAgICAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgbGV0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICB3aGlsZSAodGhpcy5wYXJ0aWNsZXMubGVuZ3RoIDwgdGhpcy5tYXhQYXJ0aWNsZUNvdW50KVxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMucHVzaCh0aGlzLnJlc2V0UGFydGljbGUobmV3IFBhcnRpY2xlKCksIHdpZHRoLCBoZWlnaHQpKTtcbiAgICAgICAgdGhpcy5zdHJlYW1pbmdDb25mZXR0aSA9IHRydWU7XG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvblRpbWVyID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBydW5BbmltYXRpb24gPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGFydGljbGVzLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbmltYXRpb25UaW1lciA9IG51bGw7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUGFydGljbGVzKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BhcnRpY2xlcyhjb250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbmltYXRpb25UaW1lciA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocnVuQW5pbWF0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcnVuQW5pbWF0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIF9zdG9wQ29uZmV0dGlJbm5lcigpIHtcbiAgICAgICAgdGhpcy5zdHJlYW1pbmdDb25mZXR0aSA9IGZhbHNlO1xuICAgIH1cbiAgICBzdGF0aWMgZHJhd1BhcnRpY2xlcyhjb250ZXh0KSB7XG4gICAgICAgIGxldCBwYXJ0aWNsZTtcbiAgICAgICAgbGV0IHg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBhcnRpY2xlID0gdGhpcy5wYXJ0aWNsZXNbaV07XG4gICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY29udGV4dC5saW5lV2lkdGggPSBwYXJ0aWNsZS5kaWFtZXRlcjtcbiAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBwYXJ0aWNsZS5jb2xvcjtcbiAgICAgICAgICAgIHggPSBwYXJ0aWNsZS54ICsgcGFydGljbGUudGlsdDtcbiAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHggKyBwYXJ0aWNsZS5kaWFtZXRlciAvIDIsIHBhcnRpY2xlLnkpO1xuICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeCwgcGFydGljbGUueSArIHBhcnRpY2xlLnRpbHQgKyBwYXJ0aWNsZS5kaWFtZXRlciAvIDIpO1xuICAgICAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgdXBkYXRlUGFydGljbGVzKCkge1xuICAgICAgICBsZXQgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgbGV0IGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgbGV0IHBhcnRpY2xlO1xuICAgICAgICB0aGlzLndhdmVBbmdsZSArPSAwLjAxO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwYXJ0aWNsZSA9IHRoaXMucGFydGljbGVzW2ldO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN0cmVhbWluZ0NvbmZldHRpICYmIHBhcnRpY2xlLnkgPCAtMTUpXG4gICAgICAgICAgICAgICAgcGFydGljbGUueSA9IGhlaWdodCArIDEwMDtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnRpbHRBbmdsZSArPSBwYXJ0aWNsZS50aWx0QW5nbGVJbmNyZW1lbnQ7XG4gICAgICAgICAgICAgICAgcGFydGljbGUueCArPSBNYXRoLnNpbih0aGlzLndhdmVBbmdsZSk7XG4gICAgICAgICAgICAgICAgcGFydGljbGUueSArPSAoTWF0aC5jb3ModGhpcy53YXZlQW5nbGUpICsgcGFydGljbGUuZGlhbWV0ZXIgKyB0aGlzLnBhcnRpY2xlU3BlZWQpICogMC41O1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnRpbHQgPSBNYXRoLnNpbihwYXJ0aWNsZS50aWx0QW5nbGUpICogMTU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFydGljbGUueCA+IHdpZHRoICsgMjAgfHwgcGFydGljbGUueCA8IC0yMCB8fCBwYXJ0aWNsZS55ID4gaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RyZWFtaW5nQ29uZmV0dGkgJiYgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoIDw9IHRoaXMubWF4UGFydGljbGVDb3VudClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldFBhcnRpY2xlKHBhcnRpY2xlLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXJ0RWZmZWN0KHRhcmdldCwgY29udGFpbmVyKSB7XG4gICAgICAgIENvbmZldHRpRWZmZWN0Ll9zdGFydENvbmZldHRpSW5uZXIoKTtcbiAgICB9XG4gICAgO1xuICAgIHN0b3BFZmZlY3QoKSB7XG4gICAgICAgIENvbmZldHRpRWZmZWN0Ll9zdG9wQ29uZmV0dGlJbm5lcigpO1xuICAgIH1cbiAgICA7XG59XG5Db25mZXR0aUVmZmVjdC5fY29sb3JzID0gW1wiRG9kZ2VyQmx1ZVwiLCBcIk9saXZlRHJhYlwiLCBcIkdvbGRcIiwgXCJQaW5rXCIsIFwiU2xhdGVCbHVlXCIsIFwiTGlnaHRCbHVlXCIsIFwiVmlvbGV0XCIsIFwiUGFsZUdyZWVuXCIsIFwiU3RlZWxCbHVlXCIsIFwiU2FuZHlCcm93blwiLCBcIkNob2NvbGF0ZVwiLCBcIkNyaW1zb25cIl07XG5Db25mZXR0aUVmZmVjdC5zdHJlYW1pbmdDb25mZXR0aSA9IGZhbHNlO1xuQ29uZmV0dGlFZmZlY3QuYW5pbWF0aW9uVGltZXIgPSBudWxsO1xuQ29uZmV0dGlFZmZlY3QucGFydGljbGVzID0gW107XG5Db25mZXR0aUVmZmVjdC53YXZlQW5nbGUgPSAwO1xuLy8gY29uZmV0dGkgY29uZmlnXG5Db25mZXR0aUVmZmVjdC5tYXhQYXJ0aWNsZUNvdW50ID0gMTUwOyAvL3NldCBtYXggY29uZmV0dGkgY291bnRcbkNvbmZldHRpRWZmZWN0LnBhcnRpY2xlU3BlZWQgPSAyOyAvL3NldCB0aGUgcGFydGljbGUgYW5pbWF0aW9uIHNwZWVkXG4iLCAiLy9cbi8vIHRoZSBvZmZpY2FsIEdFTVMgQVBJIHdyYXBwZXIgLyB0YWdcbi8vIChjKSAyMDIzKyBCYXl6ZSBJbmMuXG4vL1xuY29uc3QgVkVSU0lPTiA9IFwiMC4xLjE3XCI7XG5pbXBvcnQgeyBTdHJpbmdzIH0gZnJvbSBcIi4vc3RyaW5ncy5qc1wiO1xuaW1wb3J0IHsgRWZmZWN0c01hbmFnZXIgfSBmcm9tIFwiLi9lZmZlY3RzLW1hbmFnZXIuanNcIjtcbmltcG9ydCB7IENvbmZldHRpRWZmZWN0IH0gZnJvbSBcIi4vZWZmZWN0cy1jb25mZXR0aS5qc1wiO1xuY29uc3QgR0VNU19zdGF0ZSA9IHt9O1xuZXhwb3J0IGNsYXNzIEdFTVMge1xuICAgIC8vXG4gICAgLy8gaGVscGVyc1xuICAgIC8vXG4gICAgc3RhdGljIF9kZWJ1Z091dCguLi5hcmdzKSB7XG4gICAgICAgIGlmICh0aGlzLl9kZWJ1Zykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIF9nZXRUaW1lKCkge1xuICAgICAgICBjb25zdCB0aW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgY29uc3QgY3VycmVudERhdGUgPSB0aW1lLnRvSVNPU3RyaW5nKCkuc3Vic3RyaW5nKDAsIDE5KTtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnREYXRlO1xuICAgIH1cbiAgICBzdGF0aWMgYXN5bmMgX3dhaXQobXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBfd2FpdEZvck5leHRFdmVudChlbGVtZW50LCBuYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKG5hbWUsIChlKSA9PiByZXNvbHZlKHRydWUpLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdGF0aWMgdmVyc2lvbigpIHtcbiAgICAgICAgcmV0dXJuIFZFUlNJT047XG4gICAgfVxuICAgIHN0YXRpYyBkZWJ1Zyhvbikge1xuICAgICAgICB0aGlzLl9kZWJ1ZyA9IG9uO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkdFTVM6IGRlYnVnIG9uOiBcIiArIHRoaXMudmVyc2lvbigpKTtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIGluaXQocGFyYW1zKSB7XG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0KCEhcGFyYW1zLmFwcElkLCBcInBhcmFtcy5hcHBJZCBzaG91bGQgbm90IGJlIGZhbHN5XCIpO1xuICAgICAgICBjb25zb2xlLmFzc2VydCghIXBhcmFtcy5hcGlLZXksIFwicGFyYW1zLmFwaUtleSBzaG91bGQgbm90IGJlIGZhbHN5XCIpO1xuICAgICAgICB0aGlzLnN0YXRlID0geyAuLi5wYXJhbXMgfTtcbiAgICAgICAgZGVsZXRlIHRoaXMuc3RhdGUuYXBpS2V5O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCFwYXJhbXMudXNlcklkICYmIHBhcmFtcy5jbGVhckNvb2tpZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldENvb2tpZShcImdlbXMtdXNlci1pZFwiLCBcIlwiLCAzNjUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIXBhcmFtcy51c2VySWQgJiYgcGFyYW1zLnVzZUNvb2tpZSkge1xuICAgICAgICAgICAgICAgIHBhcmFtcy51c2VySWQgPSB0aGlzLl9nZXRDb29raWUoXCJnZW1zLXVzZXItaWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgdXJsID0gdGhpcy5fcm9vdCArIFwiaW5pdC9cIiArXG4gICAgICAgICAgICAgICAgcGFyYW1zLmFwcElkICtcbiAgICAgICAgICAgICAgICAocGFyYW1zLnVzZXJJZCA/IFwiL1wiICsgcGFyYW1zLnVzZXJJZCA6IFwiXCIpO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9mZXRjaCh1cmwsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6IHBhcmFtcy51c2VySWQgPyBcIkdFVFwiIDogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBhcGlrZXk6IHBhcmFtcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgdGhpcy5fZGVidWdPdXQoXCJpbml0OiByZXN1bHQ6IFwiICsgSlNPTi5zdHJpbmdpZnkocmVzdWx0KSk7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLnVzZXJJZCA9IHJlc3VsdC51c2VyX2lkO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS50b2tlbiA9IHJlc3VsdC50b2tlbjtcbiAgICAgICAgICAgIGlmIChwYXJhbXMudXNlQ29va2llKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0Q29va2llKFwiZ2Vtcy11c2VyLWlkXCIsIHRoaXMuc3RhdGUudXNlcklkLCAzNjUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1c2VySWQ6IHRoaXMuc3RhdGUudXNlcklkLFxuICAgICAgICAgICAgICAgIHRva2VuOiB0aGlzLnN0YXRlLnRva2VuLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJHRU1TIEFQSSBlcnJvcjpcIik7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBzZXRDbGllbnRDcmVkZW50aWFscyhhcHBJZCwgdXNlcklkLCB0b2tlbikge1xuICAgICAgICB0aGlzLnN0YXRlLmFwcElkID0gYXBwSWQ7XG4gICAgICAgIHRoaXMuc3RhdGUudXNlcklkID0gdXNlcklkO1xuICAgICAgICB0aGlzLnN0YXRlLnRva2VuID0gdG9rZW47XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBldmVudChuYW1lLCBkYXRhID0ge30sIG9wdGlvbnMgPSB7IGRpc3BsYXlGaXJzdDogdHJ1ZSB9KSB7XG4gICAgICAgIGxldCByZXN1bHQ7XG4gICAgICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICAgICAgICB1c2VyX2lkOiB0aGlzLnN0YXRlLnVzZXJJZCxcbiAgICAgICAgICAgIHRhZ05hbWU6IG5hbWUsXG4gICAgICAgICAgICBsb2NhbFRpbWU6IHRoaXMuX2dldFRpbWUoKSxcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIH07XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGggPT09IDEgJiYgKFwidmFsdWVcIiBpbiBkYXRhKSkge1xuICAgICAgICAgICAgZGVsZXRlIGJvZHlbXCJkYXRhXCJdO1xuICAgICAgICAgICAgYm9keVtcInZhbHVlXCJdID0gZGF0YS52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9mZXRjaCh0aGlzLl9yb290ICsgXCJldmVudFwiLCB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBcIkJlYXJlciBcIiArIHRoaXMuc3RhdGUudG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwidGV4dC9wbGFpblwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLy8gc2VuZGluZyBib2R5IGFzIHBsYWluIHRleHQgZHVlIHRvIEFXUyBDT1JTIHBvbGljeVxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXN1bHQgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICB0aGlzLl9kZWJ1Z091dChcImV2ZW50OiByZXN1bHQ6IFwiICsgSlNPTi5zdHJpbmdpZnkocmVzdWx0KSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiByZXN1bHQ/LmFjaGlldmVtZW50cz8ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmRpc3BsYXlBbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGVidWdPdXQoXCJhdXRvLWRpc3BsYXlpbmcgYWxsIGFjaGlldmVtZW50c1wiKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYSBvZiByZXN1bHQuYWNoaWV2ZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmRpc3BsYXlBY2hpZXZlbWVudChhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvcHRpb25zLmRpc3BsYXlGaXJzdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kZWJ1Z091dChcImF1dG8tZGlzcGxheWluZyBmaXJzdCBhY2hpZXZlbWVudFwiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5hY2hpZXZlbWVudHMgJiYgcmVzdWx0LmFjaGlldmVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmRpc3BsYXlBY2hpZXZlbWVudChyZXN1bHQuYWNoaWV2ZW1lbnRzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuYWNoaWV2ZW1lbnRzO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkdFTVMgQVBJIGVycm9yOlwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgO1xuICAgIHN0YXRpYyBhc3luYyBkaXNwbGF5QWNoaWV2ZW1lbnQoYWNoaWV2ZW1lbnQsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICAvLyBzY3JpbVxuICAgICAgICBjb25zdCBzY3JpbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHNjcmltLmNsYXNzTmFtZSA9IFwiR0VNUy1zY3JpbVwiO1xuICAgICAgICBvcHRpb25zLmNvbnRhaW5lciA/PyAob3B0aW9ucy5jb250YWluZXIgPSBkb2N1bWVudC5ib2R5KTtcbiAgICAgICAgb3B0aW9ucy5jb250YWluZXIuYXBwZW5kQ2hpbGQoc2NyaW0pO1xuICAgICAgICAvLyBmcmFtZVxuICAgICAgICBjb25zdCBmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGZyYW1lLmNsYXNzTmFtZSA9IFwiR0VNUy1hY2hpZXZlbWVudC1mcmFtZVwiO1xuICAgICAgICAvLyBjb250ZW50XG4gICAgICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImgyXCIpO1xuICAgICAgICB0aXRsZS5jbGFzc05hbWUgPSBcIkdFTVMtYWNoaWV2ZW1lbnQtdGl0bGVcIjtcbiAgICAgICAgdGl0bGUuaW5uZXJUZXh0ID0gYWNoaWV2ZW1lbnQudGl0bGU7XG4gICAgICAgIGNvbnN0IGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICAgICAgaW1hZ2UuY2xhc3NOYW1lID0gXCJHRU1TLWFjaGlldmVtZW50LWltYWdlXCI7XG4gICAgICAgIGltYWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsICgoZSkgPT4ge1xuICAgICAgICAgICAgc2NyaW0uYXBwZW5kQ2hpbGQoZnJhbWUpO1xuICAgICAgICB9KSk7XG4gICAgICAgIGltYWdlLnNyYyA9IGFjaGlldmVtZW50LmltYWdlO1xuICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoM1wiKTtcbiAgICAgICAgZGVzY3JpcHRpb24uY2xhc3NOYW1lID0gXCJHRU1TLWFjaGlldmVtZW50LWRlc2NyaXB0aW9uXCI7XG4gICAgICAgIGRlc2NyaXB0aW9uLmlubmVyVGV4dCA9IGFjaGlldmVtZW50LmRlc2NyaXB0aW9uO1xuICAgICAgICBmcmFtZS5hcHBlbmRDaGlsZCh0aXRsZSk7XG4gICAgICAgIGZyYW1lLmFwcGVuZENoaWxkKGltYWdlKTtcbiAgICAgICAgZnJhbWUuYXBwZW5kQ2hpbGQoZGVzY3JpcHRpb24pO1xuICAgICAgICBjb25zdCB0aW1lclByb21pc2UgPSB0aGlzLl93YWl0KDMwMDApO1xuICAgICAgICBjb25zdCBjbGlja1Byb21pc2UgPSB0aGlzLl93YWl0Rm9yTmV4dEV2ZW50KHNjcmltLCBcImNsaWNrXCIpO1xuICAgICAgICAvLyBzdGFydCBlZmZlY3RzXG4gICAgICAgIG9wdGlvbnMuZWZmZWN0cyA/PyAob3B0aW9ucy5lZmZlY3RzID0gW1wiY29uZmV0dGlcIl0pO1xuICAgICAgICBmb3IgKGNvbnN0IGVmZmVjdCBvZiBvcHRpb25zLmVmZmVjdHMpIHtcbiAgICAgICAgICAgIHRoaXMuX2RlYnVnT3V0KFwicGxheWluZyBlZmZlY3Q6IFwiICsgZWZmZWN0KTtcbiAgICAgICAgICAgIEVmZmVjdHNNYW5hZ2VyLnN0YXJ0RWZmZWN0KGVmZmVjdCwgb3B0aW9ucy5jZW50ZXJPbiwgb3B0aW9ucy5jb250YWluZXIpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHdhaXRcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5yYWNlKFt0aW1lclByb21pc2UsIGNsaWNrUHJvbWlzZV0pO1xuICAgICAgICAvLyBzdG9wIGVmZmVjdHNcbiAgICAgICAgZm9yIChjb25zdCBlZmZlY3Qgb2Ygb3B0aW9ucy5lZmZlY3RzKSB7XG4gICAgICAgICAgICBFZmZlY3RzTWFuYWdlci5zdG9wRWZmZWN0KGVmZmVjdCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY2xlYW51cFxuICAgICAgICBzY3JpbS5yZW1vdmUoKTtcbiAgICB9XG4gICAgLy9cbiAgICAvLyBfX19fX19fX0JBREdFU19fX19fX1xuICAgIC8vXG4gICAgc3RhdGljIGFzeW5jIGdldEFsbEJhZGdlcygpIHtcbiAgICAgICAgbGV0IHJlc3VsdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICghR0VNU19zdGF0ZS50b2tlbikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImdldEFsbEJhZGdlczogVG9rZW4gaXMgbWlzc2luZ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5fZmV0Y2godGhpcy5fcm9vdCArIFwiYmFkZ2VzXCIsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7R0VNU19zdGF0ZS50b2tlbn1gLFxuICAgICAgICAgICAgICAgICAgICBBY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGdldEFsbEJhZGdlczogSFRUUCBlcnJvcjogU3RhdHVzOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgIHJlc3VsdCA/PyAocmVzdWx0ID0gW10pO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJHRU1TIEFQSSBlcnJvcjogXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG4gICAgO1xuICAgIHN0YXRpYyBhc3luYyBkaXNwbGF5QmFkZ2VzKGJhZGdlcywgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIC8vIHNjcmltXG4gICAgICAgIGNvbnN0IHNjcmltID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgc2NyaW0uY2xhc3NOYW1lID0gb3B0aW9ucy5zY3JpbUNsYXNzTmFtZSB8fCBcIkdFTVMtYmFkZ2VzLXNjcmltXCI7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG9wdGlvbnMuY29udGFpbmVySWQgfHwgXCJHRU1TLWJhZGdlcy1jb250YWluZXJcIikgfHxcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzY3JpbSk7XG4gICAgICAgIC8vIGZyYW1lXG4gICAgICAgIGNvbnN0IGZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgZnJhbWUuY2xhc3NOYW1lID0gb3B0aW9ucy5mcmFtZUNsYXNzTmFtZSB8fCBcIkdFTVMtYmFkZ2VzLWZyYW1lXCI7XG4gICAgICAgIC8vZGlzcGxheSBtZXNzYWdlIGlmIG5vIGJhZGdlcyB3ZXJlIGZldGNoZWRcbiAgICAgICAgaWYgKGJhZGdlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaDJcIik7XG4gICAgICAgICAgICBtZXNzYWdlLmlubmVyVGV4dCA9IFN0cmluZ3MuTk9fQkFER0VTO1xuICAgICAgICAgICAgZnJhbWUuYXBwZW5kQ2hpbGQobWVzc2FnZSk7XG4gICAgICAgICAgICBzY3JpbS5hcHBlbmRDaGlsZChmcmFtZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gY29udGVudFxuICAgICAgICBiYWRnZXMuZm9yRWFjaCgoYmFkZ2UpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgIGltYWdlQ29udGFpbmVyLmNsYXNzTmFtZSA9IFwiR0VNUy1iYWRnZS1pbWFnZUNvbnRhaW5lclwiO1xuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgICAgICAgICAgaW1hZ2UuY2xhc3NOYW1lID0gXCJHRU1TLWJhZGdlLWltYWdlXCI7XG4gICAgICAgICAgICBpbWFnZS5zcmMgPSBiYWRnZS5pbWFnZTtcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImgyXCIpO1xuICAgICAgICAgICAgdGl0bGUuY2xhc3NOYW1lID0gXCJHRU1TLWJhZGdlLXRpdGxlXCI7XG4gICAgICAgICAgICB0aXRsZS5pbm5lclRleHQgPSBiYWRnZS5uYW1lO1xuICAgICAgICAgICAgLy9iYWRnZSB1bmxvY2tlZCB5ZXQgLT4gZ3JleWVkLW91dFxuICAgICAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaDNcIik7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbi5jbGFzc05hbWUgPSBcIkdFTVMtYmFkZ2UtZGVzY3JpcHRpb25cIjtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLmlubmVyVGV4dCA9IGJhZGdlLmRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgaW1hZ2VDb250YWluZXIuYXBwZW5kQ2hpbGQoaW1hZ2UpO1xuICAgICAgICAgICAgaW1hZ2VDb250YWluZXIuYXBwZW5kQ2hpbGQodGl0bGUpO1xuICAgICAgICAgICAgaWYgKGJhZGdlLnVubG9ja2VkRGF0ZSA9PT0gXCJcIikge1xuICAgICAgICAgICAgICAgIGltYWdlQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXCJHRU1TLWJhZGdlLWltYWdlLS11bmVhcm5lZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGltYWdlQ29udGFpbmVyLmFwcGVuZENoaWxkKGRlc2NyaXB0aW9uKTtcbiAgICAgICAgICAgIGZyYW1lLmFwcGVuZENoaWxkKGltYWdlQ29udGFpbmVyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNjcmltLmFwcGVuZENoaWxkKGZyYW1lKTtcbiAgICB9XG4gICAgO1xuICAgIHN0YXRpYyBhc3luYyBkaXNwbGF5QWxsQmFkZ2VzKCkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmdldEFsbEJhZGdlcygpO1xuICAgICAgICB0aGlzLmRpc3BsYXlCYWRnZXMocmVzdWx0KTtcbiAgICB9XG4gICAgO1xuICAgIC8vIGN1c3RvbSBmZXRjaCB0byBhY2NvdW50IGZvciBwb3NzaWJsZSBub2RlIDwxOFxuICAgIHN0YXRpYyBhc3luYyBfZmV0Y2godXJsLCBpbml0KSB7XG4gICAgICAgIHRoaXMuX2RlYnVnT3V0KFwiZmV0Y2g6IFwiICsgaW5pdC5tZXRob2QgKyBcIjogXCIgKyB1cmwpO1xuICAgICAgICB0aGlzLl9kZWJ1Z091dChcIiAgICBoZWFkZXJzOiBcIiArIEpTT04uc3RyaW5naWZ5KGluaXQuaGVhZGVycykpO1xuICAgICAgICB0aGlzLl9kZWJ1Z091dChcIiAgICBib2R5ICAgOiBcIiArIEpTT04uc3RyaW5naWZ5KGluaXQuYm9keSkpO1xuICAgICAgICBsZXQgcmVzcG9uc2U7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gZmV0Y2godXJsLCBpbml0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGYgPSB0aGlzLnN0YXRlLmZldGNoID8/IGdsb2JhbFRoaXMuZmV0Y2g7XG4gICAgICAgICAgICAgICAgaWYgKCFmKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInBsYXRmb3JtIGlzIGxhY2tpbmcgYWNjZXNzIHRvIGZldGNoIGZ1bmN0aW9uXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IGYodXJsLCBpbml0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmV0Y2g6IGVycm9yIHJlc3BvbnNlOiBcIiArIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9XG4gICAgLy8gY29va2llc1xuICAgIHN0YXRpYyBfc2V0Q29va2llKGNuYW1lLCBjdmFsdWUsIGV4ZGF5cykge1xuICAgICAgICBleGRheXMgPSBjdmFsdWUgPyBleGRheXMgOiAwO1xuICAgICAgICBjb25zdCBkID0gbmV3IERhdGUoKTtcbiAgICAgICAgZC5zZXRUaW1lKGQuZ2V0VGltZSgpICsgKGV4ZGF5cyAqIDI0ICogNjAgKiA2MCAqIDEwMDApKTtcbiAgICAgICAgbGV0IGV4cGlyZXMgPSBcImV4cGlyZXM9XCIgKyBkLnRvVVRDU3RyaW5nKCk7XG4gICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNuYW1lICsgXCI9XCIgKyBjdmFsdWUgKyBcIjtcIiArIGV4cGlyZXMgKyBcIjtwYXRoPS9cIjtcbiAgICB9XG4gICAgc3RhdGljIF9nZXRDb29raWUoY25hbWUpIHtcbiAgICAgICAgbGV0IG5hbWUgPSBjbmFtZSArIFwiPVwiO1xuICAgICAgICBsZXQgY2EgPSBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsnKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjYS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGMgPSBjYVtpXTtcbiAgICAgICAgICAgIHdoaWxlIChjLmNoYXJBdCgwKSA9PSAnICcpIHtcbiAgICAgICAgICAgICAgICBjID0gYy5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYy5pbmRleE9mKG5hbWUpID09IDApIHtcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSBjLnN1YnN0cmluZyhuYW1lLmxlbmd0aCwgYy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG59XG5HRU1TLl9yb290ID0gXCJodHRwczovL2dlbXNhcGkuYmF5ei5haS91c2VyL1wiO1xuR0VNUy5zdGF0ZSA9IHt9O1xuR0VNUy5fZGVidWcgPSBmYWxzZTtcbi8vXG4vLyBleHBvc2VkIEFQSVxuLy9cbkdFTVMuRWZmZWN0c01hbmFnZXIgPSBFZmZlY3RzTWFuYWdlcjtcbmZ1bmN0aW9uIF9jcmVhdGVTdHlsZSgpIHtcbiAgICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgICBjb25zdCBjc3MgPSBgXG4gICAgLkdFTVMtc2NyaW0ge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICB0b3A6IDA7XG4gICAgICAgIGxlZnQ6IDA7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgfVxuICAgIFxuICAgIC5HRU1TLWFjaGlldmVtZW50LWZyYW1lIHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDVweDtcbiAgICAgICAgYm94LXNoYWRvdzogJzRweCA4cHggMzZweCAjRjRBQUI5JztcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gICAgICAgIHdpZHRoOjYwMHB4O1xuICAgICAgICBoZWlnaHQ6IDQwMHB4O1xuICAgICAgICBmb250LWZhbWlseTogQXJpYWwsIEhlbHZldGljYSwgc2Fucy1zZXJpZjtcbiAgICB9XG4gICAgXG4gICAgLkdFTVMtYWNoaWV2ZW1lbnQtdGl0bGUge1xuICAgICAgICBtYXJnaW46IDEwcHg7XG4gICAgfVxuICAgIFxuICAgIC5HRU1TLWFjaGlldmVtZW50LWltYWdlIHtcbiAgICAgICAgd2lkdGg6IDEwMDtcbiAgICAgICAgaGVpZ2h0OiAxMDA7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDVweDtcbiAgICAgICAgYm94LXNoYWRvdzogJzRweCA4cHggMzZweCAjRjRBQUI5JztcbiAgICB9XG4gICAgXG4gICAgLkdFTVMtYWNoaWV2ZW1lbnQtZGVzY3JpcHRpb24ge1xuICAgICAgICBtYXJnaW46IDEwcHg7XG4gICAgfVxuXG4gICAgLkdFTVMtYmFkZ2VzLXNjcmltIHtcbiAgICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICAgaGVpZ2h0OiBmaXQtY29udGVudDtcbiAgICAgICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XG4gICAgICAgICBmbGV4LXdyYXA6IHdyYXA7XG4gICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgICBwYWRkaW5nOiAyMHB4IDEwcHggO1xuICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gICAgICAgICBib3JkZXItcmFkaXVzOiA3cHg7XG4gICAgICAgICBib3gtc2hhZG93OiByZ2JhKDUwLCA1MCwgOTMsIDAuMjUpIDBweCA1MHB4IDEwMHB4IC0yMHB4LCByZ2JhKDAsIDAsIDAsIDAuMykgMHB4IDMwcHggNjBweCAtMzBweDtcbiAgICB9XG5cbiAgICAuR0VNUy1iYWRnZXMtZnJhbWUge1xuICAgICAgICB3aWR0aDogZml0LWNvbnRlbnQ7XG4gICAgICAgIG1hcmdpbi1ib3R0b206IDVweDtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC13cmFwOiB3cmFwO1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHN0YXJ0O1xuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xuICAgICAgICBib3JkZXItcmFkaXVzOiA1cHg7XG4gICAgICAgIGZvbnQtZmFtaWx5OiBBcmlhbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmO1xuICAgIH1cblxuICAgIC5HRU1TLWJhZGdlLWltYWdlQ29udGFpbmVyIHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgIHdpZHRoOiA5MHB4O1xuICAgICAgICBtYXJnaW4tYm90dG9tOiA1cHg7XG4gICAgfVxuXG4gICAgLkdFTVMtYmFkZ2UtaW1hZ2Uge1xuICAgICAgICB3aWR0aDogNTBweDtcbiAgICAgICAgaGVpZ2h0OiBhdXRvO1xuICAgIH1cblxuICAgIC5HRU1TLWJhZGdlLWltYWdlOmhvdmVyIHtcbiAgICAgICAgc2NhbGU6IDEwNSU7XG4gICAgfVxuXG5cbiAgICAuR0VNUy1iYWRnZS10aXRsZSB7XG4gICAgICAgIGZvbnQtc2l6ZTogLjRyZW07XG4gICAgICAgIGNvbG9yOiByZ2IoOTEsIDkwLCA5MCk7XG4gICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gICAgfVxuXG4gICAgLkdFTVMtYmFkZ2UtZGVzY3JpcHRpb24ge1xuICAgICAgICBmb250LXNpemU6IC40cmVtO1xuICAgICAgICBvcGFjaXR5OiA2MCU7XG4gICAgICAgIG1heC13aWR0aDogNTAlO1xuICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgfVxuXG4gICAgLkdFTVMtYmFkZ2UtaW1hZ2UtLXVuZWFybmVkIHtcbiAgICAgICAgb3BhY2l0eTogMC41O1xuICAgICAgICBmaWx0ZXI6IGdyYXlzY2FsZSg4MCUpO1xuICAgIH1cblxuICAgIC5HRU1TLWJhZGdlLWltYWdlLS11bmVhcm5lZDpob3ZlciB7XG4gICAgICAgIG9wYWNpdHk6IDAuNztcblxuICAgIH1cbiAgICBgO1xuICAgIHN0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAvLyBpbiBicm93c2VyXG4gICAgLy8gcmVnaXN0ZXIgc3R5bGVzXG4gICAgX2NyZWF0ZVN0eWxlKCk7XG4gICAgLy8gcmVnaXN0ZXIgZWZmZWN0c1xuICAgIEVmZmVjdHNNYW5hZ2VyLnJlZ2lzdGVyRWZmZWN0KFwiY29uZmV0dGlcIiwgbmV3IENvbmZldHRpRWZmZWN0KTtcbn1cbiIsICJpbXBvcnQgeyBHRU1TIH0gZnJvbSAnLi9nZW1zLmpzJztcbmdsb2JhbFRoaXNbXCJHRU1TXCJdID0gR0VNUztcbi8vbW9kdWxlLmV4cG9ydHMgPSB7IEdFTVM6IEdFTVMgfTtcbmV4cG9ydCB7IEdFTVMgfTtcbiIsICJpbXBvcnQge0dFTVN9IGZyb20gXCJiYXl6ZS1nZW1zLWFwaVwiO1xuXG4vLyBnYW1lIGVsZW1lbnRzICAgXG5jb25zdCBzY29yZVNwYW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Njb3JlXCIpISBhcyBIVE1MU3BhbkVsZW1lbnQ7XG5jb25zdCBzdGFydEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRcIikhIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuY29uc3QgcGxheUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheVwiKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5jb25zdCBzY29yZUJveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2NvcmVib3hcIikhIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuY29uc3QgZmluaXNoQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNmaW5pc2hcIikhIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuXG5zdGFydEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgc3RhcnQpO1xucGxheUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgc2NvcmUpO1xuZmluaXNoQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmaW5pc2gpO1xuXG4vLyB2ZXJzaW9uXG4oZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ2ZXJzaW9uXCIpIGFzIEhUTUxTcGFuRWxlbWVudCkuaW5uZXJUZXh0ID0gR0VNUy52ZXJzaW9uKCk7XG5HRU1TLmRlYnVnKHRydWUpO1xuLy8gaW5pdCBhbmQgZmlyc3QgZXZlbnRcbmNvbnN0IGFwaUtleSA9IFwiaTJzbHVsTilVJTd4dk1vVkFDTFNFWW9nT2VrTlFvV0VcIjtcbmNvbnN0IGFwcElkID0gXCIzNzY3NWFjOC1jMGMwLTQyZTktODI5MS0wZjk1MjlkZjVkNDdcIjtcbkdFTVMuaW5pdCh7YXBpS2V5OmFwaUtleSwgYXBwSWQ6YXBwSWR9KS50aGVuKCgpPT57XG4gICAgR0VNUy5ldmVudChcIkRlbW8tR2FtZVBhZ2VcIik7XG4gICAgc3RhcnRCdXR0b24hLmRpc2FibGVkID0gZmFsc2U7XG59KTtcblxuZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgR0VNUy5ldmVudChcIkRlbW8tR2FtZVN0YXJ0ZWRcIik7XG4gICAgc2NvcmVTcGFuLmlubmVyVGV4dCA9IFwiMFwiO1xuICAgIHBsYXlCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBzY29yZUJveC5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIHN0YXJ0QnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gc2NvcmUoKSB7XG4gICAgbGV0IG4gPSBOdW1iZXIoc2NvcmVTcGFuLmlubmVyVGV4dCk7XG4gICAgbGV0IG5OZXcgPSBOdW1iZXIoc2NvcmVCb3gudmFsdWUpO1xuICAgIGlmIChpc05hTihuTmV3KSl7XG4gICAgICAgIG5OZXcgPSAwO1xuICAgIH1cbiAgICBuICs9IG5OZXc7XG4gICAgc2NvcmVTcGFuLmlubmVyVGV4dCA9IFN0cmluZyhuKTtcbiAgICBmaW5pc2hCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gZmluaXNoKCkge1xuICAgIEdFTVMuZXZlbnQoXCJEZW1vLUdhbWVGaW5pc2hlZFwiLCB7dmFsdWU6TnVtYmVyKHNjb3JlU3Bhbi5pbm5lclRleHQpfSk7XG4gICAgcGxheUJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgc2NvcmVCb3guZGlzYWJsZWQgPSB0cnVlO1xuICAgIGZpbmlzaEJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgc3RhcnRCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJPLE1BQUk7QUFFWCxNQUFNLFdBQVksT0FBTyxXQUFXLGNBQWUsVUFBVSxXQUFXO0FBRXhFLE1BQU0sWUFBTixNQUFnQjtBQUFBLEVBQ2hCO0FBSUEsTUFBTSxRQUFOLGNB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QTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQTJHWixVQUFNLFlBQVksU0FBUyxlQUFlLEdBQUcsQ0FBQztBQUM5QyxhQUFTLEtBQUssWUFBWSxLQUFLO0FBQUEsRUFDbkM7QUFDQSxNQUFJLE9BQU8sV0FBVyxhQUFhO0FBRy9CLGlCQUFhO0FBRWIsbUJBQWUsZUFBZSxZQUFZLElBQUksZ0JBQWM7QUFBQSxFQUNoRTs7O0FDeGFBLGFBQVcsVUFBVTs7O0FDRXJCLE1BQU0sWUFBWSxTQUFTLGNBQWMsUUFBUTtBQUNqRCxNQUFNLGNBQWMsU0FBUyxjQUFjLFFBQVE7QUFDbkQsTUFBTSxhQUFhLFNBQVMsY0FBYyxPQUFPO0FBQ2pELE1BQU0sV0FBVyxTQUFTLGNBQWMsV0FBVztBQUNuRCxNQUFNLGVBQWUsU0FBUyxjQUFjLFNBQVM7QUFFckQsY0FBWSxpQkFBaUIsU0FBUyxLQUFLO0FBQzNDLGFBQVcsaUJBQWlCLFNBQVMsS0FBSztBQUMxQyxlQUFhLGlCQUFpQixTQUFTLE1BQU07QUFHN0MsRUFBQyxTQUFTLGVBQWUsU0FBUyxFQUFzQixZQUFZLEtBQUssUUFBUTtBQUNqRixPQUFLLE1BQU0sSUFBSTtBQUVmLE1BQU0sU0FBUztBQUNmLE1BQU0sUUFBUTtBQUNkLE9BQUssS0FBSyxFQUFDLFFBQWUsTUFBVyxDQUFDLEVBQUUsS0FBSyxNQUFJO0FBQzdDLFNBQUssTUFBTSxlQUFlO0FBQzFCLGdCQUFhLFdBQVc7QUFBQSxFQUM1QixDQUFDO0FBRUQsV0FBUyxRQUFRO0FBQ2IsU0FBSyxNQUFNLGtCQUFrQjtBQUM3QixjQUFVLFlBQVk7QUFDdEIsZUFBVyxXQUFXO0FBQ3RCLGFBQVMsV0FBVztBQUNwQixnQkFBWSxXQUFXO0FBQUEsRUFDM0I7QUFFQSxXQUFTLFFBQVE7QUFDYixRQUFJLElBQUksT0FBTyxVQUFVLFNBQVM7QUFDbEMsUUFBSSxPQUFPLE9BQU8sU0FBUyxLQUFLO0FBQ2hDLFFBQUksTUFBTSxJQUFJLEdBQUU7QUFDWixhQUFPO0FBQUEsSUFDWDtBQUNBLFNBQUs7QUFDTCxjQUFVLFlBQVksT0FBTyxDQUFDO0FBQzlCLGlCQUFhLFdBQVc7QUFBQSxFQUM1QjtBQUVBLFdBQVMsU0FBUztBQUNkLFNBQUssTUFBTSxxQkFBcUIsRUFBQyxPQUFNLE9BQU8sVUFBVSxTQUFTLEVBQUMsQ0FBQztBQUNuRSxlQUFXLFdBQVc7QUFDdEIsYUFBUyxXQUFXO0FBQ3BCLGlCQUFhLFdBQVc7QUFDeEIsZ0JBQVksV0FBVztBQUFBLEVBQzNCOyIsCiAgIm5hbWVzIjogWyJsYW5ndWFnZSIsICJhcHBJZCJdCn0K
