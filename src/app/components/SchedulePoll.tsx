import { useState, useEffect } from "react";
import { m, motion } from "framer-motion";
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
import { BsDot } from "react-icons/bs";

interface VoteInfo {
  title: string;
  votes: number;
  color: string;
}

const BarPoll = ({
  team1Name,
  team2Name,
  liveGame,
  matchup_id,
  nflWeek,
}: {
  team1Name: string;
  team2Name: string;
  liveGame: boolean;
  matchup_id: string;
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
  const [winningTeamName, setWinningTeamName] = useState("");
  const [winningTeamVotes, setWinningTeamVotes] = useState(0);
  const [userVoted, setUserVoted] = useState(false);
  //console.log("SP", team1Name, team2Name);

  return (
    <section className=" px-4 w-[70vw] xl:w-[35vw] md:h-[20vw] xl:h-[10vw]  p-2">
      <div className="">
        <Options
          matchup_id={matchup_id}
          votes={votes}
          setVotes={setVotes}
          setWinningTeamName={setWinningTeamName}
          setWinningTeamVotes={setWinningTeamVotes}
          winningTeamName={winningTeamName}
          winningTeamVotes={winningTeamVotes}
          setUserVoted={setUserVoted}
          userVoted={userVoted}
          liveGame={liveGame}
          nflWeek={nflWeek}
        />
        <Bars votes={votes} liveGame={liveGame} />
      </div>
    </section>
  );
};

const Options = ({
  votes,
  setVotes,
  matchup_id,
  liveGame,
  setWinningTeamName,
  setWinningTeamVotes,
  winningTeamName,
  winningTeamVotes,
  setUserVoted,
  userVoted,
  nflWeek,
}) => {
  const leagueID = localStorage.getItem("selectedLeagueID");

  const addVotes = async (votes) => {
    console.log(votes);
    try {
      const voteInfo = collection(db, "Matchup Polls");
      const queryRef = query(voteInfo, where("league_id", "==", leagueID));

      const querySnapshot = await getDocs(queryRef);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const existingData = doc.data();
        const existingMatchups = existingData.matchups || [];

        // Check if the matchup with the same ID already exists
        const existingMatchupIndex = existingMatchups.findIndex(
          (matchup) => matchup.matchup_id === matchup_id
        );

        // if matchup index exists
        if (existingMatchupIndex !== -1) {
          // Update the existing matchup's votes
          const updatedMatchups = [...existingMatchups];
          // go to the index of the matchup we're trying to update and replace its votes array with the new and updated one
          updatedMatchups[existingMatchupIndex].votes = votes;
          //then pass the updated matchups array to the key matchups
          await updateDoc(doc.ref, {
            matchups: updatedMatchups,
          });

          console.log(
            "Votes updated successfully for existing matchup",
            matchup_id
          );
        } else {
          // if matchup doesn't exist then add this new matchup to the existing ones and then pass the new updated array into matchups key
          // Add a new matchup
          const newMatchup = { matchup_id: matchup_id, votes: votes };
          const updatedMatchups = [...existingMatchups, newMatchup];

          await updateDoc(doc.ref, {
            matchups: updatedMatchups,
          });

          console.log("New matchup added successfully with votes", votes);
        }
      } else {
        // Document does not exist, so initialize the array with the first matchup that was voted on by any user.
        await addDoc(voteInfo, {
          league_id: leagueID,
          matchups: [{ matchup_id: matchup_id, votes: votes }],
        });

        console.log("New document created with matchup and votes", votes);
      }
    } catch (error) {
      console.error("Error adding or updating matchup:", error);
    }
  };

  const totalVotes = votes.reduce((acc, cv) => (acc += cv.votes), 0);
  const league_id = localStorage.getItem("selectedLeagueID");

  const handleIncrementVote = async (vote) => {
    const newVote = { ...vote, votes: vote.votes + 1 };

    const newVotes = (prevVotes) =>
      prevVotes.map((v) => (v.title === newVote.title ? newVote : v));

    addVotes(newVotes(votes));

    setVotes((prevVotes) =>
      prevVotes.map((v) => (v.title === newVote.title ? newVote : v))
    );
    setUserVoted(true);
    localStorage.setItem(`${league_id} ${matchup_id} userVoted`, userVoted);
    localStorage.setItem("currentWeek", nflWeek);
    console.log(votes);
  };

  if (localStorage.getItem("currentWeek") < nflWeek) {
    localStorage.removeItem(`${league_id} ${matchup_id} userVoted`);
    localStorage.removeItem("currentWeek");
  }

  const getVotes = async () => {
    const voteInfo = collection(db, "Matchup Polls");
    try {
      const querySnapshot = await getDocs(
        query(voteInfo, where("league_id", "==", leagueID), limit(1))
      );

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          const matchups = docData.matchups || []; // Retrieve the matchups array
          console.log(matchups);
          const matchup = matchups.find(
            (matchup) => matchup.matchup_id === matchup_id
          ); // Find the specific matchup
          if (matchup) {
            setVotes(matchup.votes); // Set the votes for the specific matchup

            let team1 = matchup.votes[0];
            let team2 = matchup.votes[1];

            if (team1.votes > team2.votes) {
              setWinningTeamName(team1.title);
              setWinningTeamVotes(
                Math.round((team1.votes / (team1.votes + team2.votes)) * 100)
              );
            } else if (team2.votes > team1.votes) {
              setWinningTeamName(team2.title);
              setWinningTeamVotes(
                Math.round((team2.votes / (team1.votes + team2.votes)) * 100)
              );
            } else {
              setWinningTeamName("DRAW");
            }
          } else {
            console.log("Matchup not found.");
          }
        });
      } else {
        //console.log("Document not found.");
      }
    } catch (error) {
      console.error("Error retrieving votes from the database:", error);
    }
  };

  useEffect(() => {}, []);

  useEffect(() => {
    getVotes(); // Fetch votes from the database when the component mounts
  }, []); // Empty dependency array to trigger the effect once

  return (
    <div className="col-span-1 ">
      <div className={liveGame ? `hidden` : `block`}>
        <h3 className="mb-2 text-[12px] xl:text-[15px] text-center font-semibold ">
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
                }}
                key={vote.title}
                className={
                  localStorage.getItem(
                    `${league_id} ${matchup_id} userVoted`,
                    userVoted
                  )
                    ? `hidden`
                    : ` block w-[70px] sm:w-[100px] md:w-[160px] rounded-xl ${vote.color} py-2 text-[11px] xl:text-[15px]  mr-2 text-white`
                }
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
          <span className="mb-1 text-[11px] xl:text-[15px] italic flex flex-col items-center">
            <p
              className={
                localStorage.getItem(
                  `${league_id} ${matchup_id} userVoted`,
                  userVoted
                )
                  ? `block text-[12px] italic`
                  : `hidden`
              }
            >
              Thanks for voting!
            </p>
            {totalVotes} votes
          </span>
        </div>
      </div>

      <div
        className={
          liveGame
            ? ` w-[50vw] xl:w-[35vw] flex flex-col h-[150px] justify-around items-center`
            : `hidden`
        }
      >
        <p className="italic text-[14px] text-[#1a1a1a] dark:text-[#979090] text-center">
          {winningTeamName ? (
            winningTeamName === "DRAW" ? (
              <div>Votes Resulted in a DRAW!</div>
            ) : (
              ` ${winningTeamName} was voted to win by ${winningTeamVotes}% of league members!`
            )
          ) : (
            "No Vote Results to display."
          )}
        </p>{" "}
        <p className="text-[12px] text-[#af1222] flex items-center">
          <BsDot /> LIVE
        </p>
      </div>
    </div>
  );
};

const Bars = ({ votes, liveGame }) => {
  const totalVotes = votes.reduce((acc, cv) => (acc += cv.votes), 0);

  return (
    <div
      className={liveGame ? `hidden ` : `flex h-[60px] justify-center gap-2 `}
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
              <span className="absolute bottom-0 left-[50%] mt-2 inline-block w-full -translate-x-[50%] p-2 text-center text-sm text-[#8d8787] dark:text-white">
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
