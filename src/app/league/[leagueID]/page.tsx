"use client";
import React from "react";

const page = () => {
  return (
    <div className="w-screen text-center">
      {`Welcome to ${localStorage.getItem("selectedLeagueName")}!`}{" "}
    </div>
  );
};

export default page;
