"use client";
import { round } from "./universalFunctions.js";
import { waitForAll } from "./multiPromise.js";
var { axios, AxiosResponse } = require("./axiosModule.js");

const { REACT_APP_LEAGUE_ID } = process.env;
let players = new Map<string, any>();

interface PlayerData {
  injury_notes: string;
  first_name: string;
  last_name: string;
  position: string;
  team?: string;
  injury_status?: string;
}

interface WeeklyData {
  player_id: string;
  stats: Record<string, number>;
  opponent: string;
}

export async function GET(): Promise<Record<string, any>> {
  //console.log("Called server");

  const nflStateRes = await axios
    .get("https://api.sleeper.app/v1/state/nfl")
    .catch((err) => {
      console.error(err);
      throw err;
    });

  const leagueDataRes = await axios
    .get("https://api.sleeper.app/v1/league/864448469199347712")
    .catch((err) => {
      console.error(err);
      throw err;
    });

  const playoffsRes = await axios
    .get("https://api.sleeper.app/v1/league/864448469199347712/winners_bracket")
    .catch((err) => {
      console.error(err);
      throw err;
    });

  // console.log("Here: ", nflStateRes.data);
  const nflState = nflStateRes.data;

  const leagueData = leagueDataRes.data;
  const playoffs = playoffsRes.data;

  //console.log("Here's the state of the nfl: ", nflState);
  let year = nflState.league_season;
  const regularSeasonLength = leagueData.settings.playoff_week_start - 1;
  const playoffLength = playoffs.pop().r;
  const fullSeasonLength = regularSeasonLength + playoffLength;

  const resPromises: Promise<Response>[] = [
    fetch("https://api.sleeper.app/v1/players/nfl"),
  ];

  for (let week = 1; week <= fullSeasonLength + 3; week++) {
    resPromises.push(
      fetch(
        `https://api.sleeper.app/projections/nfl/${year}/${week}?season_type=regular&position[]=DB&position[]=DEF&position[]=DL&position[]=FLEX&position[]=IDP_FLEX&position[]=K&position[]=LB&position[]=QB&position[]=RB&position[]=REC_FLEX&position[]=SUPER_FLEX&position[]=TE&position[]=WR&position[]=WRRB_FLEX&order_by=ppr`
      )
    );
  }

  const responses = await waitForAll(...resPromises);

  const resJSONs: any[] = [];
  for (const res of responses) {
    if (!res.ok) {
      // throw error(500, "No luck");
    }
    resJSONs.push(res.json());
  }

  const weeklyData = await waitForAll(...resJSONs);

  const playerData = weeklyData.shift() as Record<string, PlayerData>;
  const scoringSettings = leagueData.scoring_settings;

  const processedPlayers = computePlayers(
    playerData,
    weeklyData,
    scoringSettings
  );

  const playerMap = new Map(Object.entries(processedPlayers));

  players = playerMap;

  //console.log(playerMap.get("4017"));

  return processedPlayers;
}

export function computePlayers(
  playerData: Record<string, PlayerData>,
  weeklyData: Array<any>,
  scoringSettings: Record<string, number>
): Record<string, any> {
  const computedPlayers: Record<string, any> = {};

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

const calculateProjection = (
  projectedStats: Record<string, number>,
  scoreSettings: Record<string, number>
): string => {
  let score = 0;
  for (const stat in projectedStats) {
    const multiplier = scoreSettings[stat] ? scoreSettings[stat] : 0;
    score += projectedStats[stat] * multiplier;
  }
  return round(score);
};

async function main() {
  try {
    await GET();
  } catch (error) {
    console.error("Error while fetching data:", error);
  }
}

main();
export { players };
