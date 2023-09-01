"use client";

import React, { useState, useEffect, lazy } from "react";

import axios from "axios";

import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import Scoreboard from "./Scoreboard";
import Schedule from "../league/[leagueID]/schedule/page";
import getMatchupMap from "../libs/getMatchupData";
import useTimeChecks from "../libs/getTimes";
import {
  Link,
  Button,
  Element,
  Events,
  animateScroll as scroll,
  scrollSpy,
  scroller,
} from "react-scroll";
import { db, storage } from "../firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { BsDot } from "react-icons/bs";

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
  };
}

interface Starter {
  fname?: string;
  lname?: string;
  avatar?: string;
  scored_points?: string;
  projected_points?: string;
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

interface PlayerData {
  wi?: {
    [week: string]: {
      p?: string;
    };
  };
  // Add other properties if needed
}

export default function ScoreboardNav({ setShowScore }) {
  //object that contains userId, avatar, team name, & roster_id

  const [schedule, setSchedule] = useState<Matchup[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleDataFinal, setScheduleDataFinal] = useState<ScheduleData>({});
  const [shouldDisplay, setShouldDisplay] = useState(false);
  const [selectedMatchup, setSelectedMatchup] = useState(false);
  const [week, setWeek] = useState<number>();
  const [mnfEnd, setMnfEnd] = useState(false);
  const [morningSlateEnd, setMorningSlateEnd] = useState(false);
  const [afternoonSlateEnd, setAfternoonSlateEnd] = useState(false);
  const [snfEnd, setSnfEnd] = useState(false);

  const [matchupMap, setMatchupMap] = useState<Map<string, MatchupMapData[]>>(
    new Map()
  );

  const [playersData, setPlayersData] =
    React.useState<Record<string, PlayerData>>();

  const router = useRouter();
  const REACT_APP_LEAGUE_ID: string | null =
    localStorage.getItem("selectedLeagueID");

  const { isSundayAfternoon, isSundayEvening, isSundayNight, isMondayNight } =
    useTimeChecks();

  useEffect(() => {
    setMnfEnd(isMondayNight);
    setSnfEnd(isSundayNight);
    setAfternoonSlateEnd(isSundayEvening);
    setMorningSlateEnd(isSundayAfternoon);
  }, [isMondayNight, isSundayNight, isSundayEvening, isSundayAfternoon]);

  function updateDbStorage(weeklyData: ScheduleData) {
    if (REACT_APP_LEAGUE_ID) {
      const storageRef = ref(storage, `files/${REACT_APP_LEAGUE_ID}.txt`);

      //Uncomment to upload textfile to firebase storage

      const articleMatchupData: ScheduleData = JSON.parse(
        JSON.stringify(weeklyData)
      );

      for (const matchupId in articleMatchupData) {
        const matchup = articleMatchupData[matchupId];

        // Delete properties from the matchup object
        delete matchup.starters;
        delete matchup.starters_points;
        delete matchup.players;
        delete matchup.players_points;
        delete matchup.roster_id;
        delete matchup.user_id;
        delete matchup.avatar;

        // Check if starters_full_data exists before iterating over it
        if (matchup.starters_full_data) {
          for (const starter of matchup.starters_full_data) {
            delete starter.avatar;
          }
        }
      }

      console.log("data ", articleMatchupData);

      const textContent = JSON.stringify(articleMatchupData);

      const readingRef = ref(storage, `files/${REACT_APP_LEAGUE_ID}.txt`);
      // Function to add content only if it's different
      addContentIfDifferent(textContent, storageRef);
    }
  }
  function addContentIfDifferent(newContent: any, readingRef: any) {
    // Get the current contents of the file
    //uploadNewContent(newContent, readingRef);
    getDownloadURL(readingRef)
      .then(function (url) {
        // Fetch the current contents using the URL
        fetch(url)
          .then((response) => response.text())
          .then((existingContent) => {
            if (
              newContent.length > 3 &&
              (!existingContent || existingContent !== newContent)
            ) {
              console.log("newcontent", newContent);
              // If existingContent is empty or different from new content, upload the new content
              uploadNewContent(newContent, readingRef);
            } else {
              //console.log("New content is the same as existing content.");
            }
          })
          .catch(function (error) {
            console.error("Error fetching existing content:", error);
          });
      })
      .catch(function (error) {
        if (error.code === "storage/object-not-found") {
          // Handle the case when the object (file) is not found in storage
          uploadNewContent(newContent, readingRef);
        } else {
          console.error("Error getting download URL:", error);
        }
      });
  }

  // Function to upload new content
  function uploadNewContent(content: any, storageRef: any) {
    uploadString(storageRef, content, "raw")
      .then(() => {
        console.log("Text file uploaded to Firebase Cloud Storage.");
      })
      .catch((error) => {
        console.error("Error uploading text file:", error);
      });
  }

  useEffect(() => {
    async function fetchMatchupData() {
      try {
        const response = await axios.get(
          `https://api.sleeper.app/v1/state/nfl`
        );

        const nflState = response.data;
        let week = 1;
        if (nflState.season_type === "regular") {
          week = nflState.display_week;
        } else if (nflState.season_type === "post") {
          week = 18;
        }
        setWeek(nflState.display_week);
        const matchupMapData = await getMatchupMap(REACT_APP_LEAGUE_ID, week);
        setMatchupMap(matchupMapData.matchupMap);
        setScheduleDataFinal(
          matchupMapData.updatedScheduleData as ScheduleData
        );
        updateDbStorage(matchupMapData.updatedScheduleData);
      } catch (error) {
        console.error("Error fetching matchup data:", error);
      }
    }

    fetchMatchupData();
  }, [REACT_APP_LEAGUE_ID]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://fantasypulseff.vercel.app/api/fetchPlayers",
          {
            method: "POST",
            body: "REACT_APP_LEAGUE_ID",
          }
        );
        const playersData = await response.json();
        console.log("Got it");
        setPlayersData(playersData);

        // Process and use the data as needed
        console.log("WHO, ", playersData["4017"]);
        // Additional code that uses playersData goes here
      } catch (error) {
        console.error("Error while fetching players data:", error);
      }
    };

    fetchData();
  }, []);

  const weekString = week?.toString();

  const matchupText = Array.from(matchupMap).map(([matchupID, matchupData]) => {
    const team1 = matchupData[0];
    const team2 = matchupData[1];

    let team1Proj = 0.0;
    let team2Proj = 0.0;

    // if (team1?.starters) {
    //   for (const currPlayer of team1.starters) {
    //     if (playersData[currPlayer]) {
    //       const playerData = playersData && playersData[currPlayer];
    //       if (
    //         playerData &&
    //         playerData.wi &&
    //         weekString !== undefined && // Check if weekString is defined
    //         typeof weekString === "string" && // Check if weekString is a string
    //         playerData.wi[weekString] &&
    //         playerData.wi[weekString]?.p !== undefined
    //       ) {
    //         if (playerData.wi[weekString].p)
    //           team1Proj += parseFloat(playerData.wi[weekString].p || "0");
    //       }
    //     }
    //   }
    // }

    // if (team2?.starters) {
    //   for (const currPlayer of team2.starters) {
    //     if (playersData[currPlayer]) {
    //       const playerData = playersData && playersData[currPlayer];
    //       if (
    //         playerData &&
    //         playerData.wi &&
    //         weekString !== undefined && // Check if weekString is defined
    //         typeof weekString === "string" && // Check if weekString is a string
    //         playerData.wi[weekString] &&
    //         playerData.wi[weekString]?.p !== undefined
    //       ) {
    //         team2Proj += parseFloat(playerData.wi[weekString].p || "0");
    //       }
    //     }
    //   }
    // }

    const team1UserId = team1.user_id;
    const team2UserId = team2.user_id;

    const team1Wins = team1UserId
      ? scheduleDataFinal[team1UserId]?.wins
      : undefined;
    const team1Losses = team1UserId
      ? scheduleDataFinal[team1UserId]?.losses
      : undefined;
    const team2Wins = team2UserId
      ? scheduleDataFinal[team2UserId]?.wins
      : undefined;
    const team2Losses = team2UserId
      ? scheduleDataFinal[team2UserId]?.losses
      : undefined;

    const starters1Points = scheduleDataFinal[team1.user_id]?.starters_points;
    const starters2Points = scheduleDataFinal[team2.user_id]?.starters_points;

    //check to see if every player on BOTH teams have more points than 0
    const team1Played = scheduleDataFinal[team1.user_id].starters_points.every(
      (starterPoints) => {
        return starterPoints !== 0;
      }
    );
    const team2Played = scheduleDataFinal[team2.user_id].starters_points.every(
      (starterPoints) => {
        return starterPoints !== 0;
      }
    );

    let preGame;
    let liveGame;
    let postGame;

    //check if we're in current week. If we are, display poll. Else, display over/under.
    if (
      parseFloat(team1.team_points) === 0 &&
      parseFloat(team2.team_points) === 0
    ) {
      preGame = true;
      postGame = false;
      liveGame = false;
    }

    //live game
    if (
      (parseFloat(team1.team_points) !== 0 ||
        parseFloat(team2.team_points) !== 0) &&
      (starters1Points.includes(0) || starters2Points.includes(0))
    ) {
      liveGame = true;
      preGame = false;
      postGame = false;
    }

    //postgame
    if (
      team1Played &&
      team2Played &&
      (morningSlateEnd || afternoonSlateEnd || snfEnd || mnfEnd)
    ) {
      postGame = true;
      preGame = false;
      liveGame = false;
    }
    console.log("morning", morningSlateEnd);
    console.log("AN", afternoonSlateEnd);
    console.log("SNF", snfEnd);
    console.log("MNF", mnfEnd);

    //O/U jsx

    const overUnderText = (
      <div className="flex items-center justify-around mt-5">
        <p className="flex-shrink-0 w-[9vw] text-center text-[12px] font-bold dark:text-[#949494]  ">
          {team1Proj > team2Proj
            ? team1?.name + " -" + Math.round(team1Proj - team2Proj)
            : team2?.name + " -" + Math.round(team2Proj - team1Proj)}
        </p>
        <p className="flex-shrink-0 w-[9vw] text-center text-[12px] dark:text-[#949494] font-bold ml-2 ">
          O/U: {Math.round(team1Proj + team2Proj)}
        </p>
      </div>
    );

    const finalText = <p className="text-center text-[12px] mt-2">FINAL</p>;

    const liveText = (
      <p className=" animate-pulse text-[12px] font-bold border-[1px] border-[#af1222] w-min self-center pr-2 rounded-lg text-[#af1222] flex items-center justify-center mt-2">
        <BsDot className="" size={20} /> LIVE
      </p>
    );

    return (
      <div
        key={matchupID}
        className="flex flex-col items-center gap-5 mt-2 duration-500"
      >
        <Link
          activeClass="active"
          to={matchupID}
          spy={true}
          smooth={true}
          offset={50}
          delay={100}
          duration={900}
          onClick={() => {
            setShowScore(false);
            router.push(
              `/league/${localStorage.getItem("selectedLeagueID")}/schedule`
            );
          }}
        >
          <div className="border-[1px] border-[#af1222] border-opacity-10 p-[30px] dark:bg-[#0a0a0a] bg-[#e0dfdf] rounded w-[85vw] flex flex-col">
            <div
              className={
                team2.team_points > team1.team_points && postGame
                  ? `team1 flex items-center justify-between mb-2 text-[#adaeaf]`
                  : `team1 flex items-center justify-between mb-2 font-bold`
              }
            >
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
              <p
                className={
                  parseFloat(team1.team_points || "0") > 0
                    ? `text-[14px]`
                    : `text-[11px] italic font-bold dark:text-[#949494]`
                }
              >
                {parseFloat(team1.team_points || "0") > 0 ||
                parseFloat(team2.team_points || "0") > 0
                  ? team1.team_points
                  : team1Wins !== undefined
                  ? `${team1Wins} - ${team1Losses}`
                  : "N/A"}
              </p>
            </div>
            <div
              className={
                team1.team_points > team2.team_points && postGame
                  ? `team2 flex items-center justify-between text-[#adaeaf]`
                  : `team2 flex items-center justify-between font-bold`
              }
            >
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
              <p
                className={
                  parseFloat(team2.team_points || "0") > 0
                    ? `text-[14px]`
                    : `text-[11px] italic font-bold dark:text-[#949494]`
                }
              >
                {parseFloat(team1.team_points || "0") > 0 ||
                parseFloat(team2.team_points || "0") > 0
                  ? team2.team_points
                  : team2Wins !== undefined
                  ? `${team2Wins} - ${team2Losses}`
                  : "N/A"}
              </p>
            </div>

            {preGame
              ? overUnderText
              : liveGame
              ? liveText
              : postGame
              ? finalText
              : ""}
          </div>
        </Link>
      </div>
    );
  });

  return (
    <div>
      <div className="flex flex-col items-center">
        <div className="font-bold text-center mt-2 border-b-[1px] border-[#af1222] border-opacity-10 w-min flex ">
          Scoreboard
        </div>
        {matchupText.map((matchup) => (
          <div key={uuidv4()}>{matchup}</div>
        ))}
      </div>
    </div>
  );
}
