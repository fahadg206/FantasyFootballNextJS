import axios from "axios";
import fetch from "node-fetch";
import { MongoClient, ServerApiVersion } from "mongodb";

const password = process.env.MONGO_PASSWORD || "kabofahad123";
const uri = `mongodb+srv://fantasypulseff:${password}@fantasypulsecluster.wj4o9kr.mongodb.net/?retryWrites=true&w=majority`;

let client;
let clientPromise;

if (!client) {
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  clientPromise = client.connect();
}

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

function GET(leagueID) {
  console.log("Called server");

  return axios
    .get("https://api.sleeper.app/v1/state/nfl")
    .catch((err) => {
      console.error(err);
      throw err;
    })
    .then((nflStateRes) => {
      return axios
        .get(`https://api.sleeper.app/v1/league/${leagueID}`)
        .catch((err) => {
          console.error(err);
          throw err;
        })
        .then((leagueDataRes) => {
          return axios
            .get(
              `https://api.sleeper.app/v1/league/${leagueID}/winners_bracket`
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

              resPromises.push(
                fetch(
                  `https://api.sleeper.app/projections/nfl/${year}/?season_type=regular&position[]=DB&position[]=DEF&position[]=DL&position[]=FLEX&position[]=IDP_FLEX&position[]=K&position[]=LB&position[]=QB&position[]=RB&position[]=REC_FLEX&position[]=SUPER_FLEX&position[]=TE&position[]=WR&position[]=WRRB_FLEX&order_by=ppr`
                )
              );

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
                  const playerStats = weeklyData[1];
                  // weeklyData.shift();
                  // weeklyData.shift();

                  const playerData = weeklyData.shift();

                  //console.log(playerStats);
                  const scoringSettings = leagueData.scoring_settings;
                  console.log("Format ,", leagueData.type);

                  processedPlayers = computePlayers(
                    playerData,
                    weeklyData,
                    playerStats,
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

function computePlayers(playerData, weeklyData, playerStats, scoringSettings) {
  const computedPlayers = {};

  const playerIndex = playerStats.reduce((index, player) => {
    index[player.player_id] = player;
    return index;
  }, {});

  //console.log("TESTING ADP, ", playerInfo);

  for (const id in playerData) {
    const projPlayer = playerData[id];
    if (projPlayer.first_name == "Amon-Ra") {
      //console.log("PLAYER, ", projPlayer);
      // console.log("TEST ", playerStats[1]);
      //console.log("Weekly ", weeklyData[1].player.player_id["7547"]);
    }

    const player = {
      fn: projPlayer.first_name,
      ln: projPlayer.last_name,
      pos: projPlayer.position,
      t: projPlayer.team ? projPlayer.team : "",
      wi: projPlayer.team ? {} : "",
      adp: "",
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
      computedPlayers[id].adp = playerIndex[id].stats;

      if (id == "7547") {
        //console.log("Found him");
        //console.log(player);
        console.log(computedPlayers[id].adp);
      }

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
  //console.log(computedPlayers["4017"].adp);
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
  console.log("I got calleddd");

  try {
    await clientPromise; // Ensure the client is connected
    // Access the database and collection
    const db = client.db("fantasypulse");
    const collection = db.collection("players");

    const playerArrayId = "week 1";

    // Define a filter to check if the document already exists based on the id field
    const filter = { id: playerArrayId };

    // Check the last update time
    const lastUpdate = await collection.findOne({ id: "lastUpdate" });
    const now = new Date();
    const lastUpdateDate = lastUpdate ? new Date(lastUpdate.date) : new Date(0);
    const isSameDay = now.toDateString() === lastUpdateDate.toDateString();

    if (isSameDay) {
      // Data already exists in the database and was updated today, return the existing data
      const existingDocument = await collection.findOne(filter);
      res.status(200).json(existingDocument.players);
    } else {
      // No data in the database or it was not updated today, fetch and insert processed players
      const processedPlayers = await GET(req.body);

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

      // Update the last update time
      await collection.updateOne(
        { id: "lastUpdate" },
        { $set: { date: now.toISOString() } },
        { upsert: true }
      );

      // Return the response after processing
      return res.status(200).json(processedPlayers);
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
