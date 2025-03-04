
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth';
import { Heart, Cat } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Cat doodles/decorations */}
      <div className="absolute top-10 left-10 text-catOrange opacity-30 animate-pulse">
        <Cat size={32} />
      </div>
      <div className="absolute bottom-16 right-12 text-catOrange opacity-30 animate-pulse" style={{ animationDelay: '1s' }}>
        <Cat size={28} />
      </div>
      <div className="absolute top-24 right-16 text-primary opacity-30 animate-pulse" style={{ animationDelay: '1.5s' }}>
        <Heart size={36} />
      </div>
      <div className="absolute bottom-32 left-16 text-primary opacity-30 animate-pulse" style={{ animationDelay: '0.7s' }}>
        <Heart size={30} />
      </div>

      {/* Paw print trail - replacing with cat icons since Paw isn't available */}
      <div className="absolute left-1/4 top-1/3 text-catOrange opacity-20">
        <Cat size={20} style={{ transform: 'rotate(45deg)' }} />
      </div>
      <div className="absolute left-1/4 top-1/3 mt-12 ml-8 text-catOrange opacity-20">
        <Cat size={20} style={{ transform: 'rotate(30deg)' }} />
      </div>
      <div className="absolute left-1/4 top-1/3 mt-24 ml-16 text-catOrange opacity-20">
        <Cat size={20} style={{ transform: 'rotate(15deg)' }} />
      </div>

      <div className="max-w-3xl w-full text-center px-4 relative">
        {/* Main heart-paw logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="/images/welcome_paw.png" 
            alt="Cats' Safe Haven Logo" 
            className="w-24 h-24 animate-zoom-in"
          />
        </div>
        
        <h1 className="text-4xl font-bold mb-4 text-primary flex items-center justify-center gap-2">
          Cats' Safe Haven
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Find your perfect feline companion and give them a loving forever home.
        </p>
        
        <div className="grid gap-4">
          {isLoading ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
          ) : isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-8">
                <Link to="/home">Browse Cats</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-8">
                <Link to="/profile">My Profile</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-8">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-8">
                <Link to="/signup">Create Account</Link>
              </Button>
            </div>
          )}
          
          <div className="mt-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/about">About Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
