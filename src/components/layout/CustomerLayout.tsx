import { ChildrenType } from "@/utils/reactTypes";
import Footer from "./Footer";
import Header from "./Header";
type Props = {
  children: ChildrenType;
};
const CustomerLayout = ({ children }: Props) => {
  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default CustomerLayout;
