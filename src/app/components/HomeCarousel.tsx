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
import { useRouter } from "next/navigation";
import { ref, getDownloadURL } from "firebase/storage";

import { Document } from "langchain/document";

import { QuerySnapshot, onSnapshot } from "firebase/firestore";
import dotenv from "dotenv";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { JSONLoader } from "langchain/document_loaders";
import { FaissStore } from "langchain/vectorstores/faiss";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { RetrievalQAChain } from "langchain/chains";
import { SystemMessage } from "langchain/schema";
import { HumanMessage } from "langchain/schema";
import fs from "fs";
import path from "path";

import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";

interface HeadlineItem {
  id?: number;
  url?: string;
  category?: string;
  title?: string;
  description?: string | number;
  scorerStyle?: boolean;
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
  fn?: string;
  ln?: string;
  avatar?: string;
  points?: string;
  proj?: string;
}

const CARD_WIDTH = 350;
const CARD_HEIGHT = 380;
const MARGIN = 20;
const CARD_SIZE = CARD_WIDTH + MARGIN;

const BREAKPOINTS = {
  sm: 640,
  lg: 1024,
};

const CardCarousel = ({ leagueID }) => {
  dotenv.config();
  const [reference, { width }] = useMeasure();
  const [offset, setOffset] = useState(0);
  const [userData, setUserData] = useState<ScheduleData>();
  const REACT_APP_LEAGUE_ID: string | null = leagueID;
  const leagueStatus: string | null = localStorage.getItem("leagueStatus");
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(true);

  const defaultHeadlines = [
    {
      id: 10,

      category: "News",
      title: "Our news department is hard at work!!",
      description:
        "Our news department is hard at work!! We'll publish your league headlines soon!",
    },
    {
      id: 21,

      category: "News",
      title:
        "Article's are being worked on too, check out that page to see if they're done",
      description: "Check out some of the other pages while you're at it too!",
    },
    {
      id: 34,

      category: "Question of the Week",
      title:
        "Have you voted on this weeks question? Scroll down and let us know!",
      description: "We really value your feedback!",
    },
  ];
  const errorHeadlines = [
    {
      id: 41,
      category: "News",
      title: "Headlines are not supported for your league at the moment. ",
      description:
        "Check our Twitter/X for updates or report an issue at the bottom of the page. Thank you for your patience!",
    },
    {
      id: 51,
      category: "News",
      title: "Headlines are not supported for your league at the moment. ",
      description:
        "Check our Twitter/X for updates or report an issue at the bottom of the page. Thank you for your patience!",
    },
    {
      id: 64,
      category: "Question of the Week",
      title: "Headlines are not supported for your league at the moment. ",
      description:
        "Check our Twitter/X for updates or report an issue at the bottom of the page. Thank you for your patience!",
    },
  ];
  const [headlines, setHeadlines] = useState(defaultHeadlines);
  const router = useRouter();

  if (leagueStatus === "pre_draft") {
    return (
      <div className=" flex items-center font-bold text-center p-1">
        Hey, your league hasn't drafted yet. Come back when your league has
        drafted to see YOUR leagues headlines!
      </div>
    );
  } else {
    const CARD_BUFFER =
      width > BREAKPOINTS.lg ? 3 : width > BREAKPOINTS.sm ? 2 : 1;

    const CAN_SHIFT_LEFT = offset < 0;

    const CAN_SHIFT_RIGHT =
      Math.abs(offset) <
      CARD_SIZE *
        (headlines
          ? headlines.length + 1 - CARD_BUFFER
          : defaultHeadlines.length + 1 - CARD_BUFFER);

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

    if (typeof localStorage !== "undefined") {
      if (
        localStorage.getItem("selectedLeagueID") === null ||
        localStorage.getItem("selectedLeagueID") === undefined
      ) {
        router.push("/");
      }
    }

    // Add an event listener for the 'storage' event

    useEffect(() => {}, [leagueID]);

    const fetchDataFromApi = async (endpoint, retryCount = 3) => {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: REACT_APP_LEAGUE_ID,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching data:", error);

        if (retryCount > 0) {
          // Retry fetching the data with one less retry attempt
          return fetchDataFromApi(endpoint, retryCount - 1);
        }

        // If retries are exhausted or the response is still invalid, return null
        return null;
      }
    };
    //console.log(leagueID);

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
            querySnapshot.forEach(async (doc) => {
              const docData = doc.data();
              //console.log("DB returned", JSON.parse(docData.headlines));
              if (docData.headlines) {
                setHeadlines(docData.headlines);
              } else {
                try {
                  setLoading(true);
                  // Waiting for firebase storage to update
                  await new Promise((resolve) => setTimeout(resolve, 5000));
                  const data = await fetchDataFromApi(
                    "https://www.fantasypulseff.com/api/fetchHeadlines"
                  );

                  // If data is valid, update headlines state
                  if (data) {
                    setHeadlines(data);
                    updateHeadlines(REACT_APP_LEAGUE_ID, data);
                  } else {
                    setHeadlines(errorHeadlines);
                  }
                } catch (error) {
                  console.error("Error fetching data:", error);
                }
              }
            });
          } else {
            console.log("Document does not exist");

            try {
              setLoading(true);
              const data = await fetchDataFromApi(
                "https://www.fantasypulseff.com/api/fetchHeadlines"
              );

              // If data is valid, update headlines state
              setHeadlines(data);
              updateHeadlines(REACT_APP_LEAGUE_ID, data);

              //console.log("parsed ", data);
            } catch (error) {
              console.error("Error fetching data:", error);
            }
          }

          if (querySnapshot.empty) {
            console.error("No documents found in 'Article Info' collection");
          }
          setLoading(false);
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

    const updateHeadlines = async (REACT_APP_LEAGUE_ID, headlines) => {
      // Reference to the "Weekly Info" collection
      const weeklyInfoCollectionRef = collection(db, "Weekly Headlines");
      // Use a Query to check if a document with the league_id exists
      const queryRef = query(
        weeklyInfoCollectionRef,
        where("league_id", "==", REACT_APP_LEAGUE_ID)
      );
      const querySnapshot = await getDocs(queryRef);
      // Add or update the document based on whether it already exists
      if (!querySnapshot.empty) {
        // Document exists, update it
        //console.log("in if");
        querySnapshot.forEach(async (doc) => {
          await updateDoc(doc.ref, {
            headlines: headlines,
          });
        });
      } else {
        // Document does not exist, add a new one
        await addDoc(weeklyInfoCollectionRef, {
          league_id: REACT_APP_LEAGUE_ID,
          headlines: headlines,
        });
      }
    };

    //console.log("Headlines: ", headlines);
    let topScorer;
    let over11Starters = false;
    if (userData) {
      //console.log("U", userData);
      const userArray = Object.values(userData);

      userArray.map((user) => {
        if (user.starters?.length > 11) {
          over11Starters = true;
        }
      });

      const sortedUserData = userArray.sort((a, b) => {
        return b.team_points - a.team_points;
      });
      topScorer = sortedUserData[0];
    }
    console.log(over11Starters);

    let errorText = (
      <div className=" flex justify-center items-center text-center w-[95vw] xl:w-[60vw] h-[20vh] p-2 mt-6">
        I'm sorry, but right now, we can't generate headlines for leagues with
        more than 11 starting fantasy players. 😔 We'll let you know as soon as
        we fix this issue. In the meantime, feel free to check out the other
        exciting features on Fantasy Pulse. Thank you for your patience! 🚀😊
      </div>
    );

    let loadingText = (
      <div
        role="status"
        className="  flex justify-center bg-gradient-to-b from-black/90 via-black/60 to-black/0 p-6 "
      >
        <span className="flex flex-col justify-center items-center">
          <Image
            src={Logo}
            width={150}
            height={150}
            alt="logo"
            className="animate-pulse mr-2"
          />{" "}
          <p className="font-bold text-white">Loading Headlines...</p>
        </span>
      </div>
    );

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
          {loading ? (
            loadingText
          ) : (
            <div
              className={
                scorerStyle
                  ? `flex flex-col justify-around items-center absolute inset-0 z-20 rounded-2xl bg-gradient-to-b from-black/90 via-black/60 to-black/0 p-6 text-white transition-[backdrop-filter] hover:backdrop-blur-sm`
                  : `absolute flex flex-col inset-0 z-20 rounded-2xl bg-gradient-to-b from-black/90 via-black/60 to-black/0 p-6 text-white transition-[backdrop-filter] hover:backdrop-blur-sm`
              }
            >
              <span className="text-xs font-semibold uppercase text-[#e45263]">
                {category}
              </span>
              <p className="my-2 text-xl font-bold ">{title}</p>
              <Image
                className={
                  scorerStyle
                    ? `rounded-full `
                    : `rounded-full animate-pulse self-center`
                }
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
          )}
        </div>
      );
    };

    const updateWeeklyInfo = async (REACT_APP_LEAGUE_ID, headlines) => {
      // Reference to the "Weekly Info" collection
      const weeklyInfoCollectionRef = collection(db, "Weekly Headlines");
      // Use a Query to check if a document with the league_id exists
      const queryRef = query(
        weeklyInfoCollectionRef,
        where("league_id", "==", REACT_APP_LEAGUE_ID)
      );
      const querySnapshot = await getDocs(queryRef);
      // Add or update the document based on whether it already exists
      if (!querySnapshot.empty) {
        // Document exists, update it
        console.log("in if");
        querySnapshot.forEach(async (doc) => {
          await updateDoc(doc.ref, {
            headlines: headlines,
          });
        });
      } else {
        await addDoc(weeklyInfoCollectionRef, {
          league_id: REACT_APP_LEAGUE_ID,
          headlines: headlines,
        });
      }
    };

    if (over11Starters) {
      return errorText;
    } else {
      return (
        <section className="w-[95vw] xl:w-[60vw]" ref={reference}>
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
  }
};

export default CardCarousel;
