import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useLanguage } from "@/providers/language-provider";
import { useAuth } from "@/providers/auth";
import { addCat, uploadCatMedia } from "@/services/cat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { FileInput } from "@/components/file-input";
import { PageTransition } from "@/components/page-transition";
import { Navbar } from "@/components/navbar";
import { ArrowLeft, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CatDecoration } from "@/components/cat-decoration";

const catFormSchema = z.object({
  name: z.string().min(2, {
    message: "Cat name must be at least 2 characters.",
  }),
  breed: z.string().min(2, {
    message: "Breed must be at least 2 characters.",
  }),
  gender: z.enum(["male", "female"]),
  age: z.string()
    .refine(val => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 20, {
      message: "Age must be a number between 0 and 20",
    }),
  description: z.string().optional(),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  nutritionalIssues: z.boolean().default(false).optional(),
  dentalProblems: z.boolean().default(false).optional(),
  respiratoryInfections: z.boolean().default(false).optional(),
  parasiticInfections: z.boolean().default(false).optional(),
  chronicDiseases: z.boolean().default(false).optional(),
  heartConditions: z.boolean().default(false).optional(),
  jointIssues: z.boolean().default(false).optional(),
  skinConditions: z.boolean().default(false).optional(),
  behavioralDisorders: z.boolean().default(false).optional(),
  normal: z.boolean().default(false).optional(),
  phone: z.string()
    .regex(/^\d{11}$/, {
      message: "Phone number must be exactly 11 digits",
    }),
  facebook: z.string().optional(),
  email: z.string().email().optional(),
});

type CatFormData = z.infer<typeof catFormSchema>;

const getAgeCategory = (age: number): string => {
  if (age <= 1) return "Kitten: 0-1 year";
  if (age <= 3) return "Junior: 2-3 years";
  if (age <= 6) return "Prime: 4-6 years";
  if (age <= 10) return "Mature: 7-10 years";
  if (age <= 14) return "Senior: 11-14 years";
  return "Geriatric: 15+ years";
};

const Upload = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [media, setMedia] = useState<{file: File, preview: string, type: 'image' | 'video'}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ageCategory, setAgeCategory] = useState<string>("");
  
  const form = useForm<CatFormData>({
    resolver: zodResolver(catFormSchema),
    defaultValues: {
      name: "",
      breed: "",
      gender: "male",
      age: "",
      description: "",
      location: "",
      nutritionalIssues: false,
      dentalProblems: false,
      respiratoryInfections: false,
      parasiticInfections: false,
      chronicDiseases: false,
      heartConditions: false,
      jointIssues: false,
      skinConditions: false,
      behavioralDisorders: false,
      normal: false,
      phone: "",
      facebook: "",
      email: "",
    },
  });
  
  const watchedAge = form.watch("age");
  
  useEffect(() => {
    if (watchedAge && !isNaN(Number(watchedAge))) {
      const age = Number(watchedAge);
      if (age >= 0 && age <= 20) {
        setAgeCategory(getAgeCategory(age));
      } else {
        setAgeCategory("");
      }
    } else {
      setAgeCategory("");
    }
  }, [watchedAge]);
  
  const handleMediaChange = (files: File[]) => {
    const existingMedia = [...media];
    
    const existingVideos = existingMedia.filter(item => item.type === 'video');
    const newFiles = files.filter(file => {
      if (file.type.startsWith('video/')) {
        return existingVideos.length === 0;
      }
      return true;
    });
    
    if (newFiles.length !== files.length) {
      toast.warning("Only one video can be uploaded. Additional videos have been ignored.");
    }
    
    const newMediaItems = newFiles.map(file => ({
      file: file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' as const : 'image' as const
    }));
    
    setMedia([...existingMedia, ...newMediaItems]);
  };
  
  const handleSubmit = async (data: CatFormData) => {
    if (!user) {
      toast.error("You must be logged in to add a cat");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const conditionData = {
        nutritionalIssues: data.nutritionalIssues,
        dentalProblems: data.dentalProblems,
        respiratoryInfections: data.respiratoryInfections,
        parasiticInfections: data.parasiticInfections,
        chronicDiseases: data.chronicDiseases,
        heartConditions: data.heartConditions,
        jointIssues: data.jointIssues,
        skinConditions: data.skinConditions,
        behavioralDisorders: data.behavioralDisorders,
        normal: data.normal,
      };

      const contactData = {
        phone: data.phone,
        facebook: data.facebook,
        email: data.email,
      };

      const ageWithCategory = data.age + (ageCategory ? ` (${ageCategory})` : "");
      
      const catData = {
        name: data.name,
        breed: data.breed,
        gender: data.gender,
        age: ageWithCategory,
        description: data.description,
        location: data.location,
        condition: conditionData,
        contact: contactData,
        userId: user.id,
      };

      const newCat = await addCat(catData);
      
      if (media.length > 0) {
        const uploadPromises = media.map((item, index) => {
          const file = item.file;
          const isPrimary = index === 0;
          const mediaType = item.type;
          
          return uploadCatMedia(newCat.id, file, isPrimary, mediaType);
        });
        
        await Promise.all(uploadPromises);
        
        toast.success("Cat and all media uploaded successfully!");
      } else {
        toast.success("Cat added successfully!");
      }
      
      navigate(`/cats/${newCat.id}`);
    } catch (error) {
      console.error("Error adding cat:", error);
      setSubmitError("Failed to add cat. Please try again.");
      toast.error("Failed to add cat. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <PageTransition>
      <Navbar />
      <div className="container mx-auto py-8 px-4 relative">
        <CatDecoration variant="standard" />
        
        <div className="fixed top-20 left-4 z-50">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="gap-1 bg-background/80 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("back_to_home")}</span>
          </Button>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-primary">Paw-some New Friend</CardTitle>
            <CardDescription className="text-lg mt-2">Help a furry companion find their forever home! 🐱</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("cat_name")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("cat_name")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="breed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("breed")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("breed")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("gender")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("select_gender")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">{t("male")}</SelectItem>
                          <SelectItem value="female">{t("female")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("age")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter age (0-20)" type="number" min="0" max="20" {...field} />
                      </FormControl>
                      {ageCategory && (
                        <FormDescription className="text-primary font-medium">{ageCategory}</FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="Where is this cat located?" 
                            {...field} 
                            className="pl-10"
                          />
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Enter the city or area where the cat is currently located
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("description")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("description")}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold">{t("condition")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t("condition_description")}</p>
                  
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="normal"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Normal - Just a good lil' kitty</FormLabel>
                            <FormDescription>
                              Healthy with no known conditions
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nutritionalIssues"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Nutritional Issues</FormLabel>
                            <FormDescription>
                              Obesity, malnutrition, or food allergies
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dentalProblems"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Dental Problems</FormLabel>
                            <FormDescription>
                              Tartar buildup, gum disease, and tooth decay
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="respiratoryInfections"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Respiratory Infections</FormLabel>
                            <FormDescription>
                              Cold-like symptoms from viruses or bacteria
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="parasiticInfections"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Parasitic Infections</FormLabel>
                            <FormDescription>
                              Fleas, ticks, ear mites, and worms
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="chronicDiseases"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Chronic Diseases</FormLabel>
                            <FormDescription>
                              Diabetes, kidney disease, and hyperthyroidism
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="heartConditions"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Heart Conditions</FormLabel>
                            <FormDescription>
                              Hypertrophic cardiomyopathy and other heart diseases
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="jointIssues"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Joint and Mobility Issues</FormLabel>
                            <FormDescription>
                              Arthritis and injuries affecting movement
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="skinConditions"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Skin Conditions</FormLabel>
                            <FormDescription>
                              Allergies, fungal infections, and excessive grooming
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="behavioralDisorders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Behavioral Disorders</FormLabel>
                            <FormDescription>
                              Anxiety, cognitive dysfunction, and stress-related behaviors
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold">{t("contact_information")}</h3>
                  <p className="text-sm text-muted-foreground">{t("contact_information_description")}</p>
                  
                  <div className="mt-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("phone")}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter 11 digit phone number" 
                              {...field} 
                              type="tel"
                              maxLength={11}
                              pattern="[0-9]{11}"
                              onInput={(e) => {
                                e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Phone number must be exactly 11 digits
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("facebook")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("facebook_profile_url")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("email")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("email")} {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold">{t("media")}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{t("media_description")}</p>
                  <div className="text-sm text-muted-foreground mb-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-primary/10">Images: Unlimited</Badge>
                    <Badge variant="outline" className="bg-primary/10">Videos: Max 1</Badge>
                  </div>
                  
                  <FileInput 
                    onChange={handleMediaChange} 
                    multiple 
                    accept="image/*,video/*"
                    maxVideos={1}
                    existingFileCount={media.length}
                  />
                  
                  {media.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {media.map((item, index) => (
                        <div key={index} className="relative">
                          {item.type === 'image' ? (
                            <img 
                              src={item.preview} 
                              alt={`Media ${index + 1}`} 
                              className="w-full aspect-square object-cover rounded-md" 
                            />
                          ) : (
                            <div className="relative w-full aspect-square rounded-md bg-black">
                              <video 
                                src={item.preview} 
                                className="w-full h-full object-contain rounded-md" 
                                controls
                              />
                              <Badge className="absolute top-2 right-2 bg-red-500">VIDEO</Badge>
                            </div>
                          )}
                          {index === 0 && (
                            <Badge className="absolute top-2 left-2">Primary</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {submitError && (
                  <p className="text-red-500">{submitError}</p>
                )}
                
                <Button 
                  disabled={isSubmitting} 
                  type="submit"
                  className="w-full"
                >
                  {isSubmitting ? t("submitting") : "Find This Kitty a Home!"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default Upload;
