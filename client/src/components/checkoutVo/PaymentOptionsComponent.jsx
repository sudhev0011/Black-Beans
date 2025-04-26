import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  Wallet,
  Landmark,
  AlertCircle,
  CheckCircle,
  ViewIcon as VisaIcon,
  BadgePlusIcon as MastercardIcon,
  CreditCardIcon as AmexIcon,
} from "lucide-react";
import { useGetWalletQuery } from "@/store/api/userApiSlice";

const PaymentOptionsComponent = ({
  selectedPaymentMethod,
  onPaymentSelect,
  onOrderNotesChange,
  orderNotes,
  error,
  cartTotal,
}) => {
  const { data: wallet } = useGetWalletQuery();
  console.log('cfsgaga',cartTotal)

  const paymentMethods = [
    {
      id: "cash-on-delivery",
      name: "Cash on Delivery",
      description: "Pay when you receive your order",
      message: cartTotal > 1000 ? 'COD is not available for this order' : null,
      icon: <Wallet className="h-5 w-5" />,
      disabled: cartTotal > 1000,
    },
    {
      id: "wallet",
      name: "Digital Wallet",
      description: `Balance: ₹${(wallet?.balance || 0).toFixed(2)} ${
        cartTotal && (wallet?.balance || 0) < cartTotal ? "(Insufficient)" : ""
      }`,
      icon: <Wallet className="h-5 w-5" />,
      disabled: cartTotal && (wallet?.balance || 0) < cartTotal,
    },
    {
      id: "razorpay",
      name: "Razorpay",
      description: "Pay via Razorpay (Cards, UPI, Netbanking)",
      icon: <CreditCard className="h-5 w-5" />, 
    },
    {
      id: "credit-card",
      name: "Credit/Debit Card",
      description: "Pay securely with your card",
      icon: <CreditCard className="h-5 w-5" />,
      disabled: true
    },
    {
      id: "bank-transfer",
      name: "Bank Transfer",
      description: "Direct bank transfer",
      icon: <Landmark className="h-5 w-5" />,
      disabled:true
    },
  ];

  useEffect(() => {
    if (!selectedPaymentMethod && paymentMethods.length > 0) {
      const defaultMethod = paymentMethods.find((m) => !m.disabled) || paymentMethods[3];
      onPaymentSelect(defaultMethod);
    }
  }, [wallet?.balance, cartTotal, selectedPaymentMethod, onPaymentSelect]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <RadioGroup
            value={selectedPaymentMethod?.id}
            onValueChange={(value) => {
              const method = paymentMethods.find((method) => method.id === value);
              if (!method.disabled) {
                onPaymentSelect(method);
              }
            }}
            className="space-y-4"
          >
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`border rounded-lg p-4 transition-all ${
                  selectedPaymentMethod?.id === method.id
                    ? "border-primary bg-primary/5"
                    : method.disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-gray-400"
                }`}
              >
                <div className="flex items-center gap-4">
                  <RadioGroupItem
                    value={method.id}
                    id={`payment-${method.id}`}
                    disabled={method.disabled}
                  />
                  <Label
                    htmlFor={`payment-${method.id}`}
                    className={`flex items-center gap-3 flex-1 ${
                      !method.disabled ? "cursor-pointer" : "cursor-not-allowed"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-primary">
                      {method.icon}
                    </div>
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                      <p className="text-sm text-muted-foreground">{method.message ? method.message : ''}</p>
                    </div>
                  </Label>

                  {selectedPaymentMethod?.id === method.id && !method.disabled && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                </div>

                {/* Credit Card Form */}
                {selectedPaymentMethod?.id === method.id && method.id === "credit-card" && (
                  <div className="mt-4 pl-8">
                    <div className="bg-muted/30 p-4 rounded-md">
                      <div className="flex items-center gap-2 mb-3">
                        <p className="text-sm font-medium">Accepted Cards</p>
                        <div className="flex gap-2">
                          <div className="w-8 h-5 bg-blue-500 rounded flex items-center justify-center text-white">
                            <VisaIcon className="h-3 w-3" />
                          </div>
                          <div className="w-8 h-5 bg-red-500 rounded flex items-center justify-center text-white">
                            <MastercardIcon className="h-3 w-3" />
                          </div>
                          <div className="w-8 h-5 bg-green-500 rounded flex items-center justify-center text-white">
                            <AmexIcon className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Card details will be requested securely at the final step of checkout.
                      </p>
                    </div>
                  </div>
                )}

                {/* Bank Transfer Details */}
                {selectedPaymentMethod?.id === method.id && method.id === "bank-transfer" && (
                  <div className="mt-4 pl-8">
                    <div className="bg-muted/30 p-4 rounded-md">
                      <p className="text-sm font-medium mb-2">Bank Account Details:</p>
                      <div className="text-sm space-y-1 text-muted-foreground">
                        <p>Bank: National Bank</p>
                        <p>Account Name: ACME Store</p>
                        <p>Account Number: XXXX-XXXX-XXXX-1234</p>
                        <p>Reference: Your order number will be provided after placing order</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cash on Delivery Notice */}
                {selectedPaymentMethod?.id === method.id && method.id === "cash-on-delivery" && (
                  <div className="mt-4 pl-8">
                    <div className="bg-muted/30 p-4 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Please have the exact amount ready at the time of delivery. Our delivery
                        personnel may not carry change.
                      </p>
                    </div>
                  </div>
                )}

                {/* Razorpay Notice */}
                {selectedPaymentMethod?.id === method.id && method.id === "razorpay" && (
                  <div className="mt-4 pl-8">
                    <div className="bg-muted/30 p-4 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Pay securely via Razorpay with options including Credit/Debit Cards, UPI,
                        Netbanking, and more.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Order Notes (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Textarea
            placeholder="Add any special instructions or delivery notes here..."
            value={orderNotes}
            onChange={(e) => onOrderNotesChange(e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentOptionsComponent;