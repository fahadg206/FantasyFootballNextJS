"use client";

import React, { useState } from "react";
import { Dropdown, Modal, useModal, Button, Text } from "@nextui-org/react";
import { FaSearch } from "react-icons/fa";

const matchups = () => {
  const [selected, setSelected] = React.useState(new Set(["text"]));
  const [selected2, setSelected2] = React.useState(new Set(["text"]));
  const [input, setInput] = useState("");
  const { setVisible, bindings } = useModal();

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
          <Dropdown.Item css={{ color: "#af1222" }} key={player}>
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
    <div className="flex justify-center gap-10 h-screen border-2 border-[#af1222]">
      <div className="mt-5">
        Select User:
        <Dropdown>
          <Dropdown.Button flat css={{ tt: "capitalize", color: "#af1222" }}>
            {selectedValue}
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
      <div className="mt-10">
        <Button
          onPress={() => {
            console.log(input);
            setVisible(true);
          }}
          css={{
            backgroundImage: "linear-gradient(black, black, #af1222, #af1222)",
            color: "#ffffff",
            borderStyle: "solid",
            borderColor: "#af1222",
            // Set the text color to white or any desired color
            // Add other styles as needed
          }}
          // bg-gradient-to-b border border-[#af1222] from-black to-[#af1222] p-1 rounded
          auto
        >
          <FaSearch />
        </Button>
      </div>
      {/* Modal */}
      <div>
        {" "}
        {!selected.has("text") && !selected2.has("text") ? (
          <div>
            <Modal
              scroll
              width="600px"
              aria-labelledby="modal-title"
              aria-describedby="modal-description"
              {...bindings}
              css={{
                backgroundColor: "#202123",
                color: "white",
                "@smMax": {
                  backgroundColor: "#050505",
                  width: "90vw",
                  display: "flex",
                  justifyContent: "center",
                  textAlign: "center",
                  marginLeft: "20px",
                },
              }}
            >
              <Modal.Header>
                <Text id="modal-title" size={18} css={{ color: "#E9EBEA" }}>
                  Modal with a lot of content
                </Text>
              </Modal.Header>
              <Modal.Body css={{ color: "#190103" }}>
                <Text id="modal-description" css={{ color: "#E9EBEA" }}>
                  {selectedValue} {selectedValue2}
                </Text>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  auto
                  flat
                  color="default"
                  onPress={() => setVisible(false)}
                  css={{ color: "white", backgroundColor: "#af1222" }}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default matchups;
