import { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "tl";

type LanguageProviderProps = {
  children: React.ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
};

type LanguageProviderState = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const translations = {
  en: {
    // Navigation
    "home": "Home",
    "upload": "Upload",
    "settings": "Settings",
    "account_settings": "Account Settings",
    "about_us": "About Us",
    "language": "Language",
    "theme": "Theme",
    "dark_mode": "Dark Mode",
    "light_mode": "Light Mode",
    
    // Auth
    "sign_in": "Sign In",
    "sign_up": "Sign Up",
    "sign_up_now": "Create an account",
    "email": "Email",
    "password": "Password",
    "confirm_password": "Confirm Password",
    "username": "Username",
    "first_name": "First Name",
    "last_name": "Last Name",
    "remember_me": "Remember me",
    "forgot_password": "Forgot Password?",
    "create_account": "Create Account",
    "already_have_account": "Already have an account?",
    "dont_have_account": "Don't have an account?",
    "welcome": "Welcome to Cats' Safe Haven",
    "welcome_back": "Welcome Back",
    "login_subtitle": "Your purr-fect login destination",
    "join_community": "Join our community of cat lovers",
    "enter_username": "Enter your username",
    "enter_email": "Enter your email",
    "enter_password": "Enter your password",
    "signing_up": "Creating account...",
    "signing_in": "Signing in...",
    "signup_success": "Account created successfully!",
    "signup_failed": "Failed to create account",
    "login_successful": "Logged in successfully!",
    "login_failed": "Invalid email or password",
    
    // Cat profiles
    "cat_name": "Cat's Name",
    "breed": "Breed",
    "gender": "Gender",
    "male": "Male",
    "female": "Female",
    "age": "Age",
    "description": "Description",
    "condition": "Condition",
    "spayed": "Spayed",
    "neutered": "Neutered",
    "vaccinated": "Vaccinated",
    "dewormed": "Dewormed",
    "needs_medical": "Need Medical Assistance",
    "allergies": "Allergies",
    "normal": "Normal",
    "contact_info": "Contact Information",
    "phone_number": "Phone Number",
    "facebook_profile": "Facebook Profile",
    "upload_cat_details": "Upload Cat Details",
    "add_photo": "Add Photo",
    "add_video": "Add Video",
    "photos_up_to": "Photos (up to 5)",
    "video_optional": "Video (optional)",
    "description_optional": "Description (optional)",
    "submit": "Submit",
    "back_to_listings": "Back to Listings",
    "back_to_home": "Back to home",
    "save_changes": "Save Changes",
    "report_post": "Report Post",
    "contact_support": "Contact Support",
    "report_issue": "Report an issue",
    "upload_a_cat": "Purrfect Feline Friend Showcase",
    "share_cat_details": "Let's help your furry friend find a loving home!",
    "cat_condition": "Cat's Condition/s",
    "images": "Images",
    "upload_images": "Upload Images",
    "video": "Video",
    "upload_video": "Upload Video",
    "uploading": "Uploading",
    "upload_successful_redirecting": "Upload successful! Redirecting...",
    "select_gender": "Select Gender",
    "select_age": "Select Age",
    
    // About section
    "our_vision": "Vision",
    "our_mission": "Mission",
    "our_story": "Our Story",
    "our_team": "Our Team",
    "vision_text": "To create a compassionate and sustainable community where every stray and abandoned cat finds a safe, loving, and permanent home through an accessible and efficient adoption platform.",
    "mission_text": "Our mission is to streamline the cat adoption process in the Philippines by providing a dedicated digital platform that connects rescuers with responsible adopters. Through innovation and technology, we aim to enhance the efficiency of rescue and adoption efforts, promote responsible pet ownership, and support the welfare of stray cats in need.",
    
    // Auth additions
    "log_out": "Log out",
    "logging_out": "Logging out...",
  },
  tl: {
    // Navigation
    "home": "Tahanan",
    "upload": "Mag-upload",
    "settings": "Mga Setting",
    "account_settings": "Mga Setting ng Account",
    "about_us": "Tungkol sa Amin",
    "language": "Wika",
    "theme": "Tema",
    "dark_mode": "Madilim na Mode",
    "light_mode": "Maliwanag na Mode",
    
    // Auth
    "sign_in": "Mag-sign In",
    "sign_up": "Mag-sign Up",
    "sign_up_now": "Gumawa ng account",
    "email": "Email",
    "password": "Password",
    "confirm_password": "Kumpirmahin ang Password",
    "username": "Username",
    "first_name": "Pangalan",
    "last_name": "Apelyido",
    "remember_me": "Tandaan ako",
    "forgot_password": "Nakalimutan ang Password?",
    "create_account": "Lumikha ng Account",
    "already_have_account": "Mayroon ka nang account?",
    "dont_have_account": "Wala ka pang account?",
    "welcome": "Maligayang pagdating sa Cats' Safe Haven",
    "welcome_back": "Maligayang Pagbabalik",
    "login_subtitle": "Ang iyong purr-fect na login destination",
    "join_community": "Sumali sa aming komunidad ng mga cat lovers",
    "enter_username": "Ilagay ang iyong username",
    "enter_email": "Ilagay ang iyong email",
    "enter_password": "Ilagay ang iyong password",
    "signing_up": "Gumagawa ng account...",
    "signing_in": "Nagsa-sign in...",
    "signup_success": "Matagumpay na nagawa ang account!",
    "signup_failed": "Hindi nagawa ang account",
    "login_successful": "Matagumpay na naka-login!",
    "login_failed": "Hindi tamang email o password",
    
    // Cat profiles
    "cat_name": "Pangalan ng Pusa",
    "breed": "Uri",
    "gender": "Kasarian",
    "male": "Lalaki",
    "female": "Babae",
    "age": "Edad",
    "description": "Paglalarawan",
    "condition": "Kondisyon",
    "spayed": "Kapon (Babae)",
    "neutered": "Kapon (Lalaki)",
    "vaccinated": "Nabakunahan",
    "dewormed": "Nalagyan ng Deworming",
    "needs_medical": "Nangangailangan ng Medikal na Tulong",
    "allergies": "May Allergy",
    "normal": "Normal",
    "contact_info": "Impormasyon sa Pakikipag-ugnayan",
    "phone_number": "Numero ng Telepono",
    "facebook_profile": "Facebook Profile",
    "upload_cat_details": "Mag-upload ng Detalye ng Pusa",
    "add_photo": "Magdagdag ng Larawan",
    "add_video": "Magdagdag ng Video",
    "photos_up_to": "Mga Larawan (hanggang 5)",
    "video_optional": "Video (opsyonal)",
    "description_optional": "Paglalarawan (opsyonal)",
    "submit": "Isumite",
    "back_to_listings": "Bumalik sa Mga Listahan",
    "back_to_home": "Bumalik sa tahanan",
    "save_changes": "I-save ang mga Pagbabago",
    "report_post": "I-report ang Post",
    "contact_support": "Makipag-ugnayan sa Support",
    "report_issue": "Mag-report ng isyu",
    "upload_a_cat": "Pagpapakita ng Magandang Pusa Mo",
    "share_cat_details": "Tulungan nating makahanap ng mapagmahal na tahanan ang iyong furry friend!",
    "cat_condition": "Kondisyon ng Pusa",
    "images": "Mga Larawan",
    "upload_images": "Mag-upload ng Mga Larawan",
    "video": "Video",
    "upload_video": "Mag-upload ng Video",
    "uploading": "Nag-a-upload",
    "upload_successful_redirecting": "Matagumpay na na-upload! Inire-redirect...",
    "select_gender": "Piliin ang Kasarian",
    "select_age": "Piliin ang Edad",
    
    // About section
    "our_vision": "Bisyon",
    "our_mission": "Misyon",
    "our_story": "Aming Kwento",
    "our_team": "Aming Koponan",
    "vision_text": "Lumikha ng isang mapagmahal at sustainable na komunidad kung saan ang bawat pusang gala at inabandona ay nakakahanap ng ligtas, mapagmahal, at permanenteng tahanan sa pamamagitan ng accessible at efficient na adoption platform.",
    "mission_text": "Ang aming misyon ay gawing simple ang proseso ng pag-adopt ng mga pusa sa Pilipinas sa pamamagitan ng pagbibigay ng isang dedikadong digital platform na kumokonekta sa mga rescuer sa mga responsableng nag-adopt. Sa pamamagitan ng innovation at teknolohiya, layunin naming pahusayin ang kahusayan ng mga pagsisikap sa rescue at adoption, itaguyod ang responsableng pag-aari ng alagang hayop, at suportahan ang kapakanan ng mga pusang gala na nangangailangan.",
    
    // Auth additions
    "log_out": "Mag-log out",
    "logging_out": "Nag-lo-log out...",
  }
};

const initialState: LanguageProviderState = {
  language: "en",
  setLanguage: () => null,
  t: (key: string) => key,
};

const LanguageContext = createContext<LanguageProviderState>(initialState);

export function LanguageProvider({
  children,
  defaultLanguage = "en",
  storageKey = "cats-safe-haven-language",
  ...props
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem(storageKey) as Language) || defaultLanguage
  );

  const setLanguage = (language: Language) => {
    localStorage.setItem(storageKey, language);
    setLanguageState(language);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider 
      {...props} 
      value={{ language, setLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
};
