"use client";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
import { round } from "./universalFunctions.js";
import { waitForAll } from "./multiPromise.js";
import axios from "axios";
var REACT_APP_LEAGUE_ID = process.env.REACT_APP_LEAGUE_ID;
var players = new Map();
export function GET() {
  return __awaiter(this, void 0, void 0, function () {
    var nflStateRes,
      leagueDataRes,
      playoffsRes,
      nflState,
      leagueData,
      playoffs,
      year,
      regularSeasonLength,
      playoffLength,
      fullSeasonLength,
      resPromises,
      week,
      responses,
      resJSONs,
      _i,
      responses_1,
      res,
      weeklyData,
      playerData,
      scoringSettings,
      processedPlayers,
      playerMap;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          //console.log("Called server");
          return [
            4 /*yield*/,
            axios
              .get("https://api.sleeper.app/v1/state/nfl")
              .catch(function (err) {
                console.error(err);
                throw err;
              }),
          ];
        case 1:
          nflStateRes = _a.sent();
          return [
            4 /*yield*/,
            axios
              .get("https://api.sleeper.app/v1/league/864448469199347712")
              .catch(function (err) {
                console.error(err);
                throw err;
              }),
          ];
        case 2:
          leagueDataRes = _a.sent();
          return [
            4 /*yield*/,
            axios
              .get(
                "https://api.sleeper.app/v1/league/864448469199347712/winners_bracket"
              )
              .catch(function (err) {
                console.error(err);
                throw err;
              }),
          ];
        case 3:
          playoffsRes = _a.sent();
          nflState = nflStateRes.data;
          leagueData = leagueDataRes.data;
          playoffs = playoffsRes.data;
          //console.log("Here's the state of the nfl: ", nflState);
          year = nflState.league_season;
          regularSeasonLength = leagueData.settings.playoff_week_start - 1;
          playoffLength = playoffs.pop().r;
          fullSeasonLength = regularSeasonLength + playoffLength;
          resPromises = [fetch("https://api.sleeper.app/v1/players/nfl")];
          for (week = 1; week <= fullSeasonLength + 3; week++) {
            resPromises.push(
              fetch(
                "https://api.sleeper.app/projections/nfl/"
                  .concat(year, "/")
                  .concat(
                    week,
                    "?season_type=regular&position[]=DB&position[]=DEF&position[]=DL&position[]=FLEX&position[]=IDP_FLEX&position[]=K&position[]=LB&position[]=QB&position[]=RB&position[]=REC_FLEX&position[]=SUPER_FLEX&position[]=TE&position[]=WR&position[]=WRRB_FLEX&order_by=ppr"
                  )
              )
            );
          }
          return [4 /*yield*/, waitForAll.apply(void 0, resPromises)];
        case 4:
          responses = _a.sent();
          resJSONs = [];
          for (_i = 0, responses_1 = responses; _i < responses_1.length; _i++) {
            res = responses_1[_i];
            if (!res.ok) {
              // throw error(500, "No luck");
            }
            resJSONs.push(res.json());
          }
          return [4 /*yield*/, waitForAll.apply(void 0, resJSONs)];
        case 5:
          weeklyData = _a.sent();
          playerData = weeklyData.shift();
          scoringSettings = leagueData.scoring_settings;
          processedPlayers = computePlayers(
            playerData,
            weeklyData,
            scoringSettings
          );
          playerMap = new Map(Object.entries(processedPlayers));
          players = playerMap;
          //console.log(playerMap.get("4017"));
          return [2 /*return*/, processedPlayers];
      }
    });
  });
}
export function computePlayers(playerData, weeklyData, scoringSettings) {
  var computedPlayers = {};
  for (var id in playerData) {
    var projPlayer = playerData[id];
    var player = {
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
  for (var week = 1; week <= weeklyData.length; week++) {
    for (var _i = 0, _a = weeklyData[week - 1]; _i < _a.length; _i++) {
      var player = _a[_i];
      var id = player.player_id;
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
var calculateProjection = function (projectedStats, scoreSettings) {
  var score = 0;
  for (var stat in projectedStats) {
    var multiplier = scoreSettings[stat] ? scoreSettings[stat] : 0;
    score += projectedStats[stat] * multiplier;
  }
  return round(score);
};
function main() {
  return __awaiter(this, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [4 /*yield*/, GET()];
        case 1:
          _a.sent();
          return [3 /*break*/, 3];
        case 2:
          error_1 = _a.sent();
          console.error("Error while fetching data:", error_1);
          return [3 /*break*/, 3];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
main();
export { players };
