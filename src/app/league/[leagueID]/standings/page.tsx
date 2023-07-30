import { useEffect, useState, useContext } from "react";
import axios from "axios";

import LeagueContext from "../../../context/LeagueContext";

import NavBar from "@/app/components/Navbar";
import { LucideArrowUpRightSquare } from "lucide-react";
type myProps = {
  username: string;
  usernameSubmitted: boolean;
  selectedSeason: string;
};

export default function page(props: myProps) {
  const [leagueData, setLeagueData] = useState([]);
  const [userId, setUserId] = useState("");

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

  setContext(leagueData);

  return (
    <ul>
      <h1>{props.usernameSubmitted ? "true" : "false"}</h1>
      {leagueData.length > 0 ? (
        leagueData.map((league: any) => (
          <div>
            <h1 key={league.name}>
              {league.name}
              {props.selectedSeason}
            </h1>
            <div className="text-3xl text-green-900"></div>
          </div>
        ))
      ) : (
        <h1>User not found or League Year not found</h1>
      )}
    </ul>
  );
}
