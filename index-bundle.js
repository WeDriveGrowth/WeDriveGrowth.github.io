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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZV9tb2R1bGVzL2JheXplLWdlbXMtYXBpL2Rpc3QvZXNtL2dlbXMuanMiLCAiaW5kZXgudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vXG4vLyB0aGUgb2ZmaWNhbCBHRU1TIEFQSSB3cmFwcGVyIC8gdGFnXG4vLyAoYykgMjAyMysgV2VEcml2ZUdyb3d0aFxuLy9cbi8vIHZlcnNpb246IDAuMS4wXG4vL1xuLy8gY3JlZGl0czpcbi8vIGNvbmZldHRpIGJ5IG1hdGh1c3VtbXV0LCBNSVQgbGljZW5zZTogaHR0cHM6Ly93d3cuY3Nzc2NyaXB0LmNvbS9jb25mZXR0aS1mYWxsaW5nLWFuaW1hdGlvbi9cbjtcbmNsYXNzIFBhcnRpY2xlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jb2xvciA9IFwiXCI7XG4gICAgICAgIHRoaXMueCA9IDA7XG4gICAgICAgIHRoaXMueSA9IDA7XG4gICAgICAgIHRoaXMuZGlhbWV0ZXIgPSAwO1xuICAgICAgICB0aGlzLnRpbHQgPSAwO1xuICAgICAgICB0aGlzLnRpbHRBbmdsZUluY3JlbWVudCA9IDA7XG4gICAgICAgIHRoaXMudGlsdEFuZ2xlID0gMDtcbiAgICB9XG59XG47XG5leHBvcnQgY2xhc3MgR0VNUyB7XG4gICAgLy9cbiAgICAvLyBoZWxwZXJzXG4gICAgLy9cbiAgICBzdGF0aWMgX2dldExvY2FsVGltZSgpIHtcbiAgICAgICAgY29uc3QgZGF0ZURhdGFPcHRpb25zID0ge1xuICAgICAgICAgICAgeWVhcjogJ251bWVyaWMnLFxuICAgICAgICAgICAgbW9udGg6ICcyLWRpZ2l0JyxcbiAgICAgICAgICAgIGRheTogJzItZGlnaXQnLFxuICAgICAgICAgICAgaG91cjogJzItZGlnaXQnLFxuICAgICAgICAgICAgbWludXRlOiAnMi1kaWdpdCcsXG4gICAgICAgICAgICBzZWNvbmQ6ICcyLWRpZ2l0JyxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgdGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnREYXRlVUsgPSB0aW1lLnRvTG9jYWxlU3RyaW5nKCdlbi1VSycsIGRhdGVEYXRhT3B0aW9ucyk7XG4gICAgICAgIHJldHVybiBjdXJyZW50RGF0ZVVLO1xuICAgIH1cbiAgICBzdGF0aWMgYXN5bmMgX3dhaXQobXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBfd2FpdEZvck5leHRFdmVudChlbGVtZW50LCBuYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKG5hbWUsIChlKSA9PiByZXNvbHZlKHRydWUpLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvL1xuICAgIC8vIGV4cG9zZWQgQVBJXG4gICAgLy9cbiAgICBzdGF0aWMgYXN5bmMgaW5pdChwYXJhbXMpIHtcbiAgICAgICAgY29uc29sZS5hc3NlcnQocGFyYW1zLmFwcElkKTtcbiAgICAgICAgY29uc29sZS5hc3NlcnQocGFyYW1zLmFwaUtleSk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IC4uLnBhcmFtcyB9O1xuICAgICAgICBkZWxldGUgdGhpcy5zdGF0ZS5hcGlLZXk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoIXBhcmFtcy51c2VySWQgJiYgcGFyYW1zLnVzZUNvb2tpZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUudXNlcklkID0gdGhpcy5fZ2V0Q29va2llKFwiZ2Vtcy11c2VyLWlkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHVybCA9IHRoaXMuX3Jvb3QgKyBcInVzZXIvXCIgK1xuICAgICAgICAgICAgICAgIHBhcmFtcy5hcHBJZCArXG4gICAgICAgICAgICAgICAgKHBhcmFtcy51c2VySWQgPyBcIi9cIiArIHBhcmFtcy51c2VySWQgOiBcIlwiKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5mZXRjaCh1cmwsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgYXBpa2V5OiBwYXJhbXMuYXBpS2V5LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmV0Y2g6IHJlc3VsdDogXCIgKyBKU09OLnN0cmluZ2lmeShyZXN1bHQpKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUudXNlcklkID0gcmVzdWx0LnVzZXJfaWQ7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLnRva2VuID0gcmVzdWx0LnRva2VuO1xuICAgICAgICAgICAgaWYgKHBhcmFtcy51c2VDb29raWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRDb29raWUoXCJnZW1zLXVzZXItaWRcIiwgdGhpcy5zdGF0ZS51c2VySWQsIDM2NSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVzZXJJZDogdGhpcy5zdGF0ZS51c2VySWQsXG4gICAgICAgICAgICAgICAgdG9rZW46IHRoaXMuc3RhdGUudG9rZW4sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkdFTVMgQVBJIGVycm9yOlwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIHNldENsaWVudENyZWRlbnRpYWxzKGFwcElkLCB1c2VySWQsIHRva2VuKSB7XG4gICAgICAgIHRoaXMuc3RhdGUuYXBwSWQgPSBhcHBJZDtcbiAgICAgICAgdGhpcy5zdGF0ZS51c2VySWQgPSB1c2VySWQ7XG4gICAgICAgIHRoaXMuc3RhdGUudG9rZW4gPSB0b2tlbjtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIGV2ZW50KG5hbWUsIGRhdGEgPSB7fSwgb3B0aW9ucyA9IHsgZGlzcGxheUZpcnN0OiB0cnVlIH0pIHtcbiAgICAgICAgbGV0IHJlc3VsdDtcbiAgICAgICAgY29uc3QgYm9keSA9IHtcbiAgICAgICAgICAgIHVzZXJfaWQ6IHRoaXMuc3RhdGUudXNlcklkLFxuICAgICAgICAgICAgdGFnTmFtZTogbmFtZSxcbiAgICAgICAgICAgIGxvY2FsVGltZTogdGhpcy5fZ2V0TG9jYWxUaW1lKCksXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICB9O1xuICAgICAgICBpZiAoT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoID09PSAxICYmIChcInZhbHVlXCIgaW4gZGF0YSkpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBib2R5W1wiZGF0YVwiXTtcbiAgICAgICAgICAgIGJvZHlbXCJ2YWx1ZVwiXSA9IGRhdGEudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5mZXRjaCh0aGlzLl9yb290ICsgXCJ0YWcvXCIgKyB0aGlzLnN0YXRlLmFwcElkLCB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBcIkJlYXJlciBcIiArIHRoaXMuc3RhdGUudG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwidGV4dC9wbGFpblwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLy8gc2VuZGluZyBib2R5IGFzIHBsYWluIHRleHQgZHVlIHRvIEFXUyBDT1JTIHBvbGljeVxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXN1bHQgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZldGNoOiByZXN1bHQ6IFwiICsgSlNPTi5zdHJpbmdpZnkocmVzdWx0KSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmRpc3BsYXlBbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgYSBvZiByZXN1bHQuYWNoaWV2ZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmRpc3BsYXlBY2hpZXZlbWVudChhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvcHRpb25zLmRpc3BsYXlGaXJzdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmFjaGlldmVtZW50cyAmJiByZXN1bHQuYWNoaWV2ZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZGlzcGxheUFjaGlldmVtZW50KHJlc3VsdC5hY2hpZXZlbWVudHNbMF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJHRU1TIEFQSSBlcnJvcjpcIik7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIDtcbiAgICBzdGF0aWMgYXN5bmMgZGlzcGxheUFjaGlldmVtZW50KGFjaGlldmVtZW50KSB7XG4gICAgICAgIC8vIHNjcmltXG4gICAgICAgIGNvbnN0IHNjcmltID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgc2NyaW0uY2xhc3NOYW1lID0gXCJHRU1TLXNjcmltXCI7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaW0pO1xuICAgICAgICAvLyBmcmFtZVxuICAgICAgICBjb25zdCBmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGZyYW1lLmNsYXNzTmFtZSA9IFwiR0VNUy1hY2hpZXZlbWVudC1mcmFtZVwiO1xuICAgICAgICAvLyBjb250ZW50XG4gICAgICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImgyXCIpO1xuICAgICAgICB0aXRsZS5jbGFzc05hbWUgPSBcIkdFTVMtYWNoaWV2ZW1lbnQtdGl0bGVcIjtcbiAgICAgICAgdGl0bGUuaW5uZXJUZXh0ID0gYWNoaWV2ZW1lbnQudGl0bGU7XG4gICAgICAgIGNvbnN0IGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICAgICAgaW1hZ2UuY2xhc3NOYW1lID0gXCJHRU1TLWFjaGlldmVtZW50LWltYWdlXCI7XG4gICAgICAgIGltYWdlLnNyYyA9IGFjaGlldmVtZW50LmltYWdlO1xuICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoM1wiKTtcbiAgICAgICAgZGVzY3JpcHRpb24uY2xhc3NOYW1lID0gXCJHRU1TLWFjaGlldmVtZW50LWRlc2NyaXB0aW9uXCI7XG4gICAgICAgIGRlc2NyaXB0aW9uLmlubmVyVGV4dCA9IGFjaGlldmVtZW50LmRlc2NyaXB0aW9uO1xuICAgICAgICBmcmFtZS5hcHBlbmRDaGlsZCh0aXRsZSk7XG4gICAgICAgIGZyYW1lLmFwcGVuZENoaWxkKGltYWdlKTtcbiAgICAgICAgZnJhbWUuYXBwZW5kQ2hpbGQoZGVzY3JpcHRpb24pO1xuICAgICAgICBzY3JpbS5hcHBlbmRDaGlsZChmcmFtZSk7XG4gICAgICAgIHRoaXMuX3N0YXJ0Q29uZmV0dGlJbm5lcigpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuX3N0b3BDb25mZXR0aUlubmVyKCksIDMwMDApO1xuICAgICAgICAvLyB3YWl0IGZvciBjbGljayBvdXRzaWRlIGZyYW1lXG4gICAgICAgIGF3YWl0IHRoaXMuX3dhaXRGb3JOZXh0RXZlbnQoc2NyaW0sIFwiY2xpY2tcIik7XG4gICAgICAgIHRoaXMuX3N0b3BDb25mZXR0aUlubmVyKCk7XG4gICAgICAgIC8vIGNsZWFudXBcbiAgICAgICAgc2NyaW0ucmVtb3ZlKCk7XG4gICAgfVxuICAgIDtcbiAgICBzdGF0aWMgcmVzZXRQYXJ0aWNsZShwYXJ0aWNsZSwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgICBwYXJ0aWNsZS5jb2xvciA9IHRoaXMuX2NvbG9yc1soTWF0aC5yYW5kb20oKSAqIHRoaXMuX2NvbG9ycy5sZW5ndGgpIHwgMF07XG4gICAgICAgIHBhcnRpY2xlLnggPSBNYXRoLnJhbmRvbSgpICogd2lkdGg7XG4gICAgICAgIHBhcnRpY2xlLnkgPSBNYXRoLnJhbmRvbSgpICogaGVpZ2h0IC0gaGVpZ2h0O1xuICAgICAgICBwYXJ0aWNsZS5kaWFtZXRlciA9IE1hdGgucmFuZG9tKCkgKiAxMCArIDU7XG4gICAgICAgIHBhcnRpY2xlLnRpbHQgPSBNYXRoLnJhbmRvbSgpICogMTAgLSAxMDtcbiAgICAgICAgcGFydGljbGUudGlsdEFuZ2xlSW5jcmVtZW50ID0gTWF0aC5yYW5kb20oKSAqIDAuMDcgKyAwLjA1O1xuICAgICAgICBwYXJ0aWNsZS50aWx0QW5nbGUgPSAwO1xuICAgICAgICByZXR1cm4gcGFydGljbGU7XG4gICAgfVxuICAgIHN0YXRpYyBfc3RhcnRDb25mZXR0aUlubmVyKCkge1xuICAgICAgICBsZXQgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgbGV0IGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG4gICAgICAgIGNhbnZhcy5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNvbmZldHRpLWNhbnZhc1wiKTtcbiAgICAgICAgY2FudmFzLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIFwiZGlzcGxheTpibG9jazt6LWluZGV4Ojk5OTk5OTtwb2ludGVyLWV2ZW50czpub25lOyBwb3NpdGlvbjpmaXhlZDsgdG9wOjA7IGxlZnQ6IDA7XCIpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIH0sIHRydWUpO1xuICAgICAgICBsZXQgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgIHdoaWxlICh0aGlzLnBhcnRpY2xlcy5sZW5ndGggPCB0aGlzLm1heFBhcnRpY2xlQ291bnQpXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5wdXNoKHRoaXMucmVzZXRQYXJ0aWNsZShuZXcgUGFydGljbGUoKSwgd2lkdGgsIGhlaWdodCkpO1xuICAgICAgICB0aGlzLnN0cmVhbWluZ0NvbmZldHRpID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uVGltZXIgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHJ1bkFuaW1hdGlvbiA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJ0aWNsZXMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvblRpbWVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQYXJ0aWNsZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3UGFydGljbGVzKGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvblRpbWVyID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShydW5BbmltYXRpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBydW5BbmltYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgX3N0b3BDb25mZXR0aUlubmVyKCkge1xuICAgICAgICB0aGlzLnN0cmVhbWluZ0NvbmZldHRpID0gZmFsc2U7XG4gICAgfVxuICAgIHN0YXRpYyBkcmF3UGFydGljbGVzKGNvbnRleHQpIHtcbiAgICAgICAgbGV0IHBhcnRpY2xlO1xuICAgICAgICBsZXQgeDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcGFydGljbGUgPSB0aGlzLnBhcnRpY2xlc1tpXTtcbiAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjb250ZXh0LmxpbmVXaWR0aCA9IHBhcnRpY2xlLmRpYW1ldGVyO1xuICAgICAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IHBhcnRpY2xlLmNvbG9yO1xuICAgICAgICAgICAgeCA9IHBhcnRpY2xlLnggKyBwYXJ0aWNsZS50aWx0O1xuICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oeCArIHBhcnRpY2xlLmRpYW1ldGVyIC8gMiwgcGFydGljbGUueSk7XG4gICAgICAgICAgICBjb250ZXh0LmxpbmVUbyh4LCBwYXJ0aWNsZS55ICsgcGFydGljbGUudGlsdCArIHBhcnRpY2xlLmRpYW1ldGVyIC8gMik7XG4gICAgICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyB1cGRhdGVQYXJ0aWNsZXMoKSB7XG4gICAgICAgIGxldCB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICBsZXQgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgICBsZXQgcGFydGljbGU7XG4gICAgICAgIHRoaXMud2F2ZUFuZ2xlICs9IDAuMDE7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBhcnRpY2xlID0gdGhpcy5wYXJ0aWNsZXNbaV07XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RyZWFtaW5nQ29uZmV0dGkgJiYgcGFydGljbGUueSA8IC0xNSlcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS55ID0gaGVpZ2h0ICsgMTAwO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcGFydGljbGUudGlsdEFuZ2xlICs9IHBhcnRpY2xlLnRpbHRBbmdsZUluY3JlbWVudDtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS54ICs9IE1hdGguc2luKHRoaXMud2F2ZUFuZ2xlKTtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS55ICs9IChNYXRoLmNvcyh0aGlzLndhdmVBbmdsZSkgKyBwYXJ0aWNsZS5kaWFtZXRlciArIHRoaXMucGFydGljbGVTcGVlZCkgKiAwLjU7XG4gICAgICAgICAgICAgICAgcGFydGljbGUudGlsdCA9IE1hdGguc2luKHBhcnRpY2xlLnRpbHRBbmdsZSkgKiAxNTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJ0aWNsZS54ID4gd2lkdGggKyAyMCB8fCBwYXJ0aWNsZS54IDwgLTIwIHx8IHBhcnRpY2xlLnkgPiBoZWlnaHQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdHJlYW1pbmdDb25mZXR0aSAmJiB0aGlzLnBhcnRpY2xlcy5sZW5ndGggPD0gdGhpcy5tYXhQYXJ0aWNsZUNvdW50KVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2V0UGFydGljbGUocGFydGljbGUsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gYWx0ZXJuYXRlIGZldGNoIGZvciBub2RlIDwxOFxuICAgIHN0YXRpYyBhc3luYyBmZXRjaCh1cmwsIGluaXQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJmZXRjaDogXCIgKyBpbml0Lm1ldGhvZCArIFwiOiBcIiArIHVybCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiICAgIGhlYWRlcnM6IFwiICsgSlNPTi5zdHJpbmdpZnkoaW5pdC5oZWFkZXJzKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiICAgIGJvZHkgICA6IFwiICsgSlNPTi5zdHJpbmdpZnkoaW5pdC5ib2R5KSk7XG4gICAgICAgIGxldCByZXNwb25zZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBmZXRjaCh1cmwsIGluaXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB0aGlzLnN0YXRlLmZldGNoKHVybCwgaW5pdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZldGNoOiBlcnJvciByZXNwb25zZTogXCIgKyBlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfVxuICAgIC8vIGNvb2tpZXNcbiAgICBzdGF0aWMgX3NldENvb2tpZShjbmFtZSwgY3ZhbHVlLCBleGRheXMpIHtcbiAgICAgICAgY29uc3QgZCA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGQuc2V0VGltZShkLmdldFRpbWUoKSArIChleGRheXMgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XG4gICAgICAgIGxldCBleHBpcmVzID0gXCJleHBpcmVzPVwiICsgZC50b1VUQ1N0cmluZygpO1xuICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjbmFtZSArIFwiPVwiICsgY3ZhbHVlICsgXCI7XCIgKyBleHBpcmVzICsgXCI7cGF0aD0vXCI7XG4gICAgfVxuICAgIHN0YXRpYyBfZ2V0Q29va2llKGNuYW1lKSB7XG4gICAgICAgIGxldCBuYW1lID0gY25hbWUgKyBcIj1cIjtcbiAgICAgICAgbGV0IGNhID0gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7Jyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2EubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBjID0gY2FbaV07XG4gICAgICAgICAgICB3aGlsZSAoYy5jaGFyQXQoMCkgPT0gJyAnKSB7XG4gICAgICAgICAgICAgICAgYyA9IGMuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGMuaW5kZXhPZihuYW1lKSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGMuc3Vic3RyaW5nKG5hbWUubGVuZ3RoLCBjLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxufVxuR0VNUy5fcm9vdCA9IFwiaHR0cHM6Ly9nZW1zYXBpLmJheXouYWkvYXBpL1wiO1xuR0VNUy5zdGF0ZSA9IHt9O1xuR0VNUy5fY29sb3JzID0gW1wiRG9kZ2VyQmx1ZVwiLCBcIk9saXZlRHJhYlwiLCBcIkdvbGRcIiwgXCJQaW5rXCIsIFwiU2xhdGVCbHVlXCIsIFwiTGlnaHRCbHVlXCIsIFwiVmlvbGV0XCIsIFwiUGFsZUdyZWVuXCIsIFwiU3RlZWxCbHVlXCIsIFwiU2FuZHlCcm93blwiLCBcIkNob2NvbGF0ZVwiLCBcIkNyaW1zb25cIl07XG5HRU1TLnN0cmVhbWluZ0NvbmZldHRpID0gZmFsc2U7XG5HRU1TLmFuaW1hdGlvblRpbWVyID0gbnVsbDtcbkdFTVMucGFydGljbGVzID0gW107XG5HRU1TLndhdmVBbmdsZSA9IDA7XG4vLyBjb25mZXR0aSBjb25maWdcbkdFTVMubWF4UGFydGljbGVDb3VudCA9IDE1MDsgLy9zZXQgbWF4IGNvbmZldHRpIGNvdW50XG5HRU1TLnBhcnRpY2xlU3BlZWQgPSAyOyAvL3NldCB0aGUgcGFydGljbGUgYW5pbWF0aW9uIHNwZWVkXG5mdW5jdGlvbiBfY3JlYXRlU3R5bGUoKSB7XG4gICAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gICAgY29uc3QgY3NzID0gYFxuICAgIC5HRU1TLXNjcmltIHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgdG9wOiAwO1xuICAgICAgICBsZWZ0OiAwO1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgIH1cbiAgICBcbiAgICAuR0VNUy1hY2hpZXZlbWVudC1mcmFtZSB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgICBib3JkZXItcmFkaXVzOiA1cHg7XG4gICAgICAgIGJveC1zaGFkb3c6ICc0cHggOHB4IDM2cHggI0Y0QUFCOSc7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xuICAgICAgICB3aWR0aDo2MDBweDtcbiAgICAgICAgaGVpZ2h0OiA0MDBweDtcbiAgICAgICAgZm9udC1mYW1pbHk6IEFyaWFsLCBIZWx2ZXRpY2EsIHNhbnMtc2VyaWY7XG4gICAgfVxuICAgIFxuICAgIC5HRU1TLWFjaGlldmVtZW50LXRpdGxlIHtcbiAgICAgICAgbWFyZ2luOiAxMHB4O1xuICAgIH1cbiAgICBcbiAgICAuR0VNUy1hY2hpZXZlbWVudC1pbWFnZSB7XG4gICAgICAgIHdpZHRoOiAxMDA7XG4gICAgICAgIGhlaWdodDogMTAwO1xuICAgICAgICBib3JkZXItcmFkaXVzOiA1cHg7XG4gICAgICAgIGJveC1zaGFkb3c6ICc0cHggOHB4IDM2cHggI0Y0QUFCOSc7XG4gICAgfVxuICAgIFxuICAgIC5HRU1TLWFjaGlldmVtZW50LWRlc2NyaXB0aW9uIHtcbiAgICAgICAgbWFyZ2luOiAxMHB4O1xuICAgIH1cbiAgICBgO1xuICAgIHN0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAvLyBpbiBicm93c2VyXG4gICAgX2NyZWF0ZVN0eWxlKCk7XG4gICAgd2luZG93W1wiR0VNU1wiXSA9IEdFTVM7XG59XG4iLCAiaW1wb3J0IHtHRU1TfSBmcm9tIFwiYmF5emUtZ2Vtcy1hcGlcIjtcblxuLy8gZ2FtZSBlbGVtZW50cyAgIFxuY29uc3Qgc2NvcmVTcGFuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzY29yZVwiKSEgYXMgSFRNTFNwYW5FbGVtZW50O1xuY29uc3Qgc3RhcnRCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0XCIpISBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbmNvbnN0IHBsYXlCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXlcIikhIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuY29uc3Qgc2NvcmVCb3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Njb3JlYm94XCIpISBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbmNvbnN0IGZpbmlzaEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZmluaXNoXCIpISBhcyBIVE1MQnV0dG9uRWxlbWVudDtcblxuc3RhcnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHN0YXJ0KTtcbnBsYXlCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHNjb3JlKTtcbmZpbmlzaEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZmluaXNoKTtcblxuLy8gaW5pdCBhbmQgZmlyc3QgZXZlbnRcbmNvbnN0IGFwaUtleSA9IFwiaTJzbHVsTilVJTd4dk1vVkFDTFNFWW9nT2VrTlFvV0VcIjtcbmNvbnN0IGFwcElkID0gXCIzNzY3NWFjOC1jMGMwLTQyZTktODI5MS0wZjk1MjlkZjVkNDdcIjtcbkdFTVMuaW5pdCh7YXBpS2V5OmFwaUtleSwgYXBwSWQ6YXBwSWR9KS50aGVuKCgpPT57XG4gICAgR0VNUy5ldmVudChcIkRlbW8tR2FtZVBhZ2VcIik7XG4gICAgc3RhcnRCdXR0b24hLmRpc2FibGVkID0gZmFsc2U7XG59KTtcblxuZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgR0VNUy5ldmVudChcIkRlbW8tR2FtZVN0YXJ0ZWRcIik7XG4gICAgc2NvcmVTcGFuLmlubmVyVGV4dCA9IFwiMFwiO1xuICAgIHBsYXlCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBzY29yZUJveC5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIHN0YXJ0QnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gc2NvcmUoKSB7XG4gICAgbGV0IG4gPSBOdW1iZXIoc2NvcmVTcGFuLmlubmVyVGV4dCk7XG4gICAgbGV0IG5OZXcgPSBOdW1iZXIoc2NvcmVCb3gudmFsdWUpO1xuICAgIGlmIChpc05hTihuTmV3KSl7XG4gICAgICAgIG5OZXcgPSAwO1xuICAgIH1cbiAgICBuICs9IG5OZXc7XG4gICAgc2NvcmVTcGFuLmlubmVyVGV4dCA9IFN0cmluZyhuKTtcbiAgICBmaW5pc2hCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gZmluaXNoKCkge1xuICAgIEdFTVMuZXZlbnQoXCJEZW1vLUdhbWVGaW5pc2hlZFwiLCB7dmFsdWU6TnVtYmVyKHNjb3JlU3Bhbi5pbm5lclRleHQpfSk7XG4gICAgcGxheUJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgc2NvcmVCb3guZGlzYWJsZWQgPSB0cnVlO1xuICAgIGZpbmlzaEJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgc3RhcnRCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBU0EsTUFBTSxXQUFOLE1BQWU7QUFBQSxJQUNYLGNBQWM7QUFDVixXQUFLLFFBQVE7QUFDYixXQUFLLElBQUk7QUFDVCxXQUFLLElBQUk7QUFDVCxXQUFLLFdBQVc7QUFDaEIsV0FBSyxPQUFPO0FBQ1osV0FBSyxxQkFBcUI7QUFD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
