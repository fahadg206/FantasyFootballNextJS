"use client";

import React from "react";
import ScrollingTestimonials from "../../components/ScrollingTestimonials";
import ScrollingTeamLogos from "../../components/ScrollingTeamLogos";
import HomeCarousel from "../../components/HomeCarousel";
import HomePoll from "../../components/HomePoll";

export default function page() {
  return (
    <div>
      <div className=" px-4">
        <h2 className="dark:text-slate-50 text-2xl font-semibold text-center">
          {`Welcome to ${localStorage.getItem("selectedLeagueName")}!`}
        </h2>
        <p className="text-center dark:text-slate-300 text-sm mt-2 max-w-lg mx-auto">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus
          consequatur reprehenderit.
        </p>
      </div>
      <div>
        <HomeCarousel />
      </div>
      <ScrollingTestimonials />
      <HomePoll />
      <ScrollingTeamLogos />
    </div>
  );
}
