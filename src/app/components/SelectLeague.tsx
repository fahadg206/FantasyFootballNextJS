"use client";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import helmet from "../images/helmet2.png";

import NavBar from "./Navbar";

type myProps = {
  username: string;
  usernameSubmitted: boolean;
  selectedSeason: string;
  usernameCleared: boolean;
};

interface LeagueState {
  name: string;
  league_id: string;
}

export default function Page(props: myProps) {
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
    if (!response || response === null) {
      setUserFound(false);
    }
    const data = response.data;
    setUserId(data.user_id);
  };

  // Grabbing users league data (all the leagues they are in) and passing it into array
  const getUserLeaguesData = async () => {
    const response = await axios.get(
      `https://api.sleeper.app/v1/user/${userId}/leagues/nfl/${props.selectedSeason}`
    );

    const leagueData = response.data;
    if (leagueData.length === 0 || leagueData === null) setUserFound(false);
    setLeagueData(leagueData);
  };

  if (props.usernameCleared) {
    setUserFound(true);
  }

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
    <div className="flex flex-col items-center justify-center">
      {leagueData.length > 0 ? (
        leagueData.map((league: any) => (
          <div
            key={league.league_id}
            className={
              props.usernameSubmitted && !props.usernameCleared
                ? `flex items-center p-1 mt-3`
                : `hidden`
            }
          >
            <div
              className="mr-2 flex items-center text-[15px] font-bold text-black dark:text-white"
              key={league.name}
            >
              <Image
                src={
                  !league.avatar
                    ? helmet
                    : `https://sleepercdn.com/avatars/thumbs/${league.avatar}`
                }
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
                localStorage.setItem("leagueStatus", league.status);
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
      ) : !userFound ? (
        <p>Invalid username</p>
      ) : (
        ""
      )}
      <div
        className={
          !props.usernameSubmitted || props.usernameCleared
            ? `flex items-center mt-4`
            : `hidden`
        }
      >
        <p className="italic text-[13px] text-[#807c7c] mr-2">
          {"Don't have a Sleeper account?"}
        </p>
        <button
          onClick={() => {
            //setSelectedLeagueContext(league);
            console.log(props.selectedSeason);

            localStorage.setItem("selectedLeagueID", "982124415926300672");
            localStorage.setItem("selectedLeagueName", "Dynasty League");
            setLoading(!loading);
            router.push(`/league/${localStorage.getItem("selectedLeagueID")}`);
            router.refresh();
          }}
          className="text-[12px] text-[#af1222] border-2 border-[#af1222] p-1  rounded hover:bg-[#1a1a1a] cursor-pointer"
        >
          {"Demo"}
        </button>
      </div>
    </div>
  );
}
