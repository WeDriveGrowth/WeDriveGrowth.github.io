import {GEMS} from "bayze-gems-api";

// game elements   
const scoreSpan = document.querySelector("#score")! as HTMLSpanElement;
const startButton = document.querySelector("#start")! as HTMLButtonElement;
const playButton = document.querySelector("#play")! as HTMLButtonElement;
const scoreBox = document.querySelector("#scorebox")! as HTMLButtonElement;
const finishButton = document.querySelector("#finish")! as HTMLButtonElement;

startButton.addEventListener("click", start);
playButton.addEventListener("click", score);
finishButton.addEventListener("click", finish);

// init and first event
const apiKey = "i2slulN)U%7xvMoVACLSEYogOekNQoWE";
const appId = "37675ac8-c0c0-42e9-8291-0f9529df5d47";
GEMS.init({apiKey:apiKey, appId:appId}).then(()=>{
    GEMS.event("Demo-GamePage");
    startButton!.disabled = false;
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
    if (isNaN(nNew)){
        nNew = 0;
    }
    n += nNew;
    scoreSpan.innerText = String(n);
    finishButton.disabled = false;
}

function finish() {
    GEMS.event("Demo-GameFinished", {value:Number(scoreSpan.innerText)});
    playButton.disabled = true;
    scoreBox.disabled = true;
    finishButton.disabled = true;
    startButton.disabled = false;
}
