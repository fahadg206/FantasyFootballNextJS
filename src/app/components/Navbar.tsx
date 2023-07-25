"use client";

import Link from "next/link";
import { useState } from "react";
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

import { AiOutlineOrderedList } from "react-icons/ai";
import ScoreboardNav from "./ScoreboardNav";
import Dropdown from "./Dropdown";
import Image from "next/image";
import Logo from "../images/Transparent.png";
import { Navbar } from "@nextui-org/react";

function NavBar() {
  const [navbar, setNavbar] = useState(false);
  const [showScore, setShowScore] = useState(false);
  return (
    <div className="z-50">
      <nav className=" w-full top-0 left-0 right-0 z-10">
        <ul className="hidden md:flex items-center ">
          <li className="mr-auto">
            <Link href="/">
              <div>
                <Image height={260} width={260} alt="logo" src={Logo} />
              </div>
            </Link>
          </li>
          <li className="mr-3">
            <Link href="/">
              <span className=" flex items-center justify-center text-[14px] hover:bg-[#AF1222] hover:transition hover:duration-300 hover:ease-in-out hover:rounded p-1">
                <FaHome className="mr-1" /> Home
              </span>
            </Link>
          </li>
          <li className="mr-3">
            <Link href="/stats">
              <span className=" flex items-center justify-center text-[14px] hover:bg-[#AF1222] hover:transition hover:duration-300 hover:ease-in-out hover:rounded p-1">
                <FaSearch className="mr-1" /> Stats
              </span>
            </Link>
          </li>
          <li className="mr-3">
            <Link href="/articles">
              <span className=" flex items-center justify-center text-[14px] hover:bg-[#AF1222] hover:transition hover:duration-300 hover:ease-in-out hover:rounded p-1">
                <BiSolidNews className="mr-1" /> Articles
              </span>
            </Link>
          </li>
          <li className="mr-3">
            <Link href="/">
              <span className=" flex items-center justify-center text-[14px] hover:bg-[#AF1222] hover:transition hover:duration-300 hover:ease-in-out hover:rounded p-1">
                <FaCalendarAlt className="mr-1" /> Matchups
              </span>
            </Link>
          </li>
          <li className="mr-3">
            <Link href="/">
              <span className=" flex items-center justify-center text-[14px] hover:bg-[#AF1222] hover:transition hover:duration-300 hover:ease-in-out hover:rounded p-1">
                <AiOutlineOrderedList className="mr-1" /> Standings
              </span>
            </Link>
          </li>
          <li className="mr-3">
            <Link href="/">
              <span className=" flex items-center justify-center text-[14px] hover:bg-[#AF1222] hover:transition hover:duration-300 hover:ease-in-out hover:rounded p-1">
                <FaRankingStar className="mr-1" /> Power Rankings
              </span>
            </Link>
          </li>
        </ul>
        <div className="justify-between px-4 mx-auto lg:max-w-7xl md:items-start md:flex md:px-8">
          <div className="flex-items-center">
            <div className=" flex items-center justify-between py-3 md:py-5 md:block ">
              <button
                className="md:hidden p-2 text-gray-700 rounded-md outline-none focus:border-gray-400 focus:border"
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
                  <Image height={200} width={200} alt="logo" src={Logo} />
                </Link>
              </div>
              {/* HAMBURGER BUTTON FOR MOBILE */}
              <div className="md:hidden">
                <button
                  className="p-2 text-gray-700 rounded-md outline-none focus:border-gray-400 focus:border"
                  onClick={() => {
                    setNavbar(!navbar);
                    setShowScore(false);
                  }}
                >
                  {navbar ? (
                    <FaBars size={30} />
                  ) : (
                    <FaBars
                      size={30}
                      className="focus:border-none active:border-none"
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
          {/* {show scores on navbar} */}
          <div>
            <div className={showScore ? "p-12 md:p-0 block" : "hidden"}>
              <ScoreboardNav />
            </div>
          </div>
          <div>
            {/* MOBILE NAVBAR */}
            <div
              className={`flex justify-center items-center sticky top-0 h-[60vh] z-50  ${
                navbar ? "md:p-0 " : "hidden"
              }`}
            >
              <ul className="w-screen items-center md:h-auto md:hidden">
                <li className="pb-6 py-2 md:px-3 text-center border-b-2 md:border-b-0  hover:bg-[#AF1222]  border-[#AF1222]  hover:transition hover:duration-300 hover:ease-in-out hover:rounded p-6">
                  <Link href="/" onClick={() => setNavbar(!navbar)}>
                    <span className="text-2xl flex items-center justify-center md:text-[14px]">
                      <FaHome className="mr-1" /> Home
                    </span>
                  </Link>
                </li>
                <li className="pb-6  py-2 md:px-3 text-center border-b-2 md:border-b-0  hover:bg-[#AF1222]  border-[#AF1222]  hover:transition hover:duration-300 hover:ease-in-out hover:rounded p-6">
                  <Link href="/articles" onClick={() => setNavbar(!navbar)}>
                    <span className="text-2xl flex items-center justify-center md:text-[14px]">
                      <BiSolidNews className="mr-1" /> Articles
                    </span>
                  </Link>
                </li>
                <li className="pb-6 py-2 px-3 text-center  border-b-2 md:border-b-0  hover:bg-[#AF1222]  border-[#AF1222]  hover:transition hover:duration-300 hover:ease-in-out hover:rounded p-6">
                  <Link href="/matchups" onClick={() => setNavbar(!navbar)}>
                    <span className="text-2xl flex items-center justify-center md:text-[14px]">
                      <FaCalendarAlt className="mr-1" /> Matchups
                    </span>
                  </Link>
                </li>
                <li className="pb-6  py-2 px-3 text-center  border-b-2 md:border-b-0  hover:bg-[#AF1222]  border-[#AF1222]  hover:transition hover:duration-300 hover:ease-in-out hover:rounded p-6">
                  <Link href="/standings" onClick={() => setNavbar(!navbar)}>
                    <span className="text-2xl flex items-center justify-center md:text-[14px]">
                      <AiOutlineOrderedList className="mr-1" /> Standings
                    </span>
                  </Link>
                </li>
                <li className="pb-6 py-2 px-3 text-center  border-b-2 md:border-b-0  hover:bg-[#AF1222]  border-[#AF1222]  hover:transition hover:duration-300 hover:ease-in-out hover:rounded p-6">
                  <Link
                    href="/powerrankings"
                    onClick={() => setNavbar(!navbar)}
                  >
                    <span className="text-2xl flex items-center justify-center md:text-[14px]">
                      <FaRankingStar className="mr-1" /> Power Rankings
                    </span>
                  </Link>
                </li>
                <li className="pb-6  py-2 px-3 text-center  border-b-2 md:border-b-0  hover:bg-[#AF1222]  border-[#AF1222] hover:transition hover:duration-300 hover:ease-in-out hover:rounded p-6">
                  <Link href="" onClick={() => setNavbar(!navbar)}>
                    <span className="text-2xl flex items-center justify-center md:text-[14px]">
                      <MdMore className="mr-1" /> <Dropdown />
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

export default NavBar;
