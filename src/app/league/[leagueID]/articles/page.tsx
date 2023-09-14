"use client";

import React, { useState, useEffect } from "react";
import ArticleTemplate from "../../../components/ArticleTemplate";
import imran from "../../../images/scary_imran.png";
import steve from "../../../images/finger.jpg";
import boogie from "../../../images/boogie.png";
import pulseDr from "../../../images/pulsecheck.jpg";
import doctor from "../../../images/Doctor.jpg";
import glazer from "../../../images/Glazer.jpg";
import boo from "../../../images/boo.png";
import PulseCheck from "../../../images/Pulse Check.jpg";
import weekly_recap from "../../../images/week_recap.png";
import weekly_preview from "../../../images/weekly_preview.jpg";
import predictions from "../../../images/predictions.jpg";
import hamsa from "../../../images/hamsa.png";
import axios from "axios";

import ArticleProgressSpinner from "../../../components/ArticleProgressSpinner";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  limit,
} from "firebase/firestore/lite";
import { useRouter } from "next/navigation";
import {
  Link as SmoothLink,
  Button,
  Element,
  Events,
  animateScroll as scroll,
  scrollSpy,
  scroller,
} from "react-scroll";
import ArticleDropdown from "../../../components/ArticleDropdown";
import { BsArrowUpCircleFill } from "react-icons/bs";
import ShowAuthors from "../../../components/ShowAuthors";
import { AiFillWarning } from "react-icons/ai";
import getMatchupData from "../../../libs/getMatchupData";

const JsonBigInt = require("json-bigint");

import { db } from "../../../firebase";

interface Article {
  title: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  paragraph4: string;
  paragraph5: string;
  paragraph6: string;
  paragraph7: string;
  paragraph8: string;
  date: string; // Add date field
}
interface MatchupMapData {
  avatar: string;
  name: string;
  roster_id?: string;
  user_id?: string;
  starters?: string[];
  team_points?: string;
  opponent?: string;
  matchup_id?: string;
}

let loaded = false;

const Articles = () => {
  const [loading, setLoading] = useState<Boolean>(true);
  const [matchupMap, setMatchupMap] = useState<Map<string, MatchupMapData[]>>(
    new Map()
  );
  const [week, setWeek] = useState<number>();
  const [date, setDate] = useState<string>(""); // Define the date state
  const [articles, setArticles] = useState<Article>({
    title: "",
    paragraph1: "",
    paragraph2: "",
    paragraph3: "",
    paragraph4: "",
    paragraph5: "",
    paragraph6: "",
    paragraph7: "",
    paragraph8: "",
    date: "", // Initialize date
  });
  const [articles2, setArticles2] = useState<Article>({
    title: "",
    paragraph1: "",
    paragraph2: "",
    paragraph3: "",
    paragraph4: "",
    paragraph5: "",
    paragraph6: "",
    paragraph7: "",
    paragraph8: "",
    date: "", // Initialize date
  });
  const [articles3, setArticles3] = useState<Article>({
    title: "",
    paragraph1: "",
    paragraph2: "",
    paragraph3: "",
    paragraph4: "",
    paragraph5: "",
    paragraph6: "",
    paragraph7: "",
    paragraph8: "",
    date: "", // Initialize date
  });

  const [articles4, setArticles4] = useState<Article>({
    title: "",
    paragraph1: "",
    paragraph2: "",
    paragraph3: "",
    paragraph4: "",
    paragraph5: "",
    paragraph6: "",
    paragraph7: "",
    paragraph8: "",
    date: "", // Initialize date
  });

  const [previewArticle, setPreviewArticle] = useState<Article>({
    title: "",
    paragraph1: "",
    paragraph2: "",
    paragraph3: "",
    paragraph4: "",
    paragraph5: "",
    paragraph6: "",
    paragraph7: "",
    paragraph8: "",
    date: "", // Initialize date
  });

  const [playoffsArticle, setPlayoffsArticle] = useState<Article>({
    title: "",
    paragraph1: "",
    paragraph2: "",
    paragraph3: "",
    paragraph4: "",
    paragraph5: "",
    paragraph6: "",
    paragraph7: "",
    paragraph8: "",
    date: "", // Initialize date
  });

  const router = useRouter();
  const REACT_APP_LEAGUE_ID: string | null =
    localStorage.getItem("selectedLeagueID");
  const leagueStatus: string | null = localStorage.getItem("leagueStatus");

  if (typeof localStorage !== "undefined") {
    if (
      localStorage.getItem("selectedLeagueID") === null ||
      localStorage.getItem("selectedLeagueID") === undefined
    ) {
      router.push("/");
    }
  }

  if (leagueStatus === "pre_draft") {
    return (
      <div className="h-screen flex items-center font-bold text-center p-1">
        Hey, your league hasn't drafted yet. Come back when your league has
        drafted to see YOUR league's articles!
      </div>
    );
  } else {
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

    useEffect(() => {
      async function fetchMatchupData() {
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
          setWeek(week);
          let id = null;

          if (
            typeof localStorage !== "undefined" &&
            localStorage.getItem("selectedLeagueID")
          ) {
            id = window.localStorage.getItem("selectedLeagueID");
          }
          //console.log("ID", id);

          const matchupMapData = await getMatchupData(id, week);
          setMatchupMap(matchupMapData.matchupMap);
        } catch (error) {
          console.error("Error fetching matchup data:", error);
        }
      }

      fetchMatchupData();
    }, [
      typeof localStorage !== "undefined" &&
        localStorage.getItem("selectedLeagueID"),
      REACT_APP_LEAGUE_ID,
    ]);

    const updateDatabaseArticle = async (articleKey, articles) => {
      try {
        articles = await JSON.parse(articles);
        const weeklyInfoCollectionRef = collection(db, "Weekly Articles");
        const queryRef = query(
          weeklyInfoCollectionRef,
          where("league_id", "==", REACT_APP_LEAGUE_ID)
        );
        const querySnapshot = await getDocs(queryRef);

        if (!querySnapshot.empty) {
          // Document exists, update it
          querySnapshot.forEach(async (doc) => {
            await updateDoc(doc.ref, {
              [articleKey]: articles,
            });
          });
        } else {
          // Document does not exist, add a new one
          const dataToAdd = {
            league_id: REACT_APP_LEAGUE_ID,
            [articleKey]: articles,
          };
          await addDoc(weeklyInfoCollectionRef, dataToAdd);
        }
      } catch (error) {
        console.error("Error updating database:", error);
      }
    };

    const updateRecap = async (REACT_APP_LEAGUE_ID, articles) => {
      const currentDate = new Date();
      const weeklyInfoCollectionRef = collection(db, "Weekly Articles");
      const queryRef = query(
        weeklyInfoCollectionRef,
        where("league_id", "==", REACT_APP_LEAGUE_ID)
      );

      const querySnapshot = await getDocs(queryRef);
      if (!querySnapshot.empty) {
        // Document exists, update it
        querySnapshot.forEach(async (doc) => {
          if (!articles.error) {
            await updateDoc(doc.ref, {
              articles: articles,
            });
          }
        });
        console.log("updating article 1");
      } else {
        //setDate(currentDate.toISOString());

        console.log("adding article 1");
        // Document does not exist, add a new one
        if (!articles.error) {
          await addDoc(weeklyInfoCollectionRef, {
            league_id: REACT_APP_LEAGUE_ID,
            articles: articles,
          });
        }

        console.log("Date that was generated: ", currentDate.toISOString());
      }
    };

    const updateArticle3 = async (REACT_APP_LEAGUE_ID, articles) => {
      const currentDate = new Date();
      const weeklyInfoCollectionRef = collection(db, "Weekly Articles");
      const queryRef = query(
        weeklyInfoCollectionRef,
        where("league_id", "==", REACT_APP_LEAGUE_ID)
      );
      const querySnapshot = await getDocs(queryRef);
      if (!querySnapshot.empty) {
        // Document exists, update it
        querySnapshot.forEach(async (doc) => {
          if (!articles.error) {
            await updateDoc(doc.ref, {
              overreaction: articles,
            });
          }
        });
      } else {
        // Document does not exist, add a new one
        if (!articles.error) {
          await addDoc(weeklyInfoCollectionRef, {
            overreaction: articles,
          });
        }
      }
    };

    const updateSavage = async (REACT_APP_LEAGUE_ID, articles) => {
      const currentDate = new Date();
      const weeklyInfoCollectionRef = collection(db, "Weekly Articles");
      const queryRef = query(
        weeklyInfoCollectionRef,
        where("league_id", "==", REACT_APP_LEAGUE_ID)
      );
      const querySnapshot = await getDocs(queryRef);
      if (!querySnapshot.empty) {
        // Document exists, update it
        querySnapshot.forEach(async (doc) => {
          if (!articles.error) {
            await updateDoc(doc.ref, {
              segment2: articles,
            });
          }
        });
      } else {
        // Document does not exist, add a new one
        if (!articles.error) {
          await addDoc(weeklyInfoCollectionRef, {
            segment2: articles,
          });
        }
      }
    };

    const updateArticle4 = async (REACT_APP_LEAGUE_ID, articles) => {
      const currentDate = new Date();
      const weeklyInfoCollectionRef = collection(db, "Weekly Articles");
      const queryRef = query(
        weeklyInfoCollectionRef,
        where("league_id", "==", REACT_APP_LEAGUE_ID)
      );
      const querySnapshot = await getDocs(queryRef);
      if (!querySnapshot.empty) {
        // Document exists, update it
        querySnapshot.forEach(async (doc) => {
          if (!articles.error) {
            await updateDoc(doc.ref, {
              pulse_check: articles,
            });
          }
        });
      } else {
        // Document does not exist, add a new one
        if (!articles.error) {
          await addDoc(weeklyInfoCollectionRef, {
            pulse_check: articles,
          });
        }
      }
    };

    const updatePreview = async (REACT_APP_LEAGUE_ID, articles) => {
      const currentDate = new Date();
      const weeklyInfoCollectionRef = collection(db, "Weekly Articles");
      const queryRef = query(
        weeklyInfoCollectionRef,
        where("league_id", "==", REACT_APP_LEAGUE_ID)
      );
      const querySnapshot = await getDocs(queryRef);
      if (!querySnapshot.empty) {
        // Document exists, update it
        querySnapshot.forEach(async (doc) => {
          if (!articles.error) {
            await updateDoc(doc.ref, {
              preview: articles,
            });
          }
        });
      } else {
        // Document does not exist, add a new one
        if (!articles.error) {
          await addDoc(weeklyInfoCollectionRef, {
            preview: articles,
          });
        }
      }
    };

    const updatePlayoffPredictions = async (REACT_APP_LEAGUE_ID, articles) => {
      const currentDate = new Date();
      const weeklyInfoCollectionRef = collection(db, "Weekly Articles");
      const queryRef = query(
        weeklyInfoCollectionRef,
        where("league_id", "==", REACT_APP_LEAGUE_ID)
      );
      const querySnapshot = await getDocs(queryRef);
      if (!querySnapshot.empty) {
        // Document exists, update it
        querySnapshot.forEach(async (doc) => {
          if (!articles.error) {
            await updateDoc(doc.ref, {
              playoff_predictions: articles,
            });
          }
        });
      } else {
        // Document does not exist, add a new one
        if (!articles.error) {
          await addDoc(weeklyInfoCollectionRef, {
            playoff_predictions: articles,
          });
        }
      }
    };

    const getOrdinalSuffix = (number) => {
      const suffixes = ["th", "st", "nd", "rd"];
      const lastDigit = number % 10;
      return number + (suffixes[lastDigit] || suffixes[0]);
    };

    const getFormattedDate = (currentDate: Date) => {
      // Months array for formatting
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      // Get components of the date
      const month = months[currentDate.getMonth()];
      const day = currentDate.getDate();
      const year = currentDate.getFullYear();
      const hours = currentDate.getHours();
      const minutes = currentDate.getMinutes();

      // Determine AM or PM
      const amOrPm = hours >= 12 ? "PM" : "AM";

      // Convert hours to non-military format
      const hours12 = hours % 12 || 12;

      // Always set timezone abbreviation to "EST" (Eastern Standard Time)
      const timeZoneAbbreviation = "EST";

      // Create the formatted string
      const formattedDate = `${month} ${day}, ${year} ${hours12}:${
        minutes < 10 ? "0" : ""
      }${minutes} ${amOrPm} ${timeZoneAbbreviation}`;

      return formattedDate;
    };

    const fetchData = async () => {
      try {
        const promises = [];
        const weeklyInfoCollectionRef = collection(db, "Weekly Articles");
        const queryRef = query(
          weeklyInfoCollectionRef,
          where("league_id", "==", REACT_APP_LEAGUE_ID)
        );
        const querySnapshot = await getDocs(queryRef);

        if (!querySnapshot.empty) {
          // Document exists, update it
          const doc = querySnapshot.docs[0]; // Assuming there's only one matching document
          const docData = doc.data();
          //setArticles(docData.articles);
          setDate(docData.date);

          // Update or add articles as needed

          // Uncomment which ever article's will be added for the week

          // if (!docData.articles) {
          //   promises.push(
          //     fetchDataFromApi("https://www.fantasypulseff.com/api/fetchData")
          //   );
          // } else {
          //   setArticles(docData.articles);
          // }

          // if (!docData.segment2) {
          //   promises.push(
          //     fetchDataFromApi("https://www.fantasypulseff.com/api/fetchSegment2")
          //   );
          // } else {
          //   setArticles2(docData.segment2);
          // }

          // if (!docData.overreaction) {
          //   promises.push(
          //     fetchDataFromApi("https://www.fantasypulseff.com/api/fetchOverreaction")
          //   );
          // } else {
          //   setArticles3(docData.overreaction);
          // }

          // if (!docData.pulse_check) {
          //   promises.push(
          //     fetchDataFromApi("https://www.fantasypulseff.com/api/fetchPulseCheck")
          //   );
          // } else {
          //   setArticles4(docData.pulse_check);
          // }

          // if (!docData.preview) {
          //   const data = await fetchDataFromApi(
          //     "https://www.fantasypulseff.com/api/fetchPreview"
          //   );
          //   setPreviewArticle(data);
          //   updatePreview(REACT_APP_LEAGUE_ID, data);
          // } else {
          //   setPreviewArticle(docData.preview);
          // }

          // if (!docData.playoff_predictions) {
          //   const data = await fetchDataFromApi(
          //     "https://www.fantasypulseff.com/api/fetchPlayoffPredictions"
          //   );
          //   setPlayoffsArticle(data);
          //   updatePlayoffPredictions(REACT_APP_LEAGUE_ID, data);
          // } else {
          //   setPlayoffsArticle(docData.playoff_predictions);
          // }

          if (!docData.articles) {
            const data = await fetchDataFromApi(
              "https://www.fantasypulseff.com/api/fetchData"
            );
            setArticles(data);
            updateRecap(REACT_APP_LEAGUE_ID, data);
          } else {
            setArticles(docData.articles);
            setLoading(false);
          }

          if (!docData.segment2) {
            const data = await fetchDataFromApi(
              "https://www.fantasypulseff.com/api/fetchSegment2"
            );
            setArticles2(data);
            updateSavage(REACT_APP_LEAGUE_ID, data);
          } else {
            setArticles2(docData.segment2);
            setLoading(false);
          }

          if (!docData.preview) {
            const data = await fetchDataFromApi(
              "https://www.fantasypulseff.com/api/fetchPreview"
            );
            setPreviewArticle(data);
            updatePreview(REACT_APP_LEAGUE_ID, data);
          } else {
            setPreviewArticle(docData.preview);
            setLoading(false);
          }

          const results = await Promise.all(promises);

          results.forEach((data, index) => {
            //Uncomment this when we're back to regular articles
            // if (index === 0) {
            //   setArticles(data);
            //   updateArticle1(REACT_APP_LEAGUE_ID, data);
            // }
            // if (index === 1) {
            //   setArticles2(data);
            //   updateArticle2(REACT_APP_LEAGUE_ID, data);
            // } else if (index === 2) {
            //   setArticles3(data);
            //   updateArticle3(REACT_APP_LEAGUE_ID, data);
            // } else if (index === 3) {
            //   setArticles4(data);
            //   updateArticle4(REACT_APP_LEAGUE_ID, data);
            // }

            console.log("what we are working with ", data);

            // if (index === 0) {
            //   setPreviewArticle(data);
            //   updatePreview(REACT_APP_LEAGUE_ID, data);
            // }

            // if (index === 0) {
            //   setPlayoffsArticle(data);
            //   updatePlayoffPredictions(REACT_APP_LEAGUE_ID, data);
            // }
          });
        } else {
          // Document does not exist, add a new one
          const currentDate = new Date();

          // Function to format a number with an ordinal suffix (e.g., 1st, 2nd, 3rd, 4th)

          const formattedDate = getFormattedDate(currentDate);

          const dataToAdd = {
            league_id: REACT_APP_LEAGUE_ID,
            date: formattedDate,
          };
          const newDocRef = await addDoc(weeklyInfoCollectionRef, dataToAdd);
          setDate(formattedDate);

          // Uncomment this when we're back to regular articles

          // Fetch data and update
          // const [data1, data2, data3, data4] = await Promise.all([
          //   fetchDataFromApi("https://www.fantasypulseff.com/api/fetchData"),
          //   fetchDataFromApi("https://www.fantasypulseff.com/api/fetchSegment2"),
          //   fetchDataFromApi("https://www.fantasypulseff.com/api/fetchOverreaction"),
          //   fetchDataFromApi("https://www.fantasypulseff.com/api/fetchPulseCheck"),
          // ]);

          // if (data1) {
          //   setArticles(data1);
          //   updateArticle1(REACT_APP_LEAGUE_ID, data1);
          // }
          // if (data2) {
          //   setArticles2(data2);
          //   updateArticle2(REACT_APP_LEAGUE_ID, data2);
          // }
          // if (data3) {
          //   setArticles3(data3);
          //   updateArticle3(REACT_APP_LEAGUE_ID, data3);
          // }
          // if (data4) {
          //   setArticles4(data4);
          //   updateArticle4(REACT_APP_LEAGUE_ID, data4);
          // }

          const [data1, data2, data3] = await Promise.all([
            fetchDataFromApi("https://www.fantasypulseff.com/api/fetchData"),
            fetchDataFromApi(
              "https://www.fantasypulseff.com/api/fetchSegment2"
            ),
            fetchDataFromApi("https://www.fantasypulseff.com/api/fetchPreview"),
          ]);

          if (data1) {
            setArticles(data1);
            updateRecap(REACT_APP_LEAGUE_ID, data1);
          }
          if (data2) {
            setArticles2(data2);
            updateSavage(REACT_APP_LEAGUE_ID, data2);
          }
          if (data3) {
            setPreviewArticle(data3);
            updatePreview(REACT_APP_LEAGUE_ID, data3);
          }
          // Setting loading to false after all 3 articles are generated
          setLoading(false);
        }
      } catch (error) {
        console.error("Error:", error);
      }
      setLoading(false);
    };

    useEffect(() => {
      const fetchDataIfNeeded = async () => {
        if (
          !articles.title ||
          !articles2.title ||
          !articles3.title ||
          !articles4.title
        ) {
          await fetchData();
        }
      };

      fetchDataIfNeeded();
    }, [articles4]);

    if (
      articles &&
      articles2 &&
      articles3 &&
      articles4 &&
      articles.title &&
      articles2.title &&
      articles3.title &&
      articles4.title &&
      loaded === false
    ) {
      router.refresh();
      loaded = true;
    }

    console.log(matchupMap);

    const messages = [
      "Articles can take up to a few minutes to generate! Feel free to check out the rest of Fantasy Pulse and come back!",
      "Our editors are hard at work crafting the perfect fantasy football analysis for your league!",
      "Drafting the perfect fantasy football articles... because even our servers need a mock draft or two!",
      "Sit tight and visualize your fantasy football glory - it's on its way!",
      "Drafting fantasy football articles is like picking a kicker in the first round—unconventional, but we promise it'll be worth the wait!",
      "Articles can take up to a few minutes to generate! Feel free to check out the rest of Fantasy Pulse and come back!",
    ];

    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
      }, 6000); // Change the message every 8 seconds (adjust as needed)

      return () => {
        clearInterval(interval);
      };
    }, []);

    let over11Starters = false;

    Array.from(matchupMap).map(([matchupID, matchupData]) => {
      const team1 = matchupData[0];
      const team2 = matchupData[1];
      console.log(team1, team2);

      if (team1.starters?.length > 11 || team2.starters?.length > 11) {
        over11Starters = true;
      }
    });
    if (loading && matchupMap.size < 7 && !over11Starters) {
      return (
        <div
          role="status"
          className=" h-[60vh] flex justify-center items-center p-2"
        >
          <span className="flex flex-col justify-center items-center text-center">
            <p className="flex items-center gap-2 font-bold mb-3">
              <AiFillWarning size={30} className="text-[#af1222]" /> PLEASE DO
              NOT REFRESH AS IT CAN HINDER ARTICLE RESULTS!!{" "}
              <AiFillWarning className="text-[#af1222]" size={30} />
            </p>
            <p className="text-[13px] sm:text-[16px]">
              {messages[messageIndex]}
            </p>
            <div className="mt-5">
              <ArticleProgressSpinner />
            </div>
          </span>
        </div>
      );
    }

    const thisWeeksAuthors: string[] = ["Boogie The Writer"];

    if (matchupMap.size > 6 || over11Starters) {
      return (
        <div className=" flex justify-center items-center text-center w-[95vw] xl:w-[60vw] h-[60vh]">
          Apologies, but at the moment, we're unable to generate articles for
          leagues that exceed either 12 league members or 11 starting fantasy
          players. We'll notify you once we've addressed this matter. In the
          meantime, please explore the other features available on Fantasy
          Pulse. Thank you for your understanding.
        </div>
      );
    } else {
      return (
        <div className="relative flex flex-col justify-center items-center container w-[60vw]">
          <div
            className={`sticky flex items-center justify-around top-0 z-50 `}
          >
            <ArticleDropdown
              title1={previewArticle?.title || ""}
              title2={articles2?.title || ""}
              title3={articles?.title || ""}
              // title3={articles3?.title || ""}
              // title4={articles4?.title || ""}
              // title1={previewArticle?.title || ""}
              // title2={playoffsArticle?.title || ""}
            />
          </div>{" "}
          <div>
            <ShowAuthors thisWeeksAuthors={thisWeeksAuthors} />
          </div>
          <Element name={previewArticle?.title}>
            <div className={previewArticle?.title ? "block" : "hidden"}>
              <ArticleTemplate
                title={previewArticle?.title || ""}
                image={weekly_preview}
                author={"Boogie The Writer"}
                authorImg={boogie}
                jobtitle="Fantasy Pulse Senior Staff Writer"
                date={date || ""}
                name="1"
                article={previewArticle}
              />
            </div>
          </Element>
          <Element name={articles2?.title || ""}>
            <div className={articles2?.title ? "block" : "hidden"}>
              <ArticleTemplate
                title={articles2?.title || ""}
                image={boo}
                author={"Savage Steve"}
                authorImg={steve}
                jobtitle="Independent Journalist"
                date={date || ""}
                article={articles2}
                name="1"
              />
            </div>
          </Element>
          <Element name={articles?.title || ""}>
            <div className={articles?.title ? "block" : "hidden"}>
              <ArticleTemplate
                title={
                  articles?.title ||
                  "Our editors are hard at work! Come back soon to see your league's articles"
                }
                image={weekly_recap}
                author={"Boogie The Writer"}
                authorImg={boogie}
                jobtitle="Fantasy Pulse Senior Staff Writer"
                date={date || ""}
                article={articles}
                name="1"
              />
            </div>
          </Element>
          <Element name={articles3?.title || ""}>
            <div className={articles3?.title ? "block" : "hidden"}>
              <ArticleTemplate
                title={articles3?.title || ""}
                image={imran}
                author={"Joe Glazer"}
                authorImg={glazer}
                jobtitle="Fantasy Pulse Insider"
                date={date || ""}
                article={articles3}
                name="1"
              />
            </div>
          </Element>
          <Element name={articles4?.title}>
            <div className={articles4?.title ? "block" : "hidden"}>
              <ArticleTemplate
                title={articles4?.title || ""}
                image={PulseCheck}
                author={"Greg Roberts"}
                authorImg={pulseDr}
                jobtitle="Fantasy Pulse Medical Director"
                date={date || ""}
                name="1"
                article={articles4}
              />
            </div>
          </Element>
          <Element name={playoffsArticle?.title}>
            <div className={playoffsArticle?.title ? "block" : "hidden"}>
              <ArticleTemplate
                title={playoffsArticle?.title || ""}
                image={predictions}
                author={"El Jefe"}
                authorImg={hamsa}
                jobtitle="Head of Media Department"
                date={date || ""}
                article={playoffsArticle}
                name="1"
              />
            </div>
          </Element>
          {articles && (
            <SmoothLink
              to={previewArticle?.title || ""}
              activeClass="active"
              spy={true}
              smooth={true}
              offset={50}
              duration={700}
            >
              <BsArrowUpCircleFill
                className="block animate-bounce fixed bottom-5 right-3 opacity-40 xl:hidden"
                size={30}
              />
            </SmoothLink>
          )}
        </div>
      );
    }
  }
};

export default Articles;
