"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import LeagueManagersSelection from "../../../components/LeagueManagersSelection";
import Image from "next/image";
import { useSelectedManager } from "../../../context/SelectedManagerContext";
import { useRouter } from "next/navigation";

interface ScheduleData {
  [userId: string]: {
    avatar: string;
    name: string;
    roster_id?: string;
    user_id?: string;
    starters?: string[];
    team_points?: string;
    opponent?: string;
    matchup_id?: string;
  };
}

interface ManagerMatchup {
  week?: string;
  matchup: MatchupMapData[];
}

interface Matchup {
  custom_points: null;
  matchup_id: string;
  players: string[];
  players_points: Record<string, number>;
  points: string;
  roster_id: string;
  starters: string[];
  starters_points: number[];
}

interface MatchupMapData {
  avatar: string;
  name: string;
  roster_id?: string;
  user_id?: string;
  starters?: string[];
  team_points?: string;
  opponent?: string;
  matchup_id?: string;
}

export default function Page() {
  const [scheduleDataFinal, setScheduleDataFinal] = useState<ScheduleData>({});
  const [loading, setLoading] = useState(true);
  const [defaultManager, setDefaultManager] = useState("");
  const [selectedManagerMatchups, setSelectedManagerMatchups] = useState<
    Map<string, ManagerMatchup[]>
  >(new Map());
  const { selectedManagerr } = useSelectedManager();

  const [selectedManagerData, setSelectedManagerData] = useState();
  const [playersData, setPlayersData] = React.useState([]);

  const REACT_APP_LEAGUE_ID: string | null =
    localStorage.getItem("selectedLeagueID");

  const selectedManager = localStorage.getItem("selectedManager");
  const router = useRouter();

  const getSchedule = async (week: number) => {
    try {
      const response = await axios.get<any>(
        `https://api.sleeper.app/v1/league/${REACT_APP_LEAGUE_ID}/matchups/${week}`
      );
      return response.data;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get matchups");
    }
  };

  const getUsers = async () => {
    try {
      const response = await axios.get<any>(
        `https://api.sleeper.app/v1/league/${REACT_APP_LEAGUE_ID}/users`
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
        `https://api.sleeper.app/v1/league/${REACT_APP_LEAGUE_ID}/rosters`
      );

      return response.data;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get rosters");
    }
  };

  useEffect(() => {
    const fetchDataForWeek = async (week: number) => {
      try {
        const usersData = await getUsers();
        const rostersData = await getRoster();
        const scheduleData = await getSchedule(week);

        const updatedScheduleData: ScheduleData = {};
        const matchupMap = new Map<string, MatchupMapData[]>();

        for (const user of usersData) {
          updatedScheduleData[user.user_id] = {
            avatar: `https://sleepercdn.com/avatars/thumbs/${user.avatar}`,
            name: user.display_name,
            user_id: user.user_id,
          };
        }
        setDefaultManager(usersData[0].user_id);

        for (const roster of rostersData) {
          if (updatedScheduleData[roster.owner_id]) {
            updatedScheduleData[roster.owner_id].roster_id = roster.roster_id;
            updatedScheduleData[roster.owner_id].starters = roster.starters;
          }

          for (const matchup of scheduleData) {
            if (roster.roster_id === matchup.roster_id) {
              updatedScheduleData[roster.owner_id].matchup_id =
                matchup.matchup_id;
              updatedScheduleData[roster.owner_id].team_points = matchup.points;
            }
          }
        }

        setScheduleDataFinal(updatedScheduleData);

        for (const userId in updatedScheduleData) {
          const userData = updatedScheduleData[userId];
          if (userData.matchup_id) {
            if (!matchupMap.has(userData.matchup_id)) {
              matchupMap.set(userData.matchup_id, [userData]);
            } else {
              const matchupData = matchupMap.get(userData.matchup_id);
              if (matchupData && matchupData.length > 0) {
                const firstPlayer = matchupData[0];
                firstPlayer.opponent = userData.name;
                matchupMap.set(userData.matchup_id, [firstPlayer]);
                userData.opponent = firstPlayer.name;
                matchupMap.get(userData.matchup_id)?.push(userData);
              }
            }
          }
        }

        //console.log("ayo", matchupMap);

        for (const userId in updatedScheduleData) {
          const user = updatedScheduleData[userId];
          const filteredMatchupData = matchupMap.get(user.matchup_id);
          if (filteredMatchupData) {
            if (user.user_id) {
              if (selectedManagerMatchups.has(user.user_id)) {
                const existingMatchups = selectedManagerMatchups.get(
                  user.user_id
                );
                existingMatchups?.push({
                  week: week.toString(),
                  matchup: filteredMatchupData,
                });
                selectedManagerMatchups.set(user.user_id, existingMatchups);
              } else {
                selectedManagerMatchups.set(user.user_id, [
                  { week: week.toString(), matchup: filteredMatchupData },
                ]);
              }
            }
          }
        }

        for (const user in updatedScheduleData) {
          if (updatedScheduleData[user].user_id === selectedManager) {
            //setSelectedManagerData(updatedScheduleData[selectedManager]);
            //console.log("what was set ", updatedScheduleData[selectedManager]);
            break; // Exit the loop once the manager is found
          }
        }

        return matchupMap;
      } catch (error) {
        console.error("Error fetching data for week", week, ":", error);
        throw error;
      }
    };

    const fetchAllData = async () => {
      selectedManagerMatchups.clear();
      try {
        for (let i = 1; i < 17; i++) {
          const weekMatchupMap = await fetchDataForWeek(i);
          // Handle additional processing or state updates if needed
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching all data:", error);
        setLoading(false);
      }
    };

    fetchAllData();
  }, [REACT_APP_LEAGUE_ID, selectedManagerr]);
  console.log("kabo", selectedManagerr);

  // useEffect(() => {
  //   // Update selectedManagerName when scheduleDataFinal or selectedManager changes

  //   for (const user in scheduleDataFinal) {
  //     if (scheduleDataFinal[user].user_id === selectedManager) {
  //       setSelectedManagerData(scheduleDataFinal[selectedManager]);
  //       //console.log("what was set ", scheduleDataFinal[selectedManager]);
  //       break; // Exit the loop once the manager is found
  //     }
  //   }
  // }, [scheduleDataFinal, selectedManager]);

  //console.log("weekly match", selectedManagerMatchups);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/players")
      .then((response) => {
        const playersData = response.data;

        setPlayersData(playersData);
        // Process and use the data as needed
      })
      .catch((error) => {
        console.error("Error while fetching players data:", error);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log(selectedManagerMatchups.get(defaultManager));

  const selectedManagerWeeklyResults = !selectedManager
    ? selectedManagerMatchups.get(defaultManager)
    : selectedManagerMatchups.get(selectedManager);

  const TranslateWrapper = ({ children, reverse }) => {
    return (
      <motion.div
        initial={{ translateX: reverse ? "-100%" : "0%" }}
        animate={{ translateX: reverse ? "0%" : "-100%" }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="flex gap-4 px-2"
      >
        {children}
      </motion.div>
    );
  };

  const LogoItemsTop = () => (
    <div className="flex mr-3 justify-center">
      {selectedManagerWeeklyResults?.map((week) => {
        let selectedPlayer;
        let opponent;
        if (selectedManager) {
          if (selectedManager === week.matchup[0].user_id) {
            selectedPlayer = week.matchup[0];
            opponent = week.matchup[1];
          } else {
            selectedPlayer = week.matchup[1];
            opponent = week.matchup[0];
          }
        } else {
          if (defaultManager === week.matchup[0].user_id) {
            selectedPlayer = week.matchup[0];
            opponent = week.matchup[1];
          } else {
            selectedPlayer = week.matchup[1];
            opponent = week.matchup[0];
          }
        }

        return (
          <div
            className="flex flex-col items-center justify-center mr-2 "
            key={week.week}
          >
            <p className="text-[11px] font-bold mb-1">{` Week ${week.week}`}</p>
            <div
              className={
                selectedPlayer.team_points === opponent.team_points
                  ? `flex flex-col justify-center items-center w-[100px] h-[80px] border-[1px] border-[#727070] rounded-2xl`
                  : selectedPlayer.team_points > opponent.team_points
                  ? `flex flex-col justify-center items-center w-[100px] h-[80px] border-[1px] border-[green] rounded-2xl`
                  : `flex flex-col justify-center items-center w-[100px] h-[80px] border-[1px] border-[#af1222] rounded-2xl`
              }
            >
              <Image
                src={opponent.avatar}
                alt="avatar"
                width={30}
                height={30}
                className="rounded-full mb-2"
              />
              <p className="text-[10px] font-bold">{opponent.name}</p>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-[95vw] xl:w-[60vw]">
      <LeagueManagersSelection />
      <h2 className="text-center font-bold mb-2">Weekly Results</h2>
      <div className="flex overflow-hidden py-1">
        <TranslateWrapper>
          <LogoItemsTop />
        </TranslateWrapper>
        <TranslateWrapper>
          <LogoItemsTop />
        </TranslateWrapper>
      </div>
    </div>
  );
}
