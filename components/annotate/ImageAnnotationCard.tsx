"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Circle, Image as KonvaImage, Layer, Line, Stage } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type {
  AnnotatedImage,
  Point,
  PolygonAnnotation,
} from "@/types/annotation";
import { useAnnotationStore } from "@/store/annotationStore";

type ImageAnnotationCardProps = {
  image: AnnotatedImage;
  zoom: number;
  onImageWheel?: (direction: "next" | "previous") => void;
};

type CanvasSize = {
  width: number;
  height: number;
};

type SelectedPoint =
  | {
      type: "current";
      pointIndex: number;
    }
  | {
      type: "saved";
      polygonId: number;
      pointIndex: number;
    };

const MAX_CANVAS_WIDTH = 760;
const MAX_CANVAS_HEIGHT = 400;

export function ImageAnnotationCard({
  image,
  zoom,
  onImageWheel,
}: ImageAnnotationCardProps) {
  const { savePolygon, updatePolygon, deletePolygon } = useAnnotationStore();

  const imageWheelAreaRef = useRef<HTMLDivElement | null>(null);

  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(
    null
  );

  const [canvasSize, setCanvasSize] = useState<CanvasSize>({
    width: 700,
    height: 500,
  });

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [selectedPolygonId, setSelectedPolygonId] = useState<number | null>(
    null
  );
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(
    null
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const wheelArea = imageWheelAreaRef.current;

    if (!wheelArea || !onImageWheel) {
      return;
    }

const handleNativeWheel = (event: WheelEvent) => {
  event.preventDefault();
  event.stopPropagation();

  if (event.deltaY > 0) {
    onImageWheel("next");
  } else {
    onImageWheel("previous");
  }
};

    wheelArea.addEventListener("wheel", handleNativeWheel, {
      passive: false,
    });

    return () => {
      wheelArea.removeEventListener("wheel", handleNativeWheel);
    };
}, [onImageWheel]);

useEffect(() => {
  setImageElement(null);
    setSelectedPolygonId(null);
    setSelectedPoint(null);
    setSaving(false);
    setDeleting(false);

  const img = new window.Image();

  img.crossOrigin = "anonymous";
  img.src = image.image_url;

  img.onload = () => {
    const widthRatio = MAX_CANVAS_WIDTH / img.naturalWidth;
    const heightRatio = MAX_CANVAS_HEIGHT / img.naturalHeight;
    const ratio = Math.min(widthRatio, heightRatio, 1);

    setCanvasSize({
      width: Math.round(img.naturalWidth * ratio),
      height: Math.round(img.naturalHeight * ratio),
    });

    setImageElement(img);
  };
}, [image.id, image.image_url]);

  const currentLinePoints = useMemo(() => {
    return currentPoints.flatMap((point) => [point.x, point.y]);
  }, [currentPoints]);

  const displayWidth = canvasSize.width * zoom;
  const displayHeight = canvasSize.height * zoom;

  const handleStageClick = (event: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) {
      return;
    }

    const clickedClass = event.target.getClassName();

    if (clickedClass === "Circle" || clickedClass === "Line") {
      return;
    }

    const stage = event.target.getStage();

    if (!stage) {
      return;
    }

    const pointer = stage.getPointerPosition();

    if (!pointer) {
      return;
    }

    const newPoint: Point = {
      x: pointer.x / zoom,
      y: pointer.y / zoom,
    };

    setCurrentPoints((prev) => [...prev, newPoint]);
    setSelectedPoint(null);
    setSelectedPolygonId(null);
  };

  const handleDrawPolygon = () => {
    setIsDrawing(true);
    setCurrentPoints([]);
    setSelectedPolygonId(null);
    setSelectedPoint(null);
  };

  const handleFinishPolygon = () => {
    if (currentPoints.length < 3) {
      alert("You need at least 3 points to finish a polygon.");
      return;
    }

    setIsDrawing(false);
  };

  const handleSavePolygon = async () => {
    if (currentPoints.length < 3) {
      alert("You need at least 3 points before saving.");
      return;
    }

    try {
      setSaving(true);

      await savePolygon(image.id, {
        label: "Region",
        points: currentPoints,
        color: "#8B5CF6",
      });

      setCurrentPoints([]);
      setIsDrawing(false);
      setSelectedPoint(null);
      setSelectedPolygonId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedPoint) {
      await handleDeleteSelectedPoint();
      return;
    }

    if (selectedPolygonId) {
      await handleDeleteSelectedPolygon();
      return;
    }

    alert("Select a point or polygon first.");
  };

  const handleDeleteSelectedPoint = async () => {
    if (!selectedPoint) {
      return;
    }

    if (selectedPoint.type === "current") {
      setCurrentPoints((prev) =>
        prev.filter((_, index) => index !== selectedPoint.pointIndex)
      );

      setSelectedPoint(null);
      return;
    }

    const selectedPolygon = image.polygons.find(
      (polygon) => polygon.id === selectedPoint.polygonId
    );

    if (!selectedPolygon) {
      return;
    }

    if (selectedPolygon.points.length <= 3) {
      alert("A saved polygon must have at least 3 points.");
      return;
    }

    const updatedPoints = selectedPolygon.points.filter(
      (_, index) => index !== selectedPoint.pointIndex
    );

    try {
      setDeleting(true);
      await updatePolygon(image.id, selectedPolygon.id, updatedPoints);
      setSelectedPoint(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSelectedPolygon = async () => {
    if (!selectedPolygonId) {
      return;
    }

    try {
      setDeleting(true);
      await deletePolygon(image.id, selectedPolygonId);
      setSelectedPolygonId(null);
      setSelectedPoint(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setIsDrawing(false);
    setCurrentPoints([]);
    setSelectedPolygonId(null);
    setSelectedPoint(null);
  };

  const isSaveDisabled = saving || currentPoints.length < 3;
  const isFinishDisabled = currentPoints.length < 3;
  const isDeleteDisabled = deleting || (!selectedPoint && !selectedPolygonId);

  return (
    <article>
      <h3 className="mb-4 truncate text-base font-extrabold text-[#0F172A]">
        {image.title}
      </h3>

        <div
          ref={imageWheelAreaRef}
          className="flex cursor-default justify-center overflow-hidden rounded-[30px] bg-[#F1F5F9] p-4"
        >
        <div
          style={{
            width: displayWidth,
            height: displayHeight,
          }}
          className="shrink-0 rounded-2xl bg-black transition-all duration-300"
        >
          <Stage
            width={displayWidth}
            height={displayHeight}
            onClick={handleStageClick}
          >
            <Layer scaleX={zoom} scaleY={zoom}>
              {imageElement && (
                <KonvaImage
                  image={imageElement}
                  width={canvasSize.width}
                  height={canvasSize.height}
                />
              )}

              {image.polygons.map((polygon: PolygonAnnotation) => {
                const polygonPoints = polygon.points.flatMap((point) => [
                  point.x,
                  point.y,
                ]);

                const isSelectedPolygon = selectedPolygonId === polygon.id;

                return (
                  <Fragment key={polygon.id}>
                    <Line
                      points={polygonPoints}
                      closed
                      stroke={polygon.color || "#8B5CF6"}
                      strokeWidth={isSelectedPolygon ? 4 : 3}
                      fill="rgba(139, 92, 246, 0.16)"
                      hitStrokeWidth={24}
                      onClick={(event) => {
                        event.cancelBubble = true;
                        setSelectedPolygonId(polygon.id);
                        setSelectedPoint(null);
                      }}
                    />

                    {polygon.points.map((point, pointIndex) => {
                      const isSelectedPoint =
                        selectedPoint?.type === "saved" &&
                        selectedPoint.polygonId === polygon.id &&
                        selectedPoint.pointIndex === pointIndex;

                      return (
                        <Circle
                          key={`${polygon.id}-${pointIndex}`}
                          x={point.x}
                          y={point.y}
                          radius={isSelectedPoint ? 7 : 5}
                          fill={isSelectedPoint ? "#EF4444" : "#FFFFFF"}
                          stroke={polygon.color || "#8B5CF6"}
                          strokeWidth={2}
                          onClick={(event) => {
                            event.cancelBubble = true;

                            setSelectedPoint({
                              type: "saved",
                              polygonId: polygon.id,
                              pointIndex,
                            });

                            setSelectedPolygonId(polygon.id);
                          }}
                        />
                      );
                    })}
                  </Fragment>
                );
              })}

              {currentPoints.length > 0 && (
                <>
                  <Line
                    points={currentLinePoints}
                    closed={!isDrawing && currentPoints.length >= 3}
                    stroke="#6366F1"
                    strokeWidth={3}
                    fill={
                      !isDrawing && currentPoints.length >= 3
                        ? "rgba(99, 102, 241, 0.16)"
                        : undefined
                    }
                    dash={isDrawing ? [8, 6] : undefined}
                  />

                  {currentPoints.map((point, pointIndex) => {
                    const isSelectedPoint =
                      selectedPoint?.type === "current" &&
                      selectedPoint.pointIndex === pointIndex;

                    return (
                      <Circle
                        key={`current-${pointIndex}`}
                        x={point.x}
                        y={point.y}
                        radius={isSelectedPoint ? 7 : 5}
                        fill={isSelectedPoint ? "#EF4444" : "#FFFFFF"}
                        stroke="#6366F1"
                        strokeWidth={2}
                        onClick={(event) => {
                          event.cancelBubble = true;

                          setSelectedPoint({
                            type: "current",
                            pointIndex,
                          });

                          setSelectedPolygonId(null);
                        }}
                      />
                    );
                  })}
                </>
              )}
            </Layer>
          </Stage>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        <button
          onClick={handleDrawPolygon}
          className="rounded-2xl bg-[#EEF2FF] px-4 py-3 text-sm font-extrabold text-[#6D28D9] transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#DDD6FE] hover:shadow-lg"
        >
          Draw Polygon
        </button>

        <button
          onClick={handleFinishPolygon}
          disabled={isFinishDisabled}
          className="rounded-2xl bg-[#F0F9FF] px-4 py-3 text-sm font-extrabold text-[#0284C7] transition-all duration-300 enabled:hover:-translate-y-1 enabled:hover:scale-105 enabled:hover:bg-[#E0F2FE] enabled:hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          Finish
        </button>

        <button
          onClick={handleSavePolygon}
          disabled={isSaveDisabled}
          className="rounded-2xl bg-[#ECFDF5] px-4 py-3 text-sm font-extrabold text-[#059669] transition-all duration-300 enabled:hover:-translate-y-1 enabled:hover:scale-105 enabled:hover:bg-[#D1FAE5] enabled:hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        <button
          onClick={handleDeleteSelected}
          disabled={isDeleteDisabled}
          className="rounded-2xl bg-[#FEF2F2] px-4 py-3 text-sm font-extrabold text-red-600 transition-all duration-300 enabled:hover:-translate-y-1 enabled:hover:scale-105 enabled:hover:bg-[#FEE2E2] enabled:hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete Selected"}
        </button>

        <button
          onClick={handleCancel}
          className="rounded-2xl bg-[#F1F5F9] px-4 py-3 text-sm font-extrabold text-[#334155] transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#E2E8F0] hover:shadow-lg"
        >
          Cancel
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#64748B]">
        {isDrawing
          ? "Click on the image to add polygon points."
          : "Keep cursor on the image and use mouse wheel to move between images. Outside the image, the page will scroll normally."}
      </div>
    </article>
  );
}