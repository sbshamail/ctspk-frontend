"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";
import StarRating from "../starRating";
import { Checkbox } from "../ui/checkbox";

const ratings = [3, 4, 5];

const RatingFilter = () => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const handleCheckboxChange = (rating: number) => {
    // Update the selected rating
    if (rating === selectedRating) {
      setSelectedRating(null);
    } else {
      setSelectedRating(rating);
    }
  };

  return (
    <div>
      {ratings.map((rating) => (
        <div key={rating} className="flex justify-between items-center mb-2">
          <div className="flex space-x-4 items-center">
            <span>
              <Checkbox
                checked={selectedRating === rating}
                onChange={() => handleCheckboxChange(rating)}
                className="p-[6px]"
              />
            </span>
            <span>
              <StarRating rating={rating} disabled />
            </span>
          </div>
          <ChevronRight />
        </div>
      ))}
    </div>
  );
};

export default RatingFilter;
