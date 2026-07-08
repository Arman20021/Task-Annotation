export type Point = {
  x: number;
  y: number;
};

export type PolygonAnnotation = {
  id: number;
  image: number;
  label: string;
  points: Point[];
  color: string;
  created_at: string;
};

export type AnnotatedImage = {
  id: number;
  batch: number | null;
  user: string;
  title: string;
  image: string;
  image_url: string;
  width: number | null;
  height: number | null;
  uploaded_at: string;
  polygons: PolygonAnnotation[];
};

export type AnnotationBatch = {
  id: number;
  user: string;
  title: string;
  images: AnnotatedImage[];
  image_count: number;
  created_at: string;
};

export type PolygonPayload = {
  label: string;
  points: Point[];
  color: string;
};