import gpio from "array-gpio";


const I2C_ADDRESS = 0x08; // I2C address of the ESP32
const NUM_LEDS = 5;

const bus = gpio.startI2C(); // Opens the I2C bus number (usually 1)
bus.setTransferSpeed(100000);

bus.selectSlave(I2C_ADDRESS);


let strip = [];

// make array of NUM_LEDS length with object of { status : 0, red : 0, green : 0, blue : 0 }, as each element
for (let i = 0; i < NUM_LEDS; i++) {
    strip.push({ red : 0, green : 0, blue : 0 });
}

console.log({ strip });

const COLORS = {
    red : { red : 255, green : 0, blue : 0 },
    green : { red : 0, green : 255, blue : 0 },
    blue : { red : 0, green : 0, blue : 255 },
    yellow : { red : 255, green : 255, blue : 0 },
    white : { red : 255, green : 255, blue : 255 },
    off : { red : 0, green : 0, blue : 0 },
    purple : { red : 255, green : 0, blue : 255 },
};

function sendLEDData(ledDataList) {
    const sendData = [];

    for (let i = 0; i < NUM_LEDS; i++) {
        const ledData = ledDataList[i];
        console.log({ ledData });
        // sendData.push(ledData.status ? 1 : 0); // LED on/off status
        sendData.push(ledData.red); // Red component of color
        sendData.push(ledData.green); // Green component of color
        sendData.push(ledData.blue); // Blue component of color
    }

    const buffer = Buffer.from(sendData);
    const chunks = [];

    for (let i = 0; i < buffer.length; i += 16) {
        chunks.push(buffer.slice(i, i + 16));
    }

    for (const chunk of chunks) {
        bus.write(chunk, chunk.length);
    }

}

export function turnOnDisplay() {
    for (let i = 0; i < NUM_LEDS; i++) {
        strip[i] = { ...COLORS.red };
    }
    sendLEDData(strip);
}

export function turnOnCurrentLength(lengthPosition) {
    strip.forEach((pin, index) => {
        if ( index === lengthPosition ) {
            strip[index] = { ...COLORS.blue };
        } else {
            strip[index] = { ...COLORS.purple };
        }
    });
    sendLEDData(strip);

}

export function turnOffLengthDisplay() {
    strip.forEach((pin, index) => {
        strip[index] = { ...COLORS.off };
    });
    sendLEDData(strip);
}

