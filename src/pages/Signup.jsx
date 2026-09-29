import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Wallet, ArrowRight } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Alert } from '../components/Alert';

export function Signup({ onSignup, onGoogleLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const res = await onSignup(name.trim(), email.trim(), password);

      if (res?.session) {
        // Auto sign-in succeeded, proceed to onboarding
        navigate('/onboarding');
      } else {
        // Account created but session null (email confirmation is enabled in Supabase)
        setSuccess('Account created successfully! If email confirmation is enabled in your Supabase project, please check your inbox to confirm your email before signing in.');
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      setGoogleLoading(true);
      await onGoogleLogin();
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 font-bold text-2xl text-slate-900">
            <div className="p-2 bg-brand-accent rounded-xl text-white">
              <Wallet className="w-6 h-6" />
            </div>
            <span>Budget<span className="text-brand-accent">Split</span></span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 mt-4">Create your account</h2>
          <p className="text-sm text-brand-muted mt-1">Start tracking your 50/30/20 budget today</p>
        </div>

        <Card padding="spacious">
          {error && <Alert variant="danger" message={error} className="mb-6" onClose={() => setError('')} />}
          {success && <Alert variant="success" message={success} className="mb-6" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Ali Ahmed"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" isLoading={loading} icon={ArrowRight} fullWidth className="mt-2">
              Create Account
            </Button>
          </form>

          {/* Social Login Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={handleGoogleSignIn}
            isLoading={googleLoading}
            className="flex items-center justify-center gap-2.5 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </Button>
        </Card>

        <p className="text-center text-sm text-brand-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
