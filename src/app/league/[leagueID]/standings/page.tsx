"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { IoPulseSharp } from "react-icons/io5";
import Logo from "../../../images/Transparent.png";

import { FiAward, FiChevronDown, FiChevronUp } from "react-icons/fi";
import axios from "axios";

interface ManagerInfo {
  [userId: string]: {
    avatar: string;
    name: string;
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

interface TeamData {
  avatar: string;
  name: string;
  roster_id?: string;
  user_id?: string;
  starters?: string[];
  team_points_for_dec?: string;
  team_points_against_dec?: string;
  team_points_for?: string;
  team_points_against?: string;
  wins?: string;
  losses?: string;
}

type SortedTeamData = [string, TeamData][];

const page = () => {
  const [managerInfo, setManagerInfo] = useState<ManagerInfo>({});
  const [sortedTeamDataFinal, setSortedTeamDataFinal] =
    useState<SortedTeamData>([]);
  const selectedLeagueID = localStorage.getItem("selectedLeagueID");

  console.log("selectedLeagueID:", selectedLeagueID);
  const getUsers = async () => {
    try {
      const response = await axios.get<any>(
        `https://api.sleeper.app/v1/league/${selectedLeagueID}/users`
      );

      return response.data;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get users");
    }
  };

  const getRoster = async () => {
    try {
      const response = await axios.get<any>(
        `https://api.sleeper.app/v1/league/${selectedLeagueID}/rosters`
      );

      return response.data;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get rosters");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await getUsers();

        const rostersData = await getRoster();

        // Create a new map to store the updated schedule data
        const managerInfo: ManagerInfo = {};
        console.log(
          "useEffect triggered with selectedLeagueID:",
          selectedLeagueID
        );
        // Update the managerInfo map with user data
        for (const user of usersData) {
          managerInfo[user.user_id] = {
            avatar: `https://sleepercdn.com/avatars/thumbs/${user.avatar}`,
            name: user.display_name,
            user_id: user.user_id,
          };
        }

        // Update the managerInfo map with roster data
        for (const roster of rostersData) {
          if (managerInfo[roster.owner_id]) {
            managerInfo[roster.owner_id].roster_id = roster.roster_id;

            managerInfo[roster.owner_id].starters = roster.starters;
            managerInfo[roster.owner_id].team_points_for_dec =
              roster.settings.fpts_decimal;
            managerInfo[roster.owner_id].team_points_for = roster.settings.fpts;

            managerInfo[roster.owner_id].team_points_against_dec =
              roster.settings.fpts_against_decimal;
            managerInfo[roster.owner_id].team_points_against =
              roster.settings.fpts_against;
            managerInfo[roster.owner_id].wins = roster.settings.wins;
            managerInfo[roster.owner_id].losses = roster.settings.losses;
          }
        }

        // Set the updated scheduleData map to state
        setManagerInfo(managerInfo);
        const teamArray = Object.entries(managerInfo);
        const sortByWins = [...teamArray].sort((a, b) => b[1].wins - a[1].wins);

        const sortedTeamData = sortByWins.sort((a, b) => {
          if (b[1].wins === a[1].wins) {
            const bPoints =
              parseFloat(b[1].team_points_for as string) +
              parseFloat(b[1].team_points_for_dec as string) / 100;

            const aPoints =
              parseFloat(a[1].team_points_for as string) +
              parseFloat(a[1].team_points_for_dec as string) / 100;

            return bPoints - aPoints;
          }
        });

        setSortedTeamDataFinal(sortedTeamData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedLeagueID]);

  console.log("sorted", sortedTeamDataFinal);

  const Table = () => {
    return (
      <div className="w-[90vw] xl:w-[60vw] bg-black shadow-lg rounded-lg overflow-x-scroll border-[1px] border-[#1a1a1a] ">
        <table className="w-full">
          <thead>
            <tr className="border-b-[1px] border-[#1a1a1a] text-slate-400 text-sm ">
              <th className="text-start p-4 font-medium text-[11px] md:text-[16px]">
                League Manager
              </th>
              <th className="text-start p-4 font-medium text-[11px] md:text-[16px]">
                FP Rank
              </th>
              <th className="text-start p-4 font-medium text-[11px] md:text-[16px]">
                W
              </th>
              <th className="text-start p-4 font-medium text-[11px] md:text-[16px]">
                L
              </th>
              <th className="text-start p-4 font-medium text-[11px] md:text-[16px]">
                PF
              </th>
              <th className="text-start p-4 font-medium text-[11px] md:text-[16px]">
                PA
              </th>
            </tr>
          </thead>

          <tbody className="text-[11px] md:text-[16px]">
            {sortedTeamDataFinal.map(([userId, user], index) => {
              return <TableRows key={userId} user={user} index={index} />;
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const TableRows = ({ user, index }) => {
    const rankOrdinal = numberToOrdinal(index + 1);
    const maxRankOrdinal = numberToOrdinal(user.maxRank);

    return (
      <motion.tr
        layoutId={`row-${user.id}`}
        className="bg-black border-[1px] border-[#1a1a1a]"
      >
        <td className="p-4 flex items-center gap-3 overflow-hidden ">
          <Image
            src={user.avatar}
            alt="Example user photo"
            width={30}
            height={30}
            className=" rounded-full bg-slate-300 object-cover object-top "
          />
          <div>
            <span className="block mb-1 font-medium">{user.name}</span>
            <span className="block text-xs text-slate-500"></span>
          </div>
        </td>

        <td className="p-4">
          <div
            className={`flex items-center gap-2 font-medium ${
              rankOrdinal === "1st" && "text-[#af1222]"
            }`}
          >
            <span>{rankOrdinal}</span>
            {rankOrdinal === "1st" && <FiAward className="text-xl" />}{" "}
          </div>
        </td>

        <td className="p-4 font-medium">{user.wins}</td>
        <td className="p-4 font-medium">{user.losses}</td>

        <td className="p-4">
          {user.team_points_for + user.team_points_for_dec / 100}
        </td>
        <td className="p-4">
          {user.team_points_against + user.team_points_against_dec / 100}
        </td>
      </motion.tr>
    );
  };

  return (
    <div className="w-[90vw] xl:w-[60vw] ">
      <h2 className="text-xl flex justify-center text-center font-bold  mb-2">{`${localStorage.getItem(
        "selectedLeagueName"
      )} Overall Standings`}</h2>
      <Table />
    </div>
  );
};

export default page;

const numberToOrdinal = (n) => {
  let ord = "th";

  if (n % 10 == 1 && n % 100 != 11) {
    ord = "st";
  } else if (n % 10 == 2 && n % 100 != 12) {
    ord = "nd";
  } else if (n % 10 == 3 && n % 100 != 13) {
    ord = "rd";
  }

  return n + ord;
};
