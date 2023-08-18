"use client";
import React, { createContext, useContext, useState } from "react";

const SelectedManagerContext = createContext();

export function SelectedManagerProvider({ children }) {
  const [selectedManagerr, setSelectedManagerr] = useState("");

  return (
    <SelectedManagerContext.Provider
      value={{ selectedManagerr, setSelectedManagerr }}
    >
      {children}
    </SelectedManagerContext.Provider>
  );
}

export function useSelectedManager() {
  return useContext(SelectedManagerContext);
}
