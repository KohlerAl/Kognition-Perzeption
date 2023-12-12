"use strict";
var DinoGame;
(function (DinoGame) {
    let instance;
    let highestLeft = 0;
    let highestRight = 0;
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
        ele2;
        btn;
        constructor() {
            this.ele = document.querySelector("#x");
            this.ele2 = document.querySelector("#b");
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
                    }, 1000);
                }
                let diff = firstNum + secondNum;
                instance.ele.innerHTML = currentDir + " all: " + diff;
            }
            if (acc.x) {
                if (Math.sign(acc.x) == 1) {
                    if (acc.x > highestRight)
                        highestRight = acc.x;
                }
                else if (Math.sign(acc.x) == -1) {
                    if (acc.x < highestLeft)
                        highestLeft = acc.x;
                }
                instance.ele2.innerHTML = "Left: " + highestLeft + "  Right: " + highestRight;
            }
        }
    }
    DinoGame.MoveDetector = MoveDetector;
})(DinoGame || (DinoGame = {}));
//# sourceMappingURL=DinoGame.js.map