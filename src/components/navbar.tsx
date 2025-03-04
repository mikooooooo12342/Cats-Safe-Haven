
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Settings, Search, Upload, Menu, X, Heart, Cat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SettingsDropdown } from "@/components/settings-dropdown";
import { useAuth } from "@/providers/auth";
import { useLanguage } from "@/providers/language-provider";

// Fun search messages
const SEARCH_MESSAGES = [
  "Looking for your purr-fect match?",
  "Find your feline soulmate!",
  "Searching for a new furry friend?",
  "Who will be your new cuddle buddy?",
  "Your dream cat is just a search away!",
  "Discover your whiskered companion!",
  "Find a kitty to love forever!",
  "The purr-fect friend is waiting for you!",
  "Your future fur baby is out there!",
  "Meet your new four-legged family member!"
];

export function Navbar() {
  const { isAuthenticated, user, getProfileImageUrl } = useAuth();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const navigate = useNavigate();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };
  
  // Pick a random search message on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * SEARCH_MESSAGES.length);
    setSearchMessage(SEARCH_MESSAGES[randomIndex]);
  }, []);
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/home?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/home');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-sand/80 border-b border-border animate-fade-in">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-2">
          <Avatar className="h-8 w-8 transition-transform hover:scale-110">
            <AvatarImage src="/images/welcome_paw.png" alt="Logo" />
            <AvatarFallback>CSH</AvatarFallback>
          </Avatar>
          <span className="text-xl font-bold tracking-tight hidden sm:inline-block">
            Cats' Safe Haven
          </span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:justify-between md:flex-1 md:gap-4 md:px-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative flex items-center flex-1 max-w-md">
            <Input
              type="text"
              placeholder={`${searchMessage}`}
              className="pr-10 bg-white/80 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3">
              <Search className="h-4 w-4 text-muted-foreground" />
            </button>
          </form>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <Button variant="outline" asChild>
                <Link to="/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  {t("upload")}
                </Link>
              </Button>
            )}

            {isAuthenticated ? (
              <Link to="/profile" className="flex items-center gap-2">
                <Avatar className="h-9 w-9 transition-transform hover:scale-110">
                  {user?.profile_image && (
                    <AvatarImage 
                      src={getProfileImageUrl(user.profile_image)} 
                      alt={user?.username} 
                    />
                  )}
                  <AvatarFallback className="bg-primary text-white">
                    {user?.username ? getInitials(user.username) : "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:inline-block font-medium">
                  {user?.username || "Cat Lover"}
                </span>
              </Link>
            ) : (
              <Button asChild className="bg-primary">
                <Link to="/login">{t("sign_in")}</Link>
              </Button>
            )}

            <SettingsDropdown />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden p-4 pb-6 bg-sand/95 border-b border-border animate-slide-in">
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder={`${searchMessage}`}
                className="pr-10 bg-white/80 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-3">
                <Search className="h-4 w-4 text-muted-foreground" />
              </button>
            </form>
            
            {isAuthenticated && (
              <Button variant="outline" className="w-full" asChild>
                <Link to="/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  {t("upload")}
                </Link>
              </Button>
            )}
            
            {!isAuthenticated && (
              <Button className="w-full bg-primary" asChild>
                <Link to="/login">{t("sign_in")}</Link>
              </Button>
            )}
            
            {isAuthenticated && (
              <Button variant="outline" className="w-full" asChild>
                <Link to="/profile">{t("account_settings")}</Link>
              </Button>
            )}
            
            <Button variant="outline" className="w-full" asChild>
              <Link to="/about">{t("about_us")}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
