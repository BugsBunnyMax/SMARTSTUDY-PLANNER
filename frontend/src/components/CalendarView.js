import React from 'react';

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const CalendarView = ({ sessions }) => {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(day.getDate() + index);
    return day;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Weekly study calendar
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your planned sessions based on due dates and task effort.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {days.map((day) => {
          const daySessions = sessions.filter((session) => {
            const sessionDate = new Date(session.startTime);
            return (
              sessionDate.getFullYear() === day.getFullYear() &&
              sessionDate.getMonth() === day.getMonth() &&
              sessionDate.getDate() === day.getDate()
            );
          });

          return (
            <div
              key={day.toISOString()}
              className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4"
            >
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                {day.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </h4>

              {daySessions.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No sessions planned.
                </p>
              ) : (
                <div className="space-y-3">
                  {daySessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-slate-100 dark:bg-slate-700 rounded-2xl p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {session.title}
                        </span>
                        <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {session.course || 'General'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {session.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>
                          {formatTime(session.startTime)} -{' '}
                          {formatTime(session.endTime)}
                        </span>
                        <span>{session.duration} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
