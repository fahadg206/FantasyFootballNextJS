"use client";
import React, { useEffect, useState } from "react";
import { CircularProgress } from "@nextui-org/react";
import logo from "../images/Transparent.png";
import Image from "next/image";
import { IoIosCheckmarkCircle } from "react-icons/io";

export default function App() {
  const [value, setValue] = useState(() => {
    // Initialize 'value' with the stored value from localStorage, or 0 if not found.
    const storedValue = localStorage.getItem("progressValue");
    return storedValue ? parseFloat(storedValue) : 0;
  });
  const [articlesReady, setArticlesReady] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      // Increment the value
      setValue((v) => (v >= 100 ? 100 : v + 0.64));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Store the current value in localStorage whenever 'value' changes
    localStorage.setItem("progressValue", String(value));

    // When the value reaches 100, update 'articlesReady'
    if (value === 100) {
      setArticlesReady("Articles are ready! It is now safe to refresh!");
    }
  }, [value]);

  console.log(articlesReady);

  return (
    <div className="flex flex-col items-center justify-center gap-y-4">
      <CircularProgress
        className={value === 100 ? `text-[green]` : `text-[#af1222]`}
        aria-label="Loading..."
        size="lg"
        value={value}
        showValueLabel={true}
      />
      <div className="text-[14px]">
        {value === 100 ? (
          <div className="flex items-center justify-center">
            {articlesReady}
            <IoIosCheckmarkCircle
              className={value === 100 ? `ml-1 text-[green] block` : `hidden`}
              size={25}
            />
          </div>
        ) : (
          <Image
            className="animate-pulse"
            src={logo}
            width={150}
            height={150}
            alt="logo"
          />
        )}
      </div>
    </div>
  );
}
