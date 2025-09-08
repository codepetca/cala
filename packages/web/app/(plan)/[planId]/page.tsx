import { WeekBoard } from './WeekBoard';

interface PlanPageProps {
  params: {
    planId: string;
  };
}

export default function PlanPage({ params }: PlanPageProps) {
  const { planId } = params;
  
  // Calculate current week bounds (Monday to Sunday)
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1); // Get Monday
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6); // Get Sunday
  sunday.setHours(23, 59, 59, 999);

  return (
    <div className="min-h-screen bg-gray-50">
      <WeekBoard 
        planId={planId}
        startMs={monday.getTime()}
        endMs={sunday.getTime()}
      />
    </div>
  );
}