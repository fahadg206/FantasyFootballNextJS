"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import Image from "next/image";
import { FaSearch, FaPlus, FaTrash } from "react-icons/fa";
import logo from "../../../images/helmet2.png";
import { useRouter } from "next/navigation";

const teamColors = {
  BAL: "#241773",
  ATL: "#000000",
  DEN: "#FB4F14",
  HOU: "#03202F",
  NO: "#D3BC8D",
  CLE: "#311D00",
  CIN: "#FB4E14",
  WAS: "#5A1414",
  LV: "#A6ACAF",
  PIT: "#000000",
  DAL: "#002244",
  SEA: "#69BE28",
  SF: "#B3995D",
  ARI: "#972240",
  LAR: "#003594",
  TB: "#D50A0A",
  CAR: "#0085CA",
  GB: "#FFB612",
  DET: "#0076B6",
  MIN: "#4F2683",
  CHI: "#0B162A",
  BUF: "#00338D",
  NE: "#002244",
  MIA: "#008E97",
  IND: "#002C5F",
  JAC: "#006778",
  TEN: "#002244",
  NYJ: "#125740",
  NYG: "#0B2265",
  PHI: "#004C54",
  KC: "#E31837",
  LAC: "#002244",
  FA: "",
};

const TradeCalculator = () => {
  const [selected, setSelected] = useState("Select Team");
  const [selected2, setSelected2] = useState("Select Team");
  const [users, setUsers] = useState([]);
  const [playersData, setPlayersData] = useState({});
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [team1Trade, setTeam1Trade] = useState([]);
  const [team2Trade, setTeam2Trade] = useState([]);

  const REACT_APP_LEAGUE_ID =
    localStorage.getItem("selectedLeagueID") || "1003413138751987712";

  const router = useRouter();

  useEffect(() => {
    if (
      typeof localStorage !== "undefined" &&
      (localStorage.getItem("selectedLeagueID") === null ||
        localStorage.getItem("selectedLeagueID") === undefined)
    ) {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    fetchUsers();
    fetchPlayersData();
  }, []);

  useEffect(() => {
    if (selected !== "Select Team" && selected2 !== "Select Team") {
      fetchTeamsData();
    }
  }, [selected, selected2]);

  const fetchUsers = async () => {
    try {
      const users_response = await axios.get(
        `https://api.sleeper.app/v1/league/${REACT_APP_LEAGUE_ID}/users`
      );
      const usersData = processUsers(users_response.data);
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchPlayersData = async () => {
    try {
      const playersResponse = await fetch("/api/fetchPlayers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: REACT_APP_LEAGUE_ID,
      });
      const data = await playersResponse.json();
      setPlayersData(data);
    } catch (error) {
      console.error("Error fetching players data:", error);
    }
  };

  const fetchTeamsData = async () => {
    try {
      const rosters_response = await axios.get(
        `https://api.sleeper.app/v1/league/${REACT_APP_LEAGUE_ID}/rosters`
      );
      const rosters = rosters_response.data;

      const team1 = rosters.find((roster) => roster.owner_id === selected);
      const team2 = rosters.find((roster) => roster.owner_id === selected2);

      if (team1) {
        setTeam1Players(team1.players);
      }
      if (team2) {
        setTeam2Players(team2.players);
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
    }
  };

  const handleSelectionChange = (selection) => {
    if (selection.currentKey !== selected2) {
      setSelected(selection.currentKey);
      setTeam1Trade([]);
      setTeam2Trade([]);
    }
  };

  const handleSelectionChange2 = (selection) => {
    if (selection.currentKey !== selected) {
      setSelected2(selection.currentKey);
      setTeam1Trade([]);
      setTeam2Trade([]);
    }
  };

  const processUsers = (rawUsers) => {
    return rawUsers.map((user) => ({
      managerID: user.user_id,
      userName: user.display_name,
      avatar: user.avatar
        ? `https://sleepercdn.com/avatars/${user.avatar}`
        : "",
    }));
  };

  const handlePlayerClick = (team, playerId) => {
    const player = playersData[playerId];
    if (!player) return;

    const playerWithId = { ...player, id: playerId };

    if (team === 1) {
      setTeam1Trade([...team1Trade, playerWithId]);
      setTeam1Players(team1Players.filter((id) => id !== playerId));
    } else {
      setTeam2Trade([...team2Trade, playerWithId]);
      setTeam2Players(team2Players.filter((id) => id !== playerId));
    }
  };

  const handlePlayerRemove = (team, playerId) => {
    if (team === 1) {
      const removedPlayer = team1Trade.find((player) => player.id === playerId);
      setTeam1Trade(team1Trade.filter((player) => player.id !== playerId));
      setTeam1Players([...team1Players, removedPlayer.id]);
    } else {
      const removedPlayer = team2Trade.find((player) => player.id === playerId);
      setTeam2Trade(team2Trade.filter((player) => player.id !== playerId));
      setTeam2Players([...team2Players, removedPlayer.id]);
    }
  };

  const clearTrade = () => {
    setTeam1Trade([]);
    setTeam2Trade([]);
  };

  const getTeamColor = (team) => teamColors[team] || "#333";
  const getTeamLogo = (team) =>
    `https://sleepercdn.com/images/team_logos/nfl/${team.toLowerCase()}.png`;

  const renderPlayer = (playerId, team) => {
    const player = playersData[playerId];
    if (!player) return null;

    const teamColor = getTeamColor(player.t);
    const teamLogo = getTeamLogo(player.t);

    return (
      <div
        key={playerId}
        className="relative p-4 rounded-lg cursor-pointer"
        style={{ backgroundColor: teamColor }}
        onClick={() => handlePlayerClick(team, playerId)}
      >
        <div className="absolute inset-0">
          <Image
            src={teamLogo}
            alt={player.team}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="relative flex items-center space-x-4">
          <img
            src={`https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`}
            alt={player.fn}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h3 className="text-lg font-bold">{player.fn}</h3>
            <p>{player.pos}</p>
            <p>{player.t}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderTeamDropdown = (teamPlayers, teamName, team) => (
    <Dropdown className="w-full mb-4 lg:mb-0">
      <DropdownTrigger>
        <Button className="w-full">
          <FaPlus className="mr-2" />
          Add a player from {teamName}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={`${teamName} Players`}
        selectionMode="single"
        onSelectionChange={(selection) =>
          handlePlayerClick(team, selection.currentKey)
        }
        className="max-h-48 overflow-y-auto bg-black bg-opacity-80"
      >
        {teamPlayers.map((playerId) => {
          const player = playersData[playerId];
          if (!player) return null;
          return (
            <DropdownItem key={playerId} value={playerId}>
              <div className="flex items-center space-x-2">
                <img
                  src={`https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`}
                  alt={player.fn}
                  className="w-8 h-8 rounded-full"
                />
                <Image
                  src={getTeamLogo(player.t)}
                  alt={player.t}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <span className="truncate">
                  {player.fn.charAt(0)}. {player.ln} - {player.pos}
                </span>
              </div>
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );

  const renderTrade = (tradePlayers, team) => {
    const user = users.find((u) => u.managerID === team);
    const teamName = user ? user.userName : "";
    const teamAvatar = user ? (user.avatar ? user.avatar : logo) : logo;

    return (
      <div className="w-full lg:w-1/2 bg-gray-700 p-4 rounded-lg mb-4 lg:mb-0">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Image
              src={teamAvatar}
              alt={teamName}
              width={40}
              height={40}
              className="rounded-full"
            />
            <h2 className="text-xl font-bold">{teamName}</h2>
          </div>
          <Button
            className="text-red-500 bg-transparent hover:bg-transparent border-none p-0"
            onClick={clearTrade}
          >
            Clear
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {tradePlayers.map((player) => (
            <div
              key={player.id}
              className="relative p-4 rounded-lg flex group"
              style={{ backgroundColor: getTeamColor(player.t) }}
            >
              <div className="absolute inset-0 opacity-50 z-10">
                <Image
                  src={getTeamLogo(player.t)}
                  alt={player.team}
                  layout="intrinsic"
                  width={106}
                  height={106}
                  objectFit="contain"
                  className="transform translate-x-9"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-l from-black to-transparent opacity-30 rounded-lg z-20"></div>
              <Image
                src={`https://sleepercdn.com/content/nfl/players/thumb/${player.id}.jpg`}
                alt={player.fn}
                height={50}
                width={110}
                className="h-22 transform translate y-4 -m-4 z-30"
              />
              <div className="flex flex-col items-end justify-center ml-auto text-right z-40">
                <h3 className="text-lg font-bold">
                  {player.fn} {player.ln}
                </h3>
                <div className="text-sm">
                  <span>{player.pos} - </span>
                  <span>{player.t}</span>
                </div>
                <div className="flex justify-end space-x-2 text-xs text-gray-200 mt-1">
                  Value: 1738
                </div>
              </div>
              <FaTrash
                className="absolute top-2 right-2 text-gray-500 opacity-0 group-hover:opacity-100 cursor-pointer"
                onClick={() =>
                  handlePlayerRemove(team === selected ? 1 : 2, player.id)
                }
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const selectedUser = users.find((user) => user.managerID === selected);
  const selectedUser2 = users.find((user) => user.managerID === selected2);

  const selectedText = selectedUser ? (
    <div className="flex items-center bg-[rgb(224,223,223)] dark:bg-[#1a1a1a] border-r border-b dark:border-[#1a1a1a] border-[#af1222] border-[1px] text-[15px] w-[180px] font-bold border-opacity-20 rounded-[10px] p-2">
      <Image
        src={selectedUser.avatar ? selectedUser.avatar : logo}
        alt="avatar"
        width={25}
        height={25}
        className="rounded-full mr-1"
      />
      {selectedUser.userName}
    </div>
  ) : (
    <div className="bg-[rgb(224,223,223)] dark:bg-[#1a1a1a] border-r border-b dark:border-[#1a1a1a] border-[#af1222] text-center border-[1px] text-[15px] w-[180px] font-bold border-opacity-20 rounded-[10px] p-2">
      Select Team
    </div>
  );

  const selectedText2 = selectedUser2 ? (
    <div className="flex items-center bg-[rgb(224,223,223)] dark:bg-[#1a1a1a] border-r border-b dark:border-[#1a1a1a] border-[#af1222] border-[1px] text-[15px] w-[180px] font-bold border-opacity-20 rounded-[10px] p-2">
      <Image
        src={selectedUser2.avatar ? selectedUser2.avatar : logo}
        alt="avatar"
        width={25}
        height={25}
        className="rounded-full mr-1"
      />
      {selectedUser2.userName}
    </div>
  ) : (
    <div className="bg-[rgb(224,223,223)] dark:bg-[#1a1a1a] border-r border-b dark:border-[#1a1a1a] border-[#af1222] text-center border-[1px] text-[15px] w-[180px] font-bold border-opacity-20 rounded-[10px] p-2">
      Select Team
    </div>
  );

  return (
    <div className="md:w-[60vw] min-w-full min-h-screen bg-gray-900 text-white p-4">
      <div className="bg-gray-800 rounded-lg shadow-lg">
        <div className="flex justify-between items-center p-4 bg-gray-700 rounded-t-lg">
          <h1 className="text-2xl font-bold">Trade Calculator</h1>
          <div className="text-green-500 text-lg font-semibold">SUCCESS</div>
        </div>
        <div className="flex flex-col lg:flex-row p-4 space-y-4 lg:space-y-0 lg:space-x-4">
          <Dropdown className="w-full lg:w-1/2">
            <DropdownTrigger>
              <Button className="w-full">{selectedText}</Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Teams"
              selectionMode="single"
              selectedKeys={selected}
              onSelectionChange={handleSelectionChange}
              className="max-h-48 overflow-y-auto bg-black bg-opacity-80"
            >
              {users
                .filter((user) => user.managerID !== selected2)
                .map((user) => (
                  <DropdownItem key={user.managerID} value={user.managerID}>
                    <div className="flex items-center">
                      <Image
                        src={user.avatar ? user.avatar : logo}
                        alt="avatar"
                        width={30}
                        height={30}
                        className="rounded-full mr-1"
                      />
                      {user.userName}
                    </div>
                  </DropdownItem>
                ))}
            </DropdownMenu>
          </Dropdown>
          <Dropdown className="w-full lg:w-1/2">
            <DropdownTrigger>
              <Button className="w-full">{selectedText2}</Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Teams"
              selectionMode="single"
              selectedKeys={selected2}
              onSelectionChange={handleSelectionChange2}
              className="max-h-48 overflow-y-auto bg-black bg-opacity-80"
            >
              {users
                .filter((user) => user.managerID !== selected)
                .map((user) => (
                  <DropdownItem key={user.managerID} value={user.managerID}>
                    <div className="flex items-center">
                      <Image
                        src={user.avatar ? user.avatar : logo}
                        alt="avatar"
                        width={30}
                        height={30}
                        className="rounded-full mr-1"
                      />
                      {user.userName}
                    </div>
                  </DropdownItem>
                ))}
            </DropdownMenu>
          </Dropdown>
          <Button
            className="w-full lg:w-auto mt-4 lg:mt-0"
            onClick={fetchTeamsData}
          >
            <FaSearch />
          </Button>
        </div>
        <div
          className={`flex flex-col lg:flex-row p-4 space-y-4 lg:space-y-0 lg:space-x-4 ${
            selected !== "Select Team" && selected2 !== "Select Team"
              ? "w-full"
              : "w-full lg:w-full"
          }`}
        >
          {selected !== "Select Team" && selected2 !== "Select Team" && (
            <>
              {renderTeamDropdown(
                team1Players,
                selectedUser.userName + "'s team",
                1
              )}
              {renderTeamDropdown(
                team2Players,
                selectedUser2.userName + "'s team",
                2
              )}
            </>
          )}
        </div>
        {selected !== "Select Team" && selected2 !== "Select Team" && (
          <div className="flex flex-col lg:flex-row p-4 space-y-4 lg:space-y-0 lg:space-x-4">
            {renderTrade(team1Trade, selected)}
            {renderTrade(team2Trade, selected2)}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeCalculator;
