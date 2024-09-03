import { ref, getDownloadURL } from "firebase/storage";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  limit,
} from "firebase/firestore/lite";
import dotenv from "dotenv";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";

import { db, storage } from "../../app/firebase";
import { serverTimestamp } from "firebase/firestore/lite";

dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const updateWeeklyInfo = async (leagueId, articles) => {
  articles = await JSON.parse(articles);
  console.log("updating db for recap");
  console.log(articles);

  const weeklyInfoCollectionRef = collection(db, "Weekly Articles");
  const queryRef = query(
    weeklyInfoCollectionRef,
    where("league_id", "==", leagueId)
  );
  const querySnapshot = await getDocs(queryRef);

  const dataToUpdate = {
    articles: articles,
    timestamp: serverTimestamp(), // Add a timestamp field
    type: "recap", // Add a type field
  };

  if (!querySnapshot.empty) {
    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, dataToUpdate);
    });
  } else {
    await addDoc(weeklyInfoCollectionRef, {
      league_id: leagueId,
      articles: articles,
      timestamp: serverTimestamp(), // Add a timestamp field
      type: "recap", // Add a type field
    });
  }
};

function countWords(inputString) {
  const words = inputString.split(/\s+|\b/);
  const filteredWords = words.filter((word) => word.trim() !== "");
  return filteredWords.length;
}

export default async function handler(req, res) {
  const REACT_APP_LEAGUE_ID = req.body;
  try {
    // Ensure REACT_APP_LEAGUE_ID is correctly extracted from req.body

    console.log("Called recap ", REACT_APP_LEAGUE_ID);
    if (!REACT_APP_LEAGUE_ID) {
      return res.status(400).json({ error: "league_id is required" });
    }
    console.log("WHAT", REACT_APP_LEAGUE_ID);
    const readingRef = ref(storage, `files/${REACT_APP_LEAGUE_ID}.txt`);
    const url = await getDownloadURL(readingRef);
    console.log("We in recap");
    const response = await fetch(url);
    const fileContent = await response.text();
    const newFile = JSON.stringify(fileContent).replace(/\//g, "");
    const wordCount = countWords(newFile);
    console.log("Here is the league data for recap: ", newFile);

    const model = new ChatOpenAI({
      temperature: 0.9,
      model: "gpt-4-turbo",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    let question;

    if (wordCount > 2600) {
      question = `using a funny and exciting style of writing, give me a very concise sports breakdown recapping all the league's matchups, include the scores, who won by comparing their team_points to their opponent's team_points and their star players include a bit of humor as well. it should be 450 words max. Make sure to include all league matchups. Provide an exciting one sentence description/preview of what the article will entail that will hook the readers to read the rest of the article. The JSON structure should match this template:
      "description": "",
      "title": "",
      "paragraph1": "",
      "paragraph2": "",
      "paragraph3": "",
      "paragraph4": "",
      "paragraph5": "",
      "paragraph6": "",
      "paragraph7": ""
      Please ensure that the generated JSON response meets the specified criteria without any syntax issues or inconsistencies. Make each matchup breakdown short and concise. {leagueData}`;
    } else {
      question = `using a funny and exciting style of writing give me a sports breakdown recapping all the league's matchups, include the scores, who won by comparing their team_points to their opponent's team_points and their star players include a bit of humor as well. it should be 450 words max. Make sure to include all league matchups. Provide an exciting one sentence description/preview of what the article will entail that will hook the readers to read the rest of the article. The JSON structure should match this template:
      "description": "",
      "title": "",
      "paragraph1": "",
      "paragraph2": "",
      "paragraph3": "",
      "paragraph4": "",
      "paragraph5": "",
      "paragraph6": "",
      "paragraph7": ""
      Please ensure that the generated JSON response meets the specified criteria without any syntax issues or inconsistencies. {leagueData}`;
    }

    const prompt = new PromptTemplate({
      inputVariables: ["leagueData"],
      template: question,
    });

    res.setHeader("Content-Type", "application/json");
    res.write("[");

    const chainA = new LLMChain({
      llm: model,
      prompt: prompt,
    });

    let firstChunk = true;

    const apiResponse = await chainA.call({ leagueData: newFile });
    const responseData = JSON.parse(apiResponse.text);

    for (let i = 0; i < responseData.length; i++) {
      if (!firstChunk) {
        res.write(",");
      } else {
        firstChunk = false;
      }

      res.write(JSON.stringify(responseData[i]));
    }

    res.write("]");
    res.end();

    // Update the database with the articles
    await updateWeeklyInfo(REACT_APP_LEAGUE_ID, apiResponse.text);
  } catch (error) {
    console.error("Unexpected error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "An error occurred" });
    }
  }

  try {
    // Retrieve data from the database based on league_id
    const querySnapshot = await getDocs(
      query(
        collection(db, "Weekly Info"),
        where("league_id", "==", REACT_APP_LEAGUE_ID),
        limit(1)
      )
    );

    if (querySnapshot.empty) {
      return res.status(404).json({ error: "No documents found" });
    }
  } catch (error) {
    console.error("Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "An error occurred" });
    }
  }
}
