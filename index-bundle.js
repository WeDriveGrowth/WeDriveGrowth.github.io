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
    LOCALTEST = location.origin === "file://" || location.origin.startsWith("http://localhost:");
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZV9tb2R1bGVzL2JheXotZ2Vtcy1hcGkvZGlzdC9lc20vZ2Vtcy5qcyIsICJpbmRleC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy9cbi8vIHRoZSBvZmZpY2FsIEdFTVMgQVBJIHdyYXBwZXIgLyB0YWdcbi8vIChjKSAyMDIzKyBXZURyaXZlR3Jvd3RoXG4vL1xuLy8gdmVyc2lvbjogMC4xLjBcbi8vXG4vLyBjcmVkaXRzOlxuLy8gY29uZmV0dGkgYnkgbWF0aHVzdW1tdXQsIE1JVCBsaWNlbnNlOiBodHRwczovL3d3dy5jc3NzY3JpcHQuY29tL2NvbmZldHRpLWZhbGxpbmctYW5pbWF0aW9uL1xuO1xuY2xhc3MgUGFydGljbGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNvbG9yID0gXCJcIjtcbiAgICAgICAgdGhpcy54ID0gMDtcbiAgICAgICAgdGhpcy55ID0gMDtcbiAgICAgICAgdGhpcy5kaWFtZXRlciA9IDA7XG4gICAgICAgIHRoaXMudGlsdCA9IDA7XG4gICAgICAgIHRoaXMudGlsdEFuZ2xlSW5jcmVtZW50ID0gMDtcbiAgICAgICAgdGhpcy50aWx0QW5nbGUgPSAwO1xuICAgIH1cbn1cbjtcbmV4cG9ydCBjbGFzcyBHRU1TIHtcbiAgICAvL1xuICAgIC8vIGhlbHBlcnNcbiAgICAvL1xuICAgIHN0YXRpYyBfZ2V0TG9jYWxUaW1lKCkge1xuICAgICAgICBjb25zdCBkYXRlRGF0YU9wdGlvbnMgPSB7XG4gICAgICAgICAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgICAgICAgICBtb250aDogJzItZGlnaXQnLFxuICAgICAgICAgICAgZGF5OiAnMi1kaWdpdCcsXG4gICAgICAgICAgICBob3VyOiAnMi1kaWdpdCcsXG4gICAgICAgICAgICBtaW51dGU6ICcyLWRpZ2l0JyxcbiAgICAgICAgICAgIHNlY29uZDogJzItZGlnaXQnLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB0aW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgY29uc3QgY3VycmVudERhdGVVSyA9IHRpbWUudG9Mb2NhbGVTdHJpbmcoJ2VuLVVLJywgZGF0ZURhdGFPcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnREYXRlVUs7XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBfd2FpdChtcykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIF93YWl0Rm9yTmV4dEV2ZW50KGVsZW1lbnQsIG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgKGUpID0+IHJlc29sdmUodHJ1ZSksIHsgb25jZTogdHJ1ZSB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vXG4gICAgLy8gZXhwb3NlZCBBUElcbiAgICAvL1xuICAgIHN0YXRpYyBhc3luYyBpbml0KHBhcmFtcykge1xuICAgICAgICB0aGlzLnN0YXRlID0geyAuLi5wYXJhbXMgfTtcbiAgICAgICAgZGVsZXRlIHRoaXMuc3RhdGUuYXBpS2V5O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKExPQ0FMVEVTVCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJJZDogXCJteWlkXCIsXG4gICAgICAgICAgICAgICAgICAgIHRva2VuOiBcIm15IHRva2VuXCJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJhbXMudXNlcklkICYmIHBhcmFtcy51c2VDb29raWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS51c2VySWQgPSB0aGlzLl9nZXRDb29raWUoXCJnZW1zLXVzZXItaWRcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCB1cmwgPSB0aGlzLl9yb290ICsgXCJ1c2VyL1wiICtcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmFwcElkICtcbiAgICAgICAgICAgICAgICAgICAgKHBhcmFtcy51c2VySWQgPyBcIi9cIiArIHBhcmFtcy51c2VySWQgOiBcIlwiKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcGlrZXk6IHBhcmFtcy5hcGlLZXksXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUudXNlcklkID0gcmVzdWx0LnVzZXJfaWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS50b2tlbiA9IHJlc3VsdC50b2tlbjtcbiAgICAgICAgICAgICAgICBpZiAocGFyYW1zLnVzZUNvb2tpZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRDb29raWUoXCJnZW1zLXVzZXItaWRcIiwgdGhpcy5zdGF0ZS51c2VySWQsIDM2NSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJJZDogdGhpcy5zdGF0ZS51c2VySWQsXG4gICAgICAgICAgICAgICAgICAgIHRva2VuOiB0aGlzLnN0YXRlLnRva2VuLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiR0VNUyBBUEkgZXJyb3I6XCIpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgc2V0Q2xpZW50Q3JlZGVudGlhbHMoYXBwSWQsIHVzZXJJZCwgdG9rZW4pIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5hcHBJZCA9IGFwcElkO1xuICAgICAgICB0aGlzLnN0YXRlLnVzZXJJZCA9IHVzZXJJZDtcbiAgICAgICAgdGhpcy5zdGF0ZS50b2tlbiA9IHRva2VuO1xuICAgIH1cbiAgICBzdGF0aWMgYXN5bmMgZXZlbnQobmFtZSwgZGF0YSA9IHt9LCBvcHRpb25zID0geyBkaXNwbGF5Rmlyc3Q6IHRydWUgfSkge1xuICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKExPQ0FMVEVTVCkge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLnZhbHVlID4gNTApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWNoaWV2ZW1lbnRzOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogXCJZb3Ugc2NvcmVkIG1vcmUgdGhhbiA1MCBwb2ludHMhXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlOiBcImh0dHBzOi8vZDJjOGNsMTM0eGhod3AuY2xvdWRmcm9udC5uZXQvdHJvcGh5LnBuZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJIYXZlIGEgdHJvcGh5IVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godGhpcy5fcm9vdCArIFwidGFnL1wiICsgdGhpcy5zdGF0ZS5hcHBJZCwge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBcIkJlYXJlciBcIiArIHRoaXMuc3RhdGUudG9rZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkFjY2VwdFwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogdGhpcy5zdGF0ZS51c2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdOYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxUaW1lOiB0aGlzLl9nZXRMb2NhbFRpbWUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5kaXNwbGF5QWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGEgb2YgcmVzdWx0LmFjaGlldmVtZW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5kaXNwbGF5QWNoaWV2ZW1lbnQoYSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5kaXNwbGF5Rmlyc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5hY2hpZXZlbWVudHMgJiYgcmVzdWx0LmFjaGlldmVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmRpc3BsYXlBY2hpZXZlbWVudChyZXN1bHQuYWNoaWV2ZW1lbnRzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiR0VNUyBBUEkgZXJyb3I6XCIpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICA7XG4gICAgc3RhdGljIGFzeW5jIGRpc3BsYXlBY2hpZXZlbWVudChhY2hpZXZlbWVudCkge1xuICAgICAgICAvLyBzY3JpbVxuICAgICAgICBjb25zdCBzY3JpbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHNjcmltLmNsYXNzTmFtZSA9IFwiR0VNUy1zY3JpbVwiO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmltKTtcbiAgICAgICAgLy8gZnJhbWVcbiAgICAgICAgY29uc3QgZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBmcmFtZS5jbGFzc05hbWUgPSBcIkdFTVMtYWNoaWV2ZW1lbnQtZnJhbWVcIjtcbiAgICAgICAgLy8gY29udGVudFxuICAgICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoMlwiKTtcbiAgICAgICAgdGl0bGUuY2xhc3NOYW1lID0gXCJHRU1TLWFjaGlldmVtZW50LXRpdGxlXCI7XG4gICAgICAgIHRpdGxlLmlubmVyVGV4dCA9IGFjaGlldmVtZW50LnRpdGxlO1xuICAgICAgICBjb25zdCBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgICAgIGltYWdlLmNsYXNzTmFtZSA9IFwiR0VNUy1hY2hpZXZlbWVudC1pbWFnZVwiO1xuICAgICAgICBpbWFnZS5zcmMgPSBhY2hpZXZlbWVudC5pbWFnZTtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaDNcIik7XG4gICAgICAgIGRlc2NyaXB0aW9uLmNsYXNzTmFtZSA9IFwiR0VNUy1hY2hpZXZlbWVudC1kZXNjcmlwdGlvblwiO1xuICAgICAgICBkZXNjcmlwdGlvbi5pbm5lclRleHQgPSBhY2hpZXZlbWVudC5kZXNjcmlwdGlvbjtcbiAgICAgICAgZnJhbWUuYXBwZW5kQ2hpbGQodGl0bGUpO1xuICAgICAgICBmcmFtZS5hcHBlbmRDaGlsZChpbWFnZSk7XG4gICAgICAgIGZyYW1lLmFwcGVuZENoaWxkKGRlc2NyaXB0aW9uKTtcbiAgICAgICAgc2NyaW0uYXBwZW5kQ2hpbGQoZnJhbWUpO1xuICAgICAgICB0aGlzLl9zdGFydENvbmZldHRpSW5uZXIoKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLl9zdG9wQ29uZmV0dGlJbm5lcigpLCAzMDAwKTtcbiAgICAgICAgLy8gd2FpdCBmb3IgY2xpY2sgb3V0c2lkZSBmcmFtZVxuICAgICAgICBhd2FpdCB0aGlzLl93YWl0Rm9yTmV4dEV2ZW50KHNjcmltLCBcImNsaWNrXCIpO1xuICAgICAgICB0aGlzLl9zdG9wQ29uZmV0dGlJbm5lcigpO1xuICAgICAgICAvLyBjbGVhbnVwXG4gICAgICAgIHNjcmltLnJlbW92ZSgpO1xuICAgIH1cbiAgICA7XG4gICAgc3RhdGljIHJlc2V0UGFydGljbGUocGFydGljbGUsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgcGFydGljbGUuY29sb3IgPSB0aGlzLl9jb2xvcnNbKE1hdGgucmFuZG9tKCkgKiB0aGlzLl9jb2xvcnMubGVuZ3RoKSB8IDBdO1xuICAgICAgICBwYXJ0aWNsZS54ID0gTWF0aC5yYW5kb20oKSAqIHdpZHRoO1xuICAgICAgICBwYXJ0aWNsZS55ID0gTWF0aC5yYW5kb20oKSAqIGhlaWdodCAtIGhlaWdodDtcbiAgICAgICAgcGFydGljbGUuZGlhbWV0ZXIgPSBNYXRoLnJhbmRvbSgpICogMTAgKyA1O1xuICAgICAgICBwYXJ0aWNsZS50aWx0ID0gTWF0aC5yYW5kb20oKSAqIDEwIC0gMTA7XG4gICAgICAgIHBhcnRpY2xlLnRpbHRBbmdsZUluY3JlbWVudCA9IE1hdGgucmFuZG9tKCkgKiAwLjA3ICsgMC4wNTtcbiAgICAgICAgcGFydGljbGUudGlsdEFuZ2xlID0gMDtcbiAgICAgICAgcmV0dXJuIHBhcnRpY2xlO1xuICAgIH1cbiAgICBzdGF0aWMgX3N0YXJ0Q29uZmV0dGlJbm5lcigpIHtcbiAgICAgICAgbGV0IHdpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgIGxldCBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgICBjYW52YXMuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJjb25mZXR0aS1jYW52YXNcIik7XG4gICAgICAgIGNhbnZhcy5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBcImRpc3BsYXk6YmxvY2s7ei1pbmRleDo5OTk5OTk7cG9pbnRlci1ldmVudHM6bm9uZTsgcG9zaXRpb246Zml4ZWQ7IHRvcDowOyBsZWZ0OiAwO1wiKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpO1xuICAgICAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgbGV0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICB3aGlsZSAodGhpcy5wYXJ0aWNsZXMubGVuZ3RoIDwgdGhpcy5tYXhQYXJ0aWNsZUNvdW50KVxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMucHVzaCh0aGlzLnJlc2V0UGFydGljbGUobmV3IFBhcnRpY2xlKCksIHdpZHRoLCBoZWlnaHQpKTtcbiAgICAgICAgdGhpcy5zdHJlYW1pbmdDb25mZXR0aSA9IHRydWU7XG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvblRpbWVyID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBydW5BbmltYXRpb24gPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucGFydGljbGVzLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbmltYXRpb25UaW1lciA9IG51bGw7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUGFydGljbGVzKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BhcnRpY2xlcyhjb250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbmltYXRpb25UaW1lciA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocnVuQW5pbWF0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcnVuQW5pbWF0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIF9zdG9wQ29uZmV0dGlJbm5lcigpIHtcbiAgICAgICAgdGhpcy5zdHJlYW1pbmdDb25mZXR0aSA9IGZhbHNlO1xuICAgIH1cbiAgICBzdGF0aWMgZHJhd1BhcnRpY2xlcyhjb250ZXh0KSB7XG4gICAgICAgIGxldCBwYXJ0aWNsZTtcbiAgICAgICAgbGV0IHg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBhcnRpY2xlID0gdGhpcy5wYXJ0aWNsZXNbaV07XG4gICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY29udGV4dC5saW5lV2lkdGggPSBwYXJ0aWNsZS5kaWFtZXRlcjtcbiAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBwYXJ0aWNsZS5jb2xvcjtcbiAgICAgICAgICAgIHggPSBwYXJ0aWNsZS54ICsgcGFydGljbGUudGlsdDtcbiAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHggKyBwYXJ0aWNsZS5kaWFtZXRlciAvIDIsIHBhcnRpY2xlLnkpO1xuICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeCwgcGFydGljbGUueSArIHBhcnRpY2xlLnRpbHQgKyBwYXJ0aWNsZS5kaWFtZXRlciAvIDIpO1xuICAgICAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgdXBkYXRlUGFydGljbGVzKCkge1xuICAgICAgICBsZXQgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgbGV0IGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgbGV0IHBhcnRpY2xlO1xuICAgICAgICB0aGlzLndhdmVBbmdsZSArPSAwLjAxO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGFydGljbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwYXJ0aWNsZSA9IHRoaXMucGFydGljbGVzW2ldO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN0cmVhbWluZ0NvbmZldHRpICYmIHBhcnRpY2xlLnkgPCAtMTUpXG4gICAgICAgICAgICAgICAgcGFydGljbGUueSA9IGhlaWdodCArIDEwMDtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnRpbHRBbmdsZSArPSBwYXJ0aWNsZS50aWx0QW5nbGVJbmNyZW1lbnQ7XG4gICAgICAgICAgICAgICAgcGFydGljbGUueCArPSBNYXRoLnNpbih0aGlzLndhdmVBbmdsZSk7XG4gICAgICAgICAgICAgICAgcGFydGljbGUueSArPSAoTWF0aC5jb3ModGhpcy53YXZlQW5nbGUpICsgcGFydGljbGUuZGlhbWV0ZXIgKyB0aGlzLnBhcnRpY2xlU3BlZWQpICogMC41O1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnRpbHQgPSBNYXRoLnNpbihwYXJ0aWNsZS50aWx0QW5nbGUpICogMTU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFydGljbGUueCA+IHdpZHRoICsgMjAgfHwgcGFydGljbGUueCA8IC0yMCB8fCBwYXJ0aWNsZS55ID4gaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RyZWFtaW5nQ29uZmV0dGkgJiYgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoIDw9IHRoaXMubWF4UGFydGljbGVDb3VudClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldFBhcnRpY2xlKHBhcnRpY2xlLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vIGNvb2tpZXNcbiAgICBzdGF0aWMgX3NldENvb2tpZShjbmFtZSwgY3ZhbHVlLCBleGRheXMpIHtcbiAgICAgICAgY29uc3QgZCA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGQuc2V0VGltZShkLmdldFRpbWUoKSArIChleGRheXMgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XG4gICAgICAgIGxldCBleHBpcmVzID0gXCJleHBpcmVzPVwiICsgZC50b1VUQ1N0cmluZygpO1xuICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjbmFtZSArIFwiPVwiICsgY3ZhbHVlICsgXCI7XCIgKyBleHBpcmVzICsgXCI7cGF0aD0vXCI7XG4gICAgfVxuICAgIHN0YXRpYyBfZ2V0Q29va2llKGNuYW1lKSB7XG4gICAgICAgIGxldCBuYW1lID0gY25hbWUgKyBcIj1cIjtcbiAgICAgICAgbGV0IGNhID0gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7Jyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2EubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBjID0gY2FbaV07XG4gICAgICAgICAgICB3aGlsZSAoYy5jaGFyQXQoMCkgPT0gJyAnKSB7XG4gICAgICAgICAgICAgICAgYyA9IGMuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGMuaW5kZXhPZihuYW1lKSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGMuc3Vic3RyaW5nKG5hbWUubGVuZ3RoLCBjLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxufVxuR0VNUy5fcm9vdCA9IFwiaHR0cHM6Ly9iYXl6LmFpL2FwaS9cIjtcbkdFTVMuc3RhdGUgPSB7fTtcbkdFTVMuX2NvbG9ycyA9IFtcIkRvZGdlckJsdWVcIiwgXCJPbGl2ZURyYWJcIiwgXCJHb2xkXCIsIFwiUGlua1wiLCBcIlNsYXRlQmx1ZVwiLCBcIkxpZ2h0Qmx1ZVwiLCBcIlZpb2xldFwiLCBcIlBhbGVHcmVlblwiLCBcIlN0ZWVsQmx1ZVwiLCBcIlNhbmR5QnJvd25cIiwgXCJDaG9jb2xhdGVcIiwgXCJDcmltc29uXCJdO1xuR0VNUy5zdHJlYW1pbmdDb25mZXR0aSA9IGZhbHNlO1xuR0VNUy5hbmltYXRpb25UaW1lciA9IG51bGw7XG5HRU1TLnBhcnRpY2xlcyA9IFtdO1xuR0VNUy53YXZlQW5nbGUgPSAwO1xuLy8gY29uZmV0dGkgY29uZmlnXG5HRU1TLm1heFBhcnRpY2xlQ291bnQgPSAxNTA7IC8vc2V0IG1heCBjb25mZXR0aSBjb3VudFxuR0VNUy5wYXJ0aWNsZVNwZWVkID0gMjsgLy9zZXQgdGhlIHBhcnRpY2xlIGFuaW1hdGlvbiBzcGVlZFxubGV0IExPQ0FMVEVTVDtcbmZ1bmN0aW9uIF9jcmVhdGVTdHlsZSgpIHtcbiAgICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgICBjb25zdCBjc3MgPSBgXG4gICAgLkdFTVMtc2NyaW0ge1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICB0b3A6IDA7XG4gICAgICAgIGxlZnQ6IDA7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgfVxuICAgIFxuICAgIC5HRU1TLWFjaGlldmVtZW50LWZyYW1lIHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDVweDtcbiAgICAgICAgYm94LXNoYWRvdzogJzRweCA4cHggMzZweCAjRjRBQUI5JztcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gICAgICAgIHdpZHRoOjYwMHB4O1xuICAgICAgICBoZWlnaHQ6IDQwMHB4O1xuICAgICAgICBmb250LWZhbWlseTogQXJpYWwsIEhlbHZldGljYSwgc2Fucy1zZXJpZjtcbiAgICB9XG4gICAgXG4gICAgLkdFTVMtYWNoaWV2ZW1lbnQtdGl0bGUge1xuICAgICAgICBtYXJnaW46IDEwcHg7XG4gICAgfVxuICAgIFxuICAgIC5HRU1TLWFjaGlldmVtZW50LWltYWdlIHtcbiAgICAgICAgd2lkdGg6IDEwMDtcbiAgICAgICAgaGVpZ2h0OiAxMDA7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDVweDtcbiAgICAgICAgYm94LXNoYWRvdzogJzRweCA4cHggMzZweCAjRjRBQUI5JztcbiAgICB9XG4gICAgXG4gICAgLkdFTVMtYWNoaWV2ZW1lbnQtZGVzY3JpcHRpb24ge1xuICAgICAgICBtYXJnaW46IDEwcHg7XG4gICAgfVxuICAgIGA7XG4gICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIC8vIGluIGJyb3dzZXJcbiAgICBMT0NBTFRFU1QgPSAobG9jYXRpb24ub3JpZ2luID09PSBcImZpbGU6Ly9cIiB8fCBsb2NhdGlvbi5vcmlnaW4uc3RhcnRzV2l0aChcImh0dHA6Ly9sb2NhbGhvc3Q6XCIpKTtcbiAgICBfY3JlYXRlU3R5bGUoKTtcbiAgICB3aW5kb3dbXCJHRU1TXCJdID0gR0VNUztcbn1cbiIsICJpbXBvcnQge0dFTVN9IGZyb20gXCJiYXl6LWdlbXMtYXBpXCI7XG5cbi8vIGdhbWUgZWxlbWVudHMgICBcbmNvbnN0IHNjb3JlU3BhbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2NvcmVcIikhIGFzIEhUTUxTcGFuRWxlbWVudDtcbmNvbnN0IHN0YXJ0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFwiKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5jb25zdCBwbGF5QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5XCIpISBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbmNvbnN0IHNjb3JlQm94ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzY29yZWJveFwiKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5jb25zdCBmaW5pc2hCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2ZpbmlzaFwiKSEgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG5cbnN0YXJ0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzdGFydCk7XG5wbGF5QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzY29yZSk7XG5maW5pc2hCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZpbmlzaCk7XG5cbi8vIGluaXQgYW5kIGZpcnN0IGV2ZW50XG5jb25zdCBhcGlLZXkgPSBcImkyc2x1bE4pVSU3eHZNb1ZBQ0xTRVlvZ09la05Rb1dFXCI7XG5jb25zdCBhcHBJZCA9IFwiMzc2NzVhYzgtYzBjMC00MmU5LTgyOTEtMGY5NTI5ZGY1ZDQ3XCI7XG5HRU1TLmluaXQoe2FwaUtleSwgYXBwSWR9KS50aGVuKCgpPT57XG4gICAgR0VNUy5ldmVudChcIkRlbW8tR2FtZVBhZ2VcIik7XG4gICAgc3RhcnRCdXR0b24hLmRpc2FibGVkID0gZmFsc2U7XG59KTtcblxuZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgR0VNUy5ldmVudChcIkRlbW8tR2FtZVN0YXJ0ZWRcIik7XG4gICAgc2NvcmVTcGFuLmlubmVyVGV4dCA9IFwiMFwiO1xuICAgIHBsYXlCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBzY29yZUJveC5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIHN0YXJ0QnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gc2NvcmUoKSB7XG4gICAgbGV0IG4gPSBOdW1iZXIoc2NvcmVTcGFuLmlubmVyVGV4dCk7XG4gICAgbGV0IG5OZXcgPSBOdW1iZXIoc2NvcmVCb3gudmFsdWUpO1xuICAgIGlmIChpc05hTihuTmV3KSl7XG4gICAgICAgIG5OZXcgPSAwO1xuICAgIH1cbiAgICBuICs9IG5OZXc7XG4gICAgc2NvcmVTcGFuLmlubmVyVGV4dCA9IFN0cmluZyhuKTtcbiAgICBmaW5pc2hCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gZmluaXNoKCkge1xuICAgIEdFTVMuZXZlbnQoXCJEZW1vLUdhbWVGaW5pc2hlZFwiLCB7dmFsdWU6TnVtYmVyKHNjb3JlU3Bhbi5pbm5lclRleHQpfSk7XG4gICAgcGxheUJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgc2NvcmVCb3guZGlzYWJsZWQgPSB0cnVlO1xuICAgIGZpbmlzaEJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgc3RhcnRCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBU0EsTUFBTSxXQUFOLE1BQWU7QUFBQSxJQUNYLGNBQWM7QUFDVixXQUFLLFFBQVE7QUFDYixXQUFLLElBQUk7QUFDVCxXQUFLLElBQUk7QUFDVCxXQUFLLFdBQVc7QUFDaEIsV0FBSyxPQUFPO0FBQ1osV0FBSyxxQkFBcUI7QUFDMUIsV0FBSyxZQUFZO0FBQUEsSUFDckI7QUFBQSxFQUNKO0FBRU8sTUFBTSxPQUFOLE1BQVc7QUFBQSxJQUlk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
