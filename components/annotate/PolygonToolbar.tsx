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
      <div className="grid gap-4 xl:grid-cols-[1fr_2fr] xl:items-end">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Annotation Class
          </label>

          <select
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 font-semibold text-slate-800 shadow-sm outline-none focus:ring-4 focus:ring-violet-100"
          >
            <option value="Tumor">Tumor</option>
            <option value="Normal">Normal</option>
            <option value="Region">Region</option>
            <option value="Object">Object</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsDrawing(true)}
            className={`rounded-2xl px-4 py-3 text-sm font-bold shadow-sm transition ${
              isDrawing
                ? "bg-violet-600 text-white"
                : "bg-violet-50 text-violet-700 hover:bg-violet-100"
            }`}
          >
            Draw Polygon
          </button>

          <button
            onClick={onFinish}
            disabled={currentPointsCount < 3}
            className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700 shadow-sm transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Finish Polygon
          </button>

          <button
            onClick={onSave}
            disabled={currentPointsCount < 3 || saving}
            className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            onClick={onCancel}
            className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-200"
          >
            Cancel
          </button>

          <button
            onClick={onDelete}
            disabled={!selectedPolygonId}
            className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 shadow-sm transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete Selected
          </button>

          <button
            onClick={() => setHideAnnotations(!hideAnnotations)}
            className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-white"
          >
            {hideAnnotations ? "Show Annotations" : "Hide Annotations"}
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        Current polygon points:{" "}
        <span className="font-bold text-slate-900">{currentPointsCount}</span>
      </p>
    </section>
  );
}