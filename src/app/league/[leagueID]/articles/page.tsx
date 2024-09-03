"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Add useSearchParams
import ArticleTemplate from "../../../components/ArticleTemplate";
import boogie from "../../../images/boogie.png";
import fahad from "../../../images/fahad.jpg";
import hamsa from "../../../images/hamsa.png";
import weekly_preview from "../../../images/weekly_preview.jpg";
import welcome from "../../../images/welcome_season2.jpg";
import predictions from "../../../images/predictions.jpg";
import ArticleProgressSpinner from "../../../components/ArticleProgressSpinner";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore/lite";
import { Element } from "react-scroll";
import ArticleDropdown from "../../../components/ArticleDropdown";
import ShowAuthors from "../../../components/ShowAuthors";
import { AiFillWarning } from "react-icons/ai";
import { db } from "../../../firebase";

const Articles = () => {
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<string>("");
  const [previewArticle, setPreviewArticle] = useState(null);
  const [welcomeArticle, setWelcomeArticle] = useState(null);
  const [playoffsArticle, setPlayoffsArticle] = useState(null);

  const router = useRouter();
  const REACT_APP_LEAGUE_ID = localStorage.getItem("selectedLeagueID");

  if (!REACT_APP_LEAGUE_ID) {
    router.push("/");
  }

  const fetchDataFromApi = async (endpoint) => {
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
      return null;
    }
  };

  const getFormattedDate = (currentDate) => {
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
    const month = months[currentDate.getMonth()];
    const day = currentDate.getDate();
    const year = currentDate.getFullYear();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const amOrPm = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    const formattedDate = `${month} ${day}, ${year} ${hours12}:${
      minutes < 10 ? "0" : ""
    }${minutes} ${amOrPm} EST`;
    return formattedDate;
  };

  const fetchData = async () => {
    try {
      const weeklyInfoCollectionRef = collection(db, "Weekly Articles");
      const queryRef = query(
        weeklyInfoCollectionRef,
        where("league_id", "==", REACT_APP_LEAGUE_ID)
      );
      const querySnapshot = await getDocs(queryRef);

      let docData = {};
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        docData = doc.data();
        setDate(docData.date || getFormattedDate(new Date()));
      } else {
        const currentDate = new Date();
        const formattedDate = getFormattedDate(currentDate);
        await addDoc(weeklyInfoCollectionRef, {
          league_id: REACT_APP_LEAGUE_ID,
          date: formattedDate,
        });
        setDate(formattedDate);
      }

      const [previewData, welcomeData, playoffData] = await Promise.all([
        docData.preview
          ? Promise.resolve(docData.preview)
          : fetchDataFromApi("https://www.fantasypulseff.com/api/fetchPreview"),
        docData.welcome
          ? Promise.resolve(docData.welcome)
          : fetchDataFromApi("https://www.fantasypulseff.com/api/fetchWelcome"),
        docData.playoff_predictions
          ? Promise.resolve(docData.playoff_predictions)
          : fetchDataFromApi(
              "https://www.fantasypulseff.com/api/fetchPlayoffPredictions"
            ),
      ]);

      setPreviewArticle(previewData);
      setWelcomeArticle(welcomeData);
      setPlayoffsArticle(playoffData);

      setLoading(false); // Only set loading to false after all data has been set
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div
        role="status"
        className=" h-[60vh] flex justify-center items-center p-2"
      >
        <span className="flex flex-col justify-center items-center text-center">
          <p className="flex items-center gap-2 font-bold mb-3">
            <AiFillWarning size={30} className="text-[#af1222]" /> PLEASE DO NOT
            REFRESH AS IT CAN HINDER ARTICLE RESULTS!!{" "}
            <AiFillWarning className="text-[#af1222]" size={30} />
          </p>
          <div className="mt-5">
            <ArticleProgressSpinner />
          </div>
        </span>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col justify-center items-center container w-[60vw]">
      <div className={`sticky flex items-center justify-around top-0 z-50`}>
        <ArticleDropdown
          title1={welcomeArticle?.title || ""}
          title2={playoffsArticle?.title || ""}
          title3={previewArticle?.title || ""}
        />
      </div>
      <div>
        <ShowAuthors
          thisWeeksAuthors={["Boogie The Writer", "El Jefe", "Fahad Guled"]}
        />
      </div>

      <Element name={welcomeArticle?.title}>
        <div className={welcomeArticle?.title ? "block" : "hidden"}>
          <ArticleTemplate
            title={welcomeArticle?.title || ""}
            image={welcome}
            author={"Fahad Guled"}
            authorImg={fahad}
            jobtitle="Fantasy Pulse Co-Founder"
            date={date || ""}
            name="1"
            article={welcomeArticle}
          />
        </div>
      </Element>

      <Element name={playoffsArticle?.title || ""}>
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

      <Element name={previewArticle?.title || ""}>
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
    </div>
  );
};

export default Articles;
