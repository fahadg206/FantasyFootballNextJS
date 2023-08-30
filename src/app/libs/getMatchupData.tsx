import React, { useEffect, useState } from "react";
import Imran from "../images/scary_imran.png";
import Image from "next/image";
import axios from "axios";
import { Spinner } from "@nextui-org/react";
import { db, storage } from "../firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore/lite";
import { QuerySnapshot, onSnapshot, doc } from "firebase/firestore";

interface WeeklyInformation {
  [league_id: string]: {
    info?: ScheduleData;
  };
}

interface ScheduleData {
  [userId: string]: {
    avatar?: string;
    name: string;
    roster_id?: string;
    user_id?: string;
    starters?: string[];
    starters_points?: string[];
    players?: string[];
    players_points?: string[];
    starters_full_data?: Starter[];
    team_points?: string;
    opponent?: string;
    matchup_id?: string;
    wins?: string;
    losses?: string;
    streak?: string;
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

interface Starter {
  fname?: string;
  lname?: string;
  avatar?: string;
  scored_points?: string;
  projected_points?: string;
  position?: string;
}

export default async function getMatchupData(league_id: any, week: number) {
  const matchupMap = new Map<string, MatchupMapData[]>();

  const weeklyInfo: WeeklyInformation = {};

  //const [scheduleDataFinal, setScheduleDataFinal] = useState<ScheduleData>({});
  const REACT_APP_LEAGUE_ID = league_id;

  const getSchedule = async () => {
    try {
      const response = await axios.get<any>(
        `https://api.sleeper.app/v1/league/${REACT_APP_LEAGUE_ID}/matchups/${
          week ? week : 1
        }`
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

  function areObjectsEqual(obj1: Starter, obj2: Starter) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1 as Array<keyof Starter>) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }

    return true;
  }
  const updatedScheduleData: ScheduleData = {};
  const fetchData = async (playersData: any) => {
    try {
      const usersData = await getUsers();
      const rostersData = await getRoster();
      const scheduleData = await getSchedule();

      // Filter users with no roster id (They don't have a team)
      const usersWithRoster = usersData.filter((user) =>
        rostersData.some((roster) => roster.owner_id === user.user_id)
      );

      // Update the scheduleData map with user data
      for (const user of usersWithRoster) {
        updatedScheduleData[user.user_id] = {
          avatar: `https://sleepercdn.com/avatars/thumbs/${user.avatar}`,
          name: user.display_name,
          user_id: user.user_id,
        };
      }

      // Update the scheduleData map with roster data
      for (const roster of rostersData) {
        //console.log(roster);
        if (updatedScheduleData[roster.owner_id]) {
          updatedScheduleData[roster.owner_id].roster_id = roster.roster_id;
          updatedScheduleData[roster.owner_id].wins = roster.settings.wins;
          updatedScheduleData[roster.owner_id].losses = roster.settings.losses;
          // updatedScheduleData[roster.owner_id].streak = roster.metadata.streak;
        }
      }

      for (const matchup of scheduleData) {
        // console.log("matchup", matchup);
        // console.log("roster", roster);
        for (const userId in updatedScheduleData) {
          if (updatedScheduleData[userId].roster_id === matchup.roster_id) {
            updatedScheduleData[userId].matchup_id = matchup.matchup_id;
            updatedScheduleData[userId].team_points = matchup.points;
            updatedScheduleData[userId].starters_points =
              matchup.starters_points;
            updatedScheduleData[userId].players = matchup.players;
            updatedScheduleData[userId].players_points = matchup.players_points;
            updatedScheduleData[userId].starters = matchup.starters;
          }
        }
      }

      for (const userId in updatedScheduleData) {
        if (updatedScheduleData.hasOwnProperty(userId)) {
          if (!updatedScheduleData[userId].starters_full_data) {
            updatedScheduleData[userId].starters_full_data = [{}];
          }
          if (updatedScheduleData[userId]?.starters) {
            for (const starter of updatedScheduleData[userId].starters) {
              if (starter != "0") {
                const starter_data = {
                  fname: playersData[starter].fn,
                  lname: playersData[starter].ln,
                  avatar:
                    playersData[starter.toString()].pos == "DEF"
                      ? `https://sleepercdn.com/images/team_logos/nfl/${starter.toLowerCase()}.png`
                      : `https://sleepercdn.com/content/nfl/players/thumb/${starter}.jpg`,
                  scored_points:
                    updatedScheduleData[userId].players_points[starter],
                  position: playersData[starter].pos,
                };
                if (
                  updatedScheduleData[userId]?.starters_full_data &&
                  !updatedScheduleData[userId]?.starters_full_data?.some(
                    (item) => {
                      return areObjectsEqual(item, starter_data); // Compare each item to starter_data
                    }
                  )
                ) {
                  updatedScheduleData[userId].starters_full_data.push(
                    starter_data
                  ); // Push starter_data to the array
                } else {
                  updatedScheduleData[userId].starters_full_data = [
                    {
                      fname: playersData[starter].fn,
                      lname: playersData[starter].ln,
                      avatar:
                        playersData[starter.toString()].pos === "DEF"
                          ? `https://sleepercdn.com/images/team_logos/nfl/${starter.toLowerCase()}.png`
                          : `https://sleepercdn.com/content/nfl/players/thumb/${starter}.jpg`,
                      scored_points:
                        updatedScheduleData[userId].players_points[starter],
                      position: playersData[starter].pos,
                    },
                  ];
                }
              }
            }
          }
        }
      }

      for (const userId in updatedScheduleData) {
        //console.log(updatedScheduleData[userId].matchup_id);
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

      // Set the updated scheduleData map to state
      //setScheduleDataFinal(updatedScheduleData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    //console.log(updatedScheduleData);

    return { matchupMap, updatedScheduleData };
  };

  async function fetchPlayersData() {
    try {
      const response = await fetch(
        "https://fantasy-football-next-js-app.vercel.app/api/fetchPlayers",
        {
          method: "POST",
          body: "REACT_APP_LEAGUE_ID",
        }
      );
      const playersData = await response.json();
      // Process and use the data as needed

      return playersData;
    } catch (error) {
      console.error("Error while fetching players data:", error);
      return [];
    }
  }

  const playersData = await fetchPlayersData();

  const response = await fetchData(playersData);

  return response;
}
