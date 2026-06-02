/** @format */

import Spinner from "./spinner";
import { cn } from "@/lib/utils";

type LoadingBlockProps = {
  label?: string;
  className?: string;
  minHeight?: string;
};

export default function LoadingBlock({
  label = "Chargement...",
  className,
  minHeight = "min-h-[200px]",
}: LoadingBlockProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        minHeight,
        className
      )}
      aria-busy="true"
      aria-live="polite">
      <Spinner size="large" />
      {label ? (
        <p className="text-sm font-medium text-secondary">{label}</p>
      ) : null}
    </div>
  );
}
