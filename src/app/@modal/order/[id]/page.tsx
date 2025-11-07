"use client";

import OrderDetailPage from "@/@pages/OrderDetailPage";
import { ShadDialog } from "@/components/dialog/ShadDialog";
import { useParams, useRouter } from "next/navigation";

export default function OrderModalPage() {
  const router = useRouter();
  const { id } = useParams();

  return (
    <ShadDialog
      open={true} // always open when route is active
      onOpenChange={(open) => {
        if (!open) router.back(); // close modal -> go back
      }}
      title={`Order Details`}
      className="max-w-6xl"
    >
      {/* You can reuse your order detail component directly */}
      <OrderDetailPage id={id as string} />
    </ShadDialog>
  );
}
