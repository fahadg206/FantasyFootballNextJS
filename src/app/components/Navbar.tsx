"use client";

import Link from "next/link";
import { useEffect, useState, useContext } from "react";
import {
  FaBars,
  FaHome,
  FaCalendarAlt,
  FaFootballBall,
  FaSearch,
} from "react-icons/fa";
import { FaRankingStar } from "react-icons/fa6";
import { BiSolidNews } from "react-icons/bi";
import { MdMore, MdQueryStats } from "react-icons/md";
import { IoCloseSharp } from "react-icons/io5";
import { AiOutlineOrderedList } from "react-icons/ai";
import ScoreboardNav from "./ScoreboardNav";
import LeagueContext from "../context/LeagueContext";

import Image from "next/image";
import Logo from "../images/Transparent.png";

interface MyProps {
  leagueID: string;
  usernameSubmitted: boolean;
}

function NavBar(props: MyProps) {
  const [navbar, setNavbar] = useState(false);
  const [showScore, setShowScore] = useState(false);

  const [context, setContext] = useContext(LeagueContext);
  const [leagueID, setLeagueID] = useState("");

  if (props.usernameSubmitted) {
    if (context[0]) {
      if (context[0].league_id !== leagueID) setLeagueID(context[0].league_id);
    }
  }

  const showNav = () => {
    if (props.usernameSubmitted) {
      return (
        <div className="z-50">
          <nav className=" w-full top-0 left-0 right-0 z-10">
            <ul className="hidden md:flex md:items-center border-b border-[#af1222] border-opacity-25 h-[90px]  ">
              <li className="mr-auto">
                <Link href="/">
                  <div>
                    <Image height={260} width={260} alt="logo" src={Logo} />
                  </div>
                </Link>
              </li>
              <li className="mr-3">
                <Link href="/">
                  <span className=" flex items-center justify-center text-[14px] hover:bg-[#AF1222]  hover:transition hover:= hover:ease-in-out hover:rounded p-1">
                    <FaHome className="mr-1  " /> Home
                  </span>
                </Link>
              </li>
              <li className="mr-3">
                <Link href={`/stats/league/${leagueID}/`}>
                  <span className=" flex items-center justify-center text-[14px] hover:bg-[#AF1222] hover:transition hover:= hover:ease-in-out hover:rounded p-1">
                    <FaSearch className="mr-1 " /> Stats
                  </span>
                </Link>
              </li>
              <li className="mr-3">
                <Link href={`/league/${leagueID}/articles`}>
                  <span className=" flex items-center justify-center text-[14px] hover:bg-[#AF1222] hover:transition hover:= hover:ease-in-out hover:rounded p-1">
                    <BiSolidNews className="mr-1" /> Articles
                  </span>
                </Link>
              </li>
              <li className="mr-3">
                <Link href={`/matchups/league/${leagueID}/`}>
                  <span className=" flex items-center justify-center text-[14px] hover:bg-[#AF1222] hover:transition hover:= hover:ease-in-out hover:rounded p-1">
                    <FaCalendarAlt className="mr-1" /> Matchups
                  </span>
                </Link>
              </li>
              <li className="mr-3">
                <Link href={`/standings/league/${leagueID}/`}>
                  <span className=" flex items-center justify-center text-[14px] hover:bg-[#AF1222] hover:transition hover:= hover:ease-in-out hover:rounded p-1">
                    <AiOutlineOrderedList className="mr-1" /> Standings
                  </span>
                </Link>
              </li>
              <li className="mr-3">
                <Link href={`/powerrankings/league/${leagueID}`}>
                  <span className=" flex items-center justify-center text-[14px] hover:bg-[#AF1222] hover:transition hover:= hover:ease-in-out hover:rounded p-1">
                    <FaRankingStar className="mr-1" /> Power Rankings
                  </span>
                </Link>
              </li>
            </ul>
            <div className="justify-between px-4 mx-auto lg:max-w-7xl md:items-start md:flex md:px-8">
              <div className="flex-items-center">
                <div className=" flex items-center justify-between py-3 md:py-5 md:block border-b-2 border-[#af1222] border-opacity-10 h-[110px]">
                  <button
                    className="md:hidden p-2 text-[#af1222] rounded-md outline-none focus:border-gray-400 focus:border cursor-pointer "
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
                  <div className="md:hidden">
                    <Link href="/">
                      <Image height={240} width={240} alt="logo" src={Logo} />
                    </Link>
                  </div>
                  {/* HAMBURGER BUTTON FOR MOBILE */}
                  <div className="md:hidden">
                    <button
                      className="p-2 text-[#af1222] rounded-md outline-none focus:border-gray-400 focus:border cursor-pointer "
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
                    showScore ? " md:p-0 block duration-500 ease-in" : "hidden"
                  }
                >
                  <ScoreboardNav />
                </div>
              </div>
              <div>
                {/* MOBILE NAVBAR */}
                <div
                  className={`flex z-50 w-screen  ${
                    navbar ? "md:p-0 " : "hidden"
                  }`}
                >
                  <ul className="container md:h-auto md:hidden mt-10 ">
                    <li className="pb-6 py-2 md:px-3  hover:bg-[#AF1222]  hover:transition  hover:ease-in-out hover:rounded p-6">
                      <Link href="/" onClick={() => setNavbar(!navbar)}>
                        <span className="text-[18px] flex items-center   md:text-[14px]">
                          <FaHome size={18} className="mr-1 " /> Home
                        </span>
                      </Link>
                    </li>
                    <li className="pb-6 py-2 md:px-3 text-center  hover:bg-[#AF1222] ]  hover:transition  hover:ease-in-out hover:rounded p-6">
                      <Link href="/stats" onClick={() => setNavbar(!navbar)}>
                        <span className="text-[18px]  flex items-center  md:text-[14px]">
                          <FaSearch size={18} className="mr-1 " /> Stats
                        </span>
                      </Link>
                    </li>
                    <li className="pb-6  py-2 md:px-3 text-center  hover:bg-[#AF1222]    hover:transition  hover:ease-in-out hover:rounded p-6">
                      <Link href="/articles" onClick={() => setNavbar(!navbar)}>
                        <span className="text-[18px]  flex items-center  md:text-[14px]">
                          <BiSolidNews size={18} className="mr-1 " /> Articles
                        </span>
                      </Link>
                    </li>
                    <li className="pb-6 py-2 px-3 text-center   hover:bg-[#AF1222]    hover:transition hover:ease-in-out hover:rounded p-6">
                      <Link href="/matchups" onClick={() => setNavbar(!navbar)}>
                        <span className="text-[18px]  flex items-center   md:text-[14px]">
                          <FaCalendarAlt size={18} className="mr-1 " /> Matchups
                        </span>
                      </Link>
                    </li>
                    <li className="pb-6  py-2 px-3 text-center    hover:bg-[#AF1222]  hover:transition hover:ease-in-out hover:rounded p-6">
                      <Link
                        href="/standings"
                        onClick={() => setNavbar(!navbar)}
                      >
                        <span className="text-[18px]  flex items-center md:text-[14px]">
                          <AiOutlineOrderedList size={18} className="mr-1 " />{" "}
                          Standings
                        </span>
                      </Link>
                    </li>
                    <li className="pb-6 py-2 px-3 text-center   hover:bg-[#AF1222]  hover:transition  hover:ease-in-out hover:rounded p-6">
                      <Link
                        href="/powerrankings"
                        onClick={() => setNavbar(!navbar)}
                      >
                        <span className="text-[18px]  flex items-center  md:text-[14px]">
                          <FaRankingStar size={18} className="mr-1 " /> Power
                          Rankings
                        </span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>
        </div>
      );
    }
  };

  useEffect(() => {
    showNav();
  }, [leagueID]);

  return <div>{showNav()}</div>;
}

export default NavBar;
