import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useApplyReferralCodeMutation } from "@/store/api/userApiSlice";

export default function ReferralCodePopup({ onClose }) {
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
    <div className="fixed z-50 animate-in fade-in slide-in-from-bottom-10 duration-300 
                    p-3 sm:p-4 
                    bottom-2 sm:bottom-4 md:bottom-6 
                    right-2 sm:right-4 md:right-6 
                    w-full max-w-xs sm:max-w-sm 
                    rounded-lg border bg-card shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold">Got a referral code?</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 sm:h-8 sm:w-8"
          onClick={handleClose}
          aria-label="Close"
          disabled={isLoading}
        >
          <X className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
      <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
        Enter your code to get a 10% off coupon for your first purchase
      </p>
      <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
        <Input
          type="text"
          placeholder="Enter referral code"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className="w-full text-sm sm:text-base"
          disabled={isLoading}
        />
        <Button 
          onClick={handleSubmit}
          className="w-full text-xs sm:text-sm py-1 h-8 sm:h-10" 
          disabled={isLoading || !referralCode.trim()}
        >
          {isLoading ? "Applying..." : "Apply Code"}
        </Button>
      </div>
    </div>
  );
}