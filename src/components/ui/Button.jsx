import React from "react";

export default function Button({
  children,
  className = "",
  variant = "primary", // primary | ghost | danger
  size = "md", // sm | md | lg
  disabled,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-white text-black hover:bg-zinc-200 shadow-sm shadow-black/10",
    ghost: "bg-white/5 text-white hover:bg-white/10 border border-white/10",
    danger: "bg-red-500 text-white hover:bg-red-400 shadow-sm shadow-black/10",
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-5 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
