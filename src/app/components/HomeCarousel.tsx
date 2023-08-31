import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import useMeasure from "react-use-measure";
import Logo from "../images/Transparent.png";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  limit,
} from "firebase/firestore/lite";
import { db, storage } from "../../app/firebase";
import getMatchupData from "../libs/getMatchupData";
import axios from "axios";

interface HeadlineItem {
  id: number;
  url: string;
  category: string;
  title: string;
  description: string | number;
  scorerStyle: boolean;
}

interface ScheduleData {
  [userId: string]: {
    avatar?: string;
    name: string;
    roster_id?: string;
    user_id?: string;
    starters?: string[];
    starters_points?: string[];
    players?: string[];
    players_points?: string[];
    starters_full_data?: Starter[];
    team_points?: number;
    opponent?: string;
    matchup_id?: string;
    Feature?: (arg: any) => JSX.Element;
  };
}

interface Starter {
  fname?: string;
  lname?: string;
  avatar?: string;
  scored_points?: string;
  projected_points?: string;
}

const CARD_WIDTH = 350;
const CARD_HEIGHT = 350;
const MARGIN = 20;
const CARD_SIZE = CARD_WIDTH + MARGIN;
const REACT_APP_LEAGUE_ID: string | null =
  localStorage.getItem("selectedLeagueID");
const leagueStatus: string | null = localStorage.getItem("leagueStatus");

const BREAKPOINTS = {
  sm: 640,
  lg: 1024,
};

const CardCarousel = () => {
  const [ref, { width }] = useMeasure();
  const [offset, setOffset] = useState(0);
  const [userData, setUserData] = useState<ScheduleData>();
  const defaultHeadlines = [
    {
      id: 10,
      url: "/imgs/computer/mouse.png",
      category: "News",
      title: "Our news department is hard at work!!",
      description:
        "Our news department is hard at work!! We'll publish your league headlines soon!",
    },
    {
      id: 21,
      url: "/imgs/computer/keyboard.png",
      category: "News",
      title:
        "Article's are being worked on too, check out that page to see if they're done",
      description: "Check out some of the other pages while you're at it too!",
    },
    {
      id: 34,
      url: "/imgs/computer/monitor.png",
      category: "Question of the Week",
      title:
        "Have you voted on this weeks question? Scroll down and let us know!",
      description: "We really value your feedback!",
    },
  ];
  const [headlines, setHeadlines] = useState(defaultHeadlines);

  if (leagueStatus === "pre_draft") {
    return (
      <div className=" flex items-center font-bold">
        Hey, your league hasn't drafted yet. Come back when your league has
        drafted to see YOUR leagues headlines!
      </div>
    );
  } else {
    const CARD_BUFFER =
      width > BREAKPOINTS.lg ? 3 : width > BREAKPOINTS.sm ? 2 : 1;

    const CAN_SHIFT_LEFT = offset < 0;

    const CAN_SHIFT_RIGHT =
      Math.abs(offset) < CARD_SIZE * (headlines.length + 1 - CARD_BUFFER);

    const shiftLeft = () => {
      if (!CAN_SHIFT_LEFT) {
        return;
      }
      setOffset((pv) => (pv += CARD_SIZE));
    };

    const shiftRight = () => {
      if (!CAN_SHIFT_RIGHT) {
        return;
      }
      setOffset((pv) => (pv -= CARD_SIZE));
    };

    useEffect(() => {
      async function fetchData() {
        //console.log(REACT_APP_LEAGUE_ID);
        try {
          // Retrieve data from the database based on league_id
          const querySnapshot = await getDocs(
            query(
              collection(db, "Weekly Headlines"),
              where("league_id", "==", REACT_APP_LEAGUE_ID),
              limit(1)
            )
          );

          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              const docData = doc.data();
              //console.log("DB returned", JSON.parse(docData.headlines));
              setHeadlines(JSON.parse(docData.headlines));
            });
          } else {
            console.log("Document does not exist");

            try {
              const response = await fetch(
                "https://fantasypulseff.vercel.app/api/fetchHeadlines",
                {
                  method: "POST",
                  body: REACT_APP_LEAGUE_ID,
                }
              );

              const data = await response.json();

              if (Array.isArray(data) && data.length > 0) {
                // If data is valid, update headlines state
                setHeadlines(data);
              } else {
                console.log("Using default headlines");
                setHeadlines(defaultHeadlines); // Set default headlines here
              }
              //console.log("parsed ", data);
            } catch (error) {
              console.error("Error fetching data:", error);
            }
          }

          if (querySnapshot.empty) {
            console.error("No documents found in 'Article Info' collection");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }

      fetchData();
    }, []);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `https://api.sleeper.app/v1/state/nfl`
          );

          const nflState = response.data;
          let week = 1;
          if (nflState.season_type === "regular") {
            week = nflState.display_week;
          } else if (nflState.season_type === "post") {
            week = 18;
          }
          const userData = await getMatchupData(REACT_APP_LEAGUE_ID, week);

          setUserData(userData.updatedScheduleData);
        } catch (error) {
          console.log("Error:", error);
        }
      };

      fetchData();
    }, []);

    //console.log("Headlines: ", headlines);
    let topScorer;
    if (userData) {
      //console.log("U", userData);
      const userArray = Object.values(userData);
      const sortedUserData = userArray.sort((a, b) => {
        return b.team_points - a.team_points;
      });
      topScorer = sortedUserData[0];
    }

    const Card = ({
      url,
      category,
      title,
      description,
      scorerStyle,
    }: HeadlineItem) => {
      return (
        <div
          className="relative shrink-0 cursor-pointer rounded-2xl bg-white shadow-md transition-all hover:scale-[1.015] hover:shadow-xl "
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            marginRight: MARGIN,
            backgroundImage: `url("https://img.freepik.com/premium-vector/vector-background-concept-technology_49459-308.jpg")`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div
            className={
              scorerStyle
                ? `flex flex-col justify-around items-center absolute inset-0 z-20 rounded-2xl bg-gradient-to-b from-black/90 via-black/60 to-black/0 p-6 text-white transition-[backdrop-filter] hover:backdrop-blur-sm`
                : `absolute inset-0 z-20 rounded-2xl bg-gradient-to-b from-black/90 via-black/60 to-black/0 p-6 text-white transition-[backdrop-filter] hover:backdrop-blur-sm`
            }
          >
            <span className="text-xs font-semibold uppercase text-violet-300">
              {category}
            </span>
            <p className="my-2 text-xl font-bold">{title}</p>
            <Image
              className="rounded-full"
              src={url || Logo}
              alt="image"
              width={120}
              height={120}
            />
            <p
              className={`${
                typeof description === "number"
                  ? "font-bold text-[25px] text-slate-300"
                  : "text-[13px] text-slate-300 "
              }`}
            >
              {description}
            </p>
          </div>
        </div>
      );
    };

    return (
      <section className="w-[95vw] xl:w-[60vw]" ref={ref}>
        <div className="relative overflow-hidden p-4">
          {/* CARDS */}
          <div className="mx-auto max-w-6xl">
            <p className="mb-4 text-lg md:text-xl font-semibold text-center md:text-start">
              League Buzz :
              <span className="text-slate-500">
                {" "}
                Catch Up on All the Action
              </span>
            </p>
            <motion.div
              animate={{
                x: offset,
              }}
              className="flex"
            >
              <Card
                key={uuidv4()}
                title={topScorer?.name}
                description={topScorer?.team_points}
                url={topScorer?.avatar}
                scorerStyle={true}
                category="Top Scorer of the Week"
              />
              {headlines.map((item) => {
                return <Card key={item.id} {...item} />;
              })}
            </motion.div>
          </div>

          {/* BUTTONS */}
          <>
            <motion.button
              initial={false}
              animate={{
                x: CAN_SHIFT_LEFT ? "0%" : "-100%",
              }}
              className="absolute left-0 top-[60%] z-30 rounded-r-xl bg-slate-100/30 p-3 pl-2 text-4xl text-black dark:text-white backdrop-blur-sm transition-[padding] hover:pl-3 opacity-40"
              onClick={shiftLeft}
            >
              <FiChevronLeft />
            </motion.button>
            <motion.button
              initial={false}
              animate={{
                x: CAN_SHIFT_RIGHT ? "0%" : "100%",
              }}
              className="absolute right-0 top-[60%] z-30 rounded-l-xl bg-slate-100/30 p-3 pr-2 text-4xl text-black dark:text-white backdrop-blur-sm transition-[padding] hover:pr-3 opacity-40 "
              onClick={shiftRight}
            >
              <FiChevronRight />
            </motion.button>
          </>
        </div>
      </section>
    );
  }
};

export default CardCarousel;
