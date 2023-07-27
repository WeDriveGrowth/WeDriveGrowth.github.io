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

  // node_modules/bayz-gems-api/dist/esm/gems.js
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
    static async init(params) {
      console.assert(params.appId);
      console.assert(params.apiKey);
      this.state = __spreadValues({}, params);
      delete this.state.apiKey;
      try {
        if (!params.userId && params.useCookie) {
          this.state.userId = this._getCookie("gems-user-id");
        }
        let url = this._root + "user/" + params.appId + (params.userId ? "/" + params.userId : "");
        const response = await this.fetch(url, {
          method: "POST",
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
      try {
        const response = await this.fetch(this._root + "tag/" + this.state.appId, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + this.state.token,
            "Accept": "application/json"
          },
          body: {
            user_id: this.state.userId,
            tagName: name,
            localTime: this._getLocalTime(),
            data
          }
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
        return result;
      } catch (error) {
        console.error("GEMS API error:");
        console.error(error);
        return null;
      }
    }
    static async displayAchievement(achievement) {
      const scrim = document.createElement("div");
      scrim.className = "GEMS-scrim";
      document.body.appendChild(scrim);
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
      this._startConfettiInner();
      setTimeout(() => this._stopConfettiInner(), 3e3);
      await this._waitForNextEvent(scrim, "click");
      this._stopConfettiInner();
      scrim.remove();
    }
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
    static fetch(url, init) {
      console.log("fetch: " + init.method + ": " + url);
      console.log("    headers: " + JSON.stringify(init.headers));
      console.log("    body   : " + JSON.stringify(init.body));
      if (typeof window !== "undefined") {
        return fetch(url, init);
      }
      const p = new Promise((resolve, reject) => {
        var _a;
        const xhr = new XMLHttpRequest();
        let method = (_a = init.method) != null ? _a : "GET";
        for (const headerKey in init.headers) {
          const headerValue = init.headers[headerKey];
          xhr.setRequestHeader(headerKey, headerValue);
        }
        const formData = new FormData();
        for (const itemKey in init.body) {
          const item = init.body[itemKey];
          formData.append(itemKey, item);
        }
        xhr.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            console.log("fetch: response: " + JSON.stringify(this.response));
            resolve(this.response);
          } else if (this.readyState == 4 && this.status !== 200) {
            console.log("fetch: error response");
            console.log(this);
            reject(this);
          }
        };
        xhr.open(method, url, true);
        xhr.send(formData);
      });
      return p;
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
  GEMS._root = "https://gemsapi.bayz.ai/api/";
  GEMS.state = {};
  GEMS._colors = ["DodgerBlue", "OliveDrab", "Gold", "Pink", "SlateBlue", "LightBlue", "Violet", "PaleGreen", "SteelBlue", "SandyBrown", "Chocolate", "Crimson"];
  GEMS.streamingConfetti = false;
  GEMS.animationTimer = null;
  GEMS.particles = [];
  GEMS.waveAngle = 0;
  GEMS.maxParticleCount = 150;
  GEMS.particleSpeed = 2;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZV9tb2R1bGVzL2JheXotZ2Vtcy1hcGkvZGlzdC9lc20vZ2Vtcy5qcyIsICJpbmRleC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy9cbi8vIHRoZSBvZmZpY2FsIEdFTVMgQVBJIHdyYXBwZXIgLyB0YWdcbi8vIChjKSAyMDIzKyBXZURyaXZlR3Jvd3RoXG4vL1xuLy8gdmVyc2lvbjogMC4xLjBcbi8vXG4vLyBjcmVkaXRzOlxuLy8gY29uZmV0dGkgYnkgbWF0aHVzdW1tdXQsIE1JVCBsaWNlbnNlOiBodHRwczovL3d3dy5jc3NzY3JpcHQuY29tL2NvbmZldHRpLWZhbGxpbmctYW5pbWF0aW9uL1xuO1xuY2xhc3MgUGFydGljbGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNvbG9yID0gXCJcIjtcbiAgICAgICAgdGhpcy54ID0gMDtcbiAgICAgICAgdGhpcy55ID0gMDtcbiAgICAgICAgdGhpcy5kaWFtZXRlciA9IDA7XG4gICAgICAgIHRoaXMudGlsdCA9IDA7XG4gICAgICAgIHRoaXMudGlsdEFuZ2xlSW5jcmVtZW50ID0gMDtcbiAgICAgICAgdGhpcy50aWx0QW5nbGUgPSAwO1xuICAgIH1cbn1cbjtcbmV4cG9ydCBjbGFzcyBHRU1TIHtcbiAgICAvL1xuICAgIC8vIGhlbHBlcnNcbiAgICAvL1xuICAgIHN0YXRpYyBfZ2V0TG9jYWxUaW1lKCkge1xuICAgICAgICBjb25zdCBkYXRlRGF0YU9wdGlvbnMgPSB7XG4gICAgICAgICAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgICAgICAgICBtb250aDogJzItZGlnaXQnLFxuICAgICAgICAgICAgZGF5OiAnMi1kaWdpdCcsXG4gICAgICAgICAgICBob3VyOiAnMi1kaWdpdCcsXG4gICAgICAgICAgICBtaW51dGU6ICcyLWRpZ2l0JyxcbiAgICAgICAgICAgIHNlY29uZDogJzItZGlnaXQnLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB0aW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgY29uc3QgY3VycmVudERhdGVVSyA9IHRpbWUudG9Mb2NhbGVTdHJpbmcoJ2VuLVVLJywgZGF0ZURhdGFPcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnREYXRlVUs7XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBfd2FpdChtcykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIF93YWl0Rm9yTmV4dEV2ZW50KGVsZW1lbnQsIG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgKGUpID0+IHJlc29sdmUodHJ1ZSksIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vXG4gICAgLy8gZXhwb3NlZCBBUElcbiAgICAvL1xuICAgIHN0YXRpYyBhc3luYyBpbml0KHBhcmFtcykge1xuICAgICAgICBjb25zb2xlLmFzc2VydChwYXJhbXMuYXBwSWQpO1xuICAgICAgICBjb25zb2xlLmFzc2VydChwYXJhbXMuYXBpS2V5KTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHsgLi4ucGFyYW1zIH07XG4gICAgICAgIGRlbGV0ZSB0aGlzLnN0YXRlLmFwaUtleTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICghcGFyYW1zLnVzZXJJZCAmJiBwYXJhbXMudXNlQ29va2llKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS51c2VySWQgPSB0aGlzLl9nZXRDb29raWUoXCJnZW1zLXVzZXItaWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgdXJsID0gdGhpcy5fcm9vdCArIFwidXNlci9cIiArXG4gICAgICAgICAgICAgICAgcGFyYW1zLmFwcElkICtcbiAgICAgICAgICAgICAgICAocGFyYW1zLnVzZXJJZCA/IFwiL1wiICsgcGFyYW1zLnVzZXJJZCA6IFwiXCIpO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmZldGNoKHVybCwge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBhcGlrZXk6IHBhcmFtcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS51c2VySWQgPSByZXN1bHQudXNlcl9pZDtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUudG9rZW4gPSByZXN1bHQudG9rZW47XG4gICAgICAgICAgICBpZiAocGFyYW1zLnVzZUNvb2tpZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldENvb2tpZShcImdlbXMtdXNlci1pZFwiLCB0aGlzLnN0YXRlLnVzZXJJZCwgMzY1KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXNlcklkOiB0aGlzLnN0YXRlLnVzZXJJZCxcbiAgICAgICAgICAgICAgICB0b2tlbjogdGhpcy5zdGF0ZS50b2tlbixcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiR0VNUyBBUEkgZXJyb3I6XCIpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgc2V0Q2xpZW50Q3JlZGVudGlhbHMoYXBwSWQsIHVzZXJJZCwgdG9rZW4pIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5hcHBJZCA9IGFwcElkO1xuICAgICAgICB0aGlzLnN0YXRlLnVzZXJJZCA9IHVzZXJJZDtcbiAgICAgICAgdGhpcy5zdGF0ZS50b2tlbiA9IHRva2VuO1xuICAgIH1cbiAgICBzdGF0aWMgYXN5bmMgZXZlbnQobmFtZSwgZGF0YSA9IHt9LCBvcHRpb25zID0geyBkaXNwbGF5Rmlyc3Q6IHRydWUgfSkge1xuICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmZldGNoKHRoaXMuX3Jvb3QgKyBcInRhZy9cIiArIHRoaXMuc3RhdGUuYXBwSWQsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBcIkJlYXJlciBcIiArIHRoaXMuc3RhdGUudG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIFwiQWNjZXB0XCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiB0aGlzLnN0YXRlLnVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgdGFnTmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxUaW1lOiB0aGlzLl9nZXRMb2NhbFRpbWUoKSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXN1bHQgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmRpc3BsYXlBbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYSBvZiByZXN1bHQuYWNoaWV2ZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmRpc3BsYXlBY2hpZXZlbWVudChhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvcHRpb25zLmRpc3BsYXlGaXJzdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmFjaGlldmVtZW50cyAmJiByZXN1bHQuYWNoaWV2ZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZGlzcGxheUFjaGlldmVtZW50KHJlc3VsdC5hY2hpZXZlbWVudHNbMF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJHRU1TIEFQSSBlcnJvcjpcIik7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIDtcbiAgICBzdGF0aWMgYXN5bmMgZGlzcGxheUFjaGlldmVtZW50KGFjaGlldmVtZW50KSB7XG4gICAgICAgIC8vIHNjcmltXG4gICAgICAgIGNvbnN0IHNjcmltID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgc2NyaW0uY2xhc3NOYW1lID0gXCJHRU1TLXNjcmltXCI7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaW0pO1xuICAgICAgICAvLyBmcmFtZVxuICAgICAgICBjb25zdCBmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGZyYW1lLmNsYXNzTmFtZSA9IFwiR0VNUy1hY2hpZXZlbWVudC1mcmFtZVwiO1xuICAgICAgICAvLyBjb250ZW50XG4gICAgICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImgyXCIpO1xuICAgICAgICB0aXRsZS5jbGFzc05hbWUgPSBcIkdFTVMtYWNoaWV2ZW1lbnQtdGl0bGVcIjtcbiAgICAgICAgdGl0bGUuaW5uZXJUZXh0ID0gYWNoaWV2ZW1lbnQudGl0bGU7XG4gICAgICAgIGNvbnN0IGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICAgICAgaW1hZ2UuY2xhc3NOYW1lID0gXCJHRU1TLWFjaGlldmVtZW50LWltYWdlXCI7XG4gICAgICAgIGltYWdlLnNyYyA9IGFjaGlldmVtZW50LmltYWdlO1xuICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoM1wiKTtcbiAgICAgICAgZGVzY3JpcHRpb24uY2xhc3NOYW1lID0gXCJHRU1TLWFjaGlldmVtZW50LWRlc2NyaXB0aW9uXCI7XG4gICAgICAgIGRlc2NyaXB0aW9uLmlubmVyVGV4dCA9IGFjaGlldmVtZW50LmRlc2NyaXB0aW9uO1xuICAgICAgICBmcmFtZS5hcHBlbmRDaGlsZCh0aXRsZSk7XG4gICAgICAgIGZyYW1lLmFwcGVuZENoaWxkKGltYWdlKTtcbiAgICAgICAgZnJhbWUuYXBwZW5kQ2hpbGQoZGVzY3JpcHRpb24pO1xuICAgICAgICBzY3JpbS5hcHBlbmRDaGlsZChmcmFtZSk7XG4gICAgICAgIHRoaXMuX3N0YXJ0Q29uZmV0dGlJbm5lcigpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuX3N0b3BDb25mZXR0aUlubmVyKCksIDMwMDApO1xuICAgICAgICAvLyB3YWl0IGZvciBjbGljayBvdXRzaWRlIGZyYW1lXG4gICAgICAgIGF3YWl0IHRoaXMuX3dhaXRGb3JOZXh0RXZlbnQoc2NyaW0sIFwiY2xpY2tcIik7XG4gICAgICAgIHRoaXMuX3N0b3BDb25mZXR0aUlubmVyKCk7XG4gICAgICAgIC8vIGNsZWFudXBcbiAgICAgICAgc2NyaW0ucmVtb3ZlKCk7XG4gICAgfVxuICAgIDtcbiAgICBzdGF0aWMgcmVzZXRQYXJ0aWNsZShwYXJ0aWNsZSwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgICBwYXJ0aWNsZS5jb2xvciA9IHRoaXMuX2NvbG9yc1soTWF0aC5yYW5kb20oKSAqIHRoaXMuX2NvbG9ycy5sZW5ndGgpIHwgMF07XG4gICAgICAgIHBhcnRpY2xlLnggPSBNYXRoLnJhbmRvbSgpICogd2lkdGg7XG4gICAgICAgIHBhcnRpY2xlLnkgPSBNYXRoLnJhbmRvbSgpICogaGVpZ2h0IC0gaGVpZ2h0O1xuICAgICAgICBwYXJ0aWNsZS5kaWFtZXRlciA9IE1hdGgucmFuZG9tKCkgKiAxMCArIDU7XG4gICAgICAgIHBhcnRpY2xlLnRpbHQgPSBNYXRoLnJhbmRvbSgpICogMTAgLSAxMDtcbiAgICAgICAgcGFydGljbGUudGlsdEFuZ2xlSW5jcmVtZW50ID0gTWF0aC5yYW5kb20oKSAqIDAuMDcgKyAwLjA1O1xuICAgICAgICBwYXJ0aWNsZS50aWx0QW5nbGUgPSAwO1xuICAgICAgICByZXR1cm4gcGFydGljbGU7XG4gICAgfVxuICAgIHN0YXRpYyBfc3RhcnRDb25mZXR0aUlubmVyKCkge1xuICAgICAgICBsZXQgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgbGV0IGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG4gICAgICAgIGNhbnZhcy5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNvbmZldHRpLWNhbnZhc1wiKTtcbiAgICAgICAgY2FudmFzLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIFwiZGlzcGxheTpibG9jazt6LWluZGV4Ojk5OTk5OTtwb2ludGVyLWV2ZW50czpub25lOyBwb3NpdGlvbjpmaXhlZDsgdG9wOjA7IGxlZnQ6IDA7XCIpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIH0sIHRydWUpO1xuICAgICAgICBsZXQgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgIHdoaWxlICh0aGlzLnBhcnRpY2xlcy5sZW5ndGggPCB0aGlzLm1heFBhcnRpY2xlQ291bnQpXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5wdXNoKHRoaXMucmVzZXRQYXJ0aWNsZShuZXcgUGFydGljbGUoKSwgd2lkdGgsIGhlaWdodCkpO1xuICAgICAgICB0aGlzLnN0cmVhbWluZ0NvbmZldHRpID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uVGltZXIgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHJ1bkFuaW1hdGlvbiA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJ0aWNsZXMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvblRpbWVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQYXJ0aWNsZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGFydGljbGVzKGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvblRpbWVyID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShydW5BbmltYXRpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBydW5BbmltYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgX3N0b3BDb25mZXR0aUlubmVyKCkge1xuICAgICAgICB0aGlzLnN0cmVhbWluZ0NvbmZldHRpID0gZmFsc2U7XG4gICAgfVxuICAgIHN0YXRpYyBkcmF3UGFydGljbGVzKGNvbnRleHQpIHtcbiAgICAgICAgbGV0IHBhcnRpY2xlO1xuICAgICAgICBsZXQgeDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcGFydGljbGUgPSB0aGlzLnBhcnRpY2xlc1tpXTtcbiAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjb250ZXh0LmxpbmVXaWR0aCA9IHBhcnRpY2xlLmRpYW1ldGVyO1xuICAgICAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IHBhcnRpY2xlLmNvbG9yO1xuICAgICAgICAgICAgeCA9IHBhcnRpY2xlLnggKyBwYXJ0aWNsZS50aWx0O1xuICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oeCArIHBhcnRpY2xlLmRpYW1ldGVyIC8gMiwgcGFydGljbGUueSk7XG4gICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4LCBwYXJ0aWNsZS55ICsgcGFydGljbGUudGlsdCArIHBhcnRpY2xlLmRpYW1ldGVyIC8gMik7XG4gICAgICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyB1cGRhdGVQYXJ0aWNsZXMoKSB7XG4gICAgICAgIGxldCB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICBsZXQgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgICBsZXQgcGFydGljbGU7XG4gICAgICAgIHRoaXMud2F2ZUFuZ2xlICs9IDAuMDE7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBhcnRpY2xlID0gdGhpcy5wYXJ0aWNsZXNbaV07XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RyZWFtaW5nQ29uZmV0dGkgJiYgcGFydGljbGUueSA8IC0xNSlcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS55ID0gaGVpZ2h0ICsgMTAwO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcGFydGljbGUudGlsdEFuZ2xlICs9IHBhcnRpY2xlLnRpbHRBbmdsZUluY3JlbWVudDtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS54ICs9IE1hdGguc2luKHRoaXMud2F2ZUFuZ2xlKTtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS55ICs9IChNYXRoLmNvcyh0aGlzLndhdmVBbmdsZSkgKyBwYXJ0aWNsZS5kaWFtZXRlciArIHRoaXMucGFydGljbGVTcGVlZCkgKiAwLjU7XG4gICAgICAgICAgICAgICAgcGFydGljbGUudGlsdCA9IE1hdGguc2luKHBhcnRpY2xlLnRpbHRBbmdsZSkgKiAxNTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJ0aWNsZS54ID4gd2lkdGggKyAyMCB8fCBwYXJ0aWNsZS54IDwgLTIwIHx8IHBhcnRpY2xlLnkgPiBoZWlnaHQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdHJlYW1pbmdDb25mZXR0aSAmJiB0aGlzLnBhcnRpY2xlcy5sZW5ndGggPD0gdGhpcy5tYXhQYXJ0aWNsZUNvdW50KVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2V0UGFydGljbGUocGFydGljbGUsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gYWx0ZXJuYXRlIGZldGNoIGZvciBub2RlIDE2XG4gICAgc3RhdGljIGZldGNoKHVybCwgaW5pdCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImZldGNoOiBcIiArIGluaXQubWV0aG9kICsgXCI6IFwiICsgdXJsKTtcbiAgICAgICAgY29uc29sZS5sb2coXCIgICAgaGVhZGVyczogXCIgKyBKU09OLnN0cmluZ2lmeShpbml0LmhlYWRlcnMpKTtcbiAgICAgICAgY29uc29sZS5sb2coXCIgICAgYm9keSAgIDogXCIgKyBKU09OLnN0cmluZ2lmeShpbml0LmJvZHkpKTtcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBmZXRjaCh1cmwsIGluaXQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHAgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIGxldCBtZXRob2QgPSBpbml0Lm1ldGhvZCA/PyBcIkdFVFwiO1xuICAgICAgICAgICAgLy8gcHJvY2VzcyBoZWFkZXJzXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGhlYWRlcktleSBpbiBpbml0LmhlYWRlcnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBoZWFkZXJWYWx1ZSA9IGluaXQuaGVhZGVyc1toZWFkZXJLZXldO1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGhlYWRlcktleSwgaGVhZGVyVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcHJvY2VzcyBib2R5XG4gICAgICAgICAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtS2V5IGluIGluaXQuYm9keSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBpbml0LmJvZHlbaXRlbUtleV07XG4gICAgICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKGl0ZW1LZXksIGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmVzb2x2ZS9yZWplY3RcbiAgICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PSA0ICYmIHRoaXMuc3RhdHVzID09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImZldGNoOiByZXNwb25zZTogXCIgKyBKU09OLnN0cmluZ2lmeSh0aGlzLnJlc3BvbnNlKSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5yZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PSA0ICYmIHRoaXMuc3RhdHVzICE9PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJmZXRjaDogZXJyb3IgcmVzcG9uc2VcIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICByZWplY3QodGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vIHNlbmQgaXQsIGFzeW5jXG4gICAgICAgICAgICB4aHIub3BlbihtZXRob2QsIHVybCwgdHJ1ZSk7XG4gICAgICAgICAgICB4aHIuc2VuZChmb3JtRGF0YSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcDtcbiAgICB9XG4gICAgLy8gY29va2llc1xuICAgIHN0YXRpYyBfc2V0Q29va2llKGNuYW1lLCBjdmFsdWUsIGV4ZGF5cykge1xuICAgICAgICBjb25zdCBkID0gbmV3IERhdGUoKTtcbiAgICAgICAgZC5zZXRUaW1lKGQuZ2V0VGltZSgpICsgKGV4ZGF5cyAqIDI0ICogNjAgKiA2MCAqIDEwMDApKTtcbiAgICAgICAgbGV0IGV4cGlyZXMgPSBcImV4cGlyZXM9XCIgKyBkLnRvVVRDU3RyaW5nKCk7XG4gICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNuYW1lICsgXCI9XCIgKyBjdmFsdWUgKyBcIjtcIiArIGV4cGlyZXMgKyBcIjtwYXRoPS9cIjtcbiAgICB9XG4gICAgc3RhdGljIF9nZXRDb29raWUoY25hbWUpIHtcbiAgICAgICAgbGV0IG5hbWUgPSBjbmFtZSArIFwiPVwiO1xuICAgICAgICBsZXQgY2EgPSBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsnKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjYS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGMgPSBjYVtpXTtcbiAgICAgICAgICAgIHdoaWxlIChjLmNoYXJBdCgwKSA9PSAnICcpIHtcbiAgICAgICAgICAgICAgICBjID0gYy5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYy5pbmRleE9mKG5hbWUpID09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYy5zdWJzdHJpbmcobmFtZS5sZW5ndGgsIGMubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG59XG5HRU1TLl9yb290ID0gXCJodHRwczovL2dlbXNhcGkuYmF5ei5haS9hcGkvXCI7XG5HRU1TLnN0YXRlID0ge307XG5HRU1TLl9jb2xvcnMgPSBbXCJEb2RnZXJCbHVlXCIsIFwiT2xpdmVEcmFiXCIsIFwiR29sZFwiLCBcIlBpbmtcIiwgXCJTbGF0ZUJsdWVcIiwgXCJMaWdodEJsdWVcIiwgXCJWaW9sZXRcIiwgXCJQYWxlR3JlZW5cIiwgXCJTdGVlbEJsdWVcIiwgXCJTYW5keUJyb3duXCIsIFwiQ2hvY29sYXRlXCIsIFwiQ3JpbXNvblwiXTtcbkdFTVMuc3RyZWFtaW5nQ29uZmV0dGkgPSBmYWxzZTtcbkdFTVMuYW5pbWF0aW9uVGltZXIgPSBudWxsO1xuR0VNUy5wYXJ0aWNsZXMgPSBbXTtcbkdFTVMud2F2ZUFuZ2xlID0gMDtcbi8vIGNvbmZldHRpIGNvbmZpZ1xuR0VNUy5tYXhQYXJ0aWNsZUNvdW50ID0gMTUwOyAvL3NldCBtYXggY29uZmV0dGkgY291bnRcbkdFTVMucGFydGljbGVTcGVlZCA9IDI7IC8vc2V0IHRoZSBwYXJ0aWNsZSBhbmltYXRpb24gc3BlZWRcbmZ1bmN0aW9uIF9jcmVhdGVTdHlsZSgpIHtcbiAgICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgICBjb25zdCBjc3MgPSBgXG4gICAgLkdFTVMtc2NyaW0ge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICB0b3A6IDA7XG4gICAgICAgIGxlZnQ6IDA7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgfVxuICAgIFxuICAgIC5HRU1TLWFjaGlldmVtZW50LWZyYW1lIHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDVweDtcbiAgICAgICAgYm94LXNoYWRvdzogJzRweCA4cHggMzZweCAjRjRBQUI5JztcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gICAgICAgIHdpZHRoOjYwMHB4O1xuICAgICAgICBoZWlnaHQ6IDQwMHB4O1xuICAgICAgICBmb250LWZhbWlseTogQXJpYWwsIEhlbHZldGljYSwgc2Fucy1zZXJpZjtcbiAgICB9XG4gICAgXG4gICAgLkdFTVMtYWNoaWV2ZW1lbnQtdGl0bGUge1xuICAgICAgICBtYXJnaW46IDEwcHg7XG4gICAgfVxuICAgIFxuICAgIC5HRU1TLWFjaGlldmVtZW50LWltYWdlIHtcbiAgICAgICAgd2lkdGg6IDEwMDtcbiAgICAgICAgaGVpZ2h0OiAxMDA7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDVweDtcbiAgICAgICAgYm94LXNoYWRvdzogJzRweCA4cHggMzZweCAjRjRBQUI5JztcbiAgICB9XG4gICAgXG4gICAgLkdFTVMtYWNoaWV2ZW1lbnQtZGVzY3JpcHRpb24ge1xuICAgICAgICBtYXJnaW46IDEwcHg7XG4gICAgfVxuICAgIGA7XG4gICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIC8vIGluIGJyb3dzZXJcbiAgICBfY3JlYXRlU3R5bGUoKTtcbiAgICB3aW5kb3dbXCJHRU1TXCJdID0gR0VNUztcbn1cbiIsICJpbXBvcnQge0dFTVN9IGZyb20gXCJiYXl6LWdlbXMtYXBpXCI7XG5cbi8vIGdhbWUgZWxlbWVudHMgICBcbmNvbnN0IHNjb3JlU3BhbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2NvcmVcIikhIGFzIEhUTUxTcGFuRWxlbWVudDtcbmNvbnN0IHN0YXJ0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFwiKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5jb25zdCBwbGF5QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5XCIpISBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbmNvbnN0IHNjb3JlQm94ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzY29yZWJveFwiKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5jb25zdCBmaW5pc2hCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2ZpbmlzaFwiKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5cbnN0YXJ0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzdGFydCk7XG5wbGF5QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzY29yZSk7XG5maW5pc2hCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZpbmlzaCk7XG5cbi8vIGluaXQgYW5kIGZpcnN0IGV2ZW50XG5jb25zdCBhcGlLZXkgPSBcImkyc2x1bE4pVSU3eHZNb1ZBQ0xTRVlvZ09la05Rb1dFXCI7XG5jb25zdCBhcHBJZCA9IFwiMzc2NzVhYzgtYzBjMC00MmU5LTgyOTEtMGY5NTI5ZGY1ZDQ3XCI7XG5HRU1TLmluaXQoe2FwaUtleTphcGlLZXksIGFwcElkOmFwcElkfSkudGhlbigoKT0+e1xuICAgIEdFTVMuZXZlbnQoXCJEZW1vLUdhbWVQYWdlXCIpO1xuICAgIHN0YXJ0QnV0dG9uIS5kaXNhYmxlZCA9IGZhbHNlO1xufSk7XG5cbmZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgIEdFTVMuZXZlbnQoXCJEZW1vLUdhbWVTdGFydGVkXCIpO1xuICAgIHNjb3JlU3Bhbi5pbm5lclRleHQgPSBcIjBcIjtcbiAgICBwbGF5QnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG4gICAgc2NvcmVCb3guZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBzdGFydEJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG59XG5cbmZ1bmN0aW9uIHNjb3JlKCkge1xuICAgIGxldCBuID0gTnVtYmVyKHNjb3JlU3Bhbi5pbm5lclRleHQpO1xuICAgIGxldCBuTmV3ID0gTnVtYmVyKHNjb3JlQm94LnZhbHVlKTtcbiAgICBpZiAoaXNOYU4obk5ldykpe1xuICAgICAgICBuTmV3ID0gMDtcbiAgICB9XG4gICAgbiArPSBuTmV3O1xuICAgIHNjb3JlU3Bhbi5pbm5lclRleHQgPSBTdHJpbmcobik7XG4gICAgZmluaXNoQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGZpbmlzaCgpIHtcbiAgICBHRU1TLmV2ZW50KFwiRGVtby1HYW1lRmluaXNoZWRcIiwge3ZhbHVlOk51bWJlcihzY29yZVNwYW4uaW5uZXJUZXh0KX0pO1xuICAgIHBsYXlCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xuICAgIHNjb3JlQm94LmRpc2FibGVkID0gdHJ1ZTtcbiAgICBmaW5pc2hCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xuICAgIHN0YXJ0QnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVNBLE1BQU0sV0FBTixNQUFlO0FBQUEsSUFDWCxjQUFjO0FBQ1YsV0FBSyxRQUFRO0FBQ2IsV0FBSyxJQUFJO0FBQ1QsV0FBSyxJQUFJO0FBQ1QsV0FBSyxXQUFXO0FBQ2hCLFdBQUssT0FBTztBQUNaLFdBQUsscUJBQXFCO0FBQzFCLFdBQUssWUFBWTtBQUFBLElBQ3JCO0FBQUEsRUFDSjtBQUVPLE1BQU0sT0FBTixNQUFXO0FBQUEsSUFJZCxPQUFPLGdCQUFnQjtBQUNuQixZQUFNLGtCQUFrQjtBQUFBLFFBQ3BCLE1BQU07QUFBQSxRQUNOLE9BQU87QUFBQSxRQUNQLEtBQUs7QUFBQSxRQUNMLE1BQU07QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLFFBQVE7QUFBQSxNQUNaO0FBQ0EsWUFBTSxPQUFPLElBQUksS0FBSztBQUN0QixZQUFNLGdCQUFn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QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQXdDWixVQUFNLFlBQVksU0FBUyxlQUFlLEdBQUcsQ0FBQztBQUM5QyxhQUFTLEtBQUssWUFBWSxLQUFLO0FBQUEsRUFDbkM7QUFDQSxNQUFJLE9BQU8sV0FBVyxhQUFhO0FBRS9CLGlCQUFhO0FBQ2IsV0FBTyxVQUFVO0FBQUEsRUFDckI7OztBQ3hXQSxNQUFNLFlBQVksU0FBUyxjQUFjLFFBQVE7QUFDakQsTUFBTSxjQUFjLFNBQVMsY0FBYyxRQUFRO0FBQ25ELE1BQU0sYUFBYSxTQUFTLGNBQWMsT0FBTztBQUNqRCxNQUFNLFdBQVcsU0FBUyxjQUFjLFdBQVc7QUFDbkQsTUFBTSxlQUFlLFNBQVMsY0FBYyxTQUFTO0FBRXJELGNBQVksaUJBQWlCLFNBQVMsS0FBSztBQUMzQyxhQUFXLGlCQUFpQixTQUFTLEtBQUs7QUFDMUMsZUFBYSxpQkFBaUIsU0FBUyxNQUFNO0FBRzdDLE1BQU0sU0FBUztBQUNmLE1BQU0sUUFBUTtBQUNkLE9BQUssS0FBSyxFQUFDLFFBQWUsTUFBVyxDQUFDLEVBQUUsS0FBSyxNQUFJO0FBQzdDLFNBQUssTUFBTSxlQUFlO0FBQzFCLGdCQUFhLFdBQVc7QUFBQSxFQUM1QixDQUFDO0FBRUQsV0FBUyxRQUFRO0FBQ2IsU0FBSyxNQUFNLGtCQUFrQjtBQUM3QixjQUFVLFlBQVk7QUFDdEIsZUFBVyxXQUFXO0FBQ3RCLGFBQVMsV0FBVztBQUNwQixnQkFBWSxXQUFXO0FBQUEsRUFDM0I7QUFFQSxXQUFTLFFBQVE7QUFDYixRQUFJLElBQUksT0FBTyxVQUFVLFNBQVM7QUFDbEMsUUFBSSxPQUFPLE9BQU8sU0FBUyxLQUFLO0FBQ2hDLFFBQUksTUFBTSxJQUFJLEdBQUU7QUFDWixhQUFPO0FBQUEsSUFDWDtBQUNBLFNBQUs7QUFDTCxjQUFVLFlBQVksT0FBTyxDQUFDO0FBQzlCLGlCQUFhLFdBQVc7QUFBQSxFQUM1QjtBQUVBLFdBQVMsU0FBUztBQUNkLFNBQUssTUFBTSxxQkFBcUIsRUFBQyxPQUFNLE9BQU8sVUFBVSxTQUFTLEVBQUMsQ0FBQztBQUNuRSxlQUFXLFdBQVc7QUFDdEIsYUFBUyxXQUFXO0FBQ3BCLGlCQUFhLFdBQVc7QUFDeEIsZ0JBQVksV0FBVztBQUFBLEVBQzNCOyIsCiAgIm5hbWVzIjogWyJhcHBJZCJdCn0K
