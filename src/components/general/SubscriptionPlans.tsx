"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: { monthly: "P0", yearly: "P0" },
    tagline: "Perfect for individuals getting started",
    features: [
      "Create a profile",
      "List up to 5 services",
      "Receive basic bookings",
      "Standard support",
    ],
    popular: true,
  },
  {
    name: "Basic",
    price: { monthly: "P99 / month", yearly: "P950 / year" },
    tagline: "For professionals who want to grow",
    features: [
      "Unlimited services",
      "Priority listing & visibility",
      "Unlimited bookings",
      "Priority support",
      "Access to provider dashboard",
    ],
  },
];

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const router = useRouter();

  const handleSelect = (planName: string) => {
    setSelectedPlan(planName);
    router.push(
      `/signup?plan=${encodeURIComponent(planName)}&billing=${billingCycle}`
    );
  };

  return (
    <section
      id="plans"
      className="py-20 px-6 text-center bg-gradient-to-b from-gray-50 to-white"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-6">
        Subscription Plans
      </h2>
      <p className="text-gray-600 max-w-xl mx-auto mb-8">
        Choose the plan that fits your business needs. You can upgrade anytime.
      </p>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center items-center gap-4 mb-12">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition ${
            billingCycle === "monthly"
              ? "bg-pink-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setBillingCycle("monthly")}
        >
          Monthly
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition relative ${
            billingCycle === "yearly"
              ? "bg-pink-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setBillingCycle("yearly")}
        >
          Yearly
          <span className="absolute -top-3 right-0 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
            Save 20%
          </span>
        </button>
      </div>

      {/* Plans */}
      <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative rounded-2xl shadow-lg p-6 transition-all duration-300 ${
              plan.popular
                ? "border-2 border-pink-500 bg-gradient-to-br from-white to-pink-50 shadow-pink-100"
                : "border border-gray-200 bg-white"
            } ${
              selectedPlan === plan.name
                ? "ring-4 ring-purple-400 scale-105"
                : "hover:scale-105 hover:shadow-2xl"
            }`}
          >
            {plan.popular && (
              <span className="absolute top-4 right-4 bg-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow animate-pulse">
                Most Popular
              </span>
            )}

            <CardContent>
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{plan.tagline}</p>
              <p className="text-3xl font-extrabold my-4 text-gray-900">
                {plan.price[billingCycle]}
              </p>
              <ul className="space-y-2 text-gray-600 text-left">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full text-lg py-6"
                onClick={() => handleSelect(plan.name)}
                aria-label={`Select ${plan.name} plan`}
              >
                {plan.name === "Free"
                  ? "Join Free"
                  : billingCycle === "monthly"
                    ? "Upgrade Monthly"
                    : "Upgrade Yearly"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
