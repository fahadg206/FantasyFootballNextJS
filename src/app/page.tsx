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
import Logo from "./images/Transparent.png";
import Image from "next/image";
import SelectLeague from "./components/SelectLeague";

export default function Home() {
  const options = ["2020", "2021", "2022", "2023"];
  /* SAVING USERNAME INPUT INTO LOCALSTORAGE. CLEARING LOCAL STORAGE IF EMPTY. PASSING USERNAME AND YEAR SELECTED TO PROPS  */
  const [text, setText] = useState("");
  const [usernameSubmitted, setUsernameSubmitted] = useState(false);
  const [storedUsernames, setStoredUsernames] = useState(new Array());
  const [cleared, setCleared] = useState(false);

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
    localStorage.removeItem("selectedLeagueID");
    localStorage.removeItem("selectedLeagueName");
    localStorage.removeItem("usernameSubmitted");
    localStorage.removeItem("usernames");
    setStoredUsernames([]);
    setText("");
    setCleared(true);
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

  useEffect(() => {
    localStorage.setItem(
      "usernameSubmitted",
      JSON.stringify(usernameSubmitted)
    );
  }, [usernameSubmitted]);

  const usernames = JSON.parse(localStorage.getItem("usernames"));
  console.log(usernames);

  let showUsernames;

  if (usernames) {
    showUsernames = usernames.map((username: string) => {
      return (
        <div
          onClick={() => {
            setUsernameSubmitted(false);
            setText(username);
          }}
          className=" text-[#af1222] border-b-[1px] border-[#af1222] text-[12px]  hover:bg-[#1a1a1a] mr-2 cursor-pointer"
        >
          {username}
        </div>
      );
    });
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
    <div className={`text-xl text-white  h-screen  flex absolute left-0 `}>
      <div className="flex flex-col justify-center h-screen items-center w-screen">
        <Image src={Logo} width={500} height={500} alt="logo" />
        <div className=" ">
          <form onSubmit={onFormSubmit}>
            <Input
              onChange={(e) => {
                textChanged(e.target.value);
              }}
              size="lg"
              width="60vw"
              type="text"
              labelPlaceholder="Search Sleeper Username"
              css={{
                fontSize: "40px",
                "@smMax": {
                  width: "90vw",
                },
              }}
              value={text}
              className="p-1 rounded-lg  focus:rounded-lg border-rounded focus:ring focus:ring-[#af1222] focus:border-[#af1222] border-[#af1222] border-[1px] dark:border-none text-[11px] md:text-[16px]"
            />
            <div className="w-[screen] flex justify-center items-center mt-3 ">
              <button className="text-[#af1222] border-2 border-[#af1222] p-1  rounded hover:bg-[#1a1a1a] cursor-pointer mr-2 text-[14px]">
                Submit
              </button>
              <button
                onClick={onStorageCleared}
                className="text-[#af1222] border-2 border-[#af1222] p-1  rounded hover:bg-[#1a1a1a] cursor-pointer mr-2 text-[14px]"
              >
                Clear
              </button>
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
            </div>
            <div className="flex  justify-center items-center mt-3">
              <p className="text-[#807c7c] italic text-[12px] mr-5">
                Recent Searches:
              </p>
              {showUsernames}
            </div>
          </form>
        </div>
        <div>
          <SelectLeague
            usernameSubmitted={usernameSubmitted}
            username={text}
            selectedSeason={selectedSeason}
            onClear={onStorageCleared}
          />
        </div>
      </div>
    </div>
  );
}
