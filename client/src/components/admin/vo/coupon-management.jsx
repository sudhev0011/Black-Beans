"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash, ChevronLeft, ChevronRight, Filter, X } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"

export default function CouponManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState("")
  const [editingCoupon, setEditingCoupon] = useState(null)

  // Mock data
  const coupons = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    code: `COFFEE${i + 10}`,
    type: i % 2 === 0 ? "Percentage" : "Fixed Amount",
    value: i % 2 === 0 ? `${Math.floor(Math.random() * 50) + 5}%` : `$${Math.floor(Math.random() * 20) + 5}`,
    minPurchase: i % 3 === 0 ? `$${Math.floor(Math.random() * 100) + 20}` : "None",
    startDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString(),
    endDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString(),
    status: i % 4 === 0 ? "Expired" : i % 4 === 1 ? "Scheduled" : "Active",
    usageLimit: Math.floor(Math.random() * 100) + 10,
    usageCount: Math.floor(Math.random() * 50),
  }))

  const itemsPerPage = 10
  const totalPages = Math.ceil(coupons.length / itemsPerPage)

  // Filter coupons
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter ? coupon.status === statusFilter : true

    return matchesSearch && matchesStatus
  })

  // Paginate coupons
  const paginatedCoupons = filteredCoupons.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleAddCoupon = (data) => {
    // Add coupon logic would go here
    console.log("Adding coupon:", data)
  }

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon)
  }

  const handleUpdateCoupon = (data) => {
    // Update coupon logic would go here
    console.log("Updating coupon:", data)
    setEditingCoupon(null)
  }

  const handleDeleteCoupon = (id) => {
    // Delete coupon logic would go here
    console.log("Deleting coupon:", id)
  }

  const clearFilters = () => {
    setStatusFilter("")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Coupon Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Coupon</DialogTitle>
              <DialogDescription>Create a new discount coupon for your customers.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">
                  Code
                </Label>
                <Input id="code" className="col-span-3" placeholder="e.g. SUMMER20" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">
                  Value
                </Label>
                <Input id="value" type="number" className="col-span-3" placeholder="e.g. 20" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="min-purchase" className="text-right">
                  Min Purchase
                </Label>
                <Input id="min-purchase" type="number" className="col-span-3" placeholder="e.g. 50" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start-date" className="text-right">
                  Start Date
                </Label>
                <Input id="start-date" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end-date" className="text-right">
                  End Date
                </Label>
                <Input id="end-date" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="usage-limit" className="text-right">
                  Usage Limit
                </Label>
                <Input id="usage-limit" type="number" className="col-span-3" placeholder="e.g. 100" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right">
                  <Label>Restrictions</Label>
                </div>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="new-customers" />
                    <Label htmlFor="new-customers">New customers only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="one-per-customer" />
                    <Label htmlFor="one-per-customer">One per customer</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddCoupon}>
                Save Coupon
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search coupons..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
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
              <TableHead>ID</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Min Purchase</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCoupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell>{coupon.id}</TableCell>
                <TableCell className="font-medium">{coupon.code}</TableCell>
                <TableCell>{coupon.type}</TableCell>
                <TableCell>{coupon.value}</TableCell>
                <TableCell>{coupon.minPurchase}</TableCell>
                <TableCell>{coupon.startDate}</TableCell>
                <TableCell>{coupon.endDate}</TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      coupon.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : coupon.status === "Scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {coupon.status}
                  </span>
                </TableCell>
                <TableCell>
                  {coupon.usageCount}/{coupon.usageLimit}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleEditCoupon(coupon)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Edit Coupon</DialogTitle>
                          <DialogDescription>Update the coupon details.</DialogDescription>
                        </DialogHeader>
                        {editingCoupon && (
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-code" className="text-right">
                                Code
                              </Label>
                              <Input id="edit-code" className="col-span-3" defaultValue={editingCoupon.code} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-type" className="text-right">
                                Type
                              </Label>
                              <Select defaultValue={editingCoupon.type.toLowerCase()}>
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder={editingCoupon.type} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">Percentage</SelectItem>
                                  <SelectItem value="fixed amount">Fixed Amount</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-value" className="text-right">
                                Value
                              </Label>
                              <Input
                                id="edit-value"
                                className="col-span-3"
                                defaultValue={editingCoupon.value.replace(/[^0-9.]/g, "")}
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-min-purchase" className="text-right">
                                Min Purchase
                              </Label>
                              <Input
                                id="edit-min-purchase"
                                className="col-span-3"
                                defaultValue={
                                  editingCoupon.minPurchase === "None"
                                    ? ""
                                    : editingCoupon.minPurchase.replace(/[^0-9.]/g, "")
                                }
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-start-date" className="text-right">
                                Start Date
                              </Label>
                              <Input id="edit-start-date" type="date" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-end-date" className="text-right">
                                End Date
                              </Label>
                              <Input id="edit-end-date" type="date" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-usage-limit" className="text-right">
                                Usage Limit
                              </Label>
                              <Input
                                id="edit-usage-limit"
                                type="number"
                                className="col-span-3"
                                defaultValue={editingCoupon.usageLimit}
                              />
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button type="submit" onClick={() => handleUpdateCoupon(editingCoupon)}>
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Coupon</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this coupon? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button variant="destructive" onClick={() => handleDeleteCoupon(coupon.id)}>
                            Delete Coupon
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
          Showing {paginatedCoupons.length} of {filteredCoupons.length} coupons
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
            Page {currentPage} of {Math.max(1, Math.ceil(filteredCoupons.length / itemsPerPage))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || filteredCoupons.length === 0}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

