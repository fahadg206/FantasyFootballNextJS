"use client";

import React, { useEffect, useState } from "react";
import getMatchupMap from "../../../libs/getMatchupData";
import Image from "next/image";
import uuid from "uuid";
import SchedulePoll from "../../../components/SchedulePoll";
import axios, { AxiosResponse } from "axios";

interface NflState {
  season: string;
  display_week: number;
  season_type: string;
  // Add other properties as needed
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

export default function Schedule(props: any) {
  const [loading, setLoading] = useState(true);
  const [matchupMap, setMatchupMap] = useState<Map<
    string,
    MatchupMapData[]
  > | null>(null);
  const [counter, setCounter] = useState(1);
  const [scheduleDataFinal, setScheduleDataFinal] = useState<ScheduleData>({});
  const [shouldDisplay, setShouldDisplay] = useState(false);
  const [nflState, setNflState] = useState<NflState>();

  const REACT_APP_LEAGUE_ID = localStorage.getItem("selectedLeagueID");

  const getNflState = async (): Promise<NflState> => {
    try {
      const res: AxiosResponse<NflState> = await axios.get<NflState>(
        `https://api.sleeper.app/v1/state/nfl`
      );

      const data: NflState = res.data;

      if (res.status === 200) {
        //console.log("Here's the nfl Data:", data);
      } else {
        // Handle other status codes or error cases
      }
      return data;
    } catch (err) {
      console.error(err);
      // Handle the error case here, return an appropriate value, or throw an error
      throw new Error("Failed to get NFL state");
    }
  };

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const dayOfWeek = now.getUTCDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6
      const hours = now.getUTCHours();
      const minutes = now.getUTCMinutes();

      if (
        (dayOfWeek === 1 && hours === 22 && minutes >= 30) || // Monday after 10:30 PM
        (dayOfWeek === 2 && hours < 0) || // Tuesday
        (dayOfWeek === 3 && hours === 0 && minutes === 0) // Wednesday before 12:00 AM
      ) {
        setShouldDisplay(true);
      } else {
        setShouldDisplay(false);
      }
    };

    checkTime(); // Initial check
    const intervalId = setInterval(checkTime, 60000); // Check every minute

    return () => clearInterval(intervalId); // Cleanup interval when component unmounts
  }, []);

  let matchupText;

  useEffect(() => {
    async function fetchMatchupData() {
      try {
        const matchupMapData = await getMatchupMap(
          REACT_APP_LEAGUE_ID,
          counter
        );
        setMatchupMap(matchupMapData.matchupMap);
        setScheduleDataFinal(matchupMapData.updatedScheduleData);
        const nflState = await getNflState();
        setNflState(nflState);
      } catch (error) {
        console.error("Error fetching matchup data:", error);
      }
    }

    fetchMatchupData();
  }, [REACT_APP_LEAGUE_ID, counter]);

  matchupText = Array.from(matchupMap || []).map(([matchupID, matchupData]) => {
    const team1 = matchupData[0];
    const team2 = matchupData[1];

    return (
      <div
        key={team1.name}
        className=" flex flex-col items-center gap-5 mt-2 duration-500 w-[95vw] xl:w-[60vw]"
      >
        <div
          className={
            counter === nflState?.display_week
              ? `border border-black  dark:border-[#1a1a1a] rounded w-[95vw] xl:w-[60vw] flex items-center justify-center md:h-[20vw] xl:h-[10vw]`
              : `border border-black  dark:border-[#1a1a1a] rounded w-[95vw] xl:w-[60vw] flex items-center justify-center h-[20vh] md:h-[20vw] xl:h-[10vw]`
          }
        >
          <div className="flex flex-col w-[45vw] xl:w-[25vw] items-center mr-1 xl:ml-5">
            <div className="team1 flex justify-between items-center mb-3 w-[45vw] xl:w-[25vw]">
              <div className="flex items-center">
                <Image
                  className="rounded-full mr-2 md:w-[40px] md:h-[40px] "
                  src={team1.avatar}
                  alt="avatar"
                  width={30}
                  height={30}
                />
                <div className="text-[12px] md:text-[20px] font-bold flex gap-2 items-center">
                  {team1.name.length >= 9
                    ? (team1.name.match(/[A-Z]/g) || []).length > 3
                      ? team1.name.slice(0, 10).toLowerCase()
                      : team1.name.slice(0, 10)
                    : team1.name}
                  <p className="hidden sm:text-[10px] sm:block italic font-bold text-[#949494]">{`${
                    scheduleDataFinal[team1.user_id].wins
                  } - ${scheduleDataFinal[team1.user_id].losses}`}</p>
                </div>
              </div>
              <p
                className={
                  parseFloat(team1.team_points) > 0
                    ? `text-[14px] md:text-[18px] mr-5`
                    : `text-[12px] md:text-[18px] italic font-bold text-[#949494] mr-2`
                }
              >
                {parseFloat(team1.team_points) > 0 ||
                parseFloat(team2.team_points) > 0
                  ? team1.team_points
                  : `${scheduleDataFinal[team1.user_id].wins} - ${
                      scheduleDataFinal[team1.user_id].losses
                    }`}
              </p>
            </div>
            <div className="team2 flex justify-between items-center  w-[45vw] xl:w-[25vw]">
              <div className="flex items-center">
                <Image
                  className="rounded-full mr-2 md:w-[40px] md:h-[40px]"
                  src={team2.avatar}
                  alt="avatar"
                  width={30}
                  height={30}
                />
                <div className="text-[12px] md:text-[20px] font-bold flex gap-2 items-center">
                  {team2.name.length >= 9
                    ? (team2.name.match(/[A-Z]/g) || []).length > 3
                      ? team2.name.slice(0, 10).toLowerCase()
                      : team2.name.slice(0, 10)
                    : team2.name}
                  <p className="hidden sm:text-[10px] sm:block italic font-bold text-[#949494]">{`${
                    scheduleDataFinal[team2.user_id].wins
                  } - ${scheduleDataFinal[team2.user_id].losses}`}</p>
                </div>
              </div>
              <p
                className={
                  parseFloat(team2.team_points) > 0
                    ? `text-[14px] md:text-[18px] mr-5`
                    : `text-[12px] md:text-[18px] italic font-bold text-[#949494] mr-2`
                }
              >
                {parseFloat(team1.team_points) > 0 ||
                parseFloat(team2.team_points) > 0
                  ? team2.team_points
                  : `${scheduleDataFinal[team2.user_id].wins} - ${
                      scheduleDataFinal[team2.user_id].losses
                    }`}
              </p>
            </div>
            {shouldDisplay && (
              <p className="text-center text-[14px] font-bold">{"FINAL"}</p>
            )}
          </div>
          <p
            className={
              counter === nflState?.display_week
                ? `hidden md:h-full border-r-[1px] border-dashed border-[#1a1a1a] ml-5 md:block`
                : `hidden`
            }
          ></p>
          {/* <p className="text-center text-[14px] font-bold">{"FINAL"}</p> */}
          <div
            className={
              counter === nflState?.display_week
                ? `w-[45vw] xl:w-[35vw] flex justify-center overflow-y-scroll`
                : `hidden`
            }
          >
            <SchedulePoll
              team1Name={team1.name}
              team2Name={team2.name}
              weekCounter={counter}
              nflWeek={nflState?.display_week}
            />
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className=" flex flex-col items-center">
      <div className="flex">
        <p onClick={() => setCounter(counter + 1)}>+</p>
        <p onClick={() => setCounter(counter - 1)}>-</p>
        {`Week: ${counter}`}
      </div>
      {matchupText}
    </div>
  );
}
