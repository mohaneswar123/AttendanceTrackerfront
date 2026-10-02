import React from 'react';
import { STATE_BADGE, STATE_LABEL, accessState } from '../../utils/admin';
import { SearchIcon } from '../icons';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'expiring', label: 'Expiring' },
  { key: 'inactive', label: 'Inactive' }
];

// The accounts, filtered and searched. Counts come from the list itself, which the
// portal already holds; that stops being right once there are more accounts than one
// page, and the filtering moves to the server at the same time.
function AdminUserList({ users, selectedId, onSelect, filter, onFilterChange, query, onQueryChange, loading }) {
  return (
    <div className="surface flex flex-col h-full overflow-hidden">
      <div className="p-3 space-y-2 border-b border-line">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search name or email"
            aria-label="Search accounts"
            className="input pl-9 [&::-webkit-search-cancel-button]:hidden"
          />
        </div>

        <div className="segmented grid grid-cols-4" role="tablist" aria-label="Filter accounts">
          {FILTERS.map(option => (
            <button
              key={option.key}
              type="button"
              role="tab"
              aria-selected={filter === option.key}
              onClick={() => onFilterChange(option.key)}
              className="segmented-item px-1 text-xs"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading && users.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">Loading accounts…</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">No accounts match.</p>
        ) : (
          <ul className="divide-y divide-line">
            {users.map(user => {
              const state = accessState(user);
              const selected = user._id === selectedId;
              return (
                <li key={user._id}>
                  <button
                    type="button"
                    onClick={() => onSelect(user._id)}
                    aria-current={selected ? 'true' : undefined}
                    className={`w-full text-left px-3 py-2.5 transition-colors ${selected ? 'bg-primary-500/10' : 'hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex-1 min-w-0 text-sm font-medium text-slate-100 truncate">{user.username}</span>
                      <span className={`badge ${STATE_BADGE[state]} shrink-0`}>{STATE_LABEL[state]}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AdminUserList;
