"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export default function Tour() {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // For the preview, we want the tour to be open by default.
    // In the real implementation, this would be controlled by localStorage.
    setOpen(true);
  }, []);

  const steps = [
    {
      title: "Welcome to GlamLink!",
      description: "Your all-in-one solution for managing your beauty business.",
      image: "/assets/logo.png",
    },
    {
      title: "Manage Your Services",
      description: "Easily add, edit, and remove the services you offer.",
      image: "/assets/cut.png",
    },
    {
      title: "Schedule Appointments",
      description: "Keep track of your bookings and manage your calendar with ease.",
      image: "/assets/hair.png.jpg",
    },
    {
      title: "Connect with Clients",
      description: "Engage with your clients and build lasting relationships.",
      image: "/assets/nails.png",
    },
  ];

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const onDialogOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setStep(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onDialogOpenChange}>
      <DialogContent
        className={cn(
          "max-w-3xl p-0 overflow-hidden rounded-xl border shadow-2xl",
          "bg-white text-black",
          "dark:bg-black dark:text-white dark:border-neutral-800",
          "data-[state=open]:animate-none data-[state=closed]:animate-none"
        )}
      >
        <div className="flex flex-col md:flex-row w-full h-full">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 p-6 border-r border-gray-200 dark:border-neutral-800">
            <div className="flex flex-col gap-3">
              <Image
                src="/assets/logo.png"
                alt="Logo"
                width={48}
                height={48}
                className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-neutral-800"
                unoptimized
              />
              <h2 className="text-lg font-medium">GlamLink Onboarding</h2>
              <p className="text-sm opacity-80">
                Explore our features step-by-step to get the best out of your experience.
              </p>
              <div className="flex flex-col gap-3 mt-6">
                {steps.map((s, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-2 text-sm transition",
                      index === step
                        ? "font-semibold text-destructive"
                        : "opacity-60 hover:opacity-100"
                    )}
                  >
                    {index < step ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
                    )}
                    <span className="font-normal">{s.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-2/3 p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <DialogHeader>
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={steps[step].title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="text-2xl font-medium"
                  >
                    {steps[step].title}
                  </motion.h2>
                </AnimatePresence>

                <div className="min-h-[60px]">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={steps[step].description}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="text-gray-600 dark:text-gray-400 text-base opacity-90"
                    >
                      {steps[step].description}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </DialogHeader>

              {/* Image */}
              <div className="w-full h-60 bg-gray-100 dark:bg-neutral-900 rounded-lg flex items-center justify-center">
                <img
                  src={steps[step].image}
                  alt="Step Visual"
                  className="h-full object-contain rounded-lg border-4 border-gray-200 dark:border-neutral-800"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-between items-center">
              <DialogClose asChild>
                <Button variant="outline">Skip</Button>
              </DialogClose>

              {step < steps.length - 1 ? (
                <Button variant="outline" onClick={next} className="bg-destructive text-white hover:bg-destructive/90">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <DialogClose asChild>
                  <Button variant="outline" className="bg-destructive text-white hover:bg-destructive/90">Finish</Button>
                </DialogClose>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
