import i2c from "i2c-bus";

const I2C_ADDRESS = 0x08; // I2C address of the ESP32
const NUM_LEDS = 5;


let strip = [];

// make array of NUM_LEDS length with object of { status : 0, red : 0, green : 0, blue : 0 }, as each element
for (let i = 0; i < NUM_LEDS; i++) {
    strip.push({ status : 0, red : 0, green : 0, blue : 0 });
}

const COLORS = {
    red : { red : 255, green : 0, blue : 0 },
    green : { red : 0, green : 255, blue : 0 },
    blue : { red : 0, green : 0, blue : 255 },
    yellow : { red : 255, green : 255, blue : 0 },
    white : { red : 255, green : 255, blue : 255 },
    off : { red : 0, green : 0, blue : 0 },
    purple : { red : 255, green : 0, blue : 255 },
};


export async function init() {

    const bus = i2c.openSync(1); // Opens the I2C bus number (usually 1)

    function sendLEDData(ledDataList) {
        return new Promise((resolve, reject) => {
            const sendData = [];
            for (let i = 0; i < NUM_LEDS; i++) {
                const ledData = ledDataList[i];
                sendData.push(ledData.status ? 1 : 0); // LED on/off status
                sendData.push(ledData.red); // Red component of color
                sendData.push(ledData.green); // Green component of color
                sendData.push(ledData.blue); // Blue component of color
            }

            bus.i2cWrite(I2C_ADDRESS, sendData.length, Buffer.from(sendData), (err) => {
                if ( err ) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

// Example usage: Set the desired LED status and color
    const ledDataList = [
        { status : true, red : 255, green : 0, blue : 0 }, // LED 1: On, Red color
        { status : false, red : 0, green : 255, blue : 0 }, // LED 2: Off, Green color
        { status : true, red : 0, green : 0, blue : 255 }, // LED 3: On, Blue color
        { status : false, red : 255, green : 255, blue : 0 }, // LED 4: Off, Yellow color
        { status : true, red : 255, green : 255, blue : 255 }, // LED 5: On, White color
    ];

    sendLEDData(ledDataList)
        .then(() => {
            console.log("LED data sent successfully!");
            bus.closeSync(); // Close the I2C bus
        })
        .catch((error) => {
            console.error("Error sending LED data:", error);
            bus.closeSync(); // Close the I2C bus
        });

}

export function turnOnDisplay() {
    for (let i = 0; i < NUM_LEDS; i++) {
        strip[i] = { status : 1, ...COLORS.red };
    }
    sendLEDData(strip);
}

export function turnOnCurrentLength(lengthDisplay, lengthPosition) {
    strip.forEach((pin, index) => {
        if ( index === lengthPosition ) {
            strip[index] = { status : 1, ...COLORS.green };
        } else {
            strip[index] = { status : 1, ...COLORS.red };
        }
    });
    sendLEDData(strip);

}

export function turnOffLengthDisplay() {
    strip.forEach((pin, index) => {
        strip[index] = { status : 0, ...COLORS.off };
    });
    sendLEDData(strip);
}

// function sendLEDData(ledDataList) {
//     console.log({ ledDataList });
//     const bus = i2c.openSync(1); // Opens the I2C bus number (usually 1)
//
//     const sendData = [];
//
//     for (let i = 0; i < NUM_LEDS; i++) {
//         const ledData = ledDataList[i];
//         sendData.push(ledData.status ? 1 : 0); // LED on/off status
//         sendData.push(ledData.red); // Red component of color
//         sendData.push(ledData.green); // Green component of color
//         sendData.push(ledData.blue); // Blue component of color
//     }
//
//     const buffer = Buffer.from(sendData);
//     bus.i2cWriteSync(I2C_ADDRESS, buffer.length, buffer);
// }

