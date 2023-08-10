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

  const weeklyInfo: WeeklyInformation = {};

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
    // Check if matchupMap has been populated
    if (matchupMap.size > 0) {
      setLoadingData(false);
    }
  }, [matchupMap]);

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
            if (roster.roster_id === matchup.roster_id) {
              updatedScheduleData[roster.owner_id].matchup_id =
                matchup.matchup_id;
              updatedScheduleData[roster.owner_id].team_points = matchup.points;
            }
          }
        }

        // Set the updated scheduleData map to state
        setScheduleDataFinal(updatedScheduleData);
        setLoadingData(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoadingData(false);
      }
    };

    fetchData();
  }, [REACT_APP_LEAGUE_ID]);

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

  const storageRef = ref(
    storage,
    `files/${localStorage.getItem("selectedLeagueID")}.txt`
  );

  // Uncomment to upload textfile to firebase storage

  // const textContent = JSON.stringify(scheduleDataFinal);

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
  //   getDownloadURL(storageRef)
  //     .then((url) => {
  //       fetch(url)
  //         .then((response) => response.text())
  //         .then((fileContent) => {
  //           // console.log(
  //           //   "Text file content from Firebase Cloud Storage:",
  //           //   fileContent
  //           // );
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

  if (REACT_APP_LEAGUE_ID) {
    const updateWeeklyInfo = async () => {
      if (!weeklyInfo[REACT_APP_LEAGUE_ID]) {
        weeklyInfo[REACT_APP_LEAGUE_ID] = {}; // Initialize the league entry if it doesn't exist
      }

      // Create a copy of scheduleDataFinal
      const updatedInfo = { ...scheduleDataFinal };

      // Set the copied data to weeklyInfo
      weeklyInfo[REACT_APP_LEAGUE_ID].info = updatedInfo;

      // Reference to the "Weekly Info" collection
      const weeklyInfoCollectionRef = collection(db, "Weekly Info");

      // Use a Query to check if a document with the league_id exists
      const queryRef = query(
        weeklyInfoCollectionRef,
        where("league_id", "==", REACT_APP_LEAGUE_ID)
      );

      const querySnapshot = await getDocs(queryRef);

      // Add or update the document based on whether it already exists
      if (!querySnapshot.empty) {
        // Document exists, update it
        querySnapshot.forEach(async (doc) => {
          await updateDoc(doc.ref, {
            info: weeklyInfo[REACT_APP_LEAGUE_ID].info,
          });
        });
      } else {
        // Document does not exist, add a new one
        await addDoc(weeklyInfoCollectionRef, {
          league_id: REACT_APP_LEAGUE_ID,
          info: weeklyInfo[REACT_APP_LEAGUE_ID].info,
        });
      }
    };

    // Call the async function
    updateWeeklyInfo();
  }

  // MATCHUP TEXT
  const matchupText = Array.from(matchupMap).map(([matchupID, matchupData]) => {
    const team1 = matchupData[0];
    const team2 = matchupData[1];

    return (
      <div
        key={matchupID}
        className="hidden xl:flex flex-wrap  justify-center mb-2 text-[9px] font-bold xl:h-[13vh] xl:w-[10vw] hover:bg-[#c4bfbf] dark:hover:bg-[#1a1a1c] cursor-pointer hover:scale-105 hover:duration-200"
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
                {team1.name.length > 10
                  ? team1.name.slice(0, 11).toLowerCase()
                  : team1.name.toLowerCase()}
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
                {team2.name.length > 10
                  ? team2.name.slice(0, 11).toLowerCase()
                  : team2.name.toLowerCase()}
              </p>
            </span>
            <p>{team2.team_points || "0"}</p>
          </div>
          <p className="w-[9vw] text-center text-[9px]">O/U: 350.24</p>
          <p className="w-[9vw] text-center text-[7px] text-[grey]">
            YSLBigNervous -7
          </p>
        </div>
      </div>
    );
  });

  if (loadingData) {
    return <Spinner className="w-screen text-center" color="error" />;
  }

  if (localStorage.getItem("selectedLeagueID")) {
    return matchupText;
  }
  return null;
}
