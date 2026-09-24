import React from 'react';

// One icon set: 24px box, 1.5 stroke, no fill. Used instead of emoji in the app's chrome.
const Icon = ({ path, className = 'w-5 h-5', ...rest }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
    {path}
  </svg>
);

export const ClipboardCheckIcon = (props) => (
  <Icon {...props} path={<>
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="m9 14 2 2 4-4" />
  </>} />
);

export const ListIcon = (props) => (
  <Icon {...props} path={<>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <path d="M3 6h.01M3 12h.01M3 18h.01" />
  </>} />
);

export const CalendarIcon = (props) => (
  <Icon {...props} path={<>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 11h18" />
  </>} />
);

export const TableIcon = (props) => (
  <Icon {...props} path={<>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18M9 10v10" />
  </>} />
);

export const TimerIcon = (props) => (
  <Icon {...props} path={<>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 2.5M10 2h4" />
  </>} />
);

export const SettingsIcon = (props) => (
  <Icon {...props} path={<>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </>} />
);

export const PlusIcon = (props) => <Icon {...props} path={<path d="M12 5v14M5 12h14" />} />;
export const SearchIcon = (props) => <Icon {...props} path={<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>} />;
export const ChevronLeftIcon = (props) => <Icon {...props} path={<path d="m15 18-6-6 6-6" />} />;
export const ChevronRightIcon = (props) => <Icon {...props} path={<path d="m9 18 6-6-6-6" />} />;
export const ChevronDownIcon = (props) => <Icon {...props} path={<path d="m6 9 6 6 6-6" />} />;
export const CheckIcon = (props) => <Icon {...props} path={<path d="m5 13 4 4L19 7" />} />;
export const CloseIcon = (props) => <Icon {...props} path={<path d="M18 6 6 18M6 6l12 12" />} />;
export const PencilIcon = (props) => <Icon {...props} path={<><path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" /></>} />;
export const TrashIcon = (props) => <Icon {...props} path={<><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6l-.9 13a2 2 0 0 1-2 1.9H7.9a2 2 0 0 1-2-1.9L5 6" /><path d="M10 11v6M14 11v6" /></>} />;
export const MoreVerticalIcon = (props) => <Icon {...props} path={<><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></>} />;
export const MoreHorizontalIcon = (props) => <Icon {...props} path={<><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>} />;
export const SunIcon = (props) => <Icon {...props} path={<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>} />;
export const MoonIcon = (props) => <Icon {...props} path={<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8" />} />;
export const LogOutIcon = (props) => <Icon {...props} path={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>} />;
export const PrinterIcon = (props) => <Icon {...props} path={<><path d="M6 9V3h12v6" /><rect x="6" y="14" width="12" height="7" rx="1" /><path d="M6 18H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" /></>} />;
export const ClockIcon = (props) => <Icon {...props} path={<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>} />;
export const BellIcon = (props) => <Icon {...props} path={<><path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>} />;
export const BookIcon = (props) => <Icon {...props} path={<><path d="M4 19.5V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M8 7h7" /></>} />;

export const DownloadIcon = (props) => <Icon {...props} path={<><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>} />;

export default Icon;
