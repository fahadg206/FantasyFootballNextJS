import { ref, getDownloadURL } from "firebase/storage";
import { collection, query, where, getDocs } from "firebase/firestore/lite";
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
import fs from "fs";
import path from "path";
import { db, storage } from "../../app/firebase";

dotenv.config();

export default async function handler(req, res) {
  const REACT_APP_LEAGUE_ID = "864448469199347712";

  try {
    const readingRef = ref(storage, `files/864448469199347712.txt`);
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
    await vectorStore.addDocuments(articles.article2);
    //await vectorStore.addDocuments(articles.article3);
    await vectorStore.addDocuments(articles.article4);

    const model = new ChatOpenAI({
      temperature: 0.9,
      model: "gpt-4",
      max_tokens: 8000,
    });

    await vectorStore.save("leagueData");

    const question =
      "using my style of writing give me a sports breakdown recapping all the league's matchups, include the scores, who won by comparing their team_points to their opponent's team_points and their star players include a bit of humor as well";
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

    const apiResponse = await chain.call({ query: question });
    console.log(apiResponse.text);

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
