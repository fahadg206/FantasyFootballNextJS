import axios from "axios";
import { MongoClient } from "mongodb";

const uri = `mongodb+srv://fantasypulseff:${password}@fantasypulsecluster.wj4o9kr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function fetchPlayerData() {
  try {
    await client.connect();
    const db = client.db("fantasypulse");
    const collection = db.collection("players");

    const playerArrayId = "week 1";
    const filter = { id: playerArrayId };
    const existingDocument = await collection.findOne(filter);

    if (existingDocument) {
      return existingDocument.players;
    }

    const [nflStateRes, leagueDataRes, playoffsRes, playerDataRes] =
      await Promise.all([
        axios.get("https://api.sleeper.app/v1/state/nfl"),
        axios.get("https://api.sleeper.app/v1/league/864448469199347712"),
        axios.get(
          "https://api.sleeper.app/v1/league/864448469199347712/winners_bracket"
        ),
        fetch("https://api.sleeper.app/v1/players/nfl"),
      ]);

    const [nflState, leagueData, playoffs, playerData] = await Promise.all([
      nflStateRes.data,
      leagueDataRes.data,
      playoffsRes.data,
      playerDataRes.json(),
    ]);

    const regularSeasonLength = leagueData.settings.playoff_week_start - 1;
    const playoffLength = playoffs.pop().r;
    const fullSeasonLength = regularSeasonLength + playoffLength;

    const resPromises = [
      Promise.resolve(playerData), // Avoid unnecessary fetch
    ];

    for (let week = 1; week <= fullSeasonLength + 3; week++) {
      resPromises.push(
        fetch(
          `https://api.sleeper.app/projections/nfl/${nflState.league_season}/${week}?season_type=regular&position[]=DB&position[]=DEF&position[]=DL&position[]=FLEX&position[]=IDP_FLEX&position[]=K&position[]=LB&position[]=QB&position[]=RB&position[]=REC_FLEX&position[]=SUPER_FLEX&position[]=TE&position[]=WR&position[]=WRRB_FLEX&order_by=ppr`
        )
      );
    }

    const resJSONs = await Promise.all(resPromises.map((res) => res.json()));

    const playerDataForWeeks = resJSONs.shift();
    const scoringSettings = leagueData.scoring_settings;

    const computedPlayers = computePlayers(
      playerDataForWeeks,
      resJSONs,
      scoringSettings
    );

    const playerArray = { id: playerArrayId, players: computedPlayers };
    const updateOperation = {
      $set: playerArray,
    };

    await collection.updateOne(filter, updateOperation, {
      upsert: true,
    });

    return computedPlayers;
  } catch (error) {
    console.error("Error:", error);
    return null;
  } finally {
    // await client.close();
  }
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

  return computedPlayers;
}

function calculateProjection(projectedStats, scoreSettings) {
  let score = 0;
  for (const stat in projectedStats) {
    const multiplier = scoreSettings[stat] ? scoreSettings[stat] : 0;
    score += projectedStats[stat] * multiplier;
  }
  return round(score);
}

function round(num) {
  if (typeof num === "string") {
    num = parseFloat(num);
  }
  return (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2);
}

export default async function handler(req, res) {
  try {
    const processedPlayers = await fetchPlayerData();
    if (processedPlayers !== null) {
      return res.status(200).json(processedPlayers);
    } else {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
