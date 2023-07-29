import utils from 'util';
import { exec } from 'child_process';
import path from "path";
import fs from "fs";

export function removeMp3Files() {
    console.log('clearing folder');
    const directoryPath = path.join('./audio');
    const files = fs.readdirSync(directoryPath);
    const mp3Files = files.filter((file) => path.extname(file) === '.mp3');
    mp3Files.forEach((file) => {
        fs.unlinkSync(path.join(directoryPath, file));
    });
    console.log('mp3 files removed');
}

export const promisifyExec = utils.promisify(exec);

export const meditationDurations = {
    0: '3min',
    1: '5min',
    2: '10min',
    3: '15min',
    4: '20min',
}