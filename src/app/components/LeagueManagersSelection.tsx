"use client";

import { FiMonitor, FiSave, FiSearch } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import getMatchupMap from "../libs/getMatchupData";
import { useSelectedManager } from "../context/SelectedManagerContext";

import axios from "axios";
import Image from "next/image";

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
    Feature?: (arg: any) => JSX.Element;
  };
}

interface Starter {
  fname?: string;
  lname?: string;
  avatar?: string;
  scored_points?: string;
  projected_points?: string;
  position: string;
}

interface ManagerInfo {
  [userId: string]: {
    avatar?: string;
    name?: string;
    roster_id?: string;
    user_id?: string;
    starters?: string[];
    team_points_for_dec?: string;
    team_points_against_dec?: string;
    team_points_for?: string;
    team_points_against?: string;
    wins?: string;
    losses?: string;
  };
}

interface TabsProps {
  selected: number;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
}

interface TabProps {
  selected: number;
  avatar: string;
  name: string;
  setSelected: (value: number) => void;
  tabNum: number;
  selectedManager: string;
}

const TabsFeatures = () => {
  const [selected, setSelected] = useState(0);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [managerInfo, setManagerInfo] = useState<ManagerInfo>({});
  const { selectedManagerr, setSelectedManagerr } = useSelectedManager();
  const [matchupMap, setMatchupMap] = useState<Map<string, MatchupMapData[]>>(
    new Map()
  );
  const [userData, setUserData] = useState<ScheduleData>();
  const [playersData, setPlayersData] = useState([]);
  const REACT_APP_LEAGUE_ID: string | null =
    localStorage.getItem("selectedLeagueID");

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

  const fetchData = async () => {
    try {
      const rostersData = await getRoster();
      const newManagerInfo: ManagerInfo = {};

      // Update the newManagerInfo map with roster data
      for (const roster of rostersData) {
        newManagerInfo[roster.owner_id] = {
          roster_id: roster.roster_id,
          starters: roster.starters,
          team_points_for_dec: roster.settings.fpts_decimal,
          team_points_for: roster.settings.fpts,
          team_points_against_dec: roster.settings.fpts_against_decimal,
          team_points_against: roster.settings.fpts_against,
          wins: roster.settings.wins,
          losses: roster.settings.losses,
        };
      }

      //console.log(newManagerInfo);
      setManagerInfo(newManagerInfo);

      const matchupMapData = await getMatchupMap(REACT_APP_LEAGUE_ID, 1);
      setUserData(matchupMapData.updatedScheduleData as ScheduleData);
      setMatchupMap(matchupMapData.matchupMap);
      setSelectedManager(localStorage.getItem("selectedManager"));
    } catch (error) {
      console.error("Error while fetching data:", error);
    }
  };

  useEffect(() => {
    if (REACT_APP_LEAGUE_ID) {
      fetchData();
    }
  }, [REACT_APP_LEAGUE_ID]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/fetchPlayers", {
          method: "POST",
          body: "REACT_APP_LEAGUE_ID",
        });
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

  //console.log("Manager Info:", managerInfo);

  //console.log(matchupMap);
  // Convert the userData object into an array of objects

  //console.log("sdhf", userData);
  const userDataArray = Object.values(userData || {}).map((user) => ({
    ...user,
    Feature: () => <ExampleFeature />,
  }));

  const ExampleFeature = () => (
    <div className="w-full px-0 py-8 md:px-8">
      <div className="flex flex-col  relative items-center justify-center h-96 w-full rounded-xl shadow-xl shadow-[#af1222] overflow-x-scroll ">
        <div className="flex w-full gap-1.5 absolute top-0 rounded-t-xl bg-[#A29F9F] dark:bg-[#1a1a1a] p-3 items-center">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <p className="w-full text-center text-xl font-bold">Starters</p>
        </div>

        <div className="flex flex-wrap relative top-5 items-center justify-center w-[90%] h-[90%] text-[20px] ">
          {userDataArray[selected].starters_full_data?.map((starter) => {
            if (Object.keys(starter).length > 0) {
              const playerName =
                starter.fname?.charAt(0) + ". " + starter.lname;
              const points = starter.scored_points;

              // Calculate the length of the player name and points
              const playerNameLength = playerName.length;

              // Convert points to a string if it's a number
              const pointsLength =
                points != null ? points.toString().length : 0;

              const totalContentLength = playerNameLength + pointsLength;

              // Calculate the scale factor based on content length
              const scaleFactor = Math.min(1, 100 / totalContentLength);

              // Calculate adjusted font size and image size
              const fontSize = scaleFactor * 7 + "px";
              let imageSize = scaleFactor * 2 * 100;
              if (starter.position === "DEF") {
                imageSize = scaleFactor * 55;
              }

              const colorObj: { [key: string]: string } = {
                QB: "text-[11px] text-[#DE3449] font-bold w-full text-center overflow-hidden",
                RB: "text-[11px] text-[#00CEB8] font-bold w-full text-center overflow-hidden",
                WR: "text-[11px] text-[#588EBA] font-bold w-full text-center overflow-hidden",
                TE: "text-[11px] text-[#F1AE58] font-bold w-full text-center overflow-hidden",
                DEF: "text-[11px] text-[#798898] font-bold w-full text-center overflow-hidden",
                K: "text-[11px] text-[#BD66FF] font-bold w-full text-center overflow-hidden",
              };

              return (
                <div
                  className="player flex flex-col justify-center items-center p-2 w-[100px] h-[100px]  md:w-[140px] md:h-[140px]  hover:scale-105 hover:duration-200 cursor-pointer"
                  style={{ fontSize }}
                >
                  <Image
                    src={starter?.avatar ?? ""}
                    alt="player"
                    width={imageSize}
                    height={imageSize}
                    className="rounded-full"
                  />

                  <p className="text-[10px]  w-full text-center overflow-hidden">
                    {playerName}
                  </p>
                  <p className={colorObj[starter.position]}>
                    {starter.position}
                  </p>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );

  const Tabs = ({ selected, setSelected }: TabsProps) => {
    return (
      <div className="flex overflow-x-scroll">
        {userDataArray.map((user, index) => {
          if (user.user_id === selectedManager) {
            setSelected(index);
          }

          return (
            <Tab
              key={index}
              setSelected={setSelected}
              selected={selected === index}
              avatar={user.avatar ?? ""}
              name={user.name}
              tabNum={index}
              selectedManager={user.user_id ?? ""}
            />
          );
        })}
      </div>
    );
  };

  const Tab = ({
    selected,
    avatar,
    name,
    setSelected,
    tabNum,
    selectedManager,
  }: TabProps) => {
    return (
      <div className="relative w-full">
        <button
          onClick={() => {
            //console.log(tabNum);
            localStorage.setItem("selectedManager", selectedManager);
            setSelectedManager(selectedManager);
            setSelectedManagerr(selectedManager);
            setSelected(tabNum);
          }}
          className="relative z-0  w-full  gap-2 border-b-4 border-[#1a1a1a] p-3  transition-colors hover:bg-[#A29F9F] dark:hover:bg-[#1a1a1a] hover:rounded-2xl items-center justify-center flex flex-col"
        >
          <span
            className={`rounded-full  text-white shadow-[#af1222] transition-all duration-300 ${
              selected
                ? "scale-100 opacity-100 shadow-lg"
                : "scale-90 opacity-50 shadow"
            }`}
          >
            <Image
              src={avatar}
              alt="avatar"
              width={50}
              height={50}
              className="rounded-full"
            />
          </span>
          <span
            className={`min-w-[150px] max-w-[200px] text-xs  transition-opacity md:text-center ${
              selected ? "opacity-100" : "opacity-50"
            }`}
          >
            {name}
          </span>
        </button>
        {selected && (
          <motion.span
            layoutId="tabs-features-underline"
            className="absolute bottom-0 left-0 right-0 z-10 h-1 bg-[#af1222]"
          />
        )}
      </div>
    );
  };
  return (
    <section className="p-4 w-[95vw] xl:w-[60vw]">
      <div className="mx-auto max-w-5xl">
        <Tabs selected={selected} setSelected={setSelected} />

        <AnimatePresence mode="wait">
          {userDataArray.map((user, index) => {
            return selected === index ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                key={index}
              >
                <>
                  <div className="w-full flex flex-col justify-center items-center text-xl font-bold mt-3">
                    <div className="flex items-center">
                      <Image
                        className="mr-2 rounded-full"
                        src={user.avatar}
                        width={40}
                        height={40}
                      />
                      {user.name}
                    </div>
                    {user.user_id && managerInfo[user.user_id] && (
                      <p className="text-lg">{`${
                        managerInfo[user.user_id]?.wins
                      }-${managerInfo[user.user_id]?.losses}`}</p>
                    )}
                  </div>
                  {user.Feature && user.Feature()}
                </>
              </motion.div>
            ) : undefined;
          })}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default TabsFeatures;
