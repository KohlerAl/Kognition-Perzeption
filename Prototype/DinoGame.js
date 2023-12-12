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
                    if (firstNum - secondNum > 0) { //positive
                        currentDir = "left";
                    }
                    else if (firstNum - secondNum < 0) { //negative
                        currentDir = "right";
                    }
                    instance.ele.classList.add("red");
                    instance.ele.classList.remove("green");
                    timeout = true;
                    let diff = firstNum - secondNum;
                    instance.ele.innerHTML = currentDir + " difference: " + diff;
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