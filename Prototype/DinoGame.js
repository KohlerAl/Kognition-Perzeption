"use strict";
var DinoGame;
(function (DinoGame) {
    let instance;
    window.addEventListener("load", handleLoad);
    function handleLoad() {
        instance = new MoveDetector();
    }
    class MoveDetector {
        scaleAcc = 1;
        ele;
        constructor() {
            window.addEventListener("devicemotion", this.handleMotion);
            this.ele = document.querySelector("#x");
            instance = this;
        }
        handleMotion(_event) {
            const acc = _event.acceleration;
            if (acc.x) {
                let num = this.scaleAcc * acc.x;
                this.ele.innerHTML = num + "";
            }
        }
    }
    DinoGame.MoveDetector = MoveDetector;
})(DinoGame || (DinoGame = {}));
//# sourceMappingURL=DinoGame.js.map