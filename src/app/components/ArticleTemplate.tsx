import React from "react";

import { StaticImageData } from "next/image";
import Image from "next/image";

interface ArticleTemplate {
  title: string;
  image: StaticImageData;
  author: string;
  authorImg: StaticImageData;
  jobtitle: string;
  date: string;
  p1: string;
  p2: string;
  p3: string;
  p4: string;
  p5: string;
  p6: string;
  p7: string;
  p8: string;
  name: string;
}

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
  p4,
  p5,
  p6,
  p7,
  p8,
}: ArticleTemplate) => {
  return (
    <div className="flex flex-col items-center justify-end sm:flex sm:flex-row sm:justify-around sm:items-start  w-[95vw] xl:w-[60vw] md:rounded md:border-2 md:border-[#1a1a1a] border-opacity-10 mb-2">
      <div className="mt-5 md:sticky md:top-5">
        <Image
          className="rounded-[10px] "
          src={image}
          alt="whatever"
          height={250}
          width={250}
        />
      </div>
      <div className="grid grid-cols-1 gap-y-3 justify-items-center mt-10 w-[90%] sm:w-[60%] ">
        <p className="text-2xl md:text-[32px] font-bold w-full text-center">
          {title}
        </p>
        <div className="flex md:flex items-center w-full justify-between border-b-2 dark:border-[#EDEDED] border-[#000000] dark:border-opacity-10 border-opacity-20">
          <div className="flex items-center">
            <Image
              className="rounded-full mr-2"
              src={authorImg}
              alt="author images"
              height={40}
              width={40}
            />
            <div className="flex flex-col">
              <p>{author}</p>
              <p className="text-[10px] font-bold">{jobtitle}</p>
            </div>
          </div>
          <p className="text-[10px] md:text-[12px] font-bold">{date}</p>
        </div>
        <p className=" w-[90%]  break-words text-[11px] sm:text-[13px] md:text-[15px]">
          {p1}
        </p>
        <p className=" w-[90%]  break-words text-[11px] sm:text-[13px] md:text-[15px]">
          {p2}
        </p>
        <p className="w-[90%]  break-words text-[11px] sm:text-[13px] md:text-[15px]">
          {p3}
        </p>
        <p className=" w-[90%]  break-words text-[11px] sm:text-[13px] md:text-[15px]">
          {p4}
        </p>
        <p className=" w-[90%]  break-words text-[11px] sm:text-[13px] md:text-[15px]">
          {p5}
        </p>
        <p className="w-[90%]  break-words text-[11px] sm:text-[13px] md:text-[15px]">
          {p6}
        </p>
        <p className="w-[90%]  break-words text-[11px] sm:text-[13px] md:text-[15px]">
          {p7}
        </p>
        <p className="w-[90%]  break-words text-[11px] sm:text-[13px] md:text-[15px]">
          {p8}
        </p>
        <br />
        <br />
      </div>
    </div>
  );
};

export default ArticleTemplate;
