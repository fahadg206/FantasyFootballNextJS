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

  useEffect(() => {
    localStorage.setItem(
      "usernameSubmitted",
      JSON.stringify(usernameSubmitted)
    );
  }, [usernameSubmitted]);

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
              labelPlaceholder="Search owners, matchups, or stats"
              css={{
                color: "white",
                fontSize: "40px",
                "@smMax": {
                  width: "90vw",
                },
              }}
              value={text}
              className="p-1 rounded-lg  focus:rounded-lg border-rounded focus:ring focus:ring-[#af1222] focus:border-[#af1222]  bg-[#050505] text-[11px] md:text-[16px]"
            />
            <div className="w-[screen] flex justify-center items-center mt-3 ">
              <button className="mr-2 text-[15px] bg-[#af1222] p-[2px] rounded">
                Submit
              </button>
              <button
                onClick={onStorageCleared}
                className="mr-2 text-[15px] bg-[#af1222] p-[2px] px-2 rounded"
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
          </form>
        </div>
        <div>
          <SelectLeague
            usernameSubmitted={usernameSubmitted}
            username={text}
            selectedSeason={selectedSeason}
          />
        </div>
      </div>
    </div>
  );
}
