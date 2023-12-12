"use strict";
var DinoGame;
(function (DinoGame) {
    let LANE;
    (function (LANE) {
        LANE[LANE["LEFT"] = 0] = "LEFT";
        LANE[LANE["MIDDLE"] = 1] = "MIDDLE";
        LANE[LANE["RIGHT"] = 2] = "RIGHT";
    })(LANE || (LANE = {}));
    let DIR;
    (function (DIR) {
        DIR[DIR["LEFT"] = 0] = "LEFT";
        DIR[DIR["RIGHT"] = 1] = "RIGHT";
    })(DIR || (DIR = {}));
    let instance;
    let laneMng;
    let firstNum = 0;
    let secondNum = 0;
    let firstMeasured = false;
    let allowSecond = false;
    let timeout = false;
    let currentDir;
    window.addEventListener("load", handleLoad);
    function handleLoad() {
        instance = new MoveDetector();
        laneMng = new LaneManager();
    }
    class LaneManager {
        currentLane = LANE.MIDDLE;
        changeLane() {
            switch (this.currentLane) {
                case LANE.LEFT:
                    if (currentDir == DIR.RIGHT)
                        this.currentLane = LANE.MIDDLE;
                    break;
                case LANE.MIDDLE:
                    if (currentDir == DIR.LEFT)
                        this.currentLane = LANE.LEFT;
                    else if (currentDir == DIR.RIGHT)
                        this.currentLane = LANE.RIGHT;
                    break;
                case LANE.RIGHT:
                    if (currentDir == DIR.LEFT)
                        this.currentLane = LANE.MIDDLE;
                    break;
            }
        }
    }
    DinoGame.LaneManager = LaneManager;
    class MoveDetector {
        ele;
        btn;
        constructor() {
            this.ele = document.querySelector("#x");
            instance = this;
            this.btn = document.querySelector("button");
            this.btn.addEventListener("pointerdown", this.addListener);
        }
        addListener() {
            window.addEventListener("devicemotion", instance.handleMotion);
        }
        handleMotion(_event) {
            const acc = _event.acceleration;
            if (!firstMeasured && !timeout) {
                if (acc.x) {
                    firstNum = acc.x;
                    firstMeasured = true;
                    window.setTimeout(function () {
                        allowSecond = true;
                    }, 20);
                }
            }
            else if (firstMeasured && allowSecond && !timeout) {
                if (acc.x) {
                    secondNum = acc.x;
                    if (firstNum - secondNum > 0.5) { //positive
                        currentDir = DIR.LEFT;
                    }
                    else if (firstNum - secondNum < -0.5) { //negative
                        currentDir = DIR.RIGHT;
                    }
                    instance.ele.classList.add("red");
                    instance.ele.classList.remove("green");
                    laneMng.changeLane();
                    timeout = true;
                    let diff = firstNum - secondNum;
                    instance.ele.innerHTML = currentDir + " difference: " + diff + "   current: " + laneMng.currentLane;
                    window.setTimeout(function () {
                        instance.ele.classList.add("green");
                        instance.ele.classList.remove("red");
                        timeout = false;
                        allowSecond = false;
                        firstMeasured = false;
                        firstNum = 0;
                        secondNum = 0;
                    }, 1000);
                }
            }
        }
    }
    DinoGame.MoveDetector = MoveDetector;
})(DinoGame || (DinoGame = {}));
//# sourceMappingURL=DinoGame.js.map