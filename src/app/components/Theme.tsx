"use client";
import { ThemeProvider } from "next-themes";
import { ReactNode, useState } from "react";
import LeagueContext from "../context/LeagueContext";

const Providers = ({ children }: { children: ReactNode }) => {
  const [context, setContext] = useState({});
  const [statsContext, setStatsContext] = useState({});
  const [seasonContext, setSeasonContext] = useState(null);
  return (
    <LeagueContext.Provider value={[context, setContext]}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </LeagueContext.Provider>
  );
};

export default Providers;
