"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { IoPulseSharp } from "react-icons/io5";
import Logo from "../../../images/Transparent.png";

import { FiAward, FiChevronDown, FiChevronUp } from "react-icons/fi";
import axios from "axios";
import { useRouter } from "next/navigation";
import helmet from "../../../images/helmet2.png";

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
    streak?: string;
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

const Page = () => {
  const [managerInfo, setManagerInfo] = useState<ManagerInfo>({});
  const [sortedTeamDataFinal, setSortedTeamDataFinal] =
    useState<SortedTeamData>([]);
  const selectedLeagueID = localStorage.getItem("selectedLeagueID");
  const router = useRouter();

  if (typeof localStorage !== "undefined") {
    if (
      localStorage.getItem("selectedLeagueID") === null ||
      localStorage.getItem("selectedLeagueID") === undefined
    ) {
      router.push("/");
    }
  }

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

        const usersWithRoster = usersData.filter((user) =>
          rostersData.some((roster) => roster.owner_id === user.user_id)
        );

        const managerInfo: ManagerInfo = {};

        for (const user of usersWithRoster) {
          managerInfo[user.user_id] = {
            avatar: user.avatar
              ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}`
              : helmet,
            name: user.display_name,
            user_id: user.user_id,
          };
        }

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
              roster.settings.fpts_against || "0";
            managerInfo[roster.owner_id].wins = roster.settings.wins;
            managerInfo[roster.owner_id].losses = roster.settings.losses;

            if (roster.metadata && roster.metadata.streak) {
              managerInfo[roster.owner_id].streak = roster.metadata.streak;
            }
          }
        }

        setManagerInfo(managerInfo);
        const teamArray = Object.entries(managerInfo);
        const sortedTeamData = teamArray
          .sort((a, b) => {
            const bPoints =
              (parseFloat(b[1].team_points_for || "0") || 0) +
              (parseFloat(b[1].team_points_for_dec || "0") || 0) / 100;
            const aPoints =
              (parseFloat(a[1].team_points_for || "0") || 0) +
              (parseFloat(a[1].team_points_for_dec || "0") || 0) / 100;
            return bPoints - aPoints;
          })
          .sort((a, b) => {
            const winsA = parseInt(a[1].wins || "0");
            const winsB = parseInt(b[1].wins || "0");
            return winsB - winsA;
          });

        setSortedTeamDataFinal(sortedTeamData ? sortedTeamData : teamArray);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedLeagueID]);

  const Table = () => {
    return (
      <div className="w-[90vw] xl:w-[60vw]  shadow-lg rounded-lg overflow-x-scroll border-[1px] dark:border-[#1a1a1a] ">
        <table className="w-full">
          <thead>
            <tr className="border-b-[1px] border-[#1a1a1a]  text-sm ">
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
              <th className="text-start p-4 font-medium text-[11px] md:text-[16px]">
                Streak
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

  const TableRows: React.FC<{ user: ManagerInfo[string]; index: number }> = ({
    user,
    index,
  }) => {
    const rankOrdinal = numberToOrdinal(index + 1);

    return (
      <motion.tr
        layoutId={`row-${user.user_id}`}
        className=" border-[1px] dark:border-[#1a1a1a]"
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
            <span className="block text-xs "></span>
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
          {user.team_points_for !== undefined
            ? parseFloat(user.team_points_for) +
              (user.team_points_for_dec !== undefined
                ? parseFloat(user.team_points_for_dec) / 100
                : 0)
            : ""}
        </td>
        <td className="p-4">
          {user.team_points_against !== undefined
            ? parseFloat(user.team_points_against) +
              (user.team_points_against_dec !== undefined
                ? parseFloat(user.team_points_against_dec) / 100
                : 0)
            : ""}
        </td>
        <td className="p-4 font-medium ">
          {user.streak !== undefined ? (
            <span className="flex items-center">
              {user.streak.slice(0, -1)}

              <p
                className={`p-1 font-bold ${
                  user.streak.slice(-1) === "L" ? "text-[red]" : "text-[green]"
                }`}
              >
                {user.streak.slice(-1)}
              </p>
            </span>
          ) : (
            ""
          )}
        </td>
      </motion.tr>
    );
  };

  return (
    <div className="w-[90vw] xl:w-[60vw] ">
      <h2 className="text-md xl:text-xl flex justify-center text-center font-bold  mb-2">{`${localStorage.getItem(
        "selectedLeagueName"
      )} Overall Standings`}</h2>
      <Table />
    </div>
  );
};

export default Page;

const numberToOrdinal = (n: number) => {
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
