
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CatPost } from "@/services/cat/types";

interface CatRandomizerProps {
  cats: CatPost[];
  onRandomCat: (cat: CatPost) => void;
}

export function CatRandomizer({ cats, onRandomCat }: CatRandomizerProps) {
  const [criteria, setCriteria] = useState<string>("any");

  const getRandomCat = () => {
    if (cats.length === 0) {
      toast.error("No cats available to randomize");
      return;
    }

    let filteredCats = [...cats];

    // Filter based on selected criteria
    switch (criteria) {
      case "male":
        filteredCats = cats.filter(cat => cat.gender?.toLowerCase() === "male");
        break;
      case "female":
        filteredCats = cats.filter(cat => cat.gender?.toLowerCase() === "female");
        break;
      case "young":
        filteredCats = cats.filter(cat => {
          const age = cat.age?.toLowerCase();
          return age?.includes("kitten") || age?.includes("young") || age?.includes("baby");
        });
        break;
      case "adult":
        filteredCats = cats.filter(cat => {
          const age = cat.age?.toLowerCase();
          return age?.includes("adult") || age?.includes("senior");
        });
        break;
      case "healthy":
        filteredCats = cats.filter(cat => cat.condition?.normal === true);
        break;
      default:
        // No filtering for "any"
        break;
    }

    if (filteredCats.length === 0) {
      toast.error(`No cats match the "${criteria}" criteria`);
      return;
    }

    // Pick a random cat from the filtered list
    const randomIndex = Math.floor(Math.random() * filteredCats.length);
    const randomCat = filteredCats[randomIndex];
    
    toast.success(`Found a random ${criteria !== "any" ? criteria + " " : ""}cat for you!`);
    onRandomCat(randomCat);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mb-6 bg-muted/30 p-4 rounded-lg">
      <div className="flex-1">
        <Select value={criteria} onValueChange={setCriteria}>
          <SelectTrigger>
            <SelectValue placeholder="Select criteria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Cat</SelectItem>
            <SelectItem value="male">Male Cats</SelectItem>
            <SelectItem value="female">Female Cats</SelectItem>
            <SelectItem value="young">Young Cats</SelectItem>
            <SelectItem value="adult">Adult Cats</SelectItem>
            <SelectItem value="healthy">Healthy Cats</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={getRandomCat} className="flex items-center gap-2">
        <Shuffle className="h-4 w-4" />
        <span>Randomize</span>
      </Button>
    </div>
  );
}
