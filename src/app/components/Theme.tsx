"use client";
import { ThemeProvider } from "next-themes";
import { ReactNode, useState } from "react";
import LeagueContext from "../context/LeagueContext";
import SelectedLeagueContext from "../context/SelectedLeagueContext";

const Providers = ({ children }: { children: ReactNode }) => {
  const [context, setContext] = useState({});
  const [selectedLeagueContext, setSelectedLeagueContext] = useState({});
  const [seasonContext, setSeasonContext] = useState(null);
  return (
    <LeagueContext.Provider value={[context, setContext]}>
      <SelectedLeagueContext.Provider
        value={[selectedLeagueContext, setSelectedLeagueContext]}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </SelectedLeagueContext.Provider>
    </LeagueContext.Provider>
  );
};

export default Providers;
