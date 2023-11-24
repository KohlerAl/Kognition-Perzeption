"use strict";
class GeoLocationManager {
    constructor() {
        this.onLocation = null;
        this.timeout = null;
    }
    getCheck() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                // set timeout in case that the API response, but no data is sent
                this.timeout = setTimeout(() => {
                    this.timeout = null;
                    reject("no geolocation data");
                }, 7000);
                navigator.geolocation.getCurrentPosition((position) => {
                    if (this.timeout !== null) {
                        resolve();
                        clearTimeout(this.timeout);
                    }
                    if (this.onLocation !== null) {
                        this.onLocation(position.coords, position.timestamp);
                        navigator.geolocation.watchPosition((position) => {
                            this.onLocation(position.coords, position.timestamp);
                        });
                    }
                }, () => {
                    reject("geolocation failed");
                });
            }
            else {
                reject("geolocation not available");
            }
        });
    }
}
//# sourceMappingURL=GeoLocationManager.js.map