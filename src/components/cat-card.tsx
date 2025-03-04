
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Flag, MessageCircle, MapPin, Heart } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/providers/auth";
import { toast } from "sonner";
import { reportCat } from "@/services/cat-service";
import { CatData } from "@/services/cat/types";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface CatCardProps {
  cat: CatData;
}

export function CatCard({ cat }: CatCardProps) {
  const { user, isAuthenticated } = useAuth();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleReport = async () => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to report a post");
      return;
    }
    
    if (!reportReason.trim()) {
      toast.error("Please provide a reason for reporting this post");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await reportCat(cat.id, user.id, reportReason);
      toast.success("Post reported successfully");
      setIsReportDialogOpen(false);
      setReportReason("");
    } catch (error) {
      console.error("Error reporting post:", error);
      toast.error("Failed to report post");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Display conditions as badges
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
  
  return (
    <Card className="overflow-hidden card-hover group relative">
      <Link to={`/cats/${cat.id}`}>
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={cat.imageUrl}
            alt={cat.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {/* Cute heart that appears on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-primary/20 backdrop-blur-sm p-2 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
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
      
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur">
                <MoreHorizontal className="h-4 w-4 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DialogTrigger asChild>
                <DropdownMenuItem className="cursor-pointer">
                  <Flag className="h-4 w-4 mr-2" />
                  <span>Report Post</span>
                </DropdownMenuItem>
              </DialogTrigger>
              {cat.contact && (
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link to={`/cats/${cat.id}`}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    <span>Contact Owner</span>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report this post</DialogTitle>
              <DialogDescription>
                Please provide a reason why you're reporting this post.
                The post will be reviewed by our team.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <Textarea 
                placeholder="Reason for reporting..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsReportDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReport}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}
