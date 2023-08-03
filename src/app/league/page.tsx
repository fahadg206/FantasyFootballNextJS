"use client";

import React, { useContext } from "react";
import SelectedLeagueContext from "../context/SelectedLeagueContext";

const page = () => {
  const [selectedLeagueContext, setSelectedLeagueContext] = useContext(
    SelectedLeagueContext
  );
  return (
    <div className="text-start">{`Welcome to ${selectedLeagueContext.name}!`}</div>
  );
};

export default page;
