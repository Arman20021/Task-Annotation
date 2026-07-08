"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useAnnotationStore } from "@/store/annotationStore";

export function ImageUploader() {
  const { uploadImages, uploading } = useAnnotationStore();
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (files.length === 0) {
      return;
    }

    await uploadImages(files);

    setFiles([]);
    event.currentTarget.reset();
  };

  return (
    <section className="rounded-[28px] border border-white/80 bg-white/60 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
      <h2 className="text-lg font-bold text-slate-900">Upload Images</h2>

      <p className="mt-1 text-sm text-slate-500">
        Select multiple MRI, CT, scan, or normal images for annotation.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => {
            const selectedFiles = Array.from(event.target.files ?? []);
            setFiles(selectedFiles);
          }}
          className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm"
        />

        {files.length > 0 && (
          <div className="rounded-2xl bg-white/70 p-4 text-sm text-slate-600">
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
          className="w-full rounded-2xl theme-button-primary px-4 py-3 font-bold text-white shadow-[0_18px_35px_rgba(99,102,241,0.24)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Upload Selected Images"}
        </button>
      </form>
    </section>
  );
}