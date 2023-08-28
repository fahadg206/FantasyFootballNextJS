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
    <div className="flex flex-col items-center justify-end sm:flex sm:flex-row sm:justify-around sm:items-start  w-[95vw] xl:w-[60vw] rounded border-b-2 border-dotted border-[#af1222] dark:border-[white] border-opacity-10 mb-2">
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
        <p className="text-3xl md:text-[32px] uppercase font-sans font-bold w-full text-center">
          {title}
        </p>
        <div className="flex md:flex items-center w-full justify-between border-b-2 dark:border-[#EDEDED] border-[#af1222] border-opacity-10 dark:border-opacity-10 ">
          <div className="flex items-center">
            <Image
              className="rounded-full mr-2"
              src={authorImg}
              alt="author images"
              height={40}
              width={40}
            />
            <div className="flex flex-col">
              <p className="text-[13px]">{author}</p>
              <p className="text-[10px] font-bold">{jobtitle}</p>
            </div>
          </div>
          <p className="text-[10px] md:text-[11px] ">{date}</p>
        </div>
        <p className=" w-[90%]  break-words text-[12px] md:indent-12 sm:text-[13px] md:text-[14px]">
          {p1}
          <br />
        </p>
        <p className=" w-[90%]  break-words text-[12px] md:indent-12 sm:text-[13px] md:text-[14px]">
          {p2}
          <br />
        </p>
        <p className="w-[90%]  break-words text-[12px] md:indent-12 sm:text-[13px] md:text-[14px]">
          {p3}
          <br />
        </p>
        <p className=" w-[90%]  break-words text-[12px] md:indent-12 sm:text-[13px] md:text-[14px]">
          {p4}
          <br />
        </p>
        <p className=" w-[90%]  break-words text-[12px] md:indent-12 sm:text-[13px] md:text-[14px]">
          {p5}
          <br />
        </p>
        <p className="w-[90%]  break-words text-[12px] md:indent-12 sm:text-[13px] md:text-[14px]">
          {p6}
          <br />
        </p>
        <p className="w-[90%]  break-words text-[12px] md:indent-12 sm:text-[13px] md:text-[14px]">
          {p7}
          <br />
        </p>
        <p className="w-[90%]  break-words text-[12px] md:indent-12 sm:text-[13px] md:text-[14px]">
          {p8}
          <br />
        </p>
        <br />
        <br />
      </div>
    </div>
  );
};

export default ArticleTemplate;
