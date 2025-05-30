import React, { useEffect, useState } from "react";

type ClassItem = {
  day: string;
  start: string; // e.g., "9:00"
  end: string;   // e.g., "10:30"
  name: string;
  room: string;
  color: string; // Tailwind color classes from backend or map them locally
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const hours = [
  "8:00", "9:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00"
];

// Helper functions to convert time to position and duration in pixels
const getPosition = (time: string) => {
  const [hourStr, minStr] = time.split(":");
  const hour = parseInt(hourStr);
  const minute = parseInt(minStr);
  return (hour - 8) * 60 + minute; // minutes from 8:00 AM
};

const getDuration = (start: string, end: string) => {
  return getPosition(end) - getPosition(start);
};

export function WeeklySchedule() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const res = await fetch("/api/schedule"); // Replace with your real API endpoint
        if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
        const data: ClassItem[] = await res.json();
        setClasses(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchSchedule();
  }, []);

  if (loading) return <div>Loading schedule...</div>;
  if (error) return <div>Error loading schedule: {error}</div>;

  return (
    <div className="overflow-x-auto relative" style={{ minHeight: "600px" }}>
      <div className="min-w-[800px]">
        {/* Schedule Grid Header */}
        <div className="grid grid-cols-[100px_repeat(5,1fr)] border rounded-lg bg-muted/20">
          <div className="p-2 font-medium text-center border-r border-b">Time</div>
          {days.map((day) => (
            <div key={day} className="p-2 font-medium text-center border-r border-b last:border-r-0">
              {day}
            </div>
          ))}

          {hours.map((hour) => (
            <React.Fragment key={hour}>
              <div className="p-2 text-sm text-center border-r">{hour}</div>
              {days.map((day) => (
                <div key={`${day}-${hour}`} className="border-r last:border-r-0 relative">
                  <div className="absolute inset-x-0 top-0 border-t border-dashed border-muted"></div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>

        {/* Render Classes */}
        {classes.map((cls, i) => {
          const dayIndex = days.indexOf(cls.day);
          if (dayIndex === -1) return null; // Skip invalid day

          const top = getPosition(cls.start);
          const height = getDuration(cls.start, cls.end);

          // You can sanitize or map color classes here if needed
          const classColor = cls.color || "bg-gray-100 border-gray-300 text-gray-700";

          return (
            <div
              key={i}
              className={`absolute rounded-md border p-2 ${classColor}`}
              style={{
                top: `${top + 41}px`, // 41px to offset header height
                left: `${100 + dayIndex * (700 / 5) + 1}px`,
                height: `${height}px`,
                width: `${700 / 5 - 2}px`,
              }}
            >
              <div className="font-medium text-sm">{cls.name}</div>
              <div className="text-xs">{cls.room}</div>
              <div className="text-xs mt-1">
                {cls.start} - {cls.end}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
