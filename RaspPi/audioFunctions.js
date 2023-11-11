import { exec } from "child_process";
import { promisifyExec } from "../utils.js";
import mpg321 from "mpg321";

const player = mpg321().remote();

player.gain(50);

// Function to check if Raspberry Pi is connected to Bluetooth headphones
async function checkBluetoothConnection() {
    try {
        await promisifyExec("pulseaudio --check");
    } catch (err) {
        console.error("Pulseaudio is not running!");
        await promisifyExec("pulseaudio --start");
    }

    return new Promise((resolve, reject) => {
        exec(`bluetoothctl connect ${process.env.DEVICE_ID}`, (error, stdout, stderr) => {
            if ( error ) {
                reject(error);
            } else {
                resolve(stdout.includes("Connection successful"));
            }
        });
    });
}

// Function to play the MP3 file from the given URL
export async function playMp3RaspPi(mp3FileName) {
    const isConnected = await checkBluetoothConnection();

    return new Promise(async (resolve, reject) => {
        if ( !isConnected ) {
            console.error("Not connected to the correct Bluetooth headphones!");

            reject(new Error("Not connected to the correct Bluetooth headphones!"));
        }

        // Delay so that the bluetooth connected voice shuts up before playing mp3
        await new Promise((resolve) => setTimeout(resolve, 5000));

        player.play(mp3FileName);
        player.on("end", () => {
            console.log("Audio streamed successfully!");

            stopMp3RaspPi();
            resolve();
        });
        player.on("error", (error) => {
            console.error("Audio playback failed with exit code:", error);
            stopMp3RaspPi();
            reject(new Error(`Audio playback failed with exit code: ${error}`));
        });
        // const child = exec(`mpg321 -R -g 50 ${mp3FileName}`, (error) => {
        //     if ( error ) {
        //         console.error("Failed to stream audio:", error);
        //         exec("bluetoothctl disconnect");
        //         reject(error);
        //     }
        // });
        //
        // child.on("close", (code) => {
        //     if ( code !== 0 ) {
        //         console.error("Audio playback failed with exit code:", code);
        //         exec("bluetoothctl disconnect");
        //         reject(new Error(`Audio playback failed with exit code: ${code}`));
        //     }
        //
        //     console.log("Audio streamed successfully!");
        //
        //     exec("bluetoothctl disconnect");
        //     resolve();
        // });
    });
}

export function pauseMp3RaspPi() {
    player.pause();
}

export function resumeMp3RaspPi() {
    player.pause();
}

export function stopMp3RaspPi() {
    player.quit();
    exec("bluetoothctl disconnect");
}