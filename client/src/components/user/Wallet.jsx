import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  CreditCard, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ArrowUpDown,
  FilterIcon
} from "lucide-react";
import { useGetWalletQuery, useAddFundsMutation } from "@/store/api/userApiSlice";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const WalletComponent = () => {
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("balance");
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [transactionType, setTransactionType] = useState(null);

  const { data: wallet, isLoading: isWalletLoading, refetch } = useGetWalletQuery({
    page,
    limit,
    sortBy,
    sortOrder,
    type: transactionType
  });
  console.log('wallet data from the backend',wallet);
  
  
  const [addFunds, { isLoading: isAdding }] = useAddFundsMutation();

  useEffect(() => {
    refetch();
  }, [page, limit, sortBy, sortOrder, transactionType]);

  const handleAddFunds = async () => {
    if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
      return;
    }

    try {
      await addFunds({ amount: parseFloat(amount) }).unwrap();
      toast.success(`Wallet credited with ${amount} rupees`);
      setAmount("");
      refetch();
    } catch (error) {
      console.error("Failed to add funds:", error);
      toast.error("Failed to add funds. Please try again.");
    }
  };

  const getTransactionIcon = (type, status) => {
    if (status === "pending") {
      return <Clock className="h-5 w-5 text-amber-500" />;
    } else if (status === "failed") {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    } else if (type === "credit") {
      return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
    } else {
      return <ArrowUpRight className="h-5 w-5 text-red-500" />;
    }
  };

  const handleSortChange = (column) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to descending
      setSortBy(column);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const handleNextPage = () => {
    if (wallet?.pagination && page < wallet.pagination.totalPages) {
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

  const handleTypeFilter = (type) => {
    setTransactionType(type);
    setPage(1); 
  };

  if (isWalletLoading) {
    return <div>Loading wallet...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="balance" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="balance">Wallet Balance</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="balance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary">My Wallet</CardTitle>
              <CardDescription>Manage your wallet balance and add funds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center py-3 bg-muted/90 rounded-lg w-80 h-55">
                <CreditCard className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-3xl font-bold">₹{(wallet?.balance || 0).toFixed(2)}</h3>
                <p className="text-muted-foreground">Available Balance</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Add Funds to Wallet</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 text-lg" onClick={() => setAmount("10")}>
                    ₹10
                  </Button>
                  <Button variant="outline" className="h-20 text-lg" onClick={() => setAmount("25")}>
                    ₹25
                  </Button>
                  <Button variant="outline" className="h-20 text-lg" onClick={() => setAmount("50")}>
                    ₹50
                  </Button>
                  <Button variant="outline" className="h-20 text-lg" onClick={() => setAmount("100")}>
                    ₹100
                  </Button>
                  <Button variant="outline" className="h-20 text-lg" onClick={() => setAmount("200")}>
                    ₹200
                  </Button>
                  <Button variant="outline" className="h-20 text-lg" onClick={() => setAmount("500")}>
                    ₹500
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="custom-amount">Custom Amount</Label>
                    <div className="relative mt-1">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                      <Input
                        id="custom-amount"
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAddFunds}
                    className="bg-primary hover:bg-primary/90 mt-auto h-10"
                    disabled={
                      isAdding || !amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {isAdding ? "Adding..." : "Add Funds"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-primary">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(wallet?.transactions ).slice(0, 5).map((transaction, index) => (
                  <div key={transaction._id || transaction.id || index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {getTransactionIcon(transaction.type, transaction.status)}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={transaction.type === "credit" ? "text-green-600" : "text-red-600"}>
                      {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full text-primary" onClick={() => setActiveTab("transactions")}>
                View All Transactions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader className="flex flex-col space-y-2">
              <CardTitle className="text-2xl font-bold text-primary">Transaction History</CardTitle>
              <CardDescription>View all your wallet transactions</CardDescription>
              
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <FilterIcon className="h-4 w-4" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleTypeFilter(null)}>
                        All Transactions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTypeFilter("credit")}>
                        Credits Only
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTypeFilter("debit")}>
                        Debits Only
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {transactionType && (
                    <div className="text-sm text-muted-foreground">
                      Filtered: {transactionType === "credit" ? "Credits" : "Debits"}
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
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show</span>
                  <Select value={limit.toString()} onValueChange={handleLimitChange}>
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">per page</span>
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
                      <TableHead>Description</TableHead>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wallet?.transactions?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      (wallet?.transactions || []).map((transaction, index) => (
                        <TableRow key={transaction._id  || index}>
                          <TableCell className="font-medium">{transaction?.transactionId || "N/A"}</TableCell>
                          <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell className="capitalize">{transaction.type}</TableCell>
                          <TableCell>
                            {transaction.status === "completed" ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                Completed
                              </span>
                            ) : transaction.status === "pending" ? (
                              <span className="flex items-center gap-1 text-amber-600">
                                <Clock className="h-4 w-4" />
                                Pending
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                Failed
                              </span>
                            )}
                          </TableCell>
                          <TableCell
                            className={`text-right ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                          >
                            {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {wallet?.pagination && wallet.pagination.totalPages > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((page - 1) * limit) + 1}-
                    {Math.min(page * limit, wallet.pagination.totalTransactions)} of{" "}
                    {wallet.pagination.totalTransactions} transactions
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
                      {Array.from({ length: Math.min(5, wallet.pagination.totalPages) }, (_, i) => {
                        // Show pages around current page
                        let pageNumber;
                        if (wallet.pagination.totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (page <= 3) {
                          pageNumber = i + 1;
                        } else if (page >= wallet.pagination.totalPages - 2) {
                          pageNumber = wallet.pagination.totalPages - 4 + i;
                        } else {
                          pageNumber = page - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={page === pageNumber ? "default" : "outline"}
                            size="sm"
                            className="w-9 h-9 p-0"
                            onClick={() => setPage(pageNumber)}
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={page === wallet.pagination.totalPages}
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
      </Tabs>
    </div>
  );
};

export default WalletComponent;