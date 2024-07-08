// components/StarRating.js
import { FaStar } from "react-icons/fa";

const Star = ({ fraction }) => {
  const clipPaths = {
    0.25: "polygon(0 0, 25% 0, 25% 100%, 0 100%)",
    0.5: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
    0.75: "polygon(0 0, 75% 0, 75% 100%, 0 100%)",
    1: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
  };

  return (
    <div className="relative inline-block text-gray-300">
      <FaStar className="absolute" />
      <FaStar
        className="absolute text-yellow-500"
        style={{ clipPath: clipPaths[fraction] }}
      />
    </div>
  );
};

const StarRating = ({ value }) => {
  const fullStars = Math.floor(value / 2000);
  const remainder = value % 2000;
  let fraction = 0;

  if (remainder >= 1500) {
    fraction = 0.75;
  } else if (remainder >= 1000) {
    fraction = 0.5;
  } else if (remainder >= 500) {
    fraction = 0.25;
  } else if (remainder > 0) {
    fraction = 0.25;
  }

  const stars = [];
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={i} fraction={1} />);
  }
  if (fraction > 0) {
    stars.push(<Star key={fullStars} fraction={fraction} />);
  }

  return <div className="flex space-x-1">{stars}</div>;
};

export default StarRating;
