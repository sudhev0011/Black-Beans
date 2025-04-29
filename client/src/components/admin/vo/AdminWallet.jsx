import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FilterIcon,
  Search,
  Eye,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  User,
} from "lucide-react";
import { useGetAdminWalletQuery } from "@/store/api/adminApiSlice";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AdminWalletComponent = () => {
  // State for transactions list
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [transactionType, setTransactionType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // State for transaction details modal
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const navigate = useNavigate();;

  // API call to get wallet transactions
  const {
    data: walletData,
    isLoading: isWalletLoading,
    refetch,
  } = useGetAdminWalletQuery({
    page,
    limit,
    sortBy,
    sortOrder,
    type: transactionType,
    search: searchQuery,
  });

  console.log("walletData",walletData);

  useEffect(() => {
    refetch();
  }, [page, limit, sortBy, sortOrder, transactionType, searchQuery]);
  

  // Table sorting handler
  const handleSortChange = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setPage(1);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (walletData?.pagination && page < walletData.pagination.totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleLimitChange = (value) => {
    setLimit(parseInt(value));
    setPage(1);
  };

  // Filter handlers
  const handleTypeFilter = (type) => {
    setTransactionType(type);
    setPage(1);
  };

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  // Transaction detail handlers
  const openTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };

  // Navigate to order detail
  const navigateToOrder = (orderId) => {
    // This would typically use a router to navigate
    toast.info(`Navigating to order: ${orderId}`);
    // Example: router.push(`/admin/orders/${orderId}`);
  };

  // Get transaction status icon
  const getTransactionStatusIcon = (status) => {
    if (status === "completed") {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status === "pending") {
      return <Clock className="h-4 w-4 text-amber-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  // Get transaction type icon
  const getTransactionTypeIcon = (type) => {
    if (type === "credit") {
      return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
    } else {
      return <ArrowUpRight className="h-4 w-4 text-red-500" />;
    }
  };

  if (isWalletLoading) {
    return <div>Loading wallet data...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="transactions">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
          <TabsTrigger value="summary">Financial Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary">
                Wallet Transactions
              </CardTitle>
              <CardDescription>
                Manage and review all wallet transactions
              </CardDescription>

              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search by user or ID..."
                        className="pl-8 w-full md:w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button type="submit" size="sm">
                      Search
                    </Button>
                  </form>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <FilterIcon className="h-4 w-4" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleTypeFilter(null)}>
                        All Transactions
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleTypeFilter("credit")}
                      >
                        Credits Only
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleTypeFilter("debit")}
                      >
                        Debits Only
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {transactionType && (
                    <div className="text-sm text-muted-foreground">
                      Filtered:{" "}
                      {transactionType === "credit" ? "Credits" : "Debits"}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 ml-1 p-0"
                        onClick={() => handleTypeFilter(null)}
                      >
                        ×
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-sm text-muted-foreground">Show</span>
                    <Select
                      value={limit.toString()}
                      onValueChange={handleLimitChange}
                    >
                      <SelectTrigger className="w-16">
                        <SelectValue placeholder="10" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSortChange("orderId")}
                        >
                          Transaction ID
                          {sortBy === "orderId" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSortChange("createdAt")}
                        >
                          Date
                          {sortBy === "createdAt" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSortChange("type")}
                        >
                          Type
                          {sortBy === "type" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSortChange("status")}
                        >
                          Status
                          {sortBy === "status" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        <div
                          className="flex items-center justify-end cursor-pointer"
                          onClick={() => handleSortChange("amount")}
                        >
                          Amount
                          {sortBy === "amount" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!walletData?.transactions ||
                    walletData.transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      walletData.transactions.map((transaction) => (
                        <TableRow key={transaction._id}>
                          <TableCell className="font-medium">
                            {transaction.orderId || "N/A"}
                          </TableCell>
                          <TableCell>
                            {new Date(
                              transaction.createdAt
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {transaction.user
                                ? `${transaction.user.username}`
                                : "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getTransactionTypeIcon(transaction.type)}
                              <span className="capitalize">
                                {transaction.type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getTransactionStatusIcon(transaction.status)}
                              <span className="capitalize">
                                {transaction.status}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell
                            className={`text-right ${
                              transaction.type === "credit"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.type === "credit" ? "+" : "-"}₹
                            {transaction.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                openTransactionDetails(transaction)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {walletData?.pagination &&
                walletData.pagination.totalPages > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(page - 1) * limit + 1}-
                      {Math.min(
                        page * limit,
                        walletData.pagination.totalTransactions
                      )}{" "}
                      of {walletData.pagination.totalTransactions} transactions
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          {
                            length: Math.min(
                              5,
                              walletData.pagination.totalPages
                            ),
                          },
                          (_, i) => {
                            // Show pages around current page
                            let pageNumber;
                            if (walletData.pagination.totalPages <= 5) {
                              pageNumber = i + 1;
                            } else if (page <= 3) {
                              pageNumber = i + 1;
                            } else if (
                              page >=
                              walletData.pagination.totalPages - 2
                            ) {
                              pageNumber =
                                walletData.pagination.totalPages - 4 + i;
                            } else {
                              pageNumber = page - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNumber}
                                variant={
                                  page === pageNumber ? "default" : "outline"
                                }
                                size="sm"
                                className="w-9 h-9 p-0"
                                onClick={() => setPage(pageNumber)}
                              >
                                {pageNumber}
                              </Button>
                            );
                          }
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={page === walletData.pagination.totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary">
                Financial Summary
              </CardTitle>
              <CardDescription>Overview of all wallet activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      ₹{(walletData?.summary?.totalBalance || 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Across all user wallets
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Credits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{(walletData?.summary?.totalCredits || 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      All-time wallet deposits
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Debits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      ₹{(walletData?.summary?.totalDebits || 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      All-time wallet withdrawals
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">
                      Transaction Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Total Transactions
                        </h4>
                        <p className="text-xl font-bold mt-1">
                          {walletData?.summary?.totalTransactions || 0}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Pending Transactions
                        </h4>
                        <p className="text-xl font-bold mt-1">
                          {walletData?.summary?.pendingTransactions || 0}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Credits (Count)
                        </h4>
                        <p className="text-xl font-bold mt-1">
                          {walletData?.summary?.creditCount || 0}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Debits (Count)
                        </h4>
                        <p className="text-xl font-bold mt-1">
                          {walletData?.summary?.debitCount || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">
                      Active Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Users with Balance
                        </h4>
                        <p className="text-xl font-bold mt-1">
                          {walletData?.summary?.usersWithBalance || 0}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Active Users (Last 30 Days)
                        </h4>
                        <p className="text-xl font-bold mt-1">
                          {walletData?.summary?.activeUsers || 0}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Avg. Balance
                        </h4>
                        <p className="text-xl font-bold mt-1">
                          ₹
                          {(walletData?.summary?.averageBalance || 0).toFixed(
                            2
                          )}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Avg. Transaction
                        </h4>
                        <p className="text-xl font-bold mt-1">
                          ₹
                          {(
                            walletData?.summary?.averageTransaction || 0
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Detailed information about this transaction
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Transaction ID</h3>
                  <p className="text-sm">
                    {selectedTransaction.orderId || "N/A"}
                  </p>
                </div>
                <Badge
                  variant={
                    selectedTransaction.status === "completed"
                      ? "default"
                      : selectedTransaction.status === "pending"
                      ? "outline"
                      : "destructive"
                  }
                >
                  {selectedTransaction.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Date</h3>
                  <p className="text-sm">
                    {new Date(selectedTransaction.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Amount</h3>
                  <p
                    className={`text-sm font-bold ${
                      selectedTransaction.type === "credit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedTransaction.type === "credit" ? "+" : "-"}₹
                    {selectedTransaction.amount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium">User Details</h3>
                <div className="text-sm space-y-1 mt-1 p-3 bg-muted rounded-md">
                  <p>
                    <span className="text-muted-foreground">Name:</span>{" "}
                    {selectedTransaction.user?.username || "N/A"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {selectedTransaction.user?.email || "N/A"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">User ID:</span>{" "}
                    {selectedTransaction.user?._id || "N/A"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      Current Balance:
                    </span>{" "}
                    ₹
                    {selectedTransaction.user?.walletBalance?.toFixed(2) ||
                      "0.00"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium">Transaction Source</h3>
                <p className="text-sm">
                  {selectedTransaction.description ||
                    "No description available"}
                </p>

                {/* Render button for order-related transactions */}
                {selectedTransaction.sourceType === "order" &&
                  selectedTransaction.sourceId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        navigateToOrder(selectedTransaction.sourceId)
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Related Order
                    </Button>
                  )}
              </div>

              {selectedTransaction.notes && (
                <div>
                  <h3 className="font-medium">Additional Notes</h3>
                  <p className="text-sm">{selectedTransaction.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWalletComponent;
