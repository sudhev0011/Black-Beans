import React from "react";
import { ShoppingCart, Package, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const CartLoaderMorph = ({ className }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-40", className)}>
      <div className="relative mb-8">
        {/* The animating container */}
        <div className="w-24 h-24 relative">
          {/* First stage: Cart icon */}
          <div className="absolute inset-0 flex items-center justify-center animate-[morph-stage-1_6s_infinite]">
            <div className="bg-primary/10 p-4 rounded-full">
              <ShoppingCart className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          {/* Second stage: Package icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 animate-[morph-stage-2_6s_infinite]">
            <div className="bg-primary/10 p-4 rounded-full">
              <Package className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          {/* Third stage: Check icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 animate-[morph-stage-3_6s_infinite]">
            <div className="bg-primary/10 p-4 rounded-full">
              <Check className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          {/* Progress circle */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle 
              className="text-muted stroke-current"
              strokeWidth="4"
              fill="transparent"
              r="38"
              cx="50"
              cy="50"
            />
            <circle 
              className="text-primary stroke-current animate-[progress-circle_6s_linear_infinite]"
              strokeWidth="4"
              strokeLinecap="round"
              fill="transparent"
              r="38"
              cx="50"
              cy="50"
              strokeDasharray="239"
              strokeDashoffset="239"
            />
          </svg>
        </div>
      
        {/* Loading text that changes with the stages */}
        <div className="mt-4 text-center relative h-6">
          <p className="absolute inset-0 animate-[text-fade-1_6s_infinite] text-sm font-medium">Adding to cart...</p>
          <p className="absolute inset-0 opacity-0 animate-[text-fade-2_6s_infinite] text-sm font-medium">Processing items...</p>
          <p className="absolute inset-0 opacity-0 animate-[text-fade-3_6s_infinite] text-sm font-medium">Almost ready...</p>
        </div>
      </div>

      {/* Keyframes for animations */}
      <style>{`
        @keyframes morph-stage-1 {
          0%, 25% { opacity: 1; transform: scale(1); }
          30%, 95% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes morph-stage-2 {
          0%, 25% { opacity: 0; transform: scale(0.8); }
          30%, 55% { opacity: 1; transform: scale(1); }
          60%, 100% { opacity: 0; transform: scale(0.8); }
        }
        @keyframes morph-stage-3 {
          0%, 55% { opacity: 0; transform: scale(0.8); }
          60%, 90% { opacity: 1; transform: scale(1); }
          95%, 100% { opacity: 0; transform: scale(0.8); }
        }
        @keyframes text-fade-1 {
          0%, 25% { opacity: 1; }
          30%, 100% { opacity: 0; }
        }
        @keyframes text-fade-2 {
          0%, 25% { opacity: 0; }
          30%, 55% { opacity: 1; }
          60%, 100% { opacity: 0; }
        }
        @keyframes text-fade-3 {
          0%, 55% { opacity: 0; }
          60%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes progress-circle {
          0% { stroke-dashoffset: 239; }
          90% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default CartLoaderMorph;