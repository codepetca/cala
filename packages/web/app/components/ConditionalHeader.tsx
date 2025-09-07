'use client';

import { usePathname } from 'next/navigation';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Don't show header on share pages
  if (pathname?.startsWith('/share/')) {
    return null;
  }
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">Trip Planner</h1>
      <p className="text-gray-600">Plan your trips collaboratively</p>
    </div>
  );
}