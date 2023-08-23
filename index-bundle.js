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
  var Strings = set();
  var language = typeof window !== "undefined" ? navigator.language : "";
  set(language);
  Strings["set"] = set;

  // node_modules/bayze-gems-api/dist/esm/effect.js
  var Effect = class {
    startEffect(target, container) {
    }
    stopEffect() {
    }
  };

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
  var ConfettiEffect = class extends Effect {
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
  EffectsManager.registerEffect("confetti", new ConfettiEffect());

  // node_modules/bayze-gems-api/dist/esm/gems.js
  var VERSION = "0.1.7";
  var GEMS_state = {};
  var GEMS = class {
    static _getLocalTime() {
      const dateDataOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      };
      const time = new Date();
      const currentDateUK = time.toLocaleString("en-UK", dateDataOptions);
      return currentDateUK;
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
        const response = await this.fetch(url, {
          method: params.userId ? "GET" : "POST",
          headers: {
            apikey: params.apiKey
          }
        });
        const result = await response.json();
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
        localTime: this._getLocalTime(),
        data
      };
      if (Object.keys(data).length === 1 && "value" in data) {
        delete body["data"];
        body["value"] = data.value;
      }
      try {
        const response = await this.fetch(this._root + "event", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + this.state.token,
            "Content-Type": "text/plain"
          },
          body: JSON.stringify(body)
        });
        result = await response.json();
        if (typeof window !== "undefined") {
          if (options.displayAll) {
            for (let a of result.achievements) {
              await this.displayAchievement(a);
            }
          } else if (options.displayFirst) {
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
      image.src = achievement.image;
      const description = document.createElement("h3");
      description.className = "GEMS-achievement-description";
      description.innerText = achievement.description;
      frame.appendChild(title);
      frame.appendChild(image);
      frame.appendChild(description);
      scrim.appendChild(frame);
      const timerPromise = this._wait(3e3);
      const clickPromise = this._waitForNextEvent(scrim, "click");
      (_b = options.effects) != null ? _b : options.effects = ["confetti"];
      for (const effect of options.effects) {
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
        const response = await this.fetch(this._root + "badges", {
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
    static async fetch(url, init) {
      var _a;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZV9tb2R1bGVzL2JheXplLWdlbXMtYXBpL2Rpc3QvZXNtL3N0cmluZ3MuanMiLCAibm9kZV9tb2R1bGVzL2JheXplLWdlbXMtYXBpL2Rpc3QvZXNtL2VmZmVjdC5qcyIsICJub2RlX21vZHVsZXMvYmF5emUtZ2Vtcy1hcGkvZGlzdC9lc20vZWZmZWN0cy1jb25mZXR0aS5qcyIsICJub2RlX21vZHVsZXMvYmF5emUtZ2Vtcy1hcGkvZGlzdC9lc20vZWZmZWN0cy1tYW5hZ2VyLmpzIiwgIm5vZGVfbW9kdWxlcy9iYXl6ZS1nZW1zLWFwaS9kaXN0L2VzbS9nZW1zLmpzIiwgImluZGV4LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvL1xuLy8gc3RyaW5nIHRhYmxlXG4vL1xuLy8ga2V5IGZvciBhcGkgaXMgbGFuZytcIi1cIitjb3VudHJ5IChzYW1lIGFzIGJyb3dlcidzIG5hdmlnYXRvci5sYW5ndWFnZSlcbi8vIGludGVybmFsIGtleSBzdWJzdGl0dXRlcyBcIl9cIiBmb3IgXCItXCJcbi8vXG4vLyBsYW5nIGlzIElTTyA2MzktMSAoMiBjaGFyIGNvZGUsIGxvd2VyIGNhc2UpXG4vLyBjb3VudHJ5IGlzIElTTyAzMTY2IEFMUEhBLTIgKDIgY2hhciBjb2RlLCB1cHBlciBjYXNlKVxuLy8gXG4vLyB2YWx1ZSBpcyBzdHJpbmcgdG8gdXNlIGluIFVJXG4vLyB1c2FnZTpcbi8vIGFsZXJ0KFN0cmluZ3MuTk9fQkFER0VTKTtcbi8vIFN0cmluZ01hcHMuc2V0XG4vL1xuLy8gYmFzZSBmdW5jdGlvbmFsaXR5XG5jbGFzcyBTdHJpbmdNYXAge1xufVxuLy9cbi8vIHN0cmluZyB0YWJsZXNcbi8vXG5jbGFzcyBlbl9VUyBleHRlbmRzIFN0cmluZ01hcCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMuTk9fQkFER0VTID0gXCJObyBiYWRnZXMgZm91bmQuXCI7XG4gICAgfVxufVxuY2xhc3MgZW5fR0IgZXh0ZW5kcyBlbl9VUyB7XG59XG5jbGFzcyBkZV9ERSBleHRlbmRzIFN0cmluZ01hcCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMuTk9fQkFER0VTID0gXCJLZWluZSBBYnplaWNoZW4gZ2VmdW5kZW4uXCI7XG4gICAgfVxufVxuLy9cbi8vIHNldCBmdW5jdGlvbmFsaXR5XG4vL1xuZnVuY3Rpb24gc2V0KGxhbmd1YWdlKSB7XG4gICAgc3dpdGNoIChsYW5ndWFnZSkge1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICBjYXNlIFwiZW4tVVNcIjpcbiAgICAgICAgICAgIFN0cmluZ3MgPSBuZXcgZW5fVVMoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZW4tR0JcIjpcbiAgICAgICAgICAgIFN0cmluZ3MgPSBuZXcgZW5fR0IoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZGUtREVcIjpcbiAgICAgICAgICAgIFN0cmluZ3MgPSBuZXcgZGVfREUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gU3RyaW5ncztcbn1cbi8vXG4vLyBleHBvcnRlZCB2YXJpYWJsZSBhbmQgZGVmYXVsdCBiZWhhdmlvclxuLy9cbmV4cG9ydCBsZXQgU3RyaW5ncyA9IHNldCgpO1xuLy8gYnkgZGVmYXVsdCwgdXNlIHRoZSBicm93c2VyJ3MgbGFuZ3VhZ2Ugc2V0dGluZ1xuY29uc3QgbGFuZ3VhZ2UgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikgPyBuYXZpZ2F0b3IubGFuZ3VhZ2UgOiBcIlwiO1xuc2V0KGxhbmd1YWdlKTtcbi8vIGluc3RhbGwgdGhlIFwic2V0XCIgZnVuY3Rpb24gaW4gdGhlIFN0cmluZ3Mgb2JqZWN0XG5TdHJpbmdzW1wic2V0XCJdID0gc2V0O1xuIiwgImV4cG9ydCBjbGFzcyBFZmZlY3Qge1xuICAgIHN0YXJ0RWZmZWN0KHRhcmdldCwgY29udGFpbmVyKSB7XG4gICAgfVxuICAgIDtcbiAgICBzdG9wRWZmZWN0KCkge1xuICAgIH1cbiAgICA7XG59XG4iLCAiLy9cbi8vIGNvbmZldHRpIGVmZmVjdFxuLy8gY3JlZGl0czpcbi8vIGNvbmZldHRpIGJ5IG1hdGh1c3VtbXV0LCBNSVQgbGljZW5zZTogaHR0cHM6Ly93d3cuY3Nzc2NyaXB0LmNvbS9jb25mZXR0aS1mYWxsaW5nLWFuaW1hdGlvbi9cbi8vXG5pbXBvcnQgeyBFZmZlY3QgfSBmcm9tIFwiLi9lZmZlY3RcIjtcbmNsYXNzIFBhcnRpY2xlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jb2xvciA9IFwiXCI7XG4gICAgICAgIHRoaXMueCA9IDA7XG4gICAgICAgIHRoaXMueSA9IDA7XG4gICAgICAgIHRoaXMuZGlhbWV0ZXIgPSAwO1xuICAgICAgICB0aGlzLnRpbHQgPSAwO1xuICAgICAgICB0aGlzLnRpbHRBbmdsZUluY3JlbWVudCA9IDA7XG4gICAgICAgIHRoaXMudGlsdEFuZ2xlID0gMDtcbiAgICB9XG59XG47XG5leHBvcnQgY2xhc3MgQ29uZmV0dGlFZmZlY3QgZXh0ZW5kcyBFZmZlY3Qge1xuICAgIHN0YXRpYyByZXNldFBhcnRpY2xlKHBhcnRpY2xlLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHBhcnRpY2xlLmNvbG9yID0gdGhpcy5fY29sb3JzWyhNYXRoLnJhbmRvbSgpICogdGhpcy5fY29sb3JzLmxlbmd0aCkgfCAwXTtcbiAgICAgICAgcGFydGljbGUueCA9IE1hdGgucmFuZG9tKCkgKiB3aWR0aDtcbiAgICAgICAgcGFydGljbGUueSA9IE1hdGgucmFuZG9tKCkgKiBoZWlnaHQgLSBoZWlnaHQ7XG4gICAgICAgIHBhcnRpY2xlLmRpYW1ldGVyID0gTWF0aC5yYW5kb20oKSAqIDEwICsgNTtcbiAgICAgICAgcGFydGljbGUudGlsdCA9IE1hdGgucmFuZG9tKCkgKiAxMCAtIDEwO1xuICAgICAgICBwYXJ0aWNsZS50aWx0QW5nbGVJbmNyZW1lbnQgPSBNYXRoLnJhbmRvbSgpICogMC4wNyArIDAuMDU7XG4gICAgICAgIHBhcnRpY2xlLnRpbHRBbmdsZSA9IDA7XG4gICAgICAgIHJldHVybiBwYXJ0aWNsZTtcbiAgICB9XG4gICAgc3RhdGljIF9zdGFydENvbmZldHRpSW5uZXIoKSB7XG4gICAgICAgIGxldCB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICBsZXQgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgICBsZXQgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICAgICAgY2FudmFzLnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY29uZmV0dGktY2FudmFzXCIpO1xuICAgICAgICBjYW52YXMuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgXCJkaXNwbGF5OmJsb2NrO3otaW5kZXg6OTk5OTk5O3BvaW50ZXItZXZlbnRzOm5vbmU7IHBvc2l0aW9uOmZpeGVkOyB0b3A6MDsgbGVmdDogMDtcIik7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2FudmFzKTtcbiAgICAgICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICAgICAgY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgIGxldCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgd2hpbGUgKHRoaXMucGFydGljbGVzLmxlbmd0aCA8IHRoaXMubWF4UGFydGljbGVDb3VudClcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnB1c2godGhpcy5yZXNldFBhcnRpY2xlKG5ldyBQYXJ0aWNsZSgpLCB3aWR0aCwgaGVpZ2h0KSk7XG4gICAgICAgIHRoaXMuc3RyZWFtaW5nQ29uZmV0dGkgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25UaW1lciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgcnVuQW5pbWF0aW9uID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcnRpY2xlcy5sZW5ndGggPT09IDApXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uVGltZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVBhcnRpY2xlcygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQYXJ0aWNsZXMoY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uVGltZXIgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJ1bkFuaW1hdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJ1bkFuaW1hdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBfc3RvcENvbmZldHRpSW5uZXIoKSB7XG4gICAgICAgIHRoaXMuc3RyZWFtaW5nQ29uZmV0dGkgPSBmYWxzZTtcbiAgICB9XG4gICAgc3RhdGljIGRyYXdQYXJ0aWNsZXMoY29udGV4dCkge1xuICAgICAgICBsZXQgcGFydGljbGU7XG4gICAgICAgIGxldCB4O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwYXJ0aWNsZSA9IHRoaXMucGFydGljbGVzW2ldO1xuICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGNvbnRleHQubGluZVdpZHRoID0gcGFydGljbGUuZGlhbWV0ZXI7XG4gICAgICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gcGFydGljbGUuY29sb3I7XG4gICAgICAgICAgICB4ID0gcGFydGljbGUueCArIHBhcnRpY2xlLnRpbHQ7XG4gICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyh4ICsgcGFydGljbGUuZGlhbWV0ZXIgLyAyLCBwYXJ0aWNsZS55KTtcbiAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHgsIHBhcnRpY2xlLnkgKyBwYXJ0aWNsZS50aWx0ICsgcGFydGljbGUuZGlhbWV0ZXIgLyAyKTtcbiAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIHVwZGF0ZVBhcnRpY2xlcygpIHtcbiAgICAgICAgbGV0IHdpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgIGxldCBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIGxldCBwYXJ0aWNsZTtcbiAgICAgICAgdGhpcy53YXZlQW5nbGUgKz0gMC4wMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcGFydGljbGUgPSB0aGlzLnBhcnRpY2xlc1tpXTtcbiAgICAgICAgICAgIGlmICghdGhpcy5zdHJlYW1pbmdDb25mZXR0aSAmJiBwYXJ0aWNsZS55IDwgLTE1KVxuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnkgPSBoZWlnaHQgKyAxMDA7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS50aWx0QW5nbGUgKz0gcGFydGljbGUudGlsdEFuZ2xlSW5jcmVtZW50O1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnggKz0gTWF0aC5zaW4odGhpcy53YXZlQW5nbGUpO1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnkgKz0gKE1hdGguY29zKHRoaXMud2F2ZUFuZ2xlKSArIHBhcnRpY2xlLmRpYW1ldGVyICsgdGhpcy5wYXJ0aWNsZVNwZWVkKSAqIDAuNTtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS50aWx0ID0gTWF0aC5zaW4ocGFydGljbGUudGlsdEFuZ2xlKSAqIDE1O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcnRpY2xlLnggPiB3aWR0aCArIDIwIHx8IHBhcnRpY2xlLnggPCAtMjAgfHwgcGFydGljbGUueSA+IGhlaWdodCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0cmVhbWluZ0NvbmZldHRpICYmIHRoaXMucGFydGljbGVzLmxlbmd0aCA8PSB0aGlzLm1heFBhcnRpY2xlQ291bnQpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXRQYXJ0aWNsZShwYXJ0aWNsZSwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGFydEVmZmVjdCh0YXJnZXQsIGNvbnRhaW5lcikge1xuICAgICAgICBDb25mZXR0aUVmZmVjdC5fc3RhcnRDb25mZXR0aUlubmVyKCk7XG4gICAgfVxuICAgIDtcbiAgICBzdG9wRWZmZWN0KCkge1xuICAgICAgICBDb25mZXR0aUVmZmVjdC5fc3RvcENvbmZldHRpSW5uZXIoKTtcbiAgICB9XG4gICAgO1xufVxuQ29uZmV0dGlFZmZlY3QuX2NvbG9ycyA9IFtcIkRvZGdlckJsdWVcIiwgXCJPbGl2ZURyYWJcIiwgXCJHb2xkXCIsIFwiUGlua1wiLCBcIlNsYXRlQmx1ZVwiLCBcIkxpZ2h0Qmx1ZVwiLCBcIlZpb2xldFwiLCBcIlBhbGVHcmVlblwiLCBcIlN0ZWVsQmx1ZVwiLCBcIlNhbmR5QnJvd25cIiwgXCJDaG9jb2xhdGVcIiwgXCJDcmltc29uXCJdO1xuQ29uZmV0dGlFZmZlY3Quc3RyZWFtaW5nQ29uZmV0dGkgPSBmYWxzZTtcbkNvbmZldHRpRWZmZWN0LmFuaW1hdGlvblRpbWVyID0gbnVsbDtcbkNvbmZldHRpRWZmZWN0LnBhcnRpY2xlcyA9IFtdO1xuQ29uZmV0dGlFZmZlY3Qud2F2ZUFuZ2xlID0gMDtcbi8vIGNvbmZldHRpIGNvbmZpZ1xuQ29uZmV0dGlFZmZlY3QubWF4UGFydGljbGVDb3VudCA9IDE1MDsgLy9zZXQgbWF4IGNvbmZldHRpIGNvdW50XG5Db25mZXR0aUVmZmVjdC5wYXJ0aWNsZVNwZWVkID0gMjsgLy9zZXQgdGhlIHBhcnRpY2xlIGFuaW1hdGlvbiBzcGVlZFxuIiwgImltcG9ydCB7IENvbmZldHRpRWZmZWN0IH0gZnJvbSBcIi4vZWZmZWN0cy1jb25mZXR0aVwiO1xuZXhwb3J0IGNsYXNzIEVmZmVjdHNNYW5hZ2VyIHtcbiAgICBzdGF0aWMgcmVnaXN0ZXJFZmZlY3QobmFtZSwgaW1wbGVtZW50YXRpb24pIHtcbiAgICAgICAgdGhpcy5lZmZlY3RzW25hbWVdID0gaW1wbGVtZW50YXRpb247XG4gICAgfVxuICAgIHN0YXRpYyBzdGFydEVmZmVjdChuYW1lLCB0YXJnZXQsIGNvbnRhaW5lcikge1xuICAgICAgICB0aGlzLmVmZmVjdHNbbmFtZV0uc3RhcnRFZmZlY3QodGFyZ2V0LCBjb250YWluZXIpO1xuICAgIH1cbiAgICBzdGF0aWMgc3RvcEVmZmVjdChuYW1lKSB7XG4gICAgICAgIHRoaXMuZWZmZWN0c1tuYW1lXS5zdG9wRWZmZWN0KCk7XG4gICAgfVxufVxuRWZmZWN0c01hbmFnZXIuZWZmZWN0cyA9IHt9O1xuaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAvLyBpbiBicm93c2VyXG4gICAgd2luZG93W1wiRWZmZWN0c01hbmFnZXJcIl0gPSBFZmZlY3RzTWFuYWdlcjtcbn1cbkVmZmVjdHNNYW5hZ2VyLnJlZ2lzdGVyRWZmZWN0KFwiY29uZmV0dGlcIiwgbmV3IENvbmZldHRpRWZmZWN0KTtcbiIsICIvL1xuLy8gdGhlIG9mZmljYWwgR0VNUyBBUEkgd3JhcHBlciAvIHRhZ1xuLy8gKGMpIDIwMjMrIEJheXplLmNvbVxuLy9cbmNvbnN0IFZFUlNJT04gPSBcIjAuMS43XCI7XG5pbXBvcnQgeyBTdHJpbmdzIH0gZnJvbSBcIi4vc3RyaW5nc1wiO1xuaW1wb3J0IHsgRWZmZWN0c01hbmFnZXIgfSBmcm9tIFwiLi9lZmZlY3RzLW1hbmFnZXJcIjtcbmNvbnN0IEdFTVNfc3RhdGUgPSB7fTtcbmV4cG9ydCBjbGFzcyBHRU1TIHtcbiAgICAvL1xuICAgIC8vIGhlbHBlcnNcbiAgICAvL1xuICAgIHN0YXRpYyBfZ2V0TG9jYWxUaW1lKCkge1xuICAgICAgICBjb25zdCBkYXRlRGF0YU9wdGlvbnMgPSB7XG4gICAgICAgICAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgICAgICAgICBtb250aDogJzItZGlnaXQnLFxuICAgICAgICAgICAgZGF5OiAnMi1kaWdpdCcsXG4gICAgICAgICAgICBob3VyOiAnMi1kaWdpdCcsXG4gICAgICAgICAgICBtaW51dGU6ICcyLWRpZ2l0JyxcbiAgICAgICAgICAgIHNlY29uZDogJzItZGlnaXQnLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB0aW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgY29uc3QgY3VycmVudERhdGVVSyA9IHRpbWUudG9Mb2NhbGVTdHJpbmcoJ2VuLVVLJywgZGF0ZURhdGFPcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnREYXRlVUs7XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBfd2FpdChtcykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIF93YWl0Rm9yTmV4dEV2ZW50KGVsZW1lbnQsIG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgKGUpID0+IHJlc29sdmUodHJ1ZSksIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vXG4gICAgLy8gZXhwb3NlZCBBUElcbiAgICAvL1xuICAgIHN0YXRpYyB2ZXJzaW9uKCkge1xuICAgICAgICByZXR1cm4gVkVSU0lPTjtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIGluaXQocGFyYW1zKSB7XG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0KCEhcGFyYW1zLmFwcElkLCBcInBhcmFtcy5hcHBJZCBzaG91bGQgbm90IGJlIGZhbHN5XCIpO1xuICAgICAgICBjb25zb2xlLmFzc2VydCghIXBhcmFtcy5hcGlLZXksIFwicGFyYW1zLmFwaUtleSBzaG91bGQgbm90IGJlIGZhbHN5XCIpO1xuICAgICAgICB0aGlzLnN0YXRlID0geyAuLi5wYXJhbXMgfTtcbiAgICAgICAgZGVsZXRlIHRoaXMuc3RhdGUuYXBpS2V5O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCFwYXJhbXMudXNlcklkICYmIHBhcmFtcy51c2VDb29raWUpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXMudXNlcklkID0gdGhpcy5fZ2V0Q29va2llKFwiZ2Vtcy11c2VyLWlkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHVybCA9IHRoaXMuX3Jvb3QgKyBcImluaXQvXCIgK1xuICAgICAgICAgICAgICAgIHBhcmFtcy5hcHBJZCArXG4gICAgICAgICAgICAgICAgKHBhcmFtcy51c2VySWQgPyBcIi9cIiArIHBhcmFtcy51c2VySWQgOiBcIlwiKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5mZXRjaCh1cmwsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6IHBhcmFtcy51c2VySWQgPyBcIkdFVFwiIDogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBhcGlrZXk6IHBhcmFtcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJmZXRjaDogcmVzdWx0OiBcIiArIEpTT04uc3RyaW5naWZ5KHJlc3VsdCkpO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS51c2VySWQgPSByZXN1bHQudXNlcl9pZDtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUudG9rZW4gPSByZXN1bHQudG9rZW47XG4gICAgICAgICAgICBpZiAocGFyYW1zLnVzZUNvb2tpZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldENvb2tpZShcImdlbXMtdXNlci1pZFwiLCB0aGlzLnN0YXRlLnVzZXJJZCwgMzY1KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXNlcklkOiB0aGlzLnN0YXRlLnVzZXJJZCxcbiAgICAgICAgICAgICAgICB0b2tlbjogdGhpcy5zdGF0ZS50b2tlbixcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiR0VNUyBBUEkgZXJyb3I6XCIpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgc2V0Q2xpZW50Q3JlZGVudGlhbHMoYXBwSWQsIHVzZXJJZCwgdG9rZW4pIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5hcHBJZCA9IGFwcElkO1xuICAgICAgICB0aGlzLnN0YXRlLnVzZXJJZCA9IHVzZXJJZDtcbiAgICAgICAgdGhpcy5zdGF0ZS50b2tlbiA9IHRva2VuO1xuICAgIH1cbiAgICBzdGF0aWMgYXN5bmMgZXZlbnQobmFtZSwgZGF0YSA9IHt9LCBvcHRpb25zID0geyBkaXNwbGF5Rmlyc3Q6IHRydWUgfSkge1xuICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICBjb25zdCBib2R5ID0ge1xuICAgICAgICAgICAgdXNlcl9pZDogdGhpcy5zdGF0ZS51c2VySWQsXG4gICAgICAgICAgICB0YWdOYW1lOiBuYW1lLFxuICAgICAgICAgICAgbG9jYWxUaW1lOiB0aGlzLl9nZXRMb2NhbFRpbWUoKSxcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIH07XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGggPT09IDEgJiYgKFwidmFsdWVcIiBpbiBkYXRhKSkge1xuICAgICAgICAgICAgZGVsZXRlIGJvZHlbXCJkYXRhXCJdO1xuICAgICAgICAgICAgYm9keVtcInZhbHVlXCJdID0gZGF0YS52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmZldGNoKHRoaXMuX3Jvb3QgKyBcImV2ZW50XCIsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJBdXRob3JpemF0aW9uXCI6IFwiQmVhcmVyIFwiICsgdGhpcy5zdGF0ZS50b2tlbixcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAvLyBzZW5kaW5nIGJvZHkgYXMgcGxhaW4gdGV4dCBkdWUgdG8gQVdTIENPUlMgcG9saWN5XG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiZmV0Y2g6IHJlc3VsdDogXCIgKyBKU09OLnN0cmluZ2lmeShyZXN1bHQpKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZGlzcGxheUFsbCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBhIG9mIHJlc3VsdC5hY2hpZXZlbWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZGlzcGxheUFjaGlldmVtZW50KGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuZGlzcGxheUZpcnN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuYWNoaWV2ZW1lbnRzICYmIHJlc3VsdC5hY2hpZXZlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5kaXNwbGF5QWNoaWV2ZW1lbnQocmVzdWx0LmFjaGlldmVtZW50c1swXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LmFjaGlldmVtZW50cztcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJHRU1TIEFQSSBlcnJvcjpcIik7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIDtcbiAgICBzdGF0aWMgYXN5bmMgZGlzcGxheUFjaGlldmVtZW50KGFjaGlldmVtZW50LCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgLy8gc2NyaW1cbiAgICAgICAgY29uc3Qgc2NyaW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzY3JpbS5jbGFzc05hbWUgPSBcIkdFTVMtc2NyaW1cIjtcbiAgICAgICAgb3B0aW9ucy5jb250YWluZXIgPz8gKG9wdGlvbnMuY29udGFpbmVyID0gZG9jdW1lbnQuYm9keSk7XG4gICAgICAgIG9wdGlvbnMuY29udGFpbmVyLmFwcGVuZENoaWxkKHNjcmltKTtcbiAgICAgICAgLy8gZnJhbWVcbiAgICAgICAgY29uc3QgZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBmcmFtZS5jbGFzc05hbWUgPSBcIkdFTVMtYWNoaWV2ZW1lbnQtZnJhbWVcIjtcbiAgICAgICAgLy8gY29udGVudFxuICAgICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoMlwiKTtcbiAgICAgICAgdGl0bGUuY2xhc3NOYW1lID0gXCJHRU1TLWFjaGlldmVtZW50LXRpdGxlXCI7XG4gICAgICAgIHRpdGxlLmlubmVyVGV4dCA9IGFjaGlldmVtZW50LnRpdGxlO1xuICAgICAgICBjb25zdCBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgICAgIGltYWdlLmNsYXNzTmFtZSA9IFwiR0VNUy1hY2hpZXZlbWVudC1pbWFnZVwiO1xuICAgICAgICBpbWFnZS5zcmMgPSBhY2hpZXZlbWVudC5pbWFnZTtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaDNcIik7XG4gICAgICAgIGRlc2NyaXB0aW9uLmNsYXNzTmFtZSA9IFwiR0VNUy1hY2hpZXZlbWVudC1kZXNjcmlwdGlvblwiO1xuICAgICAgICBkZXNjcmlwdGlvbi5pbm5lclRleHQgPSBhY2hpZXZlbWVudC5kZXNjcmlwdGlvbjtcbiAgICAgICAgZnJhbWUuYXBwZW5kQ2hpbGQodGl0bGUpO1xuICAgICAgICBmcmFtZS5hcHBlbmRDaGlsZChpbWFnZSk7XG4gICAgICAgIGZyYW1lLmFwcGVuZENoaWxkKGRlc2NyaXB0aW9uKTtcbiAgICAgICAgc2NyaW0uYXBwZW5kQ2hpbGQoZnJhbWUpO1xuICAgICAgICBjb25zdCB0aW1lclByb21pc2UgPSB0aGlzLl93YWl0KDMwMDApO1xuICAgICAgICBjb25zdCBjbGlja1Byb21pc2UgPSB0aGlzLl93YWl0Rm9yTmV4dEV2ZW50KHNjcmltLCBcImNsaWNrXCIpO1xuICAgICAgICAvLyBzdGFydCBlZmZlY3RzXG4gICAgICAgIG9wdGlvbnMuZWZmZWN0cyA/PyAob3B0aW9ucy5lZmZlY3RzID0gW1wiY29uZmV0dGlcIl0pO1xuICAgICAgICBmb3IgKGNvbnN0IGVmZmVjdCBvZiBvcHRpb25zLmVmZmVjdHMpIHtcbiAgICAgICAgICAgIEVmZmVjdHNNYW5hZ2VyLnN0YXJ0RWZmZWN0KGVmZmVjdCwgb3B0aW9ucy5jZW50ZXJPbiwgb3B0aW9ucy5jb250YWluZXIpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHdhaXRcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5yYWNlKFt0aW1lclByb21pc2UsIGNsaWNrUHJvbWlzZV0pO1xuICAgICAgICAvLyBzdG9wIGVmZmVjdHNcbiAgICAgICAgZm9yIChjb25zdCBlZmZlY3Qgb2Ygb3B0aW9ucy5lZmZlY3RzKSB7XG4gICAgICAgICAgICBFZmZlY3RzTWFuYWdlci5zdG9wRWZmZWN0KGVmZmVjdCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY2xlYW51cFxuICAgICAgICBzY3JpbS5yZW1vdmUoKTtcbiAgICB9XG4gICAgLy9cbiAgICAvLyBfX19fX19fX0JBREdFU19fX19fX1xuICAgIC8vXG4gICAgc3RhdGljIGFzeW5jIGdldEFsbEJhZGdlcygpIHtcbiAgICAgICAgbGV0IHJlc3VsdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICghR0VNU19zdGF0ZS50b2tlbikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImdldEFsbEJhZGdlczogVG9rZW4gaXMgbWlzc2luZ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5mZXRjaCh0aGlzLl9yb290ICsgXCJiYWRnZXNcIiwge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHtHRU1TX3N0YXRlLnRva2VufWAsXG4gICAgICAgICAgICAgICAgICAgIEFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZ2V0QWxsQmFkZ2VzOiBIVFRQIGVycm9yOiBTdGF0dXM6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgcmVzdWx0ID8/IChyZXN1bHQgPSBbXSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkdFTVMgQVBJIGVycm9yOiBcIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICA7XG4gICAgc3RhdGljIGFzeW5jIGRpc3BsYXlCYWRnZXMoYmFkZ2VzLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgLy8gc2NyaW1cbiAgICAgICAgY29uc3Qgc2NyaW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzY3JpbS5jbGFzc05hbWUgPSBvcHRpb25zLnNjcmltQ2xhc3NOYW1lIHx8IFwiR0VNUy1iYWRnZXMtc2NyaW1cIjtcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQob3B0aW9ucy5jb250YWluZXJJZCB8fCBcIkdFTVMtYmFkZ2VzLWNvbnRhaW5lclwiKSB8fFxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHNjcmltKTtcbiAgICAgICAgLy8gZnJhbWVcbiAgICAgICAgY29uc3QgZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBmcmFtZS5jbGFzc05hbWUgPSBvcHRpb25zLmZyYW1lQ2xhc3NOYW1lIHx8IFwiR0VNUy1iYWRnZXMtZnJhbWVcIjtcbiAgICAgICAgLy9kaXNwbGF5IG1lc3NhZ2UgaWYgbm8gYmFkZ2VzIHdlcmUgZmV0Y2hlZFxuICAgICAgICBpZiAoYmFkZ2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoMlwiKTtcbiAgICAgICAgICAgIG1lc3NhZ2UuaW5uZXJUZXh0ID0gU3RyaW5ncy5OT19CQURHRVM7XG4gICAgICAgICAgICBmcmFtZS5hcHBlbmRDaGlsZChtZXNzYWdlKTtcbiAgICAgICAgICAgIHNjcmltLmFwcGVuZENoaWxkKGZyYW1lKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBjb250ZW50XG4gICAgICAgIGJhZGdlcy5mb3JFYWNoKChiYWRnZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW1hZ2VDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgaW1hZ2VDb250YWluZXIuY2xhc3NOYW1lID0gXCJHRU1TLWJhZGdlLWltYWdlQ29udGFpbmVyXCI7XG4gICAgICAgICAgICBjb25zdCBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgICAgICAgICBpbWFnZS5jbGFzc05hbWUgPSBcIkdFTVMtYmFkZ2UtaW1hZ2VcIjtcbiAgICAgICAgICAgIGltYWdlLnNyYyA9IGJhZGdlLmltYWdlO1xuICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaDJcIik7XG4gICAgICAgICAgICB0aXRsZS5jbGFzc05hbWUgPSBcIkdFTVMtYmFkZ2UtdGl0bGVcIjtcbiAgICAgICAgICAgIHRpdGxlLmlubmVyVGV4dCA9IGJhZGdlLm5hbWU7XG4gICAgICAgICAgICAvL2JhZGdlIHVubG9ja2VkIHlldCAtPiBncmV5ZWQtb3V0XG4gICAgICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoM1wiKTtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLmNsYXNzTmFtZSA9IFwiR0VNUy1iYWRnZS1kZXNjcmlwdGlvblwiO1xuICAgICAgICAgICAgZGVzY3JpcHRpb24uaW5uZXJUZXh0ID0gYmFkZ2UuZGVzY3JpcHRpb247XG4gICAgICAgICAgICBpbWFnZUNvbnRhaW5lci5hcHBlbmRDaGlsZChpbWFnZSk7XG4gICAgICAgICAgICBpbWFnZUNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aXRsZSk7XG4gICAgICAgICAgICBpZiAoYmFkZ2UudW5sb2NrZWREYXRlID09PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgaW1hZ2VDb250YWluZXIuY2xhc3NMaXN0LmFkZChcIkdFTVMtYmFkZ2UtaW1hZ2UtLXVuZWFybmVkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaW1hZ2VDb250YWluZXIuYXBwZW5kQ2hpbGQoZGVzY3JpcHRpb24pO1xuICAgICAgICAgICAgZnJhbWUuYXBwZW5kQ2hpbGQoaW1hZ2VDb250YWluZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgc2NyaW0uYXBwZW5kQ2hpbGQoZnJhbWUpO1xuICAgIH1cbiAgICA7XG4gICAgc3RhdGljIGFzeW5jIGRpc3BsYXlBbGxCYWRnZXMoKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZ2V0QWxsQmFkZ2VzKCk7XG4gICAgICAgIHRoaXMuZGlzcGxheUJhZGdlcyhyZXN1bHQpO1xuICAgIH1cbiAgICA7XG4gICAgLy8gYWx0ZXJuYXRlIGZldGNoIHRvIGFjY291bnQgZm9yIHBvc3NpYmxlIG5vZGUgPDE4XG4gICAgc3RhdGljIGFzeW5jIGZldGNoKHVybCwgaW5pdCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImZldGNoOiBcIiArIGluaXQubWV0aG9kICsgXCI6IFwiICsgdXJsKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCIgICAgaGVhZGVyczogXCIgKyBKU09OLnN0cmluZ2lmeShpbml0LmhlYWRlcnMpKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCIgICAgYm9keSAgIDogXCIgKyBKU09OLnN0cmluZ2lmeShpbml0LmJvZHkpKTtcbiAgICAgICAgbGV0IHJlc3BvbnNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IGZldGNoKHVybCwgaW5pdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmID0gdGhpcy5zdGF0ZS5mZXRjaCA/PyBnbG9iYWxUaGlzLmZldGNoO1xuICAgICAgICAgICAgICAgIGlmICghZikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJwbGF0Zm9ybSBpcyBsYWNraW5nIGFjY2VzcyB0byBmZXRjaCBmdW5jdGlvblwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBmKHVybCwgaW5pdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZldGNoOiBlcnJvciByZXNwb25zZTogXCIgKyBlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfVxuICAgIC8vIGNvb2tpZXNcbiAgICBzdGF0aWMgX3NldENvb2tpZShjbmFtZSwgY3ZhbHVlLCBleGRheXMpIHtcbiAgICAgICAgY29uc3QgZCA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGQuc2V0VGltZShkLmdldFRpbWUoKSArIChleGRheXMgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XG4gICAgICAgIGxldCBleHBpcmVzID0gXCJleHBpcmVzPVwiICsgZC50b1VUQ1N0cmluZygpO1xuICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjbmFtZSArIFwiPVwiICsgY3ZhbHVlICsgXCI7XCIgKyBleHBpcmVzICsgXCI7cGF0aD0vXCI7XG4gICAgfVxuICAgIHN0YXRpYyBfZ2V0Q29va2llKGNuYW1lKSB7XG4gICAgICAgIGxldCBuYW1lID0gY25hbWUgKyBcIj1cIjtcbiAgICAgICAgbGV0IGNhID0gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7Jyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2EubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBjID0gY2FbaV07XG4gICAgICAgICAgICB3aGlsZSAoYy5jaGFyQXQoMCkgPT0gJyAnKSB7XG4gICAgICAgICAgICAgICAgYyA9IGMuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGMuaW5kZXhPZihuYW1lKSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGMuc3Vic3RyaW5nKG5hbWUubGVuZ3RoLCBjLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxufVxuR0VNUy5fcm9vdCA9IFwiaHR0cHM6Ly9nZW1zYXBpLmJheXouYWkvdXNlci9cIjtcbkdFTVMuc3RhdGUgPSB7fTtcbmZ1bmN0aW9uIF9jcmVhdGVTdHlsZSgpIHtcbiAgICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgICBjb25zdCBjc3MgPSBgXG4gICAgLkdFTVMtc2NyaW0ge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICB0b3A6IDA7XG4gICAgICAgIGxlZnQ6IDA7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgfVxuICAgIFxuICAgIC5HRU1TLWFjaGlldmVtZW50LWZyYW1lIHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDVweDtcbiAgICAgICAgYm94LXNoYWRvdzogJzRweCA4cHggMzZweCAjRjRBQUI5JztcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gICAgICAgIHdpZHRoOjYwMHB4O1xuICAgICAgICBoZWlnaHQ6IDQwMHB4O1xuICAgICAgICBmb250LWZhbWlseTogQXJpYWwsIEhlbHZldGljYSwgc2Fucy1zZXJpZjtcbiAgICB9XG4gICAgXG4gICAgLkdFTVMtYWNoaWV2ZW1lbnQtdGl0bGUge1xuICAgICAgICBtYXJnaW46IDEwcHg7XG4gICAgfVxuICAgIFxuICAgIC5HRU1TLWFjaGlldmVtZW50LWltYWdlIHtcbiAgICAgICAgd2lkdGg6IDEwMDtcbiAgICAgICAgaGVpZ2h0OiAxMDA7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDVweDtcbiAgICAgICAgYm94LXNoYWRvdzogJzRweCA4cHggMzZweCAjRjRBQUI5JztcbiAgICB9XG4gICAgXG4gICAgLkdFTVMtYWNoaWV2ZW1lbnQtZGVzY3JpcHRpb24ge1xuICAgICAgICBtYXJnaW46IDEwcHg7XG4gICAgfVxuXG4gICAgLkdFTVMtYmFkZ2VzLXNjcmltIHtcbiAgICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICAgaGVpZ2h0OiBmaXQtY29udGVudDtcbiAgICAgICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XG4gICAgICAgICBmbGV4LXdyYXA6IHdyYXA7XG4gICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgICBwYWRkaW5nOiAyMHB4IDEwcHggO1xuICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gICAgICAgICBib3JkZXItcmFkaXVzOiA3cHg7XG4gICAgICAgICBib3gtc2hhZG93OiByZ2JhKDUwLCA1MCwgOTMsIDAuMjUpIDBweCA1MHB4IDEwMHB4IC0yMHB4LCByZ2JhKDAsIDAsIDAsIDAuMykgMHB4IDMwcHggNjBweCAtMzBweDtcbiAgICB9XG5cbiAgICAuR0VNUy1iYWRnZXMtZnJhbWUge1xuICAgICAgICB3aWR0aDogZml0LWNvbnRlbnQ7XG4gICAgICAgIG1hcmdpbi1ib3R0b206IDVweDtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC13cmFwOiB3cmFwO1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHN0YXJ0O1xuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xuICAgICAgICBib3JkZXItcmFkaXVzOiA1cHg7XG4gICAgICAgIGZvbnQtZmFtaWx5OiBBcmlhbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmO1xuICAgIH1cblxuICAgIC5HRU1TLWJhZGdlLWltYWdlQ29udGFpbmVyIHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgIHdpZHRoOiA5MHB4O1xuICAgICAgICBtYXJnaW4tYm90dG9tOiA1cHg7XG4gICAgfVxuXG4gICAgLkdFTVMtYmFkZ2UtaW1hZ2Uge1xuICAgICAgICB3aWR0aDogNTBweDtcbiAgICAgICAgaGVpZ2h0OiBhdXRvO1xuICAgIH1cblxuICAgIC5HRU1TLWJhZGdlLWltYWdlOmhvdmVyIHtcbiAgICAgICAgc2NhbGU6IDEwNSU7XG4gICAgfVxuXG5cbiAgICAuR0VNUy1iYWRnZS10aXRsZSB7XG4gICAgICAgIGZvbnQtc2l6ZTogLjRyZW07XG4gICAgICAgIGNvbG9yOiByZ2IoOTEsIDkwLCA5MCk7XG4gICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gICAgfVxuXG4gICAgLkdFTVMtYmFkZ2UtZGVzY3JpcHRpb24ge1xuICAgICAgICBmb250LXNpemU6IC40cmVtO1xuICAgICAgICBvcGFjaXR5OiA2MCU7XG4gICAgICAgIG1heC13aWR0aDogNTAlO1xuICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgfVxuXG4gICAgLkdFTVMtYmFkZ2UtaW1hZ2UtLXVuZWFybmVkIHtcbiAgICAgICAgb3BhY2l0eTogMC41O1xuICAgICAgICBmaWx0ZXI6IGdyYXlzY2FsZSg4MCUpO1xuICAgIH1cblxuICAgIC5HRU1TLWJhZGdlLWltYWdlLS11bmVhcm5lZDpob3ZlciB7XG4gICAgICAgIG9wYWNpdHk6IDAuNztcblxuICAgIH1cbiAgICBgO1xuICAgIHN0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAvLyBpbiBicm93c2VyXG4gICAgX2NyZWF0ZVN0eWxlKCk7XG4gICAgd2luZG93W1wiR0VNU1wiXSA9IEdFTVM7XG59XG4iLCAiaW1wb3J0IHtHRU1TfSBmcm9tIFwiYmF5emUtZ2Vtcy1hcGlcIjtcblxuLy8gZ2FtZSBlbGVtZW50cyAgIFxuY29uc3Qgc2NvcmVTcGFuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzY29yZVwiKSEgYXMgSFRNTFNwYW5FbGVtZW50O1xuY29uc3Qgc3RhcnRCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0XCIpISBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbmNvbnN0IHBsYXlCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXlcIikhIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuY29uc3Qgc2NvcmVCb3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Njb3JlYm94XCIpISBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbmNvbnN0IGZpbmlzaEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZmluaXNoXCIpISBhcyBIVE1MQnV0dG9uRWxlbWVudDtcblxuc3RhcnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHN0YXJ0KTtcbnBsYXlCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHNjb3JlKTtcbmZpbmlzaEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZmluaXNoKTtcblxuLy8gaW5pdCBhbmQgZmlyc3QgZXZlbnRcbmNvbnN0IGFwaUtleSA9IFwiaTJzbHVsTilVJTd4dk1vVkFDTFNFWW9nT2VrTlFvV0VcIjtcbmNvbnN0IGFwcElkID0gXCIzNzY3NWFjOC1jMGMwLTQyZTktODI5MS0wZjk1MjlkZjVkNDdcIjtcbkdFTVMuaW5pdCh7YXBpS2V5OmFwaUtleSwgYXBwSWQ6YXBwSWR9KS50aGVuKCgpPT57XG4gICAgR0VNUy5ldmVudChcIkRlbW8tR2FtZVBhZ2VcIik7XG4gICAgc3RhcnRCdXR0b24hLmRpc2FibGVkID0gZmFsc2U7XG59KTtcblxuZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgR0VNUy5ldmVudChcIkRlbW8tR2FtZVN0YXJ0ZWRcIik7XG4gICAgc2NvcmVTcGFuLmlubmVyVGV4dCA9IFwiMFwiO1xuICAgIHBsYXlCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBzY29yZUJveC5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIHN0YXJ0QnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gc2NvcmUoKSB7XG4gICAgbGV0IG4gPSBOdW1iZXIoc2NvcmVTcGFuLmlubmVyVGV4dCk7XG4gICAgbGV0IG5OZXcgPSBOdW1iZXIoc2NvcmVCb3gudmFsdWUpO1xuICAgIGlmIChpc05hTihuTmV3KSl7XG4gICAgICAgIG5OZXcgPSAwO1xuICAgIH1cbiAgICBuICs9IG5OZXc7XG4gICAgc2NvcmVTcGFuLmlubmVyVGV4dCA9IFN0cmluZyhuKTtcbiAgICBmaW5pc2hCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gZmluaXNoKCkge1xuICAgIEdFTVMuZXZlbnQoXCJEZW1vLUdhbWVGaW5pc2hlZFwiLCB7dmFsdWU6TnVtYmVyKHNjb3JlU3Bhbi5pbm5lclRleHQpfSk7XG4gICAgcGxheUJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgc2NvcmVCb3guZGlzYWJsZWQgPSB0cnVlO1xuICAgIGZpbmlzaEJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgc3RhcnRCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbn1cbiJdLAogICJt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
