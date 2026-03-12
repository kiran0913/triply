import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function Button({ children, variant = "primary", size = "md", className = "", to, ...props }) {
  const base = "rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center";
  const variants = {
    primary: "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-soft hover:shadow-elevated hover:from-primary-700 hover:to-primary-600 active:scale-[0.98]",
    secondary: "bg-white text-primary-600 border-2 border-primary-200 hover:bg-primary-50 hover:border-primary-300",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  };
  const sizes = { sm: "px-4 py-2 text-sm", md: "px-6 py-3 text-base", lg: "px-8 py-4 text-lg" };
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (to) {
    return <Link to={to} className={classes}>{children}</Link>;
  }
  return (
    <motion.button whileTap={{ scale: 0.98 }} className={classes} {...props}>
      {children}
    </motion.button>
  );
}
