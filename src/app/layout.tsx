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
        className={`${inter.className} flex  bg-[#EDEDED] dark:bg-[#000000] from-1a1a1c to-AF1222 text-[#1a1a1c] dark:text-[#EDEDED]  mx-auto p-4 font-[${inter}] w-[100vw] h-screen`}
      >
        <Providers>
          <div className="flex flex-col xl:grid xl:grid-cols-8">
            <div className="block xl:col-start-1 xl:col-end-2">
              <NavBar usernameSubmitted={true} leagueID="" />
            </div>
            <div className="block xl:col-start-3 xl:col-end-8 ">
              <Themechanger />
              <div className="">
                <Scoreboard />
              </div>

              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
