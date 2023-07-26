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
      this.state = __spreadValues({}, params);
      delete this.state.apiKey;
      try {
        if (LOCALTEST) {
          return {
            userId: "myid",
            token: "my token"
          };
        } else {
          if (!params.userId && params.useCookie) {
            this.state.userId = this._getCookie("gems-user-id");
          }
          let url = this._root + "user/" + params.appId + (params.userId ? "/" + params.userId : "");
          const response = await fetch(url, {
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
        }
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
        if (LOCALTEST) {
          if (data.value > 50) {
            result = {
              achievements: [{
                title: "You scored more than 50 points!",
                image: "https://d2c8cl134xhhwp.cloudfront.net/trophy.png",
                description: "Have a trophy!"
              }]
            };
          } else {
            return {};
          }
        } else {
          const response = await fetch(this._root + "tag/" + this.state.appId, {
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
        }
        if (options.displayAll) {
          for (let a of result.achievements) {
            await this.displayAchievement(a);
          }
        } else if (options.displayFirst) {
          if (result.achievements && result.achievements.length > 0) {
            await this.displayAchievement(result.achievements[0]);
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
  GEMS._root = "https://bayz.ai/api/";
  GEMS.state = {};
  GEMS._colors = ["DodgerBlue", "OliveDrab", "Gold", "Pink", "SlateBlue", "LightBlue", "Violet", "PaleGreen", "SteelBlue", "SandyBrown", "Chocolate", "Crimson"];
  GEMS.streamingConfetti = false;
  GEMS.animationTimer = null;
  GEMS.particles = [];
  GEMS.waveAngle = 0;
  GEMS.maxParticleCount = 150;
  GEMS.particleSpeed = 2;
  var LOCALTEST;
  function _createStyle() {
    if (typeof window === "undefined") {
      return;
    }
    LOCALTEST = location.origin === "file://" || location.origin.startsWith("http://localhost:");
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
  _createStyle();

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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZV9tb2R1bGVzL2JheXotZ2Vtcy1hcGkvZGlzdC9lc20vZ2Vtcy5qcyIsICJpbmRleC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy9cbi8vIHRoZSBvZmZpY2FsIEdFTVMgQVBJIHdyYXBwZXIgLyB0YWdcbi8vIChjKSAyMDIzKyBXZURyaXZlR3Jvd3RoXG4vL1xuLy8gdmVyc2lvbjogMC4xLjBcbi8vXG4vLyBjcmVkaXRzOlxuLy8gY29uZmV0dGkgYnkgbWF0aHVzdW1tdXQsIE1JVCBsaWNlbnNlOiBodHRwczovL3d3dy5jc3NzY3JpcHQuY29tL2NvbmZldHRpLWZhbGxpbmctYW5pbWF0aW9uL1xuO1xuY2xhc3MgUGFydGljbGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNvbG9yID0gXCJcIjtcbiAgICAgICAgdGhpcy54ID0gMDtcbiAgICAgICAgdGhpcy55ID0gMDtcbiAgICAgICAgdGhpcy5kaWFtZXRlciA9IDA7XG4gICAgICAgIHRoaXMudGlsdCA9IDA7XG4gICAgICAgIHRoaXMudGlsdEFuZ2xlSW5jcmVtZW50ID0gMDtcbiAgICAgICAgdGhpcy50aWx0QW5nbGUgPSAwO1xuICAgIH1cbn1cbjtcbmV4cG9ydCBjbGFzcyBHRU1TIHtcbiAgICAvL1xuICAgIC8vIGhlbHBlcnNcbiAgICAvL1xuICAgIHN0YXRpYyBfZ2V0TG9jYWxUaW1lKCkge1xuICAgICAgICBjb25zdCBkYXRlRGF0YU9wdGlvbnMgPSB7XG4gICAgICAgICAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgICAgICAgICBtb250aDogJzItZGlnaXQnLFxuICAgICAgICAgICAgZGF5OiAnMi1kaWdpdCcsXG4gICAgICAgICAgICBob3VyOiAnMi1kaWdpdCcsXG4gICAgICAgICAgICBtaW51dGU6ICcyLWRpZ2l0JyxcbiAgICAgICAgICAgIHNlY29uZDogJzItZGlnaXQnLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB0aW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgY29uc3QgY3VycmVudERhdGVVSyA9IHRpbWUudG9Mb2NhbGVTdHJpbmcoJ2VuLVVLJywgZGF0ZURhdGFPcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnREYXRlVUs7XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBfd2FpdChtcykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIF93YWl0Rm9yTmV4dEV2ZW50KGVsZW1lbnQsIG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgKGUpID0+IHJlc29sdmUodHJ1ZSksIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vXG4gICAgLy8gZXhwb3NlZCBBUElcbiAgICAvL1xuICAgIHN0YXRpYyBhc3luYyBpbml0KHBhcmFtcykge1xuICAgICAgICB0aGlzLnN0YXRlID0geyAuLi5wYXJhbXMgfTtcbiAgICAgICAgZGVsZXRlIHRoaXMuc3RhdGUuYXBpS2V5O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKExPQ0FMVEVTVCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJJZDogXCJteWlkXCIsXG4gICAgICAgICAgICAgICAgICAgIHRva2VuOiBcIm15IHRva2VuXCJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJhbXMudXNlcklkICYmIHBhcmFtcy51c2VDb29raWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS51c2VySWQgPSB0aGlzLl9nZXRDb29raWUoXCJnZW1zLXVzZXItaWRcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCB1cmwgPSB0aGlzLl9yb290ICsgXCJ1c2VyL1wiICtcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmFwcElkICtcbiAgICAgICAgICAgICAgICAgICAgKHBhcmFtcy51c2VySWQgPyBcIi9cIiArIHBhcmFtcy51c2VySWQgOiBcIlwiKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcGlrZXk6IHBhcmFtcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUudXNlcklkID0gcmVzdWx0LnVzZXJfaWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS50b2tlbiA9IHJlc3VsdC50b2tlbjtcbiAgICAgICAgICAgICAgICBpZiAocGFyYW1zLnVzZUNvb2tpZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRDb29raWUoXCJnZW1zLXVzZXItaWRcIiwgdGhpcy5zdGF0ZS51c2VySWQsIDM2NSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJJZDogdGhpcy5zdGF0ZS51c2VySWQsXG4gICAgICAgICAgICAgICAgICAgIHRva2VuOiB0aGlzLnN0YXRlLnRva2VuLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiR0VNUyBBUEkgZXJyb3I6XCIpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgc2V0Q2xpZW50Q3JlZGVudGlhbHMoYXBwSWQsIHVzZXJJZCwgdG9rZW4pIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5hcHBJZCA9IGFwcElkO1xuICAgICAgICB0aGlzLnN0YXRlLnVzZXJJZCA9IHVzZXJJZDtcbiAgICAgICAgdGhpcy5zdGF0ZS50b2tlbiA9IHRva2VuO1xuICAgIH1cbiAgICBzdGF0aWMgYXN5bmMgZXZlbnQobmFtZSwgZGF0YSA9IHt9LCBvcHRpb25zID0geyBkaXNwbGF5Rmlyc3Q6IHRydWUgfSkge1xuICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKExPQ0FMVEVTVCkge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLnZhbHVlID4gNTApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWNoaWV2ZW1lbnRzOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogXCJZb3Ugc2NvcmVkIG1vcmUgdGhhbiA1MCBwb2ludHMhXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlOiBcImh0dHBzOi8vZDJjOGNsMTM0eGhod3AuY2xvdWRmcm9udC5uZXQvdHJvcGh5LnBuZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJIYXZlIGEgdHJvcGh5IVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godGhpcy5fcm9vdCArIFwidGFnL1wiICsgdGhpcy5zdGF0ZS5hcHBJZCwge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBcIkJlYXJlciBcIiArIHRoaXMuc3RhdGUudG9rZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkFjY2VwdFwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogdGhpcy5zdGF0ZS51c2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdOYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxUaW1lOiB0aGlzLl9nZXRMb2NhbFRpbWUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuZGlzcGxheUFsbCkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGEgb2YgcmVzdWx0LmFjaGlldmVtZW50cykge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmRpc3BsYXlBY2hpZXZlbWVudChhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChvcHRpb25zLmRpc3BsYXlGaXJzdCkge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuYWNoaWV2ZW1lbnRzICYmIHJlc3VsdC5hY2hpZXZlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmRpc3BsYXlBY2hpZXZlbWVudChyZXN1bHQuYWNoaWV2ZW1lbnRzWzBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkdFTVMgQVBJIGVycm9yOlwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgO1xuICAgIHN0YXRpYyBhc3luYyBkaXNwbGF5QWNoaWV2ZW1lbnQoYWNoaWV2ZW1lbnQpIHtcbiAgICAgICAgLy8gc2NyaW1cbiAgICAgICAgY29uc3Qgc2NyaW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzY3JpbS5jbGFzc05hbWUgPSBcIkdFTVMtc2NyaW1cIjtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpbSk7XG4gICAgICAgIC8vIGZyYW1lXG4gICAgICAgIGNvbnN0IGZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgZnJhbWUuY2xhc3NOYW1lID0gXCJHRU1TLWFjaGlldmVtZW50LWZyYW1lXCI7XG4gICAgICAgIC8vIGNvbnRlbnRcbiAgICAgICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaDJcIik7XG4gICAgICAgIHRpdGxlLmNsYXNzTmFtZSA9IFwiR0VNUy1hY2hpZXZlbWVudC10aXRsZVwiO1xuICAgICAgICB0aXRsZS5pbm5lclRleHQgPSBhY2hpZXZlbWVudC50aXRsZTtcbiAgICAgICAgY29uc3QgaW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgICAgICBpbWFnZS5jbGFzc05hbWUgPSBcIkdFTVMtYWNoaWV2ZW1lbnQtaW1hZ2VcIjtcbiAgICAgICAgaW1hZ2Uuc3JjID0gYWNoaWV2ZW1lbnQuaW1hZ2U7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImgzXCIpO1xuICAgICAgICBkZXNjcmlwdGlvbi5jbGFzc05hbWUgPSBcIkdFTVMtYWNoaWV2ZW1lbnQtZGVzY3JpcHRpb25cIjtcbiAgICAgICAgZGVzY3JpcHRpb24uaW5uZXJUZXh0ID0gYWNoaWV2ZW1lbnQuZGVzY3JpcHRpb247XG4gICAgICAgIGZyYW1lLmFwcGVuZENoaWxkKHRpdGxlKTtcbiAgICAgICAgZnJhbWUuYXBwZW5kQ2hpbGQoaW1hZ2UpO1xuICAgICAgICBmcmFtZS5hcHBlbmRDaGlsZChkZXNjcmlwdGlvbik7XG4gICAgICAgIHNjcmltLmFwcGVuZENoaWxkKGZyYW1lKTtcbiAgICAgICAgdGhpcy5fc3RhcnRDb25mZXR0aUlubmVyKCk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5fc3RvcENvbmZldHRpSW5uZXIoKSwgMzAwMCk7XG4gICAgICAgIC8vIHdhaXQgZm9yIGNsaWNrIG91dHNpZGUgZnJhbWVcbiAgICAgICAgYXdhaXQgdGhpcy5fd2FpdEZvck5leHRFdmVudChzY3JpbSwgXCJjbGlja1wiKTtcbiAgICAgICAgdGhpcy5fc3RvcENvbmZldHRpSW5uZXIoKTtcbiAgICAgICAgLy8gY2xlYW51cFxuICAgICAgICBzY3JpbS5yZW1vdmUoKTtcbiAgICB9XG4gICAgO1xuICAgIHN0YXRpYyByZXNldFBhcnRpY2xlKHBhcnRpY2xlLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHBhcnRpY2xlLmNvbG9yID0gdGhpcy5fY29sb3JzWyhNYXRoLnJhbmRvbSgpICogdGhpcy5fY29sb3JzLmxlbmd0aCkgfCAwXTtcbiAgICAgICAgcGFydGljbGUueCA9IE1hdGgucmFuZG9tKCkgKiB3aWR0aDtcbiAgICAgICAgcGFydGljbGUueSA9IE1hdGgucmFuZG9tKCkgKiBoZWlnaHQgLSBoZWlnaHQ7XG4gICAgICAgIHBhcnRpY2xlLmRpYW1ldGVyID0gTWF0aC5yYW5kb20oKSAqIDEwICsgNTtcbiAgICAgICAgcGFydGljbGUudGlsdCA9IE1hdGgucmFuZG9tKCkgKiAxMCAtIDEwO1xuICAgICAgICBwYXJ0aWNsZS50aWx0QW5nbGVJbmNyZW1lbnQgPSBNYXRoLnJhbmRvbSgpICogMC4wNyArIDAuMDU7XG4gICAgICAgIHBhcnRpY2xlLnRpbHRBbmdsZSA9IDA7XG4gICAgICAgIHJldHVybiBwYXJ0aWNsZTtcbiAgICB9XG4gICAgc3RhdGljIF9zdGFydENvbmZldHRpSW5uZXIoKSB7XG4gICAgICAgIGxldCB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICBsZXQgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgICBsZXQgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICAgICAgY2FudmFzLnNldEF0dHJpYnV0ZShcImlkXCIsIFwiY29uZmV0dGktY2FudmFzXCIpO1xuICAgICAgICBjYW52YXMuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgXCJkaXNwbGF5OmJsb2NrO3otaW5kZXg6OTk5OTk5O3BvaW50ZXItZXZlbnRzOm5vbmU7IHBvc2l0aW9uOmZpeGVkOyB0b3A6MDsgbGVmdDogMDtcIik7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2FudmFzKTtcbiAgICAgICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICAgICAgY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgIGxldCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgd2hpbGUgKHRoaXMucGFydGljbGVzLmxlbmd0aCA8IHRoaXMubWF4UGFydGljbGVDb3VudClcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnB1c2godGhpcy5yZXNldFBhcnRpY2xlKG5ldyBQYXJ0aWNsZSgpLCB3aWR0aCwgaGVpZ2h0KSk7XG4gICAgICAgIHRoaXMuc3RyZWFtaW5nQ29uZmV0dGkgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25UaW1lciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgcnVuQW5pbWF0aW9uID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcnRpY2xlcy5sZW5ndGggPT09IDApXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uVGltZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVBhcnRpY2xlcygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdQYXJ0aWNsZXMoY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uVGltZXIgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJ1bkFuaW1hdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJ1bkFuaW1hdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBfc3RvcENvbmZldHRpSW5uZXIoKSB7XG4gICAgICAgIHRoaXMuc3RyZWFtaW5nQ29uZmV0dGkgPSBmYWxzZTtcbiAgICB9XG4gICAgc3RhdGljIGRyYXdQYXJ0aWNsZXMoY29udGV4dCkge1xuICAgICAgICBsZXQgcGFydGljbGU7XG4gICAgICAgIGxldCB4O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwYXJ0aWNsZSA9IHRoaXMucGFydGljbGVzW2ldO1xuICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGNvbnRleHQubGluZVdpZHRoID0gcGFydGljbGUuZGlhbWV0ZXI7XG4gICAgICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gcGFydGljbGUuY29sb3I7XG4gICAgICAgICAgICB4ID0gcGFydGljbGUueCArIHBhcnRpY2xlLnRpbHQ7XG4gICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyh4ICsgcGFydGljbGUuZGlhbWV0ZXIgLyAyLCBwYXJ0aWNsZS55KTtcbiAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHgsIHBhcnRpY2xlLnkgKyBwYXJ0aWNsZS50aWx0ICsgcGFydGljbGUuZGlhbWV0ZXIgLyAyKTtcbiAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIHVwZGF0ZVBhcnRpY2xlcygpIHtcbiAgICAgICAgbGV0IHdpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgIGxldCBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIGxldCBwYXJ0aWNsZTtcbiAgICAgICAgdGhpcy53YXZlQW5nbGUgKz0gMC4wMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhcnRpY2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcGFydGljbGUgPSB0aGlzLnBhcnRpY2xlc1tpXTtcbiAgICAgICAgICAgIGlmICghdGhpcy5zdHJlYW1pbmdDb25mZXR0aSAmJiBwYXJ0aWNsZS55IDwgLTE1KVxuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnkgPSBoZWlnaHQgKyAxMDA7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS50aWx0QW5nbGUgKz0gcGFydGljbGUudGlsdEFuZ2xlSW5jcmVtZW50O1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnggKz0gTWF0aC5zaW4odGhpcy53YXZlQW5nbGUpO1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnkgKz0gKE1hdGguY29zKHRoaXMud2F2ZUFuZ2xlKSArIHBhcnRpY2xlLmRpYW1ldGVyICsgdGhpcy5wYXJ0aWNsZVNwZWVkKSAqIDAuNTtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS50aWx0ID0gTWF0aC5zaW4ocGFydGljbGUudGlsdEFuZ2xlKSAqIDE1O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcnRpY2xlLnggPiB3aWR0aCArIDIwIHx8IHBhcnRpY2xlLnggPCAtMjAgfHwgcGFydGljbGUueSA+IGhlaWdodCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0cmVhbWluZ0NvbmZldHRpICYmIHRoaXMucGFydGljbGVzLmxlbmd0aCA8PSB0aGlzLm1heFBhcnRpY2xlQ291bnQpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXRQYXJ0aWNsZShwYXJ0aWNsZSwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBjb29raWVzXG4gICAgc3RhdGljIF9zZXRDb29raWUoY25hbWUsIGN2YWx1ZSwgZXhkYXlzKSB7XG4gICAgICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBkLnNldFRpbWUoZC5nZXRUaW1lKCkgKyAoZXhkYXlzICogMjQgKiA2MCAqIDYwICogMTAwMCkpO1xuICAgICAgICBsZXQgZXhwaXJlcyA9IFwiZXhwaXJlcz1cIiArIGQudG9VVENTdHJpbmcoKTtcbiAgICAgICAgZG9jdW1lbnQuY29va2llID0gY25hbWUgKyBcIj1cIiArIGN2YWx1ZSArIFwiO1wiICsgZXhwaXJlcyArIFwiO3BhdGg9L1wiO1xuICAgIH1cbiAgICBzdGF0aWMgX2dldENvb2tpZShjbmFtZSkge1xuICAgICAgICBsZXQgbmFtZSA9IGNuYW1lICsgXCI9XCI7XG4gICAgICAgIGxldCBjYSA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgYyA9IGNhW2ldO1xuICAgICAgICAgICAgd2hpbGUgKGMuY2hhckF0KDApID09ICcgJykge1xuICAgICAgICAgICAgICAgIGMgPSBjLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjLmluZGV4T2YobmFtZSkgPT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjLnN1YnN0cmluZyhuYW1lLmxlbmd0aCwgYy5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbn1cbkdFTVMuX3Jvb3QgPSBcImh0dHBzOi8vYmF5ei5haS9hcGkvXCI7XG5HRU1TLnN0YXRlID0ge307XG5HRU1TLl9jb2xvcnMgPSBbXCJEb2RnZXJCbHVlXCIsIFwiT2xpdmVEcmFiXCIsIFwiR29sZFwiLCBcIlBpbmtcIiwgXCJTbGF0ZUJsdWVcIiwgXCJMaWdodEJsdWVcIiwgXCJWaW9sZXRcIiwgXCJQYWxlR3JlZW5cIiwgXCJTdGVlbEJsdWVcIiwgXCJTYW5keUJyb3duXCIsIFwiQ2hvY29sYXRlXCIsIFwiQ3JpbXNvblwiXTtcbkdFTVMuc3RyZWFtaW5nQ29uZmV0dGkgPSBmYWxzZTtcbkdFTVMuYW5pbWF0aW9uVGltZXIgPSBudWxsO1xuR0VNUy5wYXJ0aWNsZXMgPSBbXTtcbkdFTVMud2F2ZUFuZ2xlID0gMDtcbi8vIGNvbmZldHRpIGNvbmZpZ1xuR0VNUy5tYXhQYXJ0aWNsZUNvdW50ID0gMTUwOyAvL3NldCBtYXggY29uZmV0dGkgY291bnRcbkdFTVMucGFydGljbGVTcGVlZCA9IDI7IC8vc2V0IHRoZSBwYXJ0aWNsZSBhbmltYXRpb24gc3BlZWRcbmxldCBMT0NBTFRFU1Q7XG5mdW5jdGlvbiBfY3JlYXRlU3R5bGUoKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBMT0NBTFRFU1QgPSAobG9jYXRpb24ub3JpZ2luID09PSBcImZpbGU6Ly9cIiB8fCBsb2NhdGlvbi5vcmlnaW4uc3RhcnRzV2l0aChcImh0dHA6Ly9sb2NhbGhvc3Q6XCIpKTtcbiAgICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgICBjb25zdCBjc3MgPSBgXG4gICAgLkdFTVMtc2NyaW0ge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICB0b3A6IDA7XG4gICAgICAgIGxlZnQ6IDA7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgfVxuICAgIFxuICAgIC5HRU1TLWFjaGlldmVtZW50LWZyYW1lIHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDVweDtcbiAgICAgICAgYm94LXNoYWRvdzogJzRweCA4cHggMzZweCAjRjRBQUI5JztcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gICAgICAgIHdpZHRoOjYwMHB4O1xuICAgICAgICBoZWlnaHQ6IDQwMHB4O1xuICAgICAgICBmb250LWZhbWlseTogQXJpYWwsIEhlbHZldGljYSwgc2Fucy1zZXJpZjtcbiAgICB9XG4gICAgXG4gICAgLkdFTVMtYWNoaWV2ZW1lbnQtdGl0bGUge1xuICAgICAgICBtYXJnaW46IDEwcHg7XG4gICAgfVxuICAgIFxuICAgIC5HRU1TLWFjaGlldmVtZW50LWltYWdlIHtcbiAgICAgICAgd2lkdGg6IDEwMDtcbiAgICAgICAgaGVpZ2h0OiAxMDA7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDVweDtcbiAgICAgICAgYm94LXNoYWRvdzogJzRweCA4cHggMzZweCAjRjRBQUI5JztcbiAgICB9XG4gICAgXG4gICAgLkdFTVMtYWNoaWV2ZW1lbnQtZGVzY3JpcHRpb24ge1xuICAgICAgICBtYXJnaW46IDEwcHg7XG4gICAgfVxuICAgIGA7XG4gICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5fY3JlYXRlU3R5bGUoKTtcbiIsICJpbXBvcnQge0dFTVN9IGZyb20gXCJiYXl6LWdlbXMtYXBpXCI7XG5cbi8vIGdhbWUgZWxlbWVudHMgICBcbmNvbnN0IHNjb3JlU3BhbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2NvcmVcIikhIGFzIEhUTUxTcGFuRWxlbWVudDtcbmNvbnN0IHN0YXJ0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFwiKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5jb25zdCBwbGF5QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5XCIpISBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbmNvbnN0IHNjb3JlQm94ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzY29yZWJveFwiKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5jb25zdCBmaW5pc2hCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2ZpbmlzaFwiKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5cbnN0YXJ0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzdGFydCk7XG5wbGF5QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzY29yZSk7XG5maW5pc2hCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZpbmlzaCk7XG5cbi8vIGluaXQgYW5kIGZpcnN0IGV2ZW50XG5jb25zdCBhcGlLZXkgPSBcImkyc2x1bE4pVSU3eHZNb1ZBQ0xTRVlvZ09la05Rb1dFXCI7XG5jb25zdCBhcHBJZCA9IFwiMzc2NzVhYzgtYzBjMC00MmU5LTgyOTEtMGY5NTI5ZGY1ZDQ3XCI7XG5HRU1TLmluaXQoe2FwaUtleSwgYXBwSWR9KS50aGVuKCgpPT57XG4gICAgR0VNUy5ldmVudChcIkRlbW8tR2FtZVBhZ2VcIik7XG4gICAgc3RhcnRCdXR0b24hLmRpc2FibGVkID0gZmFsc2U7XG59KTtcblxuZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgR0VNUy5ldmVudChcIkRlbW8tR2FtZVN0YXJ0ZWRcIik7XG4gICAgc2NvcmVTcGFuLmlubmVyVGV4dCA9IFwiMFwiO1xuICAgIHBsYXlCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBzY29yZUJveC5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIHN0YXJ0QnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gc2NvcmUoKSB7XG4gICAgbGV0IG4gPSBOdW1iZXIoc2NvcmVTcGFuLmlubmVyVGV4dCk7XG4gICAgbGV0IG5OZXcgPSBOdW1iZXIoc2NvcmVCb3gudmFsdWUpO1xuICAgIGlmIChpc05hTihuTmV3KSl7XG4gICAgICAgIG5OZXcgPSAwO1xuICAgIH1cbiAgICBuICs9IG5OZXc7XG4gICAgc2NvcmVTcGFuLmlubmVyVGV4dCA9IFN0cmluZyhuKTtcbiAgICBmaW5pc2hCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gZmluaXNoKCkge1xuICAgIEdFTVMuZXZlbnQoXCJEZW1vLUdhbWVGaW5pc2hlZFwiLCB7dmFsdWU6TnVtYmVyKHNjb3JlU3Bhbi5pbm5lclRleHQpfSk7XG4gICAgcGxheUJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgc2NvcmVCb3guZGlzYWJsZWQgPSB0cnVlO1xuICAgIGZpbmlzaEJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgc3RhcnRCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBU0EsTUFBTSxXQUFOLE1BQWU7QUFBQSxJQUNYLGNBQWM7QUFDVixXQUFLLFFBQVE7QUFDYixXQUFLLElBQUk7QUFDVCxXQUFLLElBQUk7QUFDVCxXQUFLLFdBQVc7QUFDaEIsV0FBSyxPQUFPO0FBQ1osV0FBSyxxQkFBcUI7QUFDMUIsV0FBSyxZQUFZO0FBQUEsSUFDckI7QUFBQSxFQUNKO0FBRU8sTUFBTSxPQUFOLE1BQVc7QUFBQSxJQUlkLE9BQU8sZ0JBQWdCO0FBQ25CLFlBQU0sa0JBQWtCO0FBQUEsUUFDcEIsTUFBTTtBQUFBLFFBQ04sT0FBTztBQUFBLFFBQ1AsS0FBSztBQUFBLFFBQ0wsTUFBTTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsUUFBUTtBQUFBLE1BQ1o7QUFD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
