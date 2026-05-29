/** @format */

import Image from "next/image";
import React from "react";

type LogoProps = {
  logoColor: string;
};

export default function Logo({ logoColor }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Logo SVG */}
      <div className="relative flex items-center justify-center">
        <Image
          src={logoColor}
          alt="2aeco Logo"
          width={52}
          height={52}
          priority
          className="object-contain"
        />
      </div>

      {/* Brand Name */}
      <span
        className="
          text-3xl
          font-semibold
          tracking-tight
          text-[#2F73F2]
          leading-none
          select-none
        "
        style={{
          fontFamily: "'Poppins', sans-serif"
        }}>
        2aeco
      </span>
    </div>
  );
}
