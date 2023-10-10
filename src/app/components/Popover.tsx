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
    <PopoverContent className="w-[95vw] xl:w-[60vw]  overflow-y-scroll">
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
                Fantasy football is like owning your NFL team, where you draft
                real players to earn points based on their real-world
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
              Now for the fun stuff! How does Fantasy Pulse work?
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
                    - Sign Up or Log In: Create an account if you're new or log
                    in if you already have one.
                  </p>

                  <p>
                    - Start a League: Click on "Start a League" and follow the
                    easy setup process. You can choose the league type, set up
                    your draft, and invite your friends to join.
                  </p>

                  <p>
                    - Draft Your Team: In your league, you and your friends will
                    take turns drafting NFL players to your teams. The draft is
                    one of the most exciting parts of fantasy football, so make
                    sure to have fun!
                  </p>

                  <p>
                    - Set Your Lineup: Each week, you'll need to select your
                    starting lineup from your roster of players. Make strategic
                    choices to maximize your team's points.
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
