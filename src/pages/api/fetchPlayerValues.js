// pages/api/fetchPlayerValues.js
import { MongoClient } from "mongodb";

const password = process.env.MONGO_PASSWORD || "kabofahad123";
const uri = `mongodb+srv://fantasypulseff:${password}@fantasypulsecluster.wj4o9kr.mongodb.net/?retryWrites=true&w=majority`;

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tlsAllowInvalidCertificates: true, // This line disables SSL validation
  });

  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { sleeperId, scoringType } = req.body;
  console.log("what was passed in ", sleeperId, scoringType);

  if (!sleeperId || !scoringType) {
    return res
      .status(400)
      .json({ message: "Sleeper ID and scoring type are required" });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("fantasypulse");
    const collection = db.collection("playersValues");
    console.log("connected I think ", scoringType);

    const player = await collection.findOne({ "Sleeper ID": sleeperId });
    console.log("Player? ", player);

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const value = player.RdrftValue
      ? scoringType.includes("dynasty")
        ? player.Value
        : player.RdrftValue
      : player.Value;

    return res.status(200).json({ value });
  } catch (error) {
    console.error("Error fetching player value:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
