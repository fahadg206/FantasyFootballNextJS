"use client";
import React from "react";
import Standings from "./league/[leagueID]/standings/page";

import { useState, useEffect } from "react";
import { Input } from "@nextui-org/input";
import { FaSearch } from "react-icons/fa";
import NavBar from "./components/Navbar";
import Logo from "./images/Transparent.png";
import Image from "next/image";
import SelectLeague from "./components/SelectLeague";
import { useRouter } from "next/navigation";

export default function Home() {
  const options = ["2023"];
  /* SAVING USERNAME INPUT INTO LOCALSTORAGE. CLEARING LOCAL STORAGE IF EMPTY. PASSING USERNAME AND YEAR SELECTED TO PROPS  */
  const [text, setText] = useState("");
  const [usernameSubmitted, setUsernameSubmitted] = useState(false);
  const [storedUsernames, setStoredUsernames] = useState(new Array());
  const [cleared, setCleared] = useState(false);

  const [selectedSeason, setSelectedSeason] = useState(options[0]);
  const router = useRouter();

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
    setUsernameSubmitted(false);
  };

  if (typeof localStorage !== "undefined") {
    if (localStorage.getItem("selectedLeagueID")) {
      router.refresh();
    }
  }

  // console.log(selectedSeason);
  // console.log(usernameSubmitted);
  const onStorageCleared = () => {
    localStorage.removeItem("selectedLeagueID");
    localStorage.removeItem("selectedLeagueName");
    localStorage.removeItem("usernameSubmitted");
    localStorage.removeItem("usernames");
    setStoredUsernames([]);
    setText("");
    setUsernameSubmitted(false);
    //setCleared(true);
  };

  useEffect(() => {
    if ("usernames" in localStorage) {
      setStoredUsernames(
        JSON.parse(localStorage.getItem("usernames") as string)
      );
    }
  }, []);

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

  useEffect(() => {
    localStorage.setItem(
      "usernameSubmitted",
      JSON.stringify(usernameSubmitted)
    );
  }, [usernameSubmitted]);

  let showUsernames = null; // Initialize with null or an empty array depending on your needs

  if (typeof localStorage !== "undefined") {
    const usernames = JSON.parse(localStorage.getItem("usernames"));

    if (usernames && Array.isArray(usernames)) {
      showUsernames = usernames.map((username) => (
        <div
          key={username}
          onClick={() => {
            setUsernameSubmitted(false);
            setText(username);
          }}
          className="text-[#af1222] border-b-[1px] border-[#af1222] text-[12px] hover:bg-[#d4d0d0] dark:hover:bg-[#1a1a1a]  mr-2 cursor-pointer"
        >
          {username}
        </div>
      ));
    }
  } else {
    // Handle the situation where localStorage is not available
    // For example, you might show an error message or fallback content
    console.error("localStorage is not available");
  }
  // Retrieve the usernameSubmitted from local storage on component mount
  useEffect(() => {
    const savedUsernameSubmitted = JSON.parse(
      localStorage.getItem("usernameSubmitted") || "false"
    );
    setUsernameSubmitted(savedUsernameSubmitted);
  }, []);

  /* ^ sSAVING USERNAME INPUT INTO LOCALSTORAGE. CLEARING LOCAL STORAGE IF EMPTY. PASSING USERNAME AND YEAR SELECTED TO PROPS ^ */
  return (
    <div className={`text-xl   h-screen  flex absolute left-0 `}>
      <div className="flex flex-col justify-center h-screen items-center w-screen">
        <Image src={Logo} width={500} height={500} alt="logo" />
        <div className=" ">
          <form onSubmit={onFormSubmit}>
            <Input
              onChange={(e) => {
                textChanged(e.target.value);
              }}
              type="text"
              variant="bordered"
              size="sm"
              placeholder="Enter your Sleeper Username"
              value={text}
              className="p-1 rounded-xl focus:rounded-lg border-rounded focus:ring focus:ring-[#af1222] focus:border-[#af1222] border-[#af1222] border-2 text-[15px] w-[80vw] md:w-[60vw] h-[40px]"
            />

            <div className="w-[screen] flex justify-center items-center mt-3 ">
              <button className="text-[#af1222] border-2 border-[#af1222] p-1  rounded hover:bg-[#d4d0d0] dark:hover:bg-[#1a1a1a] cursor-pointer mr-2 text-[14px]">
                Submit
              </button>
            </div>
          </form>
          <div className="flex justify-center items-center mt-3">
            <button
              onClick={onStorageCleared}
              className="text-[#af1222] border-2 border-[#af1222] p-1  rounded hover:bg-[#d4d0d0] dark:hover:bg-[#1a1a1a] cursor-pointer mr-2 text-[14px]"
            >
              Clear
            </button>
            <div>
              <select
                value={selectedSeason}
                onChange={(e) => handleSelection(e.target.value)}
                className="text-[#af1222] border-2 py-1 rounded border-[#af1222] bg-white dark:bg-black"
              >
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex  justify-center items-center mt-3">
          <p className="text-[#807c7c] text-center italic text-[11px] mr-3">
            Recent Searches:
          </p>
          <div className="flex flex-wrap ">{showUsernames}</div>
        </div>
        <div>
          <SelectLeague
            usernameSubmitted={usernameSubmitted}
            username={text}
            selectedSeason={selectedSeason}
            usernameCleared={cleared}
          />
        </div>
      </div>
    </div>
  );
}
