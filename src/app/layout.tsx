import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Scoreboard from "./components/Scoreboard";
import Providers from "./components/Theme";
import Themechanger from "./components/ThemeChanger";
import LeagueContext from "./context/LeagueContext";
import { useContext, useEffect } from "react";

import Footer from "./components/Footer";
import NavBar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RainCityLeague",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} flex space-around bg-[#EDEDED] dark:bg-[#000000] from-1a1a1c to-AF1222 text-[#1a1a1c] dark:text-[#EDEDED]  mx-auto p-4 font-[${inter}] w-screen h-screen`}
      >
        <Providers>
          <div className="flex flex-col flex-1">
            <NavBar usernameSubmitted={true} leagueID="" />
          </div>
          <div className="flex flex-col items-start  w-[73%] mr-[20px]">
            <Themechanger />
            <div className="">
              <Scoreboard />
            </div>

            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
