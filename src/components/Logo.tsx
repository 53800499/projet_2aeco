/** @format */

import Image from "next/image";
import React from "react";

type LogoProps = {
  className?: string;
};

export default function Logo({ className }: LogoProps) {
  return (
    <div className={"flex items-center gap-3" + (className ? ` ${className}` : "")}>
      {/* Logo SVG */}
      <div className="relative flex items-center justify-center">
        <Image
          src="/images/logo/Logo1.png"
          alt="2aeco Logo"
          width={100}
          height={100}
          priority
          className="object-contain"
        />
      </div>
    </div>
  );
}
