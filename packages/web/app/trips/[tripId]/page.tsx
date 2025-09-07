'use client';

import TripView from '../../components/TripView';
import TripViewLaptop from '../../components/TripViewLaptop';
import { Id } from '../../../../backend/convex/_generated/dataModel';
import { useState, useEffect } from 'react';

export default function TripPage({ 
  params 
}: { 
  params: { tripId: string } 
}) {
  const [isLaptop, setIsLaptop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLaptop(window.innerWidth >= 1024); // lg breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return isLaptop ? (
    <TripViewLaptop tripId={params.tripId as Id<'trips'>} />
  ) : (
    <TripView tripId={params.tripId as Id<'trips'>} />
  );
}