import React from "react";

import { StaticImageData } from "next/image";
import Image from "next/image";

const ArticleTemplate = ({
  title,
  image,
  author,
  authorImg,
  jobtitle,
  date,
  p1,
  p2,
  p3,
}: {
  title: string;
  image: StaticImageData;
  author: string;
  authorImg: StaticImageData;
  jobtitle: string;
  date: string;
  p1: string;
  p2: string;
  p3: string;
  name: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-end sm:flex sm:flex-row sm:justify-around  w-screen xl:w-[60vw] md:rounded md:border-2 md:border-[#1a1a1a] border-opacity-10 ">
      <div className="mt-5">
        <Image
          className="rounded-[10px] "
          src={image}
          alt="whatever"
          height={250}
          width={250}
        />
      </div>
      <div className="grid grid-cols-1 gap-y-3 justify-items-center mt-10 w-[90%] sm:w-[60%] ">
        <p className="text-5xl font-bold">{title}</p>
        <div className="flex md:flex items-center w-full justify-around border-b-2 dark:border-[#EDEDED] border-[#000000] dark:border-opacity-10 border-opacity-20">
          <div className="flex items-center">
            <Image
              className="rounded-[10px]"
              src={authorImg}
              alt="whatever"
              height={30}
              width={30}
            />
            <div className="flex flex-col">
              <p>{author}</p>
              <p className="text-[10px] font-bold">{jobtitle}</p>
            </div>
          </div>
          <p className="text-[12px]">{date}</p>
        </div>
        <p className=" w-[90%] text-center break-words text-[11px] sm:text-[13px] md:text-[15px]">
          {p1}
        </p>
        <p className=" w-[90%] text-center break-words text-[11px] sm:text-[13px] md:text-[15px]">
          {p2}
        </p>
        <p className="w-[90%] text-center break-words text-[11px] sm:text-[13px] md:text-[15px]">
          {p3}
        </p>
        <br />
        <br />
      </div>
    </div>
  );
};

export default ArticleTemplate;
