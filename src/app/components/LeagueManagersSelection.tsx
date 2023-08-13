"use client";

import { FiMonitor, FiSave, FiSearch } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import getMatchupMap from "../libs/getMatchupData";
import getUserData from "../libs/getUserData";
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
}
const TabsFeatures = () => {
  const [selected, setSelected] = useState(0);
  const [matchupMap, setMatchupMap] = useState<Map<string, MatchupMapData[]>>(
    new Map()
  );
  const [userData, setUserData] = useState<ScheduleData>();
  const [playersData, setPlayersData] = useState([]);
  const REACT_APP_LEAGUE_ID: string | null =
    localStorage.getItem("selectedLeagueID");

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

  useEffect(() => {
    const fetchData = async () => {
      const matchupMapData = await getMatchupMap(REACT_APP_LEAGUE_ID, 1);
      const userData = await getUserData(REACT_APP_LEAGUE_ID, 1);
      setUserData(userData);
      setMatchupMap(matchupMapData);
    };

    fetchData();
  }, [REACT_APP_LEAGUE_ID]);

  // Convert the userData object into an array of objects

  console.log(matchupMap);

  const ExampleFeature = ({ avatar }) => (
    <div className="w-full px-0 py-8 md:px-8">
      <div className="relative h-96 w-full rounded-xl bg-slate-800 shadow-xl shadow-indigo-300">
        <div className="flex w-full gap-1.5 rounded-t-xl bg-slate-900 p-3">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <div className="space-y-2 p-2">
          <p className="font-mono text-sm text-slate-200">
            <span className="text-green-300">~</span> Replace this with a demo
            of your product 🚀
          </p>
        </div>

        <span className="absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] text-9xl text-slate-700">
          <Image src={avatar} alt="avatar" width={50} height={50} />
        </span>
      </div>
    </div>
  );
  const userDataArray = Object.values(userData || {}).map((user) => ({
    ...user,
    Feature: () => <ExampleFeature avatar={user.avatar} />,
  }));

  const Tabs = ({ selected, setSelected }) => {
    return (
      <div className="flex overflow-x-scroll">
        {userDataArray.map((user, index) => {
          return (
            <Tab
              key={index}
              setSelected={setSelected}
              selected={selected === index}
              avatar={user.avatar}
              name={user.name}
              tabNum={index}
            />
          );
        })}
      </div>
    );
  };

  const Tab = ({ selected, avatar, name, setSelected, tabNum }) => {
    return (
      <div className="relative w-full">
        <button
          onClick={() => setSelected(tabNum)}
          className="relative z-0 flex w-full flex-row items-center justify-center gap-4 border-b-4 border-slate-200 bg-white p-6 transition-colors hover:bg-slate-100 md:flex-col"
        >
          <span
            className={`rounded-lg bg-gradient-to-br from-indigo-700 from-10% to-indigo-500 p-3 text-2xl text-white shadow-indigo-400 transition-all duration-300 ${
              selected
                ? "scale-100 opacity-100 shadow-lg"
                : "scale-90 opacity-50 shadow"
            }`}
          >
            <Image src={avatar} alt="avatar" width={50} height={50} />
          </span>
          <span
            className={`min-w-[150px] max-w-[200px] text-start text-xs text-slate-600 transition-opacity md:text-center ${
              selected ? "opacity-100" : "opacity-50"
            }`}
          >
            {name}
          </span>
        </button>
        {selected && (
          <motion.span
            layoutId="tabs-features-underline"
            className="absolute bottom-0 left-0 right-0 z-10 h-1 bg-indigo-600"
          />
        )}
      </div>
    );
  };
  return (
    <section className="p-4">
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
                <p>{user.name}</p>
                {user.Feature && user.Feature(user.avatar)}
              </motion.div>
            ) : undefined;
          })}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default TabsFeatures;

const FEATURES = [
  {
    title: "Some subtext about this first feature etc",
    Icon: FiSearch,
    Feature: () => <ExampleFeature Icon={FiSearch} />,
  },
  {
    title: "Some further info explaining the second one",
    Icon: FiSave,
    Feature: () => <ExampleFeature Icon={FiSave} />,
  },
  {
    title: "The third features the best though to be honest",
    Icon: FiMonitor,
    Feature: () => <ExampleFeature Icon={FiMonitor} />,
  },
  {
    title: "The third features the best though to be honest",
    Icon: FiMonitor,
    Feature: () => <ExampleFeature Icon={FiMonitor} />,
  },
  {
    title: "The third features the best though to be honest",
    Icon: FiMonitor,
    Feature: () => <ExampleFeature Icon={FiMonitor} />,
  },
  {
    title: "The third features the best though to be honest",
    Icon: FiMonitor,
    Feature: () => <ExampleFeature Icon={FiMonitor} />,
  },
  {
    title: "The third features the best though to be honest",
    Icon: FiMonitor,
    Feature: () => <ExampleFeature Icon={FiMonitor} />,
  },
  {
    title: "The third features the best though to be honest",
    Icon: FiMonitor,
    Feature: () => <ExampleFeature Icon={FiMonitor} />,
  },
  {
    title: "The third features the best though to be honest",
    Icon: FiMonitor,
    Feature: () => <ExampleFeature Icon={FiMonitor} />,
  },
  {
    title: "The third features the best though to be honest",
    Icon: FiMonitor,
    Feature: () => <ExampleFeature Icon={FiMonitor} />,
  },
  {
    title: "The third features the best though to be honest",
    Icon: FiMonitor,
    Feature: () => <ExampleFeature Icon={FiMonitor} />,
  },
  {
    title: "The third features the best though to be honest",
    Icon: FiMonitor,
    Feature: () => <ExampleFeature Icon={FiMonitor} />,
  },
];
