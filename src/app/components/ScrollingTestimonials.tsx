"use client";

import { motion } from "framer-motion";
import axios from "axios";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import scaryimran from "../images/scary_imran.png";
import { IoPulseSharp } from "react-icons/io5";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore/lite";
import { db, storage } from "../firebase";

import { LuUserPlus, LuUserMinus } from "react-icons/lu";
import { v4 as uuidv4 } from "uuid";

interface ScheduleData {
  [userId: string]: {
    avatar?: string;
    name?: string;
    roster_id?: string;
    user_id?: string;
  };
}

interface DraftPicks {
  season?: string;
  league_id?: string;
  owner_id?: string;
  previous_owner_id?: string;
  round?: number;
  roster_id?: string;
}

interface DraftPickInfo {
  season?: string;
  round?: number;
}
interface TradeInfo {
  [transactionID: string]: [
    {
      avatar?: string;
      name?: string;
      roster_id?: string;
      user_id?: string;
      players_recieved?: string[];
      players_sent?: string[];
      draft_picks?: DraftPicks[];
      draft_picks_recieved?: DraftPickInfo[];
      draft_picks_sent?: DraftPickInfo[];
    }
  ];
}

interface WaiverInfo {
  [transactionID: string]: {
    avatar?: string;
    name?: string;
    roster_id?: string;
    user_id?: string;
    player_added?: string;
    player_dropped?: string;
  };
}

interface FreeAgentInfo {
  [transactionID: string]: {
    avatar?: string;
    name?: string;
    roster_id?: string;
    user_id?: string;
    player_added?: string;
    player_dropped?: string;
  };
}

interface Transaction {
  id: string;
  status: string;
  type: string;
  consenter_ids: string[];
  adds: Record<string, string>;
  drops: Record<string, string>;
  transaction_id: string;
  draft_picks?: DraftPicks[];
  // Add any other properties you might have in the transaction
}

interface ManagerData {
  avatar?: string;
  name?: string;
  roster_id?: string;
  user_id?: string;
  players_recieved?: string[];
  players_sent?: string[];
  draft_picks?: DraftPicks[];
  draft_picks_recieved?: DraftPickInfo[];
  draft_picks_sent?: DraftPickInfo[];
  // Additional properties...
}

const ScrollingTestimonials = () => {
  const [leagueTransactions, setLeagueTransactions] = useState([]);
  const [playersData, setPlayersData] = useState([]);
  const [rosters, setRosters] = useState([]);
  const [managerMap, setManagerMap] = useState<ScheduleData>({});

  const getLeagueTransactions = async () => {
    const response = await axios.get(
      `https://api.sleeper.app/v1/league/${localStorage.getItem(
        "selectedLeagueID"
      )}/transactions/1`
    );
    setLeagueTransactions(response.data);
  };

  const getUsers = async () => {
    try {
      const response = await axios.get<any>(
        `https://api.sleeper.app/v1/league/${localStorage.getItem(
          "selectedLeagueID"
        )}/users`
      );

      return response.data;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get users");
    }
  };

  const getRosters = async () => {
    try {
      const response = await axios.get<any>(
        `https://api.sleeper.app/v1/league/${localStorage.getItem(
          "selectedLeagueID"
        )}/rosters`
      );

      return response.data;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get rosters");
    }
  };
  //console.log("league transactions", leagueTransactions);
  //console.log("rosters", rosters);

  useEffect(() => {
    getLeagueTransactions();
    const fetchData = async () => {
      try {
        const usersData = await getUsers();
        const rostersData = await getRosters();

        // Create a new map to store the updated schedule data
        const managerMap: ScheduleData = {};

        // Update the scheduleData map with user data
        for (const user of usersData) {
          managerMap[user.user_id] = {
            avatar: `https://sleepercdn.com/avatars/thumbs/${user.avatar}`,
            name: user.display_name,
            user_id: user.user_id,
          };
        }

        // Update the scheduleData map with roster data
        for (const roster of rostersData) {
          if (managerMap[roster.owner_id]) {
            managerMap[roster.owner_id].roster_id = roster.roster_id;
          }
        }

        setManagerMap(managerMap);

        // Set the updated scheduleData map to state
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [localStorage.getItem("selectedLeagueID")]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://www.fantasypulseff.com/api/fetchPlayers",
          {
            method: "POST",
            body: localStorage.getItem("selectedLeagueID"),
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

  return (
    <div className="w-[95vw] xl:w-[60vw]">
      <div className="p-4 overflow-x-hidden relative">
        <div className="absolute top-0 bottom-0 left-0 w-24 z-10 " />

        <div className="flex items-center mb-4">
          <TestimonialList
            managerMap={managerMap}
            playersData={playersData}
            reverse={true}
            list={leagueTransactions}
            duration={500}
          />
          <TestimonialList
            managerMap={managerMap}
            playersData={playersData}
            reverse={true}
            list={leagueTransactions}
            duration={500}
          />
          <TestimonialList
            managerMap={managerMap}
            playersData={playersData}
            reverse={true}
            list={leagueTransactions}
            duration={500}
          />
        </div>

        {/* <div className="flex items-center mb-4">
          <TestimonialList list={leagueTransactions} duration={125} reverse />
          <TestimonialList list={leagueTransactions} duration={125} reverse />
          <TestimonialList list={leagueTransactions} duration={125} reverse />
        </div>
        <div className="flex items-center">
          <TestimonialList list={leagueTransactions} duration={275} />
          <TestimonialList list={leagueTransactions} duration={275} />
          <TestimonialList list={leagueTransactions} duration={275} />
        </div> */}

        <div className="absolute top-0 bottom-0 right-0 w-24 z-10 " />
      </div>
    </div>
  );
};

const tradeInfoObj: Record<string, ManagerData[]> = {};
const waiverInfoObj: WaiverInfo = {};
const freeAgentInfoObj: FreeAgentInfo = {};
function areObjectsEqual(obj1: any, obj2: any) {
  return (
    obj1.name === obj2.name &&
    obj1.avatar === obj2.avatar &&
    obj1.roster_id === obj2.roster_id &&
    obj1.user_id === obj2.user_id
  );
}

const TestimonialList = ({
  list,
  reverse = false,
  duration = 50,
  managerMap,
  playersData,
}: {
  list: Transaction[];
  reverse: boolean;
  duration: number;
  managerMap: ScheduleData;
  playersData: any;
}) => {
  return (
    <motion.div
      initial={{ translateX: reverse ? "-100%" : "0%" }}
      animate={{ translateX: reverse ? "0%" : "-100%" }}
      transition={{ duration: duration, repeat: Infinity, ease: "linear" }}
      className="flex gap-4 px-2"
    >
      {list.map((transaction) => {
        // console.log("TYPE: ", transaction.type);
        // console.log("Transaction: ", transaction);
        if (transaction.status === "complete" && transaction.type === "trade") {
          //players added
          // const addsKeys = transaction.adds
          //   ? Object.keys(transaction.adds)
          //   : [];

          // //roster Ids of manager that recieved
          // const addsValues = transaction.adds
          //   ? Object.values(transaction.adds)
          //   : [];

          for (const manager in managerMap) {
            for (const rosterId of transaction.consenter_ids) {
              if (!tradeInfoObj[manager]) {
                tradeInfoObj[manager] = [{}]; // Create an empty object if not exists
              }
              if (rosterId === managerMap[manager].roster_id) {
                if (rosterId === managerMap[manager].roster_id) {
                  const newManagerData = {
                    name: managerMap[manager].name,
                    avatar: managerMap[manager].avatar,
                    roster_id: managerMap[manager].roster_id,
                    user_id: managerMap[manager].user_id,
                  };

                  //checking to see if duplicates of newManagerData exists
                  if (
                    tradeInfoObj[transaction.transaction_id] &&
                    !tradeInfoObj[transaction.transaction_id].some((item) =>
                      areObjectsEqual(item, newManagerData)
                    )
                  ) {
                    tradeInfoObj[transaction.transaction_id].push(
                      newManagerData
                    );
                  } else {
                    tradeInfoObj[transaction.transaction_id] = [newManagerData];
                  }
                }

                // tradeInfoObj[transaction.transaction_id].name =
                //   managerMap[manager].name;
                // tradeInfoObj[transaction.transaction_id].avatar =
                //   managerMap[manager].avatar;
                // tradeInfoObj[transaction.transaction_id].roster_id =
                //   managerMap[manager].roster_id;
              }
            }
          }

          for (const key in transaction.adds) {
            if (tradeInfoObj[transaction.transaction_id]) {
              tradeInfoObj[transaction.transaction_id].forEach((manager) => {
                if (transaction.adds[key] === manager.roster_id) {
                  if (manager.players_recieved) {
                    manager.players_recieved.push(key);
                  } else {
                    manager.players_recieved = [key];
                  }
                  //manager.players_recieved= key;
                }
              });
            }
          }
          for (const key in transaction.drops) {
            if (tradeInfoObj[transaction.transaction_id]) {
              tradeInfoObj[transaction.transaction_id].forEach((manager) => {
                if (transaction.drops[key] === manager.roster_id) {
                  if (manager.players_sent) {
                    manager.players_sent.push(key);
                  } else {
                    manager.players_sent = [key];
                  }
                  //manager.players_recieved= key;
                }
              });
            }
          }
          if (tradeInfoObj[transaction.transaction_id]) {
            tradeInfoObj[transaction.transaction_id].forEach((manager) => {
              if (transaction.draft_picks) {
                manager.draft_picks = transaction.draft_picks;
              }

              //manager.players_recieved= key;
            });
          }
        }

        if (
          transaction.status === "complete" &&
          transaction.type === "waiver"
        ) {
          for (const manager in managerMap) {
            for (const rosterId of transaction.consenter_ids) {
              if (!waiverInfoObj[manager]) {
                waiverInfoObj[manager] = {};
              }

              if (rosterId === managerMap[manager].roster_id) {
                const newManagerData = {
                  name: managerMap[manager].name,
                  avatar: managerMap[manager].avatar,
                  roster_id: managerMap[manager].roster_id,
                  user_id: managerMap[manager].user_id,
                };

                waiverInfoObj[transaction.transaction_id] = newManagerData;
              }
            }
            for (const key in transaction.adds) {
              if (waiverInfoObj[transaction.transaction_id]) {
                if (
                  transaction.adds[key] ===
                  waiverInfoObj[transaction.transaction_id].roster_id
                ) {
                  waiverInfoObj[transaction.transaction_id].player_added = key;
                }
              }
            }
            for (const key in transaction.drops) {
              if (waiverInfoObj[transaction.transaction_id]) {
                if (
                  transaction.drops[key] ===
                  waiverInfoObj[transaction.transaction_id].roster_id
                ) {
                  waiverInfoObj[transaction.transaction_id].player_dropped =
                    key;
                }
              }
            }
          }
        }

        if (
          transaction.status === "complete" &&
          transaction.type === "free_agent"
        ) {
          for (const manager in managerMap) {
            for (const rosterId of transaction.consenter_ids) {
              if (!tradeInfoObj[manager]) {
                freeAgentInfoObj[manager] = {};
              }

              if (rosterId === managerMap[manager].roster_id) {
                const newManagerData = {
                  name: managerMap[manager].name,
                  avatar: managerMap[manager].avatar,
                  roster_id: managerMap[manager].roster_id,
                  user_id: managerMap[manager].user_id,
                };

                freeAgentInfoObj[transaction.transaction_id] = newManagerData;
              }
            }
            for (const key in transaction.adds) {
              if (freeAgentInfoObj[transaction.transaction_id]) {
                if (
                  transaction.adds[key] ===
                  freeAgentInfoObj[transaction.transaction_id].roster_id
                ) {
                  freeAgentInfoObj[transaction.transaction_id].player_added =
                    key;
                }
              }
            }
            for (const key in transaction.drops) {
              if (freeAgentInfoObj[transaction.transaction_id]) {
                if (
                  transaction.drops[key] ===
                  freeAgentInfoObj[transaction.transaction_id].roster_id
                ) {
                  freeAgentInfoObj[transaction.transaction_id].player_dropped =
                    key;
                }
              }
            }
          }
        }
        // console.log("trade info", tradeInfoObj);
        // console.log("waiver info", waiverInfoObj);

        //looping through draft picks

        //if(tradeInfoObj[transaction.transaction_id][0].draft_picks && tradeInfoObj[transaction.transaction_id][0].)

        if (
          tradeInfoObj[transaction.transaction_id] &&
          tradeInfoObj[transaction.transaction_id][0].draft_picks
        ) {
          //console.log(tradeInfoObj[transaction.transaction_id][0]);
          const draftPicks =
            tradeInfoObj[transaction.transaction_id][0].draft_picks || [];

          //draft pick trades UI
          for (const draftPick of draftPicks) {
            //console.log("all picks", draftPicks);
            //console.log("individual pick", draftPick);
            //loop through each manager to link draft picks to right owner
            tradeInfoObj[transaction.transaction_id].forEach((manager) => {
              if (manager.roster_id === draftPick.owner_id) {
                if (
                  manager.draft_picks_recieved &&
                  manager.draft_picks_recieved?.length > 0
                ) {
                  manager.draft_picks_recieved.push({
                    season: draftPick.season,
                    round: draftPick.round,
                  });
                } else {
                  manager.draft_picks_recieved = [
                    {
                      season: draftPick.season,
                      round: draftPick.round,
                    },
                  ];
                }
              }
              if (manager.roster_id === draftPick.previous_owner_id) {
                //console.log("traded");
                if (
                  manager.draft_picks_sent &&
                  manager.draft_picks_sent?.length > 0
                ) {
                  manager.draft_picks_sent.push({
                    season: draftPick.season,
                    round: draftPick.round,
                  });
                } else {
                  manager.draft_picks_sent = [
                    {
                      season: draftPick.season,
                      round: draftPick.round,
                    },
                  ];
                }
              }
            });
          }
        }

        if (tradeInfoObj[transaction.transaction_id]) {
          //console.log(tradeInfoObj[transaction.transaction_id]);
        }

        //players trade UI

        if (tradeInfoObj.hasOwnProperty(transaction.transaction_id)) {
          // if (
          //   tradeInfoObj[transaction.transaction_id] &&
          //   !tradeInfoObj[transaction.transaction_id][0].draft_picks
          // ) {
          // }
          if (tradeInfoObj[transaction.transaction_id]) {
            const teams = tradeInfoObj[transaction.transaction_id];
            let team1, team2, team3;

            if (teams.length >= 1) {
              team1 = teams[0];
            }

            if (teams.length >= 2) {
              team2 = teams[1];
            }

            if (teams.length >= 3) {
              team3 = teams[2];
            }
            return (
              <div
                key={transaction.id}
                className="w-screen  md:w-[60vw] h-[27vh] lg:w-[25vw] flex flex-wrap justify-center rounded-lg overflow-hidden relative border-2 border-[#af1222] dark:border-[#1a1a1a] border-opacity-80"
              >
                <div className={""}>
                  <div className=" text-[13px] xl:text-[20px] text-white font-bold p-2 flex justify-center bg-[#af1222]">
                    <span className="block capitalize font-semibold  mb-1">
                      {`${transaction.type}   :    ${transaction.status}`}
                    </span>
                  </div>

                  <div className="teams overflow-y-scroll  p-5 w-screen md:w-[60vw] h-[27vh] lg:w-[25vw] flex justify-around text-[11px] xl:text-[13px] font-bold ">
                    <div
                      className={
                        team3
                          ? "team1 flex flex-col text-[9px]"
                          : "team1 flex flex-col text-[12px]"
                      }
                    >
                      <span className="border-b-2 border-[#1a1a1a] border-opacity-80 text-center mb-1 flex justify-center items-center">
                        <Image
                          className="rounded-full mr-2 mb-1"
                          src={team1?.avatar ?? ""}
                          alt="manager"
                          width={22}
                          height={22}
                        />
                        {team1?.name}
                      </span>
                      <div>
                        <div className="players-added1 mb-1">
                          {team1?.players_recieved?.map((player) => {
                            return (
                              playersData[player] && (
                                <span className="flex items-center">
                                  <LuUserPlus className="text-[green] mr-1" />
                                  <span className="flex">
                                    <Image
                                      src={
                                        playersData[player].pos == "DEF"
                                          ? `https://sleepercdn.com/images/team_logos/nfl/${player.toLowerCase()}.png`
                                          : `https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`
                                      }
                                      alt="player image"
                                      width={30}
                                      height={30}
                                    />
                                    {`${playersData[player].fn} ${playersData[player].ln}`}
                                  </span>
                                </span>
                              )
                            );
                          })}
                          {team1?.draft_picks_recieved?.map((pick) => {
                            return (
                              <div className="" key={uuidv4()}>
                                <span className="flex items-center">
                                  <LuUserPlus className="text-[green] mr-1" />
                                  {` ${pick.season} ${`${pick.round}${
                                    pick.round?.toString()[
                                      pick.round?.toString().length - 1
                                    ] === "1"
                                      ? "st"
                                      : pick.round?.toString()[
                                          pick.round?.toString().length - 1
                                        ] === "2"
                                      ? "nd"
                                      : pick.round?.toString()[
                                          pick.round?.toString().length - 1
                                        ] === "3"
                                      ? "rd"
                                      : "th"
                                  } Round Pick`} `}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="players-sent1 mb-1">
                          {team1?.players_sent?.map((player) => {
                            return (
                              playersData[player] && (
                                <span className="flex items-center">
                                  <LuUserMinus className="text-[#af1222] mr-1" />
                                  <span className="flex">
                                    <Image
                                      src={
                                        playersData[player].pos == "DEF"
                                          ? `https://sleepercdn.com/images/team_logos/nfl/${player.toLowerCase()}.png`
                                          : `https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`
                                      }
                                      alt="player image"
                                      width={30}
                                      height={30}
                                    />
                                    {`${playersData[player].fn} ${playersData[player].ln}`}
                                  </span>
                                </span>
                              )
                            );
                          })}
                          {team1?.draft_picks_sent?.map((pick) => {
                            return (
                              <div className="">
                                <span className="flex items-center">
                                  <LuUserMinus className="text-[#af1222] mr-1" />
                                  {` ${pick.season} ${`${pick.round}${
                                    pick.round?.toString()[
                                      pick.round?.toString().length - 1
                                    ] === "1"
                                      ? "st"
                                      : pick.round?.toString()[
                                          pick.round?.toString().length - 1
                                        ] === "2"
                                      ? "nd"
                                      : pick.round?.toString()[
                                          pick.round?.toString().length - 1
                                        ] === "3"
                                      ? "rd"
                                      : "th"
                                  } Round Pick`} `}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div
                      className={
                        team3
                          ? "team2 flex flex-col text-[9px]"
                          : "team2 flex flex-col text-[12px]"
                      }
                    >
                      <span className="border-b-2 border-[#1a1a1a] border-opacity-80 text-center mb-1 flex justify-center items-center">
                        <Image
                          className="rounded-full mr-2 mb-1"
                          src={team2?.avatar ?? ""}
                          alt="manager"
                          width={22}
                          height={22}
                        />
                        {team2?.name}
                      </span>

                      <div>
                        <div className="players-added2 mb-1">
                          {team2?.players_recieved?.map((player) => {
                            return (
                              playersData[player] && (
                                <span className="flex items-center">
                                  <LuUserPlus className="text-[green] mr-1" />
                                  <span className="flex">
                                    <Image
                                      src={
                                        playersData[player].pos == "DEF"
                                          ? `https://sleepercdn.com/images/team_logos/nfl/${player.toLowerCase()}.png`
                                          : `https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`
                                      }
                                      alt="player image"
                                      width={30}
                                      height={30}
                                    />
                                    {`${playersData[player].fn} ${playersData[player].ln}`}
                                  </span>
                                </span>
                              )
                            );
                          })}
                          {team2?.draft_picks_recieved?.map((pick) => {
                            return (
                              <div className="" key={uuidv4()}>
                                <span className="flex items-center">
                                  <LuUserPlus className="text-[green] mr-1" />
                                  {` ${pick.season} ${`${pick.round}${
                                    pick.round?.toString()[
                                      pick.round?.toString().length - 1
                                    ] === "1"
                                      ? "st"
                                      : pick.round?.toString()[
                                          pick.round?.toString().length - 1
                                        ] === "2"
                                      ? "nd"
                                      : pick.round?.toString()[
                                          pick.round?.toString().length - 1
                                        ] === "3"
                                      ? "rd"
                                      : "th"
                                  } Round Pick`} `}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="players-sent2 mb-1">
                          {" "}
                          {team2?.players_sent?.map((player) => {
                            return (
                              playersData[player] && (
                                <span className="flex items-center">
                                  <LuUserMinus className="text-[#af1222] mr-1" />
                                  <span className="flex">
                                    <Image
                                      src={
                                        playersData[player].pos == "DEF"
                                          ? `https://sleepercdn.com/images/team_logos/nfl/${player.toLowerCase()}.png`
                                          : `https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`
                                      }
                                      alt="player image"
                                      width={30}
                                      height={30}
                                    />
                                    {`${playersData[player].fn} ${playersData[player].ln}`}
                                  </span>
                                </span>
                              )
                            );
                          })}
                          {team2?.draft_picks_sent?.map((pick) => {
                            return (
                              <div className="" key={uuidv4()}>
                                <span className="flex items-center">
                                  <LuUserMinus className="text-[#af1222] mr-1" />
                                  {` ${pick.season} ${`${pick.round}${
                                    pick.round?.toString()[
                                      pick.round?.toString().length - 1
                                    ] === "1"
                                      ? "st"
                                      : pick.round?.toString()[
                                          pick.round?.toString().length - 1
                                        ] === "2"
                                      ? "nd"
                                      : pick.round?.toString()[
                                          pick.round?.toString().length - 1
                                        ] === "3"
                                      ? "rd"
                                      : "th"
                                  } Round Pick`} `}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div
                      className={
                        team3
                          ? "team3 flex flex-col text-[9px]"
                          : "team3 flex flex-col text-[12px]"
                      }
                    >
                      <span className="border-b-2 border-[#1a1a1a] border-opacity-80 text-center mb-1 flex justify-center items-center">
                        <Image
                          className={
                            team3 ? "rounded-full mr-2 mb-1" : "hidden"
                          }
                          src={team3?.avatar ?? ""}
                          alt="manager"
                          width={22}
                          height={22}
                        />
                        {team3?.name}
                      </span>

                      <div>
                        <div className="players-added2 mb-1">
                          {team3?.players_recieved?.map((player) => {
                            return (
                              playersData[player] && (
                                <span className="flex items-center">
                                  <LuUserPlus className="text-[green] mr-1" />
                                  <span className="flex">
                                    <Image
                                      src={
                                        playersData[player].pos == "DEF"
                                          ? `https://sleepercdn.com/images/team_logos/nfl/${player.toLowerCase()}.png`
                                          : `https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`
                                      }
                                      alt="player image"
                                      width={30}
                                      height={30}
                                    />
                                    {`${playersData[player].fn} ${playersData[player].ln}`}
                                  </span>
                                </span>
                              )
                            );
                          })}
                          {team3?.draft_picks_recieved?.map((pick) => {
                            return (
                              <div className="" key={uuidv4()}>
                                <span className="flex items-center">
                                  <LuUserPlus className="text-[green] mr-1" />
                                  {` ${pick.season} ${`${pick.round}${
                                    pick.round?.toString()[
                                      pick.round?.toString().length - 1
                                    ] === "1"
                                      ? "st"
                                      : pick.round?.toString()[
                                          pick.round?.toString().length - 1
                                        ] === "2"
                                      ? "nd"
                                      : pick.round?.toString()[
                                          pick.round?.toString().length - 1
                                        ] === "3"
                                      ? "rd"
                                      : "th"
                                  } Round Pick`} `}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="players-sent2 mb-1">
                          {" "}
                          {team3?.players_sent?.map((player) => {
                            return (
                              playersData[player] && (
                                <span className="flex items-center">
                                  <LuUserMinus className="text-[#af1222] mr-1" />
                                  <span className="flex">
                                    <Image
                                      src={
                                        playersData[player].pos == "DEF"
                                          ? `https://sleepercdn.com/images/team_logos/nfl/${player.toLowerCase()}.png`
                                          : `https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg`
                                      }
                                      alt="player image"
                                      width={30}
                                      height={30}
                                    />
                                    {`${playersData[player].fn} ${playersData[player].ln}`}
                                  </span>
                                </span>
                              )
                            );
                          })}
                          {team3?.draft_picks_sent?.map((pick) => {
                            return (
                              <div className="">
                                <span className="flex items-center">
                                  <LuUserMinus className="text-[#af1222] mr-1" />
                                  {` ${pick.season} ${`${pick.round}${
                                    pick.round?.toString()[
                                      pick.round?.toString().length - 1
                                    ] === "1"
                                      ? "st"
                                      : pick.round?.toString()[
                                          pick.round?.toString().length - 1
                                        ] === "2"
                                      ? "nd"
                                      : pick.round?.toString()[
                                          pick.round?.toString().length - 1
                                        ] === "3"
                                      ? "rd"
                                      : "th"
                                  } Round Pick`} `}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* <Image
                src={scaryimran}
                className="w-[60px] h-[60px] object-cover"
              /> */}

                <span className="text-3xl absolute top-2 right-2 text-white dark:text-[black]">
                  <IoPulseSharp />
                </span>
              </div>
            );
          }
        }
        if (waiverInfoObj.hasOwnProperty(transaction.transaction_id)) {
          if (waiverInfoObj[transaction.transaction_id]) {
            const player = waiverInfoObj[transaction.transaction_id];
            return (
              <div
                key={transaction.id}
                className="w-screen md:w-[60vw] h-[27vh] font-bold lg:w-[25vw] flex flex-wrap justify-center rounded-lg overflow-hidden relative border-2 border-[#af1222] dark:border-[#1a1a1a] border-opacity-80"
              >
                <div>
                  <div className="text-[13px] xl:text-[20px] text-white font-bold p-2 flex justify-center bg-[#af1222] w-screen md:w-[60vw] lg:w-[25vw]">
                    <span className="block capitalize font-semibold  mb-1">
                      {`${transaction.type}   :    ${transaction.status}`}
                    </span>
                  </div>
                  <div className="waiver mt-3">
                    <span className="border-b-2 border-[#1a1a1a] border-opacity-80 text-center mb-1 flex justify-center items-center">
                      <Image
                        className="rounded-full mr-2 mb-1"
                        src={player.avatar ?? ""}
                        alt="manager"
                        width={22}
                        height={22}
                      />
                      <p className="text-[14px]">{player.name}</p>
                    </span>
                    <div className="flex flex-col items-center">
                      <div className="player-added">
                        {player.player_added && (
                          <span className="flex items-center">
                            <LuUserPlus className="text-[green] mr-1" />{" "}
                            <Image
                              src={
                                playersData[player.player_added]?.pos === "DEF"
                                  ? `https://sleepercdn.com/images/team_logos/nfl/${player.player_added.toLowerCase()}.png`
                                  : `https://sleepercdn.com/content/nfl/players/thumb/${player.player_added}.jpg`
                              }
                              alt="player image"
                              width={30}
                              height={30}
                            />
                            <p className="text-[14px]">
                              {`${
                                playersData[player.player_added]?.fn ||
                                "Unknown"
                              } ${
                                playersData[player.player_added]?.ln || "Player"
                              }`}
                            </p>
                          </span>
                        )}
                      </div>
                      {player.player_dropped && (
                        <div className="player-dropped">
                          <span className="flex items-center">
                            <LuUserMinus className="text-[#af1222] mr-1" />{" "}
                            <Image
                              src={
                                playersData[player.player_dropped]?.pos ===
                                "DEF"
                                  ? `https://sleepercdn.com/images/team_logos/nfl/${player.player_dropped.toLowerCase()}.png`
                                  : `https://sleepercdn.com/content/nfl/players/thumb/${player.player_dropped}.jpg`
                              }
                              alt="player image"
                              width={30}
                              height={30}
                            />
                            <p className="text-[14px]">
                              {`${
                                playersData[player.player_dropped]?.fn ||
                                "Unknown"
                              } ${
                                playersData[player.player_dropped]?.ln ||
                                "Player"
                              }`}
                            </p>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-3xl absolute top-2 right-2 text-white dark:text-[black]">
                  <IoPulseSharp />
                </span>
              </div>
            );
          }
        }
        if (freeAgentInfoObj.hasOwnProperty(transaction.transaction_id)) {
          if (freeAgentInfoObj[transaction.transaction_id]) {
            const player = freeAgentInfoObj[transaction.transaction_id];
            return (
              <div
                key={transaction.id}
                className="w-screen md:w-[60vw] h-[27vh] font-bold lg:w-[25vw] flex flex-wrap justify-center rounded-lg overflow-hidden relative border-2 border-[#af1222] dark:border-[#1a1a1a] border-opacity-80"
              >
                <div>
                  <div className="text-[13px] xl:text-[20px] text-white font-bold p-2 flex justify-center bg-[#af1222] w-screen md:w-[60vw] lg:w-[25vw]">
                    <span className="block capitalize font-semibold  mb-1">
                      {`${transaction.type}   :    ${transaction.status}`}
                    </span>
                  </div>
                  <div className="waiver mt-3">
                    <span className="border-b-2 border-[#1a1a1a] border-opacity-80 text-center mb-1 flex justify-center items-center">
                      <Image
                        className="rounded-full mr-2 mb-1"
                        src={player.avatar ?? ""}
                        alt="manager"
                        width={22}
                        height={22}
                      />
                      <p className="text-[14px]">{player.name}</p>
                    </span>
                    <div className="flex flex-col items-center">
                      <div className="player-added">
                        {player.player_added && (
                          <span className="flex items-center">
                            <LuUserPlus className="text-[green] mr-1" />{" "}
                            <Image
                              src={
                                playersData[player.player_added]?.pos === "DEF"
                                  ? `https://sleepercdn.com/images/team_logos/nfl/${player.player_added.toLowerCase()}.png`
                                  : `https://sleepercdn.com/content/nfl/players/thumb/${player.player_added}.jpg`
                              }
                              alt="player image"
                              width={30}
                              height={30}
                            />
                            <p className="text-[14px]">
                              {`${
                                playersData[player.player_added]?.fn ||
                                "Unknown"
                              } ${
                                playersData[player.player_added]?.ln || "Player"
                              }`}
                            </p>
                          </span>
                        )}
                      </div>
                      {player.player_dropped && (
                        <div className="player-dropped">
                          <span className="flex items-center">
                            <LuUserMinus className="text-[#af1222] mr-1" />{" "}
                            <Image
                              src={
                                playersData[player.player_dropped]?.pos ===
                                "DEF"
                                  ? `https://sleepercdn.com/images/team_logos/nfl/${player.player_dropped.toLowerCase()}.png`
                                  : `https://sleepercdn.com/content/nfl/players/thumb/${player.player_dropped}.jpg`
                              }
                              alt="player image"
                              width={30}
                              height={30}
                            />
                            <p className="text-[14px]">
                              {`${
                                playersData[player.player_dropped]?.fn ||
                                "Unknown"
                              } ${
                                playersData[player.player_dropped]?.ln ||
                                "Player"
                              }`}
                            </p>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-3xl absolute top-2 right-2 text-white dark:text-[black]">
                  <IoPulseSharp />
                </span>
              </div>
            );
          }
        }
      })}
    </motion.div>
  );
};

export default ScrollingTestimonials;
