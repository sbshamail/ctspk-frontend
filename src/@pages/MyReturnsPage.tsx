"use client";

import { Screen } from "@/@core/layout";
import Table from "@/components/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ColumnType } from "@/components/table/MainTable";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { currencyFormatter } from "@/utils/helper";
import Link from "next/link";

// Helper function to get access token from cookies
const getAccessToken = () => {
  if (typeof document === "undefined") return "";

  const cookies = document.cookie.split(";");
  const accessTokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("access_token=")
  );

  if (accessTokenCookie) {
    return accessTokenCookie.split("=")[1]?.trim() || "";
  }

  return "";
};

// Helper function to get API URL
const getApiUrl = (endpoint: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const formattedBaseUrl = baseUrl.replace(/\/$/, "");
  const formattedEndpoint = endpoint.replace(/^\//, "");
  return `${formattedBaseUrl}/${formattedEndpoint}`;
};

interface ReturnItem {
  id: number;
  order_id: number;
  user_id: number;
  return_type: string;
  reason: string;
  status: string;
  refund_amount: string;
  refund_status: string;
  wallet_credit_id: number | null;
  transfer_eligible_at: string | null;
  transferred_at: string | null;
  admin_notes: string | null;
  rejected_reason: string | null;
  created_at: string;
  updated_at: string | null;
  items: any[];
}

interface ReturnsResponse {
  success: number;
  detail: string;
  data: ReturnItem[];
  total: number;
}

export default function MyReturnsPage() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        setIsLoading(true);
        const accessToken = getAccessToken();
        if (!accessToken) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(getApiUrl("returns/my-returns"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data: ReturnsResponse = await response.json();
          if (data.success === 1) {
            setReturns(data.data);
            setTotal(data.total);
          }
        }
      } catch (error) {
        console.error("Error fetching returns:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReturns();
  }, [page, limit]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      case "completed":
        return "default";
      default:
        return "outline";
    }
  };

  const columns: ColumnType<ReturnItem>[] = [
    {
      title: "No.",
      render: ({ index }) => {
        const serial = (page - 1) * limit + (index + 1);
        return <span className="font-medium">{serial}</span>;
      },
      className: "w-[60px] text-center",
    },
    {
      title: "Order ID",
      accessor: "order_id",
      render: ({ cell, row }) => {
        const year = new Date(row.created_at).getFullYear();
        const lastTwoDigits = String(year).slice(-2);
        const paddedOrderId = String(cell).padStart(8, "0");
        const formattedId = `GT${lastTwoDigits}${paddedOrderId}`;
        return (
          <Link
            href={`/order/${cell}`}
            className="text-primary hover:underline font-medium"
          >
            {formattedId}
          </Link>
        );
      },
    },
    {
      title: "Return Type",
      accessor: "return_type",
      render: ({ cell }) => (
        <span className="capitalize">{cell?.replace(/_/g, " ") || "-"}</span>
      ),
    },
    {
      title: "Reason",
      accessor: "reason",
      render: ({ cell }) => (
        <span className="text-sm max-w-[200px] truncate block" title={cell}>
          {cell || "-"}
        </span>
      ),
    },
    {
      title: "Refund Amount",
      accessor: "refund_amount",
      render: ({ cell }) => (
        <span className="font-medium">{currencyFormatter(parseFloat(cell))}</span>
      ),
    },
    {
      title: "Status",
      accessor: "status",
      render: ({ cell }) => (
        <Badge
          variant={getStatusBadgeVariant(cell)}
          className="capitalize text-xs font-medium px-2 py-0.5"
        >
          {cell || "Unknown"}
        </Badge>
      ),
    },
    {
      title: "Refund Status",
      accessor: "refund_status",
      render: ({ cell }) => (
        <Badge
          variant={getStatusBadgeVariant(cell)}
          className="capitalize text-xs font-medium px-2 py-0.5"
        >
          {cell || "Unknown"}
        </Badge>
      ),
    },
    {
      title: "Date",
      accessor: "created_at",
      render: ({ cell }) =>
        new Date(cell).toLocaleDateString("en-PK", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
  ];

  // Sort returns by date (newest first)
  const sortedReturns = [...returns].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Screen className="py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Return & Refund</h1>
      </div>

      {isLoading ? (
        <ReturnTableSkeleton />
      ) : returns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            You have no return requests yet.
          </p>
        </div>
      ) : (
        <Table<ReturnItem>
          data={sortedReturns}
          columns={columns}
          isLoading={false}
          striped={true}
          dataLimit={limit}
          setDataLimit={setLimit}
          total={total}
          currentPage={page}
          setCurrentPage={setPage}
          showPagination={true}
        />
      )}
    </Screen>
  );
}

function ReturnTableSkeleton() {
  return (
    <div className="space-y-4">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
    </div>
  );
}
