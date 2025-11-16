"use client";

import { memo } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface WelcomeBannerProps {
  userName?: string | null;
  subtitle?: string;
  imageSrc?: string;
  className?: string;
}

const WelcomeBanner = memo(function WelcomeBanner({
  userName,
  subtitle = "Empowering your glow, one booking at a time.",
  imageSrc = "/assets/banner-1.png",
  className,
}: WelcomeBannerProps) {
  const displayName =
    userName && userName.trim().length > 0 ? userName.trim() : "there";

  return (
    <div
      className={cn(
        "relative mb-6 w-full overflow-hidden rounded-2xl shadow",
        "h-56 sm:h-64 md:h-72",
        className
      )}
    >
      <Image
        src={imageSrc}
        alt="GlamLink welcome banner"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-pink-700/65 via-purple-600/60 to-pink-500/55" />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center text-white">
        <h2 className="flex items-center justify-center gap-2 text-2xl font-semibold sm:text-3xl md:text-4xl">
          Welcome back, {displayName}
          <Sparkles className="h-6 w-6 text-yellow-300" />
        </h2>
        <p className="mt-3 max-w-xl text-sm font-medium text-pink-100 sm:text-base md:text-lg">
          {subtitle}
        </p>
      </div>
    </div>
  );
});

export { WelcomeBanner };
