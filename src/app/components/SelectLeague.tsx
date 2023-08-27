"use client";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";

import NavBar from "./Navbar";

type myProps = {
  username: string;
  usernameSubmitted: boolean;
  selectedSeason: string;
};

interface LeagueState {
  name: string;
  league_id: string;
}

export default function page(props: myProps) {
  const [leagueData, setLeagueData] = useState([]);
  const [userFound, setUserFound] = useState(true);
  const [userId, setUserId] = useState("");
  const [leagueID, setLeagueID] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<LeagueState>({
    name: "",
    league_id: "",
  });

  const router = useRouter();

  // Grabbing a user with the username we recieved from home page.
  const getUser = async () => {
    const response = await axios.get(
      `https://api.sleeper.app/v1/user/${props.username}`
    );
    const data = response.data;
    setUserId(data.user_id);
  };

  // Grabbing users league data (all the leagues they are in) and passing it into array
  const getUserLeaguesData = async () => {
    const response = await axios.get(
      `https://api.sleeper.app/v1/user/${userId}/leagues/nfl/${props.selectedSeason}`
    );

    const leagueData = response.data;
    if (leagueData.length === 0) setUserFound(false);
    setLeagueData(leagueData);
  };

  //re-rendering data when we confirm user has submitted the form on home page. Also re-rendering when we succesfuly make a user call and get back data from getUser()
  useEffect(() => {
    getUser();
    getUserLeaguesData();
  }, [props.usernameSubmitted, userId]);

  useEffect(() => {}, [loading]);

  // const [context, setContext] = useContext(LeagueContext);
  // const [selectedLeagueContext, setSelectedLeagueContext] = useContext(
  //   SelectedLeagueContext
  // );

  // setContext(leagueData);

  return (
    <div>
      {leagueData.length > 0
        ? leagueData.map((league: any) => (
            <div
              className={
                props.usernameSubmitted
                  ? `flex items-center p-1 mt-3`
                  : `hidden`
              }
            >
              <div
                className="mr-2 flex items-center text-[15px] font-bold text-black dark:text-white"
                key={league.name}
              >
                <Image
                  src={`https://sleepercdn.com/avatars/thumbs/${league.avatar}`}
                  alt="league-image"
                  width={30}
                  height={30}
                  className="rounded-full mr-1"
                />
                {league.name}
              </div>
              <button
                onClick={() => {
                  //setSelectedLeagueContext(league);

                  localStorage.setItem("selectedLeagueID", league.league_id);
                  localStorage.setItem("selectedLeagueName", league.name);
                  setLoading(!loading);
                  router.push(
                    `/league/${localStorage.getItem("selectedLeagueID")}`
                  );
                  router.refresh();
                }}
                className="text-[12px] text-[#af1222] border-2 border-[#af1222] p-1  rounded hover:bg-[#1a1a1a] cursor-pointer"
              >
                Select League
              </button>
            </div>
          ))
        : ""}
    </div>
  );
}
