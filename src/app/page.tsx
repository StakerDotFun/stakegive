"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import LSTCard from "../components/LSTCard";
import { lstApi, metricsApi } from "../lib/api";
import { LST } from "../types";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Home() {
  const [approvedLSTs, setApprovedLSTs] = useState<LST[]>([]);
  const [filteredLSTs, setFilteredLSTs] = useState<LST[]>([]);
  const [loading, setLoading] = useState(true);
  const { connected, publicKey } = useWallet();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [metrics, setMetrics] = useState({
    lstCount: 0,
    ngoCount: 0,
    totalStaked: 0,
    totalVolume: 0,
    totalUsers: 0,
    transparency: 0,
  });
  const metricsRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [lstMetrics, setLstMetrics] = useState<{ [key: string]: any }>({});

  // Fetch individual LST metrics
  const fetchLSTMetrics = async (lsts: any[]) => {
    try {
      const metricsPromises = lsts.map((lst) =>
        metricsApi.getLSTMetrics(lst._id).catch(() => null)
      );
      const results = await Promise.all(metricsPromises);

      const metricsMap: { [key: string]: any } = {};
      lsts.forEach((lst, index) => {
        if (results[index]) {
          metricsMap[lst._id] = results[index];
        }
      });

      setLstMetrics(metricsMap);
    } catch (error) {
      console.error("Error fetching LST metrics:", error);
    }
  };

  // Fetch LST metrics when approved LSTs are loaded
  useEffect(() => {
    if (approvedLSTs.length > 0) {
      fetchLSTMetrics(approvedLSTs);
    }
  }, [approvedLSTs]);

  // Available categories
  const categories = [
    "All",
    "Education",
    "Healthcare",
    "Environment",
    "Poverty",
    "Disaster Relief",
    "Animal Welfare",
    "Human Rights",
    "Other",
  ];

  // Filter LSTs based on search term and category
  useEffect(() => {
    let filtered = approvedLSTs;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (lst) =>
          lst.category === selectedCategory ||
          (lst.category === "Other" && lst.customCategory === selectedCategory)
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (lst) =>
          lst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lst.ngoName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lst.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLSTs(filtered);
  }, [approvedLSTs, searchTerm, selectedCategory]);

  // Intersection Observer for metrics animation with API integration
  useEffect(() => {
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          try {
            // Fetch real platform metrics from API
            const platformMetrics = await metricsApi.getPlatformMetrics();

            // Use real collective data if available, fallback to LST calculation
            const lstCount = platformMetrics.lstCount || approvedLSTs.length;
            const ngoCount =
              platformMetrics.ngoCount ||
              new Set(approvedLSTs.map((lst) => lst.ngoId || lst.createdBy))
                .size;
            const totalStaked =
              platformMetrics.totalVolume ||
              approvedLSTs.reduce(
                (sum, lst) => sum + (lst.totalStaked || 0),
                0
              );

            // Trigger animations with staggered delays
            setTimeout(
              () => setMetrics((prev) => ({ ...prev, lstCount })),
              200
            );
            setTimeout(
              () => setMetrics((prev) => ({ ...prev, ngoCount })),
              400
            );
            setTimeout(
              () => setMetrics((prev) => ({ ...prev, totalStaked })),
              600
            );
            setTimeout(
              () =>
                setMetrics((prev) => ({
                  ...prev,
                  transparency: platformMetrics.transparency || 100,
                })),
              800
            );
          } catch (error) {
            console.error("Error fetching platform metrics:", error);

            // Fallback to your existing calculation if API fails
            const lstCount = approvedLSTs.length;
            const ngoCount = new Set(
              approvedLSTs.map((lst) => lst.ngoId || lst.createdBy)
            ).size;
            const totalStaked = approvedLSTs.reduce(
              (sum, lst) => sum + (lst.totalStaked || 0),
              0
            );

            setTimeout(
              () => setMetrics((prev) => ({ ...prev, lstCount })),
              200
            );
            setTimeout(
              () => setMetrics((prev) => ({ ...prev, ngoCount })),
              400
            );
            setTimeout(
              () => setMetrics((prev) => ({ ...prev, totalStaked })),
              600
            );
            setTimeout(
              () => setMetrics((prev) => ({ ...prev, transparency: 100 })),
              800
            );
          }
        }
      },
      { threshold: 0.5 }
    );

    if (metricsRef.current) {
      observer.observe(metricsRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, approvedLSTs]);

  useEffect(() => {
    const fetchApprovedLSTs = async () => {
      try {
        const lsts = await lstApi.getApproved();
        setApprovedLSTs(lsts);
        setFilteredLSTs(lsts);
      } catch (error) {
        console.error("Error fetching approved LSTs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedLSTs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      {/* Hero Section - Desktop optimized */}
      <section className="min-h-screen flex items-center justify-center mesh-gradient pt-5">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center -mt-15">
          {/* Left: Content */}
          <div className="space-y-3">
            <h1 className="text-6xl lg:text-7xl font-black leading-tight">
              <span className="text-gray-900 dark:text-white">Stake for a</span>
              <br />
              <span className="gradient-text">Better Future</span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
              Support verified NGOs, earn rewards, and power the charity
              revolution with your crypto.
            </p>

            {/* Feature highlights */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: "🔒", text: "Blockchain Secured" },
                { icon: "💰", text: "Auto Rewards" },
                { icon: "🔍", text: "100% Transparent" },
              ].map((feature, index) => (
                <div key={index} className="glass-card px-4 py-2 rounded-full">
                  <span className="text-sm font-medium">
                    {feature.icon} {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4">
              {/* Start Staking button stays the same */}
              <Link
                href="/wallet-test"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-4 rounded-2xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Start Staking
              </Link>

              {/* This changes depending on wallet connection */}
              {connected ? (
                <Link
                  href="#how-it-works"
                  className="glass-button px-4 py-4 rounded-2xl font-semibold"
                >
                  Learn More
                </Link>
              ) : (
                <WalletMultiButton className="!inline-flex !items-center !justify-center !gap-2 !bg-gradient-to-r !from-blue-500 !to-indigo-600 !text-white !px-7 !py-3.5 !rounded-lg !text-base !font-semibold !shadow-lg hover:!shadow-xl !transition-all" />
              )}
            </div>
          </div>

          {/* Right: Interactive 3D Visual */}
          <div className="relative h-[600px] hidden lg:block">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Central hub */}
              <div className="w-32 h-32 glass-card rounded-full flex items-center justify-center subtle-float">
                <span className="text-4xl">⚡</span>
              </div>

              {/* Orbiting elements */}
              {[
                {
                  icon: "🔗",
                  label: "Blockchain",
                  position: "top-16 left-1/2 -translate-x-1/2",
                },
                {
                  icon: "💎",
                  label: "Staking",
                  position: "right-16 top-1/2 -translate-y-1/2",
                },
                {
                  icon: "🌍",
                  label: "Impact",
                  position: "bottom-16 left-1/2 -translate-x-1/2",
                },
                {
                  icon: "🏢",
                  label: "NGOs",
                  position: "left-16 top-1/2 -translate-y-1/2",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`absolute ${item.position} interactive-card glass-card p-4 rounded-2xl text-center w-24`}
                  style={{ animationDelay: `${index * 0.5}s` }}
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-xs font-medium">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Subtle and Interactive */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6">
              How <span className="gradient-text">StakerFun</span> Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Three simple steps to revolutionize charity through Web3
              technology
            </p>
          </div>

          <div className="responsive-grid">
            {[
              {
                step: "01",
                icon: "🔐",
                title: "Connect Web3 Wallet",
                description:
                  "Securely connect your preferred Web3 wallet to access our decentralized platform",
              },
              {
                step: "02",
                icon: "🎯",
                title: "Choose Verified NGOs",
                description:
                  "Browse blockchain-verified NGOs with transparent impact metrics and real-time tracking",
              },
              {
                step: "03",
                icon: "💰",
                title: "Stake & Earn Impact",
                description:
                  "Stake tokens, earn automated rewards, and create measurable positive change",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="interactive-card glass-card rounded-3xl p-8 text-center"
              >
                <div className="text-5xl mb-6">{item.icon}</div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold">{item.step}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NGOs Section - Original Format */}
      <section id="ngos" className="py-24 bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className="text-5xl font-black mb-4">
              Featured <span className="gradient-text">NGOs</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              Support verified NGOs through blockchain-powered staking and
              transparent impact tracking
            </p>
          </div>

          {/* Search and Filter Section */}
          <section className="py-8 bg-gray-50 dark:bg-black">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search NGOs & LSTs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 md:py-3 text-sm md:text-base bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:outline-none transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`category-button px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        selectedCategory === category ? "active" : ""
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">
                Loading verified NGOs...
              </p>
            </div>
          ) : filteredLSTs.length > 0 ? (
            <div className="relative">
              {/* Gradient fade on edges */}
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 to-transparent dark:from-black z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 to-transparent dark:from-black z-10 pointer-events-none"></div>

              {/* Draggable NGO cards container */}
              <div
                className="ngo-cards-container px-6 cursor-grab active:cursor-grabbing select-none"
                onMouseDown={(e) => {
                  const container = e.currentTarget;
                  let isDown = false;
                  let startX = 0;
                  let scrollLeft = 0;

                  const handleMouseDown = (e: MouseEvent) => {
                    isDown = true;
                    container.classList.add("active:cursor-grabbing");
                    startX = e.pageX - container.offsetLeft;
                    scrollLeft = container.scrollLeft;
                  };

                  const handleMouseLeave = () => {
                    isDown = false;
                    container.classList.remove("active:cursor-grabbing");
                  };

                  const handleMouseUp = () => {
                    isDown = false;
                    container.classList.remove("active:cursor-grabbing");
                  };

                  const handleMouseMove = (e: MouseEvent) => {
                    if (!isDown) return;
                    e.preventDefault();
                    const x = e.pageX - container.offsetLeft;
                    const walk = (x - startX) * 2; // Scroll speed multiplier
                    container.scrollLeft = scrollLeft - walk;
                  };

                  container.addEventListener("mousedown", handleMouseDown);
                  container.addEventListener("mouseleave", handleMouseLeave);
                  container.addEventListener("mouseup", handleMouseUp);
                  container.addEventListener("mousemove", handleMouseMove);

                  return () => {
                    container.removeEventListener("mousedown", handleMouseDown);
                    container.removeEventListener(
                      "mouseleave",
                      handleMouseLeave
                    );
                    container.removeEventListener("mouseup", handleMouseUp);
                    container.removeEventListener("mousemove", handleMouseMove);
                  };
                }}
                onTouchStart={(e) => {
                  const container = e.currentTarget;
                  let startX = 0;
                  let scrollLeft = 0;

                  const touch = e.touches[0];
                  startX = touch.pageX - container.offsetLeft;
                  scrollLeft = container.scrollLeft;

                  const handleTouchMove = (e: TouchEvent) => {
                    const touch = e.touches[0];
                    const x = touch.pageX - container.offsetLeft;
                    const walk = (x - startX) * 1.5; // Scroll speed for touch
                    container.scrollLeft = scrollLeft - walk;
                  };

                  const handleTouchEnd = () => {
                    container.removeEventListener("touchmove", handleTouchMove);
                    container.removeEventListener("touchend", handleTouchEnd);
                  };

                  container.addEventListener("touchmove", handleTouchMove, {
                    passive: true,
                  });
                  container.addEventListener("touchend", handleTouchEnd);
                }}
              >
                {filteredLSTs.map((lst, index) => (
                  <div
                    key={lst._id}
                    className="flex-shrink-0 pt-8 w-80 transition-transform duration-200 hover:scale-105"
                    style={{
                      animationName: "slideInFromLeft",
                      animationDuration: "0.8s",
                      animationTimingFunction: "ease-out",
                      animationFillMode: "forwards",
                      animationDelay: `${index * 0.2}s`,
                    }}
                    onMouseDown={(e) => e.preventDefault()} // Prevent text selection on drag
                  >
                    <LSTCard lst={lst} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-16 text-center max-w-2xl mx-auto">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-3xl font-bold mb-4">No Results Found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                Try adjusting your search terms or category filter
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="glass-button px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition-all duration-300"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* NGOs Section - Reduced Size LST Cards */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6">
              All <span className="gradient-text">NGOs</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              Discover organizations making real impact in communities worldwide
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">
                Loading organizations...
              </p>
            </div>
          ) : filteredLSTs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredLSTs.map((lst, index) => (
                <div
                  key={`reduced-${lst._id}`}
                  className="transform scale-90 hover:scale-95 transition-all duration-300"
                  style={{
                    animationName: "slideInFromLeft",
                    animationDuration: "0.8s",
                    animationTimingFunction: "ease-out",
                    animationFillMode: "forwards",
                    animationDelay: `${index * 0.2}s`,
                  }}
                >
                  <LSTCard lst={lst} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold mb-4">
                No Organizations Found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Try adjusting your search terms or category filter
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Developer Tools - Refined */}
      {/*
      <section
        className="py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black"
        id="developer-tools"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 rounded-full glass-card mb-8">
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                ⚡ For Developers
              </span>
            </div>

            <h2 className="text-5xl font-black mb-6">
              <span className="gradient-text">Developer</span> Toolkit
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Test smart contracts and build the future of decentralized charity
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Link
              href="/wallet-test"
              className="interactive-card glass-card rounded-3xl p-8"
            >
              <div className="flex items-start space-x-6">
                <div className="text-5xl">🔐</div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">
                    Wallet Integration
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Test Web3 wallet connectivity and transaction signing
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/test-contract"
              className="interactive-card glass-card rounded-3xl p-8"
            >
              <div className="flex items-start space-x-6">
                <div className="text-5xl">⚡</div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Smart Contracts</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Interact with StakerFun contracts and test functionality
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Working Performance Metrics - Updated with actual data */}
      <section
        id="metrics"
        className="py-24 bg-white dark:bg-gray-900"
        ref={metricsRef}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6">
              Platform <span className="gradient-text">Metrics</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Real-time performance data powered by blockchain transparency
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                current: metrics.lstCount,
                label: "LSTs Listed",
                icon: "📋",
                color: "from-blue-500 to-purple-600",
                format: (val: number) => `${val}`,
              },
              {
                current: metrics.ngoCount,
                label: "NGOs Onboarded",
                icon: "🏢",
                color: "from-green-500 to-blue-600",
                format: (val: number) => `${val}`,
              },
              {
                current: metrics.totalStaked,
                label: "Total Volume (SOL)",
                icon: "💎",
                color: "from-purple-500 to-pink-600",
                format: (val: number) =>
                  val > 1000000
                    ? `${(val / 1000000).toFixed(1)}M SOL`
                    : val > 1000
                    ? `${(val / 1000).toFixed(1)}K SOL`
                    : `${val.toFixed(1)} SOL`,
              },

              {
                current: metrics.transparency,
                label: "Transparency",
                icon: "🔍",
                color: "from-yellow-500 to-orange-600",
                format: (val: number) => `${val}%`,
              },
            ].map((metric, index) => (
              <div
                key={index}
                className="interactive-card glass-card rounded-3xl p-8 text-center"
              >
                <div className="text-4xl mb-4">{metric.icon}</div>
                <div
                  className={`text-4xl lg:text-5xl font-black mb-2 bg-gradient-to-r ${metric.color} bg-clip-text text-transparent metric-counter`}
                >
                  {metric.format(metric.current)}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {metric.label}
                </div>

                {/* Progress bar - only show for transparency */}
                {metric.label === "Transparency" && (
                  <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${metric.color} transition-all duration-2000 ease-out`}
                      style={{ width: `${metric.current}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Minimal and elegant */}
      <footer className="glass-card border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <Link
                href="/"
                className="text-3xl font-black gradient-text mb-6 block"
              >
                StakerFun
              </Link>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Revolutionizing charity through blockchain technology
              </p>
            </div>

            {[
              {
                title: "Platform",
                links: [
                  { name: "How it works", href: "#how-it-works" },
                  { name: "Browse NGOs", href: "#ngos" },
                  { name: "Get Started", href: "/wallet-test" },
                ],
              },
              {
                title: "Developers",
                links: [
                  { name: "Wallet Test", href: "/wallet-test" },
                  { name: "Smart Contracts", href: "/test-contract" },
                  { name: "Documentation", href: "#" },
                ],
              },
              {
                title: "Support",
                links: [
                  { name: "Help Center", href: "#" },
                  { name: "Contact", href: "#" },
                  { name: "Privacy", href: "#" },
                ],
              },
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-bold mb-6">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <ThemeSwitcher />
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              © 2025 StakerFun. Built for a decentralized future.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
