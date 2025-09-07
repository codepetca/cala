import TripView from '../../components/TripView';
import { Id } from '../../../../backend/convex/_generated/dataModel';

export default function TripPage({ 
  params 
}: { 
  params: { tripId: string } 
}) {
  return <TripView tripId={params.tripId as Id<'trips'>} />;
}