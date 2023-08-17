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

import { db } from "../../../firebase";

const articles = () => {
  const [articles, setArticles] = useState({});

  const REACT_APP_LEAGUE_ID: string | null =
    localStorage.getItem("selectedLeagueID");

  useEffect(() => {
    async function fetchData() {
      try {
        // Retrieve data from the database based on league_id
        const querySnapshot = await getDocs(
          query(
            collection(db, "Weekly Articles"),
            where("league_id", "==", REACT_APP_LEAGUE_ID),
            limit(1)
          )
        );

        console.log("H");

        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const docData = doc.data();
            console.log("DB returned", JSON.parse(docData.articles));
            setArticles(JSON.parse(docData.articles));
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

            const data = await response.json();
            console.log("parsed ", data);
            setArticles(data);
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
  }, [articles]);

  console.log(articles);

  return (
    <div className="flex flex-col justify-center items-center container w-[60vw]">
      <div className="mb-2">
        {" "}
        <ArticleTemplate
          title={articles.title}
          image={imran}
          author={"imran"}
          authorImg={imran}
          jobtitle="RCL Insider"
          date="Sep 14th, 2023"
          p1={articles.paragraph1}
          p2={articles.paragraph2}
          p3={articles.paragraph3}
          p4={articles.paragraph4}
          p5={articles.paragraph5}
          p6={articles.paragraph6}
          p7={articles.paragraph7}
          p8={articles.paragraph8}
          name="1"
        />
      </div>
      <div>
        {" "}
        <ArticleTemplate
          title="yo"
          image={imran}
          author={"imran"}
          authorImg={imran}
          jobtitle="RCL Insider"
          date="Sep 14th, 2023"
          p1={"articles"}
          p2="fsdkjbfkjsbfksjdbf"
          p3="fskhfdskjfhdskj"
          name="1"
        />
      </div>
    </div>
  );
};

export default articles;
