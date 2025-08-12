import Link from "next/link";
import { LST } from "../types";
import { useRouter } from "next/navigation";

interface LSTCardProps {
  lst: LST;
  showStatus?: boolean;
}

export default function LSTCard({ lst, showStatus = false }: LSTCardProps) {
  const router = useRouter();

  const handleStakeClick = () => {
    router.push(`/lsts/${lst._id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          </svg>
        );
      case "instagram":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        );
      case "facebook":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      case "linkedin":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>

      {/* Enhanced LST Card with fixed height and sticky footer */}
      <div className="lst-card glass-card-lst rounded-2xl overflow-hidden w-80 max-h-110 flex-shrink-0 relative flex flex-col">

        {/* Enhanced Image Section - Fixed */}
        <div
          className="image-container relative h-48 cursor-pointer group flex-shrink-0"
          onClick={handleStakeClick}
        >
          {lst.image ? (
            <img
              src={lst.image}
              alt={lst.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <svg
                    className="w-8 h-8 text-blue-400"
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
                </div>
                <p className="text-sm text-blue-400 font-medium">
                  No Image Available
                </p>
              </div>
            </div>
          )}

          {/* Subtle Gradient Overlay */}
          <div className="image-overlay"></div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <div className="text-white text-center transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <p className="text-sm font-semibold">View Details</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Section with Hidden Scrollbar */}
        <div className="flex-1 overflow-y-auto scrollable-content">
          <div className="px-6 pt-6 pb-4 space-y-4">
            {/* Header Section */}
            <Link href={`/lst/${lst._id}`} className="block mb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-300 mb-1 line-clamp-1 hover:text-blue-600 transition-colors">
                {lst.name}
                {lst.ticker && (
                  <span className="ml-2 text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {lst.ticker}
                  </span>
                )}
              </h3>
              <p className="text-sm text-blue-600 font-medium">{lst.ngoName}</p>
            </Link>

            {/* Description - Limited to 2 lines */}
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2">
              {lst.description}
            </p>
          </div>
        </div>

        {/* Sticky Footer with Social Links and Action Button */}
        <div className="sticky-footer px-6 py-4 flex-shrink-0">
          {/* Social Media & Website */}
          <div className="flex items-center justify-between mb-4">
            {/* Social Links */}
            <div className="flex space-x-1">
              {lst.socialHandles?.twitter && (
                <a
                  href={`https://twitter.com/${lst.socialHandles.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="social-icon text-gray-400 hover:text-blue-500 transition-all duration-300 hover:bg-blue-500/10"
                >
                  {getSocialIcon("twitter")}
                </a>
              )}
              {lst.socialHandles?.instagram && (
                <a
                  href={`https://instagram.com/${lst.socialHandles.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="social-icon text-gray-400 hover:text-pink-500 transition-all duration-300 hover:bg-pink-500/10"
                >
                  {getSocialIcon("instagram")}
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
                  onClick={(e) => e.stopPropagation()}
                  className="social-icon text-gray-400 hover:text-blue-600 transition-all duration-300 hover:bg-blue-600/10"
                >
                  {getSocialIcon("facebook")}
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
                  onClick={(e) => e.stopPropagation()}
                  className="social-icon text-gray-400 hover:text-blue-700 transition-all duration-300 hover:bg-blue-700/10"
                >
                  {getSocialIcon("linkedin")}
                </a>
              )}
            </div>

            {/* Website Link */}
            {lst.website && (
              <a
                href={lst.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center text-blue-500 hover:text-blue-600 text-sm font-medium transition-all duration-300 hover:scale-105"
              >
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Website
              </a>
            )}
          </div>

          {/* Action Button */}
          {lst.status === "approved" ? (
            <button
              onClick={handleStakeClick}
              className="gradient-button w-full text-white py-3 px-6 rounded-2xl font-semibold text-sm shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center justify-center">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Stake & Support
              </span>
            </button>
          ) : lst.adminNotes ? (
            <div className="info-pill border border-amber-200/30 rounded-2xl p-3">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <span className="font-semibold">Admin:</span> {lst.adminNotes}
              </p>
            </div>
          ) : (
            <div className="info-pill border border-blue-200/30 rounded-2xl p-3 text-center">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Pending Review
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
