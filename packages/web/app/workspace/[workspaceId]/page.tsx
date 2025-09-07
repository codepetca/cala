import TripList from '../../components/TripList';
import { Id } from '../../../../backend/convex/_generated/dataModel';

export default function WorkspacePage({ 
  params 
}: { 
  params: { workspaceId: string } 
}) {
  return <TripList workspaceId={params.workspaceId as Id<'workspaces'>} />;
}