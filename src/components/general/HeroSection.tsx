import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function HeroSection() {
  return (
    <section className="relative flex items-center justify-center text-center px-6 py-24 h-[90vh] md:h-screen overflow-hidden">
      {/* Background Image */}
      <Image
        src="/assets/Bg.png"
        alt="GlamLink Hero"
        fill
        priority
        className="absolute inset-0 object-cover"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70"></div>

      {/* Text Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10 rounded-2xl bg-black/40 backdrop-blur-md shadow-lg">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          GlamLink connects <br />
          <span className="text-pink-400">
            beauty service providers to customers effortlessly
          </span>
        </h1>

        <p className="text-base md:text-lg text-gray-200 mb-10 leading-relaxed">
          From Spas, Salons, and many other beauty services, we cater for all.
          Our WhatsApp-based booking tool streamlines appointments and payments,
          letting customers browse and choose from multiple providers in their
          area.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/signup"
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-full font-semibold shadow-md transition-transform transform hover:scale-105"
          >
            Get Started
          </Link>
          <Link
            href="#about-us"
            className="border border-white/80 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-transform transform hover:scale-105"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 w-full flex justify-center">
        <a href="#about-us" className="animate-bounce text-white">
          <ChevronDownIcon className="w-8 h-8" />
        </a>
      </div>
    </section>
  );
}
