import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const StarRating = ({ score }) => {
  const stars = [];
  const ratingOutOfFive = score * 5;

  for (let i = 1; i <= 5; i++) {
    if (ratingOutOfFive >= i) {
      stars.push(<FaStar key={i} className="text-yellow-400 text-2xl inline-block" />);
    } else if (ratingOutOfFive >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} className="text-yellow-400 text-2xl inline-block" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-yellow-400 text-2xl inline-block" />);
    }
  }

  return <div className="flex justify-center mt-4">{stars}</div>;
};
export default StarRating;