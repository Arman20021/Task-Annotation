"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useRef, useState } from "react";
import { useAnnotationStore } from "@/store/annotationStore";

export function ImageUploader() {
  const { uploadImages, uploading } = useAnnotationStore();

  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getFileKey = (file: File) => {
    return `${file.name}-${file.size}-${file.lastModified}`;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    setFiles((previousFiles) => {
      const existingKeys = new Set(previousFiles.map(getFileKey));

      const newFiles = selectedFiles.filter(
        (file) => !existingKeys.has(getFileKey(file))
      );

      return [...previousFiles, ...newFiles];
    });

    event.target.value = "";
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setFiles((previousFiles) =>
      previousFiles.filter((file) => getFileKey(file) !== getFileKey(fileToRemove))
    );
  };

  const handleClearAll = () => {
    setFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

      <p className="mt-1 text-sm font-medium text-[#64748B]">
        Select many images at once, or select images one by one before uploading.
      </p>

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
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold text-slate-900">
                {files.length} image{files.length === 1 ? "" : "s"} selected
              </p>

              <button
                type="button"
                onClick={handleClearAll}
                className="cursor-pointer rounded-xl bg-[#FEF2F2] px-3 py-1 text-xs font-bold text-red-600 transition-all duration-300 hover:bg-[#FEE2E2]"
              >
                Clear All
              </button>
            </div>

            <div className="mt-3 max-h-32 space-y-2 overflow-y-auto">
              {files.map((file) => (
                <div
                  key={getFileKey(file)}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[#F8FAFC] px-3 py-2"
                >
                  <p className="truncate font-medium text-[#334155]">
                    {file.name}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file)}
                    className="shrink-0 cursor-pointer rounded-lg bg-white px-2 py-1 text-xs font-bold text-red-600 transition-all duration-300 hover:bg-[#FEE2E2]"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={files.length === 0 || uploading}
          className="w-full cursor-pointer rounded-2xl border border-[#E2E8F0] bg-white px-5 py-3 font-semibold text-[#0F172A] shadow-sm transition-all duration-300 enabled:hover:-translate-y-1 enabled:hover:scale-105 enabled:hover:bg-[#EEF2FF] enabled:hover:text-[#4F46E5] enabled:hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Selected Images"}
        </button>
      </form>
    </section>
  );
}