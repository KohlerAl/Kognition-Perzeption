class DeviceMotionAndOrientationManager implements ResourceManager {
  public onMotion: Function = null;
  public onAccelerationIncludingGravity: Function = null;
  public onAcceleration: Function = null;
  public onRotationRate: Function = null;
  public onOrientation: Function = null;

  private resolve: Function;
  private timeout: NodeJS.Timeout = null;
  private scaleAcc: number = 1; // scale factor to re-invert iOS acceleration

  constructor() {
    this.onDeviceMotion = this.onDeviceMotion.bind(this);
    this.onDeviceOrientation = this.onDeviceOrientation.bind(this);
  }

  getCheck(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.resolve = resolve;

      // set timeout in case that the API response, but no data is sent
      this.timeout = setTimeout(() => {
        this.timeout = null;
        reject("no device motion/orientation data streams");
      }, 1000);

      if (DeviceMotionEvent || DeviceOrientationEvent) {
        // ask device motion/orientation permission on iOS
        if (DeviceMotionEvent.requestPermission || DeviceOrientationEvent.requestPermission) {
          DeviceMotionEvent.requestPermission()
            .then((response) => {
              if (response == "granted") {
                // got permission, hide start overrlay and listenm
                resolve();

                if (this.onMotion !== null ||
                  this.onAccelerationIncludingGravity !== null ||
                  this.onAcceleration !== null ||
                  this.onRotationRate !== null) {
                  window.addEventListener("devicemotion", this.onDeviceMotion);
                }

                // re-invert inverted iOS acceleration values
                this.scaleAcc = -1;
              } else {
                reject("no permission for device motion");
              }
            })
            .catch(console.error);

          DeviceOrientationEvent.requestPermission()
            .then((response) => {
              if (response == "granted") {
                if (this.onOrientation !== null) {
                  window.addEventListener("deviceorientation", this.onDeviceOrientation);
                }

                resolve();
              } else {
                reject("no permission for device orientation");
              }
            })
            .catch(console.error);
        } else {
          window.addEventListener("devicemotion", this.onDeviceMotion);
          window.addEventListener("deviceorientation", this.onDeviceOrientation);
        }
      } else {
        reject("device motion/orientation not available");
      }
    });
  }

  onDeviceMotion(evt: DeviceMotionEvent): void {
    if (this.timeout !== null) {
      this.resolve();
      clearTimeout(this.timeout);
    }

    if (this.onMotion !== null) {
      const accig: DeviceMotionEventAcceleration = evt.accelerationIncludingGravity;
      const acc: DeviceMotionEventAcceleration = evt.acceleration;
      const rot: DeviceMotionEventRotationRate = evt.rotationRate;

      this.onMotion(this.scaleAcc * accig.x, this.scaleAcc * accig.y, this.scaleAcc * accig.z,
        this.scaleAcc * acc.x, this.scaleAcc * acc.y, this.scaleAcc * acc.z,
        rot.alpha, rot.beta, rot.gamma,
        evt.interval);
    }

    if (this.onAccelerationIncludingGravity !== null) {
      const accig: DeviceMotionEventAcceleration = evt.accelerationIncludingGravity;
      this.onAccelerationIncludingGravity(this.scaleAcc * accig.x, this.scaleAcc * accig.y, this.scaleAcc * accig.z, evt.interval);
    }

    if (this.onAcceleration !== null) {
      const acc: DeviceMotionEventAcceleration = evt.acceleration;
      this.onAcceleration(this.scaleAcc * acc.x, this.scaleAcc * acc.y, this.scaleAcc * acc.z, evt.interval);
    }

    if (this.onRotationRate !== null) {
      const rot: DeviceMotionEventRotationRate = evt.rotationRate;
      this.onRotationRate(rot.alpha, rot.beta, rot.gamma, evt.interval);
    }
  }

  onDeviceOrientation(evt: DeviceOrientationEvent): void {
    if (this.timeout !== null) {
      this.resolve();
      clearTimeout(this.timeout);
    }

    if (this.onOrientation !== null) {
      this.onOrientation(evt.alpha, evt.beta, evt.gamma);
    }
  }
}
