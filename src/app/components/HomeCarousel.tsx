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
  const router = useRouter();

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
            querySnapshot.forEach((doc) => {
              const docData = doc.data();
              //console.log("DB returned", JSON.parse(docData.headlines));
              setHeadlines(JSON.parse(docData.headlines));
            });
          } else {
            console.log("Document does not exist");

            try {
              const response = await fetch(
                "https://www.fantasypulseff.com/api/fetchHeadlines",
                {
                  method: "POST",
                  body: REACT_APP_LEAGUE_ID,
                }
              );

              const data = await response.json();

              console.log(data);

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
        </div>
      );
    };

    useEffect(() => {
      const fetchKey = async () => {
        const key = await fetch("http://localhost:3000/api/fetchKey");
        setKey(String(key));
      };
      console.log("warya");

      fetchKey();
    }, [key]);

    console.log("keyyy", key);

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

    const handler = async () => {
      try {
        const readingRef = ref(storage, `files/${REACT_APP_LEAGUE_ID}.txt`);
        const url = await getDownloadURL(readingRef);
        const response = await fetch(url);
        const fileContent = await response.text();
        const newFile = JSON.stringify(fileContent).replace(/\//g, "");

        const model = new ChatOpenAI({
          temperature: 0.9,
          model: "gpt-4",
          openAIApiKey: process.env.OPENAI_API_KEY,
        });

        const question = `give me 3 sports style headlines about the league's data, include the scores,team names, & who won by comparing their star starters with their points. include a bit of humor as well. I want the information to be in this format exactly headline =
  "id": "",
  "category": "",
  "title": "",
  "description": ""
 keep description short to one sentence give me the response in valid JSON array format {leagueData}`;
        console.log(question);

        const prompt = PromptTemplate.fromTemplate(question);
        const chainA = new LLMChain({ llm: model, prompt });

        // The result is an object with a `text` property.
        const apiResponse = await chainA.call({ leagueData: newFile });
        const cleanUp = await model.call([
          new SystemMessage(
            "Turn the following string into valid JSON format that strictly adhere to RFC8259 compliance"
          ),
          new HumanMessage(apiResponse.text),
        ]);
        console.log("Headlines API ", apiResponse);
        // const cleanUp = await model.call([
        //   new SystemMessage(
        //     "Turn the following string into valid JSON format that strictly adhere to RFC8259 compliance, if it already is in a valid JSON format then give me the string as the response, without any other information from you"
        //   ),
        //   new HumanMessage(apiResponse.text),
        // ]);

        updateWeeklyInfo(REACT_APP_LEAGUE_ID, cleanUp);
        return JSON.parse(apiResponse.text);
      } catch (error) {
        console.log(error);
      }
    };

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
};

export default CardCarousel;
