import React from "react";
import imran from "../images/scary_imran.png";
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
}) => {
  return (
    <div className="flex flex-col items-center sm:grid grid-cols-2">
      <div className="grid grid-cols-1 justify-items-center w-full sm:sticky top-20 self-start lg:top-5">
        <Image
          className="rounded-[10px]"
          src={image}
          alt="whatever"
          height={200}
          width={200}
        />
      </div>
      <div className="grid grid-cols-1 gap-y-3 justify-items-center mt-10 ml-5">
        <p className="text-5xl font-bold">{title}</p>
        <div className="flex w-[77vw] sm:flex sm:w-[35vw] md:flex items-center md:w-[25vw] justify-between border-b-2 border-black border-opacity-10">
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
        <p className="p-3 text-left text-[18px]">
          {p1} <br />
          {p2} <br />
          {p3} <br />
          <br />
        </p>
        <p className="flex w-[77vw] sm:flex sm:w-[35vw] md:flex items-center md:w-[25vw] justify-between border-b-2 border-black border-opacity-5"></p>
        <br />
        <br />
      </div>
    </div>
  );
};

export default ArticleTemplate;
