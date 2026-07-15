import { useState } from "react";

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
  rentalYield?: string;
  cashPrice?: string;
}

interface PricingCardProps {
  pricing: PricingData;
}

// ─── PricingCard ──────────────────────────────────────────────────────────────

export default function PricingCard({ pricing }: PricingCardProps) {
  const [mode, setMode] = useState<"installment" | "cash">("installment");

  return (
    <div className="bg-white border border-border rounded-md p-6 flex flex-col gap-4 w-full">

      {/* Header: "Pricing" + switcher */}
      <div className="flex items-center justify-between w-full">
        <p className="font-poppins font-medium text-[23px] text-text-secondary leading-none whitespace-nowrap">
          Pricing
        </p>

        {/* Installment / Cash switcher */}
        <div className="flex items-center border border-border rounded-md overflow-hidden h-8">
          <button
            onClick={() => setMode("installment")}
            className={`h-8 px-3 font-poppins font-medium text-[16px] transition-colors duration-150 whitespace-nowrap ${
              mode === "installment"
                ? "bg-light-gray text-text-secondary"
                : "bg-white text-text-secondary hover:bg-light-gray"
            }`}
          >
            Installment
          </button>
          <button
            onClick={() => setMode("cash")}
            className={`h-8 px-3 font-poppins font-medium text-[16px] transition-colors duration-150 whitespace-nowrap ${
              mode === "cash"
                ? "bg-light-gray text-text-secondary"
                : "bg-white text-text-secondary hover:bg-light-gray"
            }`}
          >
            Cash
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-border" />

      {/* Pricing rows */}
      {mode === "installment" ? (
        <div className="flex flex-col gap-4">
          <PricingRow label="Total Price" value={pricing.totalPrice} />
          <PricingRow label="Down payment" value={pricing.downPayment} />
          <PricingRow label="Monthly installment" value={pricing.monthlyInstallment} />
          <PricingRow label="Installment period" value={pricing.installmentPeriod} />
          <PricingRow label="Rental yield" value={pricing.rentalYield} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <PricingRow
            label="Cash Price"
            value={pricing.cashPrice || pricing.totalPrice}
          />
          <PricingRow label="Rental yield" value={pricing.rentalYield} />
        </div>
      )}
    </div>
  );
}
