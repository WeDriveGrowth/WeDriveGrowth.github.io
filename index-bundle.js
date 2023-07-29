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

  // node_modules/bayze-gems-api/dist/esm/gems.js
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
          params.userId = this._getCookie("gems-user-id");
        }
        let url = this._root + "user/" + params.appId + (params.userId ? "/" + params.userId : "");
        const response = await this.fetch(url, {
          method: params.userId ? "GET" : "POST",
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
        const response = await this.fetch(this._root + "tag/" + this.state.appId, {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + this.state.token,
            "Content-Type": "text/plain"
          },
          body: JSON.stringify(body)
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
          response = this.state.fetch(url, init);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZV9tb2R1bGVzL2JheXplLWdlbXMtYXBpL2Rpc3QvZXNtL2dlbXMuanMiLCAiaW5kZXgudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vXG4vLyB0aGUgb2ZmaWNhbCBHRU1TIEFQSSB3cmFwcGVyIC8gdGFnXG4vLyAoYykgMjAyMysgV2VEcml2ZUdyb3d0aFxuLy9cbi8vIHZlcnNpb246IDAuMS4wXG4vL1xuLy8gY3JlZGl0czpcbi8vIGNvbmZldHRpIGJ5IG1hdGh1c3VtbXV0LCBNSVQgbGljZW5zZTogaHR0cHM6Ly93d3cuY3Nzc2NyaXB0LmNvbS9jb25mZXR0aS1mYWxsaW5nLWFuaW1hdGlvbi9cbjtcbmNsYXNzIFBhcnRpY2xlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jb2xvciA9IFwiXCI7XG4gICAgICAgIHRoaXMueCA9IDA7XG4gICAgICAgIHRoaXMueSA9IDA7XG4gICAgICAgIHRoaXMuZGlhbWV0ZXIgPSAwO1xuICAgICAgICB0aGlzLnRpbHQgPSAwO1xuICAgICAgICB0aGlzLnRpbHRBbmdsZUluY3JlbWVudCA9IDA7XG4gICAgICAgIHRoaXMudGlsdEFuZ2xlID0gMDtcbiAgICB9XG59XG47XG5leHBvcnQgY2xhc3MgR0VNUyB7XG4gICAgLy9cbiAgICAvLyBoZWxwZXJzXG4gICAgLy9cbiAgICBzdGF0aWMgX2dldExvY2FsVGltZSgpIHtcbiAgICAgICAgY29uc3QgZGF0ZURhdGFPcHRpb25zID0ge1xuICAgICAgICAgICAgeWVhcjogJ251bWVyaWMnLFxuICAgICAgICAgICAgbW9udGg6ICcyLWRpZ2l0JyxcbiAgICAgICAgICAgIGRheTogJzItZGlnaXQnLFxuICAgICAgICAgICAgaG91cjogJzItZGlnaXQnLFxuICAgICAgICAgICAgbWludXRlOiAnMi1kaWdpdCcsXG4gICAgICAgICAgICBzZWNvbmQ6ICcyLWRpZ2l0JyxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgdGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnREYXRlVUsgPSB0aW1lLnRvTG9jYWxlU3RyaW5nKCdlbi1VSycsIGRhdGVEYXRhT3B0aW9ucyk7XG4gICAgICAgIHJldHVybiBjdXJyZW50RGF0ZVVLO1xuICAgIH1cbiAgICBzdGF0aWMgYXN5bmMgX3dhaXQobXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBfd2FpdEZvck5leHRFdmVudChlbGVtZW50LCBuYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKG5hbWUsIChlKSA9PiByZXNvbHZlKHRydWUpLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvL1xuICAgIC8vIGV4cG9zZWQgQVBJXG4gICAgLy9cbiAgICBzdGF0aWMgYXN5bmMgaW5pdChwYXJhbXMpIHtcbiAgICAgICAgY29uc29sZS5hc3NlcnQocGFyYW1zLmFwcElkKTtcbiAgICAgICAgY29uc29sZS5hc3NlcnQocGFyYW1zLmFwaUtleSk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IC4uLnBhcmFtcyB9O1xuICAgICAgICBkZWxldGUgdGhpcy5zdGF0ZS5hcGlLZXk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoIXBhcmFtcy51c2VySWQgJiYgcGFyYW1zLnVzZUNvb2tpZSkge1xuICAgICAgICAgICAgICAgIHBhcmFtcy51c2VySWQgPSB0aGlzLl9nZXRDb29raWUoXCJnZW1zLXVzZXItaWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgdXJsID0gdGhpcy5fcm9vdCArIFwidXNlci9cIiArXG4gICAgICAgICAgICAgICAgcGFyYW1zLmFwcElkICtcbiAgICAgICAgICAgICAgICAocGFyYW1zLnVzZXJJZCA/IFwiL1wiICsgcGFyYW1zLnVzZXJJZCA6IFwiXCIpO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmZldGNoKHVybCwge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogcGFyYW1zLnVzZXJJZCA/IFwiR0VUXCIgOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIGFwaWtleTogcGFyYW1zLmFwaUtleSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZldGNoOiByZXN1bHQ6IFwiICsgSlNPTi5zdHJpbmdpZnkocmVzdWx0KSk7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLnVzZXJJZCA9IHJlc3VsdC51c2VyX2lkO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS50b2tlbiA9IHJlc3VsdC50b2tlbjtcbiAgICAgICAgICAgIGlmIChwYXJhbXMudXNlQ29va2llKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0Q29va2llKFwiZ2Vtcy11c2VyLWlkXCIsIHRoaXMuc3RhdGUudXNlcklkLCAzNjUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1c2VySWQ6IHRoaXMuc3RhdGUudXNlcklkLFxuICAgICAgICAgICAgICAgIHRva2VuOiB0aGlzLnN0YXRlLnRva2VuLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJHRU1TIEFQSSBlcnJvcjpcIik7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBzZXRDbGllbnRDcmVkZW50aWFscyhhcHBJZCwgdXNlcklkLCB0b2tlbikge1xuICAgICAgICB0aGlzLnN0YXRlLmFwcElkID0gYXBwSWQ7XG4gICAgICAgIHRoaXMuc3RhdGUudXNlcklkID0gdXNlcklkO1xuICAgICAgICB0aGlzLnN0YXRlLnRva2VuID0gdG9rZW47XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBldmVudChuYW1lLCBkYXRhID0ge30sIG9wdGlvbnMgPSB7IGRpc3BsYXlGaXJzdDogdHJ1ZSB9KSB7XG4gICAgICAgIGxldCByZXN1bHQ7XG4gICAgICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICAgICAgICB1c2VyX2lkOiB0aGlzLnN0YXRlLnVzZXJJZCxcbiAgICAgICAgICAgIHRhZ05hbWU6IG5hbWUsXG4gICAgICAgICAgICBsb2NhbFRpbWU6IHRoaXMuX2dldExvY2FsVGltZSgpLFxuICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKGRhdGEpLmxlbmd0aCA9PT0gMSAmJiAoXCJ2YWx1ZVwiIGluIGRhdGEpKSB7XG4gICAgICAgICAgICBkZWxldGUgYm9keVtcImRhdGFcIl07XG4gICAgICAgICAgICBib2R5W1widmFsdWVcIl0gPSBkYXRhLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZmV0Y2godGhpcy5fcm9vdCArIFwidGFnL1wiICsgdGhpcy5zdGF0ZS5hcHBJZCwge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkF1dGhvcml6YXRpb25cIjogXCJCZWFyZXIgXCIgKyB0aGlzLnN0YXRlLnRva2VuLFxuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcInRleHQvcGxhaW5cIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIC8vIHNlbmRpbmcgYm9keSBhcyBwbGFpbiB0ZXh0IGR1ZSB0byBBV1MgQ09SUyBwb2xpY3lcbiAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJmZXRjaDogcmVzdWx0OiBcIiArIEpTT04uc3RyaW5naWZ5KHJlc3VsdCkpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5kaXNwbGF5QWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGEgb2YgcmVzdWx0LmFjaGlldmVtZW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5kaXNwbGF5QWNoaWV2ZW1lbnQoYSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5kaXNwbGF5Rmlyc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5hY2hpZXZlbWVudHMgJiYgcmVzdWx0LmFjaGlldmVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmRpc3BsYXlBY2hpZXZlbWVudChyZXN1bHQuYWNoaWV2ZW1lbnRzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiR0VNUyBBUEkgZXJyb3I6XCIpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICA7XG4gICAgc3RhdGljIGFzeW5jIGRpc3BsYXlBY2hpZXZlbWVudChhY2hpZXZlbWVudCkge1xuICAgICAgICAvLyBzY3JpbVxuICAgICAgICBjb25zdCBzY3JpbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHNjcmltLmNsYXNzTmFtZSA9IFwiR0VNUy1zY3JpbVwiO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmltKTtcbiAgICAgICAgLy8gZnJhbWVcbiAgICAgICAgY29uc3QgZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBmcmFtZS5jbGFzc05hbWUgPSBcIkdFTVMtYWNoaWV2ZW1lbnQtZnJhbWVcIjtcbiAgICAgICAgLy8gY29udGVudFxuICAgICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoMlwiKTtcbiAgICAgICAgdGl0bGUuY2xhc3NOYW1lID0gXCJHRU1TLWFjaGlldmVtZW50LXRpdGxlXCI7XG4gICAgICAgIHRpdGxlLmlubmVyVGV4dCA9IGFjaGlldmVtZW50LnRpdGxlO1xuICAgICAgICBjb25zdCBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgICAgIGltYWdlLmNsYXNzTmFtZSA9IFwiR0VNUy1hY2hpZXZlbWVudC1pbWFnZVwiO1xuICAgICAgICBpbWFnZS5zcmMgPSBhY2hpZXZlbWVudC5pbWFnZTtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaDNcIik7XG4gICAgICAgIGRlc2NyaXB0aW9uLmNsYXNzTmFtZSA9IFwiR0VNUy1hY2hpZXZlbWVudC1kZXNjcmlwdGlvblwiO1xuICAgICAgICBkZXNjcmlwdGlvbi5pbm5lclRleHQgPSBhY2hpZXZlbWVudC5kZXNjcmlwdGlvbjtcbiAgICAgICAgZnJhbWUuYXBwZW5kQ2hpbGQodGl0bGUpO1xuICAgICAgICBmcmFtZS5hcHBlbmRDaGlsZChpbWFnZSk7XG4gICAgICAgIGZyYW1lLmFwcGVuZENoaWxkKGRlc2NyaXB0aW9uKTtcbiAgICAgICAgc2NyaW0uYXBwZW5kQ2hpbGQoZnJhbWUpO1xuICAgICAgICB0aGlzLl9zdGFydENvbmZldHRpSW5uZXIoKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLl9zdG9wQ29uZmV0dGlJbm5lcigpLCAzMDAwKTtcbiAgICAgICAgLy8gd2FpdCBmb3IgY2xpY2sgb3V0c2lkZSBmcmFtZVxuICAgICAgICBhd2FpdCB0aGlzLl93YWl0Rm9yTmV4dEV2ZW50KHNjcmltLCBcImNsaWNrXCIpO1xuICAgICAgICB0aGlzLl9zdG9wQ29uZmV0dGlJbm5lcigpO1xuICAgICAgICAvLyBjbGVhbnVwXG4gICAgICAgIHNjcmltLnJlbW92ZSgpO1xuICAgIH1cbiAgICA7XG4gICAgc3RhdGljIHJlc2V0UGFydGljbGUocGFydGljbGUsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgcGFydGljbGUuY29sb3IgPSB0aGlzLl9jb2xvcnNbKE1hdGgucmFuZG9tKCkgKiB0aGlzLl9jb2xvcnMubGVuZ3RoKSB8IDBdO1xuICAgICAgICBwYXJ0aWNsZS54ID0gTWF0aC5yYW5kb20oKSAqIHdpZHRoO1xuICAgICAgICBwYXJ0aWNsZS55ID0gTWF0aC5yYW5kb20oKSAqIGhlaWdodCAtIGhlaWdodDtcbiAgICAgICAgcGFydGljbGUuZGlhbWV0ZXIgPSBNYXRoLnJhbmRvbSgpICogMTAgKyA1O1xuICAgICAgICBwYXJ0aWNsZS50aWx0ID0gTWF0aC5yYW5kb20oKSAqIDEwIC0gMTA7XG4gICAgICAgIHBhcnRpY2xlLnRpbHRBbmdsZUluY3JlbWVudCA9IE1hdGgucmFuZG9tKCkgKiAwLjA3ICsgMC4wNTtcbiAgICAgICAgcGFydGljbGUudGlsdEFuZ2xlID0gMDtcbiAgICAgICAgcmV0dXJuIHBhcnRpY2xlO1xuICAgIH1cbiAgICBzdGF0aWMgX3N0YXJ0Q29uZmV0dGlJbm5lcigpIHtcbiAgICAgICAgbGV0IHdpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgIGxldCBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgICBjYW52YXMuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJjb25mZXR0aS1jYW52YXNcIik7XG4gICAgICAgIGNhbnZhcy5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBcImRpc3BsYXk6YmxvY2s7ei1pbmRleDo5OTk5OTk7cG9pbnRlci1ldmVudHM6bm9uZTsgcG9zaXRpb246Zml4ZWQ7IHRvcDowOyBsZWZ0OiAwO1wiKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpO1xuICAgICAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgbGV0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICB3aGlsZSAodGhpcy5wYXJ0aWNsZXMubGVuZ3RoIDwgdGhpcy5tYXhQYXJ0aWNsZUNvdW50KVxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMucHVzaCh0aGlzLnJlc2V0UGFydGljbGUobmV3IFBhcnRpY2xlKCksIHdpZHRoLCBoZWlnaHQpKTtcbiAgICAgICAgdGhpcy5zdHJlYW1pbmdDb25mZXR0aSA9IHRydWU7XG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvblRpbWVyID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBydW5BbmltYXRpb24gPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGFydGljbGVzLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbmltYXRpb25UaW1lciA9IG51bGw7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUGFydGljbGVzKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BhcnRpY2xlcyhjb250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbmltYXRpb25UaW1lciA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocnVuQW5pbWF0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcnVuQW5pbWF0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIF9zdG9wQ29uZmV0dGlJbm5lcigpIHtcbiAgICAgICAgdGhpcy5zdHJlYW1pbmdDb25mZXR0aSA9IGZhbHNlO1xuICAgIH1cbiAgICBzdGF0aWMgZHJhd1BhcnRpY2xlcyhjb250ZXh0KSB7XG4gICAgICAgIGxldCBwYXJ0aWNsZTtcbiAgICAgICAgbGV0IHg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBhcnRpY2xlID0gdGhpcy5wYXJ0aWNsZXNbaV07XG4gICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY29udGV4dC5saW5lV2lkdGggPSBwYXJ0aWNsZS5kaWFtZXRlcjtcbiAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBwYXJ0aWNsZS5jb2xvcjtcbiAgICAgICAgICAgIHggPSBwYXJ0aWNsZS54ICsgcGFydGljbGUudGlsdDtcbiAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHggKyBwYXJ0aWNsZS5kaWFtZXRlciAvIDIsIHBhcnRpY2xlLnkpO1xuICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeCwgcGFydGljbGUueSArIHBhcnRpY2xlLnRpbHQgKyBwYXJ0aWNsZS5kaWFtZXRlciAvIDIpO1xuICAgICAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgdXBkYXRlUGFydGljbGVzKCkge1xuICAgICAgICBsZXQgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgbGV0IGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgbGV0IHBhcnRpY2xlO1xuICAgICAgICB0aGlzLndhdmVBbmdsZSArPSAwLjAxO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwYXJ0aWNsZSA9IHRoaXMucGFydGljbGVzW2ldO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN0cmVhbWluZ0NvbmZldHRpICYmIHBhcnRpY2xlLnkgPCAtMTUpXG4gICAgICAgICAgICAgICAgcGFydGljbGUueSA9IGhlaWdodCArIDEwMDtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnRpbHRBbmdsZSArPSBwYXJ0aWNsZS50aWx0QW5nbGVJbmNyZW1lbnQ7XG4gICAgICAgICAgICAgICAgcGFydGljbGUueCArPSBNYXRoLnNpbih0aGlzLndhdmVBbmdsZSk7XG4gICAgICAgICAgICAgICAgcGFydGljbGUueSArPSAoTWF0aC5jb3ModGhpcy53YXZlQW5nbGUpICsgcGFydGljbGUuZGlhbWV0ZXIgKyB0aGlzLnBhcnRpY2xlU3BlZWQpICogMC41O1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnRpbHQgPSBNYXRoLnNpbihwYXJ0aWNsZS50aWx0QW5nbGUpICogMTU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFydGljbGUueCA+IHdpZHRoICsgMjAgfHwgcGFydGljbGUueCA8IC0yMCB8fCBwYXJ0aWNsZS55ID4gaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RyZWFtaW5nQ29uZmV0dGkgJiYgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoIDw9IHRoaXMubWF4UGFydGljbGVDb3VudClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldFBhcnRpY2xlKHBhcnRpY2xlLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vIGFsdGVybmF0ZSBmZXRjaCBmb3Igbm9kZSA8MThcbiAgICBzdGF0aWMgYXN5bmMgZmV0Y2godXJsLCBpbml0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmV0Y2g6IFwiICsgaW5pdC5tZXRob2QgKyBcIjogXCIgKyB1cmwpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIiAgICBoZWFkZXJzOiBcIiArIEpTT04uc3RyaW5naWZ5KGluaXQuaGVhZGVycykpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIiAgICBib2R5ICAgOiBcIiArIEpTT04uc3RyaW5naWZ5KGluaXQuYm9keSkpO1xuICAgICAgICBsZXQgcmVzcG9uc2U7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gZmV0Y2godXJsLCBpbml0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdGhpcy5zdGF0ZS5mZXRjaCh1cmwsIGluaXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJmZXRjaDogZXJyb3IgcmVzcG9uc2U6IFwiICsgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH1cbiAgICAvLyBjb29raWVzXG4gICAgc3RhdGljIF9zZXRDb29raWUoY25hbWUsIGN2YWx1ZSwgZXhkYXlzKSB7XG4gICAgICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBkLnNldFRpbWUoZC5nZXRUaW1lKCkgKyAoZXhkYXlzICogMjQgKiA2MCAqIDYwICogMTAwMCkpO1xuICAgICAgICBsZXQgZXhwaXJlcyA9IFwiZXhwaXJlcz1cIiArIGQudG9VVENTdHJpbmcoKTtcbiAgICAgICAgZG9jdW1lbnQuY29va2llID0gY25hbWUgKyBcIj1cIiArIGN2YWx1ZSArIFwiO1wiICsgZXhwaXJlcyArIFwiO3BhdGg9L1wiO1xuICAgIH1cbiAgICBzdGF0aWMgX2dldENvb2tpZShjbmFtZSkge1xuICAgICAgICBsZXQgbmFtZSA9IGNuYW1lICsgXCI9XCI7XG4gICAgICAgIGxldCBjYSA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgYyA9IGNhW2ldO1xuICAgICAgICAgICAgd2hpbGUgKGMuY2hhckF0KDApID09ICcgJykge1xuICAgICAgICAgICAgICAgIGMgPSBjLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjLmluZGV4T2YobmFtZSkgPT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjLnN1YnN0cmluZyhuYW1lLmxlbmd0aCwgYy5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbn1cbkdFTVMuX3Jvb3QgPSBcImh0dHBzOi8vZ2Vtc2FwaS5iYXl6LmFpL2FwaS9cIjtcbkdFTVMuc3RhdGUgPSB7fTtcbkdFTVMuX2NvbG9ycyA9IFtcIkRvZGdlckJsdWVcIiwgXCJPbGl2ZURyYWJcIiwgXCJHb2xkXCIsIFwiUGlua1wiLCBcIlNsYXRlQmx1ZVwiLCBcIkxpZ2h0Qmx1ZVwiLCBcIlZpb2xldFwiLCBcIlBhbGVHcmVlblwiLCBcIlN0ZWVsQmx1ZVwiLCBcIlNhbmR5QnJvd25cIiwgXCJDaG9jb2xhdGVcIiwgXCJDcmltc29uXCJdO1xuR0VNUy5zdHJlYW1pbmdDb25mZXR0aSA9IGZhbHNlO1xuR0VNUy5hbmltYXRpb25UaW1lciA9IG51bGw7XG5HRU1TLnBhcnRpY2xlcyA9IFtdO1xuR0VNUy53YXZlQW5nbGUgPSAwO1xuLy8gY29uZmV0dGkgY29uZmlnXG5HRU1TLm1heFBhcnRpY2xlQ291bnQgPSAxNTA7IC8vc2V0IG1heCBjb25mZXR0aSBjb3VudFxuR0VNUy5wYXJ0aWNsZVNwZWVkID0gMjsgLy9zZXQgdGhlIHBhcnRpY2xlIGFuaW1hdGlvbiBzcGVlZFxuZnVuY3Rpb24gX2NyZWF0ZVN0eWxlKCkge1xuICAgIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICAgIGNvbnN0IGNzcyA9IGBcbiAgICAuR0VNUy1zY3JpbSB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICAgIHRvcDogMDtcbiAgICAgICAgbGVmdDogMDtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIGhlaWdodDogMTAwJTtcbiAgICB9XG4gICAgXG4gICAgLkdFTVMtYWNoaWV2ZW1lbnQtZnJhbWUge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNXB4O1xuICAgICAgICBib3gtc2hhZG93OiAnNHB4IDhweCAzNnB4ICNGNEFBQjknO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcbiAgICAgICAgd2lkdGg6NjAwcHg7XG4gICAgICAgIGhlaWdodDogNDAwcHg7XG4gICAgICAgIGZvbnQtZmFtaWx5OiBBcmlhbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmO1xuICAgIH1cbiAgICBcbiAgICAuR0VNUy1hY2hpZXZlbWVudC10aXRsZSB7XG4gICAgICAgIG1hcmdpbjogMTBweDtcbiAgICB9XG4gICAgXG4gICAgLkdFTVMtYWNoaWV2ZW1lbnQtaW1hZ2Uge1xuICAgICAgICB3aWR0aDogMTAwO1xuICAgICAgICBoZWlnaHQ6IDEwMDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNXB4O1xuICAgICAgICBib3gtc2hhZG93OiAnNHB4IDhweCAzNnB4ICNGNEFBQjknO1xuICAgIH1cbiAgICBcbiAgICAuR0VNUy1hY2hpZXZlbWVudC1kZXNjcmlwdGlvbiB7XG4gICAgICAgIG1hcmdpbjogMTBweDtcbiAgICB9XG4gICAgYDtcbiAgICBzdHlsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgLy8gaW4gYnJvd3NlclxuICAgIF9jcmVhdGVTdHlsZSgpO1xuICAgIHdpbmRvd1tcIkdFTVNcIl0gPSBHRU1TO1xufVxuIiwgImltcG9ydCB7R0VNU30gZnJvbSBcImJheXplLWdlbXMtYXBpXCI7XG5cbi8vIGdhbWUgZWxlbWVudHMgICBcbmNvbnN0IHNjb3JlU3BhbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2NvcmVcIikhIGFzIEhUTUxTcGFuRWxlbWVudDtcbmNvbnN0IHN0YXJ0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFwiKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5jb25zdCBwbGF5QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5XCIpISBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbmNvbnN0IHNjb3JlQm94ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzY29yZWJveFwiKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5jb25zdCBmaW5pc2hCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2ZpbmlzaFwiKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5cbnN0YXJ0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzdGFydCk7XG5wbGF5QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzY29yZSk7XG5maW5pc2hCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZpbmlzaCk7XG5cbi8vIGluaXQgYW5kIGZpcnN0IGV2ZW50XG5jb25zdCBhcGlLZXkgPSBcImkyc2x1bE4pVSU3eHZNb1ZBQ0xTRVlvZ09la05Rb1dFXCI7XG5jb25zdCBhcHBJZCA9IFwiMzc2NzVhYzgtYzBjMC00MmU5LTgyOTEtMGY5NTI5ZGY1ZDQ3XCI7XG5HRU1TLmluaXQoe2FwaUtleTphcGlLZXksIGFwcElkOmFwcElkfSkudGhlbigoKT0+e1xuICAgIEdFTVMuZXZlbnQoXCJEZW1vLUdhbWVQYWdlXCIpO1xuICAgIHN0YXJ0QnV0dG9uIS5kaXNhYmxlZCA9IGZhbHNlO1xufSk7XG5cbmZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgIEdFTVMuZXZlbnQoXCJEZW1vLUdhbWVTdGFydGVkXCIpO1xuICAgIHNjb3JlU3Bhbi5pbm5lclRleHQgPSBcIjBcIjtcbiAgICBwbGF5QnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG4gICAgc2NvcmVCb3guZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBzdGFydEJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG59XG5cbmZ1bmN0aW9uIHNjb3JlKCkge1xuICAgIGxldCBuID0gTnVtYmVyKHNjb3JlU3Bhbi5pbm5lclRleHQpO1xuICAgIGxldCBuTmV3ID0gTnVtYmVyKHNjb3JlQm94LnZhbHVlKTtcbiAgICBpZiAoaXNOYU4obk5ldykpe1xuICAgICAgICBuTmV3ID0gMDtcbiAgICB9XG4gICAgbiArPSBuTmV3O1xuICAgIHNjb3JlU3Bhbi5pbm5lclRleHQgPSBTdHJpbmcobik7XG4gICAgZmluaXNoQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGZpbmlzaCgpIHtcbiAgICBHRU1TLmV2ZW50KFwiRGVtby1HYW1lRmluaXNoZWRcIiwge3ZhbHVlOk51bWJlcihzY29yZVNwYW4uaW5uZXJUZXh0KX0pO1xuICAgIHBsYXlCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xuICAgIHNjb3JlQm94LmRpc2FibGVkID0gdHJ1ZTtcbiAgICBmaW5pc2hCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xuICAgIHN0YXJ0QnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVNBLE1BQU0sV0FBTixNQUFlO0FBQUEsSUFDWCxjQUFjO0FBQ1YsV0FBSyxRQUFRO0FBQ2IsV0FBSyxJQUFJO0FBQ1QsV0FBSyxJQUFJO0FBQ1QsV0FBSyxXQUFXO0FBQ2hCLFdBQUssT0FB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QUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBd0NaLFVBQU0sWUFBWSxTQUFTLGVBQWUsR0FBRyxDQUFDO0FBQzlDLGFBQVMsS0FBSyxZQUFZLEtBQUs7QUFBQSxFQUNuQztBQUNBLE1BQUksT0FBTyxXQUFXLGFBQWE7QUFFL0IsaUJBQWE7QUFDYixXQUFPLFVBQVU7QUFBQSxFQUNyQjs7O0FDM1ZBLE1BQU0sWUFBWSxTQUFTLGNBQWMsUUFBUTtBQUNqRCxNQUFNLGNBQWMsU0FBUyxjQUFjLFFBQVE7QUFDbkQsTUFBTSxhQUFhLFNBQVMsY0FBYyxPQUFPO0FBQ2pELE1BQU0sV0FBVyxTQUFTLGNBQWMsV0FBVztBQUNuRCxNQUFNLGVBQWUsU0FBUyxjQUFjLFNBQVM7QUFFckQsY0FBWSxpQkFBaUIsU0FBUyxLQUFLO0FBQzNDLGFBQVcsaUJBQWlCLFNBQVMsS0FBSztBQUMxQyxlQUFhLGlCQUFpQixTQUFTLE1BQU07QUFHN0MsTUFBTSxTQUFTO0FBQ2YsTUFBTSxRQUFRO0FBQ2QsT0FBSyxLQUFLLEVBQUMsUUFBZSxNQUFXLENBQUMsRUFBRSxLQUFLLE1BQUk7QUFDN0MsU0FBSyxNQUFNLGVBQWU7QUFDMUIsZ0JBQWEsV0FBVztBQUFBLEVBQzVCLENBQUM7QUFFRCxXQUFTLFFBQVE7QUFDYixTQUFLLE1BQU0sa0JBQWtCO0FBQzdCLGNBQVUsWUFBWTtBQUN0QixlQUFXLFdBQVc7QUFDdEIsYUFBUyxXQUFXO0FBQ3BCLGdCQUFZLFdBQVc7QUFBQSxFQUMzQjtBQUVBLFdBQVMsUUFBUTtBQUNiLFFBQUksSUFBSSxPQUFPLFVBQVUsU0FBUztBQUNsQyxRQUFJLE9BQU8sT0FBTyxTQUFTLEtBQUs7QUFDaEMsUUFBSSxNQUFNLElBQUksR0FBRTtBQUNaLGFBQU87QUFBQSxJQUNYO0FBQ0EsU0FBSztBQUNMLGNBQVUsWUFBWSxPQUFPLENBQUM7QUFDOUIsaUJBQWEsV0FBVztBQUFBLEVBQzVCO0FBRUEsV0FBUyxTQUFTO0FBQ2QsU0FBSyxNQUFNLHFCQUFxQixFQUFDLE9BQU0sT0FBTyxVQUFVLFNBQVMsRUFBQyxDQUFDO0FBQ25FLGVBQVcsV0FBVztBQUN0QixhQUFTLFdBQVc7QUFDcEIsaUJBQWEsV0FBVztBQUN4QixnQkFBWSxXQUFXO0FBQUEsRUFDM0I7IiwKICAibmFtZXMiOiBbImFwcElkIl0KfQo=
