// import { useState } from "react";
// import { X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { toast } from "sonner";
// import { useApplyReferralCodeMutation } from "@/store/api/userApiSlice";

// export function ReferralCodePopup({ onClose }) {
//   const [isVisible, setIsVisible] = useState(true);
//   const [referralCode, setReferralCode] = useState("");
//   const [applyReferralCode, { isLoading }] = useApplyReferralCodeMutation();

//   const handleClose = () => {
//     setIsVisible(false);
//     onClose();
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!referralCode.trim()) {
//         toast.info("Please enter a referral code");
//       return;
//     }

//     try {
//       const response = await applyReferralCode(referralCode).unwrap();
//       toast.success(`${response.message} You received a 10% off coupon!`);
//       setTimeout(() => {
//         setIsVisible(false);
//         onClose();
//       }, 5000);
//     } catch (error) {
//       toast(error.data?.message || "Failed to apply referral code",);
//     }
//   };

//   if (!isVisible) return null;

//   return (
//     <div className="fixed bottom-4 right-4 z-50 w-80 rounded-lg border bg-card p-4 shadow-lg animate-in fade-in slide-in-from-bottom-10 duration-300 md:bottom-6 md:right-6">
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-semibold">Got a referral code?</h3>
//         <Button
//           variant="ghost"
//           size="icon"
//           className="h-8 w-8"
//           onClick={handleClose}
//           aria-label="Close"
//         >
//           <X className="h-4 w-4" />
//         </Button>
//       </div>
//       <p className="mt-2 text-sm text-muted-foreground">
//         Enter your code to get a 10% off coupon for your first purchase
//       </p>
//       <form onSubmit={handleSubmit} className="mt-3 space-y-3">
//         <Input
//           type="text"
//           placeholder="Enter referral code"
//           value={referralCode}
//           onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
//           className="w-full"
//           disabled={isLoading}
//         />
//         <Button type="submit" className="w-full" disabled={isLoading || !referralCode.trim()}>
//           {isLoading ? "Applying..." : "Apply Code"}
//         </Button>
//       </form>
//     </div>
//   );
// }



import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useApplyReferralCodeMutation } from "@/store/api/userApiSlice";

export function ReferralCodePopup({ onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [applyReferralCode, { isLoading }] = useApplyReferralCodeMutation();

  // Store timeout ID to clean it up later
  const [timeoutId, setTimeoutId] = useState(null);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!referralCode.trim()) {
      toast.info("Please enter a referral code");
      return;
    }

    try {
      const response = await applyReferralCode(referralCode).unwrap();
      toast.success(`${response.message} You received a 10% off coupon!`);
      // Set timeout and store its ID
      const id = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 5000);
      setTimeoutId(id);
    } catch (error) {
      toast.error(error.data?.message || "Failed to apply referral code");
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-lg border bg-card p-4 shadow-lg animate-in fade-in slide-in-from-bottom-10 duration-300 md:bottom-6 md:right-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Got a referral code?</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleClose}
          aria-label="Close"
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your code to get a 10% off coupon for your first purchase
      </p>
      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        <Input
          type="text"
          placeholder="Enter referral code"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
          className="w-full"
          disabled={isLoading}
        />
        <Button type="submit" className="w-full" disabled={isLoading || !referralCode.trim()}>
          {isLoading ? "Applying..." : "Apply Code"}
        </Button>
      </form>
    </div>
  );
}