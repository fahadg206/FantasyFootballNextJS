"use client";

import { motion } from "framer-motion";
import axios from "axios";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import scaryimran from "../images/scary_imran.png";

import { LuUserPlus, LuUserMinus } from "react-icons/lu";

interface ScheduleData {
  [userId: string]: {
    avatar?: string;
    name?: string;
    roster_id?: string;
    user_id?: string;
  };
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
    }
  ];
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
  console.log("league transactions", leagueTransactions);
  console.log("rosters", rosters);

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

  console.log("managerMap", managerMap);

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

  return (
    <div>
      <div className="mb-8 px-4">
        <h2 className="text-slate-50 text-2xl font-semibold text-center">
          {`Welcome to ${localStorage.getItem("selectedLeagueName")}!`}
        </h2>
        <p className="text-center text-slate-300 text-sm mt-2 max-w-lg mx-auto">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus
          consequatur reprehenderit.
        </p>
      </div>
      <div className="p-4 overflow-x-hidden relative">
        <div className="absolute top-0 bottom-0 left-0 w-24 z-10 bg-gradient-to-r from-[black] to-transparent" />

        <div className="flex items-center mb-4">
          <TestimonialList
            managerMap={managerMap}
            reverse={true}
            list={leagueTransactions}
            duration={125}
          />
          <TestimonialList
            managerMap={managerMap}
            reverse={true}
            list={leagueTransactions}
            duration={125}
          />
          <TestimonialList
            managerMap={managerMap}
            reverse={true}
            list={leagueTransactions}
            duration={125}
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

        <div className="absolute top-0 bottom-0 right-0 w-24 z-10 bg-gradient-to-l from-[black] to-transparent" />
      </div>
    </div>
  );
};

const tradeInfoObj: TradeInfo = {};
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
}: {
  list: string[];
  reverse: boolean;
  duration: number;
  managerMap: ScheduleData;
}) => {
  return (
    <motion.div
      initial={{ translateX: reverse ? "-100%" : "0%" }}
      animate={{ translateX: reverse ? "0%" : "-100%" }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
      className="flex gap-4 px-2"
    >
      {list.map((transaction) => {
        if (transaction.status === "complete" && transaction.type === "trade") {
          console.log(transaction.type);
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
            tradeInfoObj[transaction.transaction_id].forEach((manager) => {
              if (transaction.adds[key] === manager.roster_id) {
                //manager.players_recieved= key;
              }
            });
          }
        }
        console.log("tradeInfoObj", tradeInfoObj);

        return (
          <div
            key={transaction.id}
            className="shrink-0 w-[500px] flex justify-center rounded-lg overflow-hidden relative bg-[green]"
          >
            <div>
              <div className="bg-[#af1222] text-slate-50 p-4">
                <span className="block font-semibold text-lg mb-1">
                  {`${transaction.type}   :    ${transaction.status}`}
                </span>
              </div>

              <div className="teams flex justify-between bg-[purple] w-[25vw]">
                <div className="team1 flex flex-col">
                  <p className="border-b-2 border-black text-center">Kabo</p>
                  <div>
                    <span className="flex items-center">
                      <LuUserPlus />
                    </span>

                    <span className="flex items-center">
                      <LuUserPlus /> Mahomes
                    </span>
                  </div>
                </div>
                <div className="team2 flex flex-col">
                  <p className="border-b-2 border-black text-center">FG</p>
                  <div>
                    <span className="flex items-center">
                      <LuUserPlus /> Mahomes
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* <Image
                src={scaryimran}
                className="w-[60px] h-[60px] object-cover"
              /> */}

            <span className="text-7xl absolute top-2 right-2 text-[black]">
              "
            </span>
          </div>
        );
      })}
    </motion.div>
  );
};

export default ScrollingTestimonials;
