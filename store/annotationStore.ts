import { create } from "zustand";
import { api } from "@/lib/api";
import type {
  AnnotatedImage,
  AnnotationBatch,
  PolygonAnnotation,
  PolygonPayload,
} from "@/types/annotation";

type AnnotationStore = {
  batches: AnnotationBatch[];
  loading: boolean;
  uploading: boolean;
  error: string;

  fetchBatches: () => Promise<void>;
  uploadImages: (files: File[]) => Promise<void>;

  savePolygon: (imageId: number, payload: PolygonPayload) => Promise<void>;
  updatePolygon: (
    imageId: number,
    polygonId: number,
    points: PolygonAnnotation["points"]
  ) => Promise<void>;
  deletePolygon: (imageId: number, polygonId: number) => Promise<void>;
};

function updateImageInBatches(
  batches: AnnotationBatch[],
  imageId: number,
  updater: (image: AnnotatedImage) => AnnotatedImage
) {
  return batches.map((batch) => ({
    ...batch,
    images: batch.images.map((image) =>
      image.id === imageId ? updater(image) : image
    ),
  }));
}

export const useAnnotationStore = create<AnnotationStore>((set) => ({
  batches: [],
  loading: false,
  uploading: false,
  error: "",

  fetchBatches: async () => {
    set({ loading: true, error: "" });

    try {
      const response = await api.get<AnnotationBatch[]>("/annotations/batches/");
      set({ batches: response.data, loading: false });
    } catch {
      set({
        error: "Could not load uploaded image batches.",
        loading: false,
      });
    }
  },

  uploadImages: async (files) => {
    if (files.length === 0) return;

    set({ uploading: true, error: "" });

    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("images", file);
      });

      formData.append("title", `Batch with ${files.length} images`);

      const response = await api.post<AnnotationBatch>(
        "/annotations/batches/",
        formData
      );

      set((state) => ({
        batches: [response.data, ...state.batches],
        uploading: false,
      }));
    } catch {
      set({
        error: "Image upload failed. Please try again.",
        uploading: false,
      });
    }
  },

  savePolygon: async (imageId, payload) => {
    const response = await api.post<PolygonAnnotation>(
      `/annotations/images/${imageId}/polygons/`,
      payload
    );

    set((state) => ({
      batches: updateImageInBatches(state.batches, imageId, (image) => ({
        ...image,
        polygons: [...image.polygons, response.data],
      })),
    }));
  },

  updatePolygon: async (imageId, polygonId, points) => {
    const response = await api.patch<PolygonAnnotation>(
      `/annotations/polygons/${polygonId}/`,
      { points }
    );

    set((state) => ({
      batches: updateImageInBatches(state.batches, imageId, (image) => ({
        ...image,
        polygons: image.polygons.map((polygon) =>
          polygon.id === polygonId ? response.data : polygon
        ),
      })),
    }));
  },

  deletePolygon: async (imageId, polygonId) => {
    await api.delete(`/annotations/polygons/${polygonId}/`);

    set((state) => ({
      batches: updateImageInBatches(state.batches, imageId, (image) => ({
        ...image,
        polygons: image.polygons.filter((polygon) => polygon.id !== polygonId),
      })),
    }));
  },
}));