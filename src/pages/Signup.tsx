
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth';
import { PageTransition } from '@/components/page-transition';
import { useLanguage } from '@/providers/language-provider';
import { CatDecoration } from "@/components/cat-decoration";

const signupSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
  confirmPassword: z.string().min(1, {
    message: 'Please confirm your password.',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Signup = () => {
  const { signup } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    try {
      // Pass data as a single object that matches the SignupData type
      await signup({
        email: data.email,
        password: data.password,
        username: data.username
      });
      toast.success(t('signup_success'));
      navigate('/home'); // Changed from '/profile' to '/home'
    } catch (error: any) {
      console.error('Signup failed:', error);
      toast.error(error.message || t('signup_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center relative">
        <CatDecoration variant="minimal" />
        
        <div className="fixed top-4 left-4 z-50">
          <Button variant="ghost" size="sm" asChild className="gap-1 bg-background/80 backdrop-blur-sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              <span>{t("back")}</span>
            </Link>
          </Button>
        </div>
        
        <Card className="w-full max-w-md glass">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">{t('create_account')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">{t('username')}</Label>
                  <Input
                    id="username"
                    placeholder={t('enter_username')}
                    type="text"
                    {...register('username')}
                    disabled={isLoading}
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive">{errors.username.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    placeholder={t('enter_email')}
                    type="email"
                    {...register('email')}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">{t('password')}</Label>
                  <Input
                    id="password"
                    placeholder={t('enter_password')}
                    type="password"
                    {...register('password')}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">{t('confirm_password')}</Label>
                  <Input
                    id="confirmPassword"
                    placeholder={t('confirm_password')}
                    type="password"
                    {...register('confirmPassword')}
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
              <Button disabled={isLoading} className="w-full mt-5">
                {isLoading ? t('signing_up') : t('sign_up')}
              </Button>
            </form>
            <div className="text-sm text-muted-foreground text-center">
              {t('already_have_account')}{' '}
              <Link to="/login" className="text-primary hover:underline">
                {t('sign_in')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default Signup;
