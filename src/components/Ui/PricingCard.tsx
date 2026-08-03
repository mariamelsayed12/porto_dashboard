import { useState, useEffect } from "react";

// ─── PricingRow ────────────────────────────────────────────────────────────────

function PricingRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between w-full">
      <p className="font-poppins font-normal text-[16px] text-text-darker">
        {label}
      </p>
      <p className="font-poppins font-medium text-[19px] text-text-secondary">
        {value}
      </p>
    </div>
  );
}

// ─── PricingCard Props ────────────────────────────────────────────────────────

interface PricingData {
  totalPrice?: string;
  downPayment?: string;
  monthlyInstallment?: string;
  installmentPeriod?: string;
  cashPrice?: string;
}

interface PricingCardProps {
  pricing: PricingData;
  paymentType?: string;
}

// ─── PricingCard ──────────────────────────────────────────────────────────────

export default function PricingCard({ pricing, paymentType }: PricingCardProps) {
  const type = (paymentType || "both").toLowerCase();
  const isBoth = type.includes("both");
  const isCash = type.includes("cash") && !isBoth;

  const initialMode = isCash ? "cash" : "installment";
  const [activeMode, setActiveMode] = useState<"installment" | "cash">(initialMode);

  useEffect(() => {
    setActiveMode(isCash ? "cash" : "installment");
  }, [paymentType, isCash]);

  return (
    <div className="bg-white border border-border rounded-md p-6 flex flex-col gap-4 w-full">

      {/* Header: "Pricing" + switcher */}
      <div className="flex items-center justify-between w-full">
        <p className="font-poppins font-medium text-[23px] text-text-secondary leading-none whitespace-nowrap">
          Pricing
        </p>

        {/* Installment / Cash switcher */}
        {isBoth && (
          <div className="flex items-center border border-border rounded-md overflow-hidden h-8">
            <button
              onClick={() => setActiveMode("installment")}
              className={`h-8 px-3 font-poppins font-medium text-[16px] transition-colors duration-150 whitespace-nowrap ${
                activeMode === "installment"
                  ? "bg-light-gray text-text-secondary"
                  : "bg-white text-text-secondary hover:bg-light-gray"
              }`}
            >
              Installment
            </button>
            <button
              onClick={() => setActiveMode("cash")}
              className={`h-8 px-3 font-poppins font-medium text-[16px] transition-colors duration-150 whitespace-nowrap ${
                activeMode === "cash"
                  ? "bg-light-gray text-text-secondary"
                  : "bg-white text-text-secondary hover:bg-light-gray"
              }`}
            >
              Cash
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-border" />

      {/* Pricing rows */}
      {activeMode === "installment" ? (
        <div className="flex flex-col gap-4">
          <PricingRow label="Total Price" value={pricing.totalPrice} />
          <PricingRow label="Down payment" value={pricing.downPayment} />
          <PricingRow label="Monthly installment" value={pricing.monthlyInstallment} />
          <PricingRow label="Installment period" value={pricing.installmentPeriod} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <PricingRow
            label="Cash Price"
            value={pricing.cashPrice || pricing.totalPrice}
          />
        </div>
      )}
    </div>
  );
}
