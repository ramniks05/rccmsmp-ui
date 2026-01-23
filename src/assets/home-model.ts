// ================= home.model.ts =================

export interface StateConfig {
  stateName: string;
  departmentName: string;
  primaryColor: string;
  secondaryColor: string;
  helpline: string;
  email: string;
  logoUrl: string;
}

export interface Banner {
  imageUrl: string;
  title: string;
  subtitle: string;
}

export interface Statistic {
  label: string;
  value: number;
}

export interface Notice {
  title: string;
  date: string;
  isNew: boolean;
}

export interface QuickService {
  title: string;
  icon: string;
}

export interface ServiceCategory {
  title: string;
  icon: string;
}

export interface HomeData {
  stateConfig: StateConfig;
  banners: Banner[];
  statistics: Statistic[];
  notices: Notice[];
  quickServices: QuickService[];
  categories: ServiceCategory[];
  vision: string;
  mission: string;
  whatsNew: string[];
}
