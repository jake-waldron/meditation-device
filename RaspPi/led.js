import ws281x from "rpi-ws281x-native";

let channel;

export function init() {
    channel = ws281x(5, { stripType : "ws2812" });
}

export function turnOnDisplay() {
    const colorArray = channel.array;
    for (let i = 0; i < channel.count; i++) {
        colorArray[i] = 0xffcc22;
    }

    ws281x.render();

}

export function turnOnCurrentLength(lengthDisplay, lengthPosition) {
    lengthDisplay.forEach((pin, index) => {
        if ( index === lengthPosition ) {
            pin.on();
        } else {
            pin.off();
        }
    });
}

export function turnOffLengthDisplay(lengthDisplay) {
    lengthDisplay.forEach((pin) => {
        pin.off();
    });
}
