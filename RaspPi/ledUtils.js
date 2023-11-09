// noinspection ES6UnusedImports
import gpio from "array-gpio";

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
