import { create } from "zustand";
import { api } from "@/lib/api";
import type {
  AnnotatedImage,
  PolygonAnnotation,
  PolygonPayload,
} from "@/types/annotation";

type AnnotationStore = {
  images: AnnotatedImage[];
  loading: boolean;
  uploading: boolean;
  error: string;

  fetchImages: () => Promise<void>;
  uploadImages: (files: File[]) => Promise<void>;
  savePolygon: (imageId: number, payload: PolygonPayload) => Promise<void>;
  deletePolygon: (imageId: number, polygonId: number) => Promise<void>;
};

export const useAnnotationStore = create<AnnotationStore>((set) => ({
  images: [],
  loading: false,
  uploading: false,
  error: "",

  fetchImages: async () => {
    set({ loading: true, error: "" });

    try {
      const response = await api.get<AnnotatedImage[]>("/annotations/images/");

      set({
        images: response.data,
        loading: false,
      });
    } catch {
      set({
        error: "Could not load uploaded images.",
        loading: false,
      });
    }
  },

  uploadImages: async (files) => {
    if (files.length === 0) {
      return;
    }

    set({ uploading: true, error: "" });

    try {
      const uploadedImages: AnnotatedImage[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("title", file.name);

        const response = await api.post<AnnotatedImage>(
          "/annotations/images/",
          formData
        );

        uploadedImages.push(response.data);
      }

      set((state) => ({
        images: [...uploadedImages.reverse(), ...state.images],
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
      images: state.images.map((image) =>
        image.id === imageId
          ? {
              ...image,
              polygons: [...image.polygons, response.data],
            }
          : image
      ),
    }));
  },

  deletePolygon: async (imageId, polygonId) => {
    await api.delete(`/annotations/polygons/${polygonId}/`);

    set((state) => ({
      images: state.images.map((image) =>
        image.id === imageId
          ? {
              ...image,
              polygons: image.polygons.filter(
                (polygon) => polygon.id !== polygonId
              ),
            }
          : image
      ),
    }));
  },
}));