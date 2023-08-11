"use client";

import React, { useState, useEffect } from "react";
import ArticleTemplate from "../../../components/ArticleTemplate";
import imran from "../../../images/scary_imran.png";

const articles = () => {
  //const [counter, setCounter] = useState("0");

  //console.log(counter);

  // const incrementCounter: any = () => {
  //   const counterAsNumber = +counter; // Convert to a number using unary plus
  //   if (!isNaN(counterAsNumber)) {
  //     setCounter((counterAsNumber + 1).toString());
  //   } else {
  //     // Handle the case when the string is not a valid number
  //     setCounter("0");
  //   }
  // };

  // const decrementCounter: any = () => {
  //   const counterAsNumber = +counter; // Convert to a number using unary plus
  //   if (!isNaN(counterAsNumber)) {
  //     setCounter((counterAsNumber - 1).toString());
  //   } else {
  //     // Handle the case when the string is not a valid number
  //     setCounter("0");
  //   }
  // };

  const [article, setArticle] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:3000/api/fetchData");
        const data = await response.json();
        setArticle(data);
        console.log("Data fetched:", data); // Log the fetched data here
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  console.log(article.text);

  return (
    <div className="flex flex-col justify-center items-center container w-[60vw]">
      <ArticleTemplate
        title="yo"
        image={imran}
        author={"imran"}
        authorImg={imran}
        jobtitle="RCL Insider"
        date="Sep 14th, 2023"
        p1={article.text}
        p2="fsdkjbfkjsbfksjdbf"
        p3="fskhfdskjfhdskj"
        name="1"
      />

      <ArticleTemplate
        title="yo"
        image={imran}
        author={"imran"}
        authorImg={imran}
        jobtitle="RCL Insider"
        date="Sep 14th, 2023"
        p1="hgdsbsdkfbskj"
        p2="fsdkjbfkjsbfksjdbf"
        p3="fskhfdskjfhdskj"
        name="2"
      />
    </div>
  );
};

export default articles;
