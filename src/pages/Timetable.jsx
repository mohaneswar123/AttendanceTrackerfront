import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AttendanceContext } from '../contexts/AttendanceContext';
import useTimetable from '../hooks/useTimetable';
import { defaultTimes } from '../utils/calendarDate';
import { DAY_LONG, groupByDay, todayDay } from '../utils/timetable';
import ModeSelector from '../components/timetable/ModeSelector';
import ModeFormModal from '../components/timetable/ModeFormModal';
import DayTabs from '../components/timetable/DayTabs';
import DayTimeline from '../components/timetable/DayTimeline';
import ActivityFormModal from '../components/timetable/ActivityFormModal';
import CopyDayModal from '../components/timetable/CopyDayModal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoginPrompt from '../components/LoginPrompt';

const TRASH_ICON = (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

function Timetable() {
  const { currentUser } = useContext(AttendanceContext);
  if (!currentUser) {
    return (
      <LoginPrompt
        icon="🗓️"
        title="Your weekly timetable"
        message="Log in to build routines for college, home or exam week."
      />
    );
  }
  return <TimetablePage />;
}

// A new activity starts where the day's last one ended, or at 9 AM on an empty day
function newActivityTimes(dayActivities) {
  const last = dayActivities[dayActivities.length - 1];
  return defaultTimes(last ? last.endMinutes : 9 * 60);
}

function TimetablePage() {
  const timetable = useTimetable();
  const [day, setDay] = useState(todayDay);
  const [modeForm, setModeForm] = useState(null);          // { mode } to edit, or {} to create
  const [activityForm, setActivityForm] = useState(null);  // { activity } to edit, or { initial }
  const [copying, setCopying] = useState(false);
  const [deletingMode, setDeletingMode] = useState(null);
  const [deletingActivity, setDeletingActivity] = useState(null);
  const [notice, setNotice] = useState('');

  const activitiesByDay = useMemo(() => groupByDay(timetable.activities), [timetable.activities]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const closeModeForm = useCallback(() => setModeForm(null), []);
  const closeActivityForm = useCallback(() => setActivityForm(null), []);
  const closeCopy = useCallback(() => setCopying(false), []);
  const cancelDeleteMode = useCallback(() => setDeletingMode(null), []);
  const cancelDeleteActivity = useCallback(() => setDeletingActivity(null), []);

  const openNewActivity = () =>
    setActivityForm({ initial: { dayOfWeek: day, ...newActivityTimes(activitiesByDay[day] || []) } });

  const handleSaveMode = async (fields) => {
    const result = await timetable.saveMode(modeForm.mode?.id, fields);
    if (result.success) setModeForm(null);
    return result;
  };

  const handleSaveActivity = async (fields) => {
    const result = await timetable.saveActivity(activityForm.activity?.id, fields);
    if (result.success) {
      setActivityForm(null);
      if (fields.dayOfWeek !== day) {
        setDay(fields.dayOfWeek);
        setNotice(`Saved on ${DAY_LONG[fields.dayOfWeek]}.`);
      }
    }
    return result;
  };

  const handleCopy = async (toDays) => {
    const result = await timetable.copyDay(day, toDays);
    if (result.success) {
      setCopying(false);
      setNotice(`${DAY_LONG[day]} copied to ${toDays.map(d => DAY_LONG[d]).join(', ')}.`);
    }
    return result;
  };

  const handleSetActive = async (mode) => {
    const result = await timetable.activateMode(mode.id);
    setNotice(result.success ? `${mode.name} is now your active mode.` : result.message);
  };

  const handleDeleteMode = async () => {
    const mode = deletingMode;
    setDeletingMode(null);
    const result = await timetable.deleteMode(mode.id);
    setNotice(result.success ? `${mode.name} was deleted.` : result.message);
  };

  const handleDeleteActivity = async () => {
    const activity = deletingActivity;
    setDeletingActivity(null);
    const result = await timetable.deleteActivity(activity.id);
    if (!result.success) setNotice(result.message);
  };

  const { modes, selectedMode, loading } = timetable;

  return (
    <div className="space-y-4 pb-24 md:pb-0">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">My Timetable</h1>
        {modes.length > 0 && (
          <button
            type="button"
            onClick={openNewActivity}
            aria-label="Add activity"
            className="shrink-0 flex items-center gap-2 h-11 px-3.5 md:px-5 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-semibold shadow-lg shadow-primary-900/40 active:scale-95 transition"
          >
            <span className="text-2xl leading-none" aria-hidden="true">+</span>
            <span className="hidden md:inline">Add Activity</span>
          </button>
        )}
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-secondary-500/10 border border-secondary-500/30 text-secondary-200 text-sm" role="status">
          {notice}
        </div>
      )}

      {timetable.error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm flex items-center gap-3" role="alert">
          <span className="flex-1">{timetable.error}</span>
          <button onClick={timetable.clearError} className="text-rose-300 hover:text-white text-xs font-semibold">Dismiss</button>
        </div>
      )}

      {loading && modes.length === 0 && <p className="text-slate-400">Loading your timetable…</p>}

      {/* Nothing yet: explain modes once, then get out of the way */}
      {!loading && modes.length === 0 && (
        <section className="glass-panel rounded-3xl p-6 md:p-10 text-center max-w-md mx-auto mt-6">
          <div className="text-6xl mb-5">🗓️</div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Create your first mode</h2>
          <p className="text-slate-400 mb-6">
            Set up a weekly routine for your college, home, office or any mode you create.
          </p>
          <button onClick={() => setModeForm({})} className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold">
            + Create Mode
          </button>
        </section>
      )}

      {modes.length > 0 && (
        <>
          <ModeSelector
            modes={modes}
            selectedModeId={timetable.selectedModeId}
            onSelect={timetable.selectMode}
            onSetActive={handleSetActive}
            onEdit={(mode) => setModeForm({ mode })}
            onCopyDay={() => setCopying(true)}
            onDelete={setDeletingMode}
            onCreate={() => setModeForm({})}
          />

          <section className="glass-panel rounded-3xl p-3 md:p-5 space-y-4">
            <DayTabs day={day} onChange={setDay} />
            <h2 className="sr-only">{DAY_LONG[day]}</h2>
            <DayTimeline
              activities={activitiesByDay[day] || []}
              onEdit={(activity) => setActivityForm({ activity })}
              onDelete={setDeletingActivity}
              onAdd={openNewActivity}
            />
          </section>

          {selectedMode && !selectedMode.active && (
            <p className="text-xs text-slate-500 text-center">
              You're looking at {selectedMode.name}. Your active mode is {modes.find(m => m.active)?.name || 'not set'}.
            </p>
          )}
        </>
      )}

      {modeForm && <ModeFormModal mode={modeForm.mode} onSave={handleSaveMode} onClose={closeModeForm} />}

      {activityForm && (
        <ActivityFormModal
          activity={activityForm.activity}
          initial={activityForm.initial}
          activitiesByDay={activitiesByDay}
          onSave={handleSaveActivity}
          onClose={closeActivityForm}
        />
      )}

      {copying && (
        <CopyDayModal fromDay={day} activitiesByDay={activitiesByDay} onCopy={handleCopy} onClose={closeCopy} />
      )}

      {deletingMode && (
        <ConfirmDialog
          title="Delete this mode?"
          message={`Are you sure you want to delete “${deletingMode.name}”? This will permanently delete the mode and all its weekly timetable activities. This action cannot be undone.`}
          confirmLabel="Delete Mode"
          danger
          icon={TRASH_ICON}
          onConfirm={handleDeleteMode}
          onCancel={cancelDeleteMode}
        />
      )}

      {deletingActivity && (
        <ConfirmDialog
          title="Delete this activity?"
          message={`"${deletingActivity.title}" will be removed from ${DAY_LONG[deletingActivity.dayOfWeek]}.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDeleteActivity}
          onCancel={cancelDeleteActivity}
        />
      )}
    </div>
  );
}

export default Timetable;
