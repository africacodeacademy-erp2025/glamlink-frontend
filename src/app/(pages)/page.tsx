import AboutSection from "@/components/general/AboutUs";
import FAQSection from "@/components/general/AskedQuestions";
import HeroSection from "@/components/general/HeroSection";
import SubscriptionPlans from "@/components/general/SubscriptionPlans";
import React from "react";

export default function page() {
  return (
    <div>
      <HeroSection />
      <AboutSection />
      <SubscriptionPlans />
      <FAQSection />
    </div>
  );
}
