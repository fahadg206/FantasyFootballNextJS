import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Scoreboard from "./components/Scoreboard";
import Navbar from "./components/Navbar";
import Providers from "./components/Theme";
import Themechanger from "./components/ThemeChanger";

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
        className={`${inter.className} bg-[#f0eaea] dark:bg-[#17181A] text-[#1a1a1c] dark:text-[#E9EBEA] container mx-auto p-4`}
      >
        <Providers>
          <div className="overflow-x-hidden">
            <Themechanger />
            <Scoreboard />
            <Navbar />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
