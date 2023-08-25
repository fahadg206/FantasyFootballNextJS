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

interface VoteInfo {
  title: string;
  votes: number;
  color: string;
}

interface OptionsProps {
  votes: VoteInfo[];
  setVotes: React.Dispatch<React.SetStateAction<VoteInfo[]>>;
}

interface BarsProps {
  votes: VoteInfo[];
}

const BarPoll = () => {
  const [votes, setVotes] = useState<VoteInfo[]>([
    {
      title: "Articles Page",
      votes: 0,
      color: "bg-[#af1222]",
    },
    {
      title: "Rivarly Page",
      votes: 0,
      color: "bg-[#1a1a1a]",
    },
    {
      title: "League Managers Page",
      votes: 0,
      color: "bg-slate-500",
    },
  ]);

  return (
    <section className=" px-4 mb-10  w-[100vw] xl:w-[60vw]">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-2 md:grid-cols-[1fr_400px] md:gap-12">
        <Options votes={votes} setVotes={setVotes} />
        <Bars votes={votes} />
      </div>
    </section>
  );
};

const Options: React.FC<OptionsProps> = ({ votes, setVotes }) => {
  const addVotes = async (newVotes: VoteInfo[]) => {
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

      console.log("Votes added to the database successfully");
    } catch (error) {
      console.error("Error adding votes to the database:", error);
    }
  };

  const totalVotes = votes.reduce((acc, cv) => (acc += cv.votes), 0);

  const handleIncrementVote = async (vote: VoteInfo) => {
    const newVote = { ...vote, votes: vote.votes + 1 };

    setVotes((prevVotes) =>
      prevVotes.map((v) => (v.title === newVote.title ? newVote : v))
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
          console.log("votes returned", docData.votes);
        });
      } else {
        console.log("votes do not exist");
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
      <h3 className="mb-6 text-2xl font-semibold text-slate-50 text-center">
        What is your favorite page from Fantasy Pulse so far?
      </h3>
      <div className="mb-6 space-y-2">
        {votes.map((vote: VoteInfo) => {
          return (
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => {
                handleIncrementVote(vote);
                addVotes(votes);
              }}
              key={vote.title}
              className={`w-full rounded-md ${vote.color} py-2 font-medium text-white`}
            >
              {vote.title}
            </motion.button>
          );
        })}
      </div>
      <div className="flex items-center justify-center">
        <span className="mb-2 italic text-slate-400 text-center">
          {totalVotes} votes
        </span>
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
          <div key={vote.title} className="col-span-1">
            <div className="relative flex h-full w-full items-end overflow-hidden rounded-2xl bg-gradient-to-b from-slate-700 to-slate-800">
              <motion.span
                animate={{ height: `${height}%` }}
                className={`relative z-0 w-full ${vote.color}`}
                transition={{ type: "spring" }}
              />
              <span className="absolute bottom-0 left-[50%] mt-2 inline-block w-full -translate-x-[50%] p-2 text-center text-sm text-slate-50">
                <b>{vote.title}</b>
                <br></br>
                <span className="text-xs text-slate-200">
                  {vote.votes} votes
                </span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BarPoll;
