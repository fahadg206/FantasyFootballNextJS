"use client";
import React, { useState } from "react";

export const TicketForm = () => {
  const [selectedOption, setSelectedOption] = useState("");

  const handleSelectChange = (e) => {
    setSelectedOption(e.target.value);
  };
  return (
    <div
      name="report"
      className="w-full rounded-xl bg-[#e0dfdf] dark:bg-[#0a0a0a] flex justify-center items-center p-4 mt-3"
    >
      <form
        method="POST"
        action="https://getform.io/f/5c7b4a19-5394-4fef-9e03-ca2ceeef2fca"
        className="flex flex-col max-w-[600px] w-full"
      >
        <div className="pb-8">
          <p className="text-3xl font-bold inline border-b-[1px] border-opacity-20 p-1 border-[#af1222] ">
            Report An Issue
          </p>
          <p className=" py-4">
            Submit the form below to report an issue. Please be descriptive!
          </p>
        </div>
        <input
          className=" p-2"
          type="text"
          placeholder="Sleeper Username"
          name="Sleeper Username"
        />
        <input
          className=" p-2"
          type="text"
          placeholder="League Name"
          name="League Name"
        />
        <select
          className=" w-full  px-4 py-2 text-[#9CA3AB]"
          id="select"
          value={selectedOption}
          onChange={handleSelectChange}
          name="page"
        >
          <option value="N/A">Select Page</option>
          <option value="Home">Home</option>
          <option value="Articles">Articles</option>
          <option value="Rivalry">Rivalry</option>
          <option value="Schedule">Schedule</option>
          <option value="Standings">Standings</option>
          <option value="League Managers">League Managers</option>
          <option value="Other">Other</option>
        </select>
        <textarea
          className=" p-2"
          name="message"
          rows="10"
          placeholder="Message..."
        ></textarea>
        <button className="border-[1px] border-opacity-20 hover:bg-[#af1222] rounded-xl border-[#af1222] px-4 py-3 my-8 mx-auto flex items-center">
          Submit!
        </button>
      </form>
    </div>
  );
};
