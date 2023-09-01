import { ref, getDownloadURL } from "firebase/storage";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
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

//dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const updateWeeklyInfo = async (REACT_APP_LEAGUE_ID, headlines) => {
  // Reference to the "Weekly Info" collection
  const weeklyInfoCollectionRef = collection(db, "Weekly Headlines");
  // Use a Query to check if a document with the league_id exists
  const queryRef = query(
    weeklyInfoCollectionRef,
    where("league_id", "==", REACT_APP_LEAGUE_ID)
  );
  const querySnapshot = await getDocs(queryRef);
  // Add or update the document based on whether it already exists
  if (!querySnapshot.empty) {
    // Document exists, update it
    console.log("in if");
    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        headlines: headlines,
      });
    });
  } else {
    // Document does not exist, add a new one
    await addDoc(weeklyInfoCollectionRef, {
      league_id: REACT_APP_LEAGUE_ID,
      headlines: headlines,
    });
  }
};

export default async function handler(req, res) {
  console.log("here");
  // console.log("what was passed in ", req.body);
  // const REACT_APP_LEAGUE_ID = req.body;

  try {
    console.log("Here");
    console.info(process.env.OPENAI_API_KEY);
    const model = new ChatOpenAI({
      temperature: 0.9,
      model: "gpt-4",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const question = `give me 3 sports style headlines about the league's data, include the scores,team names, & who won by comparing their star starters with their points. include a bit of humor as well. I want the information to be in this format exactly headline =
  "id": "",
  "category": "",
  "title": "",
  "description": ""
 keep description short to one sentence give me the response in valid JSON array format {leagueData}`;
    console.log(question);

    const prompt = PromptTemplate.fromTemplate(question);
    const chainA = new LLMChain({ llm: model, prompt });

    // The result is an object with a `text` property.
    const apiResponse = await chainA.call({ leagueData: "NBA" });
    // const cleanUp = await model.call([
    //   new SystemMessage(
    //     "Turn the following string into valid JSON format that strictly adhere to RFC8259 compliance"
    //   ),
    //   new HumanMessage(apiResponse.text),
    // ]);
    // console.log("Headlines API ", apiResponse.text);
    // const cleanUp = await model.call([
    //   new SystemMessage(
    //     "Turn the following string into valid JSON format that strictly adhere to RFC8259 compliance, if it already is in a valid JSON format then give me the string as the response, without any other information from you"
    //   ),
    //   new HumanMessage(apiResponse.text),
    // ]);

    //updateWeeklyInfo("864448469199347712", cleanUp);

    return res.status(200).json(JSON.parse(apiResponse.text));
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "Failed" });
  }
}
