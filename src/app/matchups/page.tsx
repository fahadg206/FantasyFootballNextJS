"use client";

import React from "react";
import { Dropdown } from "@nextui-org/react";
import axios, { AxiosResponse } from 'axios';
import { useEffect } from "react";

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

const REACT_APP_LEAGUE_ID: string = process.env.REACT_APP_LEAGUE_ID || '';

const matchups = () => {
  const [selected, setSelected] = React.useState(new Set(["text"]));
  const [selected2, setSelected2] = React.useState(new Set(["text"]));
  const [playersData, setPlayersData] = React.useState([]);
  const [users, setUsers] = React.useState([]);

  const managers: Manager[] = [];



  const getNflState = async (): Promise<string> => {
    try {
      const res: AxiosResponse<NflState> = await axios.get<NflState>(`https://api.sleeper.app/v1/state/nfl`, {
        headers: {
          'Accept-Encoding': 'gzip', // Enable gzip compression for the response
        },
      });
  
      const data: string = JSON.stringify(res.data);
  
      if (res.status === 200) {
        console.log("Here's the nfl Data:", data);
      } else {
        // Handle other status codes or error cases
      }
      return data;
    } catch (err) {
      console.error(err);
      // Handle the error case here, return an appropriate value, or throw an error
      throw new Error('Failed to get NFL state');
    }
  };

  const getLeagueData = async (queryLeagueID: string = REACT_APP_LEAGUE_ID): Promise<LeagueData> => {
    try {
      const res = await axios.get<LeagueData>(`https://api.sleeper.app/v1/league/${queryLeagueID}`, {
        headers: {
          'Accept-Encoding': 'gzip', // Enable gzip compression for the response
        },
      });
  
      const data: LeagueData = res.data;
  
      if (res.status === 200) {
        console.log("Here's the league data:", data);
      } else {
        // Handle other status codes or error cases
      }
  
      return data;
    } catch (err) {
      console.error(err);
      // Handle the error case here, return an appropriate value, or throw an error
      throw new Error('Failed to get league data');
    }
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
    if (match.roster_id === rosterIDOne || match.roster_id === rosterIDTwo) {
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
  return { matchup, week, year: '' }; // Replace 'year: '' ' with the actual year if available
};

const getRosterIDFromManagerIDAndYear = (teamManagers: any, managerID: string, year: string): string | null => {
  if (!managerID || !year) return null;
  for (const rosterID in teamManagers.teamManagersMap[year]) {
    if (
      teamManagers.teamManagersMap[year][rosterID].managers.indexOf(managerID) > -1
    ) {
      return rosterID;
    }
  }
  return null;
};

const getLeagueTeamManagers = async (): Promise<any> => {
  console.log("Called");
  let currentLeagueID = REACT_APP_LEAGUE_ID;
  let teamManagersMap: any = {};
  let finalUsers: any = {};
  let currentSeason: string | null = null;

  while (currentLeagueID && currentLeagueID !== '0') {
    const usersRaw = await axios.get<any>(
      `https://api.sleeper.app/v1/league/${currentLeagueID}/users`
    );
    const rostersRaw = await axios.get<any>(
      `https://api.sleeper.app/v1/league/${currentLeagueID}/rosters`
    );

    const usersJson = JSON.stringify(usersRaw.data);
    const rostersJson = rostersRaw.data;
    const leagueData = await getLeagueData(currentLeagueID);

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
  }
  const response = {
    currentSeason,
    teamManagersMap,
    users: finalUsers,
  };
  console.log("Here's what it looks like: ", Object.values(response.users));
  setUsers(Object.values(response.users));
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
  console.log("Managers:", managers[0]);
  return managers;
}
 

  

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

  
  

  // Define callback functions to handle selection changes
  const handleSelectionChange = (selection: any) => {
    setSelected(selection);
  };

  const handleSelectionChange2 = (selection2: any) => {
    setSelected2(selection2);
  };

  const dropdownItems1: any = users
    .map((player) => {
      if (selected2.keys().next().value !== player) {
        return (
          <Dropdown.Item css={{ color: "white" }} key={player}>
            {player}
          </Dropdown.Item>
        );
      }
      return undefined;
    })
    .filter((item) => item !== undefined);

  const dropdownItems2: any = users
    .map((player) => {
      if (selected.keys().next().value !== player) {
        return (
          <Dropdown.Item css={{ color: "#af1222" }} key={player}>
            {player}
          </Dropdown.Item>
        );
      }
      return undefined;
    })
    .filter((item) => item !== undefined);
    

   
    useEffect(() => {
      //..etLeagueTeamManagers();
      axios
        .get('http://localhost:3001/api/players')
        .then((response) => {
          const playersData = response.data;
          // Process and use the data as needed
          console.log(playersData["4017"]);
        })
        .catch((error) => {
          console.error('Error while fetching players data:', error);
        });
    }, [users]);

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
      {/* Modal */}
    </div>
  );
};

export default matchups;
