import ProductCard from "@/components/product/ProductCard";
const page = () => {
  return (
    <div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        <ProductCard
          title="Nike Air Max 270"
          link="/products/nike-air-max-270"
          image="https://images.unsplash.com/photo-1562613521-6b5293e5b0ea?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          rating={4.3}
          price={180}
          salePrice={150}
          showPercentage
        />

        <ProductCard
          title="Adidas Ultraboost 22"
          link="/products/adidas-ultraboost-22"
          image="https://images.unsplash.com/photo-1562613521-6b5293e5b0ea?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          rating={3.8}
          price={200}
        />

        <ProductCard
          title="Puma Running Shoes"
          image="https://images.unsplash.com/photo-1562613521-6b5293e5b0ea?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          rating={4.8}
          price={120}
          salePrice={99}
          showPercentage
        />
      </div>
    </div>
  );
};

export default page;
