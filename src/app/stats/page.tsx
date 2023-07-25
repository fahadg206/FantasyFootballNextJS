"use client";
import React from "react";

import { useState } from "react";
import { Modal, useModal, Button, Text } from "@nextui-org/react";
import { FaSearch } from "react-icons/fa";

export default function Home() {
  const [input, setInput] = useState("");
  const { setVisible, bindings } = useModal();
  return (
    <div
      className={`text-3xl text-white  flex flex-col justify-start items-center gap-10 border-2 border-[#af1222] h-[60vh] bg-[url('./images/youtube-video-gif.gif')] bg-no-repeat bg-cover`}
    >
      <div className="mt-3">Welcome to {"League Name"}</div>
      <div className="grid-cols-1 justify-center text-center md:flex ">
        <input
          onChange={(e) => {
            setInput(e.target.value);
          }}
          type="text"
          placeholder="Search owners, matchups, or stats"
          className="p-1 rounded-lg border border-[#af1222] focus:rounded-lg border-rounded focus:ring focus:ring-[#af1222] focus:border-[#af1222] w-[70vw] md:w-[50vw]  bg-[#050505] text-[11px] md:text-[16px]"
        />
        <div className="w-screen flex justify-center mt-3 md:block md:w-[0vw]">
          <Button
            onPress={() => {
              console.log(input);
              setVisible(true);
            }}
            color="gradient"
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
                backgroundColor: "green",
                width: "70vw",
                display: "flex",
                justifyContent: "center",
                textAlign: "center",
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
              <Button auto flat color="error" onPress={() => setVisible(false)}>
                Close
              </Button>
              <Button auto onPress={() => setVisible(false)}>
                Agree
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}
