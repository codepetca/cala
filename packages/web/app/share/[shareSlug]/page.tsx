import ShareView from '../../components/ShareView';

export default function SharePage({ 
  params 
}: { 
  params: { shareSlug: string } 
}) {
  return <ShareView shareSlug={params.shareSlug} />;
}