"use client";

import { Input } from "../ui/input";

interface PriceFilterProps {
  lowPrice: number;
  highPrice: number;
  setLowPrice: (val: number) => void;
  setHighPrice: (val: number) => void;
}

const PriceFilter = ({
  lowPrice,
  highPrice,
  setLowPrice,
  setHighPrice,
}: PriceFilterProps) => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <Input
        type="number"
        name="lowPrice"
        value={lowPrice}
        onChange={(e) => setLowPrice(Number(e.target.value))}
        className="w-20 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <span>-</span>
      <Input
        type="number"
        name="highPrice"
        value={highPrice}
        onChange={(e) => setHighPrice(Number(e.target.value))}
        className="w-20 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
};

export default PriceFilter;
