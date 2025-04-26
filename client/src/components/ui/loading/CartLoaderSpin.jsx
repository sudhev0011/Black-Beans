import React from "react";
import { ShoppingCart, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const CartLoaderSpin = ({ className }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <div className="relative mb-4">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent"></div>
        <ShoppingCart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
      </div>
      
      <div className="flex items-center justify-center space-x-4 mt-2">
        <Package className="h-5 w-5 text-muted-foreground animate-bounce" />
        <span className="text-sm font-medium">Preparing your cart</span>
        <Package className="h-5 w-5 text-muted-foreground animate-bounce [animation-delay:0.3s]" />
      </div>
      
      <div className="mt-6 flex space-x-1">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:0.2s]"></div>
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:0.4s]"></div>
      </div>
    </div>
  );
};

export default CartLoaderSpin;
