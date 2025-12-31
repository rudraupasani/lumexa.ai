import React, { useState } from "react";
import { ExternalLink } from "lucide-react";

const Links = ({ data = [] }) => {
  const [showAll, setShowAll] = useState(false);

  if (!data.length) return null;

  const visibleData = showAll ? data : data.slice(0, 3); // 2 rows (3x2)

  return (
    <div className="w-full py-4">
      {/* Grid list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visibleData.map((item, index) => (
          <a
            key={index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full
                       bg-[#0f172a]
                       rounded-xl
                       border border-slate-800
                       px-4 py-3
                       hover:border-slate-600
                       transition
                       no-underline"
          >
            <div className="flex items-start gap-3">
              {/* Source favicon */}
              <img
                src={`https://www.google.com/s2/favicons?domain=${item.link}&sz=64`}
                alt=""
                className="w-4 h-4 rounded-sm mt-1"
              />

              <div className="flex-1">
                <h3 className="text-sm text-slate-100 font-medium leading-snug">
                  {item.title}
                </h3>

                <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                  <span>Open source</span>
                  <ExternalLink size={12} />
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Show more / less */}
      {data.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-sm text-blue-400 cursor-pointer hover:text-blue-300 transition
                     bg-transparent border-none outline-none focus:outline-none"
        >
          {showAll ? "Show less" : `Show ${data.length - 3} more sources`}
        </button>
      )}
    </div>
  );
};

export default Links;
