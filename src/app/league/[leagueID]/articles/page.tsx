"use client";

import React, { useState } from "react";
import ArticleTemplate from "../../../components/ArticleTemplate";
import imran from "../images/scary_imran.png";
import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";
import { Link } from "react-scroll";

const articles = () => {
  const [counter, setCounter] = useState("0");
  console.log(counter);

  const incrementCounter: any = () => {
    const counterAsNumber = +counter; // Convert to a number using unary plus
    if (!isNaN(counterAsNumber)) {
      setCounter((counterAsNumber + 1).toString());
    } else {
      // Handle the case when the string is not a valid number
      setCounter("0");
    }
  };

  const decrementCounter: any = () => {
    const counterAsNumber = +counter; // Convert to a number using unary plus
    if (!isNaN(counterAsNumber)) {
      setCounter((counterAsNumber - 1).toString());
    } else {
      // Handle the case when the string is not a valid number
      setCounter("0");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center container">
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
