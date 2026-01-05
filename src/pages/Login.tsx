import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login, setPassword: savePassword, hasPassword } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      navigate('/');
    } else {
      toast.error('Incorrect password');
    }
  };

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    savePassword(password);
    toast.success('Password set successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {hasPassword ? <Lock className="w-6 h-6 text-primary" /> : <KeyRound className="w-6 h-6 text-primary" />}
          </div>
          <CardTitle>{hasPassword ? 'Login' : 'Set Up Password'}</CardTitle>
          <CardDescription>
            {hasPassword 
              ? 'Enter your password to access the ticket system' 
              : 'Create a password to protect your ticket system'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasPassword ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSetup} className="space-y-4">
              <Input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Set Password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
