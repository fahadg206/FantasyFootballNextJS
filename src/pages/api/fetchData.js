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

  const readingRef = ref(storage, `files/864448469199347712.txt`);
  try {
    getDownloadURL(readingRef)
      .then((url) => {
        fetch(url)
          .then((response) => response.text())
          .then(async (fileContent) => {
            const file = JSON.stringify(fileContent);
            const newFile = file.replace(/\//g, "");

            console.log("File ", newFile);
            // Process the retrieved data
            const vectorStore = await FaissStore.fromTexts(
              [file],
              [{ id: 1 }],
              new OpenAIEmbeddings()
            );

            const model = new ChatOpenAI({
              temperature: 0.9,
            });
            //"Give me a short article using my style summarizing all the matchups, make sure to include all teams, a little bit of humor and a sports caster style way of reporting";
            const question =
              "Give me a short article using my style summarizing all the matchups, make sure to include all teams, their leading scoring players, a little bit of humor and a sports caster style way of reporting";
            const chain = RetrievalQAChain.fromLLM(
              model,
              vectorStore.asRetriever()
            );

            const apiResponse = await chain.call({ query: question });
            console.log(apiResponse);

            return res.status(200).json(apiResponse);
          })
          .catch((error) => {
            console.error("Error fetching text file content:", error);
          });
      })
      .catch((error) => {
        console.error("Error getting download URL:", error);
      });
  } catch (error) {
    console.error("Unexpected error:", error);
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
      //   const retrievedData = querySnapshot.docs[0].data();
      //   console.log("Retrieved data:", retrievedData);

      //   const model = new ChatOpenAI({
      //     temperature: 0.9,
      //   });

      //   const question =
      //     "Give me a short article with no more than 3 short paragraphs using my style summarizing all this weeks matchups, make sure to include a little bit of humor and a sports caster style way of reporting";
      //   const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

      //   //const apiResponse = await chain.call({ query: question });
      //   console.log(apiResponse);

      //   return res.status(200).json(apiResponse);
      // } else {
      console.log("No documents found in 'Article Info' collection");
      return res.status(404).json({ error: "No documents found" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "An error occurred" });
  }
}
