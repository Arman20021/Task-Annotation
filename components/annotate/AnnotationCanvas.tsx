"use client";

import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import {
  Circle,
  Image as KonvaImage,
  Layer,
  Line,
  Stage,
} from "react-konva";
import type {
  AnnotatedImage,
  Point,
  PolygonAnnotation,
} from "@/types/annotation";

type AnnotationCanvasProps = {
  image: AnnotatedImage | null;
  imagesCount: number;
  polygons: PolygonAnnotation[];
  currentPoints: Point[];
  setCurrentPoints: Dispatch<SetStateAction<Point[]>>;
  selectedPolygonId: number | null;
  setSelectedPolygonId: (id: number | null) => void;
  isDrawing: boolean;
  hideAnnotations: boolean;
  onNextImage: () => Promise<void>;
  onPreviousImage: () => Promise<void>;
};

const STAGE_WIDTH = 620;

export function AnnotationCanvas({
  image,
  imagesCount,
  polygons,
  currentPoints,
  setCurrentPoints,
  selectedPolygonId,
  setSelectedPolygonId,
  isDrawing,
  hideAnnotations,
  onNextImage,
  onPreviousImage,
}: AnnotationCanvasProps) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const wheelAreaRef = useRef<HTMLDivElement | null>(null);
const wheelLockRef = useRef(false);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(
    null
  );

  useEffect(() => {
    if (!image?.image_url) {
      setImageElement(null);
      return;
    }

    const loadedImage = new window.Image();
    loadedImage.crossOrigin = "anonymous";
    loadedImage.src = image.image_url;

    loadedImage.onload = () => {
      setImageElement(loadedImage);
    };
  }, [image?.image_url]);

  const originalWidth = image?.width || imageElement?.width || STAGE_WIDTH;
  const originalHeight = image?.height || imageElement?.height || 420;

  const scale = STAGE_WIDTH / originalWidth;
  const stageHeight = Math.max(360, Math.round(originalHeight * scale));

  const convertToCanvasPoint = (point: Point): Point => ({
    x: point.x * scale,
    y: point.y * scale,
  });

  const convertToOriginalPoint = (point: Point): Point => ({
    x: Math.round(point.x / scale),
    y: Math.round(point.y / scale),
  });

  const currentCanvasPoints = useMemo(
    () => currentPoints.map(convertToCanvasPoint),
    [currentPoints, scale]
  );

  const handleStageClick = () => {
    if (!image || !isDrawing) {
      return;
    }

    const stage = stageRef.current;

    if (!stage) {
      return;
    }

    const pointerPosition = stage.getPointerPosition();

    if (!pointerPosition) {
      return;
    }

    const originalPoint = convertToOriginalPoint({
      x: pointerPosition.x,
      y: pointerPosition.y,
    });

    setCurrentPoints((previousPoints) => [...previousPoints, originalPoint]);
  };

 
useEffect(() => {
  const wheelArea = wheelAreaRef.current;

  if (!wheelArea) {
    return;
  }

  const handleNativeWheel = (event: WheelEvent) => {
    if (imagesCount <= 1) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (wheelLockRef.current) {
      return;
    }

    wheelLockRef.current = true;

    if (event.deltaY > 0 || event.deltaX > 0) {
      void onNextImage();
    } else {
      void onPreviousImage();
    }

    window.setTimeout(() => {
      wheelLockRef.current = false;
    }, 350);
  };

  wheelArea.addEventListener("wheel", handleNativeWheel, {
    passive: false,
  });

  return () => {
    wheelArea.removeEventListener("wheel", handleNativeWheel);
  };
}, [imagesCount, onNextImage, onPreviousImage]);
  if (!image) {
    return (
      <section className="flex min-h-[420px] items-center justify-center rounded-[32px] border border-dashed border-slate-200 bg-white/50 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            No image selected
          </h2>
          <p className="mt-2 text-slate-500">
            Upload images to start drawing polygons.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white/65 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {image.title || `Image ${image.id}`}
          </h2>

          <p className="text-sm text-slate-500">
            Use mouse wheel on the image to move between uploaded images.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onPreviousImage}
            disabled={imagesCount <= 1}
            className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous Image
          </button>

          <button
            onClick={onNextImage}
            disabled={imagesCount <= 1}
            className="rounded-2xl theme-button-primary px-4 py-3 text-sm font-bold text-white shadow-[0_18px_35px_rgba(99,102,241,0.22)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next Image
          </button>
        </div>
      </div>

<div
  ref={wheelAreaRef}
  className="flex justify-center overflow-hidden overscroll-contain rounded-3xl bg-slate-950/5 p-4"
>
        <Stage
          ref={stageRef}
          width={STAGE_WIDTH}
          height={stageHeight}
          onClick={handleStageClick}
          className="rounded-2xl bg-white shadow-inner"
        >
          <Layer>
            {imageElement && (
              <KonvaImage
                image={imageElement}
                width={STAGE_WIDTH}
                height={stageHeight}
              />
            )}

            {!hideAnnotations &&
              polygons.map((polygon) => {
                const canvasPoints = polygon.points.map(convertToCanvasPoint);
                const flattenedPoints = canvasPoints.flatMap((point) => [
                  point.x,
                  point.y,
                ]);

                const selected = polygon.id === selectedPolygonId;

                return (
                  <Line
                    key={polygon.id}
                    points={flattenedPoints}
                    closed
                    stroke={polygon.color}
                    strokeWidth={selected ? 4 : 2}
                    fill={`${polygon.color}33`}
                    onClick={(event) => {
                      event.cancelBubble = true;
                      setSelectedPolygonId(polygon.id);
                    }}
                    onTap={(event) => {
                      event.cancelBubble = true;
                      setSelectedPolygonId(polygon.id);
                    }}
                  />
                );
              })}

            {currentCanvasPoints.length > 0 && (
              <Line
                points={currentCanvasPoints.flatMap((point) => [
                  point.x,
                  point.y,
                ])}
                closed={!isDrawing && currentCanvasPoints.length >= 3}
                stroke="#0ea5e9"
                strokeWidth={3}
                fill={!isDrawing ? "#0ea5e933" : undefined}
                dash={isDrawing ? [8, 6] : undefined}
              />
            )}

            {currentCanvasPoints.map((point, index) => (
              <Circle
                key={`${point.x}-${point.y}-${index}`}
                x={point.x}
                y={point.y}
                radius={6}
                fill="#0ea5e9"
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      <div className="mt-4 rounded-2xl bg-white/70 px-4 py-3 text-sm text-slate-600">
        Image {imagesCount > 0 ? "loaded" : "not loaded"} · Saved polygons:{" "}
        <span className="font-bold text-slate-900">{polygons.length}</span>
      </div>
    </section>
  );
}