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
  var VERSION = "0.1.12";
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
        if (!params.userId && params.useCookie) {
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
        if (typeof window !== "undefined" && result.achievements.length > 0) {
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
          return c.substring(name.length, c.length);
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
  if (typeof window !== "undefined") {
    window["GEMS"] = GEMS;
  }

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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZV9tb2R1bGVzL2JheXplLWdlbXMtYXBpL2Rpc3QvZXNtL3N0cmluZ3MuanMiLCAibm9kZV9tb2R1bGVzL2JheXplLWdlbXMtYXBpL2Rpc3QvZXNtL2VmZmVjdHMtbWFuYWdlci5qcyIsICJub2RlX21vZHVsZXMvYmF5emUtZ2Vtcy1hcGkvZGlzdC9lc20vZWZmZWN0cy1jb25mZXR0aS5qcyIsICJub2RlX21vZHVsZXMvYmF5emUtZ2Vtcy1hcGkvZGlzdC9lc20vZ2Vtcy5qcyIsICJub2RlX21vZHVsZXMvYmF5emUtZ2Vtcy1hcGkvZGlzdC9lc20vaW5kZXguanMiLCAiaW5kZXgudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vXG4vLyBzdHJpbmcgdGFibGVcbi8vXG4vLyBrZXkgZm9yIGFwaSBpcyBsYW5nK1wiLVwiK2NvdW50cnkgKHNhbWUgYXMgYnJvd2VyJ3MgbmF2aWdhdG9yLmxhbmd1YWdlKVxuLy8gaW50ZXJuYWwga2V5IHN1YnN0aXR1dGVzIFwiX1wiIGZvciBcIi1cIlxuLy9cbi8vIGxhbmcgaXMgSVNPIDYzOS0xICgyIGNoYXIgY29kZSwgbG93ZXIgY2FzZSlcbi8vIGNvdW50cnkgaXMgSVNPIDMxNjYgQUxQSEEtMiAoMiBjaGFyIGNvZGUsIHVwcGVyIGNhc2UpXG4vLyBcbi8vIHZhbHVlIGlzIHN0cmluZyB0byB1c2UgaW4gVUlcbi8vIHVzYWdlOlxuLy8gYWxlcnQoU3RyaW5ncy5OT19CQURHRVMpO1xuLy8gU3RyaW5nTWFwcy5zZXRcbi8vXG4vL1xuLy8gZXhwb3J0ZWQgdmFyaWFibGUgYW5kIGRlZmF1bHQgYmVoYXZpb3Jcbi8vXG5leHBvcnQgbGV0IFN0cmluZ3M7XG4vLyBieSBkZWZhdWx0LCB1c2UgdGhlIGJyb3dzZXIncyBsYW5ndWFnZSBzZXR0aW5nXG5jb25zdCBsYW5ndWFnZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSA/IG5hdmlnYXRvci5sYW5ndWFnZSA6IFwiXCI7XG4vLyBiYXNlIGZ1bmN0aW9uYWxpdHlcbmNsYXNzIFN0cmluZ01hcCB7XG59XG4vL1xuLy8gc3RyaW5nIHRhYmxlc1xuLy9cbmNsYXNzIGVuX1VTIGV4dGVuZHMgU3RyaW5nTWFwIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5OT19CQURHRVMgPSBcIk5vIGJhZGdlcyBmb3VuZC5cIjtcbiAgICB9XG59XG5jbGFzcyBlbl9HQiBleHRlbmRzIGVuX1VTIHtcbn1cbmNsYXNzIGRlX0RFIGV4dGVuZHMgU3RyaW5nTWFwIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5OT19CQURHRVMgPSBcIktlaW5lIEFiemVpY2hlbiBnZWZ1bmRlbi5cIjtcbiAgICB9XG59XG4vL1xuLy8gc2V0IGZ1bmN0aW9uYWxpdHlcbi8vXG5mdW5jdGlvbiBzZXQobGFuZ3VhZ2UpIHtcbiAgICBzd2l0Y2ggKGxhbmd1YWdlKSB7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNhc2UgXCJlbi1VU1wiOlxuICAgICAgICAgICAgU3RyaW5ncyA9IG5ldyBlbl9VUygpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJlbi1HQlwiOlxuICAgICAgICAgICAgU3RyaW5ncyA9IG5ldyBlbl9HQigpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJkZS1ERVwiOlxuICAgICAgICAgICAgU3RyaW5ncyA9IG5ldyBkZV9ERSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBTdHJpbmdzO1xufVxuLy8gaW5zdGFsbCB0aGUgXCJzZXRcIiBmdW5jdGlvbiBpbiB0aGUgU3RyaW5ncyBvYmplY3RcblN0cmluZ3MgPSBzZXQobGFuZ3VhZ2UpO1xuU3RyaW5nc1tcInNldFwiXSA9IHNldDtcbiIsICJleHBvcnQgY2xhc3MgRWZmZWN0c01hbmFnZXIge1xuICAgIHN0YXRpYyByZWdpc3RlckVmZmVjdChuYW1lLCBpbXBsZW1lbnRhdGlvbikge1xuICAgICAgICB0aGlzLmVmZmVjdHNbbmFtZV0gPSBpbXBsZW1lbnRhdGlvbjtcbiAgICB9XG4gICAgc3RhdGljIHN0YXJ0RWZmZWN0KG5hbWUsIHRhcmdldCwgY29udGFpbmVyKSB7XG4gICAgICAgIHRoaXMuZWZmZWN0c1tuYW1lXS5zdGFydEVmZmVjdCh0YXJnZXQsIGNvbnRhaW5lcik7XG4gICAgfVxuICAgIHN0YXRpYyBzdG9wRWZmZWN0KG5hbWUpIHtcbiAgICAgICAgdGhpcy5lZmZlY3RzW25hbWVdLnN0b3BFZmZlY3QoKTtcbiAgICB9XG59XG5FZmZlY3RzTWFuYWdlci5lZmZlY3RzID0ge307XG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIC8vIGluIGJyb3dzZXJcbiAgICB3aW5kb3dbXCJFZmZlY3RzTWFuYWdlclwiXSA9IEVmZmVjdHNNYW5hZ2VyO1xufVxuIiwgIi8vXG4vLyBjb25mZXR0aSBlZmZlY3Rcbi8vIGNyZWRpdHM6XG4vLyBjb25mZXR0aSBieSBtYXRodXN1bW11dCwgTUlUIGxpY2Vuc2U6IGh0dHBzOi8vd3d3LmNzc3NjcmlwdC5jb20vY29uZmV0dGktZmFsbGluZy1hbmltYXRpb24vXG4vL1xuY2xhc3MgUGFydGljbGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNvbG9yID0gXCJcIjtcbiAgICAgICAgdGhpcy54ID0gMDtcbiAgICAgICAgdGhpcy55ID0gMDtcbiAgICAgICAgdGhpcy5kaWFtZXRlciA9IDA7XG4gICAgICAgIHRoaXMudGlsdCA9IDA7XG4gICAgICAgIHRoaXMudGlsdEFuZ2xlSW5jcmVtZW50ID0gMDtcbiAgICAgICAgdGhpcy50aWx0QW5nbGUgPSAwO1xuICAgIH1cbn1cbjtcbmV4cG9ydCBjbGFzcyBDb25mZXR0aUVmZmVjdCB7XG4gICAgc3RhdGljIHJlc2V0UGFydGljbGUocGFydGljbGUsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgcGFydGljbGUuY29sb3IgPSB0aGlzLl9jb2xvcnNbKE1hdGgucmFuZG9tKCkgKiB0aGlzLl9jb2xvcnMubGVuZ3RoKSB8IDBdO1xuICAgICAgICBwYXJ0aWNsZS54ID0gTWF0aC5yYW5kb20oKSAqIHdpZHRoO1xuICAgICAgICBwYXJ0aWNsZS55ID0gTWF0aC5yYW5kb20oKSAqIGhlaWdodCAtIGhlaWdodDtcbiAgICAgICAgcGFydGljbGUuZGlhbWV0ZXIgPSBNYXRoLnJhbmRvbSgpICogMTAgKyA1O1xuICAgICAgICBwYXJ0aWNsZS50aWx0ID0gTWF0aC5yYW5kb20oKSAqIDEwIC0gMTA7XG4gICAgICAgIHBhcnRpY2xlLnRpbHRBbmdsZUluY3JlbWVudCA9IE1hdGgucmFuZG9tKCkgKiAwLjA3ICsgMC4wNTtcbiAgICAgICAgcGFydGljbGUudGlsdEFuZ2xlID0gMDtcbiAgICAgICAgcmV0dXJuIHBhcnRpY2xlO1xuICAgIH1cbiAgICBzdGF0aWMgX3N0YXJ0Q29uZmV0dGlJbm5lcigpIHtcbiAgICAgICAgbGV0IHdpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgIGxldCBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgICBjYW52YXMuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJjb25mZXR0aS1jYW52YXNcIik7XG4gICAgICAgIGNhbnZhcy5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBcImRpc3BsYXk6YmxvY2s7ei1pbmRleDo5OTk5OTk7cG9pbnRlci1ldmVudHM6bm9uZTsgcG9zaXRpb246Zml4ZWQ7IHRvcDowOyBsZWZ0OiAwO1wiKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpO1xuICAgICAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgbGV0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICB3aGlsZSAodGhpcy5wYXJ0aWNsZXMubGVuZ3RoIDwgdGhpcy5tYXhQYXJ0aWNsZUNvdW50KVxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMucHVzaCh0aGlzLnJlc2V0UGFydGljbGUobmV3IFBhcnRpY2xlKCksIHdpZHRoLCBoZWlnaHQpKTtcbiAgICAgICAgdGhpcy5zdHJlYW1pbmdDb25mZXR0aSA9IHRydWU7XG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvblRpbWVyID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBydW5BbmltYXRpb24gPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGFydGljbGVzLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbmltYXRpb25UaW1lciA9IG51bGw7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUGFydGljbGVzKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BhcnRpY2xlcyhjb250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbmltYXRpb25UaW1lciA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocnVuQW5pbWF0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcnVuQW5pbWF0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIF9zdG9wQ29uZmV0dGlJbm5lcigpIHtcbiAgICAgICAgdGhpcy5zdHJlYW1pbmdDb25mZXR0aSA9IGZhbHNlO1xuICAgIH1cbiAgICBzdGF0aWMgZHJhd1BhcnRpY2xlcyhjb250ZXh0KSB7XG4gICAgICAgIGxldCBwYXJ0aWNsZTtcbiAgICAgICAgbGV0IHg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBhcnRpY2xlID0gdGhpcy5wYXJ0aWNsZXNbaV07XG4gICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY29udGV4dC5saW5lV2lkdGggPSBwYXJ0aWNsZS5kaWFtZXRlcjtcbiAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBwYXJ0aWNsZS5jb2xvcjtcbiAgICAgICAgICAgIHggPSBwYXJ0aWNsZS54ICsgcGFydGljbGUudGlsdDtcbiAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHggKyBwYXJ0aWNsZS5kaWFtZXRlciAvIDIsIHBhcnRpY2xlLnkpO1xuICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeCwgcGFydGljbGUueSArIHBhcnRpY2xlLnRpbHQgKyBwYXJ0aWNsZS5kaWFtZXRlciAvIDIpO1xuICAgICAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgdXBkYXRlUGFydGljbGVzKCkge1xuICAgICAgICBsZXQgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgbGV0IGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgbGV0IHBhcnRpY2xlO1xuICAgICAgICB0aGlzLndhdmVBbmdsZSArPSAwLjAxO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwYXJ0aWNsZSA9IHRoaXMucGFydGljbGVzW2ldO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN0cmVhbWluZ0NvbmZldHRpICYmIHBhcnRpY2xlLnkgPCAtMTUpXG4gICAgICAgICAgICAgICAgcGFydGljbGUueSA9IGhlaWdodCArIDEwMDtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnRpbHRBbmdsZSArPSBwYXJ0aWNsZS50aWx0QW5nbGVJbmNyZW1lbnQ7XG4gICAgICAgICAgICAgICAgcGFydGljbGUueCArPSBNYXRoLnNpbih0aGlzLndhdmVBbmdsZSk7XG4gICAgICAgICAgICAgICAgcGFydGljbGUueSArPSAoTWF0aC5jb3ModGhpcy53YXZlQW5nbGUpICsgcGFydGljbGUuZGlhbWV0ZXIgKyB0aGlzLnBhcnRpY2xlU3BlZWQpICogMC41O1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnRpbHQgPSBNYXRoLnNpbihwYXJ0aWNsZS50aWx0QW5nbGUpICogMTU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFydGljbGUueCA+IHdpZHRoICsgMjAgfHwgcGFydGljbGUueCA8IC0yMCB8fCBwYXJ0aWNsZS55ID4gaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RyZWFtaW5nQ29uZmV0dGkgJiYgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoIDw9IHRoaXMubWF4UGFydGljbGVDb3VudClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldFBhcnRpY2xlKHBhcnRpY2xlLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXJ0RWZmZWN0KHRhcmdldCwgY29udGFpbmVyKSB7XG4gICAgICAgIENvbmZldHRpRWZmZWN0Ll9zdGFydENvbmZldHRpSW5uZXIoKTtcbiAgICB9XG4gICAgO1xuICAgIHN0b3BFZmZlY3QoKSB7XG4gICAgICAgIENvbmZldHRpRWZmZWN0Ll9zdG9wQ29uZmV0dGlJbm5lcigpO1xuICAgIH1cbiAgICA7XG59XG5Db25mZXR0aUVmZmVjdC5fY29sb3JzID0gW1wiRG9kZ2VyQmx1ZVwiLCBcIk9saXZlRHJhYlwiLCBcIkdvbGRcIiwgXCJQaW5rXCIsIFwiU2xhdGVCbHVlXCIsIFwiTGlnaHRCbHVlXCIsIFwiVmlvbGV0XCIsIFwiUGFsZUdyZWVuXCIsIFwiU3RlZWxCbHVlXCIsIFwiU2FuZHlCcm93blwiLCBcIkNob2NvbGF0ZVwiLCBcIkNyaW1zb25cIl07XG5Db25mZXR0aUVmZmVjdC5zdHJlYW1pbmdDb25mZXR0aSA9IGZhbHNlO1xuQ29uZmV0dGlFZmZlY3QuYW5pbWF0aW9uVGltZXIgPSBudWxsO1xuQ29uZmV0dGlFZmZlY3QucGFydGljbGVzID0gW107XG5Db25mZXR0aUVmZmVjdC53YXZlQW5nbGUgPSAwO1xuLy8gY29uZmV0dGkgY29uZmlnXG5Db25mZXR0aUVmZmVjdC5tYXhQYXJ0aWNsZUNvdW50ID0gMTUwOyAvL3NldCBtYXggY29uZmV0dGkgY291bnRcbkNvbmZldHRpRWZmZWN0LnBhcnRpY2xlU3BlZWQgPSAyOyAvL3NldCB0aGUgcGFydGljbGUgYW5pbWF0aW9uIHNwZWVkXG4iLCAiLy9cbi8vIHRoZSBvZmZpY2FsIEdFTVMgQVBJIHdyYXBwZXIgLyB0YWdcbi8vIChjKSAyMDIzKyBCYXl6ZS5jb21cbi8vXG5jb25zdCBWRVJTSU9OID0gXCIwLjEuMTJcIjtcbmltcG9ydCB7IFN0cmluZ3MgfSBmcm9tIFwiLi9zdHJpbmdzLmpzXCI7XG5pbXBvcnQgeyBFZmZlY3RzTWFuYWdlciB9IGZyb20gXCIuL2VmZmVjdHMtbWFuYWdlci5qc1wiO1xuaW1wb3J0IHsgQ29uZmV0dGlFZmZlY3QgfSBmcm9tIFwiLi9lZmZlY3RzLWNvbmZldHRpLmpzXCI7XG5jb25zdCBHRU1TX3N0YXRlID0ge307XG5leHBvcnQgY2xhc3MgR0VNUyB7XG4gICAgLy9cbiAgICAvLyBoZWxwZXJzXG4gICAgLy9cbiAgICBzdGF0aWMgX2RlYnVnT3V0KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RlYnVnKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgX2dldFRpbWUoKSB7XG4gICAgICAgIGNvbnN0IHRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBjb25zdCBjdXJyZW50RGF0ZSA9IHRpbWUudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwgMTkpO1xuICAgICAgICByZXR1cm4gY3VycmVudERhdGU7XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBfd2FpdChtcykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIF93YWl0Rm9yTmV4dEV2ZW50KGVsZW1lbnQsIG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgKGUpID0+IHJlc29sdmUodHJ1ZSksIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHN0YXRpYyB2ZXJzaW9uKCkge1xuICAgICAgICByZXR1cm4gVkVSU0lPTjtcbiAgICB9XG4gICAgc3RhdGljIGRlYnVnKG9uKSB7XG4gICAgICAgIHRoaXMuX2RlYnVnID0gb247XG4gICAgICAgIGNvbnNvbGUubG9nKFwiR0VNUzogZGVidWcgb246IFwiICsgdGhpcy52ZXJzaW9uKCkpO1xuICAgIH1cbiAgICBzdGF0aWMgYXN5bmMgaW5pdChwYXJhbXMpIHtcbiAgICAgICAgY29uc29sZS5hc3NlcnQoISFwYXJhbXMuYXBwSWQsIFwicGFyYW1zLmFwcElkIHNob3VsZCBub3QgYmUgZmFsc3lcIik7XG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0KCEhcGFyYW1zLmFwaUtleSwgXCJwYXJhbXMuYXBpS2V5IHNob3VsZCBub3QgYmUgZmFsc3lcIik7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IC4uLnBhcmFtcyB9O1xuICAgICAgICBkZWxldGUgdGhpcy5zdGF0ZS5hcGlLZXk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoIXBhcmFtcy51c2VySWQgJiYgcGFyYW1zLnVzZUNvb2tpZSkge1xuICAgICAgICAgICAgICAgIHBhcmFtcy51c2VySWQgPSB0aGlzLl9nZXRDb29raWUoXCJnZW1zLXVzZXItaWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgdXJsID0gdGhpcy5fcm9vdCArIFwiaW5pdC9cIiArXG4gICAgICAgICAgICAgICAgcGFyYW1zLmFwcElkICtcbiAgICAgICAgICAgICAgICAocGFyYW1zLnVzZXJJZCA/IFwiL1wiICsgcGFyYW1zLnVzZXJJZCA6IFwiXCIpO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9mZXRjaCh1cmwsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6IHBhcmFtcy51c2VySWQgPyBcIkdFVFwiIDogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBhcGlrZXk6IHBhcmFtcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgdGhpcy5fZGVidWdPdXQoXCJpbml0OiByZXN1bHQ6IFwiICsgSlNPTi5zdHJpbmdpZnkocmVzdWx0KSk7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLnVzZXJJZCA9IHJlc3VsdC51c2VyX2lkO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS50b2tlbiA9IHJlc3VsdC50b2tlbjtcbiAgICAgICAgICAgIGlmIChwYXJhbXMudXNlQ29va2llKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0Q29va2llKFwiZ2Vtcy11c2VyLWlkXCIsIHRoaXMuc3RhdGUudXNlcklkLCAzNjUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1c2VySWQ6IHRoaXMuc3RhdGUudXNlcklkLFxuICAgICAgICAgICAgICAgIHRva2VuOiB0aGlzLnN0YXRlLnRva2VuLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJHRU1TIEFQSSBlcnJvcjpcIik7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBzZXRDbGllbnRDcmVkZW50aWFscyhhcHBJZCwgdXNlcklkLCB0b2tlbikge1xuICAgICAgICB0aGlzLnN0YXRlLmFwcElkID0gYXBwSWQ7XG4gICAgICAgIHRoaXMuc3RhdGUudXNlcklkID0gdXNlcklkO1xuICAgICAgICB0aGlzLnN0YXRlLnRva2VuID0gdG9rZW47XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBldmVudChuYW1lLCBkYXRhID0ge30sIG9wdGlvbnMgPSB7IGRpc3BsYXlGaXJzdDogdHJ1ZSB9KSB7XG4gICAgICAgIGxldCByZXN1bHQ7XG4gICAgICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICAgICAgICB1c2VyX2lkOiB0aGlzLnN0YXRlLnVzZXJJZCxcbiAgICAgICAgICAgIHRhZ05hbWU6IG5hbWUsXG4gICAgICAgICAgICBsb2NhbFRpbWU6IHRoaXMuX2dldFRpbWUoKSxcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIH07XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGggPT09IDEgJiYgKFwidmFsdWVcIiBpbiBkYXRhKSkge1xuICAgICAgICAgICAgZGVsZXRlIGJvZHlbXCJkYXRhXCJdO1xuICAgICAgICAgICAgYm9keVtcInZhbHVlXCJdID0gZGF0YS52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9mZXRjaCh0aGlzLl9yb290ICsgXCJldmVudFwiLCB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBcIkJlYXJlciBcIiArIHRoaXMuc3RhdGUudG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwidGV4dC9wbGFpblwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLy8gc2VuZGluZyBib2R5IGFzIHBsYWluIHRleHQgZHVlIHRvIEFXUyBDT1JTIHBvbGljeVxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXN1bHQgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICB0aGlzLl9kZWJ1Z091dChcImV2ZW50OiByZXN1bHQ6IFwiICsgSlNPTi5zdHJpbmdpZnkocmVzdWx0KSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiByZXN1bHQuYWNoaWV2ZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5kaXNwbGF5QWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RlYnVnT3V0KFwiYXV0by1kaXNwbGF5aW5nIGFsbCBhY2hpZXZlbWVudHNcIik7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGEgb2YgcmVzdWx0LmFjaGlldmVtZW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5kaXNwbGF5QWNoaWV2ZW1lbnQoYSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5kaXNwbGF5Rmlyc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGVidWdPdXQoXCJhdXRvLWRpc3BsYXlpbmcgZmlyc3QgYWNoaWV2ZW1lbnRcIik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuYWNoaWV2ZW1lbnRzICYmIHJlc3VsdC5hY2hpZXZlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5kaXNwbGF5QWNoaWV2ZW1lbnQocmVzdWx0LmFjaGlldmVtZW50c1swXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LmFjaGlldmVtZW50cztcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJHRU1TIEFQSSBlcnJvcjpcIik7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIDtcbiAgICBzdGF0aWMgYXN5bmMgZGlzcGxheUFjaGlldmVtZW50KGFjaGlldmVtZW50LCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgLy8gc2NyaW1cbiAgICAgICAgY29uc3Qgc2NyaW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzY3JpbS5jbGFzc05hbWUgPSBcIkdFTVMtc2NyaW1cIjtcbiAgICAgICAgb3B0aW9ucy5jb250YWluZXIgPz8gKG9wdGlvbnMuY29udGFpbmVyID0gZG9jdW1lbnQuYm9keSk7XG4gICAgICAgIG9wdGlvbnMuY29udGFpbmVyLmFwcGVuZENoaWxkKHNjcmltKTtcbiAgICAgICAgLy8gZnJhbWVcbiAgICAgICAgY29uc3QgZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBmcmFtZS5jbGFzc05hbWUgPSBcIkdFTVMtYWNoaWV2ZW1lbnQtZnJhbWVcIjtcbiAgICAgICAgLy8gY29udGVudFxuICAgICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoMlwiKTtcbiAgICAgICAgdGl0bGUuY2xhc3NOYW1lID0gXCJHRU1TLWFjaGlldmVtZW50LXRpdGxlXCI7XG4gICAgICAgIHRpdGxlLmlubmVyVGV4dCA9IGFjaGlldmVtZW50LnRpdGxlO1xuICAgICAgICBjb25zdCBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgICAgIGltYWdlLmNsYXNzTmFtZSA9IFwiR0VNUy1hY2hpZXZlbWVudC1pbWFnZVwiO1xuICAgICAgICBpbWFnZS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoKGUpID0+IHtcbiAgICAgICAgICAgIHNjcmltLmFwcGVuZENoaWxkKGZyYW1lKTtcbiAgICAgICAgfSkpO1xuICAgICAgICBpbWFnZS5zcmMgPSBhY2hpZXZlbWVudC5pbWFnZTtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaDNcIik7XG4gICAgICAgIGRlc2NyaXB0aW9uLmNsYXNzTmFtZSA9IFwiR0VNUy1hY2hpZXZlbWVudC1kZXNjcmlwdGlvblwiO1xuICAgICAgICBkZXNjcmlwdGlvbi5pbm5lclRleHQgPSBhY2hpZXZlbWVudC5kZXNjcmlwdGlvbjtcbiAgICAgICAgZnJhbWUuYXBwZW5kQ2hpbGQodGl0bGUpO1xuICAgICAgICBmcmFtZS5hcHBlbmRDaGlsZChpbWFnZSk7XG4gICAgICAgIGZyYW1lLmFwcGVuZENoaWxkKGRlc2NyaXB0aW9uKTtcbiAgICAgICAgY29uc3QgdGltZXJQcm9taXNlID0gdGhpcy5fd2FpdCgzMDAwKTtcbiAgICAgICAgY29uc3QgY2xpY2tQcm9taXNlID0gdGhpcy5fd2FpdEZvck5leHRFdmVudChzY3JpbSwgXCJjbGlja1wiKTtcbiAgICAgICAgLy8gc3RhcnQgZWZmZWN0c1xuICAgICAgICBvcHRpb25zLmVmZmVjdHMgPz8gKG9wdGlvbnMuZWZmZWN0cyA9IFtcImNvbmZldHRpXCJdKTtcbiAgICAgICAgZm9yIChjb25zdCBlZmZlY3Qgb2Ygb3B0aW9ucy5lZmZlY3RzKSB7XG4gICAgICAgICAgICB0aGlzLl9kZWJ1Z091dChcInBsYXlpbmcgZWZmZWN0OiBcIiArIGVmZmVjdCk7XG4gICAgICAgICAgICBFZmZlY3RzTWFuYWdlci5zdGFydEVmZmVjdChlZmZlY3QsIG9wdGlvbnMuY2VudGVyT24sIG9wdGlvbnMuY29udGFpbmVyKTtcbiAgICAgICAgfVxuICAgICAgICAvLyB3YWl0XG4gICAgICAgIGF3YWl0IFByb21pc2UucmFjZShbdGltZXJQcm9taXNlLCBjbGlja1Byb21pc2VdKTtcbiAgICAgICAgLy8gc3RvcCBlZmZlY3RzXG4gICAgICAgIGZvciAoY29uc3QgZWZmZWN0IG9mIG9wdGlvbnMuZWZmZWN0cykge1xuICAgICAgICAgICAgRWZmZWN0c01hbmFnZXIuc3RvcEVmZmVjdChlZmZlY3QpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNsZWFudXBcbiAgICAgICAgc2NyaW0ucmVtb3ZlKCk7XG4gICAgfVxuICAgIC8vXG4gICAgLy8gX19fX19fX19CQURHRVNfX19fX19cbiAgICAvL1xuICAgIHN0YXRpYyBhc3luYyBnZXRBbGxCYWRnZXMoKSB7XG4gICAgICAgIGxldCByZXN1bHQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoIUdFTVNfc3RhdGUudG9rZW4pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJnZXRBbGxCYWRnZXM6IFRva2VuIGlzIG1pc3NpbmdcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2ZldGNoKHRoaXMuX3Jvb3QgKyBcImJhZGdlc1wiLCB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke0dFTVNfc3RhdGUudG9rZW59YCxcbiAgICAgICAgICAgICAgICAgICAgQWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBnZXRBbGxCYWRnZXM6IEhUVFAgZXJyb3I6IFN0YXR1czogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHQgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICByZXN1bHQgPz8gKHJlc3VsdCA9IFtdKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiR0VNUyBBUEkgZXJyb3I6IFwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIDtcbiAgICBzdGF0aWMgYXN5bmMgZGlzcGxheUJhZGdlcyhiYWRnZXMsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICAvLyBzY3JpbVxuICAgICAgICBjb25zdCBzY3JpbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHNjcmltLmNsYXNzTmFtZSA9IG9wdGlvbnMuc2NyaW1DbGFzc05hbWUgfHwgXCJHRU1TLWJhZGdlcy1zY3JpbVwiO1xuICAgICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChvcHRpb25zLmNvbnRhaW5lcklkIHx8IFwiR0VNUy1iYWRnZXMtY29udGFpbmVyXCIpIHx8XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5O1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoc2NyaW0pO1xuICAgICAgICAvLyBmcmFtZVxuICAgICAgICBjb25zdCBmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGZyYW1lLmNsYXNzTmFtZSA9IG9wdGlvbnMuZnJhbWVDbGFzc05hbWUgfHwgXCJHRU1TLWJhZGdlcy1mcmFtZVwiO1xuICAgICAgICAvL2Rpc3BsYXkgbWVzc2FnZSBpZiBubyBiYWRnZXMgd2VyZSBmZXRjaGVkXG4gICAgICAgIGlmIChiYWRnZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImgyXCIpO1xuICAgICAgICAgICAgbWVzc2FnZS5pbm5lclRleHQgPSBTdHJpbmdzLk5PX0JBREdFUztcbiAgICAgICAgICAgIGZyYW1lLmFwcGVuZENoaWxkKG1lc3NhZ2UpO1xuICAgICAgICAgICAgc2NyaW0uYXBwZW5kQ2hpbGQoZnJhbWUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNvbnRlbnRcbiAgICAgICAgYmFkZ2VzLmZvckVhY2goKGJhZGdlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbWFnZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICBpbWFnZUNvbnRhaW5lci5jbGFzc05hbWUgPSBcIkdFTVMtYmFkZ2UtaW1hZ2VDb250YWluZXJcIjtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICAgICAgICAgIGltYWdlLmNsYXNzTmFtZSA9IFwiR0VNUy1iYWRnZS1pbWFnZVwiO1xuICAgICAgICAgICAgaW1hZ2Uuc3JjID0gYmFkZ2UuaW1hZ2U7XG4gICAgICAgICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoMlwiKTtcbiAgICAgICAgICAgIHRpdGxlLmNsYXNzTmFtZSA9IFwiR0VNUy1iYWRnZS10aXRsZVwiO1xuICAgICAgICAgICAgdGl0bGUuaW5uZXJUZXh0ID0gYmFkZ2UubmFtZTtcbiAgICAgICAgICAgIC8vYmFkZ2UgdW5sb2NrZWQgeWV0IC0+IGdyZXllZC1vdXRcbiAgICAgICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImgzXCIpO1xuICAgICAgICAgICAgZGVzY3JpcHRpb24uY2xhc3NOYW1lID0gXCJHRU1TLWJhZGdlLWRlc2NyaXB0aW9uXCI7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbi5pbm5lclRleHQgPSBiYWRnZS5kZXNjcmlwdGlvbjtcbiAgICAgICAgICAgIGltYWdlQ29udGFpbmVyLmFwcGVuZENoaWxkKGltYWdlKTtcbiAgICAgICAgICAgIGltYWdlQ29udGFpbmVyLmFwcGVuZENoaWxkKHRpdGxlKTtcbiAgICAgICAgICAgIGlmIChiYWRnZS51bmxvY2tlZERhdGUgPT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICBpbWFnZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFwiR0VNUy1iYWRnZS1pbWFnZS0tdW5lYXJuZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpbWFnZUNvbnRhaW5lci5hcHBlbmRDaGlsZChkZXNjcmlwdGlvbik7XG4gICAgICAgICAgICBmcmFtZS5hcHBlbmRDaGlsZChpbWFnZUNvbnRhaW5lcik7XG4gICAgICAgIH0pO1xuICAgICAgICBzY3JpbS5hcHBlbmRDaGlsZChmcmFtZSk7XG4gICAgfVxuICAgIDtcbiAgICBzdGF0aWMgYXN5bmMgZGlzcGxheUFsbEJhZGdlcygpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5nZXRBbGxCYWRnZXMoKTtcbiAgICAgICAgdGhpcy5kaXNwbGF5QmFkZ2VzKHJlc3VsdCk7XG4gICAgfVxuICAgIDtcbiAgICAvLyBjdXN0b20gZmV0Y2ggdG8gYWNjb3VudCBmb3IgcG9zc2libGUgbm9kZSA8MThcbiAgICBzdGF0aWMgYXN5bmMgX2ZldGNoKHVybCwgaW5pdCkge1xuICAgICAgICB0aGlzLl9kZWJ1Z091dChcImZldGNoOiBcIiArIGluaXQubWV0aG9kICsgXCI6IFwiICsgdXJsKTtcbiAgICAgICAgdGhpcy5fZGVidWdPdXQoXCIgICAgaGVhZGVyczogXCIgKyBKU09OLnN0cmluZ2lmeShpbml0LmhlYWRlcnMpKTtcbiAgICAgICAgdGhpcy5fZGVidWdPdXQoXCIgICAgYm9keSAgIDogXCIgKyBKU09OLnN0cmluZ2lmeShpbml0LmJvZHkpKTtcbiAgICAgICAgbGV0IHJlc3BvbnNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IGZldGNoKHVybCwgaW5pdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmID0gdGhpcy5zdGF0ZS5mZXRjaCA/PyBnbG9iYWxUaGlzLmZldGNoO1xuICAgICAgICAgICAgICAgIGlmICghZikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJwbGF0Zm9ybSBpcyBsYWNraW5nIGFjY2VzcyB0byBmZXRjaCBmdW5jdGlvblwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBmKHVybCwgaW5pdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZldGNoOiBlcnJvciByZXNwb25zZTogXCIgKyBlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfVxuICAgIC8vIGNvb2tpZXNcbiAgICBzdGF0aWMgX3NldENvb2tpZShjbmFtZSwgY3ZhbHVlLCBleGRheXMpIHtcbiAgICAgICAgY29uc3QgZCA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGQuc2V0VGltZShkLmdldFRpbWUoKSArIChleGRheXMgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XG4gICAgICAgIGxldCBleHBpcmVzID0gXCJleHBpcmVzPVwiICsgZC50b1VUQ1N0cmluZygpO1xuICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjbmFtZSArIFwiPVwiICsgY3ZhbHVlICsgXCI7XCIgKyBleHBpcmVzICsgXCI7cGF0aD0vXCI7XG4gICAgfVxuICAgIHN0YXRpYyBfZ2V0Q29va2llKGNuYW1lKSB7XG4gICAgICAgIGxldCBuYW1lID0gY25hbWUgKyBcIj1cIjtcbiAgICAgICAgbGV0IGNhID0gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7Jyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2EubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBjID0gY2FbaV07XG4gICAgICAgICAgICB3aGlsZSAoYy5jaGFyQXQoMCkgPT0gJyAnKSB7XG4gICAgICAgICAgICAgICAgYyA9IGMuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGMuaW5kZXhPZihuYW1lKSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGMuc3Vic3RyaW5nKG5hbWUubGVuZ3RoLCBjLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxufVxuR0VNUy5fcm9vdCA9IFwiaHR0cHM6Ly9nZW1zYXBpLmJheXouYWkvdXNlci9cIjtcbkdFTVMuc3RhdGUgPSB7fTtcbkdFTVMuX2RlYnVnID0gZmFsc2U7XG4vL1xuLy8gZXhwb3NlZCBBUElcbi8vXG5HRU1TLkVmZmVjdHNNYW5hZ2VyID0gRWZmZWN0c01hbmFnZXI7XG5mdW5jdGlvbiBfY3JlYXRlU3R5bGUoKSB7XG4gICAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gICAgY29uc3QgY3NzID0gYFxuICAgIC5HRU1TLXNjcmltIHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgdG9wOiAwO1xuICAgICAgICBsZWZ0OiAwO1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgIH1cbiAgICBcbiAgICAuR0VNUy1hY2hpZXZlbWVudC1mcmFtZSB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgICBib3JkZXItcmFkaXVzOiA1cHg7XG4gICAgICAgIGJveC1zaGFkb3c6ICc0cHggOHB4IDM2cHggI0Y0QUFCOSc7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xuICAgICAgICB3aWR0aDo2MDBweDtcbiAgICAgICAgaGVpZ2h0OiA0MDBweDtcbiAgICAgICAgZm9udC1mYW1pbHk6IEFyaWFsLCBIZWx2ZXRpY2EsIHNhbnMtc2VyaWY7XG4gICAgfVxuICAgIFxuICAgIC5HRU1TLWFjaGlldmVtZW50LXRpdGxlIHtcbiAgICAgICAgbWFyZ2luOiAxMHB4O1xuICAgIH1cbiAgICBcbiAgICAuR0VNUy1hY2hpZXZlbWVudC1pbWFnZSB7XG4gICAgICAgIHdpZHRoOiAxMDA7XG4gICAgICAgIGhlaWdodDogMTAwO1xuICAgICAgICBib3JkZXItcmFkaXVzOiA1cHg7XG4gICAgICAgIGJveC1zaGFkb3c6ICc0cHggOHB4IDM2cHggI0Y0QUFCOSc7XG4gICAgfVxuICAgIFxuICAgIC5HRU1TLWFjaGlldmVtZW50LWRlc2NyaXB0aW9uIHtcbiAgICAgICAgbWFyZ2luOiAxMHB4O1xuICAgIH1cblxuICAgIC5HRU1TLWJhZGdlcy1zY3JpbSB7XG4gICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgIGhlaWdodDogZml0LWNvbnRlbnQ7XG4gICAgICAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xuICAgICAgICAgZmxleC13cmFwOiB3cmFwO1xuICAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICAgcGFkZGluZzogMjBweCAxMHB4IDtcbiAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xuICAgICAgICAgYm9yZGVyLXJhZGl1czogN3B4O1xuICAgICAgICAgYm94LXNoYWRvdzogcmdiYSg1MCwgNTAsIDkzLCAwLjI1KSAwcHggNTBweCAxMDBweCAtMjBweCwgcmdiYSgwLCAwLCAwLCAwLjMpIDBweCAzMHB4IDYwcHggLTMwcHg7XG4gICAgfVxuXG4gICAgLkdFTVMtYmFkZ2VzLWZyYW1lIHtcbiAgICAgICAgd2lkdGg6IGZpdC1jb250ZW50O1xuICAgICAgICBtYXJnaW4tYm90dG9tOiA1cHg7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGZsZXgtd3JhcDogd3JhcDtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBzdGFydDtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IHJvdztcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNXB4O1xuICAgICAgICBmb250LWZhbWlseTogQXJpYWwsIEhlbHZldGljYSwgc2Fucy1zZXJpZjtcbiAgICB9XG5cbiAgICAuR0VNUy1iYWRnZS1pbWFnZUNvbnRhaW5lciB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgICB3aWR0aDogOTBweDtcbiAgICAgICAgbWFyZ2luLWJvdHRvbTogNXB4O1xuICAgIH1cblxuICAgIC5HRU1TLWJhZGdlLWltYWdlIHtcbiAgICAgICAgd2lkdGg6IDUwcHg7XG4gICAgICAgIGhlaWdodDogYXV0bztcbiAgICB9XG5cbiAgICAuR0VNUy1iYWRnZS1pbWFnZTpob3ZlciB7XG4gICAgICAgIHNjYWxlOiAxMDUlO1xuICAgIH1cblxuXG4gICAgLkdFTVMtYmFkZ2UtdGl0bGUge1xuICAgICAgICBmb250LXNpemU6IC40cmVtO1xuICAgICAgICBjb2xvcjogcmdiKDkxLCA5MCwgOTApO1xuICAgICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xuICAgIH1cblxuICAgIC5HRU1TLWJhZGdlLWRlc2NyaXB0aW9uIHtcbiAgICAgICAgZm9udC1zaXplOiAuNHJlbTtcbiAgICAgICAgb3BhY2l0eTogNjAlO1xuICAgICAgICBtYXgtd2lkdGg6IDUwJTtcbiAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgIH1cblxuICAgIC5HRU1TLWJhZGdlLWltYWdlLS11bmVhcm5lZCB7XG4gICAgICAgIG9wYWNpdHk6IDAuNTtcbiAgICAgICAgZmlsdGVyOiBncmF5c2NhbGUoODAlKTtcbiAgICB9XG5cbiAgICAuR0VNUy1iYWRnZS1pbWFnZS0tdW5lYXJuZWQ6aG92ZXIge1xuICAgICAgICBvcGFjaXR5OiAwLjc7XG5cbiAgICB9XG4gICAgYDtcbiAgICBzdHlsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgLy8gaW4gYnJvd3NlclxuICAgIC8vIHJlZ2lzdGVyIHN0eWxlc1xuICAgIF9jcmVhdGVTdHlsZSgpO1xuICAgIC8vIHJlZ2lzdGVyIGVmZmVjdHNcbiAgICBFZmZlY3RzTWFuYWdlci5yZWdpc3RlckVmZmVjdChcImNvbmZldHRpXCIsIG5ldyBDb25mZXR0aUVmZmVjdCk7XG59XG4iLCAiaW1wb3J0IHsgR0VNUyB9IGZyb20gJy4vZ2Vtcy5qcyc7XG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIC8vIGluIGJyb3dzZXJcbiAgICB3aW5kb3dbXCJHRU1TXCJdID0gR0VNUztcbn1cbi8vbW9kdWxlLmV4cG9ydHMgPSBHRU1TO1xuZXhwb3J0IHsgR0VNUyB9O1xuIiwgImltcG9ydCB7R0VNU30gZnJvbSBcImJheXplLWdlbXMtYXBpXCI7XG5cbi8vIGdhbWUgZWxlbWVudHMgICBcbmNvbnN0IHNjb3JlU3BhbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2NvcmVcIikhIGFzIEhUTUxTcGFuRWxlbWVudDtcbmNvbnN0IHN0YXJ0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFwiKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5jb25zdCBwbGF5QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5XCIpISBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbmNvbnN0IHNjb3JlQm94ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzY29yZWJveFwiKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5jb25zdCBmaW5pc2hCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2ZpbmlzaFwiKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5cbnN0YXJ0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzdGFydCk7XG5wbGF5QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzY29yZSk7XG5maW5pc2hCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZpbmlzaCk7XG5cbi8vIHZlcnNpb25cbihkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInZlcnNpb25cIikgYXMgSFRNTFNwYW5FbGVtZW50KS5pbm5lclRleHQgPSBHRU1TLnZlcnNpb24oKTtcbkdFTVMuZGVidWcodHJ1ZSk7XG4vLyBpbml0IGFuZCBmaXJzdCBldmVudFxuY29uc3QgYXBpS2V5ID0gXCJpMnNsdWxOKVUlN3h2TW9WQUNMU0VZb2dPZWtOUW9XRVwiO1xuY29uc3QgYXBwSWQgPSBcIjM3Njc1YWM4LWMwYzAtNDJlOS04MjkxLTBmOTUyOWRmNWQ0N1wiO1xuR0VNUy5pbml0KHthcGlLZXk6YXBpS2V5LCBhcHBJZDphcHBJZH0pLnRoZW4oKCk9PntcbiAgICBHRU1TLmV2ZW50KFwiRGVtby1HYW1lUGFnZVwiKTtcbiAgICBzdGFydEJ1dHRvbiEuZGlzYWJsZWQgPSBmYWxzZTtcbn0pO1xuXG5mdW5jdGlvbiBzdGFydCgpIHtcbiAgICBHRU1TLmV2ZW50KFwiRGVtby1HYW1lU3RhcnRlZFwiKTtcbiAgICBzY29yZVNwYW4uaW5uZXJUZXh0ID0gXCIwXCI7XG4gICAgcGxheUJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIHNjb3JlQm94LmRpc2FibGVkID0gZmFsc2U7XG4gICAgc3RhcnRCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xufVxuXG5mdW5jdGlvbiBzY29yZSgpIHtcbiAgICBsZXQgbiA9IE51bWJlcihzY29yZVNwYW4uaW5uZXJUZXh0KTtcbiAgICBsZXQgbk5ldyA9IE51bWJlcihzY29yZUJveC52YWx1ZSk7XG4gICAgaWYgKGlzTmFOKG5OZXcpKXtcbiAgICAgICAgbk5ldyA9IDA7XG4gICAgfVxuICAgIG4gKz0gbk5ldztcbiAgICBzY29yZVNwYW4uaW5uZXJUZXh0ID0gU3RyaW5nKG4pO1xuICAgIGZpbmlzaEJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xufVxuXG5mdW5jdGlvbiBmaW5pc2goKSB7XG4gICAgR0VNUy5ldmVudChcIkRlbW8tR2FtZUZpbmlzaGVkXCIsIHt2YWx1ZTpOdW1iZXIoc2NvcmVTcGFuLmlubmVyVGV4dCl9KTtcbiAgICBwbGF5QnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbiAgICBzY29yZUJveC5kaXNhYmxlZCA9IHRydWU7XG4gICAgZmluaXNoQnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbiAgICBzdGFydEJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQk8sTUFBSTtBQUVYLE1BQU0sV0FBWSxPQUFPLFdBQVcsY0FBZSxVQUFVLFdBQVc7QUFFeEUsTUFBTSxZQUFOLE1BQWdCO0FBQUEsRUFDaEI7QUFJQSxNQUFNLFFBQU4sY0FBb0IsVUFBVTtBQUFBLElBQzFCLGNBQWM7QUFDVixZQUFNLEdBQUcsU0FBUztBQUNsQixXQUFLLFlBQVk7QUFBQSxJQUNyQjtBQUFBLEVBQ0o7QUFDQSxNQUFNLFFBQU4sY0FBb0IsTUFBTTtBQUFBLEVBQzFCO0FBQ0EsTUFBTSxRQUFOLGNBQW9CLFVBQVU7QUFBQSxJQUMxQixjQUFjO0FBQ1YsWUFBTSxHQUFHLFNBQVM7QUFDbEIsV0FBSyxZQUFZO0FBQUEsSUFDckI7QUFBQSxFQUNKO0FBSUEsV0FBUyxJQUFJQSxXQUFVO0FBQ25CLFlBQVFBO0FBQUE7QUFBQSxXQUVDO0FB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
