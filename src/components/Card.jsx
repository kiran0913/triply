import { motion } from "framer-motion";

export function Card({ children, className = "", hover = true, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={`rounded-2xl bg-white shadow-card border border-gray-100/80 p-6 hover:shadow-elevated hover:border-gray-100 transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
