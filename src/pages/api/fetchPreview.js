import { ref, getDownloadURL } from "firebase/storage";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  limit, // Import the limit function
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
  console.log("updating db");
  console.log(articles);
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
    //console.log("in if");
    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        preview: articles[0],
      });
    });
  } else {
    // Document does not exist, add a new one
    await addDoc(weeklyInfoCollectionRef, {
      league_id: REACT_APP_LEAGUE_ID,
      preview: articles,
    });
  }
};

function countWords(inputString) {
  // Use regular expression to split the string by spaces and punctuation
  const words = inputString.split(/\s+|\b/);

  // Filter out empty strings and punctuation
  const filteredWords = words.filter((word) => word.trim() !== "");

  // Return the count of words
  return filteredWords.length;
}

export default async function handler(req, res) {
  //console.log("here");
  // console.log("what was passed in ", req.body);
  const REACT_APP_LEAGUE_ID = req.body;
  const readingRef = ref(storage, `files/${REACT_APP_LEAGUE_ID}_preview.txt`);
  const url = await getDownloadURL(readingRef);

  const response = await fetch(url);
  const fileContent = await response.text();
  const newFile = JSON.stringify(fileContent).replace(/\//g, "");

  const wordCount = countWords(newFile);
  //console.log(`Word count: ${wordCount}`);

  try {
    console.log("Here");
    //console.info(process.env.OPENAI_API_KEY);
    const model = new ChatOpenAI({
      temperature: 0.9,
      model: "gpt-4-turbo",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    let question;

    if (wordCount > 2600) {
      //console.log("if");
      question = `{leagueData} Give me an article previewing each matchup in this fantasy football league and your predictions for how it'll turn out. Make each matchup breakdown creative, funny and exciting while also keeping it concise. The format of the JSON response should strictly adhere to RFC8259 compliance, without any deviations or errors. The JSON generated should be 1 Object and it's structure should match this template:
  "title": "",
  "paragraph1": "",
  "paragraph2": "",
  USE however many MORE paragraphs necessary to complete the response. Make sure ALL THE matchups IN THE league ARE LISTED. no more than 1 sentence per matchup`;
    } else {
      question = `{leagueData} Your name is Boogie the writer and you've been getting a lot of heat for your predictions last week. Give me an article previewing each matchup in this fantasy football league, include their star players based off their projected points, and your predictions for how it'll turn out, double down on how certain you are this time and that league members should trust your years of experience/research. Make each matchup breakdown creative, funny and exciting. The JSON generated should strictly adhere to RFC8259 compliance, without any deviations or errors. The JSON structure should match this template:
  "title": "",
  "paragraph1": "",
  "paragraph2": "",
  USE however many MORE paragraphs necessary to complete the response. Make sure ALL THE matchups IN THE league ARE LISTED. Please ensure that the generated JSON only contains 1 title attribute and meets the specified criteria in one array without any syntax issues or inconsistencies.`;
    }

    const prompt = PromptTemplate.fromTemplate(question);
    const chainA = new LLMChain({ llm: model, prompt });
    console.log("Prompt complete");
    const apiResponse = await chainA.call({ leagueData: newFile });
    console.log("Response complete");
    console.log(apiResponse.text);

    res.setHeader("Content-Type", "application/json");
    res.write("[");

    // Stream the response
    const responseData = JSON.parse(apiResponse.text);
    for (let i = 0; i < responseData.length; i++) {
      if (i > 0) {
        res.write(",");
      }
      res.write(JSON.stringify(responseData[i]));
    }

    res.write("]");

    // End the response
    res.end();

    // Save data to the database
    await updateWeeklyInfo(REACT_APP_LEAGUE_ID, apiResponse.text);
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
      //console.log("No documents found in 'Article Info' collection");
      return res.status(404).json({ error: "No documents found" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "An error occurred" });
  }
}
