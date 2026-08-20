import type { Category } from '@/data/categories';
import type { Offer } from '@/data/offers';
import type { Product } from '@/data/products';

const fallbackProductImage = '/WhatsApp_Image_2026-08-20_at_11.40.38_AM.jpeg';

/**
 * Public API root. Set NEXT_PUBLIC_API_URL in the deployment environment, e.g.
 * https://api.example.com/api. The local default matches the backend server.
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9020/api').replace(/\/$/, '');

type ApiResponse<T> = { success?: boolean; data?: T; message?: string };

export type ApiResult<T> = { ok: boolean; data: T | null; message: string; status: number };
export type AuthUser = { id: string; name?: string; email?: string; mobile?: string; profileImage?: string };
export type PublicSettings = { siteTitle?: string; siteDescription?: string; contactEmail?: string; contactPhone?: string; aboutUs?: string; facebookUrl?: string; instagramUrl?: string; twitterUrl?: string; privacyPolicy?: string; termsAndConditions?: string; shippingPolicy?: string };

export type HomeBanner = {
  id: string;
  title: string;
  image?: string;
  productId?: string;
};

type ApiCategory = {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
};

type ApiProduct = {
  _id: string;
  slug?: string;
  name: string;
  description?: string;
  image?: string;
  unitValue?: number;
  unit?: string;
  mrp?: number;
  displayPrice?: number;
  sellingPrice?: number;
  discountValue?: number;
  categoryId?: { name?: string } | string;
};

type ApiOffer = {
  _id: string;
  name: string;
  description?: string;
  offerType?: 'flat_discount' | 'percentage_discount' | 'bogo';
  discountValue?: number;
};

export function assetUrl(value?: string) {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  const apiOrigin = API_URL.replace(/\/api$/, '');
  return `${apiOrigin}${value.startsWith('/') ? value : `/${value}`}`;
}

export function authHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = window.localStorage.getItem('bb_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function get<T>(path: string, authenticated = false): Promise<T | null> {
  const controller = new AbortController();
  const timeout = typeof window === 'undefined' ? undefined : window.setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: authenticated ? authHeaders() : undefined,
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as ApiResponse<T>;
    return payload.success === false ? null : payload.data ?? null;
  } catch {
    return null;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timeout = typeof window === 'undefined' ? undefined : window.setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
      signal: controller.signal,
    });
    const payload = (await response.json()) as ApiResponse<T>;
    return { ok: response.ok && payload.success !== false, data: response.ok && payload.success !== false ? payload.data ?? null : null, message: payload.message || 'Something went wrong', status: response.status };
  } catch {
    return { ok: false, data: null, message: 'Unable to connect to the bakery service. Please try again.', status: 0 };
  } finally { if (timeout) clearTimeout(timeout); }
}

export function sendOtp(identifier: string, type: 'email' | 'mobile') {
  return request<{ devOTP?: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, type }) });
}

export async function verifyOtp(identifier: string, type: 'email' | 'mobile', otp: string, name?: string) {
  try {
    const response = await fetch(`${API_URL}/auth/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier, type, otp, name }) });
    const payload = await response.json() as { success?: boolean; message?: string; token?: string; user?: AuthUser };
    return { ok: response.ok && !!payload.success, data: response.ok && payload.success ? { ...payload.user, token: payload.token } as AuthUser & { token: string } : null, message: payload.message || 'Unable to verify OTP', status: response.status };
  } catch { return { ok: false, data: null, message: 'Unable to connect to the bakery service. Please try again.', status: 0 }; }
}

const categoryIcon = (name?: string) => {
  const value = (name || '').toLowerCase();
  if (value.includes('cake')) return '🍰';
  if (value.includes('bread')) return '🥖';
  if (value.includes('cookie') || value.includes('biscuit')) return '🍪';
  if (value.includes('snack') || value.includes('namkeen')) return '🥟';
  if (value.includes('pastr')) return '🧁';
  if (value.includes('dessert')) return '🍮';
  if (value.includes('gift') || value.includes('hamper')) return '🎁';
  return '▦';
};

export async function getHomeBanners(): Promise<HomeBanner[]> {
  const banners = await get<Array<{ _id: string; title: string; image?: string; productId?: string | { _id?: string } }>>('/banners');
  return (banners ?? []).map((banner) => ({
    id: banner._id,
    title: banner.title,
    image: assetUrl(banner.image),
    productId: typeof banner.productId === 'string' ? banner.productId : banner.productId?._id,
  }));
}

export async function getPublicSettings(): Promise<PublicSettings | null> {
  return get<PublicSettings>('/settings');
}

export async function getHomeCategories(): Promise<Category[]> {
  const categories = await get<ApiCategory[]>('/categories');
  return (categories ?? []).filter((category) => category.name && !/gift\s*hamper/i.test(category.name)).map((category) => ({
    id: category._id,
    name: category.name,
    slug: category.slug || (category.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    icon: categoryIcon(category.name),
  }));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await get<ApiProduct[]>('/products?isFeatured=true&limit=6', true);
  return mapProducts(products ?? []);
}

export async function getProducts(search = ''): Promise<Product[]> {
  const params = new URLSearchParams({ limit: '100' });
  if (search) params.set('search', search);
  const products = await get<ApiProduct[]>(`/products?${params.toString()}`, true);
  return mapProducts(products ?? []);
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = await get<ApiProduct>(`/products/${id}`, true);
  return product ? mapProducts([product])[0] : null;
}

function mapProducts(products: ApiProduct[]): Product[] {
  return products.map((product) => {
    const price = Number(product.displayPrice ?? product.sellingPrice ?? product.mrp ?? 0);
    const originalPrice = Number(product.mrp ?? 0);
    const category = typeof product.categoryId === 'object' ? product.categoryId?.name || 'Bakery' : 'Bakery';
    const discount = product.discountValue
      ? `${product.discountValue}% OFF`
      : originalPrice > price ? `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF` : undefined;

    return {
      id: product._id,
      slug: product.slug || product._id,
      name: product.name || 'Fresh bakery item',
      category,
      weight: product.unitValue && product.unit ? `${product.unitValue} ${product.unit}` : 'Freshly baked',
      price,
      originalPrice: originalPrice > price ? originalPrice : undefined,
      discount,
      rating: 0,
      reviews: 0,
      calories: 0,
      keywords: [(product.name || '').toLowerCase(), category.toLowerCase()],
      image: assetUrl(product.image) || fallbackProductImage,
    };
  });
}

export async function getActiveOffers(): Promise<Offer[]> {
  const offers = await get<ApiOffer[]>('/offers', true);
  return (offers ?? []).map((offer) => ({
    id: offer._id,
    title: offer.name,
    subtitle: offer.description || (offer.offerType === 'bogo' ? 'Buy one, get one' : `Save ${offer.discountValue ?? 0}${offer.offerType === 'percentage_discount' ? '%' : '₹'}`),
    icon: offer.offerType === 'percentage_discount' ? '%' : offer.offerType === 'bogo' ? '2×1' : '₹',
  }));
}
