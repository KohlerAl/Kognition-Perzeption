namespace DinoGame {
    enum LANE {
        LEFT,
        MIDDLE,
        RIGHT
    }

    enum DIR {
        LEFT, 
        RIGHT
    }

    let instance: MoveDetector;
    let laneMng: LaneManager; 

    let firstNum: number = 0;
    let secondNum: number = 0;

    let firstMeasured: boolean = false;
    let allowSecond: boolean = false;

    let timeout: boolean = false;
    let currentDir: DIR;

    window.addEventListener("load", handleLoad);

    function handleLoad(): void {
        instance = new MoveDetector();
        laneMng = new LaneManager(); 
    }

    export class LaneManager {
        public currentLane: LANE = LANE.MIDDLE; 

        changeLane(): void {
            switch(this.currentLane) {
                case LANE.LEFT: 
                    if(currentDir == DIR.RIGHT)
                        this.currentLane = LANE.MIDDLE; 
                break; 


                case LANE.MIDDLE:
                    if(currentDir == DIR.LEFT)
                        this.currentLane = LANE.LEFT;

                    else if(currentDir == DIR.RIGHT)
                        this.currentLane = LANE.RIGHT; 

                break; 

                case LANE.RIGHT: 
                if(currentDir == DIR.LEFT)
                    this.currentLane = LANE.MIDDLE; 

                break; 
            }
        }
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
                        currentDir = DIR.LEFT;
                    }
                    else if (firstNum - secondNum < -0.5) { //negative
                        currentDir = DIR.RIGHT;
                    }
                    instance.ele.classList.add("red");
                    instance.ele.classList.remove("green")

                    laneMng.changeLane(); 

                    timeout = true;

                    let diff: number = firstNum - secondNum;
                    instance.ele.innerHTML = currentDir + " difference: " + diff + "   current: " + laneMng.currentLane;

                    window.setTimeout(function (): void {
                        instance.ele.classList.add("green");
                        instance.ele.classList.remove("red")
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
}