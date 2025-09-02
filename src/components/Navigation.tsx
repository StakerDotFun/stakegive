"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { connected, publicKey } = useWallet();
  const pathname = usePathname();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Navigation Bar */}
      <nav
        className={`navbar-glass fixed top-0 left-0 right-0 z-50 ${
          scrolled ? "scrolled" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Name */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/logo-removed-bg.png"
                  alt="StakeGive Logo"
                  width={32}
                  height={32}
                />
                <span className="logo-gradient text-2xl font-black">
                  StakeGive
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/#how-it-works"
                className="nav-link text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 font-medium"
              >
                How it works
              </Link>
              <Link
                href="/#ngos"
                className="nav-link text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 font-medium"
              >
                NGOs
              </Link>
              {/*
              <Link
                href="/#developer-tools"
                className="nav-link text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 font-medium"
              >
                Developer Tools
              </Link>
              */}
              <Link
                href="/#metrics"
                className="nav-link text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 font-medium"
              >
                Metrics
              </Link>

              {/* Dashboard Link - Only show when wallet is connected */}
              {connected && (
                <Link
                  href="/dashboard"
                  className={`nav-link text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 font-medium`}
                >
                  Dashboard
                </Link>
              )}

              {/* Enhanced Wallet Button */}
              <div className="relative">
                <WalletMultiButton className="glass-button !bg-gradient-to-r !from-blue-500 !to-purple-600 hover:!from-blue-600 hover:!to-purple-700 !text-white !font-semibold !py-2 !px-6 !rounded-2xl !transition-all !duration-300 !shadow-lg hover:!shadow-xl hover:!scale-105" />
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`glass-button p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 ${
                  mobileMenuOpen ? "hamburger-open" : ""
                }`}
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1">
                  <div className="hamburger-line w-5 h-0.5 bg-current"></div>
                  <div className="hamburger-line w-5 h-0.5 bg-current"></div>
                  <div className="hamburger-line w-5 h-0.5 bg-current"></div>
                </div>
              </button>
            </div>
          </div>

          {/* Enhanced Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mobile-menu">
              <div className="px-4 pt-4 pb-6 space-y-3">

                {/* Navigation Links */}
                <Link
                  href="/#how-it-works"
                  className="block px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-white/5 rounded-xl transition-all duration-300 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center space-x-3">
                    <span className="text-lg">🔧</span>
                    <span>How it works</span>
                  </span>
                </Link>

                <Link
                  href="/#ngos"
                  className="block px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-white/5 rounded-xl transition-all duration-300 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center space-x-3">
                    <span className="text-lg">🏢</span>
                    <span>NGOs</span>
                  </span>
                </Link>
{/*
                <Link
                  href="/#developer-tools"
                  className="block px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-white/5 rounded-xl transition-all duration-300 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center space-x-3">
                    <span className="text-lg">⚡</span>
                    <span>Developer Tools</span>
                  </span>
                </Link>
*/}
                <Link
                  href="/#metrics"
                  className="block px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-white/5 rounded-xl transition-all duration-300 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center space-x-3">
                    <span className="text-lg">📊</span>
                    <span>Metrics</span>
                  </span>
                </Link>

                {/* Mobile Dashboard Link - Only show when wallet is connected */}
                {connected && (
                  <Link
                    href="/dashboard"
                    className={`block px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                      pathname === '/dashboard'
                        ? 'text-blue-500 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-white/5'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center space-x-3">
                      <span className="text-lg">💻</span>
                      <span className="flex items-center">
                        Dashboard
                      </span>
                    </span>
                  </Link>
                )}

                {/* Mobile Wallet Button */}
                <div className="pt-4 border-t border-white/10">
                  <WalletMultiButton
                    className="glass-button !bg-gradient-to-r !from-blue-500 !to-purple-600 hover:!from-blue-600 hover:!to-purple-700 !text-white !font-semibold !py-3 !px-6 !rounded-2xl !transition-all !duration-300 !w-full !shadow-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}
