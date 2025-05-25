
'use client';

// This page now renders the Pinterest-style journal grid.
// The old list-based journal components are effectively replaced.

import { PinterestJournalGrid } from '@/components/journal/PinterestJournalGrid';

export default function JournalPage() {
  return (
    <div className="w-full">
      <PinterestJournalGrid />
    </div>
  );
}
