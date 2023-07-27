// pages/api/players.js
import { players } from "../src/server/playerInfo.js";

export default function handler(req, res) {
  // Simulate an asynchronous operation using setTimeout
  setTimeout(() => {
    res.status(200).json(players);
  }, 1000); // Simulate a 1-second delay to mimic real API behavior
}
