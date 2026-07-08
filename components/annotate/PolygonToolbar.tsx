"use client";

type PolygonToolbarProps = {
  label: string;
  setLabel: (label: string) => void;
  isDrawing: boolean;
  setIsDrawing: (value: boolean) => void;
  currentPointsCount: number;
  selectedPolygonId: number | null;
  hideAnnotations: boolean;
  setHideAnnotations: (value: boolean) => void;
  saving: boolean;
  onFinish: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
};

export function PolygonToolbar({
  label,
  setLabel,
  isDrawing,
  setIsDrawing,
  currentPointsCount,
  selectedPolygonId,
  hideAnnotations,
  setHideAnnotations,
  saving,
  onFinish,
  onCancel,
  onSave,
  onDelete,
}: PolygonToolbarProps) {
  return (
    <section className="rounded-[28px] border border-white/80 bg-white/60 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
 

      <p className="mt-4 text-sm text-slate-500">
        Current polygon points:{" "}
        <span className="font-bold text-slate-900">{currentPointsCount}</span>
      </p>
    </section>
  );
}