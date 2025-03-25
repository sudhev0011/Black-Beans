// import { useState } from "react";
// import { Search, ChevronLeft, ChevronRight, UserX, UserCheck, Filter, X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import {
//   useGetCustomersQuery,
//   useToggleUserStatusMutation,
// } from "../../../store/api/adminApiSlice";
// import { toast } from "sonner";

// export default function UserManagement() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [showFilters, setShowFilters] = useState(false);
//   const [statusFilter, setStatusFilter] = useState("");
//   const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
//   const [userToToggle, setUserToToggle] = useState(null); // Store user to toggle

//   const itemsPerPage = 10;

//   // Fetch users with pagination and search
//   const { data: usersData, isLoading: isUsersLoading, error } = useGetCustomersQuery({
//     page: currentPage,
//     limit: itemsPerPage,
//     term: searchTerm,
//   });
//   const users = usersData?.users || [];
//   const totalPages = usersData?.totalPages || 1;

//   // Toggle user status
//   const [toggleUserStatus, { isLoading: isToggling }] = useToggleUserStatusMutation();

//   // Filter users client-side
//   const filteredUsers = users.filter((user) => {
//     const matchesStatus = statusFilter
//       ? (statusFilter === "Active" ? !user.isBlocked : user.isBlocked)
//       : true;
//     return matchesStatus;
//   });

//   const paginatedUsers = filteredUsers;

//   // Toggle User Status Handler with Confirmation
//   const handleToggleUserStatus = async (userId) => {
//     try {
//       await toggleUserStatus(userId).unwrap();
//       toast.success("User status toggled successfully!");
//     } catch (error) {
//       toast.error("Error toggling user status: " + (error?.data?.message || error.message));
//     }
//   };

//   const openConfirmDialog = (user) => {
//     setUserToToggle(user);
//     setConfirmDialogOpen(true);
//   };

//   const confirmToggleStatus = () => {
//     if (userToToggle) {
//       handleToggleUserStatus(userToToggle._id);
//       setConfirmDialogOpen(false);
//       setUserToToggle(null);
//     }
//   };

//   const clearFilters = () => {
//     setStatusFilter("");
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold">User Management</h1>
//       </div>

//       <div className="flex flex-col md:flex-row gap-4 justify-between">
//         <div className="relative w-full md:w-64">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input
//             type="search"
//             placeholder="Search users..."
//             className="pl-8"
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value);
//               setCurrentPage(1);
//             }}
//           />
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
//             <Filter className="mr-2 h-4 w-4" />
//             Filters
//           </Button>
//         </div>
//       </div>

//       {showFilters && (
//         <Card>
//           <CardHeader className="pb-3">
//             <div className="flex justify-between items-center">
//               <CardTitle>Filters</CardTitle>
//               <Button variant="ghost" size="sm" onClick={clearFilters}>
//                 <X className="h-4 w-4 mr-1" /> Clear
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <Label htmlFor="status-filter">Status</Label>
//                 <Select value={statusFilter} onValueChange={setStatusFilter}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="All Statuses" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="">All Statuses</SelectItem>
//                     <SelectItem value="Active">Active</SelectItem>
//                     <SelectItem value="Blocked">Blocked</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       <div className="border rounded-md">
//         {isUsersLoading ? (
//           <p>Loading users...</p>
//         ) : error ? (
//           <p>Error: {error?.data?.message || "Failed to load users"}</p>
//         ) : paginatedUsers.length === 0 ? (
//           <p>No users found</p>
//         ) : (
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>ID</TableHead>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Email</TableHead>
//                 <TableHead>Phone</TableHead>
//                 <TableHead>Join Date</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {paginatedUsers.map((user) => (
//                 <TableRow key={user._id}>
//                   <TableCell>{user._id}</TableCell>
//                   <TableCell>{user.name}</TableCell>
//                   <TableCell>{user.email}</TableCell>
//                   <TableCell>{user.phone || "N/A"}</TableCell>
//                   <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
//                   <TableCell>
//                     <span
//                       className={`inline-block px-2 py-1 text-xs rounded-full ${
//                         user.isBlocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
//                       }`}
//                     >
//                       {user.isBlocked ? "Blocked" : "Active"}
//                     </span>
//                   </TableCell>
//                   <TableCell className="text-right">
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => openConfirmDialog(user)}
//                       disabled={isToggling}
//                     >
//                       {user.isBlocked ? (
//                         <UserCheck className="h-4 w-4" />
//                       ) : (
//                         <UserX className="h-4 w-4" />
//                       )}
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         )}
//       </div>

//       {/* Single Confirmation Dialog */}
//       <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>
//               {userToToggle?.isBlocked ? "Unblock User" : "Block User"}
//             </AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to {userToToggle?.isBlocked ? "unblock" : "block"}{" "}
//               "{userToToggle?.name}"? This action will{" "}
//               {userToToggle?.isBlocked ? "restore" : "restrict"} their access to the system.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={confirmToggleStatus}>
//               Confirm
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       <div className="flex items-center justify-between">
//         <div className="text-sm text-muted-foreground">
//           Showing {paginatedUsers.length} of {filteredUsers.length} users
//         </div>
//         <div className="flex items-center space-x-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//           >
//             <ChevronLeft className="h-4 w-4" />
//             <span className="sr-only">Previous Page</span>
//           </Button>
//           <div className="text-sm">
//             Page {currentPage} of {totalPages}
//           </div>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//             disabled={currentPage === totalPages || filteredUsers.length === 0}
//           >
//             <ChevronRight className="h-4 w-4" />
//             <span className="sr-only">Next Page</span>
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }




import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, UserX, UserCheck, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useGetCustomersQuery,
  useToggleUserStatusMutation,
} from "../../../store/api/adminApiSlice";
import { toast } from "sonner";

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState(""); // "" for all, "active", or "blocked"
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);

  const itemsPerPage = 10;

  // Fetch users with pagination, search, and status filter
  const { data: usersData, isLoading: isUsersLoading, error } = useGetCustomersQuery({
    page: currentPage,
    limit: itemsPerPage,
    term: searchTerm,
    status: statusFilter === "all" ? "" : statusFilter.toLowerCase(), // Pass status to backend
  });

  const users = usersData?.users || [];
  const totalPages = usersData?.totalPages || 1;
  const totalUsers = usersData?.users.length // Use totalUsers from backend

  // Toggle user status
  const [toggleUserStatus, { isLoading: isToggling }] = useToggleUserStatusMutation();

  // Use the filtered users directly from the backend
  const paginatedUsers = users;

  // Toggle User Status Handler with Confirmation
  const handleToggleUserStatus = async (user) => {
    try {
      await toggleUserStatus(user._id).unwrap();
      toast.success(`${user.username}'s status toggled successfully!`);
    } catch (error) {
      toast.error("Error toggling user status: " + (error?.data?.message || error.message));
    }
  };

  const openConfirmDialog = (user) => {
    setUserToToggle(user);
    setConfirmDialogOpen(true);
  };

  const confirmToggleStatus = () => {
    if (userToToggle) {
      console.log(userToToggle);
      
      handleToggleUserStatus(userToToggle);
      setConfirmDialogOpen(false);
      setUserToToggle(null);
    }
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
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
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1); // Reset to page 1 when filter changes
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="border rounded-md">
        {isUsersLoading ? (
          <p>Loading users...</p>
        ) : error ? (
          <p>Error: {error?.data?.message || "Failed to load users"}</p>
        ) : paginatedUsers.length === 0 ? (
          <p>No users found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user._id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        user.isBlocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openConfirmDialog(user)}
                      disabled={isToggling}
                    >
                      {user.isBlocked ? (
                        <UserCheck className="h-4 w-4" />
                      ) : (
                        <UserX className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Single Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userToToggle?.isBlocked ? "Unblock User" : "Block User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {userToToggle?.isBlocked ? "unblock" : "block"}{" "}
              "{userToToggle?.username}"? This action will{" "}
              {userToToggle?.isBlocked ? "restore" : "restrict"} their access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleStatus}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {paginatedUsers.length} of {totalUsers} users
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
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || paginatedUsers.length === 0}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}