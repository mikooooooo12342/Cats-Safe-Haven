
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PageTransition } from "@/components/page-transition";
import { Navbar } from "@/components/navbar";
import { CatCard } from "@/components/cat-card";
import { CatRandomizer } from "@/components/cat-randomizer";
import { CatDecoration } from "@/components/cat-decoration";
import { getAllCats } from "@/services/cat/fetch-cats";
import { CatPost } from "@/services/cat/types";
import { SearchX } from "lucide-react";

// Random cat search prompts
const SEARCH_PROMPTS = [
  "Find your purr-fect match",
  "Discover your feline friend",
  "Meet your new furry companion",
  "Find a whisker-ed friend",
  "Adopt a purr-sonality",
  "Find your paw-some partner",
  "Rescue a furry friend today",
  "Find your cuddle buddy",
  "Meet your new four-legged family member",
  "Find a tail-wagging companion",
];

const Home = () => {
  const [cats, setCats] = useState<CatPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";
  const navigate = useNavigate();
  
  // Get a random search prompt
  const randomPrompt = SEARCH_PROMPTS[Math.floor(Math.random() * SEARCH_PROMPTS.length)];

  useEffect(() => {
    const fetchCats = async () => {
      setIsLoading(true);
      try {
        const fetchedCats = await getAllCats();
        setCats(fetchedCats);
      } catch (error) {
        console.error("Error fetching cats:", error);
        toast.error("Failed to load cats. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCats();
  }, []);

  // Filter cats based on search query
  const filteredCats = cats.filter(cat => {
    if (!searchQuery) return true;
    
    const nameMatch = cat.name?.toLowerCase().includes(searchQuery);
    const breedMatch = cat.breed?.toLowerCase().includes(searchQuery);
    const locationMatch = cat.location?.toLowerCase().includes(searchQuery);
    
    return nameMatch || breedMatch || locationMatch;
  });

  // Handle random cat selection
  const handleRandomCat = (cat: CatPost) => {
    navigate(`/cats/${cat.id}`);
  };

  return (
    <PageTransition>
      <Navbar />
      <div className="container mx-auto py-8 px-4 relative">
        <CatDecoration variant="standard" />
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{searchQuery ? "Search Results" : randomPrompt}</h1>
          {searchQuery ? (
            <p className="text-muted-foreground">
              Showing results for "{searchQuery}"
            </p>
          ) : (
            <p className="text-muted-foreground">
              Browse through our available cats looking for a loving home
            </p>
          )}
        </div>

        {!isLoading && !searchQuery && (
          <div className="flex justify-center mb-8">
            <CatRandomizer cats={cats} onRandomCat={handleRandomCat} />
          </div>
        )}

        {isLoading ? (
          <div className="grid place-items-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <p className="text-muted-foreground">Loading cats...</p>
            </div>
          </div>
        ) : filteredCats.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCats.map((cat) => (
              <CatCard key={cat.id} cat={cat} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No cats found</h2>
            <p className="text-muted-foreground text-center max-w-md">
              {searchQuery 
                ? `We couldn't find any cats matching "${searchQuery}". Try a different search term.` 
                : "There are no cats available right now. Please check back later."}
            </p>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Home;
