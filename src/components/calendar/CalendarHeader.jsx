import React from 'react';
import PageHeader, { HeaderButton } from '../PageHeader';
import { PlusIcon, SearchIcon } from '../icons';

// The page's own header: the year above the month, then search and add.
function CalendarHeader({ eyebrow, title, searchOpen, onToggleSearch, onAdd }) {
  return (
    <PageHeader eyebrow={eyebrow} title={title}>
      <HeaderButton label="Search" onClick={onToggleSearch} aria-expanded={searchOpen}>
        <SearchIcon className="w-[18px] h-[18px]" />
      </HeaderButton>
      <HeaderButton label="Add event" variant="primary" onClick={onAdd}>
        <PlusIcon className="w-5 h-5" />
      </HeaderButton>
    </PageHeader>
  );
}

export default CalendarHeader;
