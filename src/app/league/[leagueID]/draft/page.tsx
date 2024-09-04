"use client";

import Head from "next/head";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import defaultPfp from "../../../images/rookie_pfp.png";
import Image from "next/image";

interface Player {
  player: string;
  player_id: string;
  team: string;
  position: string;
  round: number;
  pick: number;
  value: number;
  playerImage: string;
}

interface User {
  user: string;
  avatar: string;
  picks: Player[];
  bestValuePicks: Player[];
  draftGrade: string;
  summary: string;
  projectedRecord: string;
  weeklyPoints: number[];
  projectedWins: number;
}

interface Roster {
  roster_id: number;
  owner_id: string;
}

interface Manager {
  user_id: string;
  display_name: string;
  avatar: string;
}

interface Pick {
  picked_by: string;
  metadata: {
    first_name: string;
    last_name: string;
    team: string;
    position: string;
    username?: string;
  };
  round: number;
  pick_no: number;
  player_id: string;
  adp: { [key: string]: number };
}

const fetchPlayerValue = async (
  sleeperId: string,
  scoringType: string
): Promise<number> => {
  try {
    const response = await fetch("/api/fetchPlayerValues", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sleeperId, scoringType }),
    });
    const data = await response.json();
    return data.value || 500; // Return the value, or default to 500 if not found
  } catch (error) {
    console.error("Error fetching player value:", error);
    return 500; // Return 500 as default on error
  }
};

export default function Draft() {
  const [draftData, setDraftData] = useState<User[]>([]);
  const [maxRounds, setMaxRounds] = useState(0);
  const [totalRosterSize, setTotalRosterSize] = useState(0);
  const [rosterPositions, setRosterPositions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const REACT_APP_LEAGUE_ID = localStorage.getItem("selectedLeagueID") || "";

  const router = useRouter();

  useEffect(() => {
    if (
      typeof localStorage !== "undefined" &&
      (localStorage.getItem("selectedLeagueID") === null ||
        localStorage.getItem("selectedLeagueID") === undefined)
    ) {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        console.log("Fetching league data...");
        const leagueResponse = await axios.get(
          `https://api.sleeper.app/v1/league/${REACT_APP_LEAGUE_ID}`
        );
        console.log("League data:", leagueResponse.data);

        const totalRosters = leagueResponse.data.total_rosters;
        const rosterPositions = leagueResponse.data.roster_positions;

        const playersResponse = await fetch("/api/fetchPlayers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ leagueId: REACT_APP_LEAGUE_ID }),
        });
        const playersData = await playersResponse.json();
        console.log("Players data:", playersData);

        const weeklyMatchups = await fetchWeeklyMatchups(REACT_APP_LEAGUE_ID);
        console.log("Weekly matchups:", weeklyMatchups);

        const drafts = await axios.get(
          `https://api.sleeper.app/v1/league/${REACT_APP_LEAGUE_ID}/drafts`
        );
        const drafts_response = drafts.data;
        const draft_id = drafts_response[0].draft_id;
        const scoring_type = drafts_response[0].metadata.scoring_type;

        const response = await axios.get(
          `https://api.sleeper.app/v1/draft/${draft_id}/picks`
        );
        const picks: Pick[] = response.data;
        console.log("Draft picks:", picks);

        const users_response = await axios.get(
          `https://api.sleeper.app/v1/league/${REACT_APP_LEAGUE_ID}/users`
        );
        const rosters_response = await axios.get(
          `https://api.sleeper.app/v1/league/${REACT_APP_LEAGUE_ID}/rosters`
        );
        const rosters: Roster[] = rosters_response.data;

        const league_managers: Manager[] = users_response.data;
        const rosterToUserMap = createRosterToUserMap(rosters, league_managers);

        const sortedPicks = sortPicksByOrder(picks);

        const { users, maxRounds } = await processDraftData(
          sortedPicks,
          league_managers,
          playersData,
          weeklyMatchups,
          rosterToUserMap,
          scoring_type,
          totalRosters,
          rosterPositions
        );

        const usersArray = users.map((user) => ({
          user: user.user,
          user_id: user.user_id,
          picks: user.picks.map((pick) => ({
            player: pick.player,
            team: pick.team,
            position: pick.position,
            round: pick.round,
            pick: pick.pick,
            value: pick.value,
          })),
          projectedRecord: user.projectedRecord,
        }));

        const summaries = await fetchSummariesWithRetries(
          REACT_APP_LEAGUE_ID,
          scoring_type,
          usersArray
        );

        usersArray.forEach((user, index) => {
          if (users[index]) {
            users[index].summary =
              summaries[index]?.description || "No summary available.";
          }
        });

        setDraftData(users);
        setMaxRounds(maxRounds);
        setTotalRosterSize(totalRosters);
        setRosterPositions(rosterPositions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setLoading(false);
      }
    }

    fetchInitialData();
  }, [REACT_APP_LEAGUE_ID]);

  async function fetchSummariesWithRetries(
    REACT_APP_LEAGUE_ID: string,
    scoring_type: string,
    draftData: any[],
    maxRetries = 3,
    retryDelay = 1000
  ): Promise<any[]> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const summaries = await fetchSummaries(
          REACT_APP_LEAGUE_ID,
          scoring_type,
          draftData
        );
        return summaries;
      } catch (error) {
        if (attempt < maxRetries) {
          console.warn(
            `Attempt ${attempt} failed, retrying in ${retryDelay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          retryDelay *= 2; // Exponential backoff
        } else {
          console.error("Max retries reached. Failed to fetch summaries.");
          throw new Error("Failed to fetch summaries after retries");
        }
      }
    }
  }

  async function fetchSummaries(
    REACT_APP_LEAGUE_ID: string,
    scoring_type: string,
    draftData: any[]
  ): Promise<any[]> {
    try {
      const response = await fetch(
        "https://www.fantasypulseff.com/api/fetchSummaries",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            REACT_APP_LEAGUE_ID,
            scoring_type,
            draftData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch summaries");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching summaries:", error);
      throw error;
    }
  }

  async function fetchWeeklyMatchups(
    league_id: string
  ): Promise<{ [key: number]: any[] }> {
    const weeklyMatchups: { [key: number]: any[] } = {};

    for (let week = 1; week <= 14; week++) {
      const response = await axios.get(
        `https://api.sleeper.app/v1/league/${league_id}/matchups/${week}`
      );
      weeklyMatchups[week] = response.data;
    }

    return weeklyMatchups;
  }

  function createRosterToUserMap(
    rosters: Roster[],
    managers: Manager[]
  ): { [key: number]: string } {
    const map: { [key: number]: string } = {};
    rosters.forEach((roster) => {
      const manager = managers.find(
        (manager) => manager.user_id === roster.owner_id
      );
      if (manager) {
        map[roster.roster_id] = manager.user_id;
      }
    });
    return map;
  }

  function sortPicksByOrder(picks: Pick[]): Pick[] {
    return picks.sort((a, b) => a.pick_no - b.pick_no);
  }

  async function calculatePlayerValue(
    pick: Pick,
    playersData: any,
    scoringType: string
  ): Promise<number> {
    const playerValue = await fetchPlayerValue(pick.player_id, scoringType);
    return playerValue;
  }

  function getAdpField(scoringType: string): string {
    switch (scoringType) {
      case "ppr":
        return "adp_ppr";
      case "half_ppr":
        return "adp_half_ppr";
      case "dynasty":
        return "adp_dynasty";
      case "dynasty_ppr":
        return "adp_dynasty_ppr";
      case "dynasty_half_ppr":
        return "adp_dynasty_half_ppr";
      case "2qb":
        return "adp_2qb";
      case "dynasty_2qb":
        return "adp_dynasty_2qb";
      default:
        return "adp_std";
    }
  }

  async function processDraftData(
    picks: Pick[],
    league_managers: Manager[],
    playersData: { [key: string]: any },
    weeklyMatchups: { [key: number]: any[] },
    rosterToUserMap: { [key: number]: string },
    scoring_type: string,
    totalRosters: number,
    rosterPositions: string[]
  ): Promise<{ users: User[]; maxRounds: number }> {
    const users: { [key: string]: User } = {};
    let maxRounds = 0;
    const adpField = getAdpField(scoring_type);

    const managers_map = league_managers.reduce((users, user) => {
      users[user.user_id] = user;
      return users;
    }, {} as { [key: string]: Manager });

    for (const pick of picks) {
      const pickNo =
        pick.pick_no > 0
          ? pick.pick_no
          : calculateFallbackPickNo(pick, rosterToUserMap);

      const round = pick.round || 1;

      const playerValue = await calculatePlayerValue(
        pick,
        playersData,
        scoring_type
      );

      const player: Player = {
        player: `${pick.metadata.first_name} ${pick.metadata.last_name}`,
        player_id: pick.player_id,
        team: pick.metadata.team,
        position: pick.metadata.position,
        round,
        pick: pickNo,
        value: playerValue,
        playerImage: `https://sleepercdn.com/content/nfl/players/thumb/${pick.player_id}.jpg`,
      };

      if (!users[pick.picked_by]) {
        users[pick.picked_by] = {
          user:
            managers_map[pick.picked_by]?.display_name ||
            pick.metadata.username,
          avatar:
            `https://sleepercdn.com/avatars/thumbs/${
              managers_map[pick.picked_by]?.avatar
            }` || "",
          picks: [],
          bestValuePicks: [],
          draftGrade: "",
          summary: "",
          projectedRecord: "",
          weeklyPoints: [],
          projectedWins: 0,
        };
      }

      users[pick.picked_by].picks.push(player);

      if (round <= 15) {
        if (!users[pick.picked_by].bestValuePicks) {
          users[pick.picked_by].bestValuePicks = [];
        }
        users[pick.picked_by].bestValuePicks.push(player);
      }

      if (round > maxRounds) maxRounds = round;
    }

    for (let week = 1; week <= 14; week++) {
      weeklyMatchups[week].forEach((matchup) => {
        const { roster_id, starters } = matchup;
        const user_id = rosterToUserMap[roster_id];
        if (!users[user_id]) return;

        let weeklyPoints = 0;
        starters.forEach((player_id: string) => {
          weeklyPoints += parseFloat(playersData[player_id]?.wi[week].p || 0);
        });

        users[user_id].weeklyPoints.push(weeklyPoints);
      });
    }

    for (let week = 1; week <= 14; week++) {
      weeklyMatchups[week].forEach((matchup) => {
        const { roster_id, matchup_id } = matchup;
        const user_id = rosterToUserMap[roster_id];
        if (!users[user_id]) return;

        const opponentMatchup = weeklyMatchups[week].find(
          (m) => m.matchup_id === matchup_id && m.roster_id !== roster_id
        );
        const opponentUserId = rosterToUserMap[opponentMatchup.roster_id];
        const opponentPoints = opponentMatchup
          ? users[opponentUserId].weeklyPoints[week - 1]
          : 0;

        if (users[user_id].weeklyPoints[week - 1] > opponentPoints) {
          users[user_id].projectedWins++;
        }
      });
    }

    for (const user_id in users) {
      const projectedWins = users[user_id].projectedWins;
      const projectedRecord = `${projectedWins}-${14 - projectedWins}`;
      users[user_id].projectedRecord = projectedRecord;

      const positionalNeeds = calculatePositionalNeeds(
        users[user_id].bestValuePicks,
        rosterPositions
      );
      users[user_id].draftGrade = getDraftGrade(
        users[user_id].bestValuePicks,
        totalRosters,
        projectedWins,
        positionalNeeds,
        scoring_type,
        playersData
      );

      users[user_id].bestValuePicks = calculateBestValuePicks(
        users[user_id].bestValuePicks,
        adpField
      );
    }

    return { users: Object.values(users), maxRounds };
  }

  function calculatePositionalNeeds(
    draftedPlayers: Player[],
    rosterPositions: string[]
  ): number {
    const positionWeights = { QB: 2, RB: 1.5, WR: 1.5, TE: 1 };
    let positionalNeeds = 0;

    const positionCounts = rosterPositions.reduce((acc, pos) => {
      acc[pos] = 0;
      return acc;
    }, {} as { [key: string]: number });

    draftedPlayers.forEach((pick) => {
      if (positionCounts[pick.position] !== undefined) {
        positionCounts[pick.position]++;
      }
    });

    rosterPositions.forEach((position) => {
      const draftedCount = positionCounts[position] || 0;
      const requiredCount = rosterPositions.filter(
        (pos) => pos === position
      ).length;
      const deficit = requiredCount - draftedCount;
      if (deficit > 0) {
        positionalNeeds += deficit * (positionWeights[position] || 1);
      }
    });

    return positionalNeeds;
  }

  function calculateBestValuePicks(
    picks: Player[],
    adpField: string
  ): Player[] {
    return picks
      .map((pick) => ({
        ...pick,
        value:
          pick.adp && pick.adp[adpField] ? pick.pick - pick.adp[adpField] : 0,
      }))
      .sort((a, b) => a.value - b.value)
      .slice(0, 3);
  }

  function getDraftGrade(
    picks: Player[],
    totalRosters: number,
    projectedWins: number,
    positionalNeeds: number,
    scoring_type: string,
    playersData: any
  ): string {
    const draftValue = picks.reduce(
      (sum, pick) => sum + (isNaN(pick.value) ? 0 : pick.value),
      0
    );

    const teamSynergy = calculateTeamSynergy(picks, playersData);

    let adjustedDraftValue =
      draftValue * 2 + teamSynergy - positionalNeeds * 10;

    if (!scoring_type.includes("dynasty")) {
      adjustedDraftValue += projectedWins * totalRosters * 6;
      adjustedDraftValue -= (14 - projectedWins) * totalRosters * 6;
    }

    const winLossRatio = projectedWins / 14;
    if (winLossRatio >= 0.7) {
      adjustedDraftValue += totalRosters * 20;
    } else if (winLossRatio >= 0.5) {
      adjustedDraftValue += totalRosters * 10;
    } else if (winLossRatio < 0.4) {
      adjustedDraftValue -= totalRosters * 35;
    }

    console.log(
      "User draft value with projected record adjustment:",
      adjustedDraftValue
    );

    return calculateGrade(adjustedDraftValue, totalRosters);
  }

  function calculateGrade(
    adjustedDraftValue: number,
    totalRosters: number
  ): string {
    const gradeRanges = [
      { grade: "F", min: 100000, max: 109999 },
      { grade: "D", min: 110000, max: 114999 },
      { grade: "C-", min: 115000, max: 119999 },
      { grade: "C", min: 120000, max: 124999 },
      { grade: "C+", min: 130000, max: 139999 },
      { grade: "B-", min: 140000, max: 144999 },
      { grade: "B", min: 145000, max: 149999 },
      { grade: "B+", min: 150000, max: 154999 },
      { grade: "A-", min: 155000, max: 159999 },
      { grade: "A", min: 160000, max: 164999 },
      { grade: "A+", min: 165000, max: Infinity },
    ];

    for (const range of gradeRanges) {
      if (adjustedDraftValue >= range.min && adjustedDraftValue <= range.max) {
        return range.grade;
      }
    }

    return "F";
  }

  function calculateTeamSynergy(
    draftedPlayers: Player[],
    playersData: any
  ): number {
    let synergyScore = 0;

    draftedPlayers.forEach((player) => {
      const projection =
        parseFloat(playersData[player.player_id]?.wi?.[0]?.p) || 0;
      console.log("Projection for player", player.player, ":", projection);

      synergyScore += projection;
    });

    return synergyScore;
  }

  const handleImageError = (playerImage: string) => {
    setFailedImages((prev) => new Set(prev).add(playerImage));
  };

  if (loading) {
    return (
      <div role="status" className="h-[60vh] flex justify-center items-center">
        <svg
          aria-hidden="true"
          className="w-8 h-8 mr-2 text-black animate-spin dark:text-gray-600 fill-[#af1222]"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span>Loading Draft Data...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDEDED] dark:bg-gray-800">
      <Head>
        <title>Draft Page</title>
        <meta name="description" content="Draft page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-[#EDEDED] dark:bg-black shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center">Draft Page</h1>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 bg-[#e0dfdf] dark:bg-[#1a1a1a]">
          <div className="bg-[#EDEDED] dark:bg-black p-4 rounded-lg shadow-gray-700">
            <div className="overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  {draftData.map((user, userIndex) => (
                    <div key={userIndex} className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <img
                            src={user.avatar}
                            alt={`${user.user}'s avatar`}
                            className="w-16 h-16 rounded-full mr-4"
                          />
                          <h2 className="text-2xl font-bold">{user.user}</h2>
                        </div>
                        <div className="text-xl font-bold">
                          Grade:{" "}
                          <span className={getGradeColor(user.draftGrade)}>
                            {user.draftGrade}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {user.picks.map((pick, pickIndex) => (
                          <div
                            key={pickIndex}
                            className={`bg-[#e0dfdf] dark:bg-[#1a1a1a] border-r border-b dark:border-[#1a1a1a] border-[#af1222] border-opacity-10 p-4 rounded-xl shadow-lg `}
                          >
                            <div className="flex items-center mb-4">
                              <Image
                                src={
                                  failedImages.has(pick.playerImage)
                                    ? defaultPfp
                                    : pick.playerImage
                                }
                                alt={`${pick.player}`}
                                width={100}
                                height={80}
                                className="w-[100px] h-[80px] rounded-full mr-4"
                                onError={() =>
                                  handleImageError(pick.playerImage)
                                }
                              />
                              <div>
                                <p className="text-lg font-bold">
                                  {pick.player}
                                </p>
                                <span
                                  className={`font-bold ${getPickBgColor(
                                    pick.position
                                  )}`}
                                >
                                  {pick.position} -
                                </span>
                                {" " + pick.team}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-bold dark:font-normal ">
                                Round {pick.round}, Pick {pick.pick}
                              </p>
                              <Image
                                src={`https://sleepercdn.com/images/team_logos/nfl/${pick.team.toLowerCase()}.png`}
                                alt={`${pick.team} logo`}
                                width={50}
                                height={50}
                                className="w-[50px] h-[50px]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                        <div className="p-4 bg-[#a39f9f] dark:bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg lg:p-6 lg:text-sm">
                          <h3 className="text-lg font-bold lg:text-2xl">
                            Summary
                          </h3>
                          <p className="text-sm whitespace-pre-wrap lg:text-sm">
                            {user.summary || "No summary available."}
                          </p>
                        </div>
                        <div className="p-4 bg-[#a39f9f] dark:bg-[#1a1a1a] rounded-lg lg:p-8 lg:text-lg flex flex-col justify-center items-center">
                          <h3 className="text-lg font-bold lg:text-2xl text-center">
                            Projected Record
                          </h3>
                          <p
                            className={`text-4xl whitespace-pre-wrap lg:text-4xl mt-2 font-bold ${getProjectedRecordColor(
                              user.projectedRecord
                            )}`}
                          >
                            {user.projectedRecord ||
                              "No projected record available."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function calculateFallbackPickNo(
  pick: Pick,
  rosterToUserMap: { [key: number]: string }
): number {
  const userRosters = Object.keys(rosterToUserMap).length;
  const round = pick.round || 1;
  return (
    (round - 1) * userRosters +
    Object.keys(rosterToUserMap).indexOf(pick.picked_by) +
    1
  );
}

function getPickBgColor(position: string): string {
  switch (position) {
    case "QB":
      return "text-red-500";
    case "WR":
      return "text-blue-500";
    case "RB":
      return "text-green-500";
    case "TE":
      return "text-yellow-500";
    default:
      return "text-gray-600";
  }
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case "A+":
    case "A":
    case "A-":
      return "text-green-500";
    case "B+":
    case "B":
    case "B-":
      return "text-blue-500";
    case "C+":
    case "C":
    case "C-":
      return "text-yellow-500";
    case "D":
      return "text-orange-500";
    case "F":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
}

function getProjectedRecordColor(projectedRecord: string): string {
  const [wins, losses] = projectedRecord.split("-").map(Number);
  const winRate = wins / (wins + losses);

  if (winRate >= 0.75) {
    return "text-green-600";
  } else if (winRate >= 0.66) {
    return "text-green-500";
  } else if (winRate >= 0.55) {
    return "text-green-400";
  } else if (winRate >= 0.5) {
    return "text-blue-500";
  } else if (winRate >= 0.45) {
    return "text-yellow-400";
  } else if (winRate >= 0.33) {
    return "text-yellow-500";
  } else if (winRate >= 0.25) {
    return "text-orange-500";
  } else {
    return "text-red-500";
  }
}
