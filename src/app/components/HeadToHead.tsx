import React from "react";

interface HeadToHeadProps {
  winsOne: number;
  winsTwo: number;
  pointsOne: number;
  pointsTwo: number;
}

const HeadToHead: React.FC<HeadToHeadProps> = ({
  winsOne,
  winsTwo,
  pointsOne,
  pointsTwo,
}) => {
  const totalWins = winsOne + winsTwo;
  const totalPoints = pointsOne + pointsTwo;

  const winsPercentageOne = (winsOne / totalWins) * 100;
  const winsPercentageTwo = (winsTwo / totalWins) * 100;

  const pointsPercentageOne = (pointsOne / totalPoints) * 100;
  const pointsPercentageTwo = (pointsTwo / totalPoints) * 100;

  return (
    <div className="w-full my-5">
      <h3 className="text-center font-bold text-lg">Head to Head</h3>
      <div className="my-2">
        <p className="text-center font-medium">Wins</p>
        <div className="flex justify-between">
          <p>{winsOne} wins</p>
          <p>{winsTwo} wins</p>
        </div>
        <div className="relative w-full h-5 bg-gray-300 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-[#e45263]"
            style={{ width: `${winsPercentageOne}%` }}
          />
          <div
            className="absolute right-0 top-0 h-full bg-[#af1222]"
            style={{ width: `${winsPercentageTwo}%` }}
          />
        </div>
      </div>
      <div className="my-2">
        <p className="text-center font-medium">Points</p>
        <div className="flex justify-between">
          <p>{pointsOne.toFixed(2)} pts</p>
          <p>{pointsTwo.toFixed(2)} pts</p>
        </div>
        <div className="relative w-full h-5 bg-gray-300 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-[#e45263]"
            style={{ width: `${pointsPercentageOne}%` }}
          />
          <div
            className="absolute right-0 top-0 h-full bg-[#af1222]"
            style={{ width: `${pointsPercentageTwo}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default HeadToHead;
