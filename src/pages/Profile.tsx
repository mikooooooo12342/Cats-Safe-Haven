import { useState, useEffect } from "react";
import { ArrowLeft, Eye, EyeOff, ImagePlus, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PageTransition } from "@/components/page-transition";
import { useAuth } from "@/providers/auth";
import { useLanguage } from "@/providers/language-provider";
import { Navbar } from "@/components/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { getCatsByUserId } from "@/services/cat";
import { deleteCat, updateCat } from "@/services/cat/manage-cats";
import { CatPost } from "@/services/cat/types";
import { profileImages } from "@/integrations/supabase/profile-images";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { CatDecoration } from "@/components/cat-decoration";
import { useIsMobile } from "@/hooks/use-mobile";

const Profile = () => {
  const { user, updateUser, getProfileImageUrl, signOut } = useAuth();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  
  const [username, setUsername] = useState(user?.username || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userCats, setUserCats] = useState<CatPost[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(true);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  useEffect(() => {
    const fetchUserCats = async () => {
      if (!user) return;
      
      setIsLoadingCats(true);
      try {
        const cats = await getCatsByUserId(user.id);
        setUserCats(cats as any[]);
      } catch (error) {
        console.error("Error fetching user cats:", error);
      } finally {
        setIsLoadingCats(false);
      }
    };
    
    fetchUserCats();
  }, [user]);
  
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }
    
    setPasswordError("");
    setIsLoading(true);
    
    try {
      await updateUser({ username });
      toast.success("Profile updated successfully");
      
      if (password) {
        toast.success("Password updated successfully");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProfileImageChange = async () => {
    if (!selectedImage || !user) return;
    
    setIsLoading(true);
    try {
      const filename = selectedImage.split('/').pop();
      
      await updateUser({ 
        profile_image: filename || user.profile_image 
      });
      
      setProfileDialogOpen(false);
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Error updating profile image:", error);
      toast.error("Failed to update profile picture");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveCat = async (catId: string) => {
    try {
      await deleteCat(catId);
      setUserCats(userCats.filter(cat => cat.id !== catId));
      toast.success("Post removed successfully");
    } catch (error) {
      console.error("Error removing cat post:", error);
      toast.error("Failed to remove post");
    }
  };
  
  const handleMarkAdopted = async (catId: string) => {
    try {
      await updateCat(catId, { 
        status: "adopted" as "adopted" | "available"
      });
      
      setUserCats(userCats.map(cat => 
        cat.id === catId ? { ...cat, status: "adopted" } : cat
      ));
      
      toast.success("Cat marked as adopted!");
    } catch (error) {
      console.error("Error marking cat as adopted:", error);
      toast.error("Failed to update status");
    }
  };
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success("Successfully logged out");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  const ProfileCatCard = ({ cat }: { cat: CatPost }) => {
    const displayConditions = () => {
      const conditions = [];
      if (cat.condition) {
        if (cat.condition.normal) conditions.push(<Badge key="normal" className="bg-green-500">Healthy</Badge>);
        if (cat.condition.nutritionalIssues) conditions.push(<Badge key="nutritional" className="bg-amber-500">Nutritional Issues</Badge>);
        if (cat.condition.dentalProblems) conditions.push(<Badge key="dental" className="bg-amber-500">Dental Problems</Badge>);
        if (cat.condition.respiratoryInfections) conditions.push(<Badge key="respiratory" className="bg-amber-500">Respiratory Issues</Badge>);
        if (cat.condition.parasiticInfections) conditions.push(<Badge key="parasitic" className="bg-amber-500">Parasitic Issues</Badge>);
        if (cat.condition.chronicDiseases) conditions.push(<Badge key="chronic" className="bg-red-500">Chronic Disease</Badge>);
        if (cat.condition.heartConditions) conditions.push(<Badge key="heart" className="bg-red-500">Heart Condition</Badge>);
        if (cat.condition.jointIssues) conditions.push(<Badge key="joint" className="bg-amber-500">Joint Issues</Badge>);
        if (cat.condition.skinConditions) conditions.push(<Badge key="skin" className="bg-amber-500">Skin Condition</Badge>);
        if (cat.condition.behavioralDisorders) conditions.push(<Badge key="behavioral" className="bg-amber-500">Behavioral Issues</Badge>);
      }
      
      return conditions.length > 0 ? (
        <div className="flex flex-wrap gap-1 mt-2">
          {conditions.slice(0, 2)}
          {conditions.length > 2 && (
            <Badge variant="outline" className="border-primary text-primary">
              +{conditions.length - 2} more
            </Badge>
          )}
        </div>
      ) : null;
    };
    
    const isAdopted = cat.status === "adopted";
    
    return (
      <Card className={`overflow-hidden ${isAdopted ? 'opacity-70' : ''}`}>
        <Link to={`/cats/${cat.id}`}>
          <div className="aspect-square overflow-hidden bg-muted">
            <img
              src={cat.imageUrl}
              alt={cat.name}
              className="h-full w-full object-cover"
            />
            {isAdopted && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Badge className="text-lg py-2 px-4 bg-green-600">Adopted</Badge>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mt-1">{cat.name}</h3>
            {cat.location && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{cat.location}</span>
              </div>
            )}
            {displayConditions()}
          </CardContent>
          <CardFooter className="flex justify-between py-2 px-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">{cat.breed}</p>
            <p className="text-sm font-medium">{cat.gender === "male" ? "Male" : "Female"}</p>
          </CardFooter>
        </Link>
        
        <div className="p-3 grid grid-cols-2 gap-2">
          <Button 
            variant={isAdopted ? "outline" : "default"} 
            className={isAdopted ? "bg-green-100 border-green-500 text-green-700" : ""}
            disabled={isAdopted}
            onClick={() => handleMarkAdopted(cat.id)}
          >
            {isAdopted ? "Already Adopted" : "Finally Adopted"}
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => handleRemoveCat(cat.id)}
          >
            Remove Post
          </Button>
        </div>
      </Card>
    );
  };
  
  return (
    <PageTransition>
      <Navbar />
      <div className="container mx-auto py-8 px-4 relative">
        <CatDecoration variant="playful" />
        
        <div className="fixed top-20 left-4 z-50">
          <Button variant="ghost" size="sm" asChild className="gap-1 bg-background/80 backdrop-blur-sm">
            <Link to="/home">
              <ArrowLeft className="h-4 w-4" />
              <span>{t("back_to_home")}</span>
            </Link>
          </Button>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm overflow-hidden max-w-2xl mx-auto">
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-8 text-center animate-slide-in">
              {t("account_settings")}
            </h1>
            
            <div className="space-y-8">
              <section className="animate-slide-in" style={{ animationDelay: "0.1s" }}>
                <h2 className="text-xl font-semibold mb-4 text-center">Profile Picture</h2>
                <div className="flex flex-col items-center mb-4">
                  <Avatar 
                    className="h-24 w-24 border-2 border-muted relative group cursor-pointer mb-2"
                    onClick={() => setProfileDialogOpen(true)}
                  >
                    {user?.profile_image && (
                      <AvatarImage 
                        src={getProfileImageUrl(user.profile_image)} 
                        alt={user?.username} 
                      />
                    )}
                    <AvatarFallback className="text-2xl">
                      {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                    <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <ImagePlus className="h-8 w-8" />
                    </div>
                  </Avatar>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setProfileDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Change Picture
                  </Button>
                </div>
              </section>
              
              <Separator className="my-8" />
              
              <section className="animate-slide-in" style={{ animationDelay: "0.2s" }}>
                <h2 className="text-xl font-semibold mb-4">Change Username and Password</h2>
                <form onSubmit={handleSaveChanges} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder={t("username")}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2 relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("new_password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  
                  <div className="space-y-2 relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("confirm_password")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-muted-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  
                  {passwordError && (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : t("save_changes")}
                  </Button>
                </form>
              </section>
              
              <Separator className="my-8" />
              
              <section className="animate-slide-in" style={{ animationDelay: "0.3s" }}>
                <h2 className="text-xl font-semibold mb-4">{t("your_adoption_posts")}</h2>
                {isLoadingCats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={index} className="rounded-md overflow-hidden animate-pulse">
                        <div className="aspect-square bg-muted"></div>
                        <div className="p-4 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : userCats.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userCats.map((cat) => (
                      <div key={cat.id} className="animate-zoom-in">
                        <ProfileCatCard cat={cat} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>You haven't posted any cats for adoption yet.</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link to="/upload">Post a Cat for Adoption</Link>
                    </Button>
                  </div>
                )}
              </section>
              
              <Separator className="my-8" />
              
              <section className="animate-slide-in" style={{ animationDelay: "0.4s" }}>
                <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
                <Button 
                  variant="destructive" 
                  className="w-full flex items-center justify-center gap-2"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                >
                  {isLoggingOut ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-destructive-foreground border-t-transparent animate-spin"></div>
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </>
                  )}
                </Button>
              </section>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className={`sm:max-w-md ${isMobile ? 'p-4' : ''}`}>
          <DialogHeader>
            <DialogTitle>Choose a profile picture</DialogTitle>
            <DialogDescription>
              Select one of the cat doodles below as your profile picture.
            </DialogDescription>
          </DialogHeader>
          
          <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-4'} gap-2 py-4 max-h-[60vh] overflow-y-auto`}>
            {profileImages.map((image) => (
              <div 
                key={image.id}
                className={`cursor-pointer rounded-lg p-1 transition-all ${
                  selectedImage === image.url ? 'ring-2 ring-primary' : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedImage(image.url)}
              >
                <Avatar className={`${isMobile ? 'h-16 w-16' : 'h-20 w-20'} mx-auto`}>
                  <AvatarImage src={image.url} alt={image.name} />
                </Avatar>
                <p className="text-xs text-center mt-1 truncate">{image.name.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProfileImageChange} disabled={!selectedImage || isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default Profile;
