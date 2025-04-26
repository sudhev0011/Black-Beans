import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Plus, Home, Building, CheckCircle, AlertCircle } from "lucide-react"
import AddressFormComponent from "@/components/user/AddressForm"

import { useGetAddressesQuery } from "@/store/api/userApiSlice"
import { useSelector } from "react-redux"

const AddressSelectionComponent = ({ selectedAddress, onAddressSelect, error }) => {
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
    const user = useSelector((state)=> state.user.user)
  const { data: addresses, isLoading, isError } = useGetAddressesQuery(user._id)
  console.log("addres from the old address hook",addresses);
    

  const displayAddresses = addresses?.addresses;

  useEffect(() => {
    if (!selectedAddress && displayAddresses?.length > 0) {
      const defaultAddress = displayAddresses.find((addr) => addr.isDefault) 
      onAddressSelect(defaultAddress)
    }
  }, [displayAddresses, selectedAddress, onAddressSelect])

  const handleAddNewAddress = () => {
    setEditingAddress(null)
    setIsAddingAddress(true)
  }

  const handleEditAddress = (address) => {
    setEditingAddress(address)
    setIsAddingAddress(true)
  }

  const handleAddressFormSubmit = (address) => {
    onAddressSelect(address)
    setIsAddingAddress(false)
    setEditingAddress(null)
  }

  const handleAddressFormCancel = () => {
    setIsAddingAddress(false)
    setEditingAddress(null)
  }

  const getAddressTypeIcon = (type) => {
    switch (type) {
      case "home":
        return <Home className="h-5 w-5" />
      case "work":
        return <Building className="h-5 w-5" />
      default:
        return <MapPin className="h-5 w-5" />
    }
  }

  if (isAddingAddress) {
    return (
      <AddressFormComponent
        address={editingAddress}
        onSubmit={handleAddressFormSubmit}
        onCancel={handleAddressFormCancel}
      />
    )
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle>Delivery Address</CardTitle>
          <Button onClick={handleAddNewAddress} variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Address
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : isError ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load addresses. Please try again.</AlertDescription>
          </Alert>
        ) : displayAddresses.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
            <h3 className="text-lg font-medium">No addresses saved</h3>
            <p className="text-muted-foreground mb-4">Add your first address to continue checkout.</p>
            <Button onClick={handleAddNewAddress} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </div>
        ) : (
          <RadioGroup
            value={selectedAddress?._id}
            onValueChange={(value) => {
              const address = displayAddresses.find((addr) => addr._id === value)
              onAddressSelect(address)
            }}
            className="space-y-4"
          >
            {displayAddresses.map((address) => (
              <div
                key={address._id}
                className={`border rounded-lg p-4 transition-all ${
                  selectedAddress?._id === address._id ? "border-primary bg-primary/5" : "hover:border-gray-400"
                }`}
              >
                <div className="flex items-start gap-4">
                  <RadioGroupItem value={address._id} id={`address-${address._id}`} className="mt-1" />
                  <Label htmlFor={`address-${address._id}`} className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-primary">
                        {getAddressTypeIcon(address.type)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{address.type} Address</span>
                        {address.isDefault && (
                          <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">Default</span>
                        )}
                      </div>
                      {selectedAddress?._id === address._id && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                    </div>

                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{address.fullname}</p>
                      <p>{address.addressLine}</p>
                      {address.email && <p>{address.email}</p>}
                      <p>
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p>{address.country}</p>
                      <p className="text-muted-foreground">{address.phone}</p>
                    </div>
                  </Label>

                  <Button variant="ghost" size="sm" className="text-primary" onClick={() => handleEditAddress(address)}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </RadioGroup>
        )}
      </CardContent>
    </Card>
  )
}

export default AddressSelectionComponent

