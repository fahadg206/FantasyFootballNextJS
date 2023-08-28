import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Scoreboard from "./components/Scoreboard";
import Providers from "./components/Theme";
import Themechanger from "./components/ThemeChanger";
import { SelectedManagerProvider } from "./context/SelectedManagerContext";

import Footer from "./components/Footer";
import NavBar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fantasy Pulse",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} flex  bg-[#EDEDED] dark:bg-[#000000] from-1a1a1c to-AF1222 text-[#1a1a1c] dark:text-[#EDEDED]  mr-auto  font-[${inter}] w-[100vw] h-screen`}
      >
        <Providers>
          <SelectedManagerProvider>
            <div className="flex flex-col xl:grid xl:grid-cols-8">
              <div className="block xl:col-start-1  ">
                <NavBar usernameSubmitted={true} leagueID="" />
              </div>
              <div className="block xl:col-start-3 xl:col-end-8 ">
                <div className="hidden xl:block">
                  <Themechanger />
                </div>

                <div className="flex w-[60vw]">
                  <Scoreboard />
                </div>
                <div className=" w-screen xl:w-[60vw] flex justify-center mt-2">
                  {children}
                </div>
              </div>
            </div>
          </SelectedManagerProvider>
        </Providers>
      </body>
    </html>
  );
}
