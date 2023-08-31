"use client";
import React, { useEffect, useState } from "react";

import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";

export default function OpenAiTest() {
  const [text, setText] = useState({});
  const fetchAI = async () => {
    const template =
      "What would be a good company name for a company that makes {product}?";
    const promptTemplate = new PromptTemplate({
      template: template,
      inputVariables: ["product"],
    });

    const model = new OpenAI({
      temperature: 0.9,
      openAIApiKey: "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",
    });

    const chain = new LLMChain({
      llm: model,
      prompt: promptTemplate,
    });

    const response = await chain.call({
      product: "colorful socks",
    });
    console.log(response);
    setText(response);
  };

  if (text) {
    console.log(text);
  }

  useEffect(() => {
    fetchAI();
  }, [text]);

  return <div>{"o"}</div>;
}
