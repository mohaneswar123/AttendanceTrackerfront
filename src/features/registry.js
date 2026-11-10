import {
  BookIcon, CalendarIcon, ChartIcon, CheckIcon, ClipboardCheckIcon, ClockIcon, ColumnsIcon,
  LayersIcon, ListIcon, SlidersIcon, StarIcon, SunriseIcon, TableIcon, TargetIcon, TimerIcon
} from '../components/icons';

/**
 * Every feature in the app, in one place.
 *
 * The Home tiles, the quick switcher and the bottom nav inside a feature are all drawn
 * from this list, so adding a feature means adding an entry here and a route, not
 * touching three navigation components that can drift apart.
 *
 * `colour` names a pair of Tailwind colours generated from the palette, so each feature
 * reads the same in both colour sets. The classes are written out rather than built from
 * the name, because Tailwind only keeps classes it can see in the source.
 */

const TONES = {
  attendance: {
    text: 'text-attendance', bg: 'bg-attendance', tint: 'bg-attendance-tint',
    border: 'border-attendance', ring: 'ring-attendance', hover: 'hover:bg-attendance/90'
  },
  tasks: {
    text: 'text-tasks', bg: 'bg-tasks', tint: 'bg-tasks-tint',
    border: 'border-tasks', ring: 'ring-tasks', hover: 'hover:bg-tasks/90'
  },
  calendar: {
    text: 'text-calendar', bg: 'bg-calendar', tint: 'bg-calendar-tint',
    border: 'border-calendar', ring: 'ring-calendar', hover: 'hover:bg-calendar/90'
  },
  timetable: {
    text: 'text-timetable', bg: 'bg-timetable', tint: 'bg-timetable-tint',
    border: 'border-timetable', ring: 'ring-timetable', hover: 'hover:bg-timetable/90'
  },
  focus: {
    text: 'text-focus', bg: 'bg-focus', tint: 'bg-focus-tint',
    border: 'border-focus', ring: 'ring-focus', hover: 'hover:bg-focus/90'
  },
  habits: {
    text: 'text-habits', bg: 'bg-habits', tint: 'bg-habits-tint',
    border: 'border-habits', ring: 'ring-habits', hover: 'hover:bg-habits/90'
  }
};

export const toneOf = (id) => TONES[id] || TONES.tasks;

export const FEATURES = [
  {
    id: 'attendance',
    name: 'Attendance',
    Icon: ClipboardCheckIcon,
    addLabel: 'Record a class',
    tabs: [
      { id: 'record', label: 'Record', path: '/attendance', Icon: ClipboardCheckIcon },
      { id: 'history', label: 'History', path: '/attendance/history', Icon: ClockIcon },
      { id: 'reports', label: 'Reports', path: '/attendance/reports', Icon: ChartIcon },
      { id: 'subjects', label: 'Subjects', path: '/attendance/subjects', Icon: BookIcon }
    ]
  },
  {
    id: 'tasks',
    name: 'Tasks',
    Icon: ListIcon,
    addLabel: 'Add a task',
    tabs: [
      { id: 'today', label: 'My Day', path: '/tasks', Icon: SunriseIcon },
      { id: 'important', label: 'Important', path: '/tasks/important', Icon: StarIcon },
      { id: 'done', label: 'Completed', path: '/tasks/done', Icon: CheckIcon }
    ]
  },
  {
    id: 'habits',
    name: 'Habits',
    Icon: TargetIcon,
    addLabel: 'New habit',
    isNew: true,
    tabs: [
      { id: 'today', label: 'Today', path: '/habits', Icon: TargetIcon },
      { id: 'habits', label: 'Habits', path: '/habits/all', Icon: ListIcon },
      { id: 'progress', label: 'Progress', path: '/habits/progress', Icon: ChartIcon }
    ]
  },
  {
    id: 'calendar',
    name: 'Calendar',
    Icon: CalendarIcon,
    addLabel: 'Add an entry',
    tabs: [
      { id: 'month', label: 'Month', path: '/calendar', Icon: CalendarIcon },
      { id: 'week', label: 'Week', path: '/calendar/week', Icon: ColumnsIcon },
      { id: 'events', label: 'Events', path: '/calendar/events', Icon: ListIcon }
    ]
  },
  {
    id: 'timetable',
    name: 'Timetable',
    Icon: TableIcon,
    addLabel: 'Add an activity',
    tabs: [
      { id: 'today', label: 'Today', path: '/timetable', Icon: SunriseIcon },
      { id: 'schedules', label: 'Schedules', path: '/timetable/schedules', Icon: LayersIcon }
    ]
  },
  {
    id: 'focus',
    name: 'Focus',
    Icon: TimerIcon,
    tabs: [
      { id: 'timer', label: 'Timer', path: '/focus', Icon: TimerIcon },
      { id: 'settings', label: 'Lengths', path: '/focus/settings', Icon: SlidersIcon }
    ]
  }
];

export const featureById = (id) => FEATURES.find(feature => feature.id === id);

/** The feature a path belongs to, and which of its tabs is open */
export const featureForPath = (pathname) => {
  for (const feature of FEATURES) {
    // Longest path first, so /tasks/important does not match /tasks
    const tabs = [...feature.tabs].sort((a, b) => b.path.length - a.path.length);
    const tab = tabs.find(item => pathname === item.path || pathname.startsWith(`${item.path}/`));
    if (tab) return { feature, tab };
  }
  return { feature: null, tab: null };
};
