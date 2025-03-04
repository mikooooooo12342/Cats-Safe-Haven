
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

const Login = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchemaType) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success(t('login_successful'));
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(t('login_failed'));
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
            <CardTitle className="text-2xl text-center">{t('welcome_back')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    {...register('email')}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">{t('password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password.message}</p>
                  )}
                </div>
              </div>
              <Button disabled={isLoading} className="w-full mt-5">
                {isLoading ? t('signing_in') : t('sign_in')}
              </Button>
            </form>
            <div className="text-sm text-muted-foreground text-center">
              {t('dont_have_account')}{' '}
              <Link to="/signup" className="text-primary hover:underline">
                {t('sign_up_now')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default Login;
