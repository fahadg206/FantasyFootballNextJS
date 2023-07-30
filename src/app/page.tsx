// import useSWR from "swr";
// import axios from "axios";

// type UserData = {
//   username: string;
//   user_id: number;
//   display_name: string;
//   avatar: string;
// };

// export default function page() {
//   const fetcher = async (url: string) => {
//     const response = await axios.get(url);
//     return response.data;
//   };

//   const {
//     data: userData,
//     error: userError,
//     isLoading,
//   } = useSWR("https://api.sleeper.app/v1/user/_fg", fetcher);

//   if (userError) console.log("Error");
//   if (!userData) return console.log("loading...");
//   if (isLoading) return <h1>Loading....</h1>;

//   console.log(userData);
//   return <div>{userData.display_name}</div>;
// }
"use client";
import React from "react";
import Standings from "./league/[leagueID]/standings/page";

import { useState, useEffect } from "react";
import {
  Modal,
  useModal,
  Button,
  Text,
  Input,
  Navbar,
} from "@nextui-org/react";
import { FaSearch } from "react-icons/fa";
import NavBar from "./components/Navbar";

export default function Home() {
  const options = ["2020", "2021", "2022"];
  /* SAVING USERNAME INPUT INTO LOCALSTORAGE. CLEARING LOCAL STORAGE IF EMPTY. PASSING USERNAME AND YEAR SELECTED TO PROPS  */
  const [text, setText] = useState("");
  const [usernameSubmitted, setUsernameSubmitted] = useState(false);
  const [storedUsernames, setStoredUsernames] = useState(new Array());

  const [selectedSeason, setSelectedSeason] = useState(options[0]);

  // const handleSelect = (option: string) => {
  //   setSelectedOption(option);
  //   onSelect(option);
  // };
  //Fantasy Years

  //Displays the selected year
  const handleSelection = (selectedOption: string) => {
    //console.log("Selected option:", selectedOption);
    setSelectedSeason(selectedOption);
    // Do something with the selected option if needed.
  };

  useEffect(() => {
    if ("usernames" in localStorage) {
      setStoredUsernames(
        JSON.parse(localStorage.getItem("usernames") as string)
      );
    }
  }, []);

  const onStorageCleared = () => {
    localStorage.clear();
    setStoredUsernames([]);
    setText("");
  };

  const onFormSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setUsernameSubmitted(true);
    if (!storedUsernames.includes(text.toLowerCase()) && text != "") {
      storedUsernames.push(text.toLowerCase());
      localStorage.setItem("usernames", JSON.stringify(storedUsernames));
    }
  };
  // console.log(usernameSubmitted);
  // console.log(text);
  // console.log(storedUsernames);

  const textChanged = (username: string) => {
    if (usernameSubmitted) {
      setUsernameSubmitted(false);
    }
    setText(username);
  };

  /* ^ sSAVING USERNAME INPUT INTO LOCALSTORAGE. CLEARING LOCAL STORAGE IF EMPTY. PASSING USERNAME AND YEAR SELECTED TO PROPS ^ */
  return (
    <div
      className={`text-3xl text-white  flex flex-col justify-start items-center gap-10 border-2 border-[#af1222] h-[60vh] bg-[url('./images/youtube-video-gif.gif')] bg-[length:470px_800px] md:bg-[url('./images/youtube-video-gif.gif')] bg-no-repeat md:bg-cover`}
    >
      <div className="mt-3">Welcome to {"League Name"}</div>
      <div className="grid-cols-1 justify-center text-center lg:flex ">
        <form onSubmit={onFormSubmit}>
          <Input
            onChange={(e) => {
              textChanged(e.target.value);
            }}
            size="lg"
            width="60vw"
            type="text"
            labelPlaceholder="Search owners, matchups, or stats"
            css={{
              color: "white",
              fontSize: "40px",
              "@smMax": {
                width: "90vw",
              },
            }}
            value={text}
            className="p-1 rounded-lg  focus:rounded-lg border-rounded focus:ring focus:ring-[#af1222] focus:border-[#af1222] w-[70vw] md:w-[50vw] bg-[#050505] text-[11px] md:text-[16px]"
          />
          <div className="w-screen flex justify-center mt-3  md:mt-0 items-center md:ml-2  md:block md:w-[0vw]">
            <button>Submit</button>
            <Button onClick={onStorageCleared}>Clear</Button>
          </div>
        </form>
      </div>
      <div>
        <select
          value={selectedSeason}
          onChange={(e) => handleSelection(e.target.value)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <Standings
        usernameSubmitted={usernameSubmitted}
        username={text}
        selectedSeason={selectedSeason}
      />
    </div>
  );
}
