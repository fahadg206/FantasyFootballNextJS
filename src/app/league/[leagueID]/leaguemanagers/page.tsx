"use client";

import React, { useState, useEffect } from "react";
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

export default function page() {
  const [scheduleDataFinal, setScheduleDataFinal] = useState<ScheduleData>({});
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<Matchup[]>([]);
  const [defaultManager, setDefaultManager] = useState("");
  const [selectedManagerName, setSelectedManagerName] = useState("");
  const [playersData, setPlayersData] = React.useState([]);

  const matchupMap = new Map<string, MatchupMapData[]>();
  const REACT_APP_LEAGUE_ID: string | null =
    localStorage.getItem("selectedLeagueID");

  const selectedManager = localStorage.getItem("selectedManager");

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
        setDefaultManager(usersData[0].user_id);

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

  useEffect(() => {
    // Update selectedManagerName when scheduleDataFinal or selectedManager changes
    for (const user in scheduleDataFinal) {
      if (scheduleDataFinal[user].user_id === selectedManager) {
        setSelectedManagerName(scheduleDataFinal[selectedManager].name);
        break; // Exit the loop once the manager is found
      }
    }
  }, [scheduleDataFinal, selectedManager]);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/players")
      .then((response) => {
        const playersData = response.data;

        setPlayersData(playersData);
        // Process and use the data as needed
        console.log(playersData["4017"]);
      })
      .catch((error) => {
        console.error("Error while fetching players data:", error);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  //console.log("team managers", scheduleDataFinal);

  return (
    <div className="bg-[green]">
      {selectedManagerName}
      {scheduleDataFinal[
        selectedManager ? selectedManager : defaultManager
      ].starters.map((starter) => (
        <div>{playersData[starter].fn + playersData[starter].ln}</div>
      ))}
    </div>
  );
}
