"use client";
import React, { useEffect, useState } from "react";
import ScrollingTestimonials from "../../components/ScrollingTestimonials";
import ScrollingTeamLogos from "../../components/ScrollingTeamLogos";
import HomeCarousel from "../../components/HomeCarousel";
import HomePoll from "../../components/HomePoll";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [leagueInfo, setLeagueInfo] = useState({});
  const [playersData, setPlayersData] = useState([]);
  const leagueID = localStorage.getItem("selectedLeagueID");

  const getLeagueInfo = async () => {
    const response = await axios.get(
      `https://api.sleeper.app/v1/league/${leagueID}`
    );
    setLeagueInfo(response.data);
  };

  useEffect(() => {
    getLeagueInfo();
  }, []);

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

  console.log(leagueInfo);
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
    <div>
      <div className=" px-4">
        <div className="dark:text-slate-50 text-lg md:text-2xl font-semibold flex items-center justify-center w-full">
          <div>
            <Image
              src={`https://sleepercdn.com/avatars/thumbs/${leagueInfo.avatar}`}
              alt="league-image"
              width={45}
              height={45}
              className="rounded-full mr-2"
            />
          </div>
          <div>{`Welcome to ${localStorage.getItem(
            "selectedLeagueName"
          )}!`}</div>
        </div>
      </div>
      <div className="mb-2 xl:mb-5">
        <HomeCarousel />
      </div>
      <HomePoll />
      <ScrollingTestimonials />
      <ScrollingTeamLogos />
    </div>
  );
}
