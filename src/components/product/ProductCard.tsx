import { titleSubstring } from "@/utils/helper";
import Image from "next/image";
import Link from "next/link";
import StarRating from "../starRating";
import { ProductTag } from "../tag/ProductTag";
import { PriceAndSalePrice } from "../typography/PriceAndSalePrice";
import { Card } from "../ui/card";
import { ProductCartButton } from "./ProductCartButton";
import { ProductFavorite } from "./ProductFavorite";
import ProductImage from "./ProductImage";

interface Props {
  name: string;
  link?: string;
  image: string;
  rating?: number;
  price: number;
  salePrice?: number;
  showPercentage?: boolean;
  Tags?: () => React.ReactNode;
  CartButton?: () => React.ReactNode;
}

const ProductCard = ({
  name,
  price,
  link = "#",
  image,
  rating,
  salePrice,
  showPercentage,
  Tags,
  CartButton,
  ...props
}: Props) => {
  return (
    <div>
      <Link href={link} className="z-0">
        <Card className=" cursor-pointer p-0">
          <div>
            <div className="relative transition duration-300">
              <ProductImage image={image} alt={name} />
              {/* Tags */}

              <div className="absolute  left-0 top-0 mt-3">
                {Tags ? Tags() : <ProductTag title={"Sale"} />}
              </div>

              <div className="absolute right-0 top-0 m-2 z-10 ">
                <div className="flex space-x-1 ">
                  {/* <ProductViewButton />
                  <SimilarProductButton /> */}
                  <ProductFavorite />
                </div>
              </div>
            </div>
            <div className="p-2">
              <h2 className="m-0 p-0 text-sm font-medium line-clamp-1 h-5 ">
                {titleSubstring(name)}
              </h2>
              <div className="w-full flex items-center justify-between ">
                <div className="w-full flex flex-col mt-2 space-y-2">
                  <div>
                    <StarRating averageRating={rating} disabled />
                  </div>
                  <div className="w-full flex justify-between">
                    <PriceAndSalePrice
                      price={price}
                      salePrice={salePrice}
                      showPercentage={showPercentage}
                    />
                  </div>
                </div>
                <div className="z-10">
                  {CartButton ? CartButton() : <ProductCartButton />}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
};

export default ProductCard;
