"use client";
import { motion } from "framer-motion";
import {
  SiNike,
  Si3M,
  SiAbstract,
  SiAdobe,
  SiAirtable,
  SiAmazon,
  SiBox,
  SiBytedance,
  SiChase,
  SiCloudbees,
  SiBurton,
  SiBmw,
  SiHeroku,
  SiBuildkite,
  SiCouchbase,
  SiDailymotion,
  SiDeliveroo,
  SiEpicgames,
  SiGenius,
  SiGodaddy,
} from "react-icons/si";
import { IconType } from "react-icons";
import axios from "axios";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const ScrollingTeamLogos = () => {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  const getUsers = async () => {
    const response = await axios.get(
      `https://api.sleeper.app/v1/league/${localStorage.getItem(
        "selectedLeagueID"
      )}/users`
    );

    const modifiedUsers = response.data.map((user) => ({
      ...user,
      avatar: user.avatar, // Assuming the user's avatar URL is available in "avatar_url"
    }));

    setUsers(modifiedUsers);
  };

  //console.log("users", users);

  useEffect(() => {
    getUsers();
  }, []);

  const TranslateWrapper = ({ children, reverse }) => {
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
      <div className="w-16 md:w-24 h-16 md:h-24 flex flex-col justify-center items-center hover:bg-[#1a1a1a] text-[#white] transition-colors">
        <Image
          src={avatar}
          alt="avatar"
          width={50}
          height={50}
          className="text-4xl md:text-5xl mb-2"
        />
        <p className="text-[12px] font-bold">{name}</p>
      </div>
    );
  };

  const LogoItemsTop = () => (
    <>
      {users.map((user, index) => (
        <button
          onClick={() => {
            localStorage.setItem("selectedManager", user.user_id);
            router.push(
              `/league/${localStorage.getItem(
                "selectedLeagueID"
              )}/leaguemanagers`
            );
            router.refresh();
          }}
        >
          <LogoItem
            key={index}
            avatar={`https://sleepercdn.com/avatars/${user.avatar}`}
            name={user.display_name}
          />
        </button>
      ))}
    </>
  );

  const LogoItemsBottom = () => (
    <>
      {users.map((user, index) => (
        <button
          onClick={() => {
            localStorage.setItem("selectedManager", user.user_id);
            router.push(
              `/league/${localStorage.getItem(
                "selectedLeagueID"
              )}/leaguemanagers`
            );
            router.refresh();
          }}
        >
          <LogoItem
            key={index}
            avatar={`https://sleepercdn.com/avatars/${user.avatar}`}
            name={user.display_name}
          />
        </button>
      ))}
    </>
  );
  return (
    <section className="bg-[black] py-4 w-[95vw] xl:w-[60vw]">
      <div className="flex  overflow-hidden">
        <TranslateWrapper>
          <LogoItemsTop />
        </TranslateWrapper>
        <TranslateWrapper>
          <LogoItemsTop />
        </TranslateWrapper>
        <TranslateWrapper>
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
