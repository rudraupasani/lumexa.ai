import React, { useState } from "react";
import { X, ExternalLink } from "lucide-react";

const Images = ({ images = [] }) => {
  const [activeImage, setActiveImage] = useState(null);
  const [showAll, setShowAll] = useState(false);

  if (!images.length) return null;

  const visibleImages = showAll ? images : images.slice(0, 5);

  return (
    <>
      <div className="w-full">
        {/* Image grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {visibleImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(img)}
              className="group relative w-full
                         bg-[#0f172a]
                         rounded-xl
                         border border-slate-800
                         overflow-hidden
                         hover:border-slate-600
                         transition"
            >
              <img
                src={img}
                alt=""
                loading="lazy"
                className="w-full h-30 object-cover
                           transition-transform duration-300
                           group-hover:scale-105"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0
                              group-hover:opacity-100 transition
                              flex items-center justify-center">
                <div className="flex items-center gap-1 text-xs text-white">
                  <ExternalLink size={14} />
                  View
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Show more / less */}
        {images.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-4 cursor-pointer text-sm text-blue-400 hover:text-blue-300 transition
                       bg-transparent border-none outline-none"
          >
            {showAll ? "Show less" : `Show ${images.length - 5} more images`}
          </button>
        )}
      </div>

      {/* Fullscreen image viewer */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md
                     flex items-center justify-center px-4"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-red-400 transition"
            >
              <X size={28} />
            </button>

            <img
              src={activeImage}
              alt=""
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Images;
