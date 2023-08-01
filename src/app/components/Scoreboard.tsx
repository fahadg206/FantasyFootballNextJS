"use client";

import React, { useContext, useEffect } from "react";
import Imran from "../images/scary_imran.png";
import Image from "next/image";
import LeagueContext from "../context/LeagueContext";
import SelectedLeagueContext from "../context/SelectedLeagueContext";

export default function Scoreboard() {
  const [context, setContext] = useContext(LeagueContext);
  const [selectedLeagueContext, setSelectedLeagueContext] = useContext(
    SelectedLeagueContext
  );

  const showScoreboard = () => {
    if (selectedLeagueContext.league_id) {
      return (
        <div className=" hidden md:flex justify-center gap-5 mb-2 text-[12px] ">
          <div className="border-r border-[#1a1a1a] p-5  rounded-md  flex flex-col items-start">
            <div className="flex gap-10">
              <span className="flex items-center">
                <Image
                  src={Imran}
                  alt="jkn"
                  height={15}
                  width={15}
                  className="rounded-full"
                />
                <p>Kabo</p>
              </span>
              <p>107.43</p>
            </div>
            <div className="flex gap-10">
              <span className="flex items-center">
                <Image
                  src={Imran}
                  alt="jkn"
                  height={15}
                  width={15}
                  className="rounded-full"
                />
                <p>FG</p>
              </span>
              <p>107.43</p>
            </div>
            <p>O/U: 350.24</p>
          </div>
          <div className="border-r border-[#1a1a1a] p-5  rounded-md  flex flex-col items-center">
            <div className="flex gap-10">
              <span className="flex items-center">
                <Image
                  src={Imran}
                  alt="jkn"
                  height={15}
                  width={15}
                  className="rounded-full"
                />
                <p>Kabo</p>
              </span>
              <p>107.43</p>
            </div>
            <div className="flex gap-10">
              <span className="flex items-center">
                <Image
                  src={Imran}
                  alt="jkn"
                  height={15}
                  width={15}
                  className="rounded-full"
                />
                <p>FG</p>
              </span>
              <p>107.43</p>
            </div>
            <p>O/U: 350.24</p>
          </div>
          <div className="border-r border-[#1a1a1a] p-5  rounded-md  flex flex-col items-center">
            <div className="flex gap-10">
              <span className="flex items-center">
                <Image
                  src={Imran}
                  alt="jkn"
                  height={15}
                  width={15}
                  className="rounded-full"
                />
                <p>Kabo</p>
              </span>
              <p>107.43</p>
            </div>
            <div className="flex gap-10">
              <span className="flex items-center">
                <Image
                  src={Imran}
                  alt="jkn"
                  height={15}
                  width={15}
                  className="rounded-full"
                />
                <p>FG</p>
              </span>
              <p>107.43</p>
            </div>
            <p>O/U: 350.24</p>
          </div>
          <div className="border-r border-[#1a1a1a] p-5  rounded-md  flex flex-col items-center">
            <div className="flex gap-10">
              <span className="flex items-center">
                <Image
                  src={Imran}
                  alt="jkn"
                  height={15}
                  width={15}
                  className="rounded-full"
                />
                <p>Kabo</p>
              </span>
              <p>107.43</p>
            </div>
            <div className="flex gap-10">
              <span className="flex items-center">
                <Image
                  src={Imran}
                  alt="jkn"
                  height={15}
                  width={15}
                  className="rounded-full"
                />
                <p>FG</p>
              </span>
              <p>107.43</p>
            </div>
            <p>O/U: 350.24</p>
          </div>
          <div className="border-r border-[#1a1a1a] p-5  rounded-md  flex flex-col items-center">
            <div className="flex gap-10">
              <span className="flex items-center">
                <Image
                  src={Imran}
                  alt="jkn"
                  height={15}
                  width={15}
                  className="rounded-full"
                />
                <p>Kabo</p>
              </span>
              <p>107.43</p>
            </div>
            <div className="flex gap-10">
              <span className="flex items-center">
                <Image
                  src={Imran}
                  alt="jkn"
                  height={15}
                  width={15}
                  className="rounded-full"
                />
                <p>FG</p>
              </span>
              <p>107.43</p>
            </div>
            <p>O/U: 350.24</p>
          </div>
          <div className="border-r border-[#1a1a1a] p-5  rounded-md  flex flex-col items-center">
            <div className="flex gap-10">
              <span className="flex items-center">
                <Image
                  src={Imran}
                  alt="jkn"
                  height={15}
                  width={15}
                  className="rounded-full"
                />
                <p>Kabo</p>
              </span>
              <p>107.43</p>
            </div>
            <div className="flex gap-10">
              <span className="flex items-center">
                <Image
                  src={Imran}
                  alt="jkn"
                  height={15}
                  width={15}
                  className="rounded-full"
                />
                <p>FG</p>
              </span>
              <p>107.43</p>
            </div>
            <p>O/U: 350.24</p>
          </div>
        </div>
      );
    }
  };

  useEffect(() => {
    showScoreboard();
  }, [selectedLeagueContext.league_id]);

  return <div>{showScoreboard()}</div>;
}
