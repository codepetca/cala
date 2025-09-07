'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../backend/convex/_generated/api';
import AuthButton from './AuthButton';
import Link from 'next/link';

export default function WorkspaceList() {
  const user = useQuery(api.auth.getCurrentUser);
  const workspaces = useQuery(api.workspaces.getUserWorkspaces, 
    user ? { userEmail: user.email } : { userEmail: 'demo@example.com' }
  );

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Sign in to access your workspaces
        </h3>
        <AuthButton />
      </div>
    );
  }

  if (!workspaces) {
    return <div className="text-center py-8">Loading workspaces...</div>;
  }

  if (workspaces.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          No workspaces found
        </h3>
        <p className="text-gray-600 mb-6">
          A workspace was automatically created for you when you signed up.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <AuthButton />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <Link
            key={workspace._id}
            href={`/workspace/${workspace._id}`}
            className="card p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {workspace.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Role: {workspace.role}
            </p>
            <div className="text-sm text-gray-500">
              Created {new Date(workspace.createdAt).toLocaleDateString()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}