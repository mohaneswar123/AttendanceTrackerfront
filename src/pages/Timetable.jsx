import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AttendanceContext } from '../contexts/AttendanceContext';
import useTimetable from '../hooks/useTimetable';
import useMediaQuery from '../hooks/useMediaQuery';
import { defaultTimes } from '../utils/calendarDate';
import { DAY_LONG, groupByDay, todayDay } from '../utils/timetable';
import ModeSelector from '../components/timetable/ModeSelector';
import ModeFormModal from '../components/timetable/ModeFormModal';
import DayTabs from '../components/timetable/DayTabs';
import DayTimeline from '../components/timetable/DayTimeline';
import ActivityFormModal from '../components/timetable/ActivityFormModal';
import CopyDayModal from '../components/timetable/CopyDayModal';
import WeekOverview from '../components/timetable/WeekOverview';
import ConfirmDialog from '../components/ConfirmDialog';
import LoginPrompt from '../components/LoginPrompt';

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
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const timetable = useTimetable();
  const [day, setDay] = useState(todayDay);
  const [view, setView] = useState('DAY');
  const [modeForm, setModeForm] = useState(null);      // { mode } to edit, or {} to create
  const [activityForm, setActivityForm] = useState(null); // { activity } to edit, or { initial }
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

  const openNewActivity = (forDay = day) =>
    setActivityForm({ initial: { dayOfWeek: forDay, ...newActivityTimes(activitiesByDay[forDay] || []) } });

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
    if (result.success) setNotice(`${mode.name} is now your active mode.`);
    else setNotice(result.message);
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
    <div className="space-y-4 md:space-y-5 pb-24 md:pb-0">
      <div className="flex items-center md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">My Timetable</h1>
          <p className="hidden md:block text-slate-400">Build a routine for each part of your life and switch between them.</p>
        </div>
        {modes.length > 0 && isDesktop && (
          <button onClick={() => openNewActivity()} className="btn btn-primary px-6 whitespace-nowrap">+ Add Activity</button>
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
        <section className="glass-panel rounded-3xl p-6 md:p-10 text-center max-w-xl mx-auto">
          <div className="text-5xl mb-4">🗓️</div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Start with a mode</h2>
          <p className="text-slate-400 mb-6">
            A mode is one weekly routine — College, Home, Exam Prep. Each has its own Monday to Sunday plan,
            and you switch whichever one you're living right now.
          </p>
          <button onClick={() => setModeForm({})} className="btn btn-primary px-6">Create your first mode</button>
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
            onDelete={setDeletingMode}
            onCreate={() => setModeForm({})}
          />

          <section className="glass-panel rounded-3xl p-4 md:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-1 p-1 rounded-xl bg-slate-900/60 border border-white/10" role="tablist" aria-label="View">
                {['DAY', 'WEEK'].map(value => (
                  <button
                    key={value}
                    role="tab"
                    aria-selected={view === value}
                    onClick={() => setView(value)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${view === value ? 'bg-primary-500/25 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {value === 'DAY' ? 'Day' : 'Week'}
                  </button>
                ))}
              </div>
              {view === 'DAY' && (
                <button
                  type="button"
                  onClick={() => setCopying(true)}
                  className="px-4 py-2 rounded-xl border border-white/10 bg-slate-900/50 text-sm font-semibold text-slate-300 hover:bg-white/5"
                >
                  Copy {DAY_LONG[day]}
                </button>
              )}
            </div>

            {view === 'DAY' ? (
              <>
                <DayTabs day={day} onChange={setDay} activitiesByDay={activitiesByDay} />
                <div>
                  <h2 className="sr-only">{DAY_LONG[day]}</h2>
                  <DayTimeline
                    activities={activitiesByDay[day] || []}
                    onEdit={(activity) => setActivityForm({ activity })}
                    onDelete={setDeletingActivity}
                    onAdd={() => openNewActivity()}
                  />
                </div>
              </>
            ) : (
              <WeekOverview
                activitiesByDay={activitiesByDay}
                onDayClick={(value) => {
                  setDay(value);
                  setView('DAY');
                }}
              />
            )}
          </section>
        </>
      )}

      {/* Add button within thumb reach on phones, above the bottom navigation */}
      {!isDesktop && modes.length > 0 && !activityForm && (
        <button
          type="button"
          onClick={() => openNewActivity()}
          aria-label="Add activity"
          className="fixed right-4 bottom-24 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 text-white text-3xl leading-none shadow-xl shadow-primary-900/50 active:scale-95 transition-transform"
        >
          +
        </button>
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

      {selectedMode && !selectedMode.active && (
        <p className="text-xs text-slate-500 text-center">
          You're looking at {selectedMode.name}. Your active mode is {modes.find(m => m.active)?.name || 'not set'}.
        </p>
      )}
    </div>
  );
}

export default Timetable;
