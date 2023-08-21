"use client";

import React, { useEffect, useState } from "react";
import getMatchupMap from "../../../libs/getMatchupData";
import Image from "next/image";
import uuid from "uuid";
import SchedulePoll from "../../../components/SchedulePoll";
import axios, { AxiosResponse } from "axios";
import { HiOutlineArrowSmLeft, HiOutlineArrowSmRight } from "react-icons/hi";
import { BsDot } from "react-icons/bs";
import {
  Link,
  Button,
  Element,
  Events,
  animateScroll as scroll,
  scrollSpy,
  scroller,
} from "react-scroll";

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

    const starters1 =
      scheduleDataFinal[team1.user_id]?.starters_full_data || [];
    const starters2 =
      scheduleDataFinal[team2.user_id]?.starters_full_data || [];

    // Remove empty objects from starters arrays
    const nonEmptyStarters1 = starters1.filter(
      (starter) => Object.keys(starter).length > 0
    );
    const nonEmptyStarters2 = starters2.filter(
      (starter) => Object.keys(starter).length > 0
    );

    // Sort the non-empty starters by scored_points in descending order
    const sortedStarters1 = [...nonEmptyStarters1].sort(
      (a, b) => b.scored_points - a.scored_points
    );

    const sortedStarters2 = [...nonEmptyStarters2].sort(
      (a, b) => b.scored_points - a.scored_points
    );

    // Extract the top two highest scorers
    const topTwoScorers1 = sortedStarters1.slice(0, 2);
    const topTwoScorers2 = sortedStarters2.slice(0, 2);

    console.log("Top two scores for team 1:", topTwoScorers1);
    console.log("Top two scores for team 2:", topTwoScorers2);

    return (
      <div
        key={matchupID}
        className=" flex flex-col items-center gap-5 mt-2 duration-500 w-[95vw] xl:w-[60vw]"
      >
        <Element name={matchupID} className="element ">
          <div
            className={
              counter === nflState?.display_week
                ? `border border-black  dark:border-[#1a1a1a] rounded w-[95vw] xl:w-[60vw] flex items-center justify-center md:h-[20vw] xl:h-[15vw]`
                : `border border-black  dark:border-[#1a1a1a] rounded w-[95vw] xl:w-[60vw] flex items-center justify-center h-[25vh] md:h-[20vw] xl:h-[15vw]`
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
                  className={`text-[12px] md:text-[16px] italic font-bold text-[#949494] mr-2`}
                >
                  {`${scheduleDataFinal[team1.user_id].wins} - ${
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
                  className={`text-[12px] md:text-[16px] italic font-bold text-[#949494] mr-2`}
                >
                  {`${scheduleDataFinal[team2.user_id].wins} - ${
                    scheduleDataFinal[team2.user_id].losses
                  }`}
                </p>
              </div>
              <p className="text-[12px] text-[#af1222] flex items-center">
                <BsDot /> LIVE
              </p>
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
            {/* for previous matches as well not only for current week */}
            {parseFloat(team1.team_points) > 0 &&
              parseFloat(team2.team_points) > 0 &&
              (shouldDisplay ? (
                <p className="text-center text-[14px] font-bold">{"FINAL"}</p>
              ) : (
                <p className="hidden">{"FINAL"}</p>
              ))}
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
            {/* Display top scorers for team 1 */}
            {!shouldDisplay && (
              <div className="top-scorers mt-4">
                <p className="font-bold mb-2">
                  Points Leaders for {team1.name}:
                </p>
                <ul className="space-y-2">
                  {topTwoScorers1.map((player, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <img
                        src={player.avatar}
                        alt="Player Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex flex-col">
                        <p>{`${player.fname} ${player.lname}`}</p>
                        <p className="text-sm">
                          Points: {player.scored_points}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Display top scorers for team 2 */}
            {!shouldDisplay && (
              <div className="top-scorers mt-4">
                <p className="font-bold mb-2">
                  Points Leaders for {team2.name}:
                </p>
                <ul className="space-y-2">
                  {topTwoScorers2.map((player, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <img
                        src={player.avatar}
                        alt="Player Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex flex-col">
                        <p>{`${player.fname} ${player.lname}`}</p>
                        <p className="text-sm">
                          Points: {player.scored_points}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Element>
      </div>
    );
  });

  return (
    <div className=" flex flex-col items-center mt-4">
      <div className="flex flex-col items-center">
        <p className="font-bold italic">{`Week: ${counter}`}</p>

        <div className="flex">
          <p className="cursor-pointer" onClick={() => setCounter(counter - 1)}>
            <HiOutlineArrowSmLeft size={38} />
          </p>{" "}
          <p className="cursor-pointer" onClick={() => setCounter(counter + 1)}>
            <HiOutlineArrowSmRight size={38} />
          </p>
        </div>
      </div>
      {matchupText}
    </div>
  );
}
