
export interface CatMedia {
  id: string;
  cat_id: string;
  file_path: string;
  is_primary: boolean;
  media_type: 'image' | 'video';
  url?: string;
}

export interface CatCondition {
  nutritionalIssues?: boolean;
  dentalProblems?: boolean;
  respiratoryInfections?: boolean;
  parasiticInfections?: boolean;
  chronicDiseases?: boolean;
  heartConditions?: boolean;
  jointIssues?: boolean;
  skinConditions?: boolean;
  behavioralDisorders?: boolean;
  normal?: boolean;
}

export interface CatContact {
  phone?: string;
  facebook?: string;
  email?: string;
}

export interface CatData {
  id: string;
  name: string;
  breed?: string;
  gender?: string;
  age?: string;
  location?: string;
  description?: string;
  imageUrl: string;
  condition?: CatCondition;
  contact?: CatContact;
  userId: string;
  createdAt: string;
  status?: 'available' | 'adopted';
}

export interface CatPost extends CatData {
  media?: CatMedia[];
  uploaderUsername?: string;
}
