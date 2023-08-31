import axios from "axios";
import fetch from "node-fetch";

const password = process.env.MONGO_PASSWORD;

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://fantasypulseff:${password}@fantasypulsecluster.wj4o9kr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {}

run().catch(console.dir);

const round = (num) => {
  if (typeof num === "string") {
    num = parseFloat(num);
  }
  return (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2);
};

async function waitForAll(...ps) {
  const promises = ps.map((p) => (p instanceof Response ? p.json() : p));
  return Promise.all(promises);
}

let players = new Map();
let processedPlayers;

function GET() {
  console.log("Called server");

  return axios
    .get("https://api.sleeper.app/v1/state/nfl")
    .catch((err) => {
      console.error(err);
      throw err;
    })
    .then((nflStateRes) => {
      return axios
        .get("https://api.sleeper.app/v1/league/864448469199347712")
        .catch((err) => {
          console.error(err);
          throw err;
        })
        .then((leagueDataRes) => {
          return axios
            .get(
              "https://api.sleeper.app/v1/league/864448469199347712/winners_bracket"
            )
            .catch((err) => {
              console.error(err);
              throw err;
            })
            .then((playoffsRes) => {
              const nflState = nflStateRes.data;
              const leagueData = leagueDataRes.data;
              const playoffs = playoffsRes.data;

              console.log("Here's the state of the nfl: ", nflState);
              let year = nflState.league_season;
              const regularSeasonLength =
                leagueData.settings.playoff_week_start - 1;
              const playoffLength = playoffs.pop().r;
              const fullSeasonLength = regularSeasonLength + playoffLength;

              const resPromises = [
                fetch("https://api.sleeper.app/v1/players/nfl"),
              ];

              for (let week = 1; week <= fullSeasonLength + 3; week++) {
                resPromises.push(
                  fetch(
                    `https://api.sleeper.app/projections/nfl/${year}/${week}?season_type=regular&position[]=DB&position[]=DEF&position[]=DL&position[]=FLEX&position[]=IDP_FLEX&position[]=K&position[]=LB&position[]=QB&position[]=RB&position[]=REC_FLEX&position[]=SUPER_FLEX&position[]=TE&position[]=WR&position[]=WRRB_FLEX&order_by=ppr`
                  )
                );
              }

              return waitForAll(...resPromises).then((responses) => {
                const resJSONs = responses.map((res) => {
                  if (!res.ok) {
                    // throw error(500, "No luck");
                  }
                  return res.json();
                });

                return waitForAll(...resJSONs).then((weeklyData) => {
                  const playerData = weeklyData.shift();
                  const scoringSettings = leagueData.scoring_settings;

                  processedPlayers = computePlayers(
                    playerData,
                    weeklyData,
                    scoringSettings
                  );
                  // Filter players based on position
                  const filteredPlayers = {};
                  for (const playerId in processedPlayers) {
                    const player = processedPlayers[playerId];
                    if (
                      (player.pos === "QB" ||
                        player.pos === "WR" ||
                        player.pos === "RB" ||
                        player.pos === "TE" ||
                        player.pos === "K" ||
                        player.pos === "DEF") &&
                      player.t
                    ) {
                      filteredPlayers[playerId] = player;
                    }
                  }

                  const playerMap = new Map(Object.entries(filteredPlayers));

                  players = playerMap;

                  //console.log(playerMap.get("4017"));

                  return filteredPlayers;
                });
              });
            });
        });
    });
}

function computePlayers(playerData, weeklyData, scoringSettings) {
  const computedPlayers = {};

  for (const id in playerData) {
    const projPlayer = playerData[id];

    const player = {
      fn: projPlayer.first_name,
      ln: projPlayer.last_name,
      pos: projPlayer.position,
      t: projPlayer.team ? projPlayer.team : "",
      wi: projPlayer.team ? {} : "",
      is:
        projPlayer.team && projPlayer.injury_status
          ? projPlayer.injury_status
          : "",
    };
    if (projPlayer.team) {
      player.t = projPlayer.team;
      player.wi = {};
    }
    if (projPlayer.team && projPlayer.injury_status) {
      player.is = projPlayer.injury_status;
    }

    computedPlayers[id] = player;
  }

  for (let week = 1; week <= weeklyData.length; week++) {
    for (const player of weeklyData[week - 1]) {
      const id = player.player_id;

      if (!computedPlayers[id].wi) continue;

      computedPlayers[id].wi[week] = {
        p: calculateProjection(player.stats, scoringSettings),
        o: player.opponent,
      };
    }
  }

  computedPlayers["OAK"] = computedPlayers["LV"];
  // console.log("Called player");
  // console.log(computedPlayers["4017"].wi[1]);
  // console.log(computedPlayers["4017"].pos);
  // console.log(computedPlayers["4017"].fn);
  return computedPlayers;
}

const calculateProjection = (projectedStats, scoreSettings) => {
  let score = 0;
  for (const stat in projectedStats) {
    const multiplier = scoreSettings[stat] ? scoreSettings[stat] : 0;
    score += projectedStats[stat] * multiplier;
  }
  return round(score);
};

export default async function handler(req, res) {
  // console.log("What we got", req.body);
  console.log("I got calleddd");

  try {
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // Access the database and collection
    const db = client.db("fantasypulse");
    const collection = db.collection("players");

    const playerArrayId = "week 1";

    // Define a filter to check if the document already exists based on the id field
    const filter = { id: playerArrayId };

    // Check if the document already exists
    const existingDocument = await collection.findOne(filter);

    if (!existingDocument) {
      // No data in the database, fetch and insert processed players
      const processedPlayers = await GET();

      //filter here

      const playerArray = { id: playerArrayId, players: processedPlayers };

      // Define an update operation with the "upsert" option
      const updateOperation = {
        $set: playerArray, // This will update the fields of the existing document or insert a new one if not found
      };

      // Perform the upsert operation
      const result = await collection.updateOne(filter, updateOperation, {
        upsert: true,
      });

      if (result.upsertedCount === 1) {
        console.log("Document inserted.");
      } else if (result.matchedCount === 1) {
        console.log("Document updated.");
      } else {
        console.log("No document inserted or updated.");
      }

      // Return the response after processing
      return res.status(200).json(processedPlayers);
    } else {
      // Data already exists in the database, return the existing data
      res.status(200).json(existingDocument.players);
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // Close the client connection in the finally block
    //await client.close();
  }
}
