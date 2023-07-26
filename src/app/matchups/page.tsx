"use client";

import React from "react";
import { Dropdown } from "@nextui-org/react";

const matchups = () => {
  const [selected, setSelected] = React.useState(new Set(["text"]));
  const [selected2, setSelected2] = React.useState(new Set(["text"]));

  const selectedValue = React.useMemo(
    () => Array.from(selected).join(", ").replaceAll("_", " "),
    [selected]
  );
  const selectedValue2 = React.useMemo(
    () => Array.from(selected2).join(", ").replaceAll("_", " "),
    [selected2]
  );

  if (selected.keys().next().value) {
    selected2.keys().next().value;
  }

  const players = ["Kabo", "FG", "Zekeee", "Jefe"];

  // Define callback functions to handle selection changes
  const handleSelectionChange = (selection: any) => {
    setSelected(selection);
  };

  const handleSelectionChange2 = (selection2: any) => {
    setSelected2(selection2);
  };

  const dropdownItems1: any = players
    .map((player) => {
      if (selected2.keys().next().value !== player) {
        return (
          <Dropdown.Item css={{ color: "white" }} key={player}>
            {player}
          </Dropdown.Item>
        );
      }
      return undefined;
    })
    .filter((item) => item !== undefined);

  const dropdownItems2: any = players
    .map((player) => {
      if (selected.keys().next().value !== player) {
        return (
          <Dropdown.Item css={{ color: "#af1222" }} key={player}>
            {player}
          </Dropdown.Item>
        );
      }
      return undefined;
    })
    .filter((item) => item !== undefined);

  // ... your other code ...

  return (
    <div className="flex justify-around h-screen border-2 border-[#af1222]">
      <div className="mt-5">
        Select User:
        <Dropdown>
          <Dropdown.Button flat css={{ tt: "capitalize", color: "#af1222" }}>
            {selectedValue}
          </Dropdown.Button>
          <Dropdown.Menu
            aria-label="Single selection actions"
            css={{
              backgroundColor: "#af1222",
              border: "solid",
              borderColor: "black",
              color: "black",
            }}
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={selected}
            onSelectionChange={handleSelectionChange}
          >
            {dropdownItems1}
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <div className="mt-5">
        Select User:
        <Dropdown>
          <Dropdown.Button flat css={{ tt: "capitalize", color: "#af1222" }}>
            {selectedValue2}
          </Dropdown.Button>
          <Dropdown.Menu
            aria-label="Single selection actions"
            css={{
              backgroundColor: "black",
              border: "solid",
              borderColor: "#af1222",
              color: "white",
            }}
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={selected2}
            onSelectionChange={handleSelectionChange2}
          >
            {dropdownItems2}
          </Dropdown.Menu>
        </Dropdown>
      </div>
      {/* Modal */}
    </div>
  );
};

export default matchups;
