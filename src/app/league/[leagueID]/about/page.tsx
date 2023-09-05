"use client";
import React from "react";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import Image from "next/image";
import fahad from "../../../images/fahad.jpg";
import mahad from "../../../images/mahad.jpg";
import { Badge, Avatar } from "@nextui-org/react";
import { AiFillStar } from "react-icons/ai";
import logo from "../../../images/Transparent.png";
import Link from "next/link";
import { BsFillQuestionSquareFill } from "react-icons/bs";

export default function About() {
  return (
    <div className="  w-[95vw] xl:w-[60vw] flex flex-col justify-center items-center mt-3">
      <div className="w-[80vw] xl:w-[50vw]">
        <div className="text-3xl sm:text-4xl text-center font-bold text-[#af1222] mb-3">
          Where Your Fantasy Football Experience{" "}
          <p className="text-[#e45263]">Comes to Life!</p>
        </div>
        <div className="text-small sm:text-medium text-center text-[#858383] mb-10">
          Fantasy Pulse is the ultimate AI-driven fantasy football companion,
          delivering personalized content and interactivity to elevate your
          fantasy football experience.
        </div>
      </div>

      <Accordion
        className="border-[1px] border-[#af1222] dark:border-[white] border-opacity-20 rounded-xl p-3"
        variant="light"
      >
        <AccordionItem
          key="1"
          aria-label="Meet the Developers"
          title="Meet the Developers"
          className="font-bold border-b-[1px] border-[#af1222] dark:border-[white] border-opacity-20"
        >
          <div className="flex justify-around">
            <div className="fahad flex flex-col items-center justify-center gap-y-2">
              <Image
                src={fahad}
                alt="founder-image"
                width={100}
                height={100}
                rounded-xl
                className="rounded-full mb-2"
              />
              <div className="flex items-center">
                <Badge
                  content={<AiFillStar className="text-[#CFB53B]" />}
                  color="default"
                  className="mr-2 text-[#CFB53B] w-[20px] sm:w-[22px]"
                >
                  <Image
                    src={logo}
                    height={65}
                    width={65}
                    className="rounded-2xl mr-2"
                    alt="logo"
                  />
                </Badge>{" "}
                <p className="text-[13px] sm:text-[15px] font-bold">
                  Fahad Guled
                </p>
              </div>

              <p className="text-[10px] sm:text-[12px]">
                Co-Founder, Full Stack Developer
              </p>
            </div>
            <div className="mahad flex flex-col items-center justify-center gap-y-2">
              <Image
                src={mahad}
                alt="founder-image"
                width={100}
                height={100}
                rounded-xl
                className="rounded-full mb-2"
              />
              <div className="flex items-center">
                <Badge
                  content={<AiFillStar className="text-[#CFB53B]" />}
                  color="default"
                  className="mr-2 text-[#CFB53B] w-[20px] sm:w-[22px]"
                >
                  <Image
                    src={logo}
                    height={65}
                    width={65}
                    className="rounded-2xl mr-2"
                    alt="logo"
                  />
                </Badge>{" "}
                <p className="text-[13px] sm:text-[15px] font-bold">
                  Mahad Fahiye
                </p>
              </div>

              <p className="text-[10px] sm:text-[12px]">
                Co-Founder, Full Stack Developer
              </p>
            </div>
          </div>
        </AccordionItem>
        <AccordionItem
          key="2"
          aria-label="Frequently Asked Questions"
          title={"Frequently Asked Questions"}
          className="font-bold border-b-[1px] border-[#af1222] dark:border-[white] border-opacity-20"
        >
          <ul className="flex flex-col list-decimal">
            <li className="mb-5">
              <p className="font-bold mb-3">
                1. Does Fantasy Pulse support different fantasy football formats
                (e.g., PPR, standard, dynasty)?
              </p>
              <p className="text-[14px] indent-7 font-normal">
                - Absolutely! Fantasy Pulse is designed to accommodate various
                fantasy football formats, including PPR, standard, dynasty, and
                more.
              </p>
            </li>
            <li className="mb-5">
              <p className="font-bold mb-3">
                2. How often is the content updated on Fantasy Pulse?
              </p>
              <p className="text-[14px] indent-7 font-normal">
                - We regularly update our content to provide you with fresh and
                relevant information. You can expect a consistent stream of
                articles, polls, and insights throughout the fantasy football
                season.
              </p>
            </li>
            <li className="mb-5">
              <p className="font-bold mb-3">
                3. Is Fantasy Pulse compatible across all Fantasy platforms?
              </p>
              <p className="text-[14px] indent-7 font-normal">
                - As of now, Fantasy Pulse is only compatible with Sleeper.
              </p>
            </li>

            <li className="mb-5">
              <p className="font-bold mb-3">
                5. How can I provide feedback or suggest new features for
                Fantasy Pulse?
              </p>
              <p className="text-[14px] indent-7 font-normal">
                - We welcome your feedback and suggestions! You can share your
                ideas through our{" "}
                <Link
                  className="underline text-[#af1222]"
                  href={"https://www.patreon.com/FantasyPulse"}
                  target="_blank"
                >
                  patreon
                </Link>
                , and our team actively considers user input from patreon
                members when planning new features and updates.
              </p>
            </li>
            <li className="mb-5">
              <p className="font-bold mb-3">
                6. Can I use Fantasy Pulse for other sports, or is it
                exclusively for fantasy football?
              </p>
              <p className="text-[14px] indent-7 font-normal">
                - While Fantasy Pulse is currently focused on fantasy football,
                we have plans to expand to other sports in the future. Stay
                tuned for exciting developments!
              </p>
            </li>
          </ul>
        </AccordionItem>
        <AccordionItem
          key="3"
          aria-label="Support"
          title="Want in on the Action? Join Our Patreon!"
          className="font-bold"
        >
          <div>
            <p className="font-bold mb-3">
              We're thrilled to invite you to join our{" "}
              <Link
                className="underline text-[#af1222]"
                href={"https://www.patreon.com/FantasyPulse"}
                target="_blank"
              >
                Patreon
              </Link>{" "}
              family and become an integral part of our creative journey. 🚀
              Some benefits of supporting are:
            </p>
            <p className="text-[14px]  font-normal ">
              🗳️ Community Voting: Have a say in the direction of Fantasy Pulse!
              Your Patreon support gives you a vote on upcoming features and
              content.{" "}
            </p>
            <p className="text-[14px]  font-normal">
              {" "}
              🎉 Early Access: Be the first to experience new features, updates,
              and improvements before anyone else. Your feedback will help shape
              the future of Fantasy Pulse.
            </p>
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
