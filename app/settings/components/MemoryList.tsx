'use client';

import { Memory } from "@/lib/db/schema";
import { useState } from "react";

function MemoryList({ memories }: { memories: Memory[] }) {
  const [showMore, setShowMore] = useState<Record<string, boolean>>({});
  
  const toggleShowMore = (key: string) => {
    setShowMore(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-2">
      {memories.slice(0, showMore[memories[0]?.category] ? undefined : 3).map(memory => (
        <p key={memory.id} className="text-sm text-gray-600">
          {memory.content}
        </p>
      ))}
      {memories.length > 3 && (
        <button
          onClick={() => toggleShowMore(memories[0]?.category)}
          className="text-sm text-purple-500 hover:text-purple-700 font-medium mt-2"
        >
          {showMore[memories[0]?.category] ? 'Show less' : `Show more`}
        </button>
      )}
    </div>
  );
}

export default MemoryList;