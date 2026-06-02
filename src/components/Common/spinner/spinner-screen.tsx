/** @format */

import React from "react";
import Spinner from "./spinner";

export default function SpinnerScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <Spinner size="large" />
    </div>
  );
}
