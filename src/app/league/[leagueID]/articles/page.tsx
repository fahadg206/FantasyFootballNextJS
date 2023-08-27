"use client";

import React, { useState, useEffect } from "react";
import ArticleTemplate from "../../../components/ArticleTemplate";
import imran from "../../../images/scary_imran.png";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  limit,
} from "firebase/firestore/lite";
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
}

const articles = () => {
  const [loading, setLoading] = useState<Boolean>(true);
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
  });
  const [dropdownVisible, setDropdownVisible] = useState(true);
  let scrollChanger = 0;
  let scrollUp = 0;

  // useEffect(() => {
  //   const handleScroll = () => {
  //     const currentScrollPos = window.scrollY;

  //     if (currentScrollPos > scrollChanger) {
  //       setDropdownVisible(false);
  //     }

  //     if (
  //       currentScrollPos < scrollChanger &&
  //       Math.abs(scrollChanger - scrollUp) > 30
  //     ) {
  //       setDropdownVisible(true);
  //       console.log("it worked");
  //       scrollUp = scrollChanger;
  //     }
  //     console.log("SCC", scrollChanger);
  //     scrollChanger = currentScrollPos;
  //     console.log("SU", scrollUp);
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, []);

  const REACT_APP_LEAGUE_ID: string | null =
    localStorage.getItem("selectedLeagueID");

  useEffect(() => {
    console.log(REACT_APP_LEAGUE_ID);
    async function fetchData() {
      try {
        console.log(REACT_APP_LEAGUE_ID);
        // Retrieve data from the database based on league_id
        const querySnapshot = await getDocs(
          query(
            collection(db, "Weekly Articles"),
            where("league_id", "==", REACT_APP_LEAGUE_ID),
            limit(1)
          )
        );

        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const docData = doc.data();

            console.log("DB returned", docData);
            // let segment2split = docData.segment2.split('"paragraph4"');
            // let segment2p2 = '"paragraph4"' + segment2split[1];
            // let segment2p1 = segment2split[0] + "}";

            //setArticles(JsonBigInt.parse(docData.articles));
            // console.log(segment2p1);
            // setArticles3(JSON.parse(segment2p1));
            //setArticles3(JsonBigInt.parse(segment2p2));
            setArticles(docData.articles);
            setArticles2(docData.segment2);
            setArticles3(docData.overreaction);
            setArticles4(docData.pulse_check);
            console.log(articles3);
          });
        } else {
          console.log("Document does not exist");

          try {
            const response = await fetch(
              "http://localhost:3000/api/fetchData",
              {
                method: "POST",
                body: REACT_APP_LEAGUE_ID,
              }
            );

            const segment2 = await fetch(
              "http://localhost:3000/api/fetchSegment2",
              {
                method: "POST",
                body: REACT_APP_LEAGUE_ID,
              }
            );

            const overreaction = await fetch(
              "http://localhost:3000/api/fetchOverreaction",
              {
                method: "POST",
                body: REACT_APP_LEAGUE_ID,
              }
            );

            // const preview = await fetch(
            //   "http://localhost:3000/api/fetchPreview.js",
            //   {
            //     method: "POST",
            //     body: REACT_APP_LEAGUE_ID,
            //   }
            // );

            // const trashTalk = await fetch(
            //   "http://localhost:3000/api/fetchTrashTalk.js",
            //   {
            //     method: "POST",
            //     body: REACT_APP_LEAGUE_ID,
            //   }
            // );

            const pulseCheck = await fetch(
              "http://localhost:3000/api/fetchPulseCheck",
              {
                method: "POST",
                body: REACT_APP_LEAGUE_ID,
              }
            );

            const data = await response.json();
            const seg2Data = await segment2.json();
            const overreactionData = await overreaction.json();
            //const previewData = await preview.json();
            //const trashTalkData = await trashTalk.json();
            const pulseData = await pulseCheck.json();

            console.log("parsed ", data);
            console.log("parsed ", seg2Data);

            setArticles(data);
            setArticles2(seg2Data);
            setArticles3(overreactionData);
            setArticles4(pulseData);
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
      setLoading(false);
    }

    fetchData();
  }, [JSON.stringify(articles)]);

  console.log("a", articles3);

  if (loading) {
    return (
      <div role="status" className=" h-[60vh] flex justify-center items-center">
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
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span>Our editors are hard at work!</span>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col justify-center items-center container w-[60vw]">
      <div className={`  "block sticky top-0 z-50"  "hidden"}`}>
        <ArticleDropdown
          title1={articles?.title || ""}
          title2={articles2?.title || ""}
        />
      </div>
      <Element name={articles?.title || ""}>
        <div className="">
          <ArticleTemplate
            title={
              articles?.title ||
              "Our editors are hard at work! Come back soon to see your league's articles"
            }
            image={imran}
            author={"imran"}
            authorImg={imran}
            jobtitle="RCL Insider"
            date="Sep 14th, 2023"
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
        <div>
          <ArticleTemplate
            title={articles2?.title || ""}
            image={imran}
            author={"imran"}
            authorImg={imran}
            jobtitle="RCL Insider"
            date="Sep 14th, 2023"
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
        <div>
          <ArticleTemplate
            title={articles3?.title || ""}
            image={imran}
            author={"imran"}
            authorImg={imran}
            jobtitle="RCL Insider"
            date="Sep 14th, 2023"
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
        <div>
          <ArticleTemplate
            title={articles4?.title || ""}
            image={imran}
            author={"imran"}
            authorImg={imran}
            jobtitle="RCL Insider"
            date="Sep 14th, 2023"
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
    </div>
  );
};

export default articles;
