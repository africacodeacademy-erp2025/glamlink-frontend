"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface GlamlinkTourProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showTrigger?: boolean;
}

type TourStep = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
};

export default function GlamlinkTour({
  open,
  onOpenChange,
  showTrigger = false,
}: GlamlinkTourProps) {
  const [step, setStep] = useState(0);

  const steps: TourStep[] = useMemo(
    () => [
      {
        title: "Welcome to GlamLink",
        description:
          "Get an instant overview of your beauty business the moment you sign in. Track performance, bookings, and revenue trends without leaving the dashboard.",
        imageSrc: "/assets/banner-1.png",
        imageAlt: "GlamLink dashboard overview",
      },
      {
        title: "Manage Bookings Effortlessly",
        description:
          "View every appointment in one place, approve requests, and stay ahead with real-time schedule updates tailored for stylists and salon owners.",
        imageSrc: "/assets/banner-2.png",
        imageAlt: "Booking management in GlamLink",
      },
      {
        title: "Showcase Your Signature Services",
        description:
          "Customize your service menu with photos, pricing, and availability so clients can discover exactly what makes your brand shine.",
        imageSrc: "/assets/banner-3.png",
        imageAlt: "Service customization options",
      },
      {
        title: "Delight Clients and Grow",
        description:
          "Build lasting relationships with automated reminders, client profiles, and insights that help you elevate every experience.",
        imageSrc: "/assets/banner-4.png",
        imageAlt: "Happy clients using GlamLink",
      },
    ],
    []
  );

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (value) {
      setStep(0);
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button variant="outline">Start Tour</Button>
        </DialogTrigger>
      ) : null}

      <DialogContent
        className={cn(
          "max-w-[95vw] sm:max-w-2xl md:max-w-3xl p-0 overflow-hidden rounded-lg sm:rounded-xl border shadow-2xl",
          "bg-white text-black",
          "dark:bg-black dark:text-white dark:border-neutral-800",
          "data-[state=open]:animate-none data-[state=closed]:animate-none",
          "max-h-[95vh] tour-scrollbar"
        )}
      >
        <div className="flex h-full w-full flex-col md:flex-row">
          <div className="w-full border-gray-200 p-4 sm:p-5 md:p-6 dark:border-neutral-800 md:w-1/3 md:border-r md:border-b-0 border-b">
            <div className="flex flex-col gap-2 sm:gap-3">
              <Image
                src="/assets/logo.png"
                alt="GlamLink logo"
                width={48}
                height={48}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-4 border-gray-200 bg-white object-contain p-1 dark:border-neutral-800"
                priority
              />
              <h2 className="text-base sm:text-lg font-medium">
                GlamLink Onboarding
              </h2>
              <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
                Take a quick tour to see how GlamLink keeps your bookings,
                services, and clients in sync.
              </p>
              <div className="mt-4 sm:mt-6 flex flex-col gap-2 sm:gap-3">
                {steps.map((s, index) => (
                  <div
                    key={s.title}
                    className={cn(
                      "flex items-center gap-2 text-xs sm:text-sm transition",
                      index === step
                        ? "font-semibold"
                        : "opacity-60 hover:opacity-100"
                    )}
                  >
                    {index < step ? (
                      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-black dark:bg-white/40 flex-shrink-0" />
                    )}
                    <span className="font-normal break-words">{s.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col justify-between p-4 sm:p-6 md:p-8 md:w-2/3">
            <div className="space-y-3 sm:space-y-4">
              <DialogHeader>
                <DialogTitle className="sr-only">
                  GlamLink Guided Tour
                </DialogTitle>
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={steps[step].title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="text-xl sm:text-2xl font-medium leading-tight"
                  >
                    {steps[step].title}
                  </motion.h2>
                </AnimatePresence>

                <div className="min-h-[50px] sm:min-h-[60px]">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={steps[step].description}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="text-sm sm:text-base text-gray-600 opacity-90 dark:text-gray-400 leading-relaxed"
                    >
                      {steps[step].description}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </DialogHeader>

              <div className="flex h-48 sm:h-52 md:h-60 w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-neutral-900">
                <div className="relative h-full w-full overflow-hidden rounded-lg border-2 sm:border-4 border-gray-200 dark:border-neutral-800">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={steps[step].imageSrc}
                      className="relative h-full w-full"
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Image
                        src={steps[step].imageSrc}
                        alt={steps[step].imageAlt}
                        fill
                        className="object-cover"
                        priority={step === 0}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto text-sm sm:text-base"
                >
                  Skip
                </Button>
              </DialogClose>

              {step < steps.length - 1 ? (
                <Button
                  variant="outline"
                  onClick={next}
                  className="w-full sm:w-auto text-sm sm:text-base"
                >
                  Continue
                  <ArrowRight className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              ) : (
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto text-sm sm:text-base"
                  >
                    Finish
                  </Button>
                </DialogClose>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
