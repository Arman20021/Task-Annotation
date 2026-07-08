"use client";

import { useRef, useState } from "react";
import { ImageAnnotationCard } from "./ImageAnnotationCard";
import type { AnnotationBatch } from "@/types/annotation";

type BatchAnnotationCardProps = {
  batch: AnnotationBatch;
  batchNumber: number;
};

type WheelDirection = "next" | "previous";

export function BatchAnnotationCard({
  batch,
  batchNumber,
}: BatchAnnotationCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const wheelLockRef = useRef(false);

  const activeImage = batch.images[activeIndex];

  const goPrevious = () => {
    setActiveIndex((prev) => Math.max(prev - 1, 0));
    setZoom(1);
  };

  const goNext = () => {
    setActiveIndex((prev) => Math.min(prev + 1, batch.images.length - 1));
    setZoom(1);
  };

  const handleImageWheel = (direction: WheelDirection) => {
    if (wheelLockRef.current) {
      return;
    }

    wheelLockRef.current = true;

    if (direction === "next") {
      setActiveIndex((prev) => {
        const nextIndex = Math.min(prev + 1, batch.images.length - 1);
        if (nextIndex !== prev) {
          setZoom(1);
        }
        return nextIndex;
      });
    } else {
      setActiveIndex((prev) => {
        const previousIndex = Math.max(prev - 1, 0);
        if (previousIndex !== prev) {
          setZoom(1);
        }
        return previousIndex;
      });
    }

    window.setTimeout(() => {
      wheelLockRef.current = false;
    }, 300);
  };

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.15, 3));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.15, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  if (!activeImage) {
    return null;
  }

  return (
   <section className="mx-auto max-w-3xl rounded-[30px] border border-[#E2E8F0] bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.07)] transition-all duration-300 hover:border-[#C7D2FE] hover:shadow-[0_20px_55px_rgba(99,102,241,0.14)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <button
          onClick={goPrevious}
          disabled={activeIndex === 0}
          className="rounded-2xl border border-[#E2E8F0] bg-white px-5 py-3 font-semibold text-[#0F172A] shadow-sm transition-all duration-300 enabled:hover:-translate-x-1 enabled:hover:scale-105 enabled:hover:border-[#C7D2FE] enabled:hover:bg-[#EEF2FF] enabled:hover:text-[#4F46E5] enabled:hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Previous
        </button>

        <div className="text-center">
          <h2 className="text-lg font-extrabold text-[#0F172A]">
            Batch #{batchNumber}
          </h2>

          <p className="mt-1 text-sm font-bold text-[#4F46E5]">
            Image {activeIndex + 1} / {batch.images.length}
          </p>

          <p className="mt-1 text-xs font-semibold text-[#64748B]">
            Wheel only works when cursor is on the image
          </p>
        </div>

        <button
          onClick={goNext}
          disabled={activeIndex === batch.images.length - 1}
          className="rounded-2xl bg-[#6366F1] px-5 py-3 font-semibold text-white shadow-sm transition-all duration-300 enabled:hover:translate-x-1 enabled:hover:scale-105 enabled:hover:bg-[#4F46E5] enabled:hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next →
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={zoomOut}
          className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-bold text-[#0F172A] transition-all duration-300 hover:border-[#C7D2FE] hover:bg-[#EEF2FF] hover:text-[#4F46E5] hover:shadow-md"
        >
          Zoom -
        </button>

        <span className="rounded-full bg-[#EEF2FF] px-4 py-2 text-sm font-extrabold text-[#4F46E5]">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={zoomIn}
          className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-bold text-[#0F172A] transition-all duration-300 hover:border-[#C7D2FE] hover:bg-[#EEF2FF] hover:text-[#4F46E5] hover:shadow-md"
        >
          Zoom +
        </button>

        <button
          onClick={resetZoom}
          className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2 text-sm font-bold text-[#64748B] transition-all duration-300 hover:border-[#C7D2FE] hover:bg-[#EEF2FF] hover:text-[#4F46E5] hover:shadow-md"
        >
          Reset
        </button>
      </div>

            <ImageAnnotationCard
            image={activeImage}
            zoom={zoom}
            onImageWheel={handleImageWheel}
            />
    </section>
  );
}