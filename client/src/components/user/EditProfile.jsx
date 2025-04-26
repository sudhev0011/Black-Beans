import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, X, Mail } from "lucide-react"
import { 
  useEditProfileMutation, 
  useSendEmailChangeOTPMutation, 
  useVerifyEmailChangeOTPMutation,
  useGetProfileQuery 
} from "@/store/api/userApiSlice"
import OtpVerificationComponent from "./OtpVerify"

const EditProfileComponent = ({ onCancel }) => {
  const user = useSelector((state) => state.user.user)
  const { data: userData, isLoading, isError } = useGetProfileQuery(user?._id)

  const [editProfile, { isLoading: isEditingProfile }] = useEditProfileMutation()
  const [sendEmailChangeOTP, { isLoading: isSendingOTP }] = useSendEmailChangeOTPMutation()
  const [verifyEmailChangeOTP, { isLoading: isVerifyingOTP }] = useVerifyEmailChangeOTPMutation()

  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    address: "",
    email: "",
  })

  const [avatarFile, setAvatarFile] = useState(null)
  const [emailChanged, setEmailChanged] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    if (userData?.user) {
      setFormData({
        username: userData.user.username || "",
        phone: userData.user.phone || "",
        address: userData.user.address || "",
        email: userData.user.email || "",
      })
      setAvatarFile(userData.user.image_url || null)
    }
  }, [userData])

  const validateFields = () => {
    let errors = {}

    if (!formData.username.trim()) {
      errors.username = "Fullname is required"
    } else if (!/^[a-zA-Z\s]+$/.test(formData.username)) {
      errors.username = "Username should only contain letters and spaces"
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters"
    }

    if (!formData.email) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email address"
    }

    if (!formData.phone) {
      errors.phone = "Phone number is required"
    } else if (!/^\d{10,15}$/.test(formData.phone)) {
      errors.phone = "Phone number must be 10-15 digits"
    }

    return errors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFormErrors((prev) => ({ ...prev, [name]: "" }))  // clear individual error on change

    if (name === "email" && value !== user?.email) {
      setEmailChanged(true)
    } else if (name === "email" && value === user?.email) {
      setEmailChanged(false)
      setEmailError("")
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/webp"]
      if (!validTypes.includes(file.type)) {
        alert("Only JPG, PNG, or WEBP images are allowed")
        return
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("Image size should be less than 2MB")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarFile(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEmailVerify = async () => {
    if (formErrors.email) return

    try {
      const result = await sendEmailChangeOTP({ email: formData.email }).unwrap()
      if (result.success) {
        setIsVerifyingOtp(true)
      } else {
        setEmailError(result.message || "Failed to send verification email")
      }
    } catch (error) {
      setEmailError(error?.data?.message || "Failed to send verification email")
    }
  }

  const handleOtpVerified = async (otp) => {
    try {
      const result = await verifyEmailChangeOTP({ email: formData.email, otp }).unwrap()
      if (result.success) {
        setIsVerifyingOtp(false)
        setEmailChanged(false)
        setEmailError("")
      } else {
        throw new Error(result.message || "OTP verification failed")
      }
    } catch (error) {
      setEmailError(error?.data?.message || "Invalid OTP")
      setIsVerifyingOtp(true)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errors = validateFields()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    if (emailChanged) {
      setEmailError("Please verify your new email before saving changes")
      return
    }

    const data = new FormData()
    data.append("username", formData.username.trim())
    data.append("phone", formData.phone.trim())
    data.append("email", formData.email.trim())

    if (formData.address) {
      data.append("address", JSON.stringify(formData.address))  // address might be object
    }

    if (avatarFile && avatarFile !== user?.image_url) {
      data.append("avatar", avatarFile)
    }

    try {
      await editProfile({ userId: user._id, formData: data }).unwrap()
      onCancel()
    } catch (error) {
      console.error("Error updating profile:", error)
      setEmailError(error?.data?.message || "Failed to update profile")
    }
  }

  if (isVerifyingOtp) {
    return (
      <OtpVerificationComponent
        onCancel={() => setIsVerifyingOtp(false)}
        onVerified={handleOtpVerified}
        verificationType="email"
        email={formData.email} 
      />
    )
  }

  if (isLoading) {
    return <h2>Loading user details, please wait...</h2>
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={avatarFile || "/placeholder.svg"} alt="Profile" />
                <AvatarFallback className="text-3xl bg-primary text-white">
                  {formData.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0">
                <Label
                  htmlFor="avatar-upload"
                  className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Upload a new profile picture</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="username">Full Name</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={formErrors.username ? "border-red-500" : ""}
              />
              {formErrors.username && <p className="text-sm text-red-500">{formErrors.username}</p>}
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled={user.googleId}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={emailError || formErrors.email ? "border-red-500" : ""}
                />
                {emailChanged && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={handleEmailVerify}
                    disabled={isSendingOTP}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    {isSendingOTP ? "Sending..." : "Verify"}
                  </Button>
                )}
              </div>
              {(emailError || formErrors.email) && (
                <p className="text-sm text-red-500">{emailError || formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="number"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className={formErrors.phone ? "border-red-500" : ""}
              />
              {formErrors.phone && <p className="text-sm text-red-500">{formErrors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                disabled
                value={
                  formData.address
                    ? `${formData.address.addressLine || ""} ${formData.address.city || ""} ${formData.address.state || ""}`
                    : ""
                }
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isEditingProfile}>
            {isEditingProfile ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default EditProfileComponent
