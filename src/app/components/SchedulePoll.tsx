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

const BarPoll = ({
  team1Name,
  team2Name,
  weekCounter,
  nflWeek,
}: {
  team1Name: string;
  team2Name: string;
  weekCounter: number;
  nflWeek: number;
}) => {
  const [votes, setVotes] = useState<VoteInfo[]>([
    {
      title: team1Name,
      votes: 0,
      color: "bg-[#af1222]",
    },
    {
      title: team2Name,
      votes: 0,
      color: "bg-[#1a1a1a]",
    },
  ]);

  return (
    <section className=" px-4 w-[70vw] xl:w-[35vw] md:h-[20vw] xl:h-[10vw] p-2">
      <div className="">
        <Options votes={votes} setVotes={setVotes} />
        <Bars votes={votes} />
      </div>
    </section>
  );
};

const Options = ({ votes, setVotes }) => {
  // const addVotes = async (newVotes: VoteInfo[]) => {
  //   try {
  //     const voteInfo = collection(db, "Home Poll");
  //     const queryRef = query(voteInfo, where("id", "==", "homepoll"));

  //     const querySnapshot = await getDocs(queryRef);

  //     // Add or update the document based on whether it already exists
  //     if (!querySnapshot.empty) {
  //       // Document exists, update it
  //       querySnapshot.forEach(async (doc) => {
  //         await updateDoc(doc.ref, {
  //           votes: newVotes, // Use the updated local newVotes array
  //         });
  //       });
  //     } else {
  //       // Document does not exist, add a new one
  //       await addDoc(voteInfo, {
  //         votes: newVotes, // Use the updated local newVotes array
  //         id: "homepoll",
  //       });
  //     }

  //     console.log("Votes added to the database successfully");
  //   } catch (error) {
  //     console.error("Error adding votes to the database:", error);
  //   }
  // };

  const totalVotes = votes.reduce((acc, cv) => (acc += cv.votes), 0);

  const handleIncrementVote = async (vote) => {
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

  // useEffect(() => {
  //   getVotes(); // Fetch votes from the database when the component mounts
  // }, []); // Empty dependency array to trigger the effect once

  // Rest of your component code

  return (
    <div className="col-span-1 ">
      <h3 className="mb-2 text-[12px] xl:text-[15px] text-center font-semibold text-slate-50">
        Who will win?
      </h3>
      <div className="mb-2 flex justify-center">
        {votes.map((vote: VoteInfo) => {
          return (
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => {
                handleIncrementVote(vote);
                //addVotes(votes);
              }}
              key={vote.title}
              className={`w-[70px] sm:w-[100px] md:w-[160px] rounded-xl ${vote.color} py-2 text-[11px] xl:text-[15px] text-white mr-2`}
            >
              {vote.title.length >= 9
                ? (vote.title.match(/[A-Z]/g) || []).length > 3
                  ? vote.title.slice(0, 10).toLowerCase()
                  : vote.title.slice(0, 10)
                : vote.title}
            </motion.button>
          );
        })}
      </div>
      <div className="flex justify-center">
        <span className="mb-1 text-[11px] xl:text-[15px] italic  text-slate-400">
          {totalVotes} votes
        </span>
      </div>
    </div>
  );
};

const Bars = ({ votes }) => {
  const totalVotes = votes.reduce((acc, cv) => (acc += cv.votes), 0);

  return (
    <div
      className="flex h-[60px] justify-center gap-2 "
      style={{
        gridTemplateColumns: `repeat(${votes.length}, minmax(0, 1fr))`,
      }}
    >
      {votes.map((vote) => {
        const height = vote.votes
          ? ((vote.votes / totalVotes) * 100).toFixed(2)
          : 0;
        return (
          <div
            key={vote.title}
            className="col-span-1 w-[70px] sm:w-[100px] md:w-[160px]"
          >
            <div className="relative flex h-full w-full items-end overflow-hidden rounded-2xl border-[1px] border-[#1a1a1a]">
              <motion.span
                animate={{ height: `${height}%` }}
                className={`relative z-0 w-full ${vote.color}`}
                transition={{ type: "spring" }}
              />
              <span className="absolute bottom-0 left-[50%] mt-2 inline-block w-full -translate-x-[50%] p-2 text-center text-sm text-slate-50">
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
