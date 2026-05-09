'use client';

import type {
  Category,
  Consultation,
  ConsultationStatus,
  LoginResponse,
  Product,
} from './types';

export type HomeStory = {
  image_url: string;
};

export type HomeBundle = {
  categories: Category[];
  products: Product[];
  featured: Product[];
  hero: Product | null;
  story: HomeStory;
};

export type ProductDetailBundle = {
  product: Product;
  related?: Product[];
  featured?: Product[];
};

const TOKEN_KEY = 'repo_admin_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let finalPath = path;
  const method = (options.method ?? 'GET').toUpperCase();
  if (token && method === 'GET') {
    const sep = finalPath.includes('?') ? '&' : '?';
    finalPath = `${finalPath}${sep}_t=${Date.now()}`;
  }

  const res = await fetch(finalPath, { ...options, headers });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = (data && (data as { message?: string }).message) || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  login(username: string, password: string) {
    return request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  me() {
    return request<{ admin: { sub: number; username: string } }>('/api/auth/me');
  },
  listCategories() {
    return request<Category[]>('/api/categories');
  },
  getCategory(idOrSlug: string | number) {
    return request<Category>(`/api/categories/${idOrSlug}`);
  },
  createCategory(input: Partial<Category>) {
    return request<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  updateCategory(id: number, input: Partial<Category>) {
    return request<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
  deleteCategory(id: number) {
    return request<void>(`/api/categories/${id}`, { method: 'DELETE' });
  },
  listProducts(params: { category?: string | number; q?: string; tier?: string; include_sold?: boolean } = {}) {
    const search = new URLSearchParams();
    if (params.category !== undefined) search.set('category', String(params.category));
    if (params.q) search.set('q', params.q);
    if (params.tier) search.set('tier', params.tier);
    if (params.include_sold) search.set('include_sold', '1');
    const qs = search.toString();
    return request<Product[]>(`/api/products${qs ? `?${qs}` : ''}`);
  },
  getProduct(idOrSlug: string | number) {
    return request<Product>(`/api/products/${idOrSlug}`);
  },
  createProduct(input: Partial<Product>) {
    return request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  updateProduct(id: number, input: Partial<Product>) {
    return request<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
  setProductActive(id: number, isActive: boolean) {
    return request<Product>(`/api/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    });
  },
  setProductSold(id: number, isSold: boolean) {
    return request<Product>(`/api/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_sold: isSold }),
    });
  },
  deleteProduct(id: number) {
    return request<void>(`/api/products/${id}`, { method: 'DELETE' });
  },
  listFeaturedProducts() {
    return request<Product[]>('/api/products/featured');
  },
  setFeaturedProducts(ids: number[]) {
    return request<{ count: number; ids: number[] }>('/api/products/featured', {
      method: 'PUT',
      body: JSON.stringify({ ids }),
    });
  },
  getHeroProduct() {
    return request<Product | null>('/api/products/hero');
  },
  setHeroProduct(id: number | null) {
    return request<Product | null>('/api/products/hero', {
      method: 'PUT',
      body: JSON.stringify({ id }),
    });
  },
  getHomeStory() {
    return request<HomeStory>('/api/site-settings/home_story');
  },
  setHomeStory(input: HomeStory) {
    return request<HomeStory>('/api/site-settings/home_story', {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
  submitConsultation(input: {
    name?: string;
    gender?: 'male' | 'female' | 'other';
    phone: string;
    note?: string;
  }) {
    return request<{ ok: true; id: number; created_at: string }>(
      '/api/consultations',
      { method: 'POST', body: JSON.stringify(input) },
    );
  },
  listConsultations() {
    return request<Consultation[]>('/api/consultations');
  },
  setConsultationStatus(id: number, status: ConsultationStatus) {
    return request<Consultation>(`/api/consultations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  deleteConsultation(id: number) {
    return request<void>(`/api/consultations/${id}`, { method: 'DELETE' });
  },
};
