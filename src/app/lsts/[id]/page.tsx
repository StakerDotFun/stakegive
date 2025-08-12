"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { lstApi } from "../../../lib/api";
import { LST } from "../../../types";
import StakeSection from "../../../components/StakeSection";
import LSTCard from "../../../components/LSTCard";

export default function LSTDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lst, setLst] = useState<LST | null>(null);
  const [relatedLSTs, setRelatedLSTs] = useState<LST[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLST = async () => {
      if (!params.id) return;

      try {
        setError(null);
        const lstData = await lstApi.getById(params.id as string);
        setLst(lstData);

        // Fetch related LSTs of the same category
        const allLSTs = await lstApi.getApproved();
        const related = allLSTs
          .filter(
            (l) => l._id !== lstData._id && l.category === lstData.category
          )
          .slice(0, 4); // Get max 4 related LSTs
        setRelatedLSTs(related);
      } catch (error: any) {
        console.error("Error fetching LST:", error);
        setError(error.response?.data?.message || "Failed to load LST details");
      } finally {
        setLoading(false);
      }
    };

    fetchLST();
  }, [params.id]);

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          </svg>
        );
      case "instagram":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        );
      case "facebook":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      case "linkedin":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 10-4.063 0 2.062 2.062 0 004.063 0zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="relative h-16 w-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-gray-700"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 dark:border-blue-500 border-t-transparent absolute inset-0 m-auto"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading LST details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !lst) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md p-6 glass-card rounded-2xl">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            LST Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error || "The LST you are looking for does not exist."}
          </p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        {/* Back Button */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 fade-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium hover-lift"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to LSTs
            </button>
          </div>
        </div>

        {/* Hero Section with Large Image and Compact Stake Section */}
        <div className="relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
              {/* Left: Large Image (4/7 width) */}
              <div className="lg:col-span-4">
                <div
                  className="relative w-full slide-in-left delay-200"
                  style={{ aspectRatio: "16/9" }}
                >
                  {lst.image ? (
                    <img
                      src={lst.image}
                      alt={lst.name}
                      className="w-full h-full object-cover rounded-2xl shadow-2xl hover-lift"
                      style={{ minHeight: "400px" }}
                    />
                  ) : (
                    <div
                      className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl shadow-2xl flex items-center justify-center hover-lift"
                      style={{ minHeight: "400px" }}
                    >
                      <div className="text-center">
                        <svg
                          className="w-24 h-24 text-blue-400 dark:text-blue-300 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-xl text-blue-600 dark:text-blue-300 font-medium">
                          No Image Available
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Description Section */}
                  <div className="bg-white dark:bg-gray-800 mt-10 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 slide-in-up delay-400">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      About This Cause
                    </h2>
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
                        {lst.description}
                      </p>
                    </div>
                  </div>

                  {/* LST Information */}
                  <div className="bg-white dark:bg-gray-800 mt-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 slide-in-up delay-500">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                      LST Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="hover-lift">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                            Category
                          </label>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {lst.category === "Other"
                              ? lst.customCategory
                              : lst.category}
                          </p>
                        </div>
                        <div className="hover-lift">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                            Validator Address
                          </label>
                          <p className="font-mono text-sm text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 p-2 rounded break-all">
                            {lst.validator}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="hover-lift">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                            Created
                          </label>
                          <p className="text-gray-900 dark:text-white">
                            {new Date(lst.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-white dark:bg-gray-800 mt-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 slide-in-up delay-600">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center hover-lift">
                        <svg
                          className="w-5 h-5 text-gray-400 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <a
                          href={`mailto:${lst.contactEmail}`}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
                        >
                          {lst.contactEmail}
                        </a>
                      </div>

                      {lst.website && (
                        <div className="flex items-center hover-lift">
                          <svg
                            className="w-5 h-5 text-gray-400 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                            />
                          </svg>
                          <a
                            href={lst.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Compact Stake Section (3/7 width) */}
              <div className="lg:col-span-3">
                <div className="sticky top-24">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 slide-in-right delay-300">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-bold pt-8 text-gray-900 dark:text-gray-300 mb-1 line-clamp-1 hover:text-blue-600 transition-colors">
                        {lst.name}
                        {lst.ticker && (
                          <span className="ml-2 text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            {lst.ticker}
                          </span>
                        )}
                      </h3>
                      <p className="text-lg text-blue-600 dark:text-blue-400 font-semibold mb-3">
                        by {lst.ngoName}
                      </p>
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                        <div className="w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        Active LST
                      </div>
                    </div>

                    {/* Compact Stake Section */}
                    <StakeSection lst={lst} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Below Image */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-8">
              {/* Social Media Links */}
              {(lst.socialHandles?.twitter ||
                lst.socialHandles?.instagram ||
                lst.socialHandles?.facebook ||
                lst.socialHandles?.linkedin) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 ml-15 slide-in-up delay-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Follow Us
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {lst.socialHandles?.twitter && (
                      <a
                        href={`https://twitter.com/${lst.socialHandles.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium hover-lift"
                      >
                        {getSocialIcon("twitter")}
                        <span className="ml-2">Twitter</span>
                      </a>
                    )}
                    {lst.socialHandles?.instagram && (
                      <a
                        href={`https://instagram.com/${lst.socialHandles.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center px-4 py-3 bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors font-medium hover-lift"
                      >
                        {getSocialIcon("instagram")}
                        <span className="ml-2">Instagram</span>
                      </a>
                    )}
                    {lst.socialHandles?.facebook && (
                      <a
                        href={
                          lst.socialHandles.facebook.startsWith("http")
                            ? lst.socialHandles.facebook
                            : `https://facebook.com/${lst.socialHandles.facebook}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium hover-lift"
                      >
                        {getSocialIcon("facebook")}
                        <span className="ml-2">Facebook</span>
                      </a>
                    )}
                    {lst.socialHandles?.linkedin && (
                      <a
                        href={
                          lst.socialHandles.linkedin.startsWith("http")
                            ? lst.socialHandles.linkedin
                            : `https://linkedin.com/company/${lst.socialHandles.linkedin}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium hover-lift"
                      >
                        {getSocialIcon("linkedin")}
                        <span className="ml-2">LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Empty space to maintain layout balance */}
            <div className="lg:col-span-1">
              {/* This space intentionally left empty to maintain the 3:1 ratio */}
            </div>
          </div>
        </div>

        {/* Related LSTs Section */}
        {relatedLSTs.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800/50 py-16 slide-in-up delay-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 fade-in delay-400">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  You can also donate in{" "}
                  <span className="text-blue-600 dark:text-blue-400">
                    {lst.category}
                  </span>{" "}
                  Category
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Discover other verified NGOs working in the same category
                </p>
              </div>

              <div className="relative">
                {/* Gradient fade on edges */}
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 dark:from-gray-800/50 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 dark:from-gray-800/50 to-transparent z-10 pointer-events-none"></div>

                {/* Draggable LST cards container */}
                <div
                  className="flex gap-6 overflow-x-auto px-6 pb-4 cursor-grab active:cursor-grabbing select-none"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch",
                  }}
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

                    // Touch events for mobile
                    const handleTouchStart = (e: TouchEvent) => {
                      isDown = true;
                      const touch = e.touches[0];
                      startX = touch.pageX - container.offsetLeft;
                      scrollLeft = container.scrollLeft;
                    };

                    const handleTouchMove = (e: TouchEvent) => {
                      if (!isDown) return;
                      const touch = e.touches[0];
                      const x = touch.pageX - container.offsetLeft;
                      const walk = (x - startX) * 2;
                      container.scrollLeft = scrollLeft - walk;
                    };

                    const handleTouchEnd = () => {
                      isDown = false;
                    };

                    // Add event listeners
                    container.addEventListener("mousedown", handleMouseDown);
                    container.addEventListener("mouseleave", handleMouseLeave);
                    container.addEventListener("mouseup", handleMouseUp);
                    container.addEventListener("mousemove", handleMouseMove);
                    container.addEventListener("touchstart", handleTouchStart);
                    container.addEventListener("touchmove", handleTouchMove);
                    container.addEventListener("touchend", handleTouchEnd);

                    // Cleanup function
                    const cleanup = () => {
                      container.removeEventListener(
                        "mousedown",
                        handleMouseDown
                      );
                      container.removeEventListener(
                        "mouseleave",
                        handleMouseLeave
                      );
                      container.removeEventListener("mouseup", handleMouseUp);
                      container.removeEventListener(
                        "mousemove",
                        handleMouseMove
                      );
                      container.removeEventListener(
                        "touchstart",
                        handleTouchStart
                      );
                      container.removeEventListener(
                        "touchmove",
                        handleTouchMove
                      );
                      container.removeEventListener("touchend", handleTouchEnd);
                    };

                    // Store cleanup function for later use
                    (container as any).dragCleanup = cleanup;

                    return cleanup;
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
                      container.removeEventListener(
                        "touchmove",
                        handleTouchMove
                      );
                      container.removeEventListener("touchend", handleTouchEnd);
                    };

                    container.addEventListener("touchmove", handleTouchMove, {
                      passive: true,
                    });
                    container.addEventListener("touchend", handleTouchEnd);
                  }}
                >
                  {relatedLSTs.map((relatedLst, index) => (
                    <div
                      key={relatedLst._id}
                      className={`scale-in delay-${
                        (index + 1) * 100 + 500
                      } hover-lift flex-shrink-0 transition-transform duration-200`}
                      style={{
                        animationDelay: `${index * 0.1 + 0.8}s`,
                      }}
                      onMouseDown={(e) => e.preventDefault()} // Prevent text selection on drag
                    >
                      <LSTCard lst={relatedLst} />
                    </div>
                  ))}
                </div>

                {/* Optional: Add drag hint for related LSTs */}
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16l-4-4m0 0l4-4m-4 4h18"
                      />
                    </svg>
                    Drag to explore related LSTs
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
