"use strict";
if (window.AudioContext == undefined)
    window.AudioContext = window.webkitAudioContext;
class WebAudioManager {
    context = new AudioContext();
    getCheck() {
        return new Promise((resolve, reject) => {
            if (AudioContext) {
                this.context.resume()
                    .then(() => resolve())
                    .catch(() => reject());
            }
            else {
                reject("web audio not available");
            }
        });
    }
}
//# sourceMappingURL=WebAudioManager.js.map