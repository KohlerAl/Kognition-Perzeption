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
    let currentDir2;
    let allowMeasure = true;
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
            if (acc.x && allowMeasure) {
                if (Math.sign(acc.x) == 1) {
                    if (acc.x > highestRight)
                        highestRight = acc.x;
                }
                else if (Math.sign(acc.x) == -1) {
                    if (acc.x < highestLeft)
                        highestLeft = acc.x;
                }
                window.setTimeout(function () {
                    allowMeasure = false;
                    if (Math.abs(highestLeft) > highestRight && Math.abs(highestLeft) > 1) {
                        currentDir2 = "left";
                    }
                    else if (Math.abs(highestLeft) < highestRight && highestRight > 1) {
                        currentDir2 = "right";
                    }
                    highestLeft = 0;
                    highestRight = 0;
                }, 20);
                window.setTimeout(function () {
                    allowMeasure = true;
                }, 1020);
                instance.ele2.innerHTML = currentDir2 + "   Left: " + highestLeft + "  Right: " + highestRight;
            }
        }
    }
    DinoGame.MoveDetector = MoveDetector;
})(DinoGame || (DinoGame = {}));
//# sourceMappingURL=DinoGame.js.map