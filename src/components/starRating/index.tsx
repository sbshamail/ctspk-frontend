"use client";
import {
  StarEmpty,
  StarFull,
  StarHalf,
  StarQuarter,
  StarThreeQuarter,
} from "@/components/icons/StarIcons";
import { useState } from "react";

const getStarIcon = (rating: number, index: number) => {
  const full = index;
  const threeQuarter = index - 0.25;
  const half = index - 0.5;
  const quarter = index - 0.75;

  if (rating >= full) return StarFull;
  if (rating >= threeQuarter) return StarThreeQuarter;
  if (rating >= half) return StarHalf;
  if (rating >= quarter) return StarQuarter;
  return StarEmpty;
};

type StarRatingProps = {
  totalStars?: number;
  onRatingChange?: (rating: number) => void;
  rating?: number;
  averageRating?: number;
  disabled?: boolean;
};

const StarRating: React.FC<StarRatingProps> = ({
  totalStars = 5,
  onRatingChange,
  rating = 0,
  averageRating = 0,
  disabled = false,
}) => {
  const [hoverRating, setHoverRating] = useState(rating);
  const [currentRating, setCurrentRating] = useState(rating);

  const handleMouseEnter = (index: number) => {
    if (!disabled) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoverRating(0);
    }
  };

  const handleClick = (index: number) => {
    if (!disabled) {
      setCurrentRating(index);
      if (onRatingChange) {
        onRatingChange(index);
      }
    }
  };

  const renderStars = (rating: number, totalStars = 5) =>
    Array.from({ length: totalStars }, (_, i) => {
      const Icon = getStarIcon(rating, i + 1);
      return <Icon key={i} className="w-5 h-5 text-yellow-500" />;
    });

  return (
    <div>
      {averageRating ? (
        <div className="flex">{renderStars(averageRating)}</div>
      ) : (
        <div className="flex">{renderStars(hoverRating || currentRating)}</div>
      )}
    </div>
  );
};

export default StarRating;

{
  /* <StarRating
totalStars={5}
rating={3}
averageRating={2.8}
onRatingChange={handleRating}
/> */
}
// backend calculate rating
// const calculateAverageRating = (ratings: number[]): number => {
//     if (ratings.length === 0) return 0;
//     const total = ratings.reduce((acc, rating) => acc + rating, 0);
//     return total / ratings.length;
//   };

//  {/* regular */}
//  <Iconify icon="fluent:star-28-regular" />
//  {/* half star */}
//  <Iconify icon="fluent:star-half-28-regular" />
//  {/* filled star */}
//  <Iconify icon="fluent:star-28-filled" />
//  {/* 3quarter-star */}
//  <Iconify icon="fluent:star-three-quarter-28-regular" />
//  {/* one quarter star */}
//  <Iconify icon="fluent:star-one-quarter-28-regular" />
