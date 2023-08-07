"use client";

import { motion } from "framer-motion";
import axios from "axios";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import scaryimran from "../images/scary_imran.png";

import { LuUserPlus, LuUserMinus } from "react-icons/lu";

const ScrollingTestimonials = () => {
  const [leagueTransactions, setLeagueTransactions] = useState([]);

  const getLeagueTransactions = async () => {
    const response = await axios.get(
      `https://api.sleeper.app/v1/league/${localStorage.getItem(
        "selectedLeagueID"
      )}/transactions/1`
    );
    setLeagueTransactions(response.data);
  };
  console.log("league transactions", leagueTransactions);

  useEffect(() => {
    getLeagueTransactions();
  }, []);

  return (
    <div>
      <div className="mb-8 px-4">
        <h2 className="text-slate-50 text-2xl font-semibold text-center">
          {`Welcome to ${localStorage.getItem("selectedLeagueName")}!`}
        </h2>
        <p className="text-center text-slate-300 text-sm mt-2 max-w-lg mx-auto">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus
          consequatur reprehenderit.
        </p>
      </div>
      <div className="p-4 overflow-x-hidden relative">
        <div className="absolute top-0 bottom-0 left-0 w-24 z-10 bg-gradient-to-r from-[black] to-transparent" />

        <div className="flex items-center mb-4">
          <TestimonialList list={leagueTransactions} duration={125} />
          <TestimonialList list={leagueTransactions} duration={125} />
          <TestimonialList list={leagueTransactions} duration={125} />
        </div>
        <div className="flex items-center mb-4">
          <TestimonialList list={leagueTransactions} duration={75} reverse />
          <TestimonialList list={leagueTransactions} duration={75} reverse />
          <TestimonialList list={leagueTransactions} duration={75} reverse />
        </div>
        <div className="flex items-center">
          <TestimonialList list={leagueTransactions} duration={275} />
          <TestimonialList list={leagueTransactions} duration={275} />
          <TestimonialList list={leagueTransactions} duration={275} />
        </div>

        <div className="absolute top-0 bottom-0 right-0 w-24 z-10 bg-gradient-to-l from-[black] to-transparent" />
      </div>
    </div>
  );
};

const TestimonialList = ({ list, reverse = false, duration = 50 }) => {
  return (
    <motion.div
      initial={{ translateX: reverse ? "-100%" : "0%" }}
      animate={{ translateX: reverse ? "0%" : "-100%" }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
      className="flex gap-4 px-2"
    >
      {list.map((transaction) => {
        if (transaction.status === "complete") {
          return (
            <div
              key={transaction.id}
              className="shrink-0 w-[500px] flex justify-center rounded-lg overflow-hidden relative bg-[green]"
            >
              <div>
                <div className="bg-[#af1222] text-slate-50 p-4">
                  <span className="block font-semibold text-lg mb-1">
                    {`${transaction.type}   :    ${transaction.status}`}
                  </span>
                </div>

                <div className="teams flex justify-between bg-[purple] w-[25vw]">
                  <div className="team1 flex flex-col">
                    <p className="border-b-2 border-black text-center">Kabo</p>
                    <div>
                      <span className="flex items-center">
                        <LuUserPlus /> Mahomes
                      </span>
                      <span className="flex items-center">
                        <LuUserPlus /> Mahomes
                      </span>
                      <span className="flex items-center">
                        <LuUserPlus /> Mahomes
                      </span>
                      <span className="flex items-center">
                        <LuUserPlus /> Mahomes
                      </span>
                      <span className="flex items-center">
                        <LuUserPlus /> Mahomes
                      </span>
                      <span className="flex items-center">
                        <LuUserPlus /> Mahomes
                      </span>
                      <span className="flex items-center">
                        <LuUserPlus /> Mahomes
                      </span>
                      <span className="flex items-center">
                        <LuUserMinus /> McCaffrey
                      </span>
                    </div>
                  </div>
                  <div className="team2 flex flex-col">
                    <p className="border-b-2 border-black text-center">FG</p>
                    <div>
                      <span className="flex items-center">
                        <LuUserPlus /> Mahomes
                      </span>
                      <span className="flex items-center">
                        <LuUserMinus /> McCaffrey
                      </span>
                      <span className="flex items-center">
                        <LuUserMinus /> McCaffrey
                      </span>
                      <span className="flex items-center">
                        <LuUserMinus /> McCaffrey
                      </span>
                      <span className="flex items-center">
                        <LuUserMinus /> McCaffrey
                      </span>
                      <span className="flex items-center">
                        <LuUserMinus /> McCaffrey
                      </span>
                      <span className="flex items-center">
                        <LuUserMinus /> McCaffrey
                      </span>
                      <span className="flex items-center">
                        <LuUserMinus /> McCaffrey
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* <Image
                src={scaryimran}
                className="w-[60px] h-[60px] object-cover"
              /> */}

              <span className="text-7xl absolute top-2 right-2 text-[black]">
                "
              </span>
            </div>
          );
        }
      })}
    </motion.div>
  );
};

const testimonials = {
  top: [
    {
      id: 1,
      img: "https://images.unsplash.com/photo-1627161683077-e34782c24d81?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=703&q=80",
      name: "Jen S.",
      title: "Founder of XYZ",
      info: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa nostrum labore dolor facilis, nesciunt facere mollitia nam aspernatur esse corporis!",
    },
    {
      id: 2,
      img: "https://images.unsplash.com/photo-1595211877493-41a4e5f236b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=715&q=80",
      name: "Paul A,",
      title: "Founder of XYZ",
      info: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa nostrum labore dolor facilis.",
    },
    {
      id: 3,
      img: "https://plus.unsplash.com/premium_photo-1670588776139-da93b47afc6f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      name: "Cindy J.",
      title: "Founder of XYZ",
      info: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa nostrum labore dolor facilis, nesciunt facere mollitia nam.",
    },
    {
      id: 4,
      img: "https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=928&q=80",
      name: "Danica W.",
      title: "Founder of XYZ",
      info: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa nostrum labore dolor.",
    },
    {
      id: 5,
      img: "https://images.unsplash.com/photo-1629425733761-caae3b5f2e50?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      name: "Peter H.",
      title: "Founder of XYZ",
      info: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa nostrum labore.",
    },
    {
      id: 6,
      img: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
      name: "Lanny B.",
      title: "Founder of XYZ",
      info: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa nostrum labore dolor facilis, nesciunt facere mollitia nam aspernatur esse!",
    },
  ],
  middle: [
    {
      id: 1,
      img: "https://images.unsplash.com/photo-1573497161161-c3e73707e25c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      name: "Alex F.",
      title: "Founder of XYZ",
      info: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa nostrum labore dolor facilis, nesciunt facere mollitia nam.",
    },
    {
      id: 2,
      img: "https://images.unsplash.com/photo-1580518324671-c2f0833a3af3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      name: "Claude O.",
      title: "Founder of XYZ",
      info: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa nostrum labore dolor facilis, nesciunt.",
    },
    {
      id: 3,
      img: "https://images.unsplash.com/photo-1603871165848-0aa92c869fa1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=686&q=80",
      name: "Max Q.",
      title: "Founder of XYZ",
      info: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa nostrum labore dolor facilis.",
    },
    {
      id: 4,
      img: "https://images.unsplash.com/photo-1562788869-4ed32648eb72?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1744&q=80",
      name: "Jeff R.",
      title: "Founder of XYZ",
      info: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa nostrum labore dolor facilis, nesciunt facere mollitia nam aspernatur esse corporis!",
    },
    {
      id: 5,
      img: "https://images.unsplash.com/photo-1625504615927-c14f4f309b63?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=930&q=80",
      name: "Kevin K.",
      title: "Founder of XYZ",
      info: "Lorem ipsum dolor, sit amet consectetur adipisicing elit!",
    },
    {
      id: 6,
      img: "https://images.unsplash.com/photo-1589729132389-8f0e0b55b91e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
      name: "Andrea B.",
      title: "Founder of XYZ",
      info: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa nostrum labore dolor facilis, nesciunt facere!",
    },
  ],
  bottom: [
    {
      id: 1,
      img: "https://images.unsplash.com/photo-1558222218-b7b54eede3f3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      name: "Danny G.",
      title: "Founder of XYZ",
      info: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa nostrum labore dolor facilis, nesciunt facere mollitia nam aspernatur!",
    },
    {
      id: 2,
      img: "https://images.unsplash.com/photo-1620932934088-fbdb2920e484?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=930&q=80",
      name: "Ian D.",
      title: "Founder of XYZ",
      info: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa nostrum labore dolor facilis, nesciunt facere.",
    },
    {
      id: 3,
      img: "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=898&q=80",
      name: "Ben S.",
      title: "Founder of XYZ",
      info: "Lorem ipsum dolor, sit amet consectetur adipisicing elit.",
    },
    {
      id: 4,
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      name: "Matthew I.",
      title: "Founder of XYZ",
      info: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa nostrum labore dolor facilis, nesciunt facere mollitia nam aspernatur esse corporis!",
    },
    {
      id: 5,
      img: "https://images.unsplash.com/photo-1597346908500-28cda8acfe4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      name: "Garrett P.",
      title: "Founder of XYZ",
      info: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa nostrum labore dolor facilis, nesciunt facere mollitia.",
    },
    {
      id: 6,
      img: "https://images.unsplash.com/photo-1642790595397-7047dc98fa72?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2232&q=80",
      name: "Xavier C.",
      title: "Founder of XYZ",
      info: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa nostrum labore dolor facilis, nesciunt facere mollitia nam aspernatur.",
    },
  ],
};

export default ScrollingTestimonials;
