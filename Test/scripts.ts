/**
 * Code example using the Device Motion API
 * (based on the StartScreen and ResourceManager abstractions)
 * Norbert Schnell, 2021
 */
 namespace motionSensors {
  // create device motion/orientation manager and register motion callbacks
  const motionManager: DeviceMotionAndOrientationManager = new DeviceMotionAndOrientationManager();
  motionManager.onAccelerationIncludingGravity = onAccelerationIncludingGravity;
  motionManager.onAcceleration = onAcceleration;
  motionManager.onRotationRate = onRotationRate;
  motionManager.onOrientation = onOrientation;
  // motionManager.onMotion = onmotion; // also exists


  // create start screen and register device motion/orientation manager
  const startScreen: StartScreen = new StartScreen("start-screen");
  startScreen.addResourceManager(motionManager);
  startScreen.start();

  /********************************************************
   * 
   *  HTML elements
   * 
   */
  const accigBars: HTMLDivElement[] = [
    <HTMLDivElement>document.querySelector("#accig-x .bar"),
    <HTMLDivElement>document.querySelector("#accig-y .bar"),
    <HTMLDivElement>document.querySelector("#accig-z .bar"),
  ];

  const accBars: HTMLDivElement[] = [
    <HTMLDivElement>document.querySelector("#acc-x .bar"),
    <HTMLDivElement>document.querySelector("#acc-y .bar"),
    <HTMLDivElement>document.querySelector("#acc-z .bar"),
  ];

  const rotBars: HTMLDivElement[] = [
    <HTMLDivElement>document.querySelector("#rot-alpha .bar"),
    <HTMLDivElement>document.querySelector("#rot-beta .bar"),
    <HTMLDivElement>document.querySelector("#rot-gamma .bar"),
  ];

  const oriBars: HTMLDivElement[] = [
    <HTMLDivElement>document.querySelector("#ori-alpha .bar"),
    <HTMLDivElement>document.querySelector("#ori-beta .bar"),
    <HTMLDivElement>document.querySelector("#ori-gamma .bar"),
  ];

  const accigNumbers: HTMLDivElement[] = [
    <HTMLDivElement>document.querySelector("#accig-x .number"),
    <HTMLDivElement>document.querySelector("#accig-y .number"),
    <HTMLDivElement>document.querySelector("#accig-z .number"),
  ];

  const accNumbers: HTMLDivElement[] = [
    <HTMLDivElement>document.querySelector("#acc-x .number"),
    <HTMLDivElement>document.querySelector("#acc-y .number"),
    <HTMLDivElement>document.querySelector("#acc-z .number"),
  ];

  const rotNumbers: HTMLDivElement[] = [
    <HTMLDivElement>document.querySelector("#rot-alpha .number"),
    <HTMLDivElement>document.querySelector("#rot-beta .number"),
    <HTMLDivElement>document.querySelector("#rot-gamma .number"),
  ];

  const oriNumbers: HTMLDivElement[] = [
    <HTMLDivElement>document.querySelector("#ori-alpha .number"),
    <HTMLDivElement>document.querySelector("#ori-beta .number"),
    <HTMLDivElement>document.querySelector("#ori-gamma .number"),
  ];

  const intervalNumber: HTMLDivElement = <HTMLDivElement>document.querySelector("#interval");

  /********************************************************
   * 
   *  device motion/orientation callbacks
   * 
   */
  function onAccelerationIncludingGravity(x: number, y: number, z: number, interval: number): void {
    setBiBar(accigBars[0], x / 20);
    setBiBar(accigBars[1], y / 20);
    setBiBar(accigBars[2], z / 20);
    setNumber(accigNumbers[0], x);
    setNumber(accigNumbers[1], y);
    setNumber(accigNumbers[2], z);

    setNumber(intervalNumber, interval, 6);
  }

  function onAcceleration(x: number, y: number, z: number): void {
    setBiBar(accBars[0], x / 20);
    setBiBar(accBars[1], y / 20);
    setBiBar(accBars[2], z / 20);
    setNumber(accNumbers[0], x);
    setNumber(accNumbers[1], y);
    setNumber(accNumbers[2], z);
  }

  function onRotationRate(alpha: number, beta: number, gamma: number): void {
    setBiBar(rotBars[0], alpha / 360);
    setBiBar(rotBars[1], beta / 360);
    setBiBar(rotBars[2], gamma / 360);
    setNumber(rotNumbers[0], alpha);
    setNumber(rotNumbers[1], beta);
    setNumber(rotNumbers[2], gamma);
  }

  function onOrientation(alpha: number, beta: number, gamma: number): void {
    setBar(oriBars[0], alpha / 360);
    setBiBar(oriBars[1], beta / 180);
    setBiBar(oriBars[2], gamma / 90);
    setNumber(oriNumbers[0], alpha);
    setNumber(oriNumbers[1], beta);
    setNumber(oriNumbers[2], gamma);
  }

  // function onMotion(accigX, accigY, accigZ, accX, accY, accZ, rotAlpha, rotBeta, rotGamma, interval) {
  // }

  /********************************************************
   * 
   *  display functions
   * 
   */
  function setBar(bar: HTMLDivElement, value: number): void {
    if (value >= 0) {
      bar.style.left = "0";
      bar.style.width = `${100 * value}%`;
    }
  }

  function setNumber(div: HTMLDivElement, value: number, numDec: number = 2): void {
    div.innerHTML = value.toFixed(numDec);
  }

  function setBiBar(div: HTMLDivElement, value: number): void {
    if (value >= 0) {
      div.style.left = "50%";
      div.style.width = `${50 * value}%`;
    } else {
      div.style.left = `${50 * (1 + value)}%`;
      div.style.width = `${50 * -value}%`;
    }
  }
}
