import ws281x from "rpi-ws281x-native";

let channel;
let strip;

export function init() {
    channel = ws281x(5, { stripType : "ws2812" });
    strip = channel.array;

}

export function turnOnDisplay() {
    for (let i = 0; i < channel.count; i++) {
        strip[i] = 0xffcc22;
    }
    ws281x.render();

}

export function turnOnCurrentLength(lengthDisplay, lengthPosition) {
    strip.forEach((pin, index) => {
        if ( index === lengthPosition ) {
            strip[index] = 0xFF0000;
        } else {
            strip[index] = 0x000000;
        }
    });
    ws281x.render();
}

export function turnOffLengthDisplay(lengthDisplay) {
    strip.forEach((pin, index) => {
        strip[index] = 0x000000;
    });
    ws281x.render();
}
