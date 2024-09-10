import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Logo from "../images/Transparent.png";
import useMeasure from "react-use-measure";
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
import { db } from "../../app/firebase";
import getMatchupData from "../libs/getMatchupData";
import axios from "axios";
import { useRouter } from "next/navigation";
//import ArticleCarousel from "./ArticleCarousel";

const CARD_WIDTH = 300;
const CARD_HEIGHT = 330;
const MARGIN = 15;
const CARD_SIZE = CARD_WIDTH + MARGIN;

const BREAKPOINTS = {
  sm: 640,
  lg: 1024,
};

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

const CardCarousel = ({ leagueID }: { leagueID: string }) => {
  const [headlineReference, { width }] = useMeasure();
  const [headlineOffset, setHeadlineOffset] = useState(0);
  const [userData, setUserData] = useState<ScheduleData>();
  const [loading, setLoading] = useState(true);
  const [leagueStatus, setLeagueStatus] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      setLeagueStatus(localStorage.getItem("leagueStatus"));
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      const selectedLeagueID = localStorage.getItem("selectedLeagueID");
      if (!selectedLeagueID) {
        router.push("/");
      }
    }
  }, [isMounted]);

  const defaultHeadlines: HeadlineItem[] = [
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
  const [headlines, setHeadlines] = useState<HeadlineItem[]>(defaultHeadlines);

  const errorHeadlines: HeadlineItem[] = [
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

  useEffect(() => {
    if (!isMounted || leagueStatus === "pre_draft") {
      return;
    }

    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(
          query(
            collection(db, "Weekly Headlines"),
            where("league_id", "==", leagueID),
            limit(1)
          )
        );

        if (!querySnapshot.empty) {
          querySnapshot.forEach(async (doc) => {
            const docData = doc.data();
            if (docData.headlines) {
              setHeadlines(docData.headlines);
            } else {
              try {
                setLoading(true);
                await new Promise((resolve) => setTimeout(resolve, 5000));
                const data = await fetchDataFromApi(
                  "https://www.fantasypulseff.com/api/fetchHeadlines"
                );

                if (data) {
                  setHeadlines(data);
                  updateHeadlines(leagueID, data);
                } else {
                  setHeadlines(errorHeadlines);
                }
              } catch (error) {
                console.error("Error fetching data:", error);
              }
            }
          });
        } else {
          try {
            setLoading(true);
            const data = await fetchDataFromApi(
              "https://www.fantasypulseff.com/api/fetchHeadlines"
            );

            setHeadlines(data);
            updateHeadlines(leagueID, data);
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, [isMounted, leagueID, leagueStatus]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://api.sleeper.app/v1/state/nfl"
        );

        const nflState = response.data;
        let week = 1;
        if (nflState.season_type === "regular") {
          week = nflState.display_week;
        } else if (nflState.season_type === "post") {
          week = 18;
        }
        const userData = await getMatchupData(leagueID, week);

        setUserData(userData.updatedScheduleData);
      } catch (error) {
        console.log("Error:", error);
      }
    };

    fetchData();
  }, [isMounted, leagueID]);

  const fetchDataFromApi = async (endpoint: string, retryCount = 3) => {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: leagueID,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);

      if (retryCount > 0) {
        return fetchDataFromApi(endpoint, retryCount - 1);
      }

      return null;
    }
  };

  const updateHeadlines = async (
    leagueID: string,
    headlines: HeadlineItem[]
  ) => {
    const weeklyInfoCollectionRef = collection(db, "Weekly Headlines");
    const queryRef = query(
      weeklyInfoCollectionRef,
      where("league_id", "==", leagueID)
    );
    const querySnapshot = await getDocs(queryRef);

    if (!querySnapshot.empty) {
      querySnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, { headlines });
      });
    } else {
      await addDoc(weeklyInfoCollectionRef, {
        league_id: leagueID,
        headlines,
      });
    }
  };

  const CARD_BUFFER =
    width > BREAKPOINTS.lg ? 3 : width > BREAKPOINTS.sm ? 2 : 1;
  const CAN_SHIFT_LEFT_HEADLINES = headlineOffset < 0;
  const CAN_SHIFT_RIGHT_HEADLINES =
    Math.abs(headlineOffset) < CARD_SIZE * (headlines.length + 1 - CARD_BUFFER);

  const shiftLeftHeadlines = () => {
    if (!CAN_SHIFT_LEFT_HEADLINES) {
      return;
    }
    setHeadlineOffset((pv) => (pv += CARD_SIZE));
  };

  const shiftRightHeadlines = () => {
    if (!CAN_SHIFT_RIGHT_HEADLINES) {
      return;
    }
    setHeadlineOffset((pv) => (pv -= CARD_SIZE));
  };

  let topScorer;
  let over11Starters = false;
  if (userData) {
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

  let errorText = (
    <div className="flex justify-center items-center text-center w-[95vw] xl:w-[60vw] h-[20vh] p-2 mt-6">
      I'm sorry, but right now, we can't generate headlines for leagues with
      more than 11 starting fantasy players. 😔 We'll let you know as soon as we
      fix this issue. In the meantime, feel free to check out the other exciting
      features on Fantasy Pulse. Thank you for your patience! 🚀😊
    </div>
  );

  let loadingText = (
    <div
      role="status"
      className="flex justify-center bg-gradient-to-b from-black/90 via-black/60 to-black/0 p-6 "
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
        className="relative shrink-0 cursor-pointer rounded-2xl bg-white shadow-md transition-all hover:scale-[1.015] hover:shadow-xl"
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
            <p className="my-2 text-[16px] font-bold ">{title}</p>
            <Image
              className={
                scorerStyle
                  ? `rounded-full `
                  : `rounded-full animate-pulse self-center`
              }
              src={url || Logo}
              alt="image"
              width={90}
              height={90}
            />
            <p
              className={`${
                typeof description === "number"
                  ? "font-bold text-[25px] text-slate-300"
                  : "text-[12px] text-slate-300 "
              }`}
            >
              {description}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (over11Starters) {
    return errorText;
  } else {
    return (
      <>
        <section className="w-[95vw] xl:w-[60vw]" ref={headlineReference}>
          <div className="relative overflow-hidden p-4">
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
                  x: headlineOffset,
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
            <>
              {CAN_SHIFT_LEFT_HEADLINES && (
                <motion.button
                  initial={false}
                  animate={{
                    x: CAN_SHIFT_LEFT_HEADLINES ? "0%" : "-100%",
                  }}
                  className="absolute left-0 top-[60%] z-30 rounded-r-xl bg-slate-100/30 p-3 pl-2 text-4xl text-black dark:text-white backdrop-blur-sm transition-[padding] hover:pl-3 opacity-40"
                  onClick={shiftLeftHeadlines}
                >
                  <FiChevronLeft />
                </motion.button>
              )}
              {CAN_SHIFT_RIGHT_HEADLINES && (
                <motion.button
                  initial={false}
                  animate={{
                    x: CAN_SHIFT_RIGHT_HEADLINES ? "0%" : "100%",
                  }}
                  className="absolute right-0 top-[60%] z-30 rounded-l-xl bg-slate-100/30 p-3 pr-2 text-4xl text-black dark:text-white backdrop-blur-sm transition-[padding] hover:pr-3 opacity-40"
                  onClick={shiftRightHeadlines}
                >
                  <FiChevronRight />
                </motion.button>
              )}
            </>
          </div>
        </section>
      </>
    );
  }
};

export default CardCarousel;
