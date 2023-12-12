"use strict";
var DinoGame;
(function (DinoGame) {
    let instance;
    /* let highestLeft: number = 0;
    let highestRight: number = 0; */
    let firstNum = 0;
    let secondNum = 0;
    let firstMeasured = false;
    let allowSecond = false;
    let timeout = false;
    let currentDir;
    window.addEventListener("load", handleLoad);
    function handleLoad() {
        instance = new MoveDetector();
    }
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
                        currentDir = "left";
                    }
                    else if (firstNum - secondNum < -0.5) { //negative
                        currentDir = "right";
                    }
                    timeout = true;
                    window.setTimeout(function () {
                        timeout = false;
                        allowSecond = false;
                        firstMeasured = false;
                        firstNum = 0;
                        secondNum = 0;
                    }, 1500);
                }
                instance.ele.innerHTML = currentDir + " first: " + firstNum + " second: " + secondNum;
            }
        }
    }
    DinoGame.MoveDetector = MoveDetector;
})(DinoGame || (DinoGame = {}));
//# sourceMappingURL=DinoGame.js.map