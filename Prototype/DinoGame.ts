namespace DinoGame {
    let instance: MoveDetector; 

    window.addEventListener("load", handleLoad); 

    function handleLoad(): void {
        instance = new MoveDetector(); 
    }

    export class MoveDetector {
        private scaleAcc: number = 1;
        private ele: HTMLElement;
        constructor() {
            window.addEventListener("devicemotion", this.handleMotion);
            this.ele = <HTMLElement>document.querySelector("#x");
            instance = this; 
        }

        handleMotion(_event: DeviceMotionEvent): void {
            const acc: DeviceMotionEventAcceleration = <DeviceMotionEventAcceleration>_event.acceleration;
            if (acc.x) {
                let num = instance.scaleAcc * acc.x;
                instance.ele.innerHTML = num + ""; 
                let test: HTMLElement = <HTMLElement>document.querySelector("div"); 
                test.innerHTML = _event + ""; 
            }
        }
    }
}