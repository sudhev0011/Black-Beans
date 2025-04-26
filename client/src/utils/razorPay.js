export const handleRazorpayPayment = async ({
    result,
    user,
    RAZORPAY_KEY_ID,
    verifyPayment,
    onSuccess,
    onError
  }) => {
    const loadRazorpayScript = () => {
      return new Promise((resolve, reject) => {
        if (window.Razorpay) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Razorpay script"));
        document.body.appendChild(script);
      });
    };
  
    await loadRazorpayScript();
  
    const options = {
      key: RAZORPAY_KEY_ID,
      order_id: result.razorpayOrderId,
      amount: result.total * 100,
      currency: "INR",
      name: "Black Beans",
      description: "Order Payment",
      handler: async function (response) {
        try {
          const paymentData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            orderId: result.orderId
          };
          const verificationResult = await verifyPayment(paymentData).unwrap();
  
          if (verificationResult.success) {
            onSuccess(verificationResult.orderId);
          } else {
            onError({ message: "Payment verification failed.", code: "VERIFICATION_FAILED" }, result.orderId);
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          onError({ message: "Failed to verify payment. Please contact support.", code: "VERIFICATION_ERROR" }, result.orderId);
        }
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone || "9999999999",
      },
      theme: {
        color: "#114639",
      },
      modal: {
        ondismiss: function () {
          console.log("Checkout modal closed");
          onError({ message: "Payment was cancelled.", code: "PAYMENT_CANCELLED" }, result.orderId);
        },
      },
    };
  
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  
    razorpay.on("payment.failed", function (response) {
      console.error("Payment Failed:", response.error);
      onError({ 
        message: response.error.description,
        code: response.error.code
      }, result.orderId);
    });
  };