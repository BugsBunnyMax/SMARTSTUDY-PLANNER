import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AuthContext } from '../context/AuthContext';
import sessionService from '../services/sessionService';
import taskService from '../services/taskService';

const CalendarPage = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [studyBlockSettings, setStudyBlockSettings] = useState({
    planningDaysAdvance: 3,
    sessionDuration: 60,
    sessionStartTime: 18,
  });
  const [conflicts, setConflicts] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const calendarRef = React.useRef(null);

  const formatICSDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const result = await taskService.getTasks();
        setTasks(result.tasks || []);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    };

    const loadSessions = async () => {
      try {
        const result = await sessionService.getSessions();
        setSessions(result.sessions || []);
      } catch (error) {
        console.error('Failed to load sessions:', error);
      }
    };

    if (isAuthenticated) {
      loadTasks();
      loadSessions();
    }
  }, [isAuthenticated]);

  // Generate events from tasks
  const events = useMemo(() => {
    const now = new Date();
    const newConflicts = [];

    const eventList = tasks.flatMap((task) => {
      if (!task.dueDate || task.status === 'completed') {
        return [];
      }

      const dueDate = new Date(task.dueDate);
      const overdue = dueDate < now;
      const dayDistance = Math.max(
        0,
        Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)),
      );
      const planningDays = Math.min(
        Math.max(dayDistance, 1),
        studyBlockSettings.planningDaysAdvance,
      );

      const sessionDate = new Date(dueDate);
      sessionDate.setDate(dueDate.getDate() - planningDays);
      if (sessionDate < now) {
        sessionDate.setDate(now.getDate());
      }
      sessionDate.setHours(studyBlockSettings.sessionStartTime, 0, 0, 0);

      const sessionDuration = studyBlockSettings.sessionDuration;
      const sessionEnd = new Date(sessionDate);
      sessionEnd.setMinutes(sessionEnd.getMinutes() + sessionDuration);

      const sessionDateKey = sessionDate.toISOString().split('T')[0];
      const existingSession = sessions.find((session) => {
        return (
          session.taskId === task._id &&
          new Date(session.startTime).toISOString().split('T')[0] ===
            sessionDateKey
        );
      });
      const isSessionCompleted = Boolean(existingSession?.completed);

      return [
        {
          id: `${task._id}-session`,
          title: `Study ${task.course || task.title}`,
          start: sessionDate.toISOString(),
          end: sessionEnd.toISOString(),
          backgroundColor: isSessionCompleted
            ? '#10b981'
            : task.priority === 'high' || task.priority === 'urgent'
              ? '#ef4444'
              : task.priority === 'medium'
                ? '#f59e0b'
                : '#22c55e',
          borderColor: isSessionCompleted ? '#059669' : undefined,
          textColor: '#ffffff',
          editable: true,
          durationEditable: false,
          extendedProps: {
            taskId: task._id,
            sessionId: existingSession?._id,
            description: task.description,
            dueDate: dueDate.toLocaleDateString(),
            status: task.status,
            eventType: 'session',
            isCompleted: isSessionCompleted,
          },
        },
        {
          id: `${task._id}-due`,
          title: `Due: ${task.title}`,
          start: dueDate.toISOString(),
          allDay: true,
          backgroundColor: overdue ? '#c2410c' : '#0ea5e9',
          textColor: '#ffffff',
          editable: true,
          extendedProps: {
            taskId: task._id,
            description: task.description,
            dueDate: dueDate.toLocaleDateString(),
            status: task.status,
            eventType: 'due',
          },
        },
      ];
    });

    // Detect conflicts (overlapping study sessions)
    for (let i = 0; i < eventList.length; i++) {
      for (let j = i + 1; j < eventList.length; j++) {
        const event1 = eventList[i];
        const event2 = eventList[j];

        if (
          event1.extendedProps.eventType === 'session' &&
          event2.extendedProps.eventType === 'session'
        ) {
          const start1 = new Date(event1.start);
          const end1 = new Date(event1.end);
          const start2 = new Date(event2.start);
          const end2 = new Date(event2.end);

          if (start1 < end2 && end1 > start2) {
            newConflicts.push({
              event1Id: event1.id,
              event2Id: event2.id,
              event1Title: event1.title,
              event2Title: event2.title,
            });
          }
        }
      }
    }

    setConflicts(newConflicts);
    return eventList;
  }, [tasks, studyBlockSettings, sessions]);

  // Handle event drop (reschedule)
  const handleEventDrop = async (info) => {
    const { event } = info;
    const { taskId, eventType } = event.extendedProps;

    if (eventType === 'due') {
      const newDueDate = event.startStr.split('T')[0];
      try {
        await taskService.updateTask(taskId, { dueDate: newDueDate });
        const updatedTasks = tasks.map((task) =>
          task._id === taskId ? { ...task, dueDate: newDueDate } : task,
        );
        setTasks(updatedTasks);
      } catch (error) {
        console.error('Failed to update task due date:', error);
        info.revert();
      }
    }
  };

  // Handle session completion
  const getSessionForEvent = (event) => {
    return sessions.find((session) => {
      const sessionDate = new Date(session.startTime)
        .toISOString()
        .split('T')[0];
      const eventDate = new Date(event.start).toISOString().split('T')[0];
      return (
        session.taskId === event.extendedProps.taskId &&
        sessionDate === eventDate
      );
    });
  };

  const handleEventClick = (info) => {
    setSelectedEvent({
      event: info.event,
      session: getSessionForEvent(info.event),
    });
  };

  const toggleSessionCompletion = async () => {
    if (!selectedEvent) return;

    const { event, session } = selectedEvent;
    const eventSession = session || getSessionForEvent(event);
    const taskId = event.extendedProps.taskId;
    const sessionDate = new Date(event.start).toISOString();
    const sessionEnd = new Date(event.end).toISOString();
    const duration = Math.round(
      (new Date(sessionEnd) - new Date(sessionDate)) / 60000,
    );

    try {
      if (eventSession) {
        await sessionService.deleteSession(eventSession._id);
        setSessions(sessions.filter((item) => item._id !== eventSession._id));
      } else {
        const result = await sessionService.createSession({
          taskId,
          startTime: sessionDate,
          endTime: sessionEnd,
          duration,
          completed: true,
          notes: [],
        });
        setSessions([...sessions, result.session]);
      }
    } catch (error) {
      console.error('Unable to save session status:', error);
    }

    setSelectedEvent(null);
  };

  // Export to ICS
  const exportToICS = () => {
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SmartStudy Planner//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:SmartStudy Planner
X-WR-TIMEZONE:UTC
`;

    let eventCount = 0;
    events.forEach((event) => {
      const icsStart = formatICSDate(event.start);
      const icsEnd = formatICSDate(event.end);
      if (!icsStart || !icsEnd) {
        return;
      }

      eventCount += 1;
      icsContent += `BEGIN:VEVENT
UID:${event.id}@smartstudy
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${icsStart}
DTEND:${icsEnd}
SUMMARY:${event.title}
DESCRIPTION:${event.extendedProps.description || 'No description'}
STATUS:${event.extendedProps.isCompleted ? 'COMPLETED' : 'CONFIRMED'}
END:VEVENT
`;
    });

    if (eventCount === 0) {
      alert('No valid calendar events are available for export.');
      return;
    }

    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartstudy-calendar-${new Date().toISOString().split('T')[0]}.ics`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Export to Google Calendar (generates link)
  const exportToGoogleCalendar = () => {
    if (events.length === 0) {
      alert('No events to export');
      return;
    }

    const event = events[0];
    const start = formatICSDate(event.start);
    const end = formatICSDate(event.end);
    if (!start || !end) {
      alert('Unable to export invalid event dates.');
      return;
    }

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title,
    )}&dates=${start}/${end}&details=${encodeURIComponent(event.extendedProps.description || '')}`;

    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 pt-20 sm:pt-24 md:pt-28 dark:from-slate-900 dark:to-slate-800 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12">
        <div className="mb-6 sm:mb-8 rounded-2xl border-l-4 border-sky-500 bg-[var(--surface-soft)]/80 dark:bg-[var(--surface-soft)]/50 backdrop-blur px-4 sm:px-6 py-3 sm:py-4 animate-welcome dark:border-sky-400">
          <p className="text-base sm:text-lg text-[var(--text)] font-bold">
            Plan your study sessions
          </p>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 sm:mt-2">
            Drag tasks to reschedule, click sessions to mark complete, and
            export your calendar.
          </p>
        </div>

        {/* Settings and Export Bar */}
        <div className="mb-4 sm:mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="rounded-2xl border border-slate-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 w-full sm:w-auto dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {showSettings ? 'Hide Settings' : 'Study Block Settings'}
          </button>
          <button
            onClick={() => setShowExportModal(!showExportModal)}
            className="rounded-2xl border border-sky-300 bg-sky-50 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-sky-700 hover:bg-sky-100 w-full sm:w-auto dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-400 dark:hover:bg-sky-900/50"
          >
            {showExportModal ? 'Hide Export' : 'Export Calendar'}
          </button>
        </div>

        {/* Study Block Settings */}
        {showSettings && (
          <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 dark:text-slate-100">
              Study Block Customization
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 dark:text-slate-300">
                  Planning Days in Advance
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={studyBlockSettings.planningDaysAdvance}
                  onChange={(e) =>
                    setStudyBlockSettings({
                      ...studyBlockSettings,
                      planningDaysAdvance: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-slate-800 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
                <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                  Schedule study sessions 1-7 days before due date
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 dark:text-slate-300">
                  Session Duration (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="180"
                  step="15"
                  value={studyBlockSettings.sessionDuration}
                  onChange={(e) =>
                    setStudyBlockSettings({
                      ...studyBlockSettings,
                      sessionDuration: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
                <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                  Duration of each study session
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 dark:text-slate-300">
                  Session Start Time (24-hour)
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={studyBlockSettings.sessionStartTime}
                  onChange={(e) =>
                    setStudyBlockSettings({
                      ...studyBlockSettings,
                      sessionStartTime: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
                <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                  Daily time to start study sessions (0-23)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Export Calendar
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={exportToICS}
                className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                Export as ICS
              </button>
              <button
                onClick={exportToGoogleCalendar}
                className="rounded-2xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
              >
                Open in Google Calendar
              </button>
              <p className="text-xs text-slate-500 self-center">
                ICS exports all events; Google Calendar link opens first event
              </p>
            </div>
          </div>
        )}

        {/* Conflicts Alert */}
        {conflicts.length > 0 && (
          <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-sm font-semibold text-amber-900">
              ⚠️ {conflicts.length} scheduling conflict
              {conflicts.length !== 1 ? 's' : ''} detected:
            </p>
            <ul className="mt-2 text-sm text-amber-800 space-y-1">
              {conflicts.map((conflict, idx) => (
                <li key={idx}>
                  {conflict.event1Title} overlaps with {conflict.event2Title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Calendar */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 overflow-hidden">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            editable={true}
            eventDrop={handleEventDrop}
            eventClick={handleEventClick}
            height="auto"
            contentHeight="auto"
          />
        </div>

        {/* Session Completion Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900">
                {selectedEvent.event.title}
              </h3>
              <p className="mt-2 text-slate-600">
                {new Date(selectedEvent.event.start).toLocaleString()} to{' '}
                {new Date(selectedEvent.event.end).toLocaleString()}
              </p>
              {selectedEvent.event.extendedProps.description && (
                <p className="mt-3 text-sm text-slate-600">
                  {selectedEvent.event.extendedProps.description}
                </p>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Close
                </button>
                {selectedEvent.event.extendedProps.eventType === 'session' && (
                  <button
                    onClick={toggleSessionCompletion}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold text-white ${
                      selectedEvent.event.extendedProps.isCompleted
                        ? 'bg-slate-400 hover:bg-slate-500'
                        : 'bg-emerald-500 hover:bg-emerald-600'
                    }`}
                  >
                    {selectedEvent.event.extendedProps.isCompleted
                      ? 'Mark Incomplete'
                      : 'Mark Complete'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">
            Calendar Legend
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-slate-700">
                High/Urgent Priority
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-amber-500"></div>
              <span className="text-sm text-slate-700">Medium Priority</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-slate-700">
                Low Priority / Completed
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-sky-500"></div>
              <span className="text-sm text-slate-700">Due Date</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
