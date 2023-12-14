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
    /* let currentDir2: string;
    let allowMeasure: boolean = true;  */
    window.addEventListener("load", handleLoad);
    function handleLoad() {
        instance = new MoveDetector();
    }
    class MoveDetector {
        ele;
        /* private ele2: HTMLElement; */
        btn;
        constructor() {
            this.ele = document.querySelector("#x");
            /* this.ele2 = <HTMLElement>document.querySelector("#b"); */
            instance = this;
            this.btn = document.querySelector("button");
            this.btn.addEventListener("pointerdown", this.addListener);
        }
        addListener() {
            window.addEventListener("devicemotion", instance.handleMotion);
            instance.btn.removeEventListener("pointerdown", this.addListener);
        }
        handleMotion(_event) {
            const acc = _event.acceleration;
            if (!firstMeasured && !timeout) {
                if (acc.x) {
                    firstNum = acc.x;
                    firstMeasured = true;
                    window.setTimeout(function () {
                        allowSecond = true;
                    }, 15);
                }
            }
            else if (firstMeasured && allowSecond && !timeout) {
                if (acc.x) {
                    secondNum = acc.x;
                    if (firstNum - secondNum > 0.3) { //positive
                        currentDir = "left";
                    }
                    else if (firstNum - secondNum < -0.3) { //negative
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
                let diff = firstNum - secondNum;
                instance.ele.innerHTML = currentDir + " all: " + diff;
            }
            /* if (acc.x && allowMeasure) {

                if (Math.sign(acc.x) == 1) {
                    if (acc.x > highestRight)
                        highestRight = acc.x;
                }
                else if (Math.sign(acc.x) == -1) {
                    if (acc.x < highestLeft)
                        highestLeft = acc.x;
                }

                window.setTimeout(function(): void {
                    allowMeasure = false;
                    if (Math.abs(highestLeft) > highestRight && Math.abs(highestLeft) > 0.2) {
                        currentDir2 = "left"
                    }
                    else if (Math.abs(highestLeft) < highestRight && highestRight > 0.2) {
                        currentDir2 = "right"
                    }
                    instance.ele2.innerHTML = currentDir2 +  "   Left: " + highestLeft + "  Right: " + highestRight;
                    highestLeft = 0;
                    highestRight = 0;
                    

                }, 20)

                window.setTimeout(function(): void {
                    allowMeasure = true;
                }, 1020)
            } */
        }
    }
    DinoGame.MoveDetector = MoveDetector;
})(DinoGame || (DinoGame = {}));
//# sourceMappingURL=DinoGame.js.map