/** @format */

import Image from "next/image";
import React from "react";

type LogoProps = {
  logoColor: string;
};

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      {/* Logo SVG */}
      <div className="relative flex items-center justify-center">
        <Image
          src="/images/logo/Logo1.png"
          alt="2aeco Logo"
          width={52}
          height={52}
          priority
          className="object-contain"
        />
      </div>
    </div>
  );
}
