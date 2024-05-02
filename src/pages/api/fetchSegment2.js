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
import { Document } from "langchain/document";
import dotenv from "dotenv";
import { FaissStore } from "langchain/vectorstores/faiss";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { RetrievalQAChain } from "langchain/chains";
import { SystemMessage } from "langchain/schema";
import { HumanMessage } from "langchain/schema";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";

import { db, storage } from "../../app/firebase";

dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const updateWeeklyInfo = async (REACT_APP_LEAGUE_ID, articles) => {
  articles = await JSON.parse(articles);
  const weeklyInfoCollectionRef = collection(db, "Weekly Articles");
  const queryRef = query(
    weeklyInfoCollectionRef,
    where("league_id", "==", REACT_APP_LEAGUE_ID)
  );
  const querySnapshot = await getDocs(queryRef);
  if (!querySnapshot.empty) {
    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        segment2: articles,
      });
    });
  } else {
    await addDoc(weeklyInfoCollectionRef, {
      league_id: REACT_APP_LEAGUE_ID,
      segment2: articles,
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
  const readingRef = ref(storage, `files/${REACT_APP_LEAGUE_ID}.txt`);
  const url = await getDownloadURL(readingRef);

  const response = await fetch(url);
  const fileContent = await response.text();
  const newFile = JSON.stringify(fileContent).replace(/\//g, "");
  const wordCount = countWords(newFile);
  console.log(`Word count: ${wordCount}`);

  try {
    const model = new ChatOpenAI({
      temperature: 0.9,
      model: "gpt-4-turbo",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const question = `{leagueData} Give me an article where you're sarcasticly and comedically making fun of 6 random teams from this league's data, critique their questionable decisions, their team names, starters, & points. Do not include win or loss results. Make title short and creative. Keep the content within 450 words maximum. The format of the JSON response should strictly adhere to RFC8259 compliance, without any deviations or errors. The JSON structure should match this template:
  "title": "",
  "paragraph1": "",
  "paragraph2": "",
  "paragraph3": "",
  "paragraph4": "",
  "paragraph5": "",
  "paragraph6": "",
  "paragraph7": ""
Please ensure that the generated JSON response meets the specified criteria without any syntax issues or inconsistencies.`;

    const prompt = PromptTemplate.fromTemplate(question);
    const chainA = new LLMChain({ llm: model, prompt });

    res.setHeader("Content-Type", "application/json");
    res.write("[");

    const apiResponse = await chainA.call({ leagueData: newFile });
    const responseData = JSON.parse(apiResponse.text);
    for (let i = 0; i < responseData.length; i++) {
      if (i > 0) {
        res.write(",");
      }
      res.write(JSON.stringify(responseData[i]));
    }

    res.write("]");
    res.end();

    await updateWeeklyInfo(REACT_APP_LEAGUE_ID, apiResponse.text);
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "An error occurred" });
  }

  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, "Weekly Info"),
        where("league_id", "==", REACT_APP_LEAGUE_ID),
        limit(1)
      )
    );

    if (!querySnapshot.empty) {
      return res.status(404).json({ error: "No documents found" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "An error occurred" });
  }
}
