"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useContext, useEffect } from "react";
import {
  SiFramer,
  SiTailwindcss,
  SiReact,
  SiJavascript,
  SiCss3,
} from "react-icons/si";
import { FaRankingStar } from "react-icons/fa6";
import { BiSolidNews } from "react-icons/bi";
import { IoCloseSharp } from "react-icons/io5";
import { AiOutlineOrderedList } from "react-icons/ai";
import {
  FaBars,
  FaHome,
  FaCalendarAlt,
  FaFootballBall,
  FaSearch,
} from "react-icons/fa";

import Logo from "../images/Transparent.png";
import Image from "next/image";
import Link from "next/link";
import SelectedLeagueContext from "../context/SelectedLeagueContext";
import ScoreboardNav from "./ScoreboardNav";

interface MyProps {
  leagueID: string;
  usernameSubmitted: boolean;
}

function NavBar(props: MyProps) {
  const [selectedLeagueContext, setSelectedLeagueContext] = useContext(
    SelectedLeagueContext
  );

  const SideNav = () => {
    const [selected, setSelected] = useState(0);

    return (
      <nav className="hidden  xl:fixed left-10 top-0 p-4 text-[13px] xl:flex flex-col items-center xl:ml-[120px]  gap-2 h-screen  ">
        <Link href={`/league/${localStorage.getItem("selectedLeagueID")}`}>
          <div className="  ">
            <Image src={Logo} alt="logo" width={250} height={250} />
          </div>
        </Link>
        <div className=" h-[46vh] flex flex-col justify-around">
          <Link href={`/league/${localStorage.getItem("selectedLeagueID")}`}>
            <div className="flex items-center w-[90px]">
              <NavItem
                selected={selected === 0}
                id={0}
                setSelected={setSelected}
              >
                <FaHome />
              </NavItem>
              <p className="ml-2">Home</p>
            </div>
          </Link>
          <Link
            href={`/league/${localStorage.getItem(
              "selectedLeagueID"
            )}/articles`}
          >
            <div className="flex items-center w-[90px]">
              <NavItem
                selected={selected === 1}
                id={1}
                setSelected={setSelected}
              >
                <BiSolidNews />
              </NavItem>
              <p className="ml-2">Articles</p>
            </div>
          </Link>
          <Link
            href={`/league/${localStorage.getItem("selectedLeagueID")}/stats`}
          >
            <div className="flex items-center w-[90px]">
              <NavItem
                selected={selected === 2}
                id={2}
                setSelected={setSelected}
              >
                <FaSearch />
              </NavItem>
              <p className="ml-2">Stats</p>
            </div>
          </Link>
          <Link
            href={`/league/${localStorage.getItem(
              "selectedLeagueID"
            )}/matchups`}
          >
            <div className="flex items-center w-[90px]">
              <NavItem
                selected={selected === 3}
                id={3}
                setSelected={setSelected}
              >
                <FaCalendarAlt />
              </NavItem>
              <p className="ml-2">Matchups</p>
            </div>
          </Link>
          <Link
            href={`/league/${localStorage.getItem(
              "selectedLeagueID"
            )}/standings`}
          >
            <div className="flex items-center w-[90px]">
              <NavItem
                selected={selected === 4}
                id={4}
                setSelected={setSelected}
              >
                <AiOutlineOrderedList />
              </NavItem>
              <p className="ml-2">Standings</p>
            </div>
          </Link>
          <Link
            href={`/league/${localStorage.getItem(
              "selectedLeagueID"
            )}/powerrankings`}
          >
            <div className="flex items-center w-[90px]">
              <NavItem
                selected={selected === 5}
                id={5}
                setSelected={setSelected}
              >
                <FaRankingStar />
              </NavItem>
              <p className="ml-2">PowerRankings</p>
            </div>
          </Link>
          <Link
            href={`/league/${localStorage.getItem(
              "selectedLeagueID"
            )}/schedule`}
          >
            <div className="flex items-center w-[90px]">
              <NavItem
                selected={selected === 5}
                id={5}
                setSelected={setSelected}
              >
                <FaRankingStar />
              </NavItem>
              <p className="ml-2">PowerRankings</p>
            </div>
          </Link>
        </div>
      </nav>
    );
  };

  const MobileNav = () => {
    const [showScore, setShowScore] = useState(false);
    const [navbar, setNavbar] = useState(false);
    return (
      <div className=" px-4 mx-auto w-screen xl:hidden ">
        <div className="flex-items-center">
          <div className=" flex items-center justify-between py-3 xl:py-5 xl:block border-b-2 border-[#af1222] border-opacity-10 h-[110px]">
            <button
              className="xl:hidden p-2 text-[#af1222] rounded-xl outline-none focus:border-gray-400 focus:border cursor-pointer "
              onClick={() => {
                setShowScore(!showScore);
                setNavbar(false);
              }}
            >
              {showScore ? (
                <FaFootballBall size={30} />
              ) : (
                <FaFootballBall
                  size={30}
                  className="focus:border-none active:border-none"
                />
              )}
            </button>
            <div className="xl:hidden">
              <Link
                href={`/league/${localStorage.getItem("selectedLeagueID")}`}
              >
                <Image height={240} width={240} alt="logo" src={Logo} />
              </Link>
            </div>
            {/* HAMBURGER BUTTON FOR MOBILE */}
            <div className="xl:hidden">
              <button
                className="p-2 text-[#af1222] rounded-xl outline-none focus:border-gray-400 focus:border cursor-pointer "
                onClick={() => {
                  setNavbar(!navbar);
                  setShowScore(false);
                }}
              >
                {navbar ? (
                  <IoCloseSharp size={40} className={`scale-125 `} />
                ) : (
                  <FaBars size={30} className={``} />
                )}
              </button>
            </div>
          </div>
        </div>
        {/* {show scores on navbar} */}
        <div>
          <div
            className={
              showScore ? " xl:p-0 block duration-500 ease-in" : "hidden"
            }
          >
            <ScoreboardNav />
          </div>
        </div>
        <div>
          {/* MOBILE NAVBAR */}
          <div
            className={`flex z-50 w-screen  ${navbar ? "xl:p-0 " : "hidden"}`}
          >
            <ul className="container xl:h-auto xl:hidden mt-10 ">
              <li className="pb-6 py-2 xl:px-3  hover:bg-[#AF1222]  hover:transition  hover:ease-in-out hover:rounded p-6">
                <Link
                  href={`/league/${localStorage.getItem("selectedLeagueID")}`}
                  onClick={() => setNavbar(!navbar)}
                >
                  <span className="text-[18px] flex items-center   xl:text-[14px]">
                    <FaHome size={18} className="mr-1 " /> Home
                  </span>
                </Link>
              </li>
              <li className="pb-6 py-2 xl:px-3 text-center  hover:bg-[#AF1222] ]  hover:transition  hover:ease-in-out hover:rounded p-6">
                <Link
                  href={`/league/${localStorage.getItem(
                    "selectedLeagueID"
                  )}/stats`}
                  onClick={() => setNavbar(!navbar)}
                >
                  <span className="text-[18px]  flex items-center  xl:text-[14px]">
                    <FaSearch size={18} className="mr-1 " /> Stats
                  </span>
                </Link>
              </li>
              <li className="pb-6  py-2 xl:px-3 text-center  hover:bg-[#AF1222]    hover:transition  hover:ease-in-out hover:rounded p-6">
                <Link
                  href={`/league/${localStorage.getItem(
                    "selectedLeagueID"
                  )}/articles`}
                  onClick={() => setNavbar(!navbar)}
                >
                  <span className="text-[18px]  flex items-center  xl:text-[14px]">
                    <BiSolidNews size={18} className="mr-1 " /> Articles
                  </span>
                </Link>
              </li>
              <li className="pb-6 py-2 px-3 text-center   hover:bg-[#AF1222]    hover:transition hover:ease-in-out hover:rounded p-6">
                <Link
                  href={`/league/${localStorage.getItem(
                    "selectedLeagueID"
                  )}/matchups`}
                  onClick={() => setNavbar(!navbar)}
                >
                  <span className="text-[18px]  flex items-center   xl:text-[14px]">
                    <FaCalendarAlt size={18} className="mr-1 " /> Matchups
                  </span>
                </Link>
              </li>
              <li className="pb-6  py-2 px-3 text-center    hover:bg-[#AF1222]  hover:transition hover:ease-in-out hover:rounded p-6">
                <Link
                  href={`/league/${localStorage.getItem(
                    "selectedLeagueID"
                  )}/standings`}
                  onClick={() => setNavbar(!navbar)}
                >
                  <span className="text-[18px]  flex items-center xl:text-[14px]">
                    <AiOutlineOrderedList size={18} className="mr-1 " />{" "}
                    Standings
                  </span>
                </Link>
              </li>
              <li className="pb-6 py-2 px-3 text-center   hover:bg-[#AF1222]  hover:transition  hover:ease-in-out hover:rounded p-6">
                <Link
                  href={`/league/${localStorage.getItem(
                    "selectedLeagueID"
                  )}/powerrankings`}
                  onClick={() => setNavbar(!navbar)}
                >
                  <span className="text-[18px]  flex items-center  xl:text-[14px]">
                    <FaRankingStar size={18} className="mr-1 " /> Power Rankings
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const NavItem = ({ children, selected, id, setSelected }: any) => {
    return (
      <motion.button
        className="p-3 text-xl dark:bg-[#1a1a1a] bg-[#a39f9f] hover:bg-[#c4bfbf] rounded-full transition-colors relative"
        onClick={() => setSelected(id)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="block relative z-10">{children}</span>
        <AnimatePresence>
          {selected && (
            <motion.span
              className="absolute inset-0 rounded-full bg-[#af1222] z-0"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            ></motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  if (localStorage.getItem("usernameSubmitted") === "false") {
    localStorage.clear();
  }
  const showNav = () => {
    if (localStorage.getItem("selectedLeagueID")) {
      return (
        <div className=" flex">
          <SideNav />
          <MobileNav />
        </div>
      );
    }
  };
  useEffect(() => {
    showNav();
  }, [localStorage.getItem("selectedLeagueID")]);

  return <div>{showNav()}</div>;
}

export default NavBar;
