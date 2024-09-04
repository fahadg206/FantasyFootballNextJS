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

const HomePoll = () => {
  const [votes, setVotes] = useState<PlayerVoteInfo[]>([
    {
      playerName: "Jared Goff",
      avatar: "https://sleepercdn.com/content/nfl/players/thumb/3163.jpg",
      matchup: "@ LAR",
      votes: 0,
      color: "bg-[#af1222]",
    },
    {
      playerName: "Jayden Daniels",
      avatar: "https://sleepercdn.com/content/nfl/players/thumb/11566.jpg",
      matchup: "@ TB",
      votes: 0,
      color: "bg-[#1a1a1a]",
    },
    {
      playerName: "Tua Tagovailoa",
      avatar: "https://sleepercdn.com/content/nfl/players/thumb/6768.jpg",
      matchup: "vs. JAC",
      votes: 0,
      color: "bg-[#e45263]",
    },
  ]);

  return (
    <section className="w-full px-4 mb-10 lg:transform lg:scale-75 lg:origin-top-left">
      <div className="mx-auto grid max-w-full grid-cols-1 p-2 rounded-xl">
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

      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (doc) => {
          await updateDoc(doc.ref, {
            votes: newVotes,
          });
        });
      } else {
        await addDoc(voteInfo, {
          votes: newVotes,
          id: "homepoll",
        });
      }
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
    setVoted(true);
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
        });
      }
    } catch (error) {
      console.error("Error getting votes from the database:", error);
    }
  };

  useEffect(() => {
    getVotes();
  }, []);

  return (
    <div className="col-span-1 py-4">
      <h3 className="mb-2 text-lg font-semibold text-center">
        Vote for who would you rather start week 1!
      </h3>
      <div
        className={
          voted ? `hidden` : `space-y-2 text-center flex flex-col items-center`
        }
      >
        {votes.map((vote: PlayerVoteInfo) => (
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => handleIncrementVote(vote)}
            key={vote.playerName}
            className={`w-[80%] max-w-xs rounded-xl ${vote.color} text-white py-2 font-medium flex justify-between items-center`}
          >
            <Image
              src={vote.avatar}
              alt="player"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="ml-2 flex-1 text-left text-sm">
              {vote.playerName}
            </span>
            <p className="mr-3 text-s italic text-[#e8dede]">{vote.matchup}</p>
          </motion.button>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center mt-2">
        <span className="italic text-black dark:text-slate-400 text-sm">
          {totalVotes} votes
        </span>
        <p className={voted ? `block italic text-[12px] mt-2` : `hidden`}>
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
      className="col-span-1 grid min-h-[150px] gap-1 mt-4 w-[80%] max-w-xs mx-auto"
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

export default HomePoll;
