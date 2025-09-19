import CustomerLayout from "@/app/(customer)/components_customer/layout/CustomerLayout";
import { ChildrenType } from "@/utils/reactTypes";
type Props = {
  children: ChildrenType;
};
const layout = ({ children }: Props) => {
  return <CustomerLayout>{children}</CustomerLayout>;
};

export default layout;
