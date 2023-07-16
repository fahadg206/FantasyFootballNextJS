import React from "react";
import ArticleTemplate from "../components/ArticleTemplate";
import imran from "../images/scary_imran.png";
import Image from "next/image";

const articles = () => {
  return (
    <div className="flex justify-center ">
      {/* Use React Smooth Scroll for Headlines */}
      <div className="hidden md:flex flex-col items-center justify-center text-center polls text-[black] rounded-[10px] bg-[#eaecee] dark:bg-[#1a1a1c] dark:text-white dark:shadow-white  h-screen p-[10px] shadow-md shadow-black sticky top-5 mt-5 w-1/5">
        <h2 className="mb-[15px] text-2xl border-b-2 border-black dark:border-white border-opacity-10 h-1/4">
          Headlines
        </h2>
        <ul className="text-[17px] h-screen">
          <li className="p-[5px]">
            {/* <Link
                  className="cursor-pointer"
                  to=""
                  smooth={true}
                  duration={500}
                  delay={200}
                >
                  WHO'S NERVOUS NOW?
                </Link> */}
            Fahad
          </li>
          <li className="p-[5px]">
            {/* <Link
                  className="cursor-pointer text-center"
                  to=""
                  smooth={true}
                  duration={500}
                  delay={200}
                >
                  RCL RECAP
                </Link> */}
            Kabo
          </li>
          <li className="p-[5px]">
            {/* <Link
                  className="cursor-pointer"
                  to=""
                  smooth={true}
                  duration={500}
                  delay={200}
                >
                  LEAGUE'S FIRST SPONSOR
                </Link> */}
          </li>
          <li className="p-[5px]">
            {/* <Link
                  className="cursor-pointer"
                  to=""
                  smooth={true}
                  duration={500}
                  delay={200}
                >
                  NEWCASTLE
                </Link> */}
          </li>
        </ul>
      </div>

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
      />
    </div>
  );
};

export default articles;
