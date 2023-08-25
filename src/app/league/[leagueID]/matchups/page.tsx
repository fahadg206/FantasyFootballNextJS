"use client";

import React from "react";
import { FaSearch } from "react-icons/fa";
import { Dropdown, Modal, useModal, Button, Text } from "@nextui-org/react";
import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { match } from "assert";
import { useDropdown } from "@nextui-org/react/types/dropdown/use-dropdown";
import { M_PLUS_1 } from "next/font/google";
import Image from "next/image";
import { BsArrowBarLeft, BsArrowBarRight } from "react-icons/bs";
import { HiOutlineArrowSmLeft, HiOutlineArrowSmRight } from "react-icons/hi";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore/lite";
import MatchupsImg from "../../../images/matchupsImage.png";
import { db, storage } from "../../../firebase";

interface NflState {
  season: string;
  display_week: number;
  season_type: string;
  // Add other properties as needed
}

interface Manager {
  managerID: string;
  name: string;
  // Add other properties as needed
}

interface RivalsManager {
  managerID: string;
  name: string;
  year: string;
  // Add other properties as needed
}

interface User {
  managerID: string;
  rosterID: string;
  userName: string;
  // Add other properties as needed
}

interface LeagueData {
  season: string;
  previous_league_id: string;
  settings: {
    playoff_week_start: number;
    // Add other properties as needed
  };
  // Add other properties as needed
}

interface RivalryMatchup {
  week: number;
  year: string;
  matchup: any; // Replace 'any' with a custom type if possible
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
interface Starter {
  fn?: string;
  ln?: string;
  pos: string;
}

const REACT_APP_LEAGUE_ID: string =
  process.env.REACT_APP_LEAGUE_ID || "872659020144656384";

const matchups = () => {
  const [selected, setSelected] = React.useState(new Set(["Select User"]));
  const [weekCount, setWeekCount] = useState(0);
  const [selected2, setSelected2] = React.useState(new Set(["Select User"]));
  const [playersData, setPlayersData] = React.useState<Starter[]>([]);
  const [users, setUsers] = React.useState(new Set<User>());
  const [users2, setUsers2] = React.useState(new Set<User>());
  const [rivalry, setRivalry] = React.useState(new Set<Rivalry>());
  const [rivalManagers, setRivalManagers] = React.useState(
    new Set<RivalsManager>()
  );

  const REACT_APP_LEAGUE_ID: string | null =
    localStorage.getItem("selectedLeagueID");

  const { setVisible, bindings } = useModal();

  const [input, setInput] = useState("");

  const managers: Manager[] = [];

  const usersDropdown: Set<User> = new Set();

  const usersDropdown2: Set<User> = new Set();

  const rivalsMap: Map<string, Rivalry> = new Map();

  const getNflState = async (): Promise<NflState> => {
    try {
      const res: AxiosResponse<NflState> = await axios.get<NflState>(
        `https://api.sleeper.app/v1/state/nfl`
      );

      const data: NflState = res.data;

      if (res.status === 200) {
        //console.log("Here's the nfl Data:", data);
      } else {
        // Handle other status codes or error cases
      }
      return data;
    } catch (err) {
      console.error(err);
      // Handle the error case here, return an appropriate value, or throw an error
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

      if (res.status === 200) {
        //console.log("Here's the league data:", data);
      } else {
        // Handle other status codes or error cases
      }

      return data;
    } catch (err) {
      console.error(err);
      // Handle the error case here, return an appropriate value, or throw an error
      throw new Error("Failed to get league data");
    }
  };

  // Define the function with type annotations

  const getRivalryMatchups = async (
    userOneID: string | undefined,
    userTwoID: string | undefined
  ): Promise<Rivalry> => {
    if (!userOneID || !userTwoID) {
      return Promise.reject(new Error("Invalid user IDs"));
    }

    //console.log("Here are the users!: ", userOneID, userTwoID);

    let curLeagueID: string | null = REACT_APP_LEAGUE_ID;

    const nflState: NflState = await getNflState();
    const teamManagers: any = await getLeagueTeamManagers();

    let week = 1;
    if (nflState.season_type === "regular") {
      week = nflState.display_week;
    } else if (nflState.season_type === "post") {
      week = 18;
    }

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

      // pull in all matchup data for the season
      const matchupsPromises: Promise<any>[] = [];
      for (let i = 1; i < leagueData.settings.playoff_week_start; i++) {
        matchupsPromises.push(
          axios.get(
            `https://api.sleeper.app/v1/league/${curLeagueID}/matchups/${i}`
          )
        );
      }
      const matchupsRes = await Promise.all(matchupsPromises);
      // convert the json matchup responses
      const matchupsJsonPromises: any[] = [];
      for (const matchupRes of matchupsRes) {
        const data = matchupRes.data;
        matchupsJsonPromises.push(data);
        if (!matchupRes.ok) {
          //throw new Error(data);
        }
      }
      const matchupsData = await Promise.all(matchupsJsonPromises);

      // process all the matchups
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
      // console.log("match rosterID : ", match.roster_id);
      // console.log("parameter rosterID: ", rosterIDOne);
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
    // if the two teams played each other, there will only be one matchup, or if
    // there is one matchup that only has half the matchup, then one of the teams wasn't in the league yet

    if (keys.length > 1 || matchup.length === 1) {
      return undefined;
    }
    // make sure that the order matches
    if (matchup[0].roster_id === rosterIDTwo) {
      const two = matchup.shift();
      matchup.push(two);
    }
    return { matchup, week, year: "" }; // Replace 'year: '' ' with the actual year if available
  };

  const getRosterIDFromManagerIDAndYear = (
    teamManagers: any,
    managerID: string | null,
    year: string,
    userName?: string
  ): string | null => {
    if (!managerID || !year) return null; // Handle null values here
    if (!managerID || !year) return null;
    for (const rosterID in teamManagers.teamManagersMap[year]) {
      if (
        teamManagers.teamManagersMap[year][rosterID].managers.indexOf(
          managerID
        ) > -1
      ) {
        // console.log("ManagerID: ", managerID);
        // console.log("RosterID: ", rosterID);
        // console.log("Username:", userName);
        if (userName && users.size <= 12) {
          // The userName is provided and not undefined

          const userTemp: User = { managerID, rosterID, userName };

          const usersMap = new Map();
          usersDropdown.forEach((userTemp) => {
            usersMap.set(userTemp.managerID, userTemp);
          });
          if (!usersMap.has(userTemp.managerID)) {
            usersDropdown.add(userTemp);
            setUsers(usersDropdown);
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
        //console.log("Team managers: ", teamManagersMap);
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
      //console.log(`${key}: ${response.users[key].display_name}`);
    }
    //console.log("Data prior to function call", response);
    setRivalManagers(response.teamManagersMap);
    return response;
  };

  const processUsers = (rawUsers: any): any => {
    let finalUsers: any = {};
    for (const user of rawUsers) {
      finalUsers[user.user_id] = user;
      const manager = managers.find((m) => m.managerID === user.user_id);
      if (manager) {
        finalUsers[user.user_id].display_name = manager.name;
      }
    }
    return finalUsers;
  };

  const getTeamData = (users: any, ownerID: string): any => {
    const user = users[ownerID];
    if (user) {
      return {
        avatar: user?.avatar
          ? user.avatar
          : `https://sleepercdn.com/avatars/thumbs/${user.avatar}`,
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
    //console.log("Managers:", managers[0]);
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

  if (selected.keys().next().value) {
    selected2.keys().next().value;
  }

  const players = ["Kabo", "FG", "Zekeee", "Jefe"];

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/players")
      .then((response) => {
        const playersData = response.data;

        setPlayersData(playersData);
        // Process and use the data as needed
        console.log(playersData["4017"]);
      })
      .catch((error) => {
        console.error("Error while fetching players data:", error);
      });
  }, []);
  const playersDataObject = {}; // Initialize an empty object to store data as key-value pairs

  // for (let i = 0; i < playersData.length; i++) {
  //   playersDataObject[i] = playersData[i];
  // }
  // addDoc(collection(db, "players"), {
  //   player: playersDataObject["4017"],
  // });
  useEffect(() => {
    const fetchData = async () => {
      // Fetch league data and wait for the result
      const leagueData = await getLeagueTeamManagers();

      // Get the userArray once the league data is available
      const usersArray: User[] = Array.from(usersDropdown);

      // Find the selection's username within the array
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
            console.log("Selected users Rivalry Data: ", rivalryData);
          })
          .catch((error) => {
            console.error("Error occurred while getting rivalry data:", error);
          });
      } else {
        console.log("Could not get user info for both users.");
      }
    };

    fetchData();
  }, [JSON.stringify(usersDropdown), selected, selected2]);

  rivalry.forEach((rival) => {
    rivalsMap.set("Rival", rival);
  });

  // Define callback functions to handle selection changes
  const handleSelectionChange = (selection: any) => {
    setSelected(selection);
  };

  const handleSelectionChange2 = (selection2: any) => {
    setSelected2(selection2);
  };

  // console.log("Here's the dropdown: ", users);
  // console.log("Selection 1: ", selected);
  // console.log("Selection 2: ", selected2);

  const dropdownItems1: any = Array.from(users)
    .map((player) => {
      if (selected2.keys().next().value !== player.userName) {
        return (
          <Dropdown.Item css={{ color: "#af1222" }} key={player.userName}>
            {player.userName}
          </Dropdown.Item>
        );
      }
      return undefined;
    })
    .filter((item) => item !== undefined);

  const dropdownItems2: any = Array.from(users)
    .map((player) => {
      if (selected.keys().next().value !== player.userName) {
        return (
          <Dropdown.Item css={{ color: "#af1222" }} key={player.userName}>
            {player.userName}
          </Dropdown.Item>
        );
      }
      return undefined;
    })
    .filter((item) => item !== undefined);

  if (rivalsMap.get("Rival")) {
    // console.log(
    //   "Here are the rivals",
    //   playersData["4017"].wi[
    //     rivalsMap.get("Rival").matchups[weekCount].week?.toString()
    //   ].p
    // );
  }
  //console.log("Here are the rivals", rivalsMap.get("Rival"));
  // const avatarID = rivalsMap
  //   .get("Rival")
  //   .matchups[0].matchup[0].starters[0].toString();

  //console.log("Work ", rivalManagers);
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
  return (
    <div className="mt-3 flex flex-col items-center  h-screen w-[95vw] xl:w-[60vw]">
      <div className="flex-col flex items-center ml-5 md:flex-row md:justify-center md:items-start md:ml-0  mt-5">
        <div className="mr-10 mb-5 md:mb-0">
          <Dropdown>
            <Dropdown.Button flat css={{ tt: "capitalize", color: "#af1222" }}>
              {selectedValue}
            </Dropdown.Button>
            <Dropdown.Menu
              aria-label="Single selection actions"
              css={{
                backgroundColor: "black",
                border: "solid",
                borderColor: "#af1222",
                color: "white",
              }}
              disallowEmptySelection
              selectionMode="single"
              selectedKeys={selected}
              onSelectionChange={handleSelectionChange}
            >
              {dropdownItems1}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="mr-10">
          <Dropdown>
            <Dropdown.Button flat css={{ tt: "capitalize", color: "#af1222" }}>
              {selectedValue2}
            </Dropdown.Button>
            <Dropdown.Menu
              aria-label="Single selection actions"
              css={{
                backgroundColor: "black",
                border: "solid",
                borderColor: "#af1222",
                color: "white",
              }}
              disallowEmptySelection
              selectionMode="single"
              selectedKeys={selected2}
              onSelectionChange={handleSelectionChange2}
            >
              {dropdownItems2}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <button
          className="mr-10 md:mr-0 mt-6 md:mt-1 bg-[#CEE4FE] text-[#af1222]  rounded-xl px-5 py-2"
          onClick={() => setVisible(true)}
        >
          <FaSearch />
        </button>
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
              scroll
              width="600px"
              aria-labelledby="modal-title"
              aria-describedby="modal-description"
              {...bindings}
              css={{
                backgroundColor: "#050505",
                color: "white",
                "@smMax": {
                  backgroundColor: "#050505",
                  width: "90vw",
                  display: "flex",
                  justifyContent: "center",
                  textAlign: "center",
                  marginLeft: "20px",
                },
              }}
            >
              <Modal.Header>
                <Text id="modal-title" size={18} css={{ color: "#E9EBEA" }}>
                  Rivarly Summary
                </Text>
              </Modal.Header>
              <Modal.Body css={{ color: "#190103" }}>
                <div>
                  {rivalsMap.has("Rival") ? (
                    <div>
                      <div className="text-center mb-10">
                        <div
                          className={
                            (rivalsMap.get("Rival")?.matchups.length ?? 0) <= 1
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
                        <Text className="mb-10" css={{ color: "#E9EBEA" }}>
                          Week:
                          {slate?.week}
                        </Text>
                        <div className="flex teams justify-around">
                          <div className=" team1 flex flex-col items-center">
                            <div className="flex items-center justify-center border-b-[1px] border-[#1a1a1a] border-opacity-80 mb-2 w-full ">
                              <div className="flex items-center mr-1 sm:mr-3">
                                {" "}
                                {slate && slate.matchup[0] && (
                                  <Image
                                    src={`https://sleepercdn.com/avatars/thumbs/${
                                      rivalManagers[slate.year][
                                        slate.matchup[0].roster_id
                                      ].team.avatar
                                    }`}
                                    alt="player"
                                    width={38}
                                    height={38}
                                    className="rounded-full mr-2 w-[25px] h-[25px] sm:w-full sm:h-full"
                                  />
                                )}
                                <Text
                                  css={{
                                    color: "#E9EBEA",
                                    fontWeight: "$bold",
                                    "@xsMax": {
                                      fontSize: "12px",
                                    },
                                  }}
                                >
                                  {
                                    rivalManagers[slate?.year][
                                      slate?.matchup[0].roster_id
                                    ].team.name
                                  }
                                </Text>
                              </div>
                              <div className="flex items-center">
                                <Text
                                  css={{
                                    color: "#E9EBEA",
                                    fontSize: "14px",
                                    "@xsMax": {
                                      fontSize: "10px",
                                      fontWeight: "bold",
                                    },
                                  }}
                                >
                                  {slate?.matchup[0].points
                                    .reduce(
                                      (total, currentValue) =>
                                        total + parseFloat(currentValue),
                                      0
                                    )
                                    .toFixed(2)}
                                </Text>
                              </div>
                            </div>

                            {slate?.matchup[0].starters.map(
                              (starter: string, starterIndex: number) => {
                                if (starter === "0") {
                                  return (
                                    <div
                                      key={starterIndex}
                                      className="flex flex-col text-white text-[13px] items-center justify-center w-[164px] h-[71px] border-[1px] border-[#1a1a1a] mb-1"
                                    >
                                      Start your player buddy!
                                    </div>
                                  );
                                }
                                const playerFirstName =
                                  playersData[starter.toString()].fn.charAt(0) +
                                  ".";
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
                                              colorObj[playersData[starter].pos]
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
                                            width={57}
                                            height={57}
                                          />
                                        </div>

                                        <Text
                                          css={{
                                            color: "#E9EBEA",
                                            fontSize: "12px",
                                            fontWeight: "$bold",
                                          }}
                                        >
                                          {playerFirstName} {playerLastName}
                                        </Text>
                                      </div>
                                      <div className="flex flex-col items-center justify-center">
                                        <Text
                                          css={{
                                            color: "#E9EBEA",
                                            fontSize: "12px",
                                            fontWeight: "$bold",
                                          }}
                                        >
                                          {playerPoints}
                                        </Text>
                                        <Text
                                          css={{
                                            color: "#A6A6A6",
                                            fontSize: "8px",
                                            fontWeight: "$bold",
                                            fontStyle: "italic",
                                          }}
                                        >
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
                                        </Text>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                          <div className=" team2 flex flex-col items-center">
                            <div className="flex items-center justify-center border-b-[1px] border-[#1a1a1a] border-opacity-80 mb-2 w-full ">
                              <div className="flex items-center mr-1 sm:mr-3">
                                <Text
                                  css={{
                                    color: "#E9EBEA",
                                    fontSize: "14px",
                                    "@xsMax": {
                                      fontSize: "10px",
                                      fontWeight: "bold",
                                    },
                                  }}
                                >
                                  {slate.matchup[1].points
                                    .reduce(
                                      (total, currentValue) =>
                                        total + parseFloat(currentValue),
                                      0
                                    )
                                    .toFixed(2)}
                                </Text>
                              </div>
                              <div className="flex items-center ">
                                {" "}
                                <Image
                                  src={`https://sleepercdn.com/avatars/thumbs/${
                                    rivalManagers[slate.year][
                                      slate.matchup[1].roster_id
                                    ].team.avatar
                                  }`}
                                  alt="player"
                                  width={38}
                                  height={38}
                                  className="rounded-full mr-2 w-[25px] h-[25px] sm:w-full sm:h-full"
                                />
                                <Text
                                  css={{
                                    color: "#E9EBEA",
                                    fontWeight: "$bold",
                                    "@xsMax": {
                                      fontSize: "12px",
                                    },
                                  }}
                                >
                                  {
                                    rivalManagers[slate.year][
                                      slate.matchup[1].roster_id
                                    ].team.name
                                  }
                                </Text>
                              </div>
                            </div>

                            {slate.matchup[1].starters.map(
                              (starter, starterIndex) => {
                                if (starter === "0") {
                                  return (
                                    <div
                                      key={starterIndex}
                                      className="flex flex-col text-white text[13px] items-center justify-center w-[164px] h-[71px] border-[1px] border-[#1a1a1a] mb-1"
                                    >
                                      Start your player buddy!
                                    </div>
                                  );
                                }
                                const playerFirstName =
                                  playersData[starter.toString()].fn.charAt(0) +
                                  ".";
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
                                              colorObj[playersData[starter].pos]
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
                                            width={57}
                                            height={57}
                                          />
                                        </div>

                                        <Text
                                          css={{
                                            color: "#E9EBEA",
                                            fontSize: "12px",
                                            fontWeight: "$bold",
                                          }}
                                        >
                                          {playerFirstName} {playerLastName}
                                        </Text>
                                      </div>
                                      <div className="flex flex-col items-center justify-center">
                                        <Text
                                          css={{
                                            color: "#E9EBEA",
                                            fontSize: "12px",
                                            fontWeight: "$bold",
                                          }}
                                        >
                                          {playerPoints}
                                        </Text>
                                        <Text
                                          css={{
                                            color: "#A6A6A6",
                                            fontSize: "8px",
                                            fontWeight: "$bold",
                                            fontStyle: "italic",
                                          }}
                                        >
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
                                        </Text>
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
                    <Text id="modal-description" css={{ color: "#E9EBEA" }}>
                      Invalid Submission
                    </Text>
                  )}
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  auto
                  flat
                  color="default"
                  onPress={() => setVisible(false)}
                  css={{ color: "white", backgroundColor: "#af1222" }}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        )}
      </div>
    </div>
  );
};

export default matchups;
