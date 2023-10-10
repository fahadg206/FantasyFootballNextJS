import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  limit,
} from "firebase/firestore/lite";
import { AiFillAlert } from "react-icons/ai";
import Image from "next/image";

interface VoteInfo {
  title: string;
  votes: number;
  color: string;
}

interface PlayerVoteInfo {
  playerName?: string;
  avatar?: string;
  matchup?: string;
  votes?: number;
  color?: string;
}

interface OptionsProps {
  votes: PlayerVoteInfo[];
  setVotes: React.Dispatch<React.SetStateAction<PlayerVoteInfo[]>>;
}

interface BarsProps {
  votes: PlayerVoteInfo[];
}

// [
//   {
//     title: "Articles Page",
//     votes: 0,
//     color: "bg-[#af1222]",
//   },
//   {
//     title: "Rivarly Page",
//     votes: 0,
//     color: "bg-[#1a1a1a]",
//   },
//   {
//     title: "League Managers Page",
//     votes: 0,
//     color: "bg-[#e45263]",
//   },
// ]

const BarPoll = () => {
  const [votes, setVotes] = useState<PlayerVoteInfo[]>([
    {
      playerName: "Brock Purdy",
      avatar: "https://sleepercdn.com/content/nfl/players/thumb/8183.jpg",
      matchup: "17 of 24 for 252 pass yards, 4 pass TDs",
      votes: 0,
      color: "bg-[#af1222]",
    },
    {
      playerName: "Joe Burrow",
      avatar: "https://sleepercdn.com/content/nfl/players/thumb/6770.jpg",
      matchup: "36 of 46 for 317 pass yards, 3 pass TDs",
      votes: 0,
      color: "bg-[#1a1a1a]",
    },
    {
      playerName: "Justin Fields",
      avatar: "https://sleepercdn.com/content/nfl/players/thumb/7591.jpg",
      matchup: "15 of 29 for 282 pass yards, 4 pass TDs",
      votes: 0,
      color: "bg-[#e45263]",
    },
  ]);

  return (
    <section className=" px-4 mb-10  w-[100vw] xl:w-[60vw]">
      <div className="mx-auto grid max-w-4xl grid-cols-1  md:grid-cols-[1fr_400px] md:gap-12 border-y-[1px] border-[#af1222] border-opacity-20 p-2 rounded-xl">
        <Options votes={votes} setVotes={setVotes} />
        <Bars votes={votes} />
      </div>
    </section>
  );
};

const Options: React.FC<OptionsProps> = ({ votes, setVotes }) => {
  const [voted, setVoted] = useState(false);
  const addVotes = async (newVotes: PlayerVoteInfo[]) => {
    try {
      const voteInfo = collection(db, "Home Poll");
      const queryRef = query(voteInfo, where("id", "==", "homepoll"));

      const querySnapshot = await getDocs(queryRef);

      // Add or update the document based on whether it already exists
      if (!querySnapshot.empty) {
        // Document exists, update it
        querySnapshot.forEach(async (doc) => {
          await updateDoc(doc.ref, {
            votes: newVotes, // Use the updated local newVotes array
          });
        });
      } else {
        // Document does not exist, add a new one
        await addDoc(voteInfo, {
          votes: newVotes, // Use the updated local newVotes array
          id: "homepoll",
        });
      }

      //console.log("Votes added to the database successfully");
    } catch (error) {
      console.error("Error adding votes to the database:", error);
    }
  };

  const totalVotes = votes.reduce((acc, cv) => (acc += cv.votes), 0);

  const handleIncrementVote = async (vote: PlayerVoteInfo) => {
    const newVote = { ...vote, votes: vote.votes + 1 };
    const newVotes = (prevVotes) =>
      prevVotes.map((v) => (v.playerName === newVote.playerName ? newVote : v));

    addVotes(newVotes(votes));

    setVotes((prevVotes) =>
      prevVotes.map((v) => (v.playerName === newVote.playerName ? newVote : v))
    );
  };

  const getVotes = async () => {
    const voteInfo = collection(db, "Home Poll");
    try {
      const querySnapshot = await getDocs(
        query(voteInfo, where("id", "==", "homepoll"), limit(1))
      );

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          setVotes(docData.votes);
          //console.log("votes returned", docData.votes);
        });
      } else {
        //console.log("votes do not exist");
      }
    } catch (error) {
      console.error("Error adding votes to the database:", error);
    }
  };

  useEffect(() => {
    getVotes(); // Fetch votes from the database when the component mounts
  }, []); // Empty dependency array to trigger the effect once

  // Rest of your component code

  return (
    <div className="col-span-1 py-12">
      <h3 className="mb-6 text-2xl font-semibold  text-center">
        Vote for QB performance of the week!
      </h3>
      <div
        className={
          voted
            ? `hidden`
            : ` mb-6 space-y-2 text-center flex flex-col items-center `
        }
      >
        {votes.map((vote: PlayerVoteInfo) => {
          return (
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => {
                handleIncrementVote(vote);
                setVoted(true);
              }}
              key={vote.playerName}
              className={`w-[80%] rounded-xl ${vote.color} text-white text-center py-2 font-medium flex justify-around items-center`}
            >
              <Image
                src={vote.avatar}
                alt="player"
                width={60}
                height={60}
                className="rounded-full"
              />{" "}
              {vote.playerName}
              <p className="text-[11px] italic text-[#e8dede] mr-2">
                {vote.matchup}
              </p>
            </motion.button>
          );
        })}
      </div>
      <div className="flex flex-col items-center justify-center">
        <span className="mb-2 italic text-black dark:text-slate-400 text-center">
          {totalVotes} votes
        </span>
        <p className={voted ? `block italic text-[14px]` : `hidden`}>
          Thanks for voting!
        </p>
      </div>
    </div>
  );
};

const Bars: React.FC<BarsProps> = ({ votes }) => {
  const totalVotes = votes.reduce((acc, cv) => (acc += cv.votes), 0);

  return (
    <div
      className="col-span-1 grid min-h-[200px] gap-2"
      style={{
        gridTemplateColumns: `repeat(${votes.length}, minmax(0, 1fr))`,
      }}
    >
      {votes.map((vote) => {
        const height = vote.votes
          ? ((vote.votes / totalVotes) * 100).toFixed(2)
          : 0;
        return (
          <div key={vote.playerName} className="col-span-1">
            <div className="relative flex h-full w-full items-end overflow-hidden rounded-2xl bg-gradient-to-b from-slate-700 to-slate-800">
              <motion.span
                animate={{ height: `${height}%` }}
                className={`relative z-0 w-full ${vote.color}`}
                transition={{ type: "spring" }}
              />
              <span className="absolute bottom-0 left-[50%] mt-2 inline-block w-full -translate-x-[50%] p-2 text-center text-sm text-slate-50">
                <b>{vote.playerName}</b>
                <br></br>
                <span className="text-xs ">{vote.votes} votes</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BarPoll;
