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
            if (acc.x) {
                let num = instance.scaleAcc * acc.x;
                instance.ele.innerHTML = num + "";
            }
            let test = document.querySelector("#cont");
            test.innerHTML = _event + "";
        }
    }
    DinoGame.MoveDetector = MoveDetector;
})(DinoGame || (DinoGame = {}));
//# sourceMappingURL=DinoGame.js.map