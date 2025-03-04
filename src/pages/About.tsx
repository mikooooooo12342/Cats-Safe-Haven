
import { ArrowLeft, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { useLanguage } from "@/providers/language-provider";
import { Navbar } from "@/components/navbar";
import { CatDecoration } from "@/components/cat-decoration";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const About = () => {
  const { t } = useLanguage();
  
  const teamMembers = [
    {
      name: "Miko Stephen P. Camu",
      role: "Lead Developer",
      avatar: "/images/Default_Pic.png"
    },
    {
      name: "Kyle Niño T. Alcuizar",
      role: "Developer",
      avatar: "/images/Default_Pic.png"
    },
    {
      name: "Francis Kim D. Pascual",
      role: "Developer and Designer",
      avatar: "/images/Default_Pic.png"
    },
    {
      name: "Rolando M. Ortega III",
      role: "Developer",
      avatar: "/images/Default_Pic.png"
    },

  ];
  
  return (
    <PageTransition>
      <Navbar />
      <div className="container mx-auto px-4 py-8 relative">
        <CatDecoration variant="minimal" />
        
        <div className="fixed top-20 left-4 z-50">
          <Button variant="ghost" size="sm" asChild className="gap-1 bg-background/80 backdrop-blur-sm">
            <Link to="/home">
              <ArrowLeft className="h-4 w-4" />
              <span>{t("back_to_home")}</span>
            </Link>
          </Button>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm overflow-hidden max-w-4xl mx-auto">
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-8 text-center animate-slide-in">
              {t("about_us")}
            </h1>
            
            <div className="space-y-10">
              <section className="animate-slide-in" style={{ animationDelay: "0.1s" }}>
                <h2 className="text-xl font-semibold mb-3">{t("our_vision")}</h2>
                <p className="text-muted-foreground">
                  {t("vision_text")}
                </p>
              </section>
              
              <section className="animate-slide-in" style={{ animationDelay: "0.2s" }}>
                <h2 className="text-xl font-semibold mb-3">{t("our_mission")}</h2>
                <p className="text-muted-foreground">
                  {t("mission_text")}
                </p>
              </section>
              
              <section className="animate-slide-in" style={{ animationDelay: "0.3s" }}>
                <h2 className="text-xl font-semibold mb-3">{t("our_story")}</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    Cats' Safe Haven was created by a group of passionate students from the CCAP team who share a love for animals and a vision for a better future for stray cats in the Philippines. As part of our Web Systems and Technologies 2 project, we recognized the challenges faced by rescuers and adopters in finding the right match through social media. Seeing the need for a more efficient solution, we developed this platform to make cat adoption easier, more organized, and more accessible to everyone.
                  </p>
                  <p>
                    With diverse skills in web development, user experience design, and project management, our team worked together to build a system that not only connects adopters with rescued cats but also supports a growing community of animal advocates. Our journey has been driven by a shared passion for animal welfare and the belief that every cat deserves a loving home. Through Cats' Safe Haven, we hope to make a meaningful difference—one adoption at a time.
                  </p>
                </div>
              </section>
              
              <section className="animate-slide-in" style={{ animationDelay: "0.4s" }}>
                <h2 className="text-xl font-semibold mb-6">{t("our_team")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {teamMembers.map((member, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card animate-zoom-in"
                      style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                    >
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              
              <section className="animate-slide-in" style={{ animationDelay: "0.6s" }}>
                <h2 className="text-xl font-semibold mb-4">{t("report_issue")}</h2>
                <Button className="w-full md:w-auto" asChild>
                  <a href="mailto:support@catssafehaven.com">
                    <Phone className="mr-2 h-4 w-4" />
                    {t("contact_support")}
                  </a>
                </Button>
              </section>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default About;
