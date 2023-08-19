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
import { articles } from "./articles";

import { QuerySnapshot, onSnapshot } from "firebase/firestore";
import dotenv from "dotenv";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { JSONLoader } from "langchain/document_loaders";
import { FaissStore } from "langchain/vectorstores/faiss";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { RetrievalQAChain } from "langchain/chains";
import { SystemMessage } from "langchain/schema";
import { HumanMessage } from "langchain/schema";
import fs from "fs";
import path from "path";
import { db, storage } from "../../app/firebase";

dotenv.config();

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
  console.log("what was passed in ", req.body);
  const REACT_APP_LEAGUE_ID = req.body;

  try {
    const readingRef = ref(storage, `files/${REACT_APP_LEAGUE_ID}.txt`);
    const url = await getDownloadURL(readingRef);
    const response = await fetch(url);
    const fileContent = await response.text();
    const newFile = JSON.stringify(fileContent).replace(/\//g, "");
    //console.log("File ", newFile);
    const leagueData = [
      new Document({
        pageContent: [newFile],
        metadata: {
          title: "Fantasy Pulse",
          author: "Fantasy Pulse Editorial Team",
          date: "Sep 1, 2022",
        },
      }),
    ];
    // Process the retrieved data
    const vectorStore = await FaissStore.fromDocuments(
      leagueData,
      new OpenAIEmbeddings()
    );
    //await vectorStore.addDocuments(articles.article1);
    //await vectorStore.addDocuments(articles.article2);
    //await vectorStore.addDocuments(articles.article3);
    //await vectorStore.addDocuments(articles.article4);
    const model = new ChatOpenAI({
      temperature: 0.9,
      model: "gpt-4",
    });
    await vectorStore.save("leagueData");

    const headline = {
      id: "",
      category: "",
      title: "",
      description: "",
    };

    const headlineFormat = JSON.stringify(headline);

    const question = `give me 3 sports style headlines about the league's data, include the scores, who won by comparing their team_points to their opponent's team_points and their star players include a bit of humor as well. I want the information to be in this format exactly ${headlineFormat}, keep description short to one sentance give me the response in valid JSON array format`;

    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
    const apiResponse = await chain.call({ query: question });
    const cleanUp = await model.call([
      new SystemMessage(
        "Turn the following string into valid JSON format that strictly adhere to RFC8259 compliance"
      ),
      new HumanMessage(apiResponse.text),
    ]);
    updateWeeklyInfo(REACT_APP_LEAGUE_ID, cleanUp.text);
    return res.status(200).json(JSON.parse(apiResponse.text));
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "An error occurred" });
  }
}
