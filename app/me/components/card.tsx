import type React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-lg border bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-4 border-b", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-gray-800",
        className
      )}
    >
      {children}
    </h3>
  );
}

export function CardContent({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("p-4", className)}>
      {children || (
        <p className="text-sm text-gray-600">Custom content goes here</p>
      )}
    </div>
  );
}
