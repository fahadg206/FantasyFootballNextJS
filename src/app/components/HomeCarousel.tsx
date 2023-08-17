"use client";

import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import useMeasure from "react-use-measure";
import Logo from "../images/Transparent.png";
import Image from "next/image";
import uuid from "uuid";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  limit,
} from "firebase/firestore/lite";
import { db, storage } from "../../app/firebase";

const CARD_WIDTH = 350;
const CARD_HEIGHT = 350;
const MARGIN = 20;
const CARD_SIZE = CARD_WIDTH + MARGIN;
const REACT_APP_LEAGUE_ID: string | null =
  localStorage.getItem("selectedLeagueID");

const BREAKPOINTS = {
  sm: 640,
  lg: 1024,
};

const CardCarousel = () => {
  const [ref, { width }] = useMeasure();
  const [offset, setOffset] = useState(0);
  const [headlines, setHeadlines] = useState([
    {
      id: 10,
      url: "/imgs/computer/mouse.png",
      category: "Mice",
      title: "Just feels right",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, dolor.",
    },
    {
      id: 21,
      url: "/imgs/computer/keyboard.png",
      category: "Keyboards",
      title: "Type in style",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, dolor.",
    },
    {
      id: 34,
      url: "/imgs/computer/monitor.png",
      category: "Monitors",
      title: "Looks like a win",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, dolor.",
    },
    {
      id: 45,
      url: "/imgs/computer/chair.png",
      category: "Chairs",
      title: "Back feels great",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, dolor.",
    },
    {
      id: 56,
      url: "/imgs/computer/lights.png",
      category: "Lights",
      title: "It's lit",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, dolor.",
    },
    {
      id: 67,
      url: "/imgs/computer/desk.png",
      category: "Desks",
      title: "Stand up straight",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, dolor.",
    },
    {
      id: 78,
      url: "/imgs/computer/headphones.png",
      category: "Headphones",
      title: "Sounds good",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, dolor.",
    },
  ]);

  const CARD_BUFFER =
    width > BREAKPOINTS.lg ? 3 : width > BREAKPOINTS.sm ? 2 : 1;

  const CAN_SHIFT_LEFT = offset < 0;

  const CAN_SHIFT_RIGHT =
    Math.abs(offset) < CARD_SIZE * (headlines.length - CARD_BUFFER);

  const shiftLeft = () => {
    if (!CAN_SHIFT_LEFT) {
      return;
    }
    setOffset((pv) => (pv += CARD_SIZE));
  };

  const shiftRight = () => {
    if (!CAN_SHIFT_RIGHT) {
      return;
    }
    setOffset((pv) => (pv -= CARD_SIZE));
  };

  const defaultHeadlines = [
    {
      id: 10,
      url: "/imgs/computer/mouse.png",
      category: "Mice",
      title: "Just feels right",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, dolor.",
    },
    {
      id: 21,
      url: "/imgs/computer/keyboard.png",
      category: "Keyboards",
      title: "Type in style",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, dolor.",
    },
    {
      id: 34,
      url: "/imgs/computer/monitor.png",
      category: "Monitors",
      title: "Looks like a win",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, dolor.",
    },
    {
      id: 45,
      url: "/imgs/computer/chair.png",
      category: "Chairs",
      title: "Back feels great",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, dolor.",
    },
    {
      id: 56,
      url: "/imgs/computer/lights.png",
      category: "Lights",
      title: "It's lit",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, dolor.",
    },
    {
      id: 67,
      url: "/imgs/computer/desk.png",
      category: "Desks",
      title: "Stand up straight",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, dolor.",
    },
    {
      id: 78,
      url: "/imgs/computer/headphones.png",
      category: "Headphones",
      title: "Sounds good",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, dolor.",
    },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        // Retrieve data from the database based on league_id
        const querySnapshot = await getDocs(
          query(
            collection(db, "Weekly Headlines"),
            where("league_id", "==", REACT_APP_LEAGUE_ID),
            limit(1)
          )
        );

        console.log("H");

        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const docData = doc.data();
            console.log("DB returned", JSON.parse(docData.headlines));
            setHeadlines(JSON.parse(docData.headlines));
          });
        } else {
          console.log("Document does not exist");

          try {
            const response = await fetch(
              "http://localhost:3000/api/fetchHeadlines",
              {
                method: "POST",
                body: REACT_APP_LEAGUE_ID,
              }
            );

            const data = await response.json();
            console.log("parsed ", data);
            setHeadlines(data);
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        }

        if (querySnapshot.empty) {
          console.error("No documents found in 'Article Info' collection");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }

    fetchData();
  }, []);

  console.log("Headlines: ", headlines);

  const Card = ({ url, category, title, description }) => {
    return (
      <div
        className="relative shrink-0 cursor-pointer rounded-2xl bg-white shadow-md transition-all hover:scale-[1.015] hover:shadow-xl"
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          marginRight: MARGIN,
          backgroundImage: `url("../images/Transparent.png")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 z-20 rounded-2xl bg-gradient-to-b from-black/90 via-black/60 to-black/0 p-6 text-white transition-[backdrop-filter] hover:backdrop-blur-sm">
          <span className="text-xs font-semibold uppercase text-violet-300">
            {category}
          </span>
          <p className="my-2 text-2xl font-bold">{title}</p>
          <Image src={Logo} alt="image" width={50} height={50} />
          <p className="text-[12px] text-slate-300">{description}</p>
        </div>
      </div>
    );
  };

  return (
    <section className="w-[95vw] xl:w-[60vw]" ref={ref}>
      <div className="relative overflow-hidden p-4">
        {/* CARDS */}
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-2xl font-semibold">
            Everything. <span className="text-slate-500">Yes, even that.</span>
          </p>
          <motion.div
            animate={{
              x: offset,
            }}
            className="flex"
          >
            {headlines.length === 0 ? (
              <p>Loading...</p>
            ) : (
              <motion.div
                animate={{
                  x: offset,
                }}
                className="flex"
              >
                {headlines.map((item) => {
                  return <Card key={uuid} {...item} />;
                })}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* BUTTONS */}
        <>
          <motion.button
            initial={false}
            animate={{
              x: CAN_SHIFT_LEFT ? "0%" : "-100%",
            }}
            className="absolute left-0 top-[60%] z-30 rounded-r-xl bg-slate-100/30 p-3 pl-2 text-4xl text-white backdrop-blur-sm transition-[padding] hover:pl-3"
            onClick={shiftLeft}
          >
            <FiChevronLeft />
          </motion.button>
          <motion.button
            initial={false}
            animate={{
              x: CAN_SHIFT_RIGHT ? "0%" : "100%",
            }}
            className="absolute right-0 top-[60%] z-30 rounded-l-xl bg-slate-100/30 p-3 pr-2 text-4xl text-white backdrop-blur-sm transition-[padding] hover:pr-3"
            onClick={shiftRight}
          >
            <FiChevronRight />
          </motion.button>
        </>
      </div>
    </section>
  );
};

export default CardCarousel;
