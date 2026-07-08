"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { ImageUploader } from "@/components/annotate/ImageUploader";
import { BatchAnnotationCard } from "@/components/annotate/BatchAnnotationCard";
import { useAnnotationStore } from "@/store/annotationStore";

export default function AnnotatePage() {
  const router = useRouter();

  const { batches, loading, error, fetchBatches } = useAnnotationStore();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    fetchBatches();
  }, [fetchBatches, router]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-8">


        <ImageUploader />

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-600">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-8 rounded-[30px] border border-[#E2E8F0] bg-white p-10 text-center font-semibold text-[#64748B] shadow-sm">
            Loading uploaded image groups...
          </div>
        )}

        {!loading && batches.length === 0 && (
          <div className="mt-8 rounded-[30px] border border-dashed border-[#CBD5E1] bg-white p-10 text-center">
            <h2 className="text-xl font-bold text-[#0F172A]">
              No image groups uploaded yet
            </h2>

            <p className="mt-2 text-sm text-[#64748B]">
              Choose 3, 4, or more images and upload them. They will appear
              inside one div.
            </p>
          </div>
        )}

        {!loading && batches.length > 0 && (
          <div className="mt-8 space-y-8">
              {batches.map((batch, index) => (
                <BatchAnnotationCard
                  key={batch.id}
                  batch={batch}
                  batchNumber={batches.length - index}
                />
              ))}
          </div>
        )}
      </section>
    </main>
  );
}