// // PlayersServerComponent.tsx
// import axios from "axios";

// // Define your Server Component logic
// export default async function PlayersServerComponent () => {
//   async function waitForAll<T>(...ps: Promise<T | Response>[]): Promise<T[]> {
//     const promises = ps.map((p) => (p instanceof Response ? p.json() : p));
//     return Promise.all(promises);
//   }

//   const round = (num: number | string): string => {
//     if (typeof num === "string") {
//       num = parseFloat(num);
//     }
//     return (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2);
//   };

//   interface PlayerData {
//     [id: string]: {
//       first_name: string;
//       last_name: string;
//       position: string;
//       team?: string;
//       injury_status?: string;
//     };
//   }

//   let players: Map<string, PlayerData> = new Map();
//   let processedPlayers: PlayerData;

//   async function GET() {
//     console.log("Called server");

//     try {
//       const nflStateRes = await axios.get(
//         "https://api.sleeper.app/v1/state/nfl"
//       );
//       const leagueDataRes = await axios.get(
//         "https://api.sleeper.app/v1/league/864448469199347712"
//       );
//       const playoffsRes = await axios.get(
//         "https://api.sleeper.app/v1/league/864448469199347712/winners_bracket"
//       );

//       const nflState = nflStateRes.data;
//       const leagueData = leagueDataRes.data;
//       const playoffs = playoffsRes.data;

//       console.log("Here's the state of the nfl: ", nflState);
//       let year = nflState.league_season;
//       const regularSeasonLength = leagueData.settings.playoff_week_start - 1;
//       const playoffLength = playoffs.pop().r;
//       const fullSeasonLength = regularSeasonLength + playoffLength;

//       const resPromises = [axios.get("https://api.sleeper.app/v1/players/nfl")];

//       for (let week = 1; week <= fullSeasonLength + 3; week++) {
//         resPromises.push(
//           axios.get(
//             `https://api.sleeper.app/projections/nfl/${year}/${week}?season_type=regular&position[]=DB&position[]=DEF&position[]=DL&position[]=FLEX&position[]=IDP_FLEX&position[]=K&position[]=LB&position[]=QB&position[]=RB&position[]=REC_FLEX&position[]=SUPER_FLEX&position[]=TE&position[]=WR&position[]=WRRB_FLEX&order_by=ppr`
//           )
//         );
//       }

//       const responses = await waitForAll(...resPromises);

//       const resJSONs = responses.map((res) => {
//         if (!res.ok) {
//           // throw error(500, "No luck");
//         }
//         return res.data;
//       });

//       const weeklyData = await waitForAll(...resJSONs);

//       const playerData = weeklyData.shift();
//       const scoringSettings = leagueData.scoring_settings;

//       processedPlayers = computePlayers(
//         playerData,
//         weeklyData,
//         scoringSettings
//       );

//       const playerMap = new Map(Object.entries(processedPlayers));
//       players = playerMap;

//       console.log(playerMap.get("4017"));

//       return processedPlayers;
//     } catch (err) {
//       console.error(err);
//       throw err;
//     }
//   }

//   const fetchPlayerData = async () => {
//     const playersData = await GET();
//     return playersData;
//   };

//   function computePlayers(
//     playerData: PlayerData,
//     weeklyData: any[],
//     scoringSettings: any
//   ): PlayerData {
//     const computedPlayers: PlayerData = {};

//     for (const id in playerData) {
//       const projPlayer = playerData[id];

//       const player = {
//         fn: projPlayer.first_name,
//         ln: projPlayer.last_name,
//         pos: projPlayer.position,
//         t: projPlayer.team ? projPlayer.team : "",
//         wi: projPlayer.team ? {} : "",
//         is:
//           projPlayer.team && projPlayer.injury_status
//             ? projPlayer.injury_status
//             : "",
//       };
//       if (projPlayer.team) {
//         player.t = projPlayer.team;
//         player.wi = {};
//       }
//       if (projPlayer.team && projPlayer.injury_status) {
//         player.is = projPlayer.injury_status;
//       }

//       computedPlayers[id] = player;
//     }

//     for (let week = 1; week <= weeklyData.length; week++) {
//       for (const player of weeklyData[week - 1]) {
//         const id = player.player_id;

//         if (!computedPlayers[id].wi) continue;

//         computedPlayers[id].wi[week] = {
//           p: calculateProjection(player.stats, scoringSettings),
//           o: player.opponent,
//         };
//       }
//     }

//     computedPlayers["OAK"] = computedPlayers["LV"];

//     return computedPlayers;
//   }

//   const calculateProjection = (
//     projectedStats: any,
//     scoreSettings: any
//   ): string | undefined => {
//     let score = 0;
//     for (const stat in projectedStats) {
//       const multiplier = scoreSettings[stat] ? scoreSettings[stat] : 0;
//       score += projectedStats[stat] * multiplier;
//     }
//     return round(score);
//   };

//   const playersData = await fetchPlayerData();
//   return playersData;
// });
