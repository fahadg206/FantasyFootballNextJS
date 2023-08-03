"use client";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import LeagueContext from "../../../context/LeagueContext";
import SelectedLeagueContext from "@/app/context/SelectedLeagueContext";

import NavBar from "../../../components/Navbar";
import { LucideArrowUpRightSquare } from "lucide-react";
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
  const [userId, setUserId] = useState("");
  const [leagueID, setLeagueID] = useState("");
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
    setLeagueData(leagueData);
  };

  //re-rendering data when we confirm user has submitted the form on home page. Also re-rendering when we succesfuly make a user call and get back data from getUser()
  useEffect(() => {
    getUser();
    getUserLeaguesData();
  }, [props.usernameSubmitted, userId]);

  const [context, setContext] = useContext(LeagueContext);
  const [selectedLeagueContext, setSelectedLeagueContext] = useContext(
    SelectedLeagueContext
  );

  setContext(leagueData);

  return (
    <div>
      {leagueData.length > 0 ? (
        leagueData.map((league: any) => (
          <div className="flex p-1">
            <h1 className="mr-2" key={league.name}>
              {league.name}
            </h1>
            <button
              onClick={() => {
                setSelectedLeagueContext(league);
                localStorage.setItem("selectedLeagueID", league.league_id);
                localStorage.setItem("selectedLeagueName", league.name);
                router.push(
                  `/league/${localStorage.getItem("selectedLeagueID")}`
                );
              }}
              className="text-[15px] text-[#af1222] border-2 border-[#af1222] p-1 bg-[black] rounded hover:bg-[#1a1a1a]"
            >
              Select League
            </button>
          </div>
        ))
      ) : (
        <h1></h1>
      )}

      {/* {setSelectedLeagueContext(selectedLeague)} */}
      {/* {console.log(selectedLeague.league_id)} */}
      <NavBar usernameSubmitted={props.usernameSubmitted} leagueID="" />
    </div>
  );
}
