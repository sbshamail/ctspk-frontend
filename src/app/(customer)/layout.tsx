import CustomerLayout from "@/components/layout/CustomerLayout";
import { ChildrenType } from "@/utils/reactTypes";
type Props = {
  children: ChildrenType;
};
const layout = ({ children }: Props) => {
  return <CustomerLayout>{children}</CustomerLayout>;
};

export default layout;
