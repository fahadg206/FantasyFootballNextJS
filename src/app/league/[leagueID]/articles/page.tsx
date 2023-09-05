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

let loaded = false;

const Articles = () => {
  const [loading, setLoading] = useState<Boolean>(true);
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
      <div className="h-screen flex items-center font-bold">
        Hey, your league hasn't drafted yet. Come back when your league has
        drafted to see YOUR league's articles!
      </div>
    );
  } else {
    const fetchDataFromApi = async (endpoint) => {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: REACT_APP_LEAGUE_ID,
        });
        const data = await response.json();
        return data; // Return the fetched data
      } catch (error) {
        console.error("Error fetching data:", error);
        return null; // Return null to handle errors
      }
    };

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

    const updateArticle1 = async (REACT_APP_LEAGUE_ID, articles) => {
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

    const updateArticle2 = async (REACT_APP_LEAGUE_ID, articles) => {
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
      const day = getOrdinalSuffix(currentDate.getDate());
      const hours = currentDate.getHours();
      const minutes = currentDate.getMinutes();

      // Format the time zone offset
      const timeZoneOffset = currentDate.getTimezoneOffset();
      const timeZoneOffsetHours = Math.abs(Math.floor(timeZoneOffset / 60));
      const timeZoneOffsetMinutes = Math.abs(timeZoneOffset % 60);
      const timeZoneAbbreviation = timeZoneOffset >= 0 ? "EST" : "EDT"; // Eastern Time (ET)

      // Create the formatted string
      const formattedDate = `${month}, ${day} ${hours}:${
        minutes < 10 ? "0" : ""
      }${minutes}${hours < 12 ? "am" : "pm"} ${timeZoneAbbreviation}`;

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
          if (!docData.articles) {
            promises.push(
              fetchDataFromApi("http://localhost:3000/api/fetchData")
            );
          } else {
            setArticles(docData.articles);
          }

          if (!docData.segment2) {
            promises.push(
              fetchDataFromApi("http://localhost:3000/api/fetchSegment2")
            );
          } else {
            setArticles2(docData.segment2);
          }

          if (!docData.overreaction) {
            promises.push(
              fetchDataFromApi("http://localhost:3000/api/fetchOverreaction")
            );
          } else {
            setArticles3(docData.overreaction);
          }

          if (!docData.pulse_check) {
            promises.push(
              fetchDataFromApi("http://localhost:3000/api/fetchPulseCheck")
            );
          } else {
            setArticles4(docData.pulse_check);
          }

          const results = await Promise.all(promises);

          results.forEach((data, index) => {
            if (index === 0) {
              setArticles(data);
              updateArticle1(REACT_APP_LEAGUE_ID, data);
            }
            if (index === 1) {
              setArticles2(data);
              updateArticle2(REACT_APP_LEAGUE_ID, data);
            } else if (index === 2) {
              setArticles3(data);
              updateArticle3(REACT_APP_LEAGUE_ID, data);
            } else if (index === 3) {
              setArticles4(data);
              updateArticle4(REACT_APP_LEAGUE_ID, data);
            }
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

          // Fetch data and update
          const [data1, data2, data3, data4] = await Promise.all([
            fetchDataFromApi("http://localhost:3000/api/fetchData"),
            fetchDataFromApi("http://localhost:3000/api/fetchSegment2"),
            fetchDataFromApi("http://localhost:3000/api/fetchOverreaction"),
            fetchDataFromApi("http://localhost:3000/api/fetchPulseCheck"),
          ]);

          if (data1) {
            setArticles(data1);
            updateArticle1(REACT_APP_LEAGUE_ID, data1);
          }
          if (data2) {
            setArticles2(data2);
            updateArticle2(REACT_APP_LEAGUE_ID, data2);
          }
          if (data3) {
            setArticles3(data3);
            updateArticle3(REACT_APP_LEAGUE_ID, data3);
          }
          if (data4) {
            setArticles4(data4);
            updateArticle4(REACT_APP_LEAGUE_ID, data4);
          }
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

    if (loading) {
      return (
        <div
          role="status"
          className=" h-[60vh] flex justify-center items-center"
        >
          <svg
            aria-hidden="true"
            className="w-8 h-8 mr-2 text-black animate-spin dark:text-gray-600 fill-[#af1222]"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.8130 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span>Our editors are hard at work!</span>
        </div>
      );
    }

    return (
      <div className="relative flex flex-col justify-center items-center container w-[60vw]">
        <div className={`sticky flex items-center justify-around top-0 z-50 `}>
          <ArticleDropdown
            title1={articles?.title || ""}
            title2={articles2?.title || ""}
            title3={articles3?.title || ""}
            title4={articles4?.title || ""}
          />
        </div>{" "}
        {/* <div>
          <ShowAuthors />
        </div> */}
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
              p1={articles?.paragraph1 || ""}
              p2={articles?.paragraph2 || ""}
              p3={articles?.paragraph3 || ""}
              p4={articles?.paragraph4 || ""}
              p5={articles?.paragraph5 || ""}
              p6={articles?.paragraph6 || ""}
              p7={articles?.paragraph7 || ""}
              p8={articles?.paragraph8 || ""}
              name="1"
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
              p1={articles2?.paragraph1 || ""}
              p2={articles2?.paragraph2 || ""}
              p3={articles2?.paragraph3 || ""}
              p4={articles2?.paragraph4 || ""}
              p5={articles2?.paragraph5 || ""}
              p6={articles2?.paragraph6 || ""}
              p7={articles2?.paragraph7 || ""}
              p8={articles2?.paragraph8 || ""}
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
              p1={articles3?.paragraph1 || ""}
              p2={articles3?.paragraph2 || ""}
              p3={articles3?.paragraph3 || ""}
              p4={articles3?.paragraph4 || ""}
              p5={articles3?.paragraph5 || ""}
              p6={articles3?.paragraph6 || ""}
              p7={articles3?.paragraph7 || ""}
              p8={articles3?.paragraph8 || ""}
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
              p1={articles4?.paragraph1 || ""}
              p2={articles4?.paragraph2 || ""}
              p3={articles4?.paragraph3 || ""}
              p4={articles4?.paragraph4 || ""}
              p5={articles4?.paragraph5 || ""}
              p6={articles4?.paragraph6 || ""}
              p7={articles4?.paragraph7 || ""}
              p8={articles4?.paragraph8 || ""}
              name="1"
            />
          </div>
        </Element>
        {articles && (
          <SmoothLink
            to={articles.title || ""}
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
};

export default Articles;
