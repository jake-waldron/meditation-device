import { promisifyExec } from "./utils.js";

export default async function playMP3(mp3FileName) {
    try {
        await promisifyExec(`afplay ${mp3FileName}`);
        console.log("Audio streamed successfully!");
    } catch (err) {
        console.error("Failed to stream audio:", err);
    }
}
