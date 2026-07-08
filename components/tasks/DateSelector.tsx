type DateSelectorProps = {
  selectedDate: string;
  onDateChange: (date: string) => void;
};

function parseLocalDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTodayDate() {
  return formatLocalDate(new Date());
}

function getReadableDate(date: string) {
  return parseLocalDate(date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function DateSelector({
  selectedDate,
  onDateChange,
}: DateSelectorProps) {
  const goToPreviousDay = () => {
    const date = parseLocalDate(selectedDate);
    date.setDate(date.getDate() - 1);
    onDateChange(formatLocalDate(date));
  };

  const goToNextDay = () => {
    const date = parseLocalDate(selectedDate);
    date.setDate(date.getDate() + 1);
    onDateChange(formatLocalDate(date));
  };

  return (
    <section className="rounded-[28px] border border-white/80 bg-white/60 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">
            Selected Date
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {getReadableDate(selectedDate)}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={goToPreviousDay}
            className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-white"
          >
            Previous
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(event) => onDateChange(event.target.value)}
            className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 font-semibold text-slate-700 shadow-sm outline-none transition focus:ring-4 focus:ring-violet-100"
          />

          <button
            onClick={() => onDateChange(getTodayDate())}
            className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 font-semibold text-violet-700 shadow-sm transition hover:bg-violet-100"
          >
            Today
          </button>

          <button
            onClick={goToNextDay}
            className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-white"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}