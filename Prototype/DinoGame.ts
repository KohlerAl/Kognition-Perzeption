namespace DinoGame {
    let instance: MoveDetector;

    let highestLeft: number = 0;
    let highestRight: number = 0;

    window.addEventListener("load", handleLoad);

    function handleLoad(): void {
        instance = new MoveDetector();
    }

    export class MoveDetector {
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

            let acceleration: HTMLDivElement = <HTMLDivElement>document.querySelector("#acceleration");
            acceleration.style.display = "block";

            instance.btn.style.display = "none";
        }

        handleMotion(_event: DeviceMotionEvent): void {
            const acc: DeviceMotionEventAcceleration = <DeviceMotionEventAcceleration>_event.acceleration;
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


            let test: HTMLElement = <HTMLElement>document.querySelector("#cont");
            test.innerHTML = _event + "";
        }
    }
}