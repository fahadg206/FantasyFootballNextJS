import React from "react";
import ArticleTemplate from "../components/ArticleTemplate";
import imran from "../images/scary_imran.jpg";

const articles = () => {
  return (
    <div>
      <ArticleTemplate
        title="yo"
        image={imran}
        author={"imran"}
        authorImg={"../images/scary_imran.jpg"}
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
