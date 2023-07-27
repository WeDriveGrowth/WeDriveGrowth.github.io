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
        console.log("fetch: result: " + JSON.stringify(result));
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
        console.log("fetch: result: " + JSON.stringify(result));
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
    static async fetch(url, init) {
      console.log("fetch: " + init.method + ": " + url);
      console.log("    headers: " + JSON.stringify(init.headers));
      console.log("    body   : " + JSON.stringify(init.body));
      let response;
      try {
        if (typeof window !== "undefined") {
          response = fetch(url, init);
        } else {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZV9tb2R1bGVzL2JheXotZ2Vtcy1hcGkvZGlzdC9lc20vZ2Vtcy5qcyIsICJpbmRleC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy9cbi8vIHRoZSBvZmZpY2FsIEdFTVMgQVBJIHdyYXBwZXIgLyB0YWdcbi8vIChjKSAyMDIzKyBXZURyaXZlR3Jvd3RoXG4vL1xuLy8gdmVyc2lvbjogMC4xLjBcbi8vXG4vLyBjcmVkaXRzOlxuLy8gY29uZmV0dGkgYnkgbWF0aHVzdW1tdXQsIE1JVCBsaWNlbnNlOiBodHRwczovL3d3dy5jc3NzY3JpcHQuY29tL2NvbmZldHRpLWZhbGxpbmctYW5pbWF0aW9uL1xuO1xuY2xhc3MgUGFydGljbGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNvbG9yID0gXCJcIjtcbiAgICAgICAgdGhpcy54ID0gMDtcbiAgICAgICAgdGhpcy55ID0gMDtcbiAgICAgICAgdGhpcy5kaWFtZXRlciA9IDA7XG4gICAgICAgIHRoaXMudGlsdCA9IDA7XG4gICAgICAgIHRoaXMudGlsdEFuZ2xlSW5jcmVtZW50ID0gMDtcbiAgICAgICAgdGhpcy50aWx0QW5nbGUgPSAwO1xuICAgIH1cbn1cbjtcbmV4cG9ydCBjbGFzcyBHRU1TIHtcbiAgICAvL1xuICAgIC8vIGhlbHBlcnNcbiAgICAvL1xuICAgIHN0YXRpYyBfZ2V0TG9jYWxUaW1lKCkge1xuICAgICAgICBjb25zdCBkYXRlRGF0YU9wdGlvbnMgPSB7XG4gICAgICAgICAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgICAgICAgICBtb250aDogJzItZGlnaXQnLFxuICAgICAgICAgICAgZGF5OiAnMi1kaWdpdCcsXG4gICAgICAgICAgICBob3VyOiAnMi1kaWdpdCcsXG4gICAgICAgICAgICBtaW51dGU6ICcyLWRpZ2l0JyxcbiAgICAgICAgICAgIHNlY29uZDogJzItZGlnaXQnLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB0aW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgY29uc3QgY3VycmVudERhdGVVSyA9IHRpbWUudG9Mb2NhbGVTdHJpbmcoJ2VuLVVLJywgZGF0ZURhdGFPcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnREYXRlVUs7XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBfd2FpdChtcykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIF93YWl0Rm9yTmV4dEV2ZW50KGVsZW1lbnQsIG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgKGUpID0+IHJlc29sdmUodHJ1ZSksIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vXG4gICAgLy8gZXhwb3NlZCBBUElcbiAgICAvL1xuICAgIHN0YXRpYyBhc3luYyBpbml0KHBhcmFtcykge1xuICAgICAgICBjb25zb2xlLmFzc2VydChwYXJhbXMuYXBwSWQpO1xuICAgICAgICBjb25zb2xlLmFzc2VydChwYXJhbXMuYXBpS2V5KTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHsgLi4ucGFyYW1zIH07XG4gICAgICAgIGRlbGV0ZSB0aGlzLnN0YXRlLmFwaUtleTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICghcGFyYW1zLnVzZXJJZCAmJiBwYXJhbXMudXNlQ29va2llKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS51c2VySWQgPSB0aGlzLl9nZXRDb29raWUoXCJnZW1zLXVzZXItaWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgdXJsID0gdGhpcy5fcm9vdCArIFwidXNlci9cIiArXG4gICAgICAgICAgICAgICAgcGFyYW1zLmFwcElkICtcbiAgICAgICAgICAgICAgICAocGFyYW1zLnVzZXJJZCA/IFwiL1wiICsgcGFyYW1zLnVzZXJJZCA6IFwiXCIpO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmZldGNoKHVybCwge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBhcGlrZXk6IHBhcmFtcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJmZXRjaDogcmVzdWx0OiBcIiArIEpTT04uc3RyaW5naWZ5KHJlc3VsdCkpO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS51c2VySWQgPSByZXN1bHQudXNlcl9pZDtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUudG9rZW4gPSByZXN1bHQudG9rZW47XG4gICAgICAgICAgICBpZiAocGFyYW1zLnVzZUNvb2tpZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldENvb2tpZShcImdlbXMtdXNlci1pZFwiLCB0aGlzLnN0YXRlLnVzZXJJZCwgMzY1KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXNlcklkOiB0aGlzLnN0YXRlLnVzZXJJZCxcbiAgICAgICAgICAgICAgICB0b2tlbjogdGhpcy5zdGF0ZS50b2tlbixcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiR0VNUyBBUEkgZXJyb3I6XCIpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgc2V0Q2xpZW50Q3JlZGVudGlhbHMoYXBwSWQsIHVzZXJJZCwgdG9rZW4pIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5hcHBJZCA9IGFwcElkO1xuICAgICAgICB0aGlzLnN0YXRlLnVzZXJJZCA9IHVzZXJJZDtcbiAgICAgICAgdGhpcy5zdGF0ZS50b2tlbiA9IHRva2VuO1xuICAgIH1cbiAgICBzdGF0aWMgYXN5bmMgZXZlbnQobmFtZSwgZGF0YSA9IHt9LCBvcHRpb25zID0geyBkaXNwbGF5Rmlyc3Q6IHRydWUgfSkge1xuICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmZldGNoKHRoaXMuX3Jvb3QgKyBcInRhZy9cIiArIHRoaXMuc3RhdGUuYXBwSWQsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBcIkJlYXJlciBcIiArIHRoaXMuc3RhdGUudG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIFwiQWNjZXB0XCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiB0aGlzLnN0YXRlLnVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgdGFnTmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxUaW1lOiB0aGlzLl9nZXRMb2NhbFRpbWUoKSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXN1bHQgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZldGNoOiByZXN1bHQ6IFwiICsgSlNPTi5zdHJpbmdpZnkocmVzdWx0KSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmRpc3BsYXlBbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYSBvZiByZXN1bHQuYWNoaWV2ZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmRpc3BsYXlBY2hpZXZlbWVudChhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvcHRpb25zLmRpc3BsYXlGaXJzdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmFjaGlldmVtZW50cyAmJiByZXN1bHQuYWNoaWV2ZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZGlzcGxheUFjaGlldmVtZW50KHJlc3VsdC5hY2hpZXZlbWVudHNbMF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJHRU1TIEFQSSBlcnJvcjpcIik7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIDtcbiAgICBzdGF0aWMgYXN5bmMgZGlzcGxheUFjaGlldmVtZW50KGFjaGlldmVtZW50KSB7XG4gICAgICAgIC8vIHNjcmltXG4gICAgICAgIGNvbnN0IHNjcmltID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgc2NyaW0uY2xhc3NOYW1lID0gXCJHRU1TLXNjcmltXCI7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaW0pO1xuICAgICAgICAvLyBmcmFtZVxuICAgICAgICBjb25zdCBmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGZyYW1lLmNsYXNzTmFtZSA9IFwiR0VNUy1hY2hpZXZlbWVudC1mcmFtZVwiO1xuICAgICAgICAvLyBjb250ZW50XG4gICAgICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImgyXCIpO1xuICAgICAgICB0aXRsZS5jbGFzc05hbWUgPSBcIkdFTVMtYWNoaWV2ZW1lbnQtdGl0bGVcIjtcbiAgICAgICAgdGl0bGUuaW5uZXJUZXh0ID0gYWNoaWV2ZW1lbnQudGl0bGU7XG4gICAgICAgIGNvbnN0IGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICAgICAgaW1hZ2UuY2xhc3NOYW1lID0gXCJHRU1TLWFjaGlldmVtZW50LWltYWdlXCI7XG4gICAgICAgIGltYWdlLnNyYyA9IGFjaGlldmVtZW50LmltYWdlO1xuICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoM1wiKTtcbiAgICAgICAgZGVzY3JpcHRpb24uY2xhc3NOYW1lID0gXCJHRU1TLWFjaGlldmVtZW50LWRlc2NyaXB0aW9uXCI7XG4gICAgICAgIGRlc2NyaXB0aW9uLmlubmVyVGV4dCA9IGFjaGlldmVtZW50LmRlc2NyaXB0aW9uO1xuICAgICAgICBmcmFtZS5hcHBlbmRDaGlsZCh0aXRsZSk7XG4gICAgICAgIGZyYW1lLmFwcGVuZENoaWxkKGltYWdlKTtcbiAgICAgICAgZnJhbWUuYXBwZW5kQ2hpbGQoZGVzY3JpcHRpb24pO1xuICAgICAgICBzY3JpbS5hcHBlbmRDaGlsZChmcmFtZSk7XG4gICAgICAgIHRoaXMuX3N0YXJ0Q29uZmV0dGlJbm5lcigpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuX3N0b3BDb25mZXR0aUlubmVyKCksIDMwMDApO1xuICAgICAgICAvLyB3YWl0IGZvciBjbGljayBvdXRzaWRlIGZyYW1lXG4gICAgICAgIGF3YWl0IHRoaXMuX3dhaXRGb3JOZXh0RXZlbnQoc2NyaW0sIFwiY2xpY2tcIik7XG4gICAgICAgIHRoaXMuX3N0b3BDb25mZXR0aUlubmVyKCk7XG4gICAgICAgIC8vIGNsZWFudXBcbiAgICAgICAgc2NyaW0ucmVtb3ZlKCk7XG4gICAgfVxuICAgIDtcbiAgICBzdGF0aWMgcmVzZXRQYXJ0aWNsZShwYXJ0aWNsZSwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgICBwYXJ0aWNsZS5jb2xvciA9IHRoaXMuX2NvbG9yc1soTWF0aC5yYW5kb20oKSAqIHRoaXMuX2NvbG9ycy5sZW5ndGgpIHwgMF07XG4gICAgICAgIHBhcnRpY2xlLnggPSBNYXRoLnJhbmRvbSgpICogd2lkdGg7XG4gICAgICAgIHBhcnRpY2xlLnkgPSBNYXRoLnJhbmRvbSgpICogaGVpZ2h0IC0gaGVpZ2h0O1xuICAgICAgICBwYXJ0aWNsZS5kaWFtZXRlciA9IE1hdGgucmFuZG9tKCkgKiAxMCArIDU7XG4gICAgICAgIHBhcnRpY2xlLnRpbHQgPSBNYXRoLnJhbmRvbSgpICogMTAgLSAxMDtcbiAgICAgICAgcGFydGljbGUudGlsdEFuZ2xlSW5jcmVtZW50ID0gTWF0aC5yYW5kb20oKSAqIDAuMDcgKyAwLjA1O1xuICAgICAgICBwYXJ0aWNsZS50aWx0QW5nbGUgPSAwO1xuICAgICAgICByZXR1cm4gcGFydGljbGU7XG4gICAgfVxuICAgIHN0YXRpYyBfc3RhcnRDb25mZXR0aUlubmVyKCkge1xuICAgICAgICBsZXQgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgbGV0IGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG4gICAgICAgIGNhbnZhcy5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNvbmZldHRpLWNhbnZhc1wiKTtcbiAgICAgICAgY2FudmFzLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIFwiZGlzcGxheTpibG9jazt6LWluZGV4Ojk5OTk5OTtwb2ludGVyLWV2ZW50czpub25lOyBwb3NpdGlvbjpmaXhlZDsgdG9wOjA7IGxlZnQ6IDA7XCIpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIH0sIHRydWUpO1xuICAgICAgICBsZXQgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgIHdoaWxlICh0aGlzLnBhcnRpY2xlcy5sZW5ndGggPCB0aGlzLm1heFBhcnRpY2xlQ291bnQpXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5wdXNoKHRoaXMucmVzZXRQYXJ0aWNsZShuZXcgUGFydGljbGUoKSwgd2lkdGgsIGhlaWdodCkpO1xuICAgICAgICB0aGlzLnN0cmVhbWluZ0NvbmZldHRpID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uVGltZXIgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHJ1bkFuaW1hdGlvbiA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJ0aWNsZXMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvblRpbWVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQYXJ0aWNsZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGFydGljbGVzKGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvblRpbWVyID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShydW5BbmltYXRpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBydW5BbmltYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgX3N0b3BDb25mZXR0aUlubmVyKCkge1xuICAgICAgICB0aGlzLnN0cmVhbWluZ0NvbmZldHRpID0gZmFsc2U7XG4gICAgfVxuICAgIHN0YXRpYyBkcmF3UGFydGljbGVzKGNvbnRleHQpIHtcbiAgICAgICAgbGV0IHBhcnRpY2xlO1xuICAgICAgICBsZXQgeDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcGFydGljbGUgPSB0aGlzLnBhcnRpY2xlc1tpXTtcbiAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjb250ZXh0LmxpbmVXaWR0aCA9IHBhcnRpY2xlLmRpYW1ldGVyO1xuICAgICAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IHBhcnRpY2xlLmNvbG9yO1xuICAgICAgICAgICAgeCA9IHBhcnRpY2xlLnggKyBwYXJ0aWNsZS50aWx0O1xuICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oeCArIHBhcnRpY2xlLmRpYW1ldGVyIC8gMiwgcGFydGljbGUueSk7XG4gICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4LCBwYXJ0aWNsZS55ICsgcGFydGljbGUudGlsdCArIHBhcnRpY2xlLmRpYW1ldGVyIC8gMik7XG4gICAgICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyB1cGRhdGVQYXJ0aWNsZXMoKSB7XG4gICAgICAgIGxldCB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICBsZXQgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgICBsZXQgcGFydGljbGU7XG4gICAgICAgIHRoaXMud2F2ZUFuZ2xlICs9IDAuMDE7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBhcnRpY2xlID0gdGhpcy5wYXJ0aWNsZXNbaV07XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RyZWFtaW5nQ29uZmV0dGkgJiYgcGFydGljbGUueSA8IC0xNSlcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS55ID0gaGVpZ2h0ICsgMTAwO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcGFydGljbGUudGlsdEFuZ2xlICs9IHBhcnRpY2xlLnRpbHRBbmdsZUluY3JlbWVudDtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS54ICs9IE1hdGguc2luKHRoaXMud2F2ZUFuZ2xlKTtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS55ICs9IChNYXRoLmNvcyh0aGlzLndhdmVBbmdsZSkgKyBwYXJ0aWNsZS5kaWFtZXRlciArIHRoaXMucGFydGljbGVTcGVlZCkgKiAwLjU7XG4gICAgICAgICAgICAgICAgcGFydGljbGUudGlsdCA9IE1hdGguc2luKHBhcnRpY2xlLnRpbHRBbmdsZSkgKiAxNTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJ0aWNsZS54ID4gd2lkdGggKyAyMCB8fCBwYXJ0aWNsZS54IDwgLTIwIHx8IHBhcnRpY2xlLnkgPiBoZWlnaHQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdHJlYW1pbmdDb25mZXR0aSAmJiB0aGlzLnBhcnRpY2xlcy5sZW5ndGggPD0gdGhpcy5tYXhQYXJ0aWNsZUNvdW50KVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2V0UGFydGljbGUocGFydGljbGUsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gYWx0ZXJuYXRlIGZldGNoIGZvciBub2RlIDwxOFxuICAgIHN0YXRpYyBhc3luYyBmZXRjaCh1cmwsIGluaXQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJmZXRjaDogXCIgKyBpbml0Lm1ldGhvZCArIFwiOiBcIiArIHVybCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiICAgIGhlYWRlcnM6IFwiICsgSlNPTi5zdHJpbmdpZnkoaW5pdC5oZWFkZXJzKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiICAgIGJvZHkgICA6IFwiICsgSlNPTi5zdHJpbmdpZnkoaW5pdC5ib2R5KSk7XG4gICAgICAgIGxldCByZXNwb25zZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBmZXRjaCh1cmwsIGluaXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gcmVzcG9uc2UgPSBmZXRjaE5vZGUodXJsLCBpbml0IGFzIGFueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZldGNoOiBlcnJvciByZXNwb25zZTogXCIgKyBlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfVxuICAgIC8vIGNvb2tpZXNcbiAgICBzdGF0aWMgX3NldENvb2tpZShjbmFtZSwgY3ZhbHVlLCBleGRheXMpIHtcbiAgICAgICAgY29uc3QgZCA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGQuc2V0VGltZShkLmdldFRpbWUoKSArIChleGRheXMgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XG4gICAgICAgIGxldCBleHBpcmVzID0gXCJleHBpcmVzPVwiICsgZC50b1VUQ1N0cmluZygpO1xuICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjbmFtZSArIFwiPVwiICsgY3ZhbHVlICsgXCI7XCIgKyBleHBpcmVzICsgXCI7cGF0aD0vXCI7XG4gICAgfVxuICAgIHN0YXRpYyBfZ2V0Q29va2llKGNuYW1lKSB7XG4gICAgICAgIGxldCBuYW1lID0gY25hbWUgKyBcIj1cIjtcbiAgICAgICAgbGV0IGNhID0gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7Jyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2EubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBjID0gY2FbaV07XG4gICAgICAgICAgICB3aGlsZSAoYy5jaGFyQXQoMCkgPT0gJyAnKSB7XG4gICAgICAgICAgICAgICAgYyA9IGMuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGMuaW5kZXhPZihuYW1lKSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGMuc3Vic3RyaW5nKG5hbWUubGVuZ3RoLCBjLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxufVxuR0VNUy5fcm9vdCA9IFwiaHR0cHM6Ly9nZW1zYXBpLmJheXouYWkvYXBpL1wiO1xuR0VNUy5zdGF0ZSA9IHt9O1xuR0VNUy5fY29sb3JzID0gW1wiRG9kZ2VyQmx1ZVwiLCBcIk9saXZlRHJhYlwiLCBcIkdvbGRcIiwgXCJQaW5rXCIsIFwiU2xhdGVCbHVlXCIsIFwiTGlnaHRCbHVlXCIsIFwiVmlvbGV0XCIsIFwiUGFsZUdyZWVuXCIsIFwiU3RlZWxCbHVlXCIsIFwiU2FuZHlCcm93blwiLCBcIkNob2NvbGF0ZVwiLCBcIkNyaW1zb25cIl07XG5HRU1TLnN0cmVhbWluZ0NvbmZldHRpID0gZmFsc2U7XG5HRU1TLmFuaW1hdGlvblRpbWVyID0gbnVsbDtcbkdFTVMucGFydGljbGVzID0gW107XG5HRU1TLndhdmVBbmdsZSA9IDA7XG4vLyBjb25mZXR0aSBjb25maWdcbkdFTVMubWF4UGFydGljbGVDb3VudCA9IDE1MDsgLy9zZXQgbWF4IGNvbmZldHRpIGNvdW50XG5HRU1TLnBhcnRpY2xlU3BlZWQgPSAyOyAvL3NldCB0aGUgcGFydGljbGUgYW5pbWF0aW9uIHNwZWVkXG5mdW5jdGlvbiBfY3JlYXRlU3R5bGUoKSB7XG4gICAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gICAgY29uc3QgY3NzID0gYFxuICAgIC5HRU1TLXNjcmltIHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgdG9wOiAwO1xuICAgICAgICBsZWZ0OiAwO1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgIH1cbiAgICBcbiAgICAuR0VNUy1hY2hpZXZlbWVudC1mcmFtZSB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgICBib3JkZXItcmFkaXVzOiA1cHg7XG4gICAgICAgIGJveC1zaGFkb3c6ICc0cHggOHB4IDM2cHggI0Y0QUFCOSc7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xuICAgICAgICB3aWR0aDo2MDBweDtcbiAgICAgICAgaGVpZ2h0OiA0MDBweDtcbiAgICAgICAgZm9udC1mYW1pbHk6IEFyaWFsLCBIZWx2ZXRpY2EsIHNhbnMtc2VyaWY7XG4gICAgfVxuICAgIFxuICAgIC5HRU1TLWFjaGlldmVtZW50LXRpdGxlIHtcbiAgICAgICAgbWFyZ2luOiAxMHB4O1xuICAgIH1cbiAgICBcbiAgICAuR0VNUy1hY2hpZXZlbWVudC1pbWFnZSB7XG4gICAgICAgIHdpZHRoOiAxMDA7XG4gICAgICAgIGhlaWdodDogMTAwO1xuICAgICAgICBib3JkZXItcmFkaXVzOiA1cHg7XG4gICAgICAgIGJveC1zaGFkb3c6ICc0cHggOHB4IDM2cHggI0Y0QUFCOSc7XG4gICAgfVxuICAgIFxuICAgIC5HRU1TLWFjaGlldmVtZW50LWRlc2NyaXB0aW9uIHtcbiAgICAgICAgbWFyZ2luOiAxMHB4O1xuICAgIH1cbiAgICBgO1xuICAgIHN0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAvLyBpbiBicm93c2VyXG4gICAgX2NyZWF0ZVN0eWxlKCk7XG4gICAgd2luZG93W1wiR0VNU1wiXSA9IEdFTVM7XG59XG4iLCAiaW1wb3J0IHtHRU1TfSBmcm9tIFwiYmF5ei1nZW1zLWFwaVwiO1xuXG4vLyBnYW1lIGVsZW1lbnRzICAgXG5jb25zdCBzY29yZVNwYW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Njb3JlXCIpISBhcyBIVE1MU3BhbkVsZW1lbnQ7XG5jb25zdCBzdGFydEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRcIikhIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuY29uc3QgcGxheUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheVwiKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5jb25zdCBzY29yZUJveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2NvcmVib3hcIikhIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuY29uc3QgZmluaXNoQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNmaW5pc2hcIikhIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuXG5zdGFydEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgc3RhcnQpO1xucGxheUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgc2NvcmUpO1xuZmluaXNoQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmaW5pc2gpO1xuXG4vLyBpbml0IGFuZCBmaXJzdCBldmVudFxuY29uc3QgYXBpS2V5ID0gXCJpMnNsdWxOKVUlN3h2TW9WQUNMU0VZb2dPZWtOUW9XRVwiO1xuY29uc3QgYXBwSWQgPSBcIjM3Njc1YWM4LWMwYzAtNDJlOS04MjkxLTBmOTUyOWRmNWQ0N1wiO1xuR0VNUy5pbml0KHthcGlLZXk6YXBpS2V5LCBhcHBJZDphcHBJZH0pLnRoZW4oKCk9PntcbiAgICBHRU1TLmV2ZW50KFwiRGVtby1HYW1lUGFnZVwiKTtcbiAgICBzdGFydEJ1dHRvbiEuZGlzYWJsZWQgPSBmYWxzZTtcbn0pO1xuXG5mdW5jdGlvbiBzdGFydCgpIHtcbiAgICBHRU1TLmV2ZW50KFwiRGVtby1HYW1lU3RhcnRlZFwiKTtcbiAgICBzY29yZVNwYW4uaW5uZXJUZXh0ID0gXCIwXCI7XG4gICAgcGxheUJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIHNjb3JlQm94LmRpc2FibGVkID0gZmFsc2U7XG4gICAgc3RhcnRCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xufVxuXG5mdW5jdGlvbiBzY29yZSgpIHtcbiAgICBsZXQgbiA9IE51bWJlcihzY29yZVNwYW4uaW5uZXJUZXh0KTtcbiAgICBsZXQgbk5ldyA9IE51bWJlcihzY29yZUJveC52YWx1ZSk7XG4gICAgaWYgKGlzTmFOKG5OZXcpKXtcbiAgICAgICAgbk5ldyA9IDA7XG4gICAgfVxuICAgIG4gKz0gbk5ldztcbiAgICBzY29yZVNwYW4uaW5uZXJUZXh0ID0gU3RyaW5nKG4pO1xuICAgIGZpbmlzaEJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xufVxuXG5mdW5jdGlvbiBmaW5pc2goKSB7XG4gICAgR0VNUy5ldmVudChcIkRlbW8tR2FtZUZpbmlzaGVkXCIsIHt2YWx1ZTpOdW1iZXIoc2NvcmVTcGFuLmlubmVyVGV4dCl9KTtcbiAgICBwbGF5QnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbiAgICBzY29yZUJveC5kaXNhYmxlZCA9IHRydWU7XG4gICAgZmluaXNoQnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbiAgICBzdGFydEJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFTQSxNQUFNLFdBQU4sTUFBZTtBQUFBLElBQ1gsY0FBYztBQUNWLFdBQUssUUFBUTtBQUNiLFdBQUssSUFBSTtBQUNULFdBQUssSUFBSTtBQUNULFdBQUssV0FBVztBQUNoQixXQUFLLE9BQU87QUFDWixXQUFLLHFCQUFxQjtBQUMxQixXQUFLLFlBQVk7QUFBQSxJQUNyQjtBQUFBLEVBQ0o7QUFFTyxNQUFNLE9BQU4sTUFBVztBQUFBLElBSWQsT0FBTyxnQkFBZ0I7QUFDbkIsWUFBTSxrQkFBa0I7QUFBQSxRQUNwQixNQUFNO0FBQUEsUUFDTixPQUFPO0FBQUEsUUFDUCxLQUFLO0FBQUEsUUFDTCxNQUFNO0FBQUEsUUFDTixRQUFRO0FB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
