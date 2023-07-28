"use client";
import React from "react";

import { useState } from "react";
import { Modal, useModal, Button, Text, Input } from "@nextui-org/react";
import { FaSearch } from "react-icons/fa";

export default function Home() {
  const [input, setInput] = useState("");
  const { setVisible, bindings } = useModal();
  return (
    <div
      className={`text-3xl text-white  flex flex-col justify-start items-center gap-10 border-2 border-[#af1222] h-[60vh] bg-[url('./images/youtube-video-gif.gif')] bg-[length:470px_800px] md:bg-[url('./images/youtube-video-gif.gif')] bg-no-repeat md:bg-cover`}
    >
      <div className="mt-3">Welcome to {"League Name"}</div>
      <div className="grid-cols-1 justify-center text-center lg:flex ">
        <Input
          onChange={(e) => {
            setInput(e.target.value);
          }}
          size="lg"
          width="60vw"
          type="text"
          labelPlaceholder="Search owners, matchups, or stats"
          css={{
            color: "white",
            fontSize: "40px",
            "@smMax": {
              width: "90vw",
            },
          }}
          className="p-1 rounded-lg  focus:rounded-lg border-rounded focus:ring focus:ring-[#af1222] focus:border-[#af1222] w-[70vw] md:w-[50vw] bg-[#050505] text-[11px] md:text-[16px]"
        />
        <div className="w-screen flex justify-center mt-3  md:mt-0 items-center md:ml-2  md:block md:w-[0vw]">
          <Button
            onPress={() => {
              console.log(input);
              setVisible(true);
            }}
            css={{
              backgroundImage:
                "linear-gradient(black, black, #af1222, #af1222)",
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
        <div className="">
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
                {input}
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
      </div>
    </div>
  );
}
