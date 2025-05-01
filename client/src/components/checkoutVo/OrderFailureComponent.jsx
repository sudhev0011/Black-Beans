import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, AlertCircle, ArrowLeft, RefreshCcw } from "lucide-react";
import AnimatedError from "@/components/ui/AnimatedError";
import {
  useRetryPaymentMutation,
  useVerifyPaymentMutation,
} from "@/store/api/userApiSlice";
import { handleRazorpayPayment } from "@/utils/razorPay";
import { useSelector } from "react-redux";

const OrderFailureComponent = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { state } = useLocation();
  const user = useSelector((state) => state.user.user);
  const [retryPayment, { isLoading }] = useRetryPaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZOR_KEY_ID;
  const errorMessage = state?.errorMessage || "An unexpected error occurred.";
  const errorCode = state?.errorCode || "UNKNOWN";

  const handleRetryPayment = async () => {
    try {
      const result = await retryPayment({ orderId }).unwrap();
      await handleRazorpayPayment({
        result,
        user,
        RAZORPAY_KEY_ID,
        verifyPayment,
        onSuccess: (orderId) => {
          navigate(`/user/checkout/order-confirmation/${orderId}`);
        },
        onError: (error) => {
          navigate(`/user/checkout/order-failure/${orderId}`, {
            state: {
              errorMessage: error.message,
              errorCode: error.code,
            },
          });
        },
      });
    } catch (error) {
      console.error("Retry payment error:", error);
      navigate(`/user/checkout/order-failure/${orderId}`, {
        state: {
          errorMessage:
            error.data?.message || "Failed to retry payment. Please try again.",
          errorCode: "RETRY_PAYMENT_FAILED",
        },
      });
    }
  };

  const continueShopping = () => {
    navigate("/shop");
  };

  const cancelOrder = () => {
    navigate("/cart");
  };

  const goToContact = () => {
    navigate("/contact");
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center border-b">
          <AnimatedError
            size={80}
            strokeWidth={4}
            color="rgb(220 38 38)"
            withGlow={true}
            glowColor="bg-red-500/20"
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <CardTitle className="text-2xl font-bold text-red-600 mt-4">
              Payment Failed
            </CardTitle>
            <p className="text-gray-500">
              We encountered an issue while processing your payment.
            </p>
          </motion.div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="bg-red-50 p-4 rounded-md flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Error Details</p>
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-4">What Happened?</h3>
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Error Code:</span>
                <span className="font-medium">{errorCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Reference:</span>
                <span>{orderId || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md flex items-start gap-3">
            <RefreshCcw className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">What can you do now?</p>
              <p className="text-sm text-blue-700">
                You can try your payment again, check your payment information,
                cancel the order to return to your cart, continue shopping, or
                contact our customer support team for assistance. No payment has
                been processed for this failed attempt.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t p-6 flex flex-col sm:flex-row gap-4 justify-between">
          <Button variant="outline" onClick={continueShopping}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" onClick={cancelOrder}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel Order
            </Button>
            <Button variant="outline" onClick={goToContact}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            <Button
              onClick={handleRetryPayment}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>
                  Try Again
                  <RefreshCcw className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderFailureComponent;
