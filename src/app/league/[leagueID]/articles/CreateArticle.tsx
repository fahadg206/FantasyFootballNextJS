// import * as dotenv from "dotenv";
// //import { TextLoader } from "langchain/document_loaders/fs/text";
// import { JSONLoader } from "langchain/document_loaders";
// import { HNSWLib } from "langchain/vectorstores/hnswlib";
// import { OpenAIEmbeddings } from "langchain/embeddings/openai";
// import { ChatOpenAI } from "langchain/chat_models/openai";
// import { RetrievalQAChain } from "langchain/chains";

// export default function CreateArticle() {
//     export async functionfetchData() => {
//     dotenv.config();

//     const leagueDataLoader = new JSONLoader(
//       "../../../../articles/leagueDataPrompt.txt"
//     );
//     const leagueDoc = await leagueDataLoader.load();

//     const article1Loader = new JSONLoader("../../../../articles/article1.txt");
//     const article1Doc = await article1Loader.load();

//     // ... load other articles ...

//     const vectorStore = await HNSWLib.fromDocuments(
//       leagueDoc,
//       new OpenAIEmbeddings()
//     );

//     await vectorStore.addDocuments(article1Doc);
//     // ... add other articles ...

//     await vectorStore.save("leagueData");

//     const model = new ChatOpenAI({
//       temperature: 0.9,
//     });

//     const question = "Who did YSL play against according to league Data";

//     const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

//     const res = await chain.call({ query: question });

//     console.log(res);
//   };

//   fetchData();
// }
