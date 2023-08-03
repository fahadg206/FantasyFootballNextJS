"use client";
import React from "react";

const page = () => {
  return (
    <div className="w-[60vw] text-center bg-[green] ">
      {`Welcome to ${localStorage.getItem("selectedLeagueName")}!`}{" "}
    </div>
  );
};

export default page;
