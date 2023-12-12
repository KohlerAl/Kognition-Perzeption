namespace DinoGame {
    let instance: MoveDetector;

    /* let highestLeft: number = 0;
    let highestRight: number = 0; */

    let firstNum: number = 0;
    let secondNum: number = 0;

    let firstMeasured: boolean = false;
    let allowSecond: boolean = false; 

    let timeout: boolean = false;
    let currentDir: string; 

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
        }

        handleMotion(_event: DeviceMotionEvent): void {
            const acc: DeviceMotionEventAcceleration = <DeviceMotionEventAcceleration>_event.acceleration;

            if (!firstMeasured && !timeout) {
                if (acc.x){
                    firstNum = acc.x;
                    firstMeasured = true; 

                    window.setTimeout(function(): void {
                        allowSecond = true; 
                    }, 20); 
                }
            }
            else if (firstMeasured && allowSecond && !timeout) {
                if (acc.x) {
                    secondNum = acc.x
                    if(firstNum - secondNum > 0) { //positive
                        currentDir = "left"; 
                    }
                    else if(firstNum - secondNum < 0) { //negative
                        currentDir = "right";
                    }
                    instance.ele.classList.add("red"); 

                    timeout = true; 
                    window.setTimeout(function(): void 
                    {
                        instance.ele.classList.add("green"); 
                        timeout = false; 
                        allowSecond = false; 
                        firstMeasured = false; 
                        firstNum = 0; 
                        secondNum = 0; 
                    }, 1000); 
                }

                instance.ele.innerHTML = currentDir + " first: " + firstNum + " second: " + secondNum; 
            }


        }
    }
}