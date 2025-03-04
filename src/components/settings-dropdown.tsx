
import { Settings, User, Info, Globe, Sun, Moon, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/providers/theme-provider";
import { useLanguage } from "@/providers/language-provider";
import { useAuth } from "@/providers/auth";
import { useState } from "react";

export function SettingsDropdown() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { signOut, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOut();
    setIsLoggingOut(false);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-background">
          <Settings className="h-5 w-5" />
          <span className="sr-only">{t("settings")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mr-4 glass z-50" align="end">
        <DropdownMenuLabel>{t("settings")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>{t("account_settings")}</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/about" className="flex items-center cursor-pointer">
            <Info className="mr-2 h-4 w-4" />
            <span>{t("about_us")}</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Globe className="mr-2 h-4 w-4" />
            <span>{t("language")}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="glass">
              <DropdownMenuItem 
                onClick={() => setLanguage("en")}
                className={language === "en" ? "bg-accent/50" : ""}
              >
                English
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage("tl")}
                className={language === "tl" ? "bg-accent/50" : ""}
              >
                Tagalog
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        
        <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center">
            {theme === "dark" ? (
              <Moon className="mr-2 h-4 w-4" />
            ) : (
              <Sun className="mr-2 h-4 w-4" />
            )}
            <span>{t("dark_mode")}</span>
          </div>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </DropdownMenuItem>
        
        {isAuthenticated && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut} 
              className="text-destructive flex items-center cursor-pointer"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <div className="mr-2 h-4 w-4 rounded-full border-2 border-destructive border-t-transparent animate-spin"></div>
                  <span>{t("logging_out") || "Logging out..."}</span>
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("log_out") || "Log out"}</span>
                </>
              )}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
