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

const articles = () => {
  const [articles, setArticles] = useState<{
    title: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
    paragraph4: string;
    paragraph5: string;
    paragraph6: string;
    paragraph7: string;
    paragraph8: string;
  }>({
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
  const [articles2, setArticles2] = useState<{
    title: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
    paragraph4: string;
    paragraph5: string;
    paragraph6: string;
    paragraph7: string;
    paragraph8: string;
  }>({
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
  const [articles3, setArticles3] = useState<{
    title: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
    paragraph4: string;
    paragraph5: string;
    paragraph6: string;
    paragraph7: string;
    paragraph8: string;
  }>({
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

            const data = await response.json();
            const seg2Data = await segment2.json();
            console.log("parsed ", data);
            console.log("parsed ", seg2Data);

            setArticles(data);
            setArticles2(seg2Data);
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
  }, [JSON.stringify(articles)]);

  console.log("a", articles3);

  return (
    <div className="flex flex-col justify-center items-center container w-[60vw]">
      <div>
        <ArticleDropdown title1={articles.title} title2={articles2.title} />
      </div>
      <Element name={articles.title}>
        <div className="mb-2">
          <ArticleTemplate
            title={
              articles.title ||
              "Our editors are hard at work! Come back soon to see your league's articles"
            }
            image={imran}
            author={"imran"}
            authorImg={imran}
            jobtitle="RCL Insider"
            date="Sep 14th, 2023"
            p1={articles.paragraph1 || ""}
            p2={articles.paragraph2 || ""}
            p3={articles.paragraph3 || ""}
            p4={articles.paragraph4 || ""}
            p5={articles.paragraph5 || ""}
            p6={articles.paragraph6 || ""}
            p7={articles.paragraph7 || ""}
            p8={articles.paragraph8 || ""}
            name="1"
          />
        </div>
      </Element>
      <Element name={articles2.title}>
        <div>
          <ArticleTemplate
            title={articles2.title || ""}
            image={imran}
            author={"imran"}
            authorImg={imran}
            jobtitle="RCL Insider"
            date="Sep 14th, 2023"
            p1={articles2.paragraph1 || ""}
            p2={articles2.paragraph2 || ""}
            p3={articles2.paragraph3 || ""}
            p4={articles2.paragraph4 || ""}
            p5={articles2.paragraph5 || ""}
            p6={articles2.paragraph6 || ""}
            p7={articles2.paragraph7 || ""}
            p8={articles2.paragraph8 || ""}
            name="1"
          />
        </div>
      </Element>
    </div>
  );
};

export default articles;
