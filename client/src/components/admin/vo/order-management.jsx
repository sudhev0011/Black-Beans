"use client"

import { useState } from "react"
import { Search, ChevronLeft, ChevronRight, Eye, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Mock data
  const orders = Array.from({ length: 50 }, (_, i) => ({
    id: `ORD-${1000 + i}`,
    customer: `Customer ${i + 1}`,
    date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString(),
    total: (Math.random() * 200 + 20).toFixed(2),
    status: i % 4 === 0 ? "Pending" : i % 4 === 1 ? "Processing" : i % 4 === 2 ? "Shipped" : "Delivered",
    items: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
      id: j + 1,
      name: `Coffee Product ${j + 1}`,
      price: (Math.random() * 50 + 10).toFixed(2),
      quantity: Math.floor(Math.random() * 3) + 1,
    })),
    shippingAddress: {
      street: `${1000 + i} Main St`,
      city: "Coffee Town",
      state: "CA",
      zip: "12345",
    },
    paymentMethod: i % 2 === 0 ? "Credit Card" : "PayPal",
  }))

  const itemsPerPage = 10
  const totalPages = Math.ceil(orders.length / itemsPerPage)

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter ? order.status === statusFilter : true

    // Simple date filter - this would be more sophisticated in a real app
    let matchesDate = true
    if (dateFilter === "today") {
      matchesDate = order.date === new Date().toLocaleDateString()
    } else if (dateFilter === "week") {
      // This is a simplified check - would need proper date comparison in real app
      matchesDate = true
    } else if (dateFilter === "month") {
      // This is a simplified check - would need proper date comparison in real app
      matchesDate = true
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  // Paginate orders
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
  }

  const handleUpdateOrderStatus = (id, status) => {
    // Update order status logic would go here
    console.log("Updating order status:", id, status)
    setSelectedOrder(null)
  }

  const clearFilters = () => {
    setStatusFilter("")
    setDateFilter("")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Order Management</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date-filter">Date Range</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>${order.total}</TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "Processing"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "Shipped"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
                          <DialogDescription>View and update order information.</DialogDescription>
                        </DialogHeader>
                        {selectedOrder && (
                          <Tabs defaultValue="details">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="details">Details</TabsTrigger>
                              <TabsTrigger value="items">Items</TabsTrigger>
                              <TabsTrigger value="shipping">Shipping</TabsTrigger>
                            </TabsList>
                            <TabsContent value="details" className="space-y-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Customer</Label>
                                  <div className="font-medium">{selectedOrder.customer}</div>
                                </div>
                                <div>
                                  <Label>Date</Label>
                                  <div className="font-medium">{selectedOrder.date}</div>
                                </div>
                                <div>
                                  <Label>Total</Label>
                                  <div className="font-medium">${selectedOrder.total}</div>
                                </div>
                                <div>
                                  <Label>Payment Method</Label>
                                  <div className="font-medium">{selectedOrder.paymentMethod}</div>
                                </div>
                                <div className="col-span-2">
                                  <Label>Status</Label>
                                  <Select defaultValue={selectedOrder.status}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Pending">Pending</SelectItem>
                                      <SelectItem value="Processing">Processing</SelectItem>
                                      <SelectItem value="Shipped">Shipped</SelectItem>
                                      <SelectItem value="Delivered">Delivered</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </TabsContent>
                            <TabsContent value="items" className="py-4">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {selectedOrder.items.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell>{item.name}</TableCell>
                                      <TableCell>${item.price}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell className="text-right">
                                        ${(item.price * item.quantity).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TabsContent>
                            <TabsContent value="shipping" className="py-4">
                              <div className="space-y-4">
                                <div>
                                  <Label>Shipping Address</Label>
                                  <div className="mt-1 space-y-1">
                                    <div>{selectedOrder.shippingAddress.street}</div>
                                    <div>
                                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
                                      {selectedOrder.shippingAddress.zip}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <Label>Tracking Number</Label>
                                  <Input placeholder="Enter tracking number" />
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        )}
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button onClick={() => handleUpdateOrderStatus(selectedOrder?.id, selectedOrder?.status)}>
                            Update Order
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {paginatedOrders.length} of {filteredOrders.length} orders
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>
          <div className="text-sm">
            Page {currentPage} of {Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || filteredOrders.length === 0}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

