"use strict";
/**
 * Code example using the Device Motion API
 * (based on the StartScreen and ResourceManager abstractions)
 * Norbert Schnell, 2021
 */
var motionSensors;
(function (motionSensors) {
    // create device motion/orientation manager and register motion callbacks
    const motionManager = new DeviceMotionAndOrientationManager();
    motionManager.onAccelerationIncludingGravity = onAccelerationIncludingGravity;
    motionManager.onAcceleration = onAcceleration;
    motionManager.onRotationRate = onRotationRate;
    motionManager.onOrientation = onOrientation;
    // motionManager.onMotion = onmotion; // also exists
    // create start screen and register device motion/orientation manager
    const startScreen = new StartScreen("start-screen");
    startScreen.addResourceManager(motionManager);
    startScreen.start();
    /********************************************************
     *
     *  HTML elements
     *
     */
    const accigBars = [
        document.querySelector("#accig-x .bar"),
        document.querySelector("#accig-y .bar"),
        document.querySelector("#accig-z .bar"),
    ];
    const accBars = [
        document.querySelector("#acc-x .bar"),
        document.querySelector("#acc-y .bar"),
        document.querySelector("#acc-z .bar"),
    ];
    const rotBars = [
        document.querySelector("#rot-alpha .bar"),
        document.querySelector("#rot-beta .bar"),
        document.querySelector("#rot-gamma .bar"),
    ];
    const oriBars = [
        document.querySelector("#ori-alpha .bar"),
        document.querySelector("#ori-beta .bar"),
        document.querySelector("#ori-gamma .bar"),
    ];
    const accigNumbers = [
        document.querySelector("#accig-x .number"),
        document.querySelector("#accig-y .number"),
        document.querySelector("#accig-z .number"),
    ];
    const accNumbers = [
        document.querySelector("#acc-x .number"),
        document.querySelector("#acc-y .number"),
        document.querySelector("#acc-z .number"),
    ];
    const rotNumbers = [
        document.querySelector("#rot-alpha .number"),
        document.querySelector("#rot-beta .number"),
        document.querySelector("#rot-gamma .number"),
    ];
    const oriNumbers = [
        document.querySelector("#ori-alpha .number"),
        document.querySelector("#ori-beta .number"),
        document.querySelector("#ori-gamma .number"),
    ];
    const intervalNumber = document.querySelector("#interval");
    /********************************************************
     *
     *  device motion/orientation callbacks
     *
     */
    function onAccelerationIncludingGravity(x, y, z, interval) {
        setBiBar(accigBars[0], x / 20);
        setBiBar(accigBars[1], y / 20);
        setBiBar(accigBars[2], z / 20);
        setNumber(accigNumbers[0], x);
        setNumber(accigNumbers[1], y);
        setNumber(accigNumbers[2], z);
        setNumber(intervalNumber, interval, 6);
    }
    function onAcceleration(x, y, z) {
        setBiBar(accBars[0], x / 20);
        setBiBar(accBars[1], y / 20);
        setBiBar(accBars[2], z / 20);
        setNumber(accNumbers[0], x);
        setNumber(accNumbers[1], y);
        setNumber(accNumbers[2], z);
    }
    function onRotationRate(alpha, beta, gamma) {
        setBiBar(rotBars[0], alpha / 360);
        setBiBar(rotBars[1], beta / 360);
        setBiBar(rotBars[2], gamma / 360);
        setNumber(rotNumbers[0], alpha);
        setNumber(rotNumbers[1], beta);
        setNumber(rotNumbers[2], gamma);
    }
    function onOrientation(alpha, beta, gamma) {
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
    function setBar(bar, value) {
        if (value >= 0) {
            bar.style.left = "0";
            bar.style.width = `${100 * value}%`;
        }
    }
    function setNumber(div, value, numDec = 2) {
        div.innerHTML = value.toFixed(numDec);
    }
    function setBiBar(div, value) {
        if (value >= 0) {
            div.style.left = "50%";
            div.style.width = `${50 * value}%`;
        }
        else {
            div.style.left = `${50 * (1 + value)}%`;
            div.style.width = `${50 * -value}%`;
        }
    }
})(motionSensors || (motionSensors = {}));
//# sourceMappingURL=scripts.js.map