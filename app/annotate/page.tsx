"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { ImageUploader } from "@/components/annotate/ImageUploader";
import { useAnnotationStore } from "@/store/annotationStore";

const ImageAnnotationCard = dynamic(
  () =>
    import("@/components/annotate/ImageAnnotationCard").then(
      (module) => module.ImageAnnotationCard
    ),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-[30px] border border-white/80 bg-white/60 p-10 text-center font-semibold text-slate-500 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
        Loading image canvas...
      </div>
    ),
  }
);

const IMAGES_PER_PAGE = 4;

export default function AnnotatePage() {
  const router = useRouter();

  const { images, fetchImages, loading, error } = useAnnotationStore();

  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/login");
      return;
    }

    fetchImages();
  }, [fetchImages, router]);

  const totalPages = Math.max(1, Math.ceil(images.length / IMAGES_PER_PAGE));

  const currentImages = useMemo(() => {
    const start = pageIndex * IMAGES_PER_PAGE;
    const end = start + IMAGES_PER_PAGE;

    return images.slice(start, end);
  }, [images, pageIndex]);

  const goPreviousPage = () => {
    setPageIndex((currentPage) => Math.max(0, currentPage - 1));
  };

  const goNextPage = () => {
    setPageIndex((currentPage) =>
      Math.min(totalPages - 1, currentPage + 1)
    );
  };

  useEffect(() => {
    if (pageIndex > totalPages - 1) {
      setPageIndex(totalPages - 1);
    }
  }, [pageIndex, totalPages]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fbff] text-slate-900">
      <div className="absolute left-[-160px] top-[-160px] h-96 w-96 rounded-full bg-sky-200/70 blur-3xl" />
      <div className="absolute right-[-140px] top-40 h-96 w-96 rounded-full bg-violet-200/70 blur-3xl" />
      <div className="absolute bottom-[-160px] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-100 blur-3xl" />

      <div className="relative">
        <Navbar />

        <section className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Image Annotation
            </h1>

            <p className="mt-2 text-slate-500">
              Upload multiple images, annotate four images per page, and save
              polygon data to the backend.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/80 px-5 py-4 text-red-600 shadow-sm backdrop-blur">
              {error}
            </div>
          )}

          <div className="mb-6">
            <ImageUploader />
          </div>

          <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-white/80 bg-white/60 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Annotation Workspace
              </h2>

              <p className="text-sm text-slate-500">
                Showing {currentImages.length} image
                {currentImages.length === 1 ? "" : "s"} on this page.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={goPreviousPage}
                disabled={pageIndex === 0}
                className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous Page
              </button>

              <span className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-bold text-slate-700 shadow-sm">
                Page {pageIndex + 1} of {totalPages}
              </span>

              <button
                onClick={goNextPage}
                disabled={pageIndex >= totalPages - 1}
                className="rounded-2xl bg-gradient-to-r from-violet-500 to-sky-500 px-4 py-3 text-sm font-bold text-white shadow-[0_18px_35px_rgba(99,102,241,0.22)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next Page
              </button>
            </div>
          </div>

          {loading ? (
            <div className="rounded-[30px] border border-white/80 bg-white/60 p-10 text-center font-semibold text-slate-500 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
              Loading images...
            </div>
          ) : currentImages.length === 0 ? (
            <div className="rounded-[30px] border border-dashed border-slate-200 bg-white/60 p-12 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
              <h2 className="text-xl font-bold text-slate-900">
                No images uploaded yet
              </h2>

              <p className="mt-2 text-slate-500">
                Upload images first, then they will appear here in a four-image
                grid.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              {currentImages.map((image) => (
                <ImageAnnotationCard key={image.id} image={image} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}