export type SavedAddress = {
  id: string;
  backendId?: string;
  label: 'Home' | 'Work' | 'Hotel' | 'Other';
  city: string;
  area: string;
  fullAddress: string;
  mapLink?: string;
  receiverName: string;
  phone: string;
};

export const cities = ['Hisar', 'Delhi', 'Chandigarh', 'Gurugram', 'Jaipur'];

export const areasByCity: Record<string, string[]> = {
  Hisar: ['Bhamashah Nagar', 'Model Town', 'Civil Lines', 'Hisar Fort'],
  Delhi: ['Connaught Place', 'Saket', 'Rohini', 'Dwarka'],
  Chandigarh: ['Sector 17', 'Sector 22', 'Mani Majra', 'Mohali'],
  Gurugram: ['Cyber City', 'Sector 14', 'Sushant Lok', 'Palam Vihar'],
  Jaipur: ['Pink City', 'Malviya Nagar', 'Vaishali Nagar', 'C-Scheme'],
};

export const defaultLocation = 'Bhamashah Nagar, Hisar';
