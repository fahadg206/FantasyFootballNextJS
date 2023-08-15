"use client";
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
import getMatchupMap from "../../app/libs/getMatchupData";
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

interface WeeklyInformation {
  [league_id: string]: {
    info?: ScheduleData;
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
  const [loadingData, setLoadingData] = useState(true);
  const [scheduleDataFinal, setScheduleDataFinal] = useState<ScheduleData>({});
  const [playersData, setPlayersData] = React.useState([]);
  const [week, setWeek] = useState<number>();

  const weeklyInfo: WeeklyInformation = {};

  const [matchupMap, setMatchupMap] = useState<Map<string, MatchupMapData[]>>(
    new Map()
  );
  const REACT_APP_LEAGUE_ID: string | null =
    localStorage.getItem("selectedLeagueID");

  const router = useRouter();

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
        setWeek(week);
        const matchupMapData = await getMatchupMap(REACT_APP_LEAGUE_ID, week);
        setMatchupMap(matchupMapData);
        console.log(matchupMapData);
      } catch (error) {
        console.error("Error fetching matchup data:", error);
      }
    }

    fetchMatchupData();
  }, [REACT_APP_LEAGUE_ID]);

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

  if (localStorage.getItem("usernameSubmitted") === "false") {
    localStorage.clear();
    router.refresh();
  }

  // MATCHUP TEXT

  console.log("scoreboard ", matchupMap);
  const matchupText = Array.from(matchupMap).map(([matchupID, matchupData]) => {
    const team1 = matchupData[0];
    const team2 = matchupData[1];

    let team1Proj = 0.0;
    let team2Proj = 0.0;
    //console.log("team 1, ", team1.starters);
    // ...

    if (team1?.starters) {
      for (const currPlayer of team1.starters) {
        if (
          playersData[currPlayer] &&
          playersData[currPlayer].wi &&
          playersData[currPlayer].wi[week?.toString()] &&
          playersData[currPlayer].wi[week?.toString()].p !== undefined
        ) {
          team1Proj += parseFloat(
            playersData[currPlayer].wi[week?.toString()].p
          );
        }
      }
    }

    if (team2?.starters) {
      for (const currPlayer of team2.starters) {
        if (
          playersData[currPlayer] &&
          playersData[currPlayer].wi &&
          playersData[currPlayer].wi[week?.toString()] &&
          playersData[currPlayer].wi[week?.toString()].p !== undefined
        ) {
          team2Proj += parseFloat(
            playersData[currPlayer].wi[week?.toString()].p
          );
        }
      }
    }

    return (
      <div
        key={matchupID}
        className={
          !localStorage.getItem("selectedLeagueID")
            ? `hidden`
            : `hidden xl:flex flex-wrap  justify-center mb-2 text-[9px] font-bold xl:h-[13vh] xl:w-[10vw] hover:bg-[#c4bfbf] dark:hover:bg-[#1a1a1c] cursor-pointer hover:scale-105 hover:duration-200`
        }
      >
        <div className="border-r dark:border-[#1a1a1a] border-[#af1222] border-opacity-10 p-2 rounded-md flex flex-col items-start justify-center h-[13vh] w-[10vw]">
          <div className="team1 flex justify-between items-center  w-[9vw]">
            <span className="flex items-center">
              <Image
                src={team1.avatar}
                alt="avatar"
                height={28}
                width={28}
                className="rounded-full mr-1"
              />
              <p>
                {team1.name.length >= 9
                  ? (team1.name.match(/[A-Z]/g) || []).length > 3
                    ? team1.name.slice(0, 10).toLowerCase()
                    : team1.name.slice(0, 10)
                  : team1.name}
              </p>
            </span>
            <p>{team1.team_points || "0"}</p>
          </div>
          <div className="team2 flex justify-between items-center w-[9vw]">
            <span className="flex items-center">
              <Image
                src={team2.avatar}
                alt="avatar"
                height={28}
                width={28}
                className="rounded-full mr-1"
              />
              <p>
                {team2.name.length >= 9
                  ? (team2.name.match(/[A-Z]/g) || []).length > 3
                    ? team2.name.slice(0, 10).toLowerCase()
                    : team2.name.slice(0, 10)
                  : team2.name}
              </p>
            </span>
            <p>{team2.team_points || "0"}</p>
          </div>
          <p className="w-[9vw] text-center text-[9px]">
            O/U: {Math.round(team1Proj + team2Proj)}
          </p>
          <p className="w-[9vw] text-center text-[9px] text-[grey]">
            {team1Proj > team2Proj
              ? team1?.name + " -" + Math.round(team1Proj - team2Proj)
              : team2?.name + " -" + Math.round(team2Proj - team1Proj)}
          </p>
        </div>
      </div>
    );
  });

  return matchupText;
}
