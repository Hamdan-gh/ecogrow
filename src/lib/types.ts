export interface Profile {
  id: string;
  full_name: string;
  location?: string;
  eco_coins: number;
  badges: string[];
  created_at: string;
  updated_at: string;
}

export interface Tree {
  id: string;
  user_id: string;
  tree_name: string;
  growth_level: number;
  humidity: number;
  soil_condition: 'excellent' | 'good' | 'fair' | 'poor';
  total_scans: number;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  price_eco_coin: number;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  item_id: string;
  item_name: string;
  price: number;
  delivery_info: DeliveryInfo;
  status: 'pending' | 'approved' | 'on the way' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface DeliveryInfo {
  fullName: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  additionalNotes?: string;
}

export interface ScanResult {
  tree: Tree;
  reward: number;
  bonuses: Array<{ name: string; amount: number }>;
  message: string;
  analysis: {
    growthQuality: string;
    humidityStatus: string;
    soilQuality: string;
  };
}
