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

interface Starter {
  fname?: string;
  lname?: string;
  avatar?: string;
  scored_points?: string;
  projected_points?: string;
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

  function updateDbStorage(weeklyData: ScheduleData) {
    if (REACT_APP_LEAGUE_ID) {
      const storageRef = ref(storage, `files/${REACT_APP_LEAGUE_ID}.txt`);

      //Uncomment to upload textfile to firebase storage

      const articleMatchupData: ScheduleData = JSON.parse(
        JSON.stringify(weeklyData)
      );

      for (const matchupData in articleMatchupData) {
        delete articleMatchupData[matchupData].starters;
        delete articleMatchupData[matchupData].starters_points;
        delete articleMatchupData[matchupData].players;
        delete articleMatchupData[matchupData].players_points;
        delete articleMatchupData[matchupData].roster_id;
        delete articleMatchupData[matchupData].user_id;
        delete articleMatchupData[matchupData].avatar;
        for (const starter of articleMatchupData[matchupData]
          .starters_full_data) {
          delete starter.avatar;
        }
      }

      console.log("data ", articleMatchupData);

      const textContent = JSON.stringify(articleMatchupData);

      const readingRef = ref(storage, `files/${REACT_APP_LEAGUE_ID}.txt`);
      // Function to add content only if it's different
      addContentIfDifferent(textContent, storageRef);

      // // Upload the text content as a text file to Firebase Cloud Storage
      // uploadString(storageRef, textContent, "raw")
      //   .then(() => {
      //     console.log("Text file uploaded to Firebase Cloud Storage.");
      //   })
      //   .catch((error) => {
      //     console.error("Error uploading text file:", error);
      //   });
      // const readingRef = ref(storage, `files/`);
      // try {
      //   getDownloadURL(readingRef)
      //     .then((url) => {
      //       fetch(url)
      //         .then((response) => response.text())
      //         .then((fileContent) => {
      //           console.log(
      //             "Text file content from Firebase Cloud Storage:",
      //             fileContent
      //           );
      //         })
      //         .catch((error) => {
      //           console.error("Error fetching text file content:", url);
      //         });
      //     })
      //     .catch((error) => {
      //       console.error("Error getting download URL:", error);
      //     });
      // } catch (error) {
      //   console.error("Unexpected error:", error);
      // }
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
            if (!existingContent || existingContent !== newContent) {
              // If existingContent is empty or different from new content, upload the new content
              uploadNewContent(newContent, readingRef);
            } else {
              console.log("New content is the same as existing content.");
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
        setWeek(week);
        const matchupMapData = await getMatchupMap(REACT_APP_LEAGUE_ID, week);
        setMatchupMap(matchupMapData.matchupMap);
        setScheduleDataFinal(matchupMapData.updatedScheduleData);

        updateDbStorage(matchupMapData.updatedScheduleData);
        //setting each matchup into Map with key being matchup_id and value being two teams with corresponding matchup_id
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
