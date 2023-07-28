import { useEffect, useState } from "react";

import axios from "axios";

type myProps = {
  username: string;
  usernameSubmitted: boolean;
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
      `https://api.sleeper.app/v1/user/${userId}/leagues/nfl/2022`
    );

    const leagueData = response.data;
    setLeagueData(leagueData);
  };

  //re-rendering data when we confirm user has submitted the form on home page. Also re-rendering when we succesfuly make a user call and get back data from getUser()
  useEffect(() => {
    getUser();
    getUserLeaguesData();
  }, [props.usernameSubmitted, userId]);

  return (
    <ul>
      <h1>{props.usernameSubmitted ? "true" : "false"}</h1>
      {leagueData.length > 0 ? (
        leagueData.map((league) => <h1 key={league.name}>{league.name}</h1>)
      ) : (
        <h1>No league data available.</h1>
      )}
    </ul>
  );
}
