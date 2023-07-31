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

interface MyProps {
  leagueID: string;
  usernameSubmitted: boolean;
}

function NavBar(props: MyProps) {
  const [leagueID, setLeagueID] = useState("");
  const [selectedLeagueContext, setSelectedLeagueContext] = useContext(
    SelectedLeagueContext
  );

  const SideNav = () => {
    const [selected, setSelected] = useState(0);
    const [navbar, setNavbar] = useState(false);
    const [showScore, setShowScore] = useState(false);

    const [selectedLeagueContext, setSelectedLeagueContext] = useContext(
      SelectedLeagueContext
    );
    console.log(selectedLeagueContext);

    if (props.usernameSubmitted) {
      if (selectedLeagueContext.league_id) {
        if (selectedLeagueContext.league_id !== leagueID)
          setLeagueID(selectedLeagueContext.league_id);
      }
    }

    return (
      <nav className="fixed left-10 top-0 p-4 text-[13px] flex flex-col items-center  gap-2 h-screen w-[33vw] ">
        <Link href="/">
          <div className="  ">
            <Image src={Logo} alt="logo" width={250} height={250} />
          </div>
        </Link>
        <div className=" h-[46vh] flex flex-col justify-around">
          <Link href="/league">
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
          <Link href={`/league/${leagueID}/articles`}>
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
          <Link href={`/league/${leagueID}/stats`}>
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
          <Link href={`/league/${leagueID}/matchups`}>
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
          <Link href={`/league/${leagueID}/standings`}>
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
          <Link href={`/league/${leagueID}/powerrankings`}>
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

  const showNav = () => {
    if (props.usernameSubmitted && selectedLeagueContext.league_id) {
      return (
        <div className=" flex">
          <SideNav />
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
