namespace DinoGame {
    let instance: MoveDetector;

    let highestLeft: number = 0;
    let highestRight: number = 0;

    let firstNum: number = 0;
    let secondNum: number = 0;

    let firstMeasured: boolean = false;
    let allowSecond: boolean = false;

    let timeout: boolean = false;
    let currentDir: string;
    let currentDir2: string; 
    let allowMeasure: boolean = true; 

    window.addEventListener("load", handleLoad);

    function handleLoad(): void {
        instance = new MoveDetector();
    }

    export class MoveDetector {
        private ele: HTMLElement;
        private ele2: HTMLElement; 
        private btn: HTMLButtonElement;

        constructor() {
            this.ele = <HTMLElement>document.querySelector("#x");
            this.ele2 = <HTMLElement>document.querySelector("#b");
            instance = this;
            this.btn = <HTMLButtonElement>document.querySelector("button");
            this.btn.addEventListener("pointerdown", this.addListener);
        }


        addListener(): void {
            window.addEventListener("devicemotion", instance.handleMotion);
        }

        handleMotion(_event: DeviceMotionEvent): void {
            const acc: DeviceMotionEventAcceleration = <DeviceMotionEventAcceleration>_event.acceleration;

            if (!firstMeasured && !timeout) {
                if (acc.x) {
                    firstNum = acc.x;
                    firstMeasured = true;

                    window.setTimeout(function (): void {
                        allowSecond = true;
                    }, 20);
                }
            }
            else if (firstMeasured && allowSecond && !timeout) {
                if (acc.x) {
                    secondNum = acc.x
                    if (firstNum - secondNum > 0.5) { //positive
                        currentDir = "left";
                    }
                    else if (firstNum - secondNum < -0.5) { //negative
                        currentDir = "right";
                    }

                    timeout = true;
                    window.setTimeout(function (): void {
                        timeout = false;
                        allowSecond = false;
                        firstMeasured = false;
                        firstNum = 0;
                        secondNum = 0;
                    }, 1000);
                }
                let diff: number = firstNum + secondNum;

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

                window.setTimeout(function(): void {
                    allowMeasure = false; 
                    if (Math.abs(highestLeft) > highestRight && Math.abs(highestLeft) > 0.5) {
                        currentDir2 = "left"
                    }
                    else if (Math.abs(highestLeft) < highestRight && highestRight > 0.5) {
                        currentDir2 = "right"
                    } 
                    instance.ele2.innerHTML = currentDir2 +  "   Left: " + highestLeft + "  Right: " + highestRight; 
                    highestLeft = 0; 
                    highestRight = 0;
                    

                }, 20)

                window.setTimeout(function(): void {
                    allowMeasure = true; 
                }, 1020)
            }


        }
    }
}