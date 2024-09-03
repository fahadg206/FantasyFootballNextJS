"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaSearch } from "react-icons/fa";
import { Button } from "@nextui-org/button";
import {
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import axios, { AxiosResponse } from "axios";
import HeadToHead from "../../../components/HeadToHead"; // Import the HeadToHead component
import logo from "../../../images/helmet2.png";
import { db, storage } from "../../../firebase";
import { useRouter } from "next/navigation";
import { StaticImageData } from "next/image";
import { ImSad } from "react-icons/im";
import MatchupsImg from "../../../images/matchupsImage.png";
import { HiOutlineArrowSmLeft, HiOutlineArrowSmRight } from "react-icons/hi";

interface NflState {
  season: string;
  display_week: number;
  season_type: string;
}

interface Manager {
  managerID: string;
  name: string;
}

interface RivalsManager {
  managerID: string;
  name: string;
  year: string;
}

interface User {
  managerID: string;
  rosterID: string;
  userName: string;
  avatar: string | StaticImageData;
}

interface LeagueData {
  season: string;
  previous_league_id: string;
  settings: {
    playoff_week_start: number;
  };
}

interface RivalryMatchup {
  week: number;
  year: string;
  matchup: any;
}

interface Rivalry {
  points: {
    one: number;
    two: number;
  };
  wins: {
    one: number;
    two: number;
  };
  ties: number;
  matchups: RivalryMatchup[];
}

const REACT_APP_LEAGUE_ID: string =
  process.env.REACT_APP_LEAGUE_ID || "872659020144656384";

const Matchups = () => {
  const [selected, setSelected] = React.useState(new Set(["Select User"]));
  const [weekCount, setWeekCount] = useState(0);
  const [week, setWeek] = useState<number>();
  const [selected2, setSelected2] = React.useState(new Set(["Select User"]));
  const [playersData, setPlayersData] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState(new Set<User>());
  const [users2, setUsers2] = React.useState(new Set<User>());
  const [rivalry, setRivalry] = React.useState(new Set<Rivalry>());
  const [rivalManagers, setRivalManagers] = React.useState(
    new Set<RivalsManager>()
  );

  const router = useRouter();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(true);

  const startTimer = () => {
    setIsLoading(true);

    // Simulate a 2-second loading animation
    setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2000 milliseconds (2 seconds)
  };

  const getNflState = async (): Promise<NflState> => {
    try {
      const res: AxiosResponse<NflState> = await axios.get<NflState>(
        `https://api.sleeper.app/v1/state/nfl`
      );

      const data: NflState = res.data;
      return data;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get NFL state");
    }
  };

  const getLeagueData = async (
    queryLeagueID: string = REACT_APP_LEAGUE_ID || ""
  ): Promise<LeagueData | null> => {
    try {
      const res = await axios.get<LeagueData>(
        `https://api.sleeper.app/v1/league/${queryLeagueID}`
      );
      const data: LeagueData = res.data;
      return data;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get league data");
    }
  };

  const getRivalryMatchups = async (
    userOneID: string | undefined,
    userTwoID: string | undefined
  ): Promise<Rivalry> => {
    if (!userOneID || !userTwoID) {
      return Promise.reject(new Error("Invalid user IDs"));
    }

    let curLeagueID: string | null = REACT_APP_LEAGUE_ID;
    const nflState: NflState = await getNflState();
    const teamManagers: any = await getLeagueTeamManagers();

    let week = 1;
    if (nflState.season_type === "regular") {
      week = nflState.display_week;
    } else if (nflState.season_type === "post") {
      week = 18;
    }

    setWeek(week);

    const rivalry: Rivalry = {
      points: {
        one: 0,
        two: 0,
      },
      wins: {
        one: 0,
        two: 0,
      },
      ties: 0,
      matchups: [],
    };

    while (curLeagueID && curLeagueID !== "0") {
      const leagueData: LeagueData | null = await getLeagueData(
        curLeagueID
      ).catch((err) => {
        console.error(err);
        return null;
      });

      if (!leagueData) {
        curLeagueID = null;
        continue;
      }

      const year = leagueData.season;
      const rosterIDOne = getRosterIDFromManagerIDAndYear(
        teamManagers,
        userOneID,
        year
      );
      const rosterIDTwo = getRosterIDFromManagerIDAndYear(
        teamManagers,
        userTwoID,
        year
      );

      if (!rosterIDOne || !rosterIDTwo || rosterIDOne === rosterIDTwo) {
        curLeagueID = leagueData.previous_league_id;
        week = 18;
        continue;
      }

      const matchupsPromises: Promise<any>[] = [];
      for (let i = 1; i < leagueData.settings.playoff_week_start; i++) {
        matchupsPromises.push(
          axios.get(
            `https://api.sleeper.app/v1/league/${curLeagueID}/matchups/${i}`
          )
        );
      }
      const matchupsRes = await Promise.all(matchupsPromises);
      const matchupsJsonPromises: any[] = [];
      for (const matchupRes of matchupsRes) {
        const data = matchupRes.data;
        matchupsJsonPromises.push(data);
      }
      const matchupsData = await Promise.all(matchupsJsonPromises);

      for (let i = 1; i < matchupsData.length + 1; i++) {
        const processed = processRivalryMatchups(
          matchupsData[i - 1],
          i,
          rosterIDOne,
          rosterIDTwo
        );
        if (processed) {
          const { matchup, week } = processed;
          const sideA = matchup[0];
          const sideB = matchup[1];
          let sideAPoints = sideA.points.reduce(
            (t: number, nV: number) => t + nV,
            0
          );
          let sideBPoints = sideB.points.reduce(
            (t: number, nV: number) => t + nV,
            0
          );
          rivalry.points.one += sideAPoints;
          rivalry.points.two += sideBPoints;
          if (sideAPoints > sideBPoints) {
            rivalry.wins.one++;
          } else if (sideAPoints < sideBPoints) {
            rivalry.wins.two++;
          } else {
            rivalry.ties++;
          }
          rivalry.matchups.push({
            week,
            year,
            matchup,
          });
        }
      }
      curLeagueID = leagueData.previous_league_id;
      week = 18;
    }

    rivalry.matchups.sort((a, b) => {
      let yearOrder = parseInt(a.year) - parseInt(b.year);
      let weekOrder = b.week - a.week;
      return yearOrder || weekOrder;
    });
    return rivalry;
  };

  const processRivalryMatchups = (
    inputMatchups: any,
    week: number,
    rosterIDOne: string,
    rosterIDTwo: string
  ): RivalryMatchup | undefined => {
    if (!inputMatchups || inputMatchups.length === 0) {
      return undefined;
    }
    const matchups: { [key: string]: any[] } = {};
    for (const match of inputMatchups) {
      if (match.roster_id == rosterIDOne || match.roster_id == rosterIDTwo) {
        if (!matchups[match.matchup_id]) {
          matchups[match.matchup_id] = [];
        }
        matchups[match.matchup_id].push({
          roster_id: match.roster_id,
          starters: match.starters,
          points: match.starters_points,
        });
      }
    }

    const keys = Object.keys(matchups);
    const matchup = matchups[keys[0]];

    if (keys.length > 1 || matchup.length === 1) {
      return undefined;
    }

    if (matchup[0].roster_id === rosterIDTwo) {
      const two = matchup.shift();
      matchup.push(two);
    }
    return { matchup, week, year: "" };
  };

  const getRosterIDFromManagerIDAndYear = (
    teamManagers: any,
    managerID: string | null,
    year: string,
    userName?: string
  ): string | null => {
    if (!managerID || !year) return null;
    for (const rosterID in teamManagers.teamManagersMap[year]) {
      if (
        teamManagers.teamManagersMap[year][rosterID].managers.indexOf(
          managerID
        ) > -1
      ) {
        if (userName && users.size <= 14) {
          const avatar = teamManagers.teamManagersMap[year][rosterID].team
            .avatar
            ? teamManagers.teamManagersMap[year][rosterID].team.avatar
            : "";
          const userTemp: User = { managerID, rosterID, userName, avatar };

          const usersMap = new Map();
          users.forEach((userTemp) => {
            usersMap.set(userTemp.managerID, userTemp);
          });
          if (!usersMap.has(userTemp.managerID)) {
            users.add(userTemp);
            setUsers(users);
          }
        }

        return rosterID;
      }
    }
    return null;
  };

  const getLeagueTeamManagers = async (): Promise<any> => {
    let currentLeagueID = REACT_APP_LEAGUE_ID;
    let teamManagersMap: any = {};
    let finalUsers: any = {};
    let currentSeason: string = "";

    while (currentLeagueID && currentLeagueID !== "0") {
      const usersRaw = await axios.get<any>(
        `https://api.sleeper.app/v1/league/${currentLeagueID}/users`
      );
      const rostersRaw = await axios.get<any>(
        `https://api.sleeper.app/v1/league/${currentLeagueID}/rosters`
      );

      const usersJson = JSON.stringify(usersRaw.data);
      const rostersJson = rostersRaw.data;
      const leagueData = await getLeagueData(currentLeagueID);
      if (leagueData !== null) {
        const year = leagueData.season;
        currentLeagueID = leagueData.previous_league_id;
        if (!currentSeason) {
          currentSeason = year;
        }
        teamManagersMap[year] = {};
        const processedUsers = processUsers(usersRaw.data);

        for (const processedUserKey in processedUsers) {
          if (finalUsers[processedUserKey]) continue;
          finalUsers[processedUserKey] = processedUsers[processedUserKey];
        }

        for (const roster of rostersJson) {
          teamManagersMap[year][roster.roster_id] = {
            team: getTeamData(processedUsers, roster.owner_id),
            managers: getManagers(roster),
          };
        }
      } else {
        console.error("Failed to get league data");
      }
    }

    const response = {
      currentSeason,
      teamManagersMap,
      users: finalUsers,
    };

    const keys = Object.keys(response.users);
    for (const key of keys) {
      getRosterIDFromManagerIDAndYear(
        response,
        response.users[key].user_id,
        response.currentSeason,
        response.users[key].display_name
      );
    }
    setRivalManagers(response.teamManagersMap);
    return response;
  };

  const processUsers = (rawUsers: any): any => {
    let finalUsers: any = {};
    for (const user of rawUsers) {
      finalUsers[user.user_id] = user;
      const manager = Array.from(users).find(
        (m) => m.managerID === user.user_id
      );
      if (manager) {
        finalUsers[user.user_id].display_name = manager.userName;
      }
    }
    return finalUsers;
  };

  const getTeamData = (users: any, ownerID: string): any => {
    const user = users[ownerID];
    if (user) {
      return {
        avatar: user?.avatar && user?.avatar !== null ? user.avatar : "",
        name: user.team_name ? user.team_name : user.display_name,
      };
    }
    return {
      avatar: `https://sleepercdn.com/images/v2/icons/player_default.webp`,
      name: "Unknown Team",
    };
  };

  const getManagers = (roster: any): string[] => {
    const managers: string[] = [];
    if (roster.owner_id) {
      managers.push(roster.owner_id);
    }
    if (roster.co_owners) {
      for (const coOwner of roster.co_owners) {
        managers.push(coOwner);
      }
    }
    return managers;
  };

  const selectedValue = React.useMemo(
    () => Array.from(selected).join(", ").replaceAll("_", " "),
    [selected]
  );
  const selectedValue2 = React.useMemo(
    () => Array.from(selected2).join(", ").replaceAll("_", " "),
    [selected2]
  );

  const dropdownItems1: any = Array.from(users)
    .map((player) => {
      if (selected2.keys().next().value !== player.userName) {
        return (
          <DropdownItem
            className="text-[#af1222] hover:bg-[#5f5f5f] rounded-2xl"
            key={player.userName}
          >
            <div className="flex items-center">
              <Image
                src={
                  player.avatar
                    ? `https://sleepercdn.com/avatars/${player.avatar}`
                    : logo
                }
                alt="avatar"
                width={30}
                height={30}
                className="rounded-full mr-1"
              />
              {player.userName}
            </div>
          </DropdownItem>
        );
      }
      return undefined;
    })
    .filter((item) => item !== undefined);

  const dropdownItems2: any = Array.from(users)
    .map((player) => {
      if (selected.keys().next().value !== player.userName) {
        return (
          <DropdownItem
            className="text-[#af1222] hover:bg-[#5f5f5f] rounded-2xl"
            key={player.userName}
          >
            <div className="flex items-center">
              <Image
                src={
                  player.avatar
                    ? `https://sleepercdn.com/avatars/${player.avatar}`
                    : logo
                }
                alt="avatar"
                width={30}
                height={30}
                className="rounded-full mr-1"
              />
              {player.userName}
            </div>
          </DropdownItem>
        );
      }
      return undefined;
    })
    .filter((item) => item !== undefined);

  useEffect(() => {
    const fetchData = async () => {
      const leagueData = await getLeagueTeamManagers();

      const usersArray: User[] = Array.from(users);

      const firstUserInfo: User | undefined = usersArray.find(
        (user) => user.userName === selected.keys().next().value
      );

      const secondUserInfo: User | undefined = usersArray.find(
        (user) => user.userName === selected2.keys().next().value
      );

      if (firstUserInfo && secondUserInfo) {
        getRivalryMatchups(firstUserInfo.managerID, secondUserInfo.managerID)
          .then((rivalryData) => {
            const rivals = new Set<Rivalry>();
            rivals.add(rivalryData);

            setRivalry(rivals);
          })
          .catch((error) => {
            console.error("Error occurred while getting rivalry data:", error);
          });
      }
    };

    fetchData();
  }, [JSON.stringify(users), selected, selected2]);

  const rivalsMap: Map<string, Rivalry> = new Map();
  rivalry.forEach((rival) => {
    rivalsMap.set("Rival", rival);
  });

  const slate =
    rivalsMap.get("Rival") && rivalsMap.get("Rival")?.matchups[weekCount];

  const colorObj: { [key: string]: string } = {
    QB: "text-[10px]  p-1 rounded-xl bg-[#DE3449] font-bold  text-center ",
    RB: "text-[10px]  p-1 rounded-xl bg-[#00CEB8] font-bold  text-center ",
    WR: "text-[10px]  p-1 rounded-xl bg-[#588EBA] font-bold  text-center ",
    TE: "text-[10px]  p-1 rounded-xl bg-[#F1AE58] font-bold  text-center ",
    DEF: "text-[10px]  p-1 rounded-xl bg-[#798898] font-bold  text-center ",
    K: "text-[10px]  p-1 rounded-xl bg-[#BD66FF] font-bold  text-center ",
  };

  let team1Proj = 0.0;
  let team2Proj = 0.0;

  if (slate?.matchup[0]?.starters) {
    for (const currPlayer of slate.matchup[0].starters) {
      const playerData = playersData && playersData[currPlayer];
      if (
        playerData &&
        playerData.wi &&
        slate.week !== undefined &&
        playerData.wi[slate.week] &&
        playerData.wi[slate.week]?.p !== undefined
      ) {
        team1Proj += parseFloat(playerData.wi[slate.week].p || "0");
      }
    }
  }

  if (slate?.matchup[1]?.starters) {
    for (const currPlayer of slate.matchup[1].starters) {
      const playerData = playersData && playersData[currPlayer];
      if (
        playerData &&
        playerData.wi &&
        slate.week !== undefined &&
        playerData.wi[slate.week] &&
        playerData.wi[slate.week]?.p !== undefined
      ) {
        team2Proj += parseFloat(playerData.wi[slate.week].p || "0");
      }
    }
  }

  const winsOne = rivalsMap.get("Rival")?.wins.one || 0;
  const winsTwo = rivalsMap.get("Rival")?.wins.two || 0;
  const pointsOne = rivalsMap.get("Rival")?.points.one || 0;
  const pointsTwo = rivalsMap.get("Rival")?.points.two || 0;

  let selectedText;

  Array.from(users).map((player) => {
    if (selected.keys().next().value === player.userName) {
      selectedText = (
        <div className="flex items-center">
          <Image
            src={
              player.avatar
                ? `https://sleepercdn.com/avatars/${player.avatar}`
                : logo
            }
            alt="avatar"
            width={25}
            height={25}
            className="rounded-full mr-1"
          />
          {player.userName}
        </div>
      );
    }
  });
  let selectedText2;

  Array.from(users).map((player) => {
    if (selected2.keys().next().value === player.userName) {
      selectedText2 = (
        <div className="flex items-center">
          <Image
            src={
              player.avatar
                ? `https://sleepercdn.com/avatars/${player.avatar}`
                : logo
            }
            alt="avatar"
            width={25}
            height={25}
            className="rounded-full mr-1"
          />
          {player.userName}
        </div>
      );
    }
  });

  return (
    <div className="mt-3 flex flex-col items-center h-screen w-[95vw] xl:w-[60vw]">
      <div className="flex-col flex items-center ml-5 md:flex-row md:justify-center md:items-center md:ml-0 mt-5">
        <div>
          <Dropdown className="border-[1px] border-[#af1222] border-opacity-20 bg-[#E1E0E0] dark:bg-[#090909] rounded-xl">
            <DropdownTrigger>
              <Button
                variant="bordered"
                className=" border-[1px] text-[15px] w-[180px] font-bold  border-[#af1222] border-opacity-20 rounded-[10px] p-2"
              >
                <div className="flex items-center">
                  <div>{selectedText ? selectedText : "Select User"}</div>
                </div>
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Single selection example"
              variant="flat"
              disallowEmptySelection
              selectionMode="single"
              selectedKeys={selected}
              onSelectionChange={setSelected}
            >
              {dropdownItems1}
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="mx-3 font-bold my-3">vs.</div>
        <div className="mr-0 md:mr-10">
          <Dropdown className="border-[1px] border-[#af1222] border-opacity-20 bg-[#E1E0E0] dark:bg-[#090909] rounded-xl">
            <DropdownTrigger>
              <Button
                variant="bordered"
                className=" border-[1px] text-[15px] w-[180px] font-bold border-[#af1222] border-opacity-20 rounded-[10px] p-2"
              >
                <div className="flex items-center">
                  {selectedText2 ? selectedText2 : "Select User"}
                </div>
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Single selection example"
              variant="flat"
              disallowEmptySelection
              selectionMode="single"
              selectedKeys={selected2}
              onSelectionChange={setSelected2}
            >
              {dropdownItems2}
            </DropdownMenu>
          </Dropdown>
        </div>

        <Button
          className="ml-10 md:ml-0 mr-10 md:mr-0 mt-6 md:mt-1 border-[1px]  border-[#af1222] border-opacity-20 rounded-xl px-5 py-2"
          onPress={onOpen}
          onClick={startTimer}
        >
          <FaSearch />
        </Button>
      </div>
      <div>
        <Image
          src={MatchupsImg}
          alt="matchup image"
          className="mt-[120px] dark:opacity-80"
          width={600}
          height={600}
        />
      </div>
      {/* Modal */}
      <div>
        {selected.size > 0 && selected2.size > 0 && (
          <div>
            <Modal
              isOpen={isOpen}
              onOpenChange={onOpenChange}
              placement="center"
              scrollBehavior="inside"
            >
              <ModalContent className="flex bg-[#e0dfdf] dark:bg-[#050505] rounded-xl">
                <ModalHeader className="flex justify-center">
                  <p>Rivalry Summary</p>
                </ModalHeader>
                <ModalBody>
                  <div>
                    {rivalsMap.has("Rival") ? (
                      <div>
                        {/* Add the HeadToHead component here */}
                        <HeadToHead
                          winsOne={winsOne}
                          winsTwo={winsTwo}
                          pointsOne={pointsOne}
                          pointsTwo={pointsTwo}
                        />
                        <div className="text-center mb-10">
                          <div
                            className={
                              (rivalsMap.get("Rival")?.matchups.length ?? 0) <=
                              1
                                ? "hidden"
                                : "flex justify-center text-[#af1222] text-[25px]"
                            }
                          >
                            <HiOutlineArrowSmLeft
                              onClick={() =>
                                setWeekCount(Math.max(0, weekCount - 1))
                              }
                              size={30}
                            />
                            <HiOutlineArrowSmRight
                              onClick={() =>
                                setWeekCount(
                                  Math.min(
                                    weekCount + 1,
                                    (rivalsMap.get("Rival")?.matchups.length ??
                                      0) - 1
                                  )
                                )
                              }
                              size={30}
                            />
                          </div>
                          <div className="mb-10 font-bold flex flex-col">
                            <div> {slate?.year}</div>
                            <div className="font-normal">{`Week: ${slate?.week}`}</div>
                          </div>
                          <div className="flex teams justify-around">
                            <div className=" team1 flex flex-col items-center">
                              <div className="flex items-center justify-center border-b-[1px] border-[#1a1a1a] border-opacity-80 mb-2 w-full ">
                                <div className="flex items-center mr-1 sm:mr-3">
                                  {" "}
                                  {slate && slate.matchup[0] && (
                                    <Image
                                      src={
                                        rivalManagers[slate.year][
                                          slate.matchup[0].roster_id
                                        ].team.avatar
                                          ? `https://sleepercdn.com/avatars/thumbs/${
                                              rivalManagers[slate.year][
                                                slate.matchup[0].roster_id
                                              ].team.avatar
                                            }`
                                          : logo
                                      }
                                      alt="player"
                                      width={32}
                                      height={32}
                                      className="rounded-full mr-2 mb-1 w-[25px] h-[25px] sm:w-full sm:h-full"
                                    />
                                  )}
                                  <p className=" font-bold text-[11px]">
                                    {
                                      rivalManagers[slate?.year][
                                        slate?.matchup[0].roster_id
                                      ].team.name
                                    }
                                  </p>
                                </div>
                                <div className="flex flex-col justify-center items-center">
                                  <p className="font-bold text-[12px]">
                                    {slate?.matchup[0].points
                                      .reduce(
                                        (total, currentValue) =>
                                          total + parseFloat(currentValue),
                                        0
                                      )
                                      .toFixed(2) === "0.00"
                                      ? "-"
                                      : slate?.matchup[0].points
                                          .reduce(
                                            (total, currentValue) =>
                                              total + parseFloat(currentValue),
                                            0
                                          )
                                          .toFixed(2)}
                                  </p>
                                  <p className="text-[8px] text-[#b3adad] font-bold italic">
                                    {team1Proj.toFixed(2)}
                                  </p>
                                </div>
                              </div>

                              {slate?.matchup[0].starters.map(
                                (starter: string, starterIndex: number) => {
                                  if (starter === "0") {
                                    return (
                                      <div
                                        key={starterIndex}
                                        className="flex flex-coltext-[13px] items-center justify-center w-[164px] h-[71px] border-[1px] border-[#1a1a1a] mb-1"
                                      >
                                        Start your player buddy!
                                      </div>
                                    );
                                  }
                                  if (!playersData[starter]) {
                                    return (
                                      <div
                                        key={starterIndex}
                                        className="flex text-[13px] items-center justify-start w-[164px] h-[71px] border-[1px] border-[#1a1a1a] mb-1 "
                                      >
                                        {" "}
                                        <ImSad
                                          className="opacity-40 animate-pulse ml-2"
                                          size={23}
                                        />
                                        <div className="flex flex-col items-center">
                                          {" "}
                                          <Image
                                            src={`https://sleepercdn.com/content/nfl/players/thumb/${starter}.jpg`}
                                            alt="player"
                                            width={57}
                                            height={57}
                                            className="opacity-50 animate-pulse"
                                          />
                                          <p>F/A</p>
                                        </div>
                                      </div>
                                    );
                                  }
                                  const playerFirstName =
                                    playersData[starter.toString()].fn.charAt(
                                      0
                                    ) + ".";
                                  const playerLastName =
                                    playersData[starter.toString()].ln;
                                  const playerPoints =
                                    slate.matchup[0].points[starterIndex];

                                  return (
                                    <div
                                      key={starterIndex}
                                      className="flex flex-col items-center justify-center w-[164px] h-[71px] border-[1px] border-[#1a1a1a] mb-1"
                                    >
                                      <div className="flex justify-between items-center w-full p-2">
                                        <div className="flex flex-col items-center justify-center">
                                          <div className="flex items-center">
                                            <p
                                              className={`${
                                                colorObj[
                                                  playersData[starter].pos
                                                ]
                                              }`}
                                            >
                                              {playersData[starter].pos}
                                            </p>
                                            <Image
                                              src={
                                                playersData[starter.toString()]
                                                  .pos === "DEF"
                                                  ? `https://sleepercdn.com/images/team_logos/nfl/${starter.toLowerCase()}.png`
                                                  : `https://sleepercdn.com/content/nfl/players/thumb/${starter}.jpg`
                                              }
                                              alt="player"
                                              width={
                                                playersData[starter.toString()]
                                                  .pos === "DEF"
                                                  ? 40
                                                  : 57
                                              }
                                              height={
                                                playersData[starter.toString()]
                                                  .pos === "DEF"
                                                  ? 40
                                                  : 57
                                              }
                                            />
                                          </div>

                                          <p className=" font-bold text-[12px]">
                                            {playerFirstName} {playerLastName}
                                          </p>
                                        </div>
                                        <div className="flex flex-col items-center justify-center">
                                          <p className=" font-bold text-[10px]">
                                            {playerPoints}
                                          </p>
                                          <p className=" text-[8px] font-bold italic">
                                            {(() => {
                                              const player =
                                                playersData[starter.toString()];
                                              const proj =
                                                player?.wi[slate.week]?.p;
                                              if (
                                                proj !== undefined &&
                                                proj !== 0.0
                                              ) {
                                                return proj;
                                              }
                                              return slate.matchup[1].points[
                                                starterIndex
                                              ];
                                            })()}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                            <div className=" team2 flex flex-col items-center">
                              <div className="flex items-center justify-center border-b-[1px] border-[#1a1a1a] border-opacity-80 mb-2 w-full ">
                                <div className="flex flex-col justify-center items-center mr-1 sm:mr-3">
                                  <p className="font-bold text-[12px]">
                                    {slate?.matchup[1].points
                                      .reduce(
                                        (total, currentValue) =>
                                          total + parseFloat(currentValue),
                                        0
                                      )
                                      .toFixed(2) === "0.00"
                                      ? "-"
                                      : slate?.matchup[1].points
                                          .reduce(
                                            (total, currentValue) =>
                                              total + parseFloat(currentValue),
                                            0
                                          )
                                          .toFixed(2)}
                                  </p>
                                  <p className=" text-[8px] text-[#b3adad] font-bold italic">
                                    {team2Proj.toFixed(2)}
                                  </p>
                                </div>
                                <div className="flex items-center ">
                                  {" "}
                                  <Image
                                    src={
                                      rivalManagers[slate.year][
                                        slate.matchup[1].roster_id
                                      ].team.avatar
                                        ? `https://sleepercdn.com/avatars/thumbs/${
                                            rivalManagers[slate.year][
                                              slate.matchup[1].roster_id
                                            ].team.avatar
                                          }`
                                        : logo
                                    }
                                    alt="player"
                                    width={32}
                                    height={32}
                                    className="rounded-full mr-2 mb-1 w-[25px] h-[25px] sm:w-full sm:h-full"
                                  />
                                  <p className=" font-bold text-[11px]">
                                    {
                                      rivalManagers[slate.year][
                                        slate.matchup[1].roster_id
                                      ].team.name
                                    }
                                  </p>
                                </div>
                              </div>

                              {slate.matchup[1].starters.map(
                                (starter, starterIndex) => {
                                  if (starter === "0") {
                                    return (
                                      <div
                                        key={starterIndex}
                                        className="flex flex-col  text[13px] items-center justify-center w-[164px] h-[71px] border-[1px] border-[#1a1a1a] mb-1"
                                      >
                                        Start your player buddy!
                                      </div>
                                    );
                                  }
                                  if (!playersData[starter]) {
                                    return (
                                      <div
                                        key={starterIndex}
                                        className="flex   text-[13px] items-center justify-start w-[164px] h-[71px] border-[1px] border-[#1a1a1a] mb-1 "
                                      >
                                        {" "}
                                        <ImSad
                                          className="opacity-40 animate-pulse ml-2"
                                          size={23}
                                        />
                                        <div className="flex flex-col items-center">
                                          {" "}
                                          <Image
                                            src={`https://sleepercdn.com/content/nfl/players/thumb/${starter}.jpg`}
                                            alt="player"
                                            width={57}
                                            height={57}
                                            className="opacity-50 animate-pulse"
                                          />
                                          <p>F/A</p>
                                        </div>
                                      </div>
                                    );
                                  }
                                  const playerFirstName =
                                    playersData[starter.toString()].fn.charAt(
                                      0
                                    ) + ".";
                                  const playerLastName =
                                    playersData[starter.toString()].ln;
                                  const playerPoints =
                                    slate.matchup[1].points[starterIndex];

                                  return (
                                    <div
                                      key={starterIndex}
                                      className="flex flex-col items-center justify-center w-[164px] h-[71px] border-[1px] border-[#1a1a1a] mb-1"
                                    >
                                      <div className="flex justify-between items-center w-full p-2">
                                        <div className="flex flex-col items-center justify-center">
                                          <div className="flex items-center">
                                            <p
                                              className={`${
                                                colorObj[
                                                  playersData[starter].pos
                                                ]
                                              }`}
                                            >
                                              {playersData[starter].pos}
                                            </p>
                                            <Image
                                              src={
                                                playersData[starter.toString()]
                                                  .pos === "DEF"
                                                  ? `https://sleepercdn.com/images/team_logos/nfl/${starter.toLowerCase()}.png`
                                                  : `https://sleepercdn.com/content/nfl/players/thumb/${starter}.jpg`
                                              }
                                              alt="player"
                                              width={
                                                playersData[starter.toString()]
                                                  .pos === "DEF"
                                                  ? 40
                                                  : 57
                                              }
                                              height={
                                                playersData[starter.toString()]
                                                  .pos === "DEF"
                                                  ? 40
                                                  : 57
                                              }
                                            />
                                          </div>

                                          <p className=" font-bold text-[10px] sm:text-[12px]">
                                            {playerFirstName} {playerLastName}
                                          </p>
                                        </div>
                                        <div className="flex flex-col items-center justify-center">
                                          <p className=" font-bold text-[10px] sm:text-[12px]">
                                            {playerPoints}
                                          </p>
                                          <p className="text-[A6a6a6] text-[8px] font-bold italic">
                                            {(() => {
                                              const player =
                                                playersData[starter.toString()];
                                              const proj =
                                                player?.wi[slate.week]?.p;
                                              if (
                                                proj !== undefined &&
                                                proj !== 0.0
                                              ) {
                                                return proj;
                                              }
                                              return slate.matchup[1].points[
                                                starterIndex
                                              ];
                                            })()}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="">
                        {isLoading ? (
                          <div
                            role="status"
                            className=" flex justify-center items-center"
                          >
                            <svg
                              aria-hidden="true"
                              className="w-8 h-8 mr-2 text-black animate-spin dark:text-gray-600 fill-[#af1222]"
                              viewBox="0 0 100 101"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"
                              />
                              <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"
                              />
                            </svg>
                            <span>Loading Rivalry...</span>
                          </div>
                        ) : (
                          <div>Invalid Submission</div>
                        )}
                      </p>
                    )}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    className="bg-[#af1222] text-white p-1 rounded-xl "
                    onPress={onClose}
                  >
                    Close
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matchups;
