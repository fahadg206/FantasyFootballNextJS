"use client";
import { motion } from "framer-motion";
import axios from "axios";
import { useState, useEffect } from "react";
import Image from "next/image";
import getMatchupData from "../libs/getMatchupData";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { user } from "@nextui-org/react";

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
  fn?: string;
  ln?: string;
  avatar?: string;
  points?: string;
  proj?: string;
}

const ScrollingTeamLogos = () => {
  const [userData, setUserData] = useState<ScheduleData>();
  const router = useRouter();

  const REACT_APP_LEAGUE_ID = localStorage.getItem("selectedLeagueID");

  //console.log("users", users);

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getMatchupData(REACT_APP_LEAGUE_ID, 1);
      setUserData(userData.updatedScheduleData);
    };

    fetchData();
  }, []);

  //console.log(userData);

  const userDataArray = Object.values(userData || {});

  const TranslateWrapper = ({
    children,
    reverse,
  }: {
    children: ReactNode;
    reverse: boolean;
  }) => {
    return (
      <motion.div
        initial={{ translateX: reverse ? "-100%" : "0%" }}
        animate={{ translateX: reverse ? "0%" : "-100%" }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="flex gap-4 px-2"
      >
        {children}
      </motion.div>
    );
  };

  const LogoItem = ({ avatar, name }: { avatar: string; name: string }) => {
    return (
      <div className="w-16 md:w-24 h-24 flex flex-col justify-center items-center rounded-xl hover:bg-[#797777] dark:hover:bg-[#1a1a1a] text-[#white] transition-colors">
        <Image
          src={avatar}
          alt="avatar"
          width={50}
          height={50}
          className="text-4xl md:text-5xl mb-2 rounded-full"
        />
        <p className="text-[10px] font-bold">{name}</p>
      </div>
    );
  };

  const LogoItemsTop = () => (
    <>
      {userDataArray.map((user, index) => (
        <button
          key={index}
          onClick={() => {
            localStorage.setItem(
              "selectedManager",
              user.user_id ?? "UserID doesn't exist"
            );
            router.push(
              `/league/${localStorage.getItem(
                "selectedLeagueID"
              )}/leaguemanagers`
            );
            router.refresh();
          }}
        >
          <LogoItem key={index} avatar={user.avatar ?? ""} name={user.name} />
        </button>
      ))}
    </>
  );

  const LogoItemsBottom = () => (
    <>
      {userDataArray.map((user, index) => (
        <button
          key={index}
          onClick={() => {
            localStorage.setItem(
              "selectedManager",
              user.user_id ?? "UserID doesn't exist"
            );
            router.push(
              `/league/${localStorage.getItem(
                "selectedLeagueID"
              )}/leaguemanagers`
            );
            router.refresh();
          }}
        >
          <LogoItem key={index} avatar={user.avatar ?? ""} name={user.name} />
        </button>
      ))}
    </>
  );
  return (
    <section className="bg-[#EDEDED] dark:bg-[black] py-4 w-[95vw] xl:w-[60vw]">
      <div className="flex  overflow-hidden">
        <TranslateWrapper reverse={false}>
          <LogoItemsTop />
        </TranslateWrapper>
        <TranslateWrapper reverse={false}>
          <LogoItemsTop />
        </TranslateWrapper>
        <TranslateWrapper reverse={false}>
          <LogoItemsTop />
        </TranslateWrapper>
      </div>
      <div className="flex overflow-hidden mt-4">
        <TranslateWrapper reverse>
          <LogoItemsBottom />
        </TranslateWrapper>
        <TranslateWrapper reverse>
          <LogoItemsBottom />
        </TranslateWrapper>
        <TranslateWrapper reverse>
          <LogoItemsBottom />
        </TranslateWrapper>
      </div>
    </section>
  );
};

export default ScrollingTeamLogos;
