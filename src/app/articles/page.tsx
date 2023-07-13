import React from "react";
import ArticleTemplate from "../components/ArticleTemplate";
import imran from "../images/scary_imran.png";

const articles = () => {
  return (
    <div>
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
