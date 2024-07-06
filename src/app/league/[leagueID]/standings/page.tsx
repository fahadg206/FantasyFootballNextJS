"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FiAward } from "react-icons/fi";
import axios from "axios";
import helmet from "../../../images/helmet2.png";
import getMatchupMap from "../../../libs/getMatchupData";

interface ManagerInfo {
  [userId: string]: {
    avatar: string;
    name: string;
    roster_id?: string;
    user_id?: string;
    starters?: string[];
    team_points_for_dec?: string;
    team_points_against_dec?: string;
    team_points_for?: string;
    team_points_against?: string;
    wins?: string;
    losses?: string;
    streak?: string;
    playoffOdds?: number;
    matchups?: {
      [week: number]: {
        opponentId?: string;
        points?: number;
      };
    };
  };
}

interface TeamData {
  avatar: string;
  name: string;
  roster_id?: string;
  user_id?: string;
  starters?: string[];
  team_points_for_dec?: string;
  team_points_against_dec?: string;
  team_points_for?: string;
  team_points_against?: string;
  wins?: string;
  losses?: string;
  playoffOdds?: number;
}

type SortedTeamData = [string, TeamData][];

const Page: React.FC = () => {
  const [managerInfo, setManagerInfo] = useState<ManagerInfo>({});
  const [sortedTeamDataFinal, setSortedTeamDataFinal] =
    useState<SortedTeamData>([]);
  const [showPlayoffOdds, setShowPlayoffOdds] = useState(false);
  const [cachedSimulations, setCachedSimulations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading Standings");
  const selectedLeagueID = localStorage.getItem("selectedLeagueID");
  const router = useRouter();
  const [playersData, setPlayersData] = useState<any>({});

  const REACT_APP_LEAGUE_ID =
    localStorage.getItem("selectedLeagueID") || "1003413138751987712";

  useEffect(() => {
    const messages = [
      "Loading Standings",
      "Importing League Data",
      "Calculating Projections",
    ];
    let messageIndex = 0;

    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (
      typeof localStorage !== "undefined" &&
      (localStorage.getItem("selectedLeagueID") === null ||
        localStorage.getItem("selectedLeagueID") === undefined)
    ) {
      router.push("/");
    }
  }, [router]);

  const getUsers = async () => {
    try {
      const response = await axios.get<any>(
        `https://api.sleeper.app/v1/league/${selectedLeagueID}/users`
      );
      return response.data;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get users");
    }
  };

  const getRoster = async () => {
    try {
      const response = await axios.get<any>(
        `https://api.sleeper.app/v1/league/${selectedLeagueID}/rosters`
      );
      return response.data;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get rosters");
    }
  };

  const getLeagueSettings = async () => {
    try {
      const response = await axios.get<any>(
        `https://api.sleeper.app/v1/league/${selectedLeagueID}`
      );
      return response.data;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get league settings");
    }
  };

  const fetchMatchupData = async (week: number) => {
    try {
      return await getMatchupMap(REACT_APP_LEAGUE_ID, week);
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get matchups");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const playersResponse = await fetch(
          "http://localhost:3000/api/fetchPlayers",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ leagueId: REACT_APP_LEAGUE_ID }),
          }
        );
        const p_data = await playersResponse.json();
        console.log("Projections: ,", p_data["4984"]);
        setPlayersData(p_data);

        const usersData = await getUsers();
        const rostersData = await getRoster();
        const leagueSettings = await getLeagueSettings();
        const playoffStartWeek = leagueSettings.settings.playoff_week_start;

        const usersWithRoster = usersData.filter((user) =>
          rostersData.some((roster) => roster.owner_id === user.user_id)
        );

        const managerInfo: ManagerInfo = {};

        for (const user of usersWithRoster) {
          managerInfo[user.user_id] = {
            avatar: user.avatar
              ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}`
              : helmet,
            name: user.display_name,
            user_id: user.user_id,
            matchups: {}, // Initialize the matchups object
          };
        }

        for (const roster of rostersData) {
          if (managerInfo[roster.owner_id]) {
            managerInfo[roster.owner_id].roster_id = roster.roster_id;
            managerInfo[roster.owner_id].starters = roster.starters;
            managerInfo[roster.owner_id].team_points_for_dec =
              roster.settings.fpts_decimal;
            managerInfo[roster.owner_id].team_points_for = roster.settings.fpts;
            managerInfo[roster.owner_id].team_points_against_dec =
              roster.settings.fpts_against_decimal;
            managerInfo[roster.owner_id].team_points_against =
              roster.settings.fpts_against || "0";
            managerInfo[roster.owner_id].wins = roster.settings.wins;
            managerInfo[roster.owner_id].losses = roster.settings.losses;

            if (roster.metadata && roster.metadata.streak) {
              managerInfo[roster.owner_id].streak = roster.metadata.streak;
            }
          }
        }

        // Get matchups data for each week until the playoffs start
        const matchupData: { [key: number]: any } = {};
        for (let week = 1; week < playoffStartWeek; week++) {
          const data = await fetchMatchupData(week);
          matchupData[week] = data.updatedScheduleData;
        }

        console.log("Manager Info after fetching matchups:", managerInfo);

        const teamArray = Object.entries(managerInfo);
        let sortedTeamData = teamArray
          .sort((a, b) => {
            const bPoints =
              (parseFloat(b[1].team_points_for || "0") || 0) +
              (parseFloat(b[1].team_points_for_dec || "0") || 0) / 100;
            const aPoints =
              (parseFloat(a[1].team_points_for || "0") || 0) +
              (parseFloat(a[1].team_points_for_dec || "0") || 0) / 100;
            return bPoints - aPoints;
          })
          .sort((a, b) => {
            const winsA = parseInt(a[1].wins || "0");
            const winsB = parseInt(b[1].wins || "0");
            return winsB - winsA;
          });

        console.log("Sorted Team Data before simulation:", sortedTeamData);

        const updatedManagerInfo = await calculatePlayoffOdds(
          managerInfo,
          sortedTeamData,
          playoffStartWeek,
          p_data,
          matchupData
        );

        console.log("Sorted Team Data after simulation:", updatedManagerInfo);

        // Check if all teams have a 0-0 record
        const allZeroRecord = sortedTeamData.every(
          ([, teamData]) => parseInt(teamData.wins || "0") === 0
        );

        // Sort by playoff odds if all records are 0-0
        if (allZeroRecord) {
          sortedTeamData = sortedTeamData.sort(
            (a, b) =>
              (updatedManagerInfo[b[0]].playoffOdds || 0) -
              (updatedManagerInfo[a[0]].playoffOdds || 0)
          );
        }

        setManagerInfo(updatedManagerInfo);
        setSortedTeamDataFinal(sortedTeamData ? sortedTeamData : teamArray);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedLeagueID]);

  const calculatePlayoffOdds = async (
    managerInfo: ManagerInfo,
    sortedTeamData: SortedTeamData,
    playoffStartWeek: number,
    p_data: any,
    matchupData: any
  ) => {
    const calculateWinProbability = (
      teamProjection: number,
      opponentProjection: number
    ): number => {
      const randomFactor = Math.random();
      return teamProjection * randomFactor > opponentProjection
        ? 1
        : opponentProjection * randomFactor > teamProjection
        ? -1
        : 0;
    };

    if (!cachedSimulations) {
      const totalSimulations = 1000;
      const playoffSpots = 6;

      const results: { [key: string]: { wins: number; playoffCount: number } } =
        {};

      sortedTeamData.forEach(([userId, user]) => {
        results[userId] = { wins: parseInt(user.wins || "0"), playoffCount: 0 };
      });

      for (let i = 0; i < totalSimulations; i++) {
        const simulatedResults = JSON.parse(JSON.stringify(results));

        for (let week = 1; week < playoffStartWeek; week++) {
          for (const [userId, user] of sortedTeamData) {
            const teamProjection = calculateTeamProjection(
              managerInfo[userId].starters || [],
              week,
              p_data
            );
            const opponentId = matchupData[week][userId]?.opponent_id;
            console.log("manager, ", matchupData[week][userId]?.opponent);
            const opponentProjection = calculateTeamProjection(
              managerInfo[opponentId]?.starters || [],
              week,
              p_data
            );

            const winProbability = calculateWinProbability(
              teamProjection,
              opponentProjection
            );

            if (winProbability > 0) {
              simulatedResults[userId].wins += 1;
            } else if (winProbability < 0) {
              simulatedResults[opponentId].wins += 1;
            }
          }
        }

        const sortedSimulatedResults = Object.entries(simulatedResults).sort(
          (a, b) => b[1].wins - a[1].wins
        );

        for (let j = 0; j < playoffSpots; j++) {
          results[sortedSimulatedResults[j][0]].playoffCount += 1;
        }
      }

      const updatedManagerInfo = { ...managerInfo };

      Object.entries(results).forEach(([userId, result]) => {
        updatedManagerInfo[userId].playoffOdds =
          (result.playoffCount / totalSimulations) * 100;
        updatedManagerInfo[userId].playoffCount = result.playoffCount;
      });

      // Cache the simulation results
      setCachedSimulations(updatedManagerInfo);

      return updatedManagerInfo;
    } else {
      // Use cached simulations and adjust for each subsequent simulation
      const totalSimulations = 100;
      const adjustedManagerInfo = JSON.parse(JSON.stringify(cachedSimulations));

      for (let i = 0; i < totalSimulations; i++) {
        for (let week = 1; week < playoffStartWeek; week++) {
          for (const [userId, user] of sortedTeamData) {
            const teamProjection = calculateTeamProjection(
              managerInfo[userId].starters || [],
              week,
              p_data
            );
            const opponentId = matchupData[week][userId]?.opponent_id;
            console.log("manager, ", matchupData[week][userId]?.opponent);
            const opponentProjection = calculateTeamProjection(
              managerInfo[opponentId]?.starters || [],
              week,
              p_data
            );

            const winProbability = calculateWinProbability(
              teamProjection,
              opponentProjection
            );

            if (winProbability > 0) {
              adjustedManagerInfo[userId].wins += 1;
            } else if (winProbability < 0) {
              adjustedManagerInfo[opponentId].wins += 1;
            }
          }
        }
      }

      Object.entries(adjustedManagerInfo).forEach(([userId, user]) => {
        user.playoffOdds = (user.playoffCount / totalSimulations) * 100;
      });

      return adjustedManagerInfo;
    }
  };

  const calculateTeamProjection = (
    starters: string[],
    week: number,
    p_data: any
  ): number => {
    let teamProjection = 0;
    starters.forEach((playerId) => {
      const playerData = p_data && p_data[playerId];
      if (
        playerData &&
        playerData.wi &&
        playerData.wi[week.toString()] &&
        playerData.wi[week.toString()].p
      ) {
        teamProjection += parseFloat(playerData.wi[week.toString()].p);
      }
    });
    return teamProjection;
  };

  if (loading) {
    return (
      <div role="status" className=" h-[60vh] flex justify-center items-center">
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
        <span>{loadingMessage}</span>
      </div>
    );
  }

  const Table = () => {
    return (
      <div className="w-[90vw] xl:w-[60vw] shadow-lg rounded-lg overflow-x-scroll border-[1px] dark:border-[#1a1a1a] ">
        <table className="w-full">
          <thead>
            <tr className="border-b-[1px] border-[#1a1a1a] text-sm ">
              <th className="text-start p-4 font-medium text-[11px] md:text-[16px]">
                League Manager
              </th>
              <th className="text-start p-4 font-medium text-[11px] md:text-[16px]">
                FP Rank
              </th>
              <th className="text-start p-4 font-medium text-[11px] md:text-[16px]">
                W
              </th>
              <th className="text-start p-4 font-medium text-[11px] md:text-[16px]">
                L
              </th>
              <th className="text-start p-4 font-medium text-[11px] md:text-[16px]">
                Playoff Odds
              </th>
              <th className="text-start p-4 font-medium text-[11px] md:text-[16px]">
                PF
              </th>
              <th className="text-start p-4 font-medium text-[11px] md:text-[16px]">
                PA
              </th>
              {sortedTeamDataFinal.some(
                ([, user]) => user.streak !== undefined
              ) && (
                <th className="text-start p-4 font-medium text-[11px] md:text-[16px]">
                  Streak
                </th>
              )}
            </tr>
          </thead>
          <tbody className="text-[11px] md:text-[16px]">
            {sortedTeamDataFinal.map(([userId, user], index) => {
              return <TableRows key={userId} user={user} index={index} />;
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const TableRows: React.FC<{ user: ManagerInfo[string]; index: number }> = ({
    user,
    index,
  }) => {
    const rankOrdinal = numberToOrdinal(index + 1);

    return (
      <motion.tr
        layoutId={`row-${user.user_id}`}
        className="border-[1px] dark:border-[#1a1a1a]"
      >
        <td className="p-4 flex items-center gap-3 overflow-hidden ">
          <Image
            src={user.avatar}
            alt="Example user photo"
            width={30}
            height={30}
            className="rounded-full bg-slate-300 object-cover object-top "
          />
          <div>
            <span className="block mb-1 font-medium">{user.name}</span>
            <span className="block text-xs "></span>
          </div>
        </td>

        <td className="p-4">
          <div
            className={`flex items-center gap-2 font-medium ${
              rankOrdinal === "1st" && "text-[#af1222]"
            }`}
          >
            <span>{rankOrdinal}</span>
            {rankOrdinal === "1st" && <FiAward className="text-xl" />}{" "}
          </div>
        </td>

        <td className="p-4 font-medium">{user.wins}</td>
        <td className="p-4 font-medium">{user.losses}</td>
        <td className="p-4 font-medium">
          {user.playoffOdds !== undefined
            ? `${user.playoffOdds.toFixed(2)}%`
            : "N/A"}
        </td>

        <td className="p-4">
          {user.team_points_for !== undefined
            ? parseFloat(user.team_points_for) +
              (user.team_points_for_dec !== undefined
                ? parseFloat(user.team_points_for_dec) / 100
                : 0)
            : ""}
        </td>
        <td className="p-4">
          {user.team_points_against !== undefined
            ? parseFloat(user.team_points_against) +
              (user.team_points_against_dec !== undefined
                ? parseFloat(user.team_points_against_dec) / 100
                : 0)
            : ""}
        </td>
        {user.streak !== undefined && (
          <td className="p-4 font-medium ">
            <span className="flex items-center">
              {user.streak.slice(0, -1)}
              <p
                className={`p-1 font-bold ${
                  user.streak.slice(-1) === "L" ? "text-[red]" : "text-[green]"
                }`}
              >
                {user.streak.slice(-1)}
              </p>
            </span>
          </td>
        )}
      </motion.tr>
    );
  };

  return (
    <div className="w-[90vw] xl:w-[60vw] ">
      <h2 className="text-md xl:text-xl flex justify-center text-center font-bold mb-2">{`${localStorage.getItem(
        "selectedLeagueName"
      )} Overall Standings`}</h2>
      <Table />
    </div>
  );
};

export default Page;

const numberToOrdinal = (n: number): string => {
  let ord = "th";

  if (n % 10 === 1 && n % 100 !== 11) {
    ord = "st";
  } else if (n % 10 === 2 && n % 100 !== 12) {
    ord = "nd";
  } else if (n % 10 === 3 && n % 100 !== 13) {
    ord = "rd";
  }

  return n + ord;
};
