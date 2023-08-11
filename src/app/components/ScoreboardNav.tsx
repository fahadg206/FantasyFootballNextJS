"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

import uuid from "uuid";
import Image from "next/image";
import Scoreboard from "./Scoreboard";
import Schedule from "../league/[leagueID]/schedule/page";

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

export default function ScoreboardNav() {
  //object that contains userId, avatar, team name, & roster_id

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
  //console.log(matchupMap);

  const matchupText = Array.from(matchupMap).map(([matchupID, matchupData]) => {
    const team1 = matchupData[0];
    const team2 = matchupData[1];

    return (
      <div className=" flex flex-col items-center gap-5 mt-2 duration-500">
        <div className="border border-black p-[30px] dark:bg-[#202123] rounded w-[85vw] flex flex-col">
          <div className="team1 flex items-center justify-between">
            <div className="flex items-center">
              <Image
                className="rounded-full mr-2"
                src={team1.avatar}
                alt="avatar"
                width={30}
                height={30}
              />
              <p className="text-[14px] font-bold">{team1.name}</p>
            </div>
            <p className="text-[14px]">
              {!team1.team_points ? "0" : team1.team_points}
            </p>
          </div>
          <div className="team2 flex items-center justify-between">
            <div className="flex items-center">
              <Image
                className="rounded-full mr-2"
                src={team2.avatar}
                alt="avatar"
                width={30}
                height={30}
              />
              <p className="text-[14px] font-bold">{team2.name}</p>
            </div>
            <p className="text-[14px]">
              {!team2.team_points ? "0" : team2.team_points}
            </p>
          </div>
          <p className="text-center text-[14px] font-bold">{"FINAL"}</p>
        </div>
      </div>
    );
  });

  return (
    <div>
      <div>
        {matchupText.map((matchup) => (
          <div key={uuid}>{matchup}</div>
        ))}
        {matchupMap && (
          <div>
            <Schedule matchup={matchupText} matchupMap={matchupMap} />
          </div>
        )}
      </div>
    </div>
  );
}
