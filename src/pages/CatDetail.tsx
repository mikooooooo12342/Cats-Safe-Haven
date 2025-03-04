import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ArrowRight, 
  Phone, 
  Facebook, 
  Mail, 
  Play, 
  Info,
  Flag,
  AlertTriangle,
  Trash2,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";
import { useLanguage } from "@/providers/language-provider";
import { useAuth } from "@/providers/auth";
import { Navbar } from "@/components/navbar";
import { Separator } from "@/components/ui/separator";
import { getCatById, reportCat, deleteCat, CatMedia } from "@/services/cat-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CatDecoration } from "@/components/cat-decoration";

const CatDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [cat, setCat] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMedia, setCurrentMedia] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploaderUsername, setUploaderUsername] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCat = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const catData = await getCatById(id);
        if (!catData) {
          toast.error("Cat not found");
          navigate("/");
          return;
        }
        
        setCat(catData);
        if (catData.uploaderUsername) {
          setUploaderUsername(catData.uploaderUsername);
        }
        
        if (catData.media && catData.media.length > 0) {
          const sortedMedia = [...catData.media];
          sortedMedia.sort((a, b) => {
            if (a.media_type === 'video' && b.media_type !== 'video') return -1;
            if (a.media_type !== 'video' && b.media_type === 'video') return 1;
            return 0;
          });
          catData.media = sortedMedia;
          setCurrentMedia(0);
        }
        
        console.log("Cat data loaded:", catData);
        console.log("Current user:", user);
        console.log("Can user report:", user && user.id !== catData.userId);
      } catch (error) {
        console.error("Error fetching cat:", error);
        toast.error("Failed to load cat details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCat();
  }, [id, navigate, user]);
  
  const handleReport = async () => {
    if (!user || !cat) return;
    
    setIsReporting(true);
    try {
      await reportCat(cat.id, user.id, reportReason);
      toast.success('Post reported successfully');
      setReportOpen(false);
      setReportReason("");
      navigate('/');
    } catch (error) {
      console.error("Error reporting cat:", error);
    } finally {
      setIsReporting(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !cat || user.id !== cat.userId) return;
    
    setIsDeleting(true);
    try {
      await deleteCat(cat.id);
      toast.success('Post deleted successfully');
      navigate('/home');
    } catch (error) {
      console.error("Error deleting cat:", error);
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const nextMedia = () => {
    if (!cat?.media?.length) return;
    setCurrentMedia((prev) => (prev + 1) % cat.media.length);
  };
  
  const prevMedia = () => {
    if (!cat?.media?.length) return;
    setCurrentMedia((prev) => (prev - 1 + cat.media.length) % cat.media.length);
  };
  
  const renderMedia = (media: CatMedia) => {
    if (media.media_type === 'video') {
      return (
        <video 
          src={media.url} 
          controls 
          className="object-cover w-full h-full animate-fade-in"
        />
      );
    }
    
    return (
      <img
        src={media.url}
        alt={cat?.name}
        className="object-cover w-full h-full animate-fade-in"
      />
    );
  };
  
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse max-w-4xl mx-auto">
            <div className="bg-muted h-[400px] rounded-lg mb-6"></div>
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  if (!cat) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Cat not found</h2>
          <Button asChild>
            <Link to="/">Return to Homepage</Link>
          </Button>
        </div>
      </>
    );
  }
  
  const mediaToDisplay = cat.media && cat.media.length > 0 
    ? cat.media 
    : [{ url: cat.imageUrl, media_type: 'image', id: 'default' }];
  
  const currentMediaItem = mediaToDisplay[currentMedia];
  
  const getConditionBadgeColor = () => {
    return "text-muted-foreground";
  };
  
  const getConditionIcon = () => {
    return <Info className="h-3 w-3" />;
  };
  
  const formatConditionName = (key: string) => {
    if (key === 'isNormal') return 'Normal Health';
    if (key === 'needsMedical') return 'Needs Medical Attention';
    
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };
  
  return (
    <PageTransition>
      <Navbar />
      <div className="container mx-auto py-8 px-4 relative">
        <CatDecoration variant="minimal" />
        
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-1">
            <Link to="/home">
              <ArrowLeft className="h-4 w-4" />
              <span>{t("back_to_listings")}</span>
            </Link>
          </Button>
        </div>
        
        <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="space-y-4">
              <div className="relative aspect-4/3 bg-muted rounded-lg overflow-hidden">
                {currentMediaItem && renderMedia(currentMediaItem)}
                
                {mediaToDisplay.length > 1 && (
                  <>
                    <button
                      onClick={prevMedia}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-1 hover:bg-black/50 transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={nextMedia}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-1 hover:bg-black/50 transition-colors"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                
                {currentMediaItem?.media_type === 'video' && (
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center">
                    <Play className="h-3 w-3 mr-1" />
                    Video
                  </div>
                )}
              </div>
              
              {mediaToDisplay.length > 1 && (
                <div className="flex overflow-x-auto gap-2 pb-1">
                  {mediaToDisplay.map((media: CatMedia, i: number) => (
                    <button
                      key={media.id}
                      onClick={() => setCurrentMedia(i)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                        currentMedia === i ? "border-primary" : "border-transparent hover:border-muted"
                      }`}
                    >
                      {media.media_type === 'video' ? (
                        <>
                          <img 
                            src={media.url} 
                            alt={`Video thumbnail ${i}`} 
                            className="object-cover w-full h-full" 
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                            <Play className="h-6 w-6" />
                          </div>
                        </>
                      ) : (
                        <img 
                          src={media.url} 
                          alt={`Thumbnail ${i}`} 
                          className="object-cover w-full h-full" 
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-6 animate-slide-in-right">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h1 className="text-3xl font-bold">{cat.name}</h1>
                  
                  {user && cat && user.id === cat.userId && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex items-center gap-1">
                          <Trash2 className="h-4 w-4" />
                          {t("delete")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your post.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                
                {uploaderUsername && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {t("uploaded_by")}: <span className="font-medium">@{uploaderUsername}</span>
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                  <div>
                    <span className="font-medium block">{t("breed")}</span>
                    <span>{cat.breed}</span>
                  </div>
                  
                  <Separator orientation="vertical" className="h-10" />
                  
                  <div>
                    <span className="font-medium block">{t("gender")}</span>
                    <span>{cat.gender === "male" ? t("male") : t("female")}</span>
                  </div>
                  
                  {cat.age && (
                    <>
                      <Separator orientation="vertical" className="h-10" />
                      <div>
                        <span className="font-medium block">{t("age")}</span>
                        <span>{cat.age}</span>
                      </div>
                    </>
                  )}
                </div>
                
                {cat.location && (
                  <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{cat.location}</span>
                  </div>
                )}
                
                <Separator className="my-6" />
                
                <h2 className="text-xl font-medium mb-2">{t("condition")}</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {cat.condition && Object.entries(cat.condition).map(([key, value]) => {
                    if (key === 'fertility' || !value) return null;
                    
                    return (
                      <Badge 
                        key={key} 
                        variant="outline" 
                        className="flex items-center gap-1 text-muted-foreground"
                      >
                        <Info className="h-3 w-3" />
                        {formatConditionName(key)}
                      </Badge>
                    );
                  })}
                  
                  {(!cat.condition || Object.entries(cat.condition).filter(([key, value]) => 
                    key !== 'fertility' && value).length === 0) && (
                    <p className="text-muted-foreground">No condition information provided.</p>
                  )}
                </div>
                
                {cat.condition?.fertility && (
                  <div className="mb-6">
                    <h3 className="text-md font-medium mb-2">Fertility Status</h3>
                    <p className="text-muted-foreground">{cat.condition.fertility}</p>
                  </div>
                )}
                
                <h2 className="text-xl font-medium mb-2">{t("description")}</h2>
                <p className="text-muted-foreground mb-6">{cat.description || "No description provided."}</p>
                
                <h2 className="text-xl font-medium mb-2">{t("contact_information")}</h2>
                <div className="space-y-2">
                  {cat.contact?.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{cat.contact.phone}</span>
                    </div>
                  )}
                  
                  {cat.contact?.facebook && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Facebook className="h-4 w-4 text-primary" />
                      <a 
                        href={cat.contact.facebook.startsWith('http') ? cat.contact.facebook : `https://www.${cat.contact.facebook}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {t("facebook_profile")}
                      </a>
                    </div>
                  )}
                  
                  {cat.contact?.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 text-primary" />
                      <a href={`mailto:${cat.contact.email}`} className="hover:underline">
                        {cat.contact.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              {user && cat && user.id !== cat.userId && (
                <Button 
                  variant="destructive" 
                  className="mt-6 flex items-center gap-2"
                  onClick={() => setReportOpen(true)}
                >
                  <Flag className="h-4 w-4" />
                  {t("report_post")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report this post</DialogTitle>
            <DialogDescription>
              Please provide a reason for reporting this post. Posts with 5 or more reports will be automatically removed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Why are you reporting this post?"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReport}
              disabled={isReporting}
            >
              {isReporting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default CatDetail;
