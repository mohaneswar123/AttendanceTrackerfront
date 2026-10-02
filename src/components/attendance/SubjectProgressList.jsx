import React from 'react';
import { initialOf, subjectTone } from '../../utils/attendance';

// One row per subject: how it is doing, at a glance.
function SubjectProgressList({ subjects, onAdd }) {
  if (subjects.length === 0) {
    return (
      <section className="surface p-6 text-center" aria-label="Subjects">
        <p className="font-semibold text-white">No subjects yet</p>
        <p className="text-sm text-slate-500 mt-1 mb-4">Add the classes you want to track.</p>
        <button onClick={onAdd} className="btn btn-primary px-5">Add a subject</button>
      </section>
    );
  }

  return (
    <section className="surface divide-y divide-line" aria-label="Subjects">
      {subjects.map(subject => {
        const tone = subjectTone(subject.name);
        const percentage = subject.percentage ?? 0;
        return (
          <div key={subject._id} className="p-4 flex items-center gap-3">
            <span className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold ${tone.avatar}`}>
              {initialOf(subject.name)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-white truncate">{subject.name}</span>
                <span className="text-sm font-semibold tabular-nums text-white shrink-0">{percentage}%</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-background-surface overflow-hidden">
                <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${percentage}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                {subject.attended} of {subject.counted} {subject.counted === 1 ? 'hour' : 'hours'}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default SubjectProgressList;
