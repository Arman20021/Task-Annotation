"use client";

import type { FormEvent, ChangeEvent } from "react";
import { useRef, useState } from "react";
import { useAnnotationStore } from "@/store/annotationStore";

export function ImageUploader() {
  const { uploadImages, uploading } = useAnnotationStore();
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (files.length === 0) {
      return;
    }

    await uploadImages(files);

    setFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section className="mx-auto w-full rounded-[30px] border border-[#E2E8F0] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C7D2FE] hover:bg-[#EEF2FF]/40 hover:shadow-[0_24px_70px_rgba(99,102,241,0.18)] lg:w-1/2">
      <h2 className="text-lg font-bold text-slate-900">Upload Images</h2>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="w-full cursor-pointer rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition-all duration-300 hover:border-[#C7D2FE] hover:bg-[#EEF2FF] hover:text-[#4F46E5] hover:shadow-md"
        />

        {files.length > 0 && (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 text-sm text-slate-600">
            <p className="font-bold text-slate-900">
              {files.length} image{files.length === 1 ? "" : "s"} selected
            </p>

            <div className="mt-2 max-h-24 space-y-1 overflow-y-auto">
              {files.map((file) => (
                <p key={`${file.name}-${file.size}`} className="truncate">
                  {file.name}
                </p>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={files.length === 0 || uploading}
          className="w-full cursor-pointer rounded-2xl border border-[#E2E8F0] bg-white px-5 py-3 font-semibold text-[#0F172A] shadow-sm transition-all duration-300 enabled:hover:-translate-y-1 enabled:hover:scale-105 enabled:hover:border-[#C7D2FE] enabled:hover:bg-[#EEF2FF] enabled:hover:text-[#4F46E5] enabled:hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Selected Images"}
        </button>
      </form>
    </section>
  );
}