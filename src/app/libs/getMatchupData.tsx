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

    for (const key of keys1) {
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
        }

        for (const matchup of scheduleData) {
          // console.log("matchup", matchup);
          // console.log("roster", roster);
          if (roster.roster_id === matchup.roster_id) {
            updatedScheduleData[roster.owner_id].matchup_id =
              matchup.matchup_id;
            updatedScheduleData[roster.owner_id].team_points = matchup.points;
            updatedScheduleData[roster.owner_id].starters_points =
              matchup.starters_points;
            updatedScheduleData[roster.owner_id].players = matchup.players;
            updatedScheduleData[roster.owner_id].players_points =
              matchup.players_points;
            updatedScheduleData[roster.owner_id].starters = matchup.starters;
          }
        }

        for (const userId in updatedScheduleData) {
          if (updatedScheduleData.hasOwnProperty(userId)) {
            if (!updatedScheduleData[userId].starters_full_data) {
              updatedScheduleData[userId].starters_full_data = [{}];
            }
            if (updatedScheduleData[userId]?.starters) {
              for (const starter of updatedScheduleData[userId].starters) {
                const starter_data = {
                  fname: playersData[starter].fn,
                  lname: playersData[starter].ln,
                  avatar:
                    playersData[starter.toString()].pos == "DEF"
                      ? `https://sleepercdn.com/images/team_logos/nfl/${starter.toLowerCase()}.png`
                      : `https://sleepercdn.com/content/nfl/players/thumb/${starter}.jpg`,
                  scored_points:
                    updatedScheduleData[userId].players_points[starter],
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
                    },
                  ];
                }
              }
            }

            updatedScheduleData[userId].starters_full_data;
          }
        }
      }

      // Set the updated scheduleData map to state
      //setScheduleDataFinal(updatedScheduleData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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

    //setting each matchup into Map with key being matchup_id and value being two teams with corresponding matchup_id

    const storageRef = ref(storage, `files/${league_id}.txt`);

    //Uncomment to upload textfile to firebase storage

    console.log("Updated Data: ", updatedScheduleData);

    const articleMatchupData: ScheduleData = updatedScheduleData;

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

    console.log("Data after freeze...", articleMatchupData);

    const textContent = JSON.stringify(articleMatchupData);

    // Upload the text content as a text file to Firebase Cloud Storage
    uploadString(storageRef, textContent, "raw")
      .then(() => {
        console.log("Text file uploaded to Firebase Cloud Storage.");
      })
      .catch((error) => {
        console.error("Error uploading text file:", error);
      });
    const readingRef = ref(storage, `files/`);
    try {
      getDownloadURL(readingRef)
        .then((url) => {
          fetch(url)
            .then((response) => response.text())
            .then((fileContent) => {
              console.log(
                "Text file content from Firebase Cloud Storage:",
                fileContent
              );
            })
            .catch((error) => {
              console.error("Error fetching text file content:", url);
            });
        })
        .catch((error) => {
          console.error("Error getting download URL:", error);
        });
    } catch (error) {
      console.error("Unexpected error:", error);
    }

    // if (REACT_APP_LEAGUE_ID) {
    //   const updateWeeklyInfo = async () => {
    //     if (!weeklyInfo[REACT_APP_LEAGUE_ID]) {
    //       weeklyInfo[REACT_APP_LEAGUE_ID] = {}; // Initialize the league entry if it doesn't exist
    //     }

    //     // Create a copy of scheduleDataFinal
    //     const updatedInfo = { ...updatedScheduleData };

    //     // Set the copied data to weeklyInfo
    //     weeklyInfo[REACT_APP_LEAGUE_ID].info = updatedInfo;
    //     console.log("ayo", weeklyInfo);

    //     // Reference to the "Weekly Info" collection
    //     const weeklyInfoCollectionRef = collection(db, "Weekly Info");

    //     // Use a Query to check if a document with the league_id exists
    //     const queryRef = query(
    //       weeklyInfoCollectionRef,
    //       where("league_id", "==", REACT_APP_LEAGUE_ID)
    //     );

    //     const querySnapshot = await getDocs(queryRef);

    //     // Add or update the document based on whether it already exists
    //     if (!querySnapshot.empty && weeklyInfo[REACT_APP_LEAGUE_ID].info) {
    //       // Document exists, update it
    //       console.log("in if");
    //       querySnapshot.forEach(async (doc) => {
    //         await updateDoc(doc.ref, {
    //           info: weeklyInfo[REACT_APP_LEAGUE_ID].info,
    //         });
    //       });
    //     } else {
    //       console.log("in else", weeklyInfo[REACT_APP_LEAGUE_ID].info);
    //       // Document does not exist, add a new one
    //       await addDoc(weeklyInfoCollectionRef, {
    //         league_id: REACT_APP_LEAGUE_ID,
    //         info: weeklyInfo[REACT_APP_LEAGUE_ID].info,
    //       });
    //     }
    //   };

    //   // Call the async function
    //   updateWeeklyInfo();
    // }

    return matchupMap;
  };

  async function fetchPlayersData() {
    try {
      const response = await axios.get("http://localhost:3001/api/players");
      const playersData = response.data;
      // Process and use the data as needed

      return playersData;
    } catch (error) {
      console.error("Error while fetching players data:", error);
      return [];
    }
  }

  const playersData = await fetchPlayersData();

  const response = fetchData(playersData);

  return response;
}
