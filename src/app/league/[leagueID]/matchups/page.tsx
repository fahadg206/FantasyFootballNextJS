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

const REACT_APP_LEAGUE_ID: string =
  process.env.REACT_APP_LEAGUE_ID || "872659020144656384";

const matchups = () => {
  const [selected, setSelected] = React.useState(new Set(["text"]));
  const [selected2, setSelected2] = React.useState(new Set(["text"]));
  const [playersData, setPlayersData] = React.useState([]);
  const [users, setUsers] = React.useState(new Set<User>());
  const [users2, setUsers2] = React.useState(new Set<User>());
  const [rivalry, setRivalry] = React.useState(new Set<Rivalry>());

  const { setVisible, bindings } = useModal();

  const [input, setInput] = useState("");

  const managers: Manager[] = [];

  const usersDropdown: Set<User> = new Set();

  const usersDropdown2: Set<User> = new Set();

  const rivalsMap = new Map();

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
    queryLeagueID: string = REACT_APP_LEAGUE_ID
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

    console.log("Here are the users!: ", userOneID, userTwoID);

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
          for (const user of usersDropdown) {
            usersMap.set(user.managerID, user);
          }
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
        console.log("Team managers: ", teamManagersMap);
      } else {
        console.error("Failed to get league data");
      }
    }

    const response = {
      currentSeason,
      teamManagersMap,
      users: finalUsers,
    };

    // console.log("Data prior to function call", response.teamManagersMap["2022"]);
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

  for (const rival of rivalry) {
    rivalsMap.set("Rival", rival);
  }
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
          <Dropdown.Item css={{ color: "white" }} key={player.userName}>
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
  console.log(rivalsMap);
  // const avatarID = rivalsMap
  //   .get("Rival")
  //   .matchups[0].matchup[0].starters[0].toString();
  return (
    <div className="flex justify-around h-screen border-2 border-[#af1222]">
      <div className="mt-5">
        Select User:
        <Dropdown>
          <Dropdown.Button flat css={{ tt: "capitalize", color: "#af1222" }}>
            {selectedValue}
          </Dropdown.Button>
          <Dropdown.Menu
            aria-label="Single selection actions"
            css={{
              backgroundColor: "#af1222",
              border: "solid",
              borderColor: "black",
              color: "black",
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
      <div className="mt-5">
        Select User:
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
      <div className="mt-10">
        <Button
          onPress={() => {
            console.log(input);
            setVisible(true);
          }}
          css={{
            backgroundImage: "linear-gradient(black, black, #af1222, #af1222)",
            color: "#ffffff",
            borderStyle: "solid",
            borderColor: "#af1222",
            // Set the text color to white or any desired color
            // Add other styles as needed
          }}
          // bg-gradient-to-b border border-[#af1222] from-black to-[#af1222] p-1 rounded
          auto
        >
          <FaSearch />
        </Button>
      </div>
      {/* Modal */}
      <div>
        {" "}
        {selected.size > 0 && selected2.size > 0 && (
          <div>
            <Modal
              scroll
              width="600px"
              aria-labelledby="modal-title"
              aria-describedby="modal-description"
              {...bindings}
              css={{
                backgroundColor: "#202123",
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
                  Modal with a lot of content
                </Text>
              </Modal.Header>
              <Modal.Body css={{ color: "#190103" }}>
                <Text id="modal-description" css={{ color: "#E9EBEA" }}>
                  {rivalsMap.has("Rival")
                    ? playersData[
                        rivalsMap
                          .get("Rival")
                          .matchups[0].matchup[0].starters[0].toString()
                      ].fn +
                      " " +
                      playersData[
                        rivalsMap
                          .get("Rival")
                          .matchups[0].matchup[0].starters[0].toString()
                      ].ln
                    : "Nice try buddy"}
                </Text>
                <Image
                  src="https://sleepercdn.com/content/nfl/players/thumb/4017.jpg"
                  alt="player"
                  width={100}
                  height={100}
                />
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
