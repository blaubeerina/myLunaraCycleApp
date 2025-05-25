
'use client';

import { useState, useEffect, useCallback } from 'react';
import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';
import { addDoc, collection, onSnapshot, doc, updateDoc } from '@/lib/firebase'; // Using mock
import { Button } from '@/components/ui/button';
import { Plus, Edit3, Thumbtack } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import type { PinterestJournalEntry, PinterestJournalMoodType } from '@/lib/types';
import { PinterestJournalEditor } from './PinterestJournalEditor';
import { useAppContext }s'; // Assuming t function for localization
import { useAuth } from '@/components/auth/AuthContext';

const MOCK_USER_ID = 'user123'; // Replace with actual user ID from useAuth

// Sub-component for Journal Card
const JournalCard = ({ 
  entry, 
  onClick, 
  onPinToggle 
}: { 
  entry: PinterestJournalEntry; 
  onClick: () => void; 
  onPinToggle: (id: string, currentPinnedStatus: boolean) => void;
}) => {
  const moodColors: Record<PinterestJournalMoodType, string> = {
    happy: 'border-l-green-400 bg-green-50',
    sad: 'border-l-blue-400 bg-blue-50',
    calm: 'border-l-purple-400 bg-purple-50',
    energetic: 'border-l-yellow-400 bg-yellow-50',
    neutral: 'border-l-gray-400 bg-gray-50',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mb-6 p-0 relative group" // Added relative and group for pin button
      style={{ rotate: `${entry.rotation}deg` }}
    >
      <div 
        className={cn(
          "p-5 rounded-lg shadow-lg cursor-pointer relative overflow-hidden journal-card", // Added journal-card for wavy edges
          "transition-all duration-200 ease-in-out hover:shadow-xl",
          moodColors[entry.mood] || moodColors['neutral'], // Use mood color for border and bg
          "bg-white" // Base background for card content
        )}
        onClick={onClick}
        style={{
          boxShadow: '2px 4px 12px rgba(0,0,0,0.1)', // Softer, more spread shadow
        }}
      >
        {/* Wavy edge effect container - ensure this doesn't overlap content weirdly */}
        <div 
          className="absolute inset-x-0 bottom-0 h-3 opacity-50" 
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='10' viewBox='0 0 100 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 5 Q 12.5 0, 25 5 T 50 5 T 75 5 T 100 5 L100 10 L0 10 Z' fill='%23F5F5DC'/%3E%3C/svg%3E\")",
            backgroundSize: '50px 10px', // Adjust size of wave
            backgroundRepeat: 'repeat-x',
          }}
        />

        <div className="relative z-10"> {/* Content above wavy edge */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-gray-500 font-mono">
              {entry.date ? format(parseISO(entry.date), 'MMM dd, yyyy') : 'Unknown Date'}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-gray-400 hover:text-[#FFD1DC]"
              onClick={(e) => { e.stopPropagation(); onClick(); }} // Propagate click to open editor
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-gray-700 font-serif text-base leading-relaxed whitespace-pre-line break-words mb-3"
             style={{ maxHeight: '150px', overflowY: 'auto' }} // Limit height and allow scroll
          >
            {entry.content}
          </p>
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {entry.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs">#{tag}</span>
              ))}
            </div>
          )}
          <div className="flex justify-end items-center">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              entry.mood === 'happy' ? 'bg-green-100 text-green-700' :
              entry.mood === 'sad' ? 'bg-blue-100 text-blue-700' :
              entry.mood === 'calm' ? 'bg-purple-100 text-purple-700' :
              entry.mood === 'energetic' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {entry.mood}
            </span>
          </div>
        </div>
         <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              onPinToggle(entry.id, entry.pinned || false);
            }}
            className={cn(
              "absolute top-2 right-2 h-7 w-7 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity z-20",
              entry.pinned ? "text-[#FFD1DC] opacity-100" : "hover:text-[#FFD1DC]"
            )}
            title={entry.pinned ? "Unpin" : "Pin"}
          >
            <Thumbtack className="h-4 w-4" />
          </Button>
      </div>
    </motion.div>
  );
};


export function PinterestJournalGrid() {
  const [entries, setEntries] = useState<PinterestJournalEntry[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentEditingEntry, setCurrentEditingEntry] = useState<PinterestJournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useAppContext(); // If you need translations
  const { user } = useAuth(); // Get user for userId

  const userId = user?.id || MOCK_USER_ID; // Fallback to mock if user not loaded

  // Firestore Data Fetching
  useEffect(() => {
    setIsLoading(true);
    const journalCollectionRef = collection(db, `users/${userId}/pinterestJournal`);
    const unsubscribe = onSnapshot(journalCollectionRef, (snapshot) => {
      const entriesData = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      })) as PinterestJournalEntry[];
      // Sort by pinned status first, then by date
      entriesData.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return parseISO(b.date).getTime() - parseISO(a.date).getTime();
      });
      setEntries(entriesData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching journal entries:", error);
      setIsLoading(false);
      // Potentially show a toast error
    });
    return () => unsubscribe();
  }, [userId]);

  const handleOpenEditor = (entry: PinterestJournalEntry | null) => {
    setCurrentEditingEntry(entry);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setCurrentEditingEntry(null);
  };

  const handleSaveEntry = async (data: Omit<PinterestJournalEntry, 'id' | 'rotation' | 'userId'>, entryId?: string) => {
    const entryData = {
      ...data,
      userId: userId, // Add userId
      date: entryId && currentEditingEntry ? currentEditingEntry.date : new Date().toISOString(), // Preserve date if editing, else new
      rotation: entryId && currentEditingEntry ? currentEditingEntry.rotation : Math.floor(Math.random() * 6) - 3, // Preserve rotation or new
      pinned: entryId && currentEditingEntry ? currentEditingEntry.pinned || false : false, // Preserve pinned status
    };

    if (entryId) {
      // Update existing
      const entryDocRef = doc(db, `users/${userId}/pinterestJournal`, entryId);
      await updateDoc(entryDocRef, entryData);
    } else {
      // Create new
      await addDoc(collection(db, `users/${userId}/pinterestJournal`), entryData);
    }
    // onSnapshot should handle UI update
  };
  
  const handlePinToggle = async (id: string, currentPinnedStatus: boolean) => {
    const entryDocRef = doc(db, `users/${userId}/pinterestJournal`, id);
    await updateDoc(entryDocRef, { pinned: !currentPinnedStatus });
    // Optimistic update can be done here, or rely on onSnapshot
  };


  const breakpointColumns = {
    default: 3,
    1280: 3, // xl
    1024: 2, // lg
    768: 2,  // md
    640: 1   // sm
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen bg-[#F5F5DC]"><p>Loading journal...</p></div>;
  }

  return (
    <div className="relative min-h-screen bg-[#F5F5DC] p-4 sm:p-6 md:p-8">
      <Masonry
        breakpointCols={breakpointColumns}
        className="my-masonry-grid flex w-auto -ml-4 sm:-ml-6" // Negative margin to counter card padding
        columnClassName="my-masonry-grid_column bg-clip-padding pl-4 sm:pl-6" // Padding for column gap
      >
        {entries.map(entry => (
          <JournalCard 
            key={entry.id} 
            entry={entry}
            onClick={() => handleOpenEditor(entry)}
            onPinToggle={handlePinToggle}
          />
        ))}
      </Masonry>

      <motion.div
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="lg"
          className="rounded-full h-14 w-14 sm:h-16 sm:w-16 shadow-xl bg-[#FFD1DC] hover:bg-[#ffc0cb] text-gray-700"
          onClick={() => handleOpenEditor(null)}
          aria-label="Add new journal entry"
        >
          <Plus className="h-6 w-6 sm:h-7 sm:w-7" />
        </Button>
      </motion.div>

      {isEditorOpen && (
        <PinterestJournalEditor
          entry={currentEditingEntry}
          isOpen={isEditorOpen}
          onClose={handleCloseEditor}
          onSave={handleSaveEntry}
        />
      )}
    </div>
  );
}
