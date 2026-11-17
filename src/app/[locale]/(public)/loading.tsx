import React from "react";

export default function PublicLoading() {
  return (
    <div
      aria-busy="true"
      className="mx-auto w-full max-w-[76rem] px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="h-10 w-64 animate-pulse rounded-xl bg-surface" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-xl border border-line bg-surface shadow-card"
          />
        ))}
      </div>
    </div>
  );
}
