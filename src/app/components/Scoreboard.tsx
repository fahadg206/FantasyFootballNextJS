"use client";
import React, { useEffect, useState } from "react";
import Imran from "../images/scary_imran.png";
import Image from "next/image";
import axios from "axios";

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

export default function Scoreboard() {
  const [schedule, setSchedule] = useState<Matchup[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleDataFinal, setScheduleDataFinal] = useState<ScheduleData>({});

  const matchupMap = new Map<string, MatchupMapData[]>();
  const REACT_APP_LEAGUE_ID: string | null =
    localStorage.getItem("selectedLeagueID");

  const getSchedule = async () => {
    try {
      const response = await axios.get<any>(
        `https://api.sleeper.app/v1/league/${REACT_APP_LEAGUE_ID}/matchups/1`
      );
      setSchedule(response.data);
      setLoading(false);
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
    const fetchData = async () => {
      try {
        const usersData = await getUsers();
        const rostersData = await getRoster();
        const scheduleData = await getSchedule();

        // Create a new map to store the updated schedule data
        const updatedScheduleData: ScheduleData = {};

        // Update the scheduleData map with user data
        for (const user of usersData) {
          updatedScheduleData[user.user_id] = {
            avatar: `https://sleepercdn.com/avatars/thumbs/${user.avatar}`,
            name: user.display_name,
            user_id: user.user_id,
          };
        }

        // Update the scheduleData map with roster data
        for (const roster of rostersData) {
          if (updatedScheduleData[roster.owner_id]) {
            updatedScheduleData[roster.owner_id].roster_id = roster.roster_id;

            updatedScheduleData[roster.owner_id].starters = roster.starters;
          }

          for (const matchup of scheduleData) {
            // console.log("matchup", matchup);
            // console.log("roster", roster);
            if (roster.roster_id === matchup.roster_id) {
              updatedScheduleData[roster.owner_id].matchup_id =
                matchup.matchup_id;
              updatedScheduleData[roster.owner_id].team_points = matchup.points;
            }
          }
        }

        // Set the updated scheduleData map to state
        setScheduleDataFinal(updatedScheduleData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [REACT_APP_LEAGUE_ID]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // setting each matchup into Map with key being matchup_id and value being two teams with corresponding matchup_id
  for (const userId in scheduleDataFinal) {
    const userData = scheduleDataFinal[userId];
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
  console.log(matchupMap);
  //MATCHUP TEXT
  const matchupText = Array.from(matchupMap).map(([matchupID, matchupData]) => {
    const team1 = matchupData[0];
    const team2 = matchupData[1];

    return (
      <div
        key={matchupID}
        className="hidden xl:flex flex-wrap  justify-center mb-2 text-[12px] font-bold xl:h-[13vh] xl:w-[10vw] xl:bg-[red] "
      >
        <div className="border-r border-[#1a1a1a] p-2 rounded-md flex flex-col items-start justify-center h-[13vh] bg-[blue] w-[10vw]">
          <div className="team1 flex justify-between items-center  bg-[green] w-[9vw]">
            <span className="flex items-center">
              <Image
                src={team1.avatar}
                alt="avatar"
                height={28}
                width={28}
                className="rounded-full mr-1"
              />
              <p>
                {team1.name.length > 12
                  ? team1.name.slice(0, 12).toLowerCase()
                  : team1.name.toLowerCase()}
              </p>
            </span>
            <p>{team1.team_points || "0"}</p>
          </div>
          <div className="team2 flex justify-between items-center  bg-[green] w-[9vw]">
            <span className="flex items-center">
              <Image
                src={team2.avatar}
                alt="avatar"
                height={28}
                width={28}
                className="rounded-full mr-1"
              />
              <p>
                {team2.name.length > 12
                  ? team2.name.slice(0, 15).toLowerCase()
                  : team2.name.toLowerCase()}
              </p>
            </span>
            <p>{team2.team_points || "0"}</p>
          </div>
          <p className="w-[9vw] text-center">O/U: 350.24</p>
        </div>
      </div>
    );
  });

  if (localStorage.getItem("selectedLeagueID")) {
    return matchupText;
  }
  return null;
}
