import WorkspaceList from './components/WorkspaceList';

export default function HomePage() {
  return (
    <section>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Workspaces</h2>
        <p className="text-gray-600">Organize your trips by workspace</p>
      </div>
      <WorkspaceList />
    </section>
  );
}