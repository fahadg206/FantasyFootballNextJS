import { NextApiResponse, NextApiRequest } from "next";
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
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import {
  getFirestore,
  collection,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore/lite";
import { QuerySnapshot, onSnapshot } from "firebase/firestore";

dotenv.config();

export default async function handler(req, res) {
  const REACT_APP_LEAGUE_ID = "864448469199347712";

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
      const retrievedData = querySnapshot.docs[0].data();
      console.log("Retrieved data:", retrievedData);

      // Process the retrieved data
      const vectorStore = await FaissStore.fromTexts(
        [JSON.stringify(retrievedData), "Bye bye", "hello nice world"],
        [{ id: 2 }, { id: 1 }, { id: 3 }],
        new OpenAIEmbeddings()
      );

      const model = new ChatOpenAI({
        temperature: 0.9,
      });

      const question = "Give me a summary of the data";
      const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

      const apiResponse = await chain.call({ query: question });
      console.log(apiResponse);

      return res.status(200).json(apiResponse);
    } else {
      console.log("No documents found in 'Article Info' collection");
      return res.status(404).json({ error: "No documents found" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "An error occurred" });
  }
}
