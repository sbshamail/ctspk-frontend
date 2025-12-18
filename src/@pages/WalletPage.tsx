"use client";

import { Screen } from "@/@core/layout";
import Table from "@/components/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ColumnType } from "@/components/table/MainTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { currencyFormatter } from "@/utils/helper";
import { Wallet, ArrowUpRight, ArrowDownLeft, Banknote, X } from "lucide-react";

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

interface WalletTransaction {
  id: number;
  user_id: number;
  amount: string;
  transaction_type: string;
  balance_after: string;
  description: string;
  is_refund: boolean;
  transfer_eligible_at: string | null;
  transferred_to_bank: boolean;
  transferred_at: string | null;
  return_request_id: number | null;
  created_at: string;
  updated_at: string | null;
}

interface TransactionsResponse {
  success: number;
  detail: string;
  data: WalletTransaction[];
  total: number;
}

interface BalanceResponse {
  success: number;
  detail: string;
  data: {
    id: number;
    user_id: number;
    balance: number;
    total_credited: number;
    total_debited: number;
    created_at: string;
    updated_at: string | null;
  };
}

interface EligibleTransferResponse {
  success: number;
  detail: string;
  data: {
    eligible_amount: number;
    transaction_count: number;
  };
}

export default function WalletPage() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [totalCredited, setTotalCredited] = useState<number>(0);
  const [totalDebited, setTotalDebited] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Transfer dialog states
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [eligibleAmount, setEligibleAmount] = useState<number>(0);
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setIsLoading(true);
        const accessToken = getAccessToken();
        if (!accessToken) {
          setIsLoading(false);
          return;
        }

        // Fetch balance and transactions in parallel
        const [balanceRes, transactionsRes] = await Promise.all([
          fetch(getApiUrl("wallet/balance"), {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }),
          fetch(
            getApiUrl(
              `wallet/transactions?page=${page}&skip=${(page - 1) * limit}&limit=${limit}`
            ),
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          ),
        ]);

        if (balanceRes.ok) {
          const balanceData: BalanceResponse = await balanceRes.json();
          if (balanceData.success === 1 && balanceData.data) {
            setBalance(balanceData.data.balance);
            setTotalCredited(balanceData.data.total_credited);
            setTotalDebited(balanceData.data.total_debited);
          }
        }

        if (transactionsRes.ok) {
          const transactionsData: TransactionsResponse =
            await transactionsRes.json();
          if (transactionsData.success === 1) {
            setTransactions(transactionsData.data || []);
            setTotal(transactionsData.total || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching wallet data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletData();
  }, [page, limit]);

  // Check if transfer is eligible (transfer_eligible_at date is less than current date)
  const isTransferEligible = (transferEligibleAt: string | null): boolean => {
    if (!transferEligibleAt) return false;
    const eligibleDate = new Date(transferEligibleAt);
    const currentDate = new Date();
    return eligibleDate < currentDate;
  };

  // Handle transfer button click
  const handleTransferClick = async () => {
    try {
      setIsCheckingEligibility(true);
      const accessToken = getAccessToken();
      if (!accessToken) return;

      const response = await fetch(getApiUrl("wallet/eligible-transfer-amount"), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data: EligibleTransferResponse = await response.json();
        if (data.success === 1 && data.data.eligible_amount > 0) {
          setEligibleAmount(data.data.eligible_amount);
          setTransferAmount(data.data.eligible_amount.toString());
          setShowTransferDialog(true);
        }
      }
    } catch (error) {
      console.error("Error checking eligible transfer:", error);
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    if (type.toLowerCase().includes("credit") || type.toLowerCase().includes("refund")) {
      return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
    }
    return <ArrowUpRight className="h-4 w-4 text-red-500" />;
  };

  const getTransactionColor = (type: string) => {
    if (type.toLowerCase().includes("credit") || type.toLowerCase().includes("refund")) {
      return "text-green-600";
    }
    return "text-red-600";
  };

  const columns: ColumnType<WalletTransaction>[] = [
    {
      title: "No.",
      render: ({ index }) => {
        const serial = (page - 1) * limit + (index + 1);
        return <span className="font-medium">{serial}</span>;
      },
      className: "w-[60px] text-center",
    },
    {
      title: "Type",
      accessor: "transaction_type",
      render: ({ cell }) => (
        <div className="flex items-center gap-2">
          {getTransactionIcon(cell)}
          <span className="capitalize">{cell?.replace(/_/g, " ") || "-"}</span>
        </div>
      ),
    },
    {
      title: "Description",
      accessor: "description",
      render: ({ cell }) => (
        <span className="text-sm max-w-[250px] truncate block" title={cell}>
          {cell || "-"}
        </span>
      ),
    },
    {
      title: "Amount",
      accessor: "amount",
      render: ({ cell, row }) => (
        <span className={`font-medium ${getTransactionColor(row.transaction_type)}`}>
          {row.transaction_type.toLowerCase().includes("credit") ||
          row.transaction_type.toLowerCase().includes("refund")
            ? "+"
            : "-"}
          {currencyFormatter(parseFloat(cell))}
        </span>
      ),
    },
    {
      title: "Balance After",
      accessor: "balance_after",
      render: ({ cell }) => (
        <span className="font-medium">{currencyFormatter(parseFloat(cell))}</span>
      ),
    },
    {
      title: "Transfer Status",
      accessor: "transfer_eligible_at",
      render: ({ cell, row }) => {
        if (row.transferred_to_bank) {
          return (
            <Badge variant="default" className="text-xs">
              Transferred
            </Badge>
          );
        }
        if (isTransferEligible(cell)) {
          return (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
              Eligible
            </Badge>
          );
        }
        if (cell) {
          return (
            <Badge variant="outline" className="text-xs">
              Eligible on {new Date(cell).toLocaleDateString("en-PK", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Badge>
          );
        }
        return <span className="text-muted-foreground text-xs">-</span>;
      },
    },
    {
      title: "Date",
      accessor: "created_at",
      render: ({ cell }) =>
        new Date(cell).toLocaleDateString("en-PK", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Check if any transaction is eligible for transfer
  const hasEligibleTransfer = transactions.some(
    (t) => !t.transferred_to_bank && isTransferEligible(t.transfer_eligible_at)
  );

  return (
    <Screen className="py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Wallet</h1>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-40" />
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-primary">
                  {currencyFormatter(balance)}
                </p>
                {hasEligibleTransfer && (
                  <Button
                    size="sm"
                    onClick={handleTransferClick}
                    disabled={isCheckingEligibility}
                    className="flex items-center gap-2"
                  >
                    <Banknote className="h-4 w-4" />
                    {isCheckingEligibility ? "Checking..." : "Transfer to Bank"}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-green-500" />
              Total Credited
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="text-2xl font-bold text-green-600">
                {currencyFormatter(totalCredited)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-red-500" />
              Total Debited
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="text-2xl font-bold text-red-600">
                {currencyFormatter(totalDebited)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Transaction History</h2>
        {isLoading ? (
          <TransactionTableSkeleton />
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No transactions yet.
            </p>
          </div>
        ) : (
          <Table<WalletTransaction>
            data={sortedTransactions}
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
      </div>

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              Transfer to Bank
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="transfer-amount">Amount to Transfer</Label>
              <Input
                id="transfer-amount"
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                max={eligibleAmount}
                className="text-lg"
                disabled
              />
              <p className="text-sm text-muted-foreground">
                Eligible amount: {currencyFormatter(eligibleAmount)}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm font-medium">
                Bank or account transfer process is in progress. Please try later.
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowTransferDialog(false)}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Screen>
  );
}

function TransactionTableSkeleton() {
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
