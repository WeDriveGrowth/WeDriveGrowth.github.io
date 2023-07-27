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
            "Authorization": "Bearer " + this.state.token,
            "Content-Type": "text/plain"
          },
          body: JSON.stringify({
            user_id: this.state.userId,
            tagName: name,
            localTime: this._getLocalTime(),
            data
          })
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZV9tb2R1bGVzL2JheXplLWdlbXMtYXBpL2Rpc3QvZXNtL2dlbXMuanMiLCAiaW5kZXgudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vXG4vLyB0aGUgb2ZmaWNhbCBHRU1TIEFQSSB3cmFwcGVyIC8gdGFnXG4vLyAoYykgMjAyMysgV2VEcml2ZUdyb3d0aFxuLy9cbi8vIHZlcnNpb246IDAuMS4wXG4vL1xuLy8gY3JlZGl0czpcbi8vIGNvbmZldHRpIGJ5IG1hdGh1c3VtbXV0LCBNSVQgbGljZW5zZTogaHR0cHM6Ly93d3cuY3Nzc2NyaXB0LmNvbS9jb25mZXR0aS1mYWxsaW5nLWFuaW1hdGlvbi9cbjtcbmNsYXNzIFBhcnRpY2xlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jb2xvciA9IFwiXCI7XG4gICAgICAgIHRoaXMueCA9IDA7XG4gICAgICAgIHRoaXMueSA9IDA7XG4gICAgICAgIHRoaXMuZGlhbWV0ZXIgPSAwO1xuICAgICAgICB0aGlzLnRpbHQgPSAwO1xuICAgICAgICB0aGlzLnRpbHRBbmdsZUluY3JlbWVudCA9IDA7XG4gICAgICAgIHRoaXMudGlsdEFuZ2xlID0gMDtcbiAgICB9XG59XG47XG5leHBvcnQgY2xhc3MgR0VNUyB7XG4gICAgLy9cbiAgICAvLyBoZWxwZXJzXG4gICAgLy9cbiAgICBzdGF0aWMgX2dldExvY2FsVGltZSgpIHtcbiAgICAgICAgY29uc3QgZGF0ZURhdGFPcHRpb25zID0ge1xuICAgICAgICAgICAgeWVhcjogJ251bWVyaWMnLFxuICAgICAgICAgICAgbW9udGg6ICcyLWRpZ2l0JyxcbiAgICAgICAgICAgIGRheTogJzItZGlnaXQnLFxuICAgICAgICAgICAgaG91cjogJzItZGlnaXQnLFxuICAgICAgICAgICAgbWludXRlOiAnMi1kaWdpdCcsXG4gICAgICAgICAgICBzZWNvbmQ6ICcyLWRpZ2l0JyxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgdGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnREYXRlVUsgPSB0aW1lLnRvTG9jYWxlU3RyaW5nKCdlbi1VSycsIGRhdGVEYXRhT3B0aW9ucyk7XG4gICAgICAgIHJldHVybiBjdXJyZW50RGF0ZVVLO1xuICAgIH1cbiAgICBzdGF0aWMgYXN5bmMgX3dhaXQobXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBfd2FpdEZvck5leHRFdmVudChlbGVtZW50LCBuYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKG5hbWUsIChlKSA9PiByZXNvbHZlKHRydWUpLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvL1xuICAgIC8vIGV4cG9zZWQgQVBJXG4gICAgLy9cbiAgICBzdGF0aWMgYXN5bmMgaW5pdChwYXJhbXMpIHtcbiAgICAgICAgY29uc29sZS5hc3NlcnQocGFyYW1zLmFwcElkKTtcbiAgICAgICAgY29uc29sZS5hc3NlcnQocGFyYW1zLmFwaUtleSk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IC4uLnBhcmFtcyB9O1xuICAgICAgICBkZWxldGUgdGhpcy5zdGF0ZS5hcGlLZXk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoIXBhcmFtcy51c2VySWQgJiYgcGFyYW1zLnVzZUNvb2tpZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUudXNlcklkID0gdGhpcy5fZ2V0Q29va2llKFwiZ2Vtcy11c2VyLWlkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHVybCA9IHRoaXMuX3Jvb3QgKyBcInVzZXIvXCIgK1xuICAgICAgICAgICAgICAgIHBhcmFtcy5hcHBJZCArXG4gICAgICAgICAgICAgICAgKHBhcmFtcy51c2VySWQgPyBcIi9cIiArIHBhcmFtcy51c2VySWQgOiBcIlwiKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5mZXRjaCh1cmwsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgYXBpa2V5OiBwYXJhbXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmV0Y2g6IHJlc3VsdDogXCIgKyBKU09OLnN0cmluZ2lmeShyZXN1bHQpKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUudXNlcklkID0gcmVzdWx0LnVzZXJfaWQ7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLnRva2VuID0gcmVzdWx0LnRva2VuO1xuICAgICAgICAgICAgaWYgKHBhcmFtcy51c2VDb29raWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRDb29raWUoXCJnZW1zLXVzZXItaWRcIiwgdGhpcy5zdGF0ZS51c2VySWQsIDM2NSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVzZXJJZDogdGhpcy5zdGF0ZS51c2VySWQsXG4gICAgICAgICAgICAgICAgdG9rZW46IHRoaXMuc3RhdGUudG9rZW4sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkdFTVMgQVBJIGVycm9yOlwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIHNldENsaWVudENyZWRlbnRpYWxzKGFwcElkLCB1c2VySWQsIHRva2VuKSB7XG4gICAgICAgIHRoaXMuc3RhdGUuYXBwSWQgPSBhcHBJZDtcbiAgICAgICAgdGhpcy5zdGF0ZS51c2VySWQgPSB1c2VySWQ7XG4gICAgICAgIHRoaXMuc3RhdGUudG9rZW4gPSB0b2tlbjtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIGV2ZW50KG5hbWUsIGRhdGEgPSB7fSwgb3B0aW9ucyA9IHsgZGlzcGxheUZpcnN0OiB0cnVlIH0pIHtcbiAgICAgICAgbGV0IHJlc3VsdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5mZXRjaCh0aGlzLl9yb290ICsgXCJ0YWcvXCIgKyB0aGlzLnN0YXRlLmFwcElkLCB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBcIkJlYXJlciBcIiArIHRoaXMuc3RhdGUudG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwidGV4dC9wbGFpblwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLy8gc2VuZGluZyBib2R5IGFzIHBsYWluIHRleHQgZHVlIHRvIEFXUyBDT1JTIHBvbGljeVxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogdGhpcy5zdGF0ZS51c2VySWQsXG4gICAgICAgICAgICAgICAgICAgIHRhZ05hbWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsVGltZTogdGhpcy5fZ2V0TG9jYWxUaW1lKCksXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmV0Y2g6IHJlc3VsdDogXCIgKyBKU09OLnN0cmluZ2lmeShyZXN1bHQpKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZGlzcGxheUFsbCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBhIG9mIHJlc3VsdC5hY2hpZXZlbWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZGlzcGxheUFjaGlldmVtZW50KGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuZGlzcGxheUZpcnN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuYWNoaWV2ZW1lbnRzICYmIHJlc3VsdC5hY2hpZXZlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5kaXNwbGF5QWNoaWV2ZW1lbnQocmVzdWx0LmFjaGlldmVtZW50c1swXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkdFTVMgQVBJIGVycm9yOlwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgO1xuICAgIHN0YXRpYyBhc3luYyBkaXNwbGF5QWNoaWV2ZW1lbnQoYWNoaWV2ZW1lbnQpIHtcbiAgICAgICAgLy8gc2NyaW1cbiAgICAgICAgY29uc3Qgc2NyaW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzY3JpbS5jbGFzc05hbWUgPSBcIkdFTVMtc2NyaW1cIjtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpbSk7XG4gICAgICAgIC8vIGZyYW1lXG4gICAgICAgIGNvbnN0IGZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgZnJhbWUuY2xhc3NOYW1lID0gXCJHRU1TLWFjaGlldmVtZW50LWZyYW1lXCI7XG4gICAgICAgIC8vIGNvbnRlbnRcbiAgICAgICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaDJcIik7XG4gICAgICAgIHRpdGxlLmNsYXNzTmFtZSA9IFwiR0VNUy1hY2hpZXZlbWVudC10aXRsZVwiO1xuICAgICAgICB0aXRsZS5pbm5lclRleHQgPSBhY2hpZXZlbWVudC50aXRsZTtcbiAgICAgICAgY29uc3QgaW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgICAgICBpbWFnZS5jbGFzc05hbWUgPSBcIkdFTVMtYWNoaWV2ZW1lbnQtaW1hZ2VcIjtcbiAgICAgICAgaW1hZ2Uuc3JjID0gYWNoaWV2ZW1lbnQuaW1hZ2U7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImgzXCIpO1xuICAgICAgICBkZXNjcmlwdGlvbi5jbGFzc05hbWUgPSBcIkdFTVMtYWNoaWV2ZW1lbnQtZGVzY3JpcHRpb25cIjtcbiAgICAgICAgZGVzY3JpcHRpb24uaW5uZXJUZXh0ID0gYWNoaWV2ZW1lbnQuZGVzY3JpcHRpb247XG4gICAgICAgIGZyYW1lLmFwcGVuZENoaWxkKHRpdGxlKTtcbiAgICAgICAgZnJhbWUuYXBwZW5kQ2hpbGQoaW1hZ2UpO1xuICAgICAgICBmcmFtZS5hcHBlbmRDaGlsZChkZXNjcmlwdGlvbik7XG4gICAgICAgIHNjcmltLmFwcGVuZENoaWxkKGZyYW1lKTtcbiAgICAgICAgdGhpcy5fc3RhcnRDb25mZXR0aUlubmVyKCk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5fc3RvcENvbmZldHRpSW5uZXIoKSwgMzAwMCk7XG4gICAgICAgIC8vIHdhaXQgZm9yIGNsaWNrIG91dHNpZGUgZnJhbWVcbiAgICAgICAgYXdhaXQgdGhpcy5fd2FpdEZvck5leHRFdmVudChzY3JpbSwgXCJjbGlja1wiKTtcbiAgICAgICAgdGhpcy5fc3RvcENvbmZldHRpSW5uZXIoKTtcbiAgICAgICAgLy8gY2xlYW51cFxuICAgICAgICBzY3JpbS5yZW1vdmUoKTtcbiAgICB9XG4gICAgO1xuICAgIHN0YXRpYyByZXNldFBhcnRpY2xlKHBhcnRpY2xlLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHBhcnRpY2xlLmNvbG9yID0gdGhpcy5fY29sb3JzWyhNYXRoLnJhbmRvbSgpICogdGhpcy5fY29sb3JzLmxlbmd0aCkgfCAwXTtcbiAgICAgICAgcGFydGljbGUueCA9IE1hdGgucmFuZG9tKCkgKiB3aWR0aDtcbiAgICAgICAgcGFydGljbGUueSA9IE1hdGgucmFuZG9tKCkgKiBoZWlnaHQgLSBoZWlnaHQ7XG4gICAgICAgIHBhcnRpY2xlLmRpYW1ldGVyID0gTWF0aC5yYW5kb20oKSAqIDEwICsgNTtcbiAgICAgICAgcGFydGljbGUudGlsdCA9IE1hdGgucmFuZG9tKCkgKiAxMCAtIDEwO1xuICAgICAgICBwYXJ0aWNsZS50aWx0QW5nbGVJbmNyZW1lbnQgPSBNYXRoLnJhbmRvbSgpICogMC4wNyArIDAuMDU7XG4gICAgICAgIHBhcnRpY2xlLnRpbHRBbmdsZSA9IDA7XG4gICAgICAgIHJldHVybiBwYXJ0aWNsZTtcbiAgICB9XG4gICAgc3RhdGljIF9zdGFydENvbmZldHRpSW5uZXIoKSB7XG4gICAgICAgIGxldCB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICBsZXQgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgICBsZXQgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICAgICAgY2FudmFzLnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY29uZmV0dGktY2FudmFzXCIpO1xuICAgICAgICBjYW52YXMuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgXCJkaXNwbGF5OmJsb2NrO3otaW5kZXg6OTk5OTk5O3BvaW50ZXItZXZlbnRzOm5vbmU7IHBvc2l0aW9uOmZpeGVkOyB0b3A6MDsgbGVmdDogMDtcIik7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2FudmFzKTtcbiAgICAgICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICAgICAgY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgIGxldCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgd2hpbGUgKHRoaXMucGFydGljbGVzLmxlbmd0aCA8IHRoaXMubWF4UGFydGljbGVDb3VudClcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnB1c2godGhpcy5yZXNldFBhcnRpY2xlKG5ldyBQYXJ0aWNsZSgpLCB3aWR0aCwgaGVpZ2h0KSk7XG4gICAgICAgIHRoaXMuc3RyZWFtaW5nQ29uZmV0dGkgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25UaW1lciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgcnVuQW5pbWF0aW9uID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcnRpY2xlcy5sZW5ndGggPT09IDApXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uVGltZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVBhcnRpY2xlcygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQYXJ0aWNsZXMoY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uVGltZXIgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJ1bkFuaW1hdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJ1bkFuaW1hdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBfc3RvcENvbmZldHRpSW5uZXIoKSB7XG4gICAgICAgIHRoaXMuc3RyZWFtaW5nQ29uZmV0dGkgPSBmYWxzZTtcbiAgICB9XG4gICAgc3RhdGljIGRyYXdQYXJ0aWNsZXMoY29udGV4dCkge1xuICAgICAgICBsZXQgcGFydGljbGU7XG4gICAgICAgIGxldCB4O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwYXJ0aWNsZSA9IHRoaXMucGFydGljbGVzW2ldO1xuICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGNvbnRleHQubGluZVdpZHRoID0gcGFydGljbGUuZGlhbWV0ZXI7XG4gICAgICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gcGFydGljbGUuY29sb3I7XG4gICAgICAgICAgICB4ID0gcGFydGljbGUueCArIHBhcnRpY2xlLnRpbHQ7XG4gICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyh4ICsgcGFydGljbGUuZGlhbWV0ZXIgLyAyLCBwYXJ0aWNsZS55KTtcbiAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHgsIHBhcnRpY2xlLnkgKyBwYXJ0aWNsZS50aWx0ICsgcGFydGljbGUuZGlhbWV0ZXIgLyAyKTtcbiAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIHVwZGF0ZVBhcnRpY2xlcygpIHtcbiAgICAgICAgbGV0IHdpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgIGxldCBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIGxldCBwYXJ0aWNsZTtcbiAgICAgICAgdGhpcy53YXZlQW5nbGUgKz0gMC4wMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcGFydGljbGUgPSB0aGlzLnBhcnRpY2xlc1tpXTtcbiAgICAgICAgICAgIGlmICghdGhpcy5zdHJlYW1pbmdDb25mZXR0aSAmJiBwYXJ0aWNsZS55IDwgLTE1KVxuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnkgPSBoZWlnaHQgKyAxMDA7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS50aWx0QW5nbGUgKz0gcGFydGljbGUudGlsdEFuZ2xlSW5jcmVtZW50O1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnggKz0gTWF0aC5zaW4odGhpcy53YXZlQW5nbGUpO1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnkgKz0gKE1hdGguY29zKHRoaXMud2F2ZUFuZ2xlKSArIHBhcnRpY2xlLmRpYW1ldGVyICsgdGhpcy5wYXJ0aWNsZVNwZWVkKSAqIDAuNTtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS50aWx0ID0gTWF0aC5zaW4ocGFydGljbGUudGlsdEFuZ2xlKSAqIDE1O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcnRpY2xlLnggPiB3aWR0aCArIDIwIHx8IHBhcnRpY2xlLnggPCAtMjAgfHwgcGFydGljbGUueSA+IGhlaWdodCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0cmVhbWluZ0NvbmZldHRpICYmIHRoaXMucGFydGljbGVzLmxlbmd0aCA8PSB0aGlzLm1heFBhcnRpY2xlQ291bnQpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXRQYXJ0aWNsZShwYXJ0aWNsZSwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBhbHRlcm5hdGUgZmV0Y2ggZm9yIG5vZGUgPDE4XG4gICAgc3RhdGljIGFzeW5jIGZldGNoKHVybCwgaW5pdCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImZldGNoOiBcIiArIGluaXQubWV0aG9kICsgXCI6IFwiICsgdXJsKTtcbiAgICAgICAgY29uc29sZS5sb2coXCIgICAgaGVhZGVyczogXCIgKyBKU09OLnN0cmluZ2lmeShpbml0LmhlYWRlcnMpKTtcbiAgICAgICAgY29uc29sZS5sb2coXCIgICAgYm9keSAgIDogXCIgKyBKU09OLnN0cmluZ2lmeShpbml0LmJvZHkpKTtcbiAgICAgICAgbGV0IHJlc3BvbnNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IGZldGNoKHVybCwgaW5pdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHRoaXMuc3RhdGUuZmV0Y2godXJsLCBpbml0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmV0Y2g6IGVycm9yIHJlc3BvbnNlOiBcIiArIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9XG4gICAgLy8gY29va2llc1xuICAgIHN0YXRpYyBfc2V0Q29va2llKGNuYW1lLCBjdmFsdWUsIGV4ZGF5cykge1xuICAgICAgICBjb25zdCBkID0gbmV3IERhdGUoKTtcbiAgICAgICAgZC5zZXRUaW1lKGQuZ2V0VGltZSgpICsgKGV4ZGF5cyAqIDI0ICogNjAgKiA2MCAqIDEwMDApKTtcbiAgICAgICAgbGV0IGV4cGlyZXMgPSBcImV4cGlyZXM9XCIgKyBkLnRvVVRDU3RyaW5nKCk7XG4gICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNuYW1lICsgXCI9XCIgKyBjdmFsdWUgKyBcIjtcIiArIGV4cGlyZXMgKyBcIjtwYXRoPS9cIjtcbiAgICB9XG4gICAgc3RhdGljIF9nZXRDb29raWUoY25hbWUpIHtcbiAgICAgICAgbGV0IG5hbWUgPSBjbmFtZSArIFwiPVwiO1xuICAgICAgICBsZXQgY2EgPSBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsnKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjYS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGMgPSBjYVtpXTtcbiAgICAgICAgICAgIHdoaWxlIChjLmNoYXJBdCgwKSA9PSAnICcpIHtcbiAgICAgICAgICAgICAgICBjID0gYy5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYy5pbmRleE9mKG5hbWUpID09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYy5zdWJzdHJpbmcobmFtZS5sZW5ndGgsIGMubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG59XG5HRU1TLl9yb290ID0gXCJodHRwczovL2dlbXNhcGkuYmF5ei5haS9hcGkvXCI7XG5HRU1TLnN0YXRlID0ge307XG5HRU1TLl9jb2xvcnMgPSBbXCJEb2RnZXJCbHVlXCIsIFwiT2xpdmVEcmFiXCIsIFwiR29sZFwiLCBcIlBpbmtcIiwgXCJTbGF0ZUJsdWVcIiwgXCJMaWdodEJsdWVcIiwgXCJWaW9sZXRcIiwgXCJQYWxlR3JlZW5cIiwgXCJTdGVlbEJsdWVcIiwgXCJTYW5keUJyb3duXCIsIFwiQ2hvY29sYXRlXCIsIFwiQ3JpbXNvblwiXTtcbkdFTVMuc3RyZWFtaW5nQ29uZmV0dGkgPSBmYWxzZTtcbkdFTVMuYW5pbWF0aW9uVGltZXIgPSBudWxsO1xuR0VNUy5wYXJ0aWNsZXMgPSBbXTtcbkdFTVMud2F2ZUFuZ2xlID0gMDtcbi8vIGNvbmZldHRpIGNvbmZpZ1xuR0VNUy5tYXhQYXJ0aWNsZUNvdW50ID0gMTUwOyAvL3NldCBtYXggY29uZmV0dGkgY291bnRcbkdFTVMucGFydGljbGVTcGVlZCA9IDI7IC8vc2V0IHRoZSBwYXJ0aWNsZSBhbmltYXRpb24gc3BlZWRcbmZ1bmN0aW9uIF9jcmVhdGVTdHlsZSgpIHtcbiAgICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgICBjb25zdCBjc3MgPSBgXG4gICAgLkdFTVMtc2NyaW0ge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICB0b3A6IDA7XG4gICAgICAgIGxlZnQ6IDA7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgfVxuICAgIFxuICAgIC5HRU1TLWFjaGlldmVtZW50LWZyYW1lIHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDVweDtcbiAgICAgICAgYm94LXNoYWRvdzogJzRweCA4cHggMzZweCAjRjRBQUI5JztcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gICAgICAgIHdpZHRoOjYwMHB4O1xuICAgICAgICBoZWlnaHQ6IDQwMHB4O1xuICAgICAgICBmb250LWZhbWlseTogQXJpYWwsIEhlbHZldGljYSwgc2Fucy1zZXJpZjtcbiAgICB9XG4gICAgXG4gICAgLkdFTVMtYWNoaWV2ZW1lbnQtdGl0bGUge1xuICAgICAgICBtYXJnaW46IDEwcHg7XG4gICAgfVxuICAgIFxuICAgIC5HRU1TLWFjaGlldmVtZW50LWltYWdlIHtcbiAgICAgICAgd2lkdGg6IDEwMDtcbiAgICAgICAgaGVpZ2h0OiAxMDA7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDVweDtcbiAgICAgICAgYm94LXNoYWRvdzogJzRweCA4cHggMzZweCAjRjRBQUI5JztcbiAgICB9XG4gICAgXG4gICAgLkdFTVMtYWNoaWV2ZW1lbnQtZGVzY3JpcHRpb24ge1xuICAgICAgICBtYXJnaW46IDEwcHg7XG4gICAgfVxuICAgIGA7XG4gICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIC8vIGluIGJyb3dzZXJcbiAgICBfY3JlYXRlU3R5bGUoKTtcbiAgICB3aW5kb3dbXCJHRU1TXCJdID0gR0VNUztcbn1cbiIsICJpbXBvcnQge0dFTVN9IGZyb20gXCJiYXl6ZS1nZW1zLWFwaVwiO1xuXG4vLyBnYW1lIGVsZW1lbnRzICAgXG5jb25zdCBzY29yZVNwYW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Njb3JlXCIpISBhcyBIVE1MU3BhbkVsZW1lbnQ7XG5jb25zdCBzdGFydEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRcIikhIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuY29uc3QgcGxheUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheVwiKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5jb25zdCBzY29yZUJveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2NvcmVib3hcIikhIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuY29uc3QgZmluaXNoQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNmaW5pc2hcIikhIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuXG5zdGFydEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgc3RhcnQpO1xucGxheUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgc2NvcmUpO1xuZmluaXNoQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmaW5pc2gpO1xuXG4vLyBpbml0IGFuZCBmaXJzdCBldmVudFxuY29uc3QgYXBpS2V5ID0gXCJpMnNsdWxOKVUlN3h2TW9WQUNMU0VZb2dPZWtOUW9XRVwiO1xuY29uc3QgYXBwSWQgPSBcIjM3Njc1YWM4LWMwYzAtNDJlOS04MjkxLTBmOTUyOWRmNWQ0N1wiO1xuR0VNUy5pbml0KHthcGlLZXk6YXBpS2V5LCBhcHBJZDphcHBJZH0pLnRoZW4oKCk9PntcbiAgICBHRU1TLmV2ZW50KFwiRGVtby1HYW1lUGFnZVwiKTtcbiAgICBzdGFydEJ1dHRvbiEuZGlzYWJsZWQgPSBmYWxzZTtcbn0pO1xuXG5mdW5jdGlvbiBzdGFydCgpIHtcbiAgICBHRU1TLmV2ZW50KFwiRGVtby1HYW1lU3RhcnRlZFwiKTtcbiAgICBzY29yZVNwYW4uaW5uZXJUZXh0ID0gXCIwXCI7XG4gICAgcGxheUJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIHNjb3JlQm94LmRpc2FibGVkID0gZmFsc2U7XG4gICAgc3RhcnRCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xufVxuXG5mdW5jdGlvbiBzY29yZSgpIHtcbiAgICBsZXQgbiA9IE51bWJlcihzY29yZVNwYW4uaW5uZXJUZXh0KTtcbiAgICBsZXQgbk5ldyA9IE51bWJlcihzY29yZUJveC52YWx1ZSk7XG4gICAgaWYgKGlzTmFOKG5OZXcpKXtcbiAgICAgICAgbk5ldyA9IDA7XG4gICAgfVxuICAgIG4gKz0gbk5ldztcbiAgICBzY29yZVNwYW4uaW5uZXJUZXh0ID0gU3RyaW5nKG4pO1xuICAgIGZpbmlzaEJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xufVxuXG5mdW5jdGlvbiBmaW5pc2goKSB7XG4gICAgR0VNUy5ldmVudChcIkRlbW8tR2FtZUZpbmlzaGVkXCIsIHt2YWx1ZTpOdW1iZXIoc2NvcmVTcGFuLmlubmVyVGV4dCl9KTtcbiAgICBwbGF5QnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbiAgICBzY29yZUJveC5kaXNhYmxlZCA9IHRydWU7XG4gICAgZmluaXNoQnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbiAgICBzdGFydEJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFTQSxNQUFNLFdBQU4sTUFBZTtBQUFBLElBQ1gsY0FBYztBQUNWLFdBQUssUUFBUTtBQUNiLFdBQUssSUFBSTtBQUNULFdBQUssSUFBSTtBQUNULFdBQUssV0FBVztBQUNoQixXQUFLLE9BQU87QUFDWixXQUFLLHFCQUFxQjtBQUMxQixXQUFLLFlBQVk7QUFBQSxJQUNyQjtBQUFBLEVBQ0o7QUFFTyxNQUFNLE9BQU4sTUFBVztBQUFBLElBSWQsT0FBTyxnQkFBZ0I7QUFDbkIsWUFBTSxrQkFBa0I7QUFBQSxRQUNwQixNQUFNO0FBQUEsUUFDTixPQUFPO0FBQUEsUUFDUCxLQUFLO0FBQUEsUUFD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
