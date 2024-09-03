"use client";
import React, { useEffect, useState } from "react";
import ScrollingTestimonials from "../../components/ScrollingTestimonials";
import ScrollingTeamLogos from "../../components/ScrollingTeamLogos";
import HomeCarousel from "../../components/HomeCarousel";
import ArticleCarousel from "../../components/ArticleCarousel";
import HomePoll from "../../components/HomePoll";
import axios from "axios";
import Image from "next/image";
import helmet from "../../images/helmet2.png";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [leagueInfo, setLeagueInfo] = useState({});
  const [playersData, setPlayersData] = useState([]);
  const [leagueID, setLeagueID] = useState<string | null>(null);

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      const selectedLeagueID = localStorage.getItem("selectedLeagueID");
      setLeagueID(selectedLeagueID);
    }
  }, []);

  const getLeagueInfo = async () => {
    if (leagueID) {
      const response = await axios.get(
        `https://api.sleeper.app/v1/league/${leagueID}`
      );
      setLeagueInfo(response.data);
    }
  };

  useEffect(() => {
    getLeagueInfo();
  }, [leagueID]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (leagueID) {
          const playersResponse = await fetch("/api/fetchPlayers", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ leagueId: leagueID }),
          });
          const playersData = await playersResponse.json();
          setPlayersData(playersData);
        }
      } catch (error) {
        console.error("Error while fetching players data:", error);
      }
    };

    fetchData();
  }, [leagueID]);

  let player = {};

  if (playersData["4017"]) {
    player = {
      fn: playersData["4017"].fn,
      ln: playersData["4017"].ln,
      pos: playersData["4017"].pos,
      avatar: `https://sleepercdn.com/content/nfl/players/thumb/4017.jpg`,
    };
  }

  return (
    <div className="container mx-auto px-4 lg:ml-20">
      <div className="flex flex-col items-center justify-center text-lg md:text-2xl font-semibold w-full dark:text-slate-50 my-4">
        <div className="flex items-center justify-center">
          <Image
            src={
              !leagueInfo.avatar
                ? helmet
                : `https://sleepercdn.com/avatars/thumbs/${leagueInfo.avatar}`
            }
            alt="league-image"
            width={45}
            height={45}
            className="rounded-full mr-1"
          />
        </div>
        <div className="text-center text-[15px] sm:text-[18px] font-bold">
          {`Welcome to ${
            typeof localStorage !== "undefined"
              ? localStorage.getItem("selectedLeagueName")
              : ""
          }!`}
        </div>
      </div>
      <div className="my-2 xl:my-5">
        <HomeCarousel leagueID={leagueID} />
      </div>
      <div className="flex flex-col xl:flex-col 2xl:flex-row justify-start items-start gap-4 my-2 xl:my-5">
        <div className="w-full 2xl:w-1/2 flex justify-center xl:justify-start mr-16">
          <ArticleCarousel leagueID={leagueID} />
        </div>
        <div className="w-full 2xl:w-1/2 flex justify-center xl:justify-start xl:items-center mt-10 xl:ml-10">
          <HomePoll />
        </div>
      </div>
      <ScrollingTestimonials />
      <ScrollingTeamLogos />
    </div>
  );
}
