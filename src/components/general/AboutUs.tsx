import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { FaWhatsapp } from "react-icons/fa";
import Image from "next/image";

export default function AboutUs() {
  return (
    <section className="py-24 relative" id="about-us">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side images */}
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-6 lg:order-first order-last">
            <div className="pt-24 flex justify-start sm:justify-end">
              <Image
                src="/assets/hair.png.jpg"
                alt="Hair styling"
                width={400}
                height={400}
                className="rounded-xl object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <Image
              src="/assets/nails.png"
              alt="Nail styling"
              width={400}
              height={400}
              className="rounded-xl object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Right side content */}
          <div className="flex flex-col justify-center items-start gap-10">
            <div className="flex flex-col gap-6">
              <h2 className="text-gray-900 text-4xl font-bold leading-tight">
                Why Choose <span className="text-pink-600">GlamLink?</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                GlamLink connects beauty service providers with customers
                seamlessly. Manage appointments, view services, and grow your
                business effortlessly. Perfect for independent stylists or
                full-scale salons.
              </p>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 grid-cols-1 gap-6 w-full">
              <div className="flex flex-col gap-2">
                <h3 className="text-pink-600 font-semibold text-xl">
                  Easy Bookings
                </h3>
                <p className="text-gray-600 text-base">
                  Confirm client appointments quickly and efficiently.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-pink-600 font-semibold text-xl">
                  Smart Dashboard
                </h3>
                <p className="text-gray-600 text-base">
                  Track services, bookings, and client activity at a glance.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-pink-600 font-semibold text-xl">
                  Stay Connected
                </h3>
                <p className="text-gray-600 text-base">
                  Chat with clients directly via WhatsApp for seamless
                  communication.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-6 flex gap-4 flex-wrap">
              <a
                href="/signup"
                className="inline-flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-all"
              >
                Get Started
                <ArrowRightIcon className="w-5 h-5" />
              </a>

              {/* WhatsApp Chat Button */}
              <a
                href="https://wa.me/26773749465"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-all"
              >
                <FaWhatsapp className="w-5 h-5" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
