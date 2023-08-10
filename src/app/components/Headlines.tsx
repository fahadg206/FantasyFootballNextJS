"use client";
import React, { useState } from "react";
import { BiSolidNews } from "react-icons/bi";

const Headlines = () => {
  const [showStories, setShowStories] = useState(false);
  const [showHeadlines, setShowHeadlines] = useState(false);

  const showStoriesContent = (
    <div className="transition duration-500 ease-in-out">
      <p>Yo</p>
      <p>Yo</p>
      <p>Yo</p>
    </div>
  );

  const showHeadlinesContent = (
    <div className="transition duration-500 ease-in-out">
      <div className="flex flex-col justify-around text-center text-[15px] h-[40vh] ">
        <span className="flex items-center ">
          <BiSolidNews className="text-[30px] text-center" />
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
        </span>
        <span className="flex items-center ">
          <BiSolidNews className="text-[30px] text-center" />
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
        </span>
        <span className="flex items-center ">
          <BiSolidNews className="text-[30px] text-center" />
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
        </span>
        <span className="flex items-center ">
          <BiSolidNews className="text-[30px] text-center" />
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
        </span>
        <span className="flex items-center ">
          <BiSolidNews className="text-[30px] text-center" />
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
        </span>
        <span className="flex items-center ">
          <BiSolidNews className="text-[30px] text-center" />
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
        </span>
      </div>
    </div>
  );

  return (
    <div className="border-[1px] border-[#1a1a1a] rounded-lg p-1 w-[15vw]">
      <div className="flex justify-around border-b-[1px] border-[#1a1a1a]">
        <p
          onClick={() => {
            setShowHeadlines(true);
            setShowStories(false);
          }}
          className="hover:bg-[#1a1a1a] cursor-pointer duration-500"
        >
          Headlines
        </p>
        <p
          onClick={() => {
            setShowStories(true);
            setShowHeadlines(false);
          }}
          className="hover:bg-[#1a1a1a] cursor-pointer duration-500"
        >
          Stories
        </p>
      </div>
      {showStories ? (
        <div>{showStoriesContent}</div>
      ) : showHeadlines ? (
        <div>{showHeadlinesContent}</div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Headlines;
