import { useState } from "react"
import { useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus, Edit, Trash2, CheckCircle, Home, Building } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import AddressFormComponent from "@/components/user/AddressForm"
import { useGetAddressesQuery, useDeleteAddressMutation, useEditAddressMutation } from "@/store/api/userApiSlice"

const AddressComponent = () => {
  const user = useSelector((state) => state.user.user)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)

  const { data: addressesData, isLoading } = useGetAddressesQuery(user?._id, { skip: !user })
  const [deleteAddress] = useDeleteAddressMutation()
  const [editAddress] = useEditAddressMutation()

  const addresses = addressesData?.addresses || []
  const defaultAddress = addresses.find((address)=>address.isDefault);
  
  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await deleteAddress(addressId).unwrap()
      if(response.success){
        toast.success('Address got deleted successfully!');
      }
    } catch (error) {
      console.error("Failed to delete address:", error)
      toast.error("Failed to delete address");
    }
  }

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await editAddress({ addressId, addressData: { isDefault: true } }).unwrap()
      if(response.success){
        toast.success('Address updated as default!');
      }
    } catch (error) {
      console.error("Failed to set default address:", error)
      toast.error("Failed to set default address")
    }
  }

  const handleEditAddress = (address) => {
    setEditingAddress(address)
    setIsAddingAddress(true)
  }

  const handleAddNewAddress = () => {
    setEditingAddress(null)
    setIsAddingAddress(true)
  }

  const handleCancelAddEdit = () => {
    setIsAddingAddress(false)
    setEditingAddress(null)
  }

  const getAddressTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "home":
        return <Home className="h-5 w-5" />
      case "work":
        return <Building className="h-5 w-5" />
      default:
        return <MapPin className="h-5 w-5" />
    }
  }

  if (isAddingAddress) {
    return <AddressFormComponent address={editingAddress} onCancel={handleCancelAddEdit} />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-primary">My Addresses</CardTitle>
            <CardDescription>Manage your shipping and billing addresses</CardDescription>
          </div>
          <Button 
            onClick={handleAddNewAddress} 
            className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Address
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading addresses...</div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium">No addresses saved</h3>
              <p className="text-muted-foreground">Add your first address to simplify checkout.</p>
              <Button 
                onClick={handleAddNewAddress} 
                className="mt-4 bg-primary hover:bg-primary/90 w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Address
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <Card key={address._id} className={`overflow-hidden ${address.isDefault ? "border-primary" : ""}`}>
                  <div className="flex justify-between items-start p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-primary">
                        {getAddressTypeIcon(address.addressType)}
                      </div>
                      <div>
                        <h3 className="font-medium capitalize">{address.addressType} Address</h3>
                        {address.isDefault && <Badge className="bg-primary text-xs">Default</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditAddress(address)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={address.isDefault}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action will delete the {address.addressType.toLowerCase()} address. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteAddress(address._id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardContent className="border-t pt-4">
                    <div className="space-y-1">
                      <p className="font-medium">{address.fullname}</p>
                      <p>{address.addressLine}</p>
                      <p>{address.email}</p>
                      <p>
                        {address.city}, {address.state} {address.pincode}
                      </p>
                      <p>{address.country}</p>
                      <p className="text-muted-foreground">{address.phone}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/20 px-4 py-3">
                    {address.isDefault ? (
                      <div className="flex items-center text-sm text-primary">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Default Shipping & Billing Address
                      </div>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-sm">
                            Set as Default
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Default Address</AlertDialogTitle>
                            <AlertDialogDescription>
                              Do you want to set this {address.addressType.toLowerCase()} address as your default shipping and billing address? This will replace the current default address.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleSetDefaultAddress(address._id)}>
                              Set as Default
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AddressComponent