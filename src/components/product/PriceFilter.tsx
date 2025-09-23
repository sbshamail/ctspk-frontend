import { Input } from "../ui/input";

const PriceFilter = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <Input
        name="lowPrice"
        defaultValue="0"
        maxLength={7}
        className="w-20 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <span>-</span>
      <Input
        name="highPrice"
        defaultValue="1000"
        maxLength={7}
        className="w-20 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
};

export default PriceFilter;
