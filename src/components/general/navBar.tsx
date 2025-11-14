"use client";
import { useState, useEffect } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = () => setIsOpen(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 w-full z-50 backdrop-blur-md transition-all duration-500 ${
        isScrolled
          ? "bg-gradient-to-r from-pink-600/90 via-purple-600/90 to-pink-500/90 shadow-lg"
          : "bg-pink-500/80"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between py-4">
          {/* Logo and Mobile Toggle */}
          <div className="flex w-full justify-between items-center lg:w-auto">
            <a href="/" className="flex items-center gap-2 group">
              <img
                src="/assets/logo.png"
                alt="GlamLink Logo"
                className="h-14 w-auto transition-transform duration-300 group-hover:scale-110 drop-shadow-lg"
              />
              <span className="text-white font-bold text-xl tracking-wide drop-shadow-sm">
                GlamLink
              </span>
            </a>

            {/* Hamburger Menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center p-2 text-white rounded-lg lg:hidden hover:bg-pink-600/40 focus:outline-none focus:ring-2 focus:ring-white transition-all"
            >
              {isOpen ? (
                <XMarkIcon className="w-7 h-7" />
              ) : (
                <Bars3Icon className="w-7 h-7" />
              )}
            </button>
          </div>

          {/* Nav Links */}
          <div
            className={`${isOpen ? "block" : "hidden"} w-full lg:flex lg:items-center lg:pl-12 max-lg:py-4`}
          >
            <ul className="flex flex-col lg:flex-row max-lg:gap-4 mt-4 lg:mt-0 lg:space-x-8">
              {[
                { name: "Home", href: "#" },
                { name: "About Us", href: "#about-us" },
                { name: "Subscription Plans", href: "#plans" },
                { name: "FAQ's", href: "#questions" },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={handleLinkClick}
                    className="relative text-white hover:text-yellow-100 text-base font-medium transition-all duration-300 block
                      after:absolute after:w-0 after:h-[2px] after:bg-white after:left-0 after:-bottom-1 
                      after:transition-all after:duration-300 hover:after:w-full"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            {/* Auth Buttons */}
            <div className="flex flex-col lg:flex-row lg:items-center max-lg:gap-4 lg:ml-auto mt-6 lg:mt-0 space-y-2 lg:space-y-0 lg:space-x-4">
              <a
                href="/login"
                onClick={handleLinkClick}
                className="bg-white/90 text-pink-600 rounded-full font-semibold text-center shadow px-6 py-2 text-sm 
                hover:bg-white hover:shadow-lg hover:scale-105 transition-all"
              >
                Login
              </a>
              <a
                href="/signup"
                onClick={handleLinkClick}
                className="bg-gradient-to-r from-pink-700 via-purple-600 to-pink-500 text-white rounded-full font-semibold text-center shadow px-6 py-2 text-sm 
                hover:shadow-lg hover:scale-105 transition-transform duration-300"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
