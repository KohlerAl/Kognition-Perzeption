namespace DinoGame {
    let instance: MoveDetector;

    window.addEventListener("load", handleLoad);

    function handleLoad(): void {
        instance = new MoveDetector();
    }

    export class MoveDetector {
        private scaleAcc: number = 1;
        private ele: HTMLElement;
        private btn: HTMLButtonElement;

        constructor() {
            this.ele = <HTMLElement>document.querySelector("#x");
            instance = this;
            this.btn = <HTMLButtonElement>document.querySelector("button");
            this.btn.addEventListener("pointerdown", this.addListener);
        }


        addListener(): void {
            window.addEventListener("devicemotion", instance.handleMotion);

        }

        handleMotion(_event: DeviceMotionEvent): void {
            const acc: DeviceMotionEventAcceleration = <DeviceMotionEventAcceleration>_event.acceleration;
            if (acc.x) {
                let num = instance.scaleAcc * acc.x;
                instance.ele.innerHTML = num + "";

            }
            let test: HTMLElement = <HTMLElement>document.querySelector("#cont");
            test.innerHTML = _event + "";
        }
    }
}