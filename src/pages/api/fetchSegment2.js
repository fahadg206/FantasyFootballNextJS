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
import { SystemMessage } from "langchain/schema";
import { HumanMessage } from "langchain/schema";
import { RetrievalQAChain } from "langchain/chains";
import fs from "fs";
import path from "path";
import { db, storage } from "../../app/firebase";

dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const updateWeeklyInfo = async (REACT_APP_LEAGUE_ID, articles) => {
  articles = await JSON.parse(articles);
  // Reference to the "Weekly Info" collection
  const weeklyInfoCollectionRef = collection(db, "Weekly Articles");
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
        segment2: articles,
      });
    });
  } else {
    // Document does not exist, add a new one
    await addDoc(weeklyInfoCollectionRef, {
      league_id: REACT_APP_LEAGUE_ID,
      segment2: articles,
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
      model: "gpt-4.0",
      max_tokens: 8000,
      openAIApiKey: OPENAI_API_KEY,
    });
    await vectorStore.save("leagueData");

    const article = {
      title: "",
      paragraph1: "",
      paragraph2: "",
      paragraph3: "",
    };

    const articleTemplate = JSON.stringify(article);
    const question = `Give me an article where you're sarcasticly and comedically making fun of 6 random teams from this league's data, Make title short and creative. Keep the content within 450 words maximum. The format of the JSON response should strictly adhere to RFC8259 compliance, without any deviations or errors. The JSON structure should match this template: {
  "title": "",
  "paragraph1": "",
  "paragraph2": "",
  "paragraph3": "",
  "paragraph4": "",
  "paragraph5": "",
  "paragraph6": "",
  "paragraph7": ""
}
Please ensure that the generated JSON response meets the specified criteria without any syntax issues or inconsistencies.`;
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
    const apiResponse = await chain.call({ query: question });
    console.log(apiResponse);
    console.log(typeof apiResponse.text);
    const cleanUp = await model.call([
      new SystemMessage(
        "Turn the following string into valid JSON format that strictly adhere to RFC8259 compliance"
      ),
      new HumanMessage(apiResponse.text),
    ]);
    updateWeeklyInfo(REACT_APP_LEAGUE_ID, cleanUp.text);
    return res.status(200).json(apiResponse);
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "An error occurred" });
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

    if (!querySnapshot.empty) {
      console.log("No documents found in 'Article Info' collection");
      return res.status(404).json({ error: "No documents found" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "An error occurred" });
  }
}
