"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "How to create an account?",
    answer:
      "To create an account, click the 'Sign up' button, fill out the registration form, and then log in to start using the platform.",
  },
  {
    question: "Have any trust issue?",
    answer:
      "We prioritize building a secure and user-friendly platform, allowing you to manage services, bookings, and marketing confidently.",
  },
  {
    question: "What is the payment process?",
    answer:
      "Payments can be made securely using credit cards, PayPal, or bank transfers. You’ll receive confirmation once the transaction completes.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-gray-50" id="questions">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Image */}
          <div className="w-full lg:w-1/2">
            <Image
              src="/assets/cut.png"
              alt="FAQ section"
              width={600}
              height={400}
              className="w-full rounded-xl shadow-lg object-cover"
            />
          </div>

          {/* Right FAQ Section */}
          <div className="w-full lg:w-1/2">
            <div className="lg:max-w-xl">
              <div className="mb-12 text-center lg:text-left">
                <h6 className="text-lg font-medium text-indigo-600 mb-2">
                  FAQs
                </h6>
                <h2 className="text-4xl font-bold text-gray-900 leading-snug">
                  Looking for answers?
                </h2>
              </div>

              <div className="flex flex-col divide-y divide-gray-200">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    className="py-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <button
                      className="w-full flex justify-between items-center text-left text-xl font-medium leading-8 text-gray-700 transition-colors duration-300 hover:text-indigo-600"
                      onClick={() =>
                        setOpenIndex(openIndex === index ? null : index)
                      }
                    >
                      <span>{faq.question}</span>
                      <ChevronDownIcon
                        className={`w-6 h-6 transform transition-transform duration-300 ${
                          openIndex === index
                            ? "rotate-180 text-indigo-600"
                            : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {openIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-3 pr-4 text-gray-600 text-base"
                        >
                          {faq.answer}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
