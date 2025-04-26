// "use client"

// import { useState, useEffect, useRef } from "react"
// import { useDispatch } from "react-redux"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { ArrowLeft, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
// import { Alert, AlertDescription } from "@/components/ui/alert"

// const OtpVerificationComponent = ({ onCancel, onVerified, verificationType = "password" }) => {
//   const dispatch = useDispatch()

//   // In a real app, we would use the mutations
//   // const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
//   // const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

//   const [otp, setOtp] = useState(["", "", "", "", "", ""])
//   const [error, setError] = useState("")
//   const [success, setSuccess] = useState(false)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [isResending, setIsResending] = useState(false)
//   const [countdown, setCountdown] = useState(0)

//   const inputRefs = useRef([])

//   useEffect(() => {
//     // Focus the first input on mount
//     if (inputRefs.current[0]) {
//       inputRefs.current[0].focus()
//     }
//   }, [])

//   useEffect(() => {
//     // Countdown timer for resend button
//     if (countdown > 0) {
//       const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
//       return () => clearTimeout(timer)
//     }
//   }, [countdown])

//   const handleChange = (index, value) => {
//     // Only allow numbers
//     if (value && !/^\d+$/.test(value)) {
//       return
//     }

//     // Update the OTP array
//     const newOtp = [...otp]
//     newOtp[index] = value
//     setOtp(newOtp)

//     // Clear error when user types
//     if (error) {
//       setError("")
//     }

//     // Auto-focus next input if value is entered
//     if (value && index < 5 && inputRefs.current[index + 1]) {
//       inputRefs.current[index + 1].focus()
//     }
//   }

//   const handleKeyDown = (index, e) => {
//     // Move to previous input on backspace if current input is empty
//     if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
//       inputRefs.current[index - 1].focus()
//     }

//     // Handle paste event
//     if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
//       e.preventDefault()
//       navigator.clipboard.readText().then((text) => {
//         const pastedData = text.trim()
//         if (/^\d{6}$/.test(pastedData)) {
//           const newOtp = pastedData.split("")
//           setOtp(newOtp)

//           // Focus the last input
//           if (inputRefs.current[5]) {
//             inputRefs.current[5].focus()
//           }
//         }
//       })
//     }
//   }

//   const handlePaste = (e) => {
//     e.preventDefault()
//     const pastedData = e.clipboardData.getData("text").trim()

//     if (/^\d{6}$/.test(pastedData)) {
//       const newOtp = pastedData.split("")
//       setOtp(newOtp)

//       // Focus the last input
//       if (inputRefs.current[5]) {
//         inputRefs.current[5].focus()
//       }
//     }
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     const otpValue = otp.join("")

//     if (otpValue.length !== 6) {
//       setError("Please enter all 6 digits of the OTP")
//       return
//     }

//     setIsSubmitting(true)

//     try {
//       // In a real app, we would call the mutation
//       // const result = await verifyOtp({
//       //   otp: otpValue,
//       //   type: verificationType
//       // }).unwrap();

//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1500))

//       // Simulate successful verification
//       setSuccess(true)

//       // Wait a moment to show success message before proceeding
//       setTimeout(() => {
//         onVerified()
//       }, 1500)
//     } catch (err) {
//       // Handle API errors
//       setError(err.data?.message || "Invalid OTP. Please try again.")
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handleResendOtp = async () => {
//     setIsResending(true)

//     try {
//       // In a real app, we would call the mutation
//       // const result = await resendOtp({
//       //   type: verificationType
//       // }).unwrap();

//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1000))

//       // Start countdown for 60 seconds
//       setCountdown(60)

//       // Clear any existing errors
//       setError("")
//     } catch (err) {
//       // Handle API errors
//       setError(err.data?.message || "Failed to resend OTP. Please try again.")
//     } finally {
//       setIsResending(false)
//     }
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <div className="flex items-center gap-2">
//           <Button variant="ghost" size="icon" onClick={onCancel} className="mr-2" disabled={isSubmitting || success}>
//             <ArrowLeft className="h-4 w-4" />
//             <span className="sr-only">Back</span>
//           </Button>
//           <CardTitle className="text-2xl font-bold text-primary">Verify OTP</CardTitle>
//         </div>
//         <CardDescription>
//           {verificationType === "password"
//             ? "Enter the 6-digit code sent to your email to confirm your password change"
//             : "Enter the 6-digit code sent to your email to verify your email change"}
//         </CardDescription>
//       </CardHeader>
//       <form onSubmit={handleSubmit}>
//         <CardContent className="space-y-6">
//           {error && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}

//           {success && (
//             <Alert className="bg-green-50 border-green-200">
//               <CheckCircle className="h-4 w-4 text-green-600" />
//               <AlertDescription className="text-green-600">
//                 {verificationType === "password" ? "Password changed successfully!" : "Email verified successfully!"}
//               </AlertDescription>
//             </Alert>
//           )}

//           <div className="space-y-2">
//             <Label htmlFor="otp-input">Enter Verification Code</Label>
//             <div className="flex justify-center gap-2">
//               {otp.map((digit, index) => (
//                 <Input
//                   key={index}
//                   ref={(el) => (inputRefs.current[index] = el)}
//                   type="text"
//                   inputMode="numeric"
//                   maxLength={1}
//                   value={digit}
//                   onChange={(e) => handleChange(index, e.target.value)}
//                   onKeyDown={(e) => handleKeyDown(index, e)}
//                   onPaste={index === 0 ? handlePaste : undefined}
//                   className="w-12 h-12 text-center text-lg font-bold"
//                   disabled={isSubmitting || success}
//                 />
//               ))}
//             </div>
//           </div>

//           <div className="text-center">
//             <p className="text-sm text-muted-foreground mb-2">Didn't receive the code?</p>
//             <Button
//               type="button"
//               variant="ghost"
//               size="sm"
//               onClick={handleResendOtp}
//               disabled={countdown > 0 || isResending || isSubmitting || success}
//               className="text-primary hover:text-primary/90"
//             >
//               {isResending ? (
//                 <>
//                   <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
//                   Resending...
//                 </>
//               ) : countdown > 0 ? (
//                 `Resend code in ${countdown}s`
//               ) : (
//                 "Resend Code"
//               )}
//             </Button>
//           </div>
//         </CardContent>
//         <CardFooter className="flex justify-between">
//           <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || success}>
//             Cancel
//           </Button>
//           <Button
//             type="submit"
//             className="bg-primary hover:bg-primary/90"
//             disabled={otp.join("").length !== 6 || isSubmitting || success}
//           >
//             {isSubmitting ? (
//               <>
//                 <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
//                 Verifying...
//               </>
//             ) : (
//               "Verify"
//             )}
//           </Button>
//         </CardFooter>
//       </form>
//     </Card>
//   )
// }

// export default OtpVerificationComponent




"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useVerifyEmailChangeOTPMutation, useResendOTPMutation } from "@/store/api/userApiSlice"

const OtpVerificationComponent = ({ onCancel, onVerified, verificationType = "password", email }) => {
  const [verifyEmailChangeOTP, { isLoading: isVerifying }] = useVerifyEmailChangeOTPMutation()
  const [resendOTP, { isLoading: isResending }] = useResendOTPMutation()

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const inputRefs = useRef([])

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (error) setError("")
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpValue = otp.join("")

    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits of the OTP")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await verifyEmailChangeOTP({ email, otp: otpValue }).unwrap()
      if (result.success) {
        setSuccess(true)
        setTimeout(() => onVerified(otpValue), 1500)
      } else {
        throw new Error(result.message || "Invalid OTP")
      }
    } catch (err) {
      setError(err?.data?.message || "Invalid OTP. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    setIsResending(true)
    try {
      const result = await resendOTP({ email }).unwrap()
      if (result.success) {
        setCountdown(60)
        setError("")
      } else {
        throw new Error(result.message || "Failed to resend OTP")
      }
    } catch (err) {
      setError(err?.data?.message || "Failed to resend OTP. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel} className="mr-2" disabled={isSubmitting || success}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <CardTitle className="text-2xl font-bold text-primary">Verify OTP</CardTitle>
        </div>
        <CardDescription>
          {verificationType === "password"
            ? "Enter the 6-digit code sent to your email to confirm your password change"
            : "Enter the 6-digit code sent to your email to verify your new email"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                {verificationType === "password" ? "Password changed successfully!" : "Email verified successfully!"}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="otp-input">Enter Verification Code</Label>
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-bold"
                  disabled={isSubmitting || success}
                />
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Didn't receive the code?</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResendOtp}
              disabled={countdown > 0 || isResending || isSubmitting || success}
              className="text-primary hover:text-primary/90"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                  Resending...
                </>
              ) : countdown > 0 ? (
                `Resend code in ${countdown}s`
              ) : (
                "Resend Code"
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || success}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90"
            disabled={otp.join("").length !== 6 || isSubmitting || success}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default OtpVerificationComponent