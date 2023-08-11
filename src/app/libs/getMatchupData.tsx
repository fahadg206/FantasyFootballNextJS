import React, { useEffect, useState } from "react";
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

export default async function getMatchupData() {
  const matchupMap = new Map<string, MatchupMapData[]>();

  //const [scheduleDataFinal, setScheduleDataFinal] = useState<ScheduleData>({});
  const REACT_APP_LEAGUE_ID = "864448469199347712";

  const getSchedule = async () => {
    try {
      const response = await axios.get<any>(
        `https://api.sleeper.app/v1/league/${REACT_APP_LEAGUE_ID}/matchups/1`
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
  const updatedScheduleData: ScheduleData = {};
  const fetchData = async () => {
    try {
      const usersData = await getUsers();
      const rostersData = await getRoster();
      const scheduleData = await getSchedule();

      // Create a new map to store the updated schedule data

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
      //setScheduleDataFinal(updatedScheduleData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  fetchData();

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
  return matchupMap;
}
