const axios = require("axios");
const fetch = require("node-fetch");

// Initialize the server

const port = 3001 || process.env.PORT; // Choose a suitable port number

const { Response } = require("node-fetch");

async function waitForAll(...ps) {
  const promises = ps.map((p) => (p instanceof Response ? p.json() : p));
  return Promise.all(promises);
}

const round = (num) => {
  if (typeof num === "string") {
    num = parseFloat(num);
  }
  return (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2);
};

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

                  const playerMap = new Map(Object.entries(processedPlayers));

                  players = playerMap;

                  //console.log(playerMap.get("4017"));

                  return processedPlayers;
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

// Define the serverless function handler
module.exports = async (req, res) => {
  try {
    const processedPlayers = await GET(); // Call your data retrieval function
    res.status(200).json("processedPlayers");
  } catch (error) {
    console.error("Error while fetching data:", error);
    res.status(500).json({ error: "Internal server error brodie" });
  }
};

// Trigger the GET function when the server starts
async function initializeData() {
  try {
    await GET();
    console.log("Data loaded successfully!");
  } catch (error) {
    console.error("Error while fetching data:", error);
  }
}
