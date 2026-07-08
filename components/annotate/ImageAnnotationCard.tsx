"use client";

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
import { useAnnotationStore } from "@/store/annotationStore";

type ImageAnnotationCardProps = {
  image: AnnotatedImage;
};

const STAGE_WIDTH = 420;

export function ImageAnnotationCard({ image }: ImageAnnotationCardProps) {
  const { savePolygon, deletePolygon } = useAnnotationStore();

  const stageRef = useRef<Konva.Stage | null>(null);

  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(
    null
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [selectedPolygonId, setSelectedPolygonId] = useState<number | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadedImage = new window.Image();
    loadedImage.crossOrigin = "anonymous";
    loadedImage.src = image.image_url;

    loadedImage.onload = () => {
      setImageElement(loadedImage);
    };
  }, [image.image_url]);

  const originalWidth = image.width || imageElement?.width || STAGE_WIDTH;
  const originalHeight = image.height || imageElement?.height || 320;

  const scale = STAGE_WIDTH / originalWidth;
  const stageHeight = Math.max(280, Math.round(originalHeight * scale));

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
    if (!isDrawing) {
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

  const handleDraw = () => {
    setSelectedPolygonId(null);
    setCurrentPoints([]);
    setIsDrawing(true);
  };

  const handleFinish = () => {
    if (currentPoints.length < 3) {
      alert("A polygon needs at least 3 points.");
      return;
    }

    setIsDrawing(false);
  };

  const handleSave = async () => {
    if (currentPoints.length < 3) {
      alert("A polygon needs at least 3 points.");
      return;
    }

    setSaving(true);

    try {
      await savePolygon(image.id, {
        label: "Region",
        points: currentPoints,
        color: "#8b5cf6",
      });

      setCurrentPoints([]);
      setIsDrawing(false);
      setSelectedPolygonId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedPolygonId) {
      alert("Please click a saved polygon first. The selected polygon will turn red.");
      return;
    }

    setDeleting(true);

    try {
      await deletePolygon(image.id, selectedPolygonId);
      setSelectedPolygonId(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setCurrentPoints([]);
    setIsDrawing(false);
    setSelectedPolygonId(null);
  };

  const handleSelectPolygon = (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
    polygonId: number
  ) => {
    event.cancelBubble = true;
    setIsDrawing(false);
    setCurrentPoints([]);
    setSelectedPolygonId(polygonId);
  };

  return (
    <article className="rounded-[30px] border border-white/80 bg-white/65 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
      <div className="mb-4">
        <h2 className="truncate text-lg font-bold text-slate-900">
          {image.title || `Image ${image.id}`}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Draw, save, then click a saved polygon to select and delete it.
        </p>
      </div>

      <div className="flex justify-center rounded-3xl bg-slate-950/5 p-4">
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

            {image.polygons.map((polygon: PolygonAnnotation) => {
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
                  stroke={selected ? "#ef4444" : polygon.color}
                  strokeWidth={selected ? 5 : 3}
                  hitStrokeWidth={24}
                  fill={selected ? "rgba(239, 68, 68, 0.22)" : "rgba(139, 92, 246, 0.22)"}
                  onClick={(event) => handleSelectPolygon(event, polygon.id)}
                  onTap={(event) => handleSelectPolygon(event, polygon.id)}
                  onMouseDown={(event) => handleSelectPolygon(event, polygon.id)}
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
                fill={!isDrawing ? "rgba(14, 165, 233, 0.22)" : undefined}
                dash={isDrawing ? [8, 6] : undefined}
              />
            )}

            {currentCanvasPoints.map((point, index) => (
              <Circle
                key={`${point.x}-${point.y}-${index}`}
                x={point.x}
                y={point.y}
                radius={5}
                fill="#0ea5e9"
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        <button
          onClick={handleDraw}
          className="rounded-2xl bg-violet-50 px-4 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-100"
        >
          Draw Polygon
        </button>

        <button
          onClick={handleFinish}
          disabled={currentPoints.length < 3}
          className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Finish
        </button>

        <button
          onClick={handleSave}
          disabled={currentPoints.length < 3 || saving}
          className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        <button
          onClick={handleDeleteSelected}
          disabled={deleting}
          className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete Selected"}
        </button>

        <button
          onClick={handleCancel}
          className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
        >
          Cancel
        </button>
      </div>

      {selectedPolygonId && (
        <p className="mt-3 text-sm font-semibold text-red-500">
          Polygon selected. Now click Delete Selected.
        </p>
      )}
    </article>
  );
}