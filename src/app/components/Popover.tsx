import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Input,
} from "@nextui-org/react";
import Link from "next/link";

export default function App() {
  const backdrops = ["opaque", "blur", "transparent"];

  const content = (
    <PopoverContent className="w-[95vw] xl:w-[60vw] text-[13px] md:text-[15px]">
      {(titleProps) => (
        <div className="px-1 py-2 w-full">
          <div>
            <p
              className="text-small font-bold text-foreground w-full"
              {...titleProps}
            >
              First of all, what is Fantasy Football?
            </p>
            <div className="mt-2 flex flex-col gap-2 w-full">
              <p className="w-full">
                Fantasy football is like owning your own NFL team, where you
                draft real players to earn points based on their real-world
                performance. It's a strategic and fun way to engage with the NFL
                season.
              </p>
            </div>
          </div>
          <div className="mt-5">
            <p
              className="text-small font-bold text-foreground w-full"
              {...titleProps}
            >
              Now for the fun stuff! What does Fantasy Pulse offer?
            </p>
            <div className="mt-2 flex flex-col gap-2 w-full">
              <p className="w-full">
                <div>
                  - Tailored Content: Fantasy Pulse provides personalized
                  content, including articles, polls, and insights tailored to
                  your fantasy leagues.
                </div>

                <div>
                  - AI-Driven: Our app leverages innovative AI technology to
                  personalize your fantasy football experience. It ensures
                  you're always up to date with relevant information.
                </div>
              </p>
            </div>
          </div>
          <div className="mt-5">
            <p
              className="text-small font-bold text-foreground w-full"
              {...titleProps}
            >
              How Do I Get Started?
            </p>
            <div className="mt-2 flex flex-col gap-2 w-full">
              <p className="w-full">
                <div>
                  <p>
                    - Download the{" "}
                    <Link
                      className="underline text-[#af1222]"
                      target={"_blank"}
                      href={"https://www.sleeper.com"}
                    >
                      Sleeper
                    </Link>{" "}
                    app on your mobile device or visit the website.
                  </p>
                  <p>
                    - Create an account if you're new or log in if you already
                    have one. Make a league or join one with friends. Draft your
                    players and set your lineups!
                  </p>
                  <p>
                    - Finally, come back to Fantasy Pulse, login with your
                    Sleeper username, and enjoy your personalized and tailoired
                    content!
                  </p>
                </div>
              </p>
            </div>
          </div>
        </div>
      )}
    </PopoverContent>
  );

  return (
    <div className="flex flex-wrap gap-4">
      <Popover showArrow offset={10} placement="bottom" backdrop={"blur"}>
        <PopoverTrigger>
          <Button
            color="warning"
            variant="flat"
            className="capitalize text-[#af1222] border-2 border-[#af1222] p-1  rounded hover:bg-[#d4d0d0] dark:hover:bg-[#1a1a1a] cursor-pointer mr-2 text-[14px]"
          >
            {"What is Fantasy Pulse?"}
          </Button>
        </PopoverTrigger>
        {content}
      </Popover>
    </div>
  );
}
