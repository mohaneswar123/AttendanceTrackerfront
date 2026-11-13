import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AttendanceContext } from '../../contexts/AttendanceContext';
import { PLAN_WEEK, subjectTone, weekdayKeyOf } from '../../utils/attendance';
import { todayLocal } from '../../utils/date';
import ConfirmDialog from '../ConfirmDialog';
import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  PencilIcon,
  PlusIcon,
  ResetIcon,
  TrashIcon
} from '../icons';

/** Compares two period arrays to see if they are identical in subjects and hours */
function isScheduleEqual(listA = [], listB = []) {
  if (listA.length !== listB.length) return false;
  for (let i = 0; i < listA.length; i++) {
    if (listA[i].subjectId !== listB[i].subjectId || Number(listA[i].hours) !== Number(listB[i].hours)) {
      return false;
    }
  }
  return true;
}

/**
 * Professional Form-Based Day Configuration (Matching User Layout).
 *
 * Controls:
 * - Day tabs: Mon, Tue, Wed, Thu, Fri, Sat, Sun.
 * - Header: "{Day} Schedule", "{count} periods · {hours} hours total", Edit, Delete.
 * - Table format with column headers: P.NO, SUBJECT, HOURS.
 * - Each row: Period badge (P1, P2...), Subject dropdown select, Hours dropdown select, trash icon.
 * - "+ Add Period (P<next>)" button.
 * - Lock/Edit workflow:
 *   - After saving, editing requires clicking the "Edit Schedule" button.
 *   - While editing, fields are interactive, and "Discard" and "✓ Save {Day} Schedule" buttons are active.
 *   - After saving, state is persisted and locked into saved view mode.
 */
function PlanEditor({ plan, saving, error, onSaveDay }) {
  const { subjects } = useContext(AttendanceContext);

  // Opens on today's weekday
  const [dayKey, setDayKey] = useState(() => weekdayKeyOf(todayLocal()));

  // Edit mode toggle per day: true when editing, false after saving
  const [isEditing, setIsEditing] = useState(false);

  // Local drafts keyed by weekday, initialized from server plan
  const [drafts, setDrafts] = useState({});

  // UI state for dialogs, errors, and notices
  const [confirmClear, setConfirmClear] = useState(false);
  const [notice, setNotice] = useState('');
  const [validationError, setValidationError] = useState('');

  // Auto-dismiss notice banner
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  // Keep draft in sync with plan when plan arrives/updates from server
  useEffect(() => {
    if (!plan) return;
    setDrafts(prev => {
      const next = { ...prev };
      Object.keys(plan).forEach(key => {
        if (!next[key]) {
          next[key] = [...(plan[key] || [])];
        }
      });
      return next;
    });
  }, [plan]);

  if (plan === null) {
    return (
      <section className="surface p-8 text-center" aria-label="Loading your class plan">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400">Loading your weekly timetable plan…</p>
      </section>
    );
  }

  const currentDay = PLAN_WEEK.find(item => item.key === dayKey) || PLAN_WEEK[0];
  const savedClassesForDay = plan[dayKey] || [];
  const currentClasses = drafts[dayKey] !== undefined ? drafts[dayKey] : savedClassesForDay;

  // Determine if this day's draft differs from saved plan
  const isDirty = !isScheduleEqual(currentClasses, savedClassesForDay);

  // Calculate day metrics
  const totalClasses = currentClasses.length;
  const totalHours = currentClasses.reduce((sum, item) => sum + (Number(item.hours) || 1), 0);

  const subjectOf = (id) => (subjects || []).find(subject => subject._id === id);

  // Helper to update draft for current day
  const updateCurrentDraft = (nextClasses) => {
    setDrafts(prev => ({ ...prev, [dayKey]: nextClasses }));
    setValidationError('');
  };

  // Add a new period slot to the day
  const handleAddPeriod = () => {
    if (totalClasses >= 12) {
      setValidationError('A day can hold at most 12 class periods.');
      return;
    }
    const defaultSubject = (subjects && subjects.length > 0) ? subjects[0]._id : '';
    const next = [...currentClasses, { subjectId: defaultSubject, hours: 1 }];
    updateCurrentDraft(next);
    setIsEditing(true);
  };

  // Change subject for a specific period
  const handleSubjectChange = (index, subjectId) => {
    const next = currentClasses.map((item, i) => (i === index ? { ...item, subjectId } : item));
    updateCurrentDraft(next);
  };

  // Change duration of a specific period
  const handleChangeHours = (index, hours) => {
    const next = currentClasses.map((item, i) => (i === index ? { ...item, hours: Number(hours) || 1 } : item));
    updateCurrentDraft(next);
  };

  // Remove a period from the day
  const handleRemovePeriod = (index) => {
    const next = currentClasses.filter((_, i) => i !== index);
    updateCurrentDraft(next);
  };

  // Save the current day schedule
  const handleSave = async () => {
    setValidationError('');

    // Ensure all periods have a valid subject selected
    const unassigned = currentClasses.findIndex(c => !c.subjectId);
    if (unassigned !== -1) {
      setValidationError(`Please select a subject for Period ${unassigned + 1} before saving.`);
      return;
    }

    const cleanList = currentClasses.map(({ subjectId, hours }) => ({
      subjectId,
      hours: Number(hours) || 1
    }));

    const result = await onSaveDay(dayKey, cleanList);
    if (result.success) {
      setDrafts(prev => ({ ...prev, [dayKey]: cleanList }));
      setIsEditing(false);
      setNotice(`${currentDay.long}'s schedule saved successfully!`);
    }
  };

  // Discard edits and revert to saved state
  const handleDiscard = () => {
    setDrafts(prev => ({ ...prev, [dayKey]: [...savedClassesForDay] }));
    setValidationError('');
    setIsEditing(false);
  };

  // Clear all periods for the day
  const handleClearDay = () => {
    updateCurrentDraft([]);
    setConfirmClear(false);
    setIsEditing(true);
  };

  // Day switch handler
  const handleSelectDay = (key) => {
    setDayKey(key);
    setIsEditing(false);
    setValidationError('');
  };

  return (
    <div className="space-y-6 md:max-w-3xl">
      {/* Top Header: Section title + Day Switcher Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line">
        <div className="flex items-center gap-2 text-primary-500 font-semibold text-sm">
          <CalendarIcon className="w-5 h-5" />
          <span>Timetable Plan</span>
        </div>

        {/* Day Selector Pills */}
        <div
          className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0"
          role="tablist"
          aria-label="Day of week"
        >
          {PLAN_WEEK.map(item => {
            const active = item.key === dayKey;
            const dayDraft = drafts[item.key] !== undefined ? drafts[item.key] : (plan[item.key] || []);
            const dayDirty = !isScheduleEqual(dayDraft, plan[item.key] || []);

            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleSelectDay(item.key)}
                className={`h-9 px-3 shrink-0 rounded-lg text-sm font-semibold transition-all inline-flex items-center gap-1.5 ${
                  active
                    ? 'bg-primary-500/15 border border-primary-500/50 text-primary-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                <span>{item.short}</span>
                {dayDirty && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
                    title="Unsaved changes"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Alerts */}
      {error && <div className="notice notice-danger text-sm" role="alert">{error}</div>}
      {notice && <div className="notice notice-success text-sm" role="status">{notice}</div>}
      {validationError && <div className="notice notice-warning text-sm" role="alert">{validationError}</div>}

      {/* Main Day Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {currentDay.long} Schedule
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {totalClasses} {totalClasses === 1 ? 'period' : 'periods'} ·{' '}
            <span className="font-semibold text-slate-200">
              {totalHours} {totalHours === 1 ? 'hours' : 'hours'} total
            </span>
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="btn btn-primary h-10 px-4 text-sm font-semibold gap-2 shadow-sm"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Edit Schedule</span>
            </button>
          ) : null}

          {totalClasses > 0 && isEditing && (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              title="Clear all classes for this day"
              aria-label="Clear all periods from this day"
              className="h-10 w-10 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Periods Configuration Card */}
      <div className="surface p-4 sm:p-6 space-y-4 rounded-2xl border border-line">
        {/* Table Column Headers */}
        <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <div className="w-10 sm:w-12 shrink-0 text-center">P.NO</div>
          <div className="flex-1 min-w-0">SUBJECT</div>
          <div className="w-24 sm:w-28 shrink-0">HOURS</div>
          {isEditing && <div className="w-9 shrink-0" aria-hidden="true" />}
        </div>

        {/* Periods List */}
        {totalClasses === 0 ? (
          <div className="p-8 text-center border border-dashed border-line rounded-xl space-y-3">
            <p className="text-sm font-medium text-slate-300">
              No classes scheduled for {currentDay.long} yet.
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add periods to set up your routine for {currentDay.long}. They will appear as a quick checklist in Record Attendance.
            </p>
            <button
              type="button"
              onClick={handleAddPeriod}
              disabled={(subjects || []).length === 0}
              className="btn btn-primary h-9 text-xs px-4 gap-1.5"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>Add Period (P1)</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {currentClasses.map((item, index) => {
              const currentSubject = subjectOf(item.subjectId);
              const tone = subjectTone(currentSubject || { name: '' });

              return (
                <div
                  key={`${item.subjectId || 'unassigned'}-${index}`}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl bg-background-surface/80 border border-line hover:border-slate-700 transition-colors"
                >
                  {/* Period Badge */}
                  <div className="w-10 sm:w-12 shrink-0 flex items-center justify-center">
                    <span className="w-9 h-10 rounded-lg bg-white/5 border border-line flex items-center justify-center font-bold text-xs text-slate-300 font-mono">
                      P{index + 1}
                    </span>
                  </div>

                  {/* Subject Selector */}
                  <div className="flex-1 min-w-0 relative">
                    {isEditing ? (
                      <div className="relative">
                        <select
                          value={item.subjectId}
                          onChange={(e) => handleSubjectChange(index, e.target.value)}
                          aria-label={`Subject for Period ${index + 1}`}
                          className="w-full h-11 rounded-xl bg-background-paper border border-line px-3.5 pr-8 text-sm font-medium text-white truncate appearance-none focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                        >
                          <option value="">Select a subject…</option>
                          {subjects.map(s => (
                            <option key={s._id} value={s._id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    ) : (
                      <div className="h-11 rounded-xl bg-background-paper/60 border border-line/60 px-3.5 flex items-center gap-2.5 min-w-0">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${tone.dot}`} aria-hidden="true" />
                        <span className="text-sm font-semibold text-white truncate">
                          {currentSubject?.name || <span className="text-rose-400 italic">No subject selected</span>}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Hours Dropdown Selector */}
                  <div className="w-24 sm:w-28 shrink-0 relative">
                    {isEditing ? (
                      <div className="relative">
                        <select
                          value={Number(item.hours) || 1}
                          onChange={(e) => handleChangeHours(index, Number(e.target.value))}
                          aria-label={`Hours for Period ${index + 1}`}
                          className="w-full h-11 rounded-xl bg-background-paper border border-line px-3 pr-7 text-sm font-semibold text-white appearance-none focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                        >
                          <option value={1}>1 hr</option>
                          <option value={2}>2 hrs</option>
                          <option value={3}>3 hrs</option>
                        </select>
                        <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    ) : (
                      <div className="h-11 rounded-xl bg-background-paper/60 border border-line/60 px-3 flex items-center justify-center text-sm font-semibold text-slate-200">
                        {item.hours} {item.hours === 1 ? 'hr' : 'hrs'}
                      </div>
                    )}
                  </div>

                  {/* Remove Period Button */}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemovePeriod(index)}
                      title="Remove period"
                      aria-label={`Remove Period ${index + 1}`}
                      className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Period Button Row */}
        {isEditing && (
          <button
            type="button"
            onClick={handleAddPeriod}
            disabled={totalClasses >= 12 || (subjects || []).length === 0}
            className="w-full py-3.5 rounded-xl border border-dashed border-primary-500/40 text-primary-400 hover:bg-primary-500/5 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Period (P{totalClasses + 1})</span>
          </button>
        )}

        {(subjects || []).length === 0 && (
          <div className="notice notice-warning text-xs mt-3">
            <span>
              You haven't added any subjects yet.{' '}
              <Link to="/attendance/subjects" className="font-semibold underline underline-offset-2 text-white">
                Add subjects first
              </Link>{' '}
              to assign them to periods.
            </span>
          </div>
        )}
      </div>

      {/* Bottom Save / Discard Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="text-sm">
          {!isEditing ? (
            <span className="text-slate-400">
              All changes for {currentDay.long} are saved.
            </span>
          ) : isDirty ? (
            <span className="text-amber-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Unsaved changes for {currentDay.long}
            </span>
          ) : (
            <span className="text-slate-400">
              You are editing {currentDay.long}'s schedule.
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleDiscard}
                disabled={saving}
                className="btn btn-secondary h-11 px-5 text-sm font-medium gap-2"
              >
                <ResetIcon className="w-4 h-4 text-slate-400" />
                <span>Discard</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || (!isDirty && savedClassesForDay.length > 0)}
                className="btn btn-primary h-11 px-6 text-sm font-semibold gap-2 shadow-md disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving…</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    <span>Save {currentDay.long} Schedule</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="btn btn-primary h-11 px-6 text-sm font-semibold gap-2 shadow-md"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Edit {currentDay.long} Schedule</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Clearing Day */}
      {confirmClear && (
        <ConfirmDialog
          title={`Clear ${currentDay.long}'s Schedule?`}
          message={`This will remove all ${currentClasses.length} planned class periods from ${currentDay.long}. Click Discard to undo or Save to persist.`}
          confirmLabel="Clear All Periods"
          danger
          icon={<TrashIcon className="w-5 h-5 text-rose-400" />}
          onConfirm={handleClearDay}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </div>
  );
}

export default PlanEditor;
