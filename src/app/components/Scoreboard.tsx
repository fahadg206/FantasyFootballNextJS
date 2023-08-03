"use client";

import React, { useContext, useEffect, useState } from "react";
import Imran from "../images/scary_imran.png";
import Image from "next/image";
import LeagueContext from "../context/LeagueContext";
import SelectedLeagueContext from "../context/SelectedLeagueContext";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

interface UserData {
  avatar: string;
  name: string;
  roster_id?: string;
  starters?: [];
  team_points?: string;
  matchup_id?: string;
  opponent?: string;
  user_id: string;
}

interface NflState {
  season: string;
  display_week: number;
  season_type: string;
  // Add other properties as needed
}

interface ScheduleData {
  [key: string]: {
    avatar: string;
    name: string;
    roster_id?: string;
  };
}

interface Player {
  user_id: string;
  roster_id: string;
  matchup_id: string;
  team_points: string;
  starters: string;
  opponent: string;
}

interface Team {
  roster_id: string;
  avatar: string;
  name: string;
}

interface Matchup {
  matchup_id: string;
  roster_id: string;
  points: number;
}

export default function Scoreboard() {
  const [context, setContext] = useContext(LeagueContext);
  const [selectedLeagueContext, setSelectedLeagueContext] = useContext(
    SelectedLeagueContext
  );
  const [playersData, setPlayersData] = React.useState([]);
  const REACT_APP_LEAGUE_ID: string = selectedLeagueContext.league_id;
  const [schedule, setSchedule] = useState<any[]>([]); // Replace 'any' with appropriate type if possible
  const [weeklyMatchups, setWeeklyMatchups] = useState<Map<string, UserData>>(
    new Map()
  );
  const [users, setUsers] = useState<UserData[]>([]);

  const [rosters, setRosters] = useState<any[]>([]); // Replace 'any' with appropriate type if possible

  const [week, setWeek] = useState<number>();

  // const [matchupPolls, setMatchupPolls] = useState<Map<string, PollAnswer[]>>(
  //   new Map()
  // );

  const postedMatchups = new Map();
  const scoreBoardPostedMatchups = new Map();
  const pollStyles1 = {
    questionBold: true,
    questionColor: "black",
    theme: "black",
    align: "center",
  };

  const scheduleData: Map<string, UserData> = new Map();

  const navbarMatchup: any = [];

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

  const getSchedule = async () => {
    const nflState: NflState = await getNflState();
    let week = 1;
    if (nflState.season_type === "regular") {
      week = nflState.display_week;
    } else if (nflState.season_type === "post") {
      week = 18;
    }
    setWeek(week);

    //returns roster id & matchup id
    const response = await axios.get<any>(
      `https://api.sleeper.app/v1/league/${REACT_APP_LEAGUE_ID}/matchups/${week}`
    );
    setSchedule(response.data);
    console.log("Matchups, ", response);
  };

  const getUsers = async () => {
    // returns user id, name, avatar
    const response = await axios.get<any>(
      `https://api.sleeper.app/v1/league/${REACT_APP_LEAGUE_ID}/users`
    );
    // Setting the avatar and name in this function and giving a default value to roster_id if it doesn't exist
    for (let i = 0; i < response.data.length; i++) {
      scheduleData.set(response.data[i].user_id, {
        avatar: `https://sleepercdn.com/avatars/thumbs/${response.data[i].avatar}`,
        name: response.data[i].display_name,
        roster_id:
          scheduleData.get(response.data[i].user_id)?.roster_id || "loading",
        user_id: response.data[i].user_id,
      });
    }
    console.log("Response! ", response);
    setUsers(response.data);

    setWeeklyMatchups(scheduleData);
  };

  const getRoster = async () => {
    // returns user id, roster id
    const response = await axios.get<any>(
      `https://api.sleeper.app/v1/league/${REACT_APP_LEAGUE_ID}/rosters`
    );
    // Setting the roster_id in this function and giving a default value to avatar and name if they don't exist
    for (let i = 0; i < response.data.length; i++) {
      scheduleData.set(response.data[i].owner_id, {
        avatar:
          scheduleData.get(response.data[i].owner_id)?.avatar || "loading",
        name: scheduleData.get(response.data[i].owner_id)?.name || "loading",
        roster_id: response.data[i].roster_id,
        user_id: response.data[i].owner_id,
      });
    }
    setRosters(response.data);
    setWeeklyMatchups(scheduleData);
  };

  useEffect(() => {
    console.log("Getting called");
    getSchedule();
    getUsers();
    getRoster();
  }, [selectedLeagueContext.league_id, JSON.stringify(weeklyMatchups)]);

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

  const showScoreboard = () => {
    if (selectedLeagueContext.league_id) {
      console.log("Weekly ", weeklyMatchups);
      // Ensure that weeklyMatchups includes additional attributes not set in the api calls earlier
      [...weeklyMatchups.values()].map((player: UserData) => {
        for (let i = 0; i < schedule.length; i++) {
          if (player.roster_id === schedule[i].roster_id) {
            let matchup = schedule.filter(
              (team: Matchup) => team.matchup_id === schedule[i].matchup_id
            );
            let team1 = [...weeklyMatchups.values()].find(
              (team: UserData) => team.roster_id === matchup[0].roster_id
            );
            let team2 = [...weeklyMatchups.values()].find(
              (team: UserData) => team.roster_id === matchup[1].roster_id
            );
            if (player.roster_id === matchup[0].roster_id) {
              player.matchup_id = matchup[0].matchup_id;
              player.team_points = matchup[0].points;
              player.starters = matchup[0].starters;
              player.opponent = team2?.name;
            } else if (player.roster_id === matchup[1].roster_id) {
              player.matchup_id = matchup[1].matchup_id;
              player.team_points = matchup[1].points;
              player.starters = matchup[1].starters;
              player.opponent = team1?.name;
            }
          }
        }
      });

      // Now that weekly matchups contains all required fields, we can now map through it
      const loadedWeeklyMatches = [...weeklyMatchups.values()].map(
        (player: UserData) => {
          return (
            <div key={player.user_id} className="text-[black] flex">
              <div key={player.roster_id}>
                {(() => {
                  let matchupText;
                  for (let i = 0; i < schedule.length; i++) {
                    if (
                      player.roster_id === schedule[i].roster_id &&
                      !scoreBoardPostedMatchups.has(player.matchup_id)
                    ) {
                      let matchup = schedule.filter(
                        (team: Matchup) =>
                          team.matchup_id === schedule[i].matchup_id
                      );
                      let team1 = [...weeklyMatchups.values()].find(
                        (team: UserData) =>
                          team.roster_id === matchup[0].roster_id
                      );
                      let team2 = [...weeklyMatchups.values()].find(
                        (team: UserData) =>
                          team.roster_id === matchup[1].roster_id
                      );

                      scoreBoardPostedMatchups.set(
                        matchup[0].matchup_id,
                        team1
                      );

                      console.log("Team 1", team1?.name, team1.starters);
                      console.log("Team 2", team2?.name, team2.starters);

                      let team1Proj = 0.0;
                      let team2Proj = 0.0;
                      //console.log("team 1, ", team1.starters);
                      // ...

                      if (team1?.starters) {
                        for (const currPlayer of team1.starters) {
                          if (
                            playersData[currPlayer] &&
                            playersData[currPlayer].wi &&
                            playersData[currPlayer].wi[week?.toString()] &&
                            playersData[currPlayer].wi[week?.toString()].p !==
                              undefined
                          ) {
                            team1Proj += parseFloat(
                              playersData[currPlayer].wi[week?.toString()].p
                            );
                          }
                        }

                        console.log(
                          "Here's the first teams proj ",
                          team1.name,
                          team1Proj
                        );
                      }

                      if (team2?.starters) {
                        for (const currPlayer of team2.starters) {
                          if (
                            playersData[currPlayer] &&
                            playersData[currPlayer].wi &&
                            playersData[currPlayer].wi[week?.toString()] &&
                            playersData[currPlayer].wi[week?.toString()].p !==
                              undefined
                          ) {
                            team2Proj += parseFloat(
                              playersData[currPlayer].wi[week?.toString()].p
                            );
                          }
                        }

                        console.log(
                          "Here's the second teams proj ",
                          team2.name,
                          team2Proj
                        );
                      }

                      // ...

                      matchupText = (
                        <div>
                          <div className="text-black">
                            <div
                              className={`team1 flex items-center mb-[5px] ${
                                matchup[0].points > matchup[1].points
                                  ? `font-bold`
                                  : matchup[0].points === matchup[1].points
                                  ? `text-[black]`
                                  : `text-[grey]`
                              } `}
                            >
                              <img
                                className=" w-[25px] my-[5px] mr-[5px] rounded-[50px]"
                                src={team1.avatar}
                              />
                              <p className="text-[10px] mr-[5px]">
                                {team1.name}
                              </p>
                              <p className="text-[10px]">
                                {Math.round(matchup[0].points * 10) / 10}
                              </p>
                            </div>

                            <div
                              className={`team2 flex items-center mb-[5px] ${
                                matchup[1].points > matchup[0].points
                                  ? `font-bold`
                                  : matchup[1].points === matchup[0].points
                                  ? `text-[black]`
                                  : `text-[grey]`
                              } `}
                            >
                              <img
                                className="w-[25px] mr-[5px] rounded-[50px]"
                                src={team2.avatar}
                              ></img>
                              <p className="text-[10px] mr-[5px]">
                                {team2.name}
                              </p>
                              <p className="text-[10px]">
                                {Math.round(matchup[1].points * 10) / 10}
                              </p>
                            </div>
                            <p className="text-[10px] mr-[5px]">
                              {team1Proj > team2Proj
                                ? team1?.name +
                                  " -" +
                                  Math.round(team1Proj - team2Proj)
                                : team2?.name +
                                  " -" +
                                  Math.round(team2Proj - team1Proj)}
                            </p>
                          </div>
                        </div>
                      );
                      console.log("YO");
                      navbarMatchup.push(matchupText);
                      console.log("Nav", navbarMatchup);
                    }
                  }

                  return matchupText;
                })()}
              </div>
            </div>
          );
        }
      );
      return (
        <div
          key={uuidv4()}
          className="flex flex-wrap lg:flex-row md:flex-row justify-between items-center w-full opacity-100 text-black "
        >
          <div className="mx-2 my-2 shadow-md shadow-[black] hover:scale-110  hover:shadow-#D1D5DB duration-500 p-[10px] rounded-[20px] bg-[#F9F9FB] w-[140px] flex justify-center">
            {navbarMatchup[0]}
          </div>

          <div className="mx-2 my-2 shadow-md shadow-[black]  hover:scale-110 hover:shadow-#D1D5DB duration-500 p-[10px] rounded-[20px] bg-[#F9F9FB] w-[140px] flex justify-center">
            {navbarMatchup[1]}
          </div>

          <div className="mx-2 my-2 shadow-md shadow-[black] hover:scale-110 hover:shadow-#D1D5DB duration-500 p-[10px] rounded-[20px] bg-[#F9F9FB] w-[140px] flex justify-center">
            {navbarMatchup[2]}
          </div>

          <div className="mx-2 my-2 shadow-md shadow-[black] hover:scale-110 hover:shadow-#D1D5DB duration-500 p-[10px] rounded-[20px] bg-[#F9F9FB] w-[140px] flex justify-center">
            {navbarMatchup[3]}
          </div>

          <div className="mx-2 my-2 shadow-md shadow-[black] hover:scale-110 hover:shadow-#D1D5DB duration-500 p-[10px] rounded-[20px] bg-[#F9F9FB] w-[140px] flex justify-center">
            {navbarMatchup[4]}
          </div>

          <div className="mx-2 my-2 shadow-md shadow-[black] hover:scale-110 hover:shadow-#D1D5DB duration-500 p-[10px] rounded-[20px] bg-[#F9F9FB] w-[140px] flex justify-center">
            {navbarMatchup[5]}
          </div>
        </div>
      );
    }
  };

  useEffect(() => {
    showScoreboard();
  }, [selectedLeagueContext.league_id]);
  const weeklyMatches = [...weeklyMatchups.values()].map((player) => {
    return (
      <div key={player.user_id} className="text-[black]">
        <div key={player.roster_id}>
          {(function () {
            let matchupText;
            // We loop through schedule, which is the array containing the matchup ids, roster ids and points for each team

            for (let i = 0; i < schedule.length; i++) {
              if (
                player.roster_id === schedule[i].roster_id &&
                !postedMatchups.has(schedule[i].matchup_id)
              ) {
                // Creating a smaller array containing only the information of the two teams with the same matchup id as the current element we are on (player).
                let matchup = schedule.filter(
                  (team) => team.matchup_id === schedule[i].matchup_id
                );
                // In order to retrieve the remaining information for the pair of teams, we searched through the weeklyMatchups map
                // and stored the object that's returned (which contains the name, avatar etc) into these variables
                let team1 = [...weeklyMatchups.values()].find(
                  (team) => team.roster_id === matchup[0].roster_id
                );
                let team2 = [...weeklyMatchups.values()].find(
                  (team) => team.roster_id === matchup[1].roster_id
                );

                postedMatchups.set(matchup[0].matchup_id, team1);

                const abv = new Map();
                abv.set(5, "Ganay");
                abv.set(6, "FG😁");
                abv.set(1, "Kabo👟");
                abv.set(7, "Jefe");
                abv.set(8, `Sleepy🔑`);
                abv.set(2, "Sal");
                abv.set(4, "YSL");
                abv.set(3, "Lock👨‍👦");
                abv.set(10, "Edo");
                abv.set(12, "King🐍");
                abv.set(9, "6'3");
                abv.set(11, "Gojo💤");

                matchupText = (
                  <div className="grid grid-cols-1  lg:flex items-center content-center text-center mb-[30px] p-8 w-[80vw] text-black rounded-[15px] bg-white shadow-lg shadow-black">
                    <div className="flex justify-between items-center w-[70vw]">
                      <div className="team1 flex items-center">
                        <div className="skew">
                          <p className="hidden sm:block text-2xl font-bold mr-[5px] text-white names pt-7">
                            {abv.get(team1.roster_id)}
                          </p>
                          <img
                            className="w-[50px] rounded-full my-[5px] mr-[5px]  pt-7 ml-3 sm:hidden"
                            src={team1.avatar}
                          />
                        </div>
                        <img
                          className="hidden sm:block w-[30px] md:w-[50px] my-[5px] mr-[5px] rounded-full"
                          src={team1.avatar}
                        />
                        <p className="text-[12px] sm:text-2xl points">
                          {schedule[i].points === 0 ? "" : matchup[0].points}
                        </p>
                      </div>
                      <div className="hidden lg:block text-3xl">VS</div>
                      <div className="text-2xl block sm:hidden">-</div>
                      <div className="team2 flex items-center">
                        <p className="text-[12px] sm:text-2xl points mr-3">
                          {schedule[i].points === 0 ? "" : matchup[1].points}
                        </p>

                        <img
                          className="hidden sm:block w-[30px] md:w-[50px] my-[5px] rounded-full"
                          src={team2.avatar}
                        ></img>
                        <div className="skew2 mr-4">
                          <p className="hidden sm:block text-2xl text-white names pt-7 mr-3">
                            {abv.get(team2.roster_id)}
                          </p>
                          <img
                            className="w-[50px] md:w-[50px] my-[5px] mr-[5px] rounded-full pt-7 sm:hidden"
                            src={team2.avatar}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center lg:ml-auto"></div>
                  </div>
                );
              }
            }

            return matchupText;
          })()}
        </div>
      </div>
    );
  });
  const uniqueKey = uuidv4(); // Generate a unique key
  return (
    <div
      key={uniqueKey}
      className=" flex flex-col justify-center content-center w-full "
    >
      <div>{showScoreboard()}</div>;
      <p className="text-center text-2xl mb-[10px] font-bold">Week 15</p>
      <table className="flex flex-col items-center">
        <tr className="hidden sm:flex justify-between content-center gap-[20px] text-center p-[7px] border-2 mb-[10px] rounded-[15px] w-[80vw] bg-[#0a090afa] text-white">
          <th className=" ml-[50px]">Matchup</th>
          <th className="mr-[50px]">Favorite</th>
        </tr>
        <tr className="flex justify-evenly gap-[20px]">
          <tbody>{weeklyMatches}</tbody>
        </tr>
      </table>
    </div>
  );

  return <div>{showScoreboard()}</div>;
}
