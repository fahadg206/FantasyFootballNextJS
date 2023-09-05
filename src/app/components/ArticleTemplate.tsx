import React from "react";

import { StaticImageData } from "next/image";
import Image from "next/image";

const generateParagraphProps = (article: any): React.ReactElement[] => {
  const paragraphProps = [];
  //console.log("Article", previewArticle[`paragraph${1}`]);

  for (let i = 1; i <= Object.keys(article).length; i++) {
    const paragraphKey = `p${i}`;
    if (article[`paragraph${i}`]) {
      paragraphProps.push(
        <p
          key={paragraphKey}
          className="mt-3 w-90 break-words text-xs md:indent-12 sm:text-sm md:text-base"
        >
          {article[`paragraph${i}`]}
        </p>
      );
    }
  }

  return paragraphProps;
};

interface ArticleTemplateProps {
  title: string;
  image: StaticImageData;
  author: string;
  authorImg: StaticImageData;
  jobtitle: string;
  date: string;
  name: string;
  article: any; // Update the type to match your previewArticle structure
}

const ArticleTemplate: React.FC<ArticleTemplateProps> = ({
  title,
  image,
  author,
  authorImg,
  jobtitle,
  date,
  article,
}: ArticleTemplateProps) => {
  const paragraphProps = generateParagraphProps(article);

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
        <div className="flex md:flex items-center w-full justify-between border-b-2 border-spacing-y-8 dark:border-[#EDEDED] border-[#af1222] border-opacity-10 dark:border-opacity-10 ">
          <div className="flex items-center">
            <Image
              className="rounded-full mr-2 mb-2"
              src={authorImg}
              alt="author images"
              height={35}
              width={35}
            />
            <div className="flex flex-col">
              <p className="text-[13px]">{author}</p>
              <p className="text-[10px] font-bold">{jobtitle}</p>
            </div>
          </div>
          <p className="text-[10px] md:text-[11px] ">{date}</p>
        </div>

        {/* Render dynamically generated paragraphs */}
        {paragraphProps}

        <br />
        <br />
      </div>
    </div>
  );
};

export default ArticleTemplate;
