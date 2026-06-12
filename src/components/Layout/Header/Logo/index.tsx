/** @format */

import Image from "next/image";
import React from "react";

type LogoProps = {
  size?: number;
};

export default function Logo({ size = 90 }: LogoProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="relative flex items-center justify-center">
        <Image
          src="/images/logo/Logo1.png"
          alt="2aeco Logo"
          width={size}
          height={size}
          priority
          className="object-contain"
          style={{ width: size, height: size }}
        />
      </div>
    </div>
  );
}
