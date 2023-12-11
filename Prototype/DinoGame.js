"use strict";
var DinoGame;
(function (DinoGame) {
    let instance;
    let highestLeft = 0;
    let highestRight = 0;
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
            /* let acceleration: HTMLDivElement = <HTMLDivElement>document.querySelector("#acceleration");
            acceleration.style.display = "block";

            instance.btn.style.display = "none"; */
        }
        handleMotion(_event) {
            const acc = _event.acceleration;
            if (acc.x) {
                if (Math.sign(acc.x) == 1) {
                    if (acc.x > highestRight)
                        highestRight = acc.x;
                }
                else if (Math.sign(acc.x) == -1) {
                    if (acc.x < highestLeft)
                        highestLeft = acc.x;
                }
                instance.ele.innerHTML = "Current acc: " + acc.x + "<br>" + "   Highestleft: " + highestLeft + "<br>    Highest Right: " + highestRight;
            }
            let test = document.querySelector("#cont");
            test.innerHTML = _event + "";
        }
    }
    DinoGame.MoveDetector = MoveDetector;
})(DinoGame || (DinoGame = {}));
//# sourceMappingURL=DinoGame.js.map