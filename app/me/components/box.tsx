import type React from "react";
import { cn } from "@/lib/utils";

export function Box({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-background shadow-sm overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BoxHeader({ children }: { children: React.ReactNode }) {
  return <div className={cn("flex flex-col space-y-1.5 p-6")}>{children}</div>;
}

export function BoxTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      className={cn(
        "text-xl font-semibold leading-none tracking-tight text-gray-800",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function BoxContent({
  className,
  children
}: {className?: string;
  children?: React.ReactNode;}) {
  return <div className={cn("p-6 bg-background", className)}>{children}</div>;
}
