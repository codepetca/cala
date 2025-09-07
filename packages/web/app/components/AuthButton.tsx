'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../backend/convex/_generated/api';
import { useState, useEffect } from 'react';

export default function AuthButton() {
  const user = useQuery(api.auth.getCurrentUser);
  const signInDemo = useMutation(api.auth.signInDemo);
  const [email, setEmail] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSigningIn(true);
    try {
      const newUser = await signInDemo({ 
        email: email.trim(),
        name: email.split('@')[0] 
      });
      setCurrentUser(newUser);
      setEmail('');
    } catch (error) {
      console.error('Sign in failed:', error);
      alert('Sign in failed. Please try again.');
    }
    setIsSigningIn(false);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
  };

  if (currentUser) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Welcome, {currentUser.name}
        </span>
        <button 
          onClick={handleSignOut}
          className="btn btn-secondary text-sm"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500 mb-2">
        Demo Mode - No real auth required
      </div>
      <form onSubmit={handleSignIn} className="flex items-center gap-2">
        <input
          type="email"
          placeholder="Enter any email to continue"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input text-sm"
          disabled={isSigningIn}
          required
        />
        <button 
          type="submit" 
          className="btn btn-primary text-sm"
          disabled={isSigningIn}
        >
          {isSigningIn ? 'Signing in...' : 'Demo Sign In'}
        </button>
      </form>
    </div>
  );
}