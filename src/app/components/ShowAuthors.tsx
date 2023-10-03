import React from "react";
import steve from "../images/finger.jpg";
import boogie from "../images/boogie.png";
import pulseDr from "../images/pulsecheck.jpg";
import glazer from "../images/Glazer.jpg";
import { StaticImageData } from "next/image";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import Image from "next/image";
import el_jefe from "../images/hamsa.png";

import { Button } from "@nextui-org/button";
import { auth } from "../firebase";
import { TbWriting } from "react-icons/tb";

interface Authors {
  name: string;
  image: StaticImageData;
  title: string;
  about: string;
  likes?: number;
  dislikes?: number;
}

const ShowAuthors = ({ thisWeeksAuthors }: { thisWeeksAuthors: string[] }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const authors: Authors[] = [
    {
      name: "Boogie The Writer",
      title: "Fantasy Pulse Senior Staff Writer",
      about:
        "Boogie The Writer, a Senior Staff Writer at FantasyPulse, is a seasoned sports journalist with a knack for bringing the excitement of sports matchups to life through his vivid and engaging storytelling. His recent article brilliantly captures the intensity and drama of various sporting contests, adding a touch of humor and intrigue to the world of fantasy sports. Boogie's writing style keeps readers on the edge of their seats as he takes them on a thrilling journey through the ups and downs of each competition.",
      image: boogie,
      likes: 0,
      dislikes: 0,
    },
    // {
    //   name: "El Jefe",
    //   title: "Head of Media Department",
    //   about:
    //     "El Jefe, the Head of Media Department at FantasyPulse, is a fearless predictor in the world of fantasy sports. More known for his shot creating in 2k, he's also known for relying on his gut instincts and making bold predictions that often leave fans in awe. El Jefe's unorthodox approach to making picks adds an element of excitement and unpredictability for Fantasy Pulse. With his audacious takes, he keeps fans and fellow fantasy enthusiasts on their toes, eager to see if his gut feelings will lead to fantasy glory or surprises.",
    //   image: el_jefe,
    //   likes: 0,
    //   dislikes: 0,
    // },
    {
      name: "Savage Steve",
      title: "Independent Journalist",
      about:
        " Savage Steve is an unapologetically bold and independent journalist known for his razor-sharp wit and no-holds-barred approach when it comes to critiquing fantasy football teams and their managers. With a knack for delivering humorous and sarcastic commentary, he fearlessly calls out the flaws of these teams in a way that leaves readers both entertained and in stitches. Savage Steve's unique style provides a refreshing and comedic take on the world of fantasy sports, sparing no one from his clever criticism.",
      image: steve,
      likes: 0,
      dislikes: 0,
    },
    // {
    //   name: "Joe Glazer",
    //   title: "Fantasy Pulse Insider",
    //   about:
    //     "Joe Glazer, the Fantasy Pulse Insider, is renowned for his unbridled optimism and unwavering positivity. He consistently emphasizes the strengths and successes of fantasy league managers, focusing on their impressive records, offensive prowess, and adaptability in the league. Joe's infectious enthusiasm and relentless positivity create an uplifting and encouraging atmosphere for fantasy sports fans, always highlighting the bright side of the game.",
    //   image: glazer,
    //   likes: 0,
    //   dislikes: 0,
    // },
    // {
    //   name: "Greg Roberts",
    //   title: "Fantasy Pulse Medical Director",
    //   about:
    //     "Greg Roberts, the Fantasy Pulse Medical Director, is renowned for his weekly 'Pulse Check' assessments, where he evaluates the state of league managers and their teams with clinical precision. With categories like 'Steady Pulse', 'Weak Pulse', 'Flatlined', and 'Strong Pulse', Greg provides a thorough examination of each team's playoff prospects. His expertise in diagnosing the health of fantasy football teams adds a unique and analytical dimension to the world of fantasy sports, helping managers make informed decisions to improve their standings.",
    //   image: pulseDr,
    //   likes: 0,
    //   dislikes: 0,
    // },
  ];
  //console.log(thisWeeksAuthors);
  return (
    <div>
      <Button
        className="flex items-center gap-2 px-3 py-2 rounded-[5px] text-[#1a1a1a] font-bold bg-[#e0dfdf] dark:bg-[#0a0a0a] dark:text-white transition-colors text-[13px]"
        onPress={onOpen}
      >
        This Week's Authors! <TbWriting size={15} />
      </Button>
      <Modal
        placement="center"
        className=""
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent className="bg-[#e0dfdf] dark:bg-[#0A0A0A] rounded-xl">
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-center">
                This Weeks Authors
              </ModalHeader>
              <ModalBody>
                {authors.map((author) => {
                  return (
                    <div className="flex flex-col items-center justify-center border-b-[1px] border-opacity-10 border-[#af1222] p-3">
                      <Image
                        src={author.image}
                        alt="author-img"
                        width={130}
                        height={130}
                        className="rounded-xl mb-1"
                      />
                      <p className="text-[17px] font-bold">{author.name}</p>
                      <p className="text-[11px] mb-4">{author.title}</p>
                      <p className="text-[13px] indent-6">{author.about}</p>
                    </div>
                  );
                })}
              </ModalBody>
              <ModalFooter>
                <Button
                  className="border-2 p-1 rounded-xl font-bold text-[14px]"
                  onPress={onClose}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ShowAuthors;
