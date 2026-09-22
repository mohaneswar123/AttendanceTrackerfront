import { useCallback, useEffect, useRef, useState } from 'react';
import { calendarService, errorMessage } from '../services/api';
import { todayLocal } from '../utils/date';

export const MAX_SEARCH_RESULTS = 100; // the server's cap on search results

// The student's calendar entries for the visible dates, the upcoming list, and title
// search. Changes are shown once the server has saved them.
export default function useCalendar(range, searchQuery) {
  const [events, setEvents] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [results, setResults] = useState(null); // null when not searching
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const searchRun = useRef(0);
  const query = searchQuery.trim();

  const loadRange = useCallback(async () => {
    setLoading(true);
    try {
      setEvents(await calendarService.getEvents({ from: range.from, to: range.to }));
    } catch (err) {
      setError(errorMessage(err, 'Failed to load your calendar'));
    } finally {
      setLoading(false);
    }
  }, [range.from, range.to]);

  const loadUpcoming = useCallback(async () => {
    try {
      setUpcoming(await calendarService.getEvents({ from: todayLocal() }));
    } catch (err) {
      setError(errorMessage(err, 'Failed to load upcoming entries'));
    }
  }, []);

  // Only the newest search's answer is used, even if an older one arrives later
  const runSearch = useCallback(async (text) => {
    const run = ++searchRun.current;
    setSearching(true);
    try {
      const found = await calendarService.getEvents({ q: text });
      if (run === searchRun.current) setResults(found);
    } catch (err) {
      if (run === searchRun.current) setError(errorMessage(err, 'Search failed'));
    } finally {
      if (run === searchRun.current) setSearching(false);
    }
  }, []);

  useEffect(() => {
    loadRange();
  }, [loadRange]);

  useEffect(() => {
    loadUpcoming();
  }, [loadUpcoming]);

  // Search 300ms after typing stops
  useEffect(() => {
    if (!query) {
      searchRun.current++;
      setResults(null);
      setSearching(false);
      return;
    }
    const timer = setTimeout(() => runSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  const refresh = () => Promise.all([loadRange(), loadUpcoming(), query ? runSearch(query) : null]);

  // entry: { title, type, date, allDay, startTime, endTime }; updates when eventId is given
  const saveEvent = async (eventId, entry) => {
    try {
      const saved = eventId
        ? await calendarService.updateEvent(eventId, entry)
        : await calendarService.createEvent(entry);
      await refresh();
      return { success: true, event: saved };
    } catch (err) {
      return { success: false, message: errorMessage(err, 'Failed to save the entry') };
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await calendarService.deleteEvent(eventId);
      await refresh();
      return { success: true };
    } catch (err) {
      return { success: false, message: errorMessage(err, 'Failed to delete the entry') };
    }
  };

  return {
    events,
    upcoming,
    results,
    loading,
    searching,
    error,
    clearError: () => setError(''),
    saveEvent,
    deleteEvent
  };
}
