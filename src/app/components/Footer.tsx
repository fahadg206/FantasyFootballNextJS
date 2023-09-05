"use client";
import React from "react";
import background from "../images/holy.jpeg";
import Link from "next/link";
import { Divider } from "@nextui-org/react";
import { Button } from "@nextui-org/button";

const Footer = () => {
  if (
    typeof localStorage !== "undefined" &&
    localStorage.getItem("selectedLeagueID")
  ) {
    return (
      <div className="flex flex-col justify-center items-center border-t-[1px] border-opacity-20 border-[#af1222] mt-10  rounded-xl">
        <div className="flex flex-wrap h-5 items-center justify-center space-x-4 text-[15px] mt-5">
          <Link href={`/league/${localStorage.getItem("selectedLeagueID")}`}>
            <div className="hover:bg-[#AF1222] hover:transition  hover:ease-in-out hover:rounded cursor-pointer">
              Home
            </div>
          </Link>
          <Divider orientation="vertical" />
          <Link
            href={`/league/${localStorage.getItem(
              "selectedLeagueID"
            )}/articles`}
          >
            <div className="hover:bg-[#AF1222] hover:transition  hover:ease-in-out hover:rounded cursor-pointer">
              Articles
            </div>
          </Link>
          <Divider orientation="vertical" />
          <Link
            href={`/league/${localStorage.getItem("selectedLeagueID")}/rivalry`}
          >
            <div className="hover:bg-[#AF1222] hover:transition  hover:ease-in-out hover:rounded cursor-pointer">
              Rivalry
            </div>
          </Link>
          <Divider orientation="vertical" />
          <Link
            href={`/league/${localStorage.getItem(
              "selectedLeagueID"
            )}/schedule`}
          >
            <div className="hover:bg-[#AF1222] hover:transition  hover:ease-in-out hover:rounded cursor-pointer">
              Schedule
            </div>
          </Link>
          <Divider orientation="vertical" />
          <Link
            href={`/league/${localStorage.getItem(
              "selectedLeagueID"
            )}/standings`}
          >
            <div className="hover:bg-[#AF1222] hover:transition  hover:ease-in-out hover:rounded cursor-pointer">
              Standings
            </div>
          </Link>
          <Divider orientation="vertical" />
          <Link
            href={`/league/${localStorage.getItem(
              "selectedLeagueID"
            )}/leaguemanagers`}
          >
            <div className="hover:bg-[#AF1222] hover:transition  hover:ease-in-out hover:rounded cursor-pointer">
              League Managers
            </div>
          </Link>
          <Link
            href={`/league/${localStorage.getItem("selectedLeagueID")}/about`}
          >
            <div className="hover:bg-[#AF1222] hover:transition  hover:ease-in-out hover:rounded cursor-pointer">
              About
            </div>
          </Link>
          <Link href={`https://www.sleeper.com`} target="_blank">
            <div className="hover:bg-[#AF1222] hover:transition  hover:ease-in-out hover:rounded cursor-pointer">
              Sleeper
            </div>
          </Link>
        </div>
        <div className="space-y-1 mb-10 flex flex-col items-center text-[14px]">
          <Divider className="my-4" />
          <p>
            © 2023{" "}
            <Link
              className="underline text-[#af1222]"
              href={"https://github.com/fahadg206/FantasyPulse"}
              target="_blank"
            >
              Fantasy Pulse
            </Link>
          </p>
          <h4 className="text-medium font-medium">
            Built by{" "}
            <Link
              className="underline text-[#af1222]"
              href={"https://www.linkedin.com/in/fahadguled/"}
              target="_blank"
            >
              Fahad Guled
            </Link>{" "}
            &{" "}
            <Link
              className="underline text-[#af1222]"
              href={"https://www.linkedin.com/in/mahadf/"}
              target="_blank"
            >
              Mahad Fahiye
            </Link>
          </h4>
          <p className="text-small text-default-400 text-center">
            Love Fantasy Pulse? Please consider{" "}
            <Link
              className="underline text-[#af1222]"
              href={"https://www.patreon.com/FantasyPulse"}
              target="_blank"
            >
              donating
            </Link>{" "}
            to support enhancements or just to say thank you!
          </p>
        </div>
      </div>
    );
  } else return <div>{""}</div>;
};
export default Footer;
