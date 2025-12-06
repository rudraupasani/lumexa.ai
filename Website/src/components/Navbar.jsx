import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Link = ({ to, onClick, className, children }) => (
  <a href={to} onClick={onClick} className={className}>
    {children}
  </a>
);

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", to: "/" },
    { name: "Features", to: "/features" },
    { name: "About", to: "/about" },
  ];

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] md:w-[80%] lg:w-[70%] 
                 bg-[#0b0b0f]/80 border border-gray-800 rounded-2xl backdrop-blur-2xl 
                 shadow-[0_0_25px_rgba(0,0,0,0.5)]"
    >
      <div className="px-5 md:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.span
              whileHover={{ color: "#22d3ee" }}
              className="text-lg font-semibold text-gray-100 tracking-wide"
            >
              Lumexa
            </motion.span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <motion.div key={link.name} whileHover={{ y: -1, scale: 1.05 }}>
                <Link
                  to={link.to}
                  className="px-4 py-2 text-gray-300 hover:text-cyan-400 hover:bg-gray-800/40 rounded-lg transition-all duration-200"
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}

            {/* Google Sign-In Button */}
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                to="/login"
                className="ml-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 
                           text-white font-medium hover:shadow-lg hover:shadow-cyan-500/20 
                           transition-all duration-300 flex items-center gap-2"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5 bg-white rounded-full"
                />
                Continue with Google
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 p-2 rounded-lg hover:bg-gray-800/50"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="md:hidden border-t border-gray-800 bg-[#0b0b0f]/95 backdrop-blur-xl px-6 py-4 space-y-2 rounded-b-2xl"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50 transition-all"
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/login"
            onClick={() => setIsMenuOpen(false)}
            className="flex justify-center items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium mt-2"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5 bg-white rounded-full"
            />
            Continue with Google
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
}
