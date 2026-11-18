import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { products as initialProducts, courses as initialCourses } from '../data';
import type { Product, Course } from '../data';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  enrolledCourses: string[];
  joinedAt: string;
  // Profile address fields
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  zip?: string;
  avatar?: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export interface Purchase {
  id: string;
  userId: string;
  orderNumber: string;
  date: string;
  items: PurchaseItem[];
  total: number;
  status: 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
}

export interface DiscountRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
}

type Priceable = { price: number; discountEnabled?: boolean; discountId?: string };
export function getEffectivePrice(product: Priceable, rules: DiscountRule[]): number {
  if (!product.discountEnabled || !product.discountId) return product.price;
  const rule = rules.find(r => r.id === product.discountId);
  if (!rule) return product.price;
  if (rule.type === 'percentage') return Math.max(0, product.price * (1 - rule.value / 100));
  return Math.max(0, product.price - rule.value);
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  text: string;
  date: string;
}

interface AuthContextValue {
  user: User | null;
  users: User[];
  purchases: Purchase[];
  reviews: Review[];
  adminProducts: Product[];
  setAdminProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  adminCourses: Course[];
  setAdminCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  discountRules: DiscountRule[];
  setDiscountRules: React.Dispatch<React.SetStateAction<DiscountRule[]>>;
  // Course progress: courseId → array of completed video/lesson IDs
  courseProgress: Record<string, string[]>;
  markVideoComplete: (courseId: string, videoId: string) => void;
  getCompletedVideos: (courseId: string) => string[];
  login: (email: string, password: string) => Promise<{ ok: boolean; user?: User; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  enrollInCourse: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;
  updateUser: (id: string, data: Partial<User>) => void;
  addPurchase: (purchase: Omit<Purchase, 'id'>) => void;
  cancelPurchase: (purchaseId: string) => void;
  addReview: (review: Omit<Review, 'id'>) => void;
  getUserPurchases: (userId: string) => Purchase[];
  getUserReviews: (userId: string) => Review[];
  getProductReviews: (productId: string) => Review[];
}

const INITIAL_USERS: User[] = [
  { id: '0', name: 'Admin Jardín', email: 'admin@jardin.com', role: 'admin', enrolledCourses: [], joinedAt: '2024-01-01' },
  { id: '1', name: 'María González', email: 'maria@email.com', role: 'user', enrolledCourses: ['1', '3'], joinedAt: '2024-02-15', phone: '+52 55 1234 5678', city: 'Ciudad de México', country: 'México' },
  { id: '2', name: 'Carlos Vega', email: 'carlos@email.com', role: 'user', enrolledCourses: ['2'], joinedAt: '2024-03-10', phone: '+57 300 123 4567', city: 'Bogotá', country: 'Colombia' },
  { id: '3', name: 'Laura Martín', email: 'laura@email.com', role: 'user', enrolledCourses: ['1', '2', '4'], joinedAt: '2024-04-05', phone: '+54 11 2345 6789', city: 'Buenos Aires', country: 'Argentina' },
];

const PASSWORDS: Record<string, string> = {
  'admin@jardin.com': 'admin123',
  'maria@email.com': 'pass123',
  'carlos@email.com': 'pass123',
  'laura@email.com': 'pass123',
};

const INITIAL_PURCHASES: Purchase[] = [
  {
    id: 'p1', userId: '1', orderNumber: '428391', date: '2024-11-10',
    items: [
      { productId: '1', productName: 'Árnica Montana Tintura', productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', quantity: 2, price: 18.99 },
      { productId: '3', productName: 'Manzanilla Orgánica', productImage: 'https://images.unsplash.com/photo-1597870230751-5b3d0b0a1af1?w=400', quantity: 1, price: 12.50 },
    ],
    total: 50.48, status: 'delivered', shippingAddress: 'Av. Insurgentes 123, Ciudad de México',
  },
  {
    id: 'p2', userId: '1', orderNumber: '519204', date: '2025-01-22',
    items: [
      { productId: '5', productName: 'Aceite Esencial Lavanda', productImage: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400', quantity: 1, price: 24.99 },
    ],
    total: 24.99, status: 'shipped', shippingAddress: 'Av. Insurgentes 123, Ciudad de México',
  },
  {
    id: 'p3', userId: '2', orderNumber: '631847', date: '2024-12-05',
    items: [
      { productId: '2', productName: 'Valeriana Cápsulas', productImage: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400', quantity: 1, price: 22.00 },
    ],
    total: 22.00, status: 'delivered', shippingAddress: 'Calle 72 #15-30, Bogotá',
  },
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1', userId: '1', productId: '1', productName: 'Árnica Montana Tintura',
    productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    rating: 5, text: 'Excelente producto, muy efectivo para los golpes y contusiones. Lo recomiendo.', date: '2024-11-18',
  },
  {
    id: 'r2', userId: '2', productId: '2', productName: 'Valeriana Cápsulas',
    productImage: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
    rating: 4, text: 'Me ayuda mucho para dormir. Buen producto aunque tarda un poco en hacer efecto.', date: '2024-12-14',
  },
];

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [passwords, setPasswords] = useState<Record<string, string>>(PASSWORDS);
  const [purchases, setPurchases] = useState<Purchase[]>(INITIAL_PURCHASES);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [adminProducts, setAdminProducts] = useState<Product[]>(initialProducts);
  const [adminCourses, setAdminCourses] = useState<Course[]>(initialCourses);
  const [courseProgress, setCourseProgress] = useState<Record<string, string[]>>({});
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([
    { id: 'd1', name: 'Descuento 10%', type: 'percentage', value: 10 },
    { id: 'd2', name: 'Descuento 20%', type: 'percentage', value: 20 },
    { id: 'd3', name: 'Rebaja $5', type: 'fixed', value: 5 },
  ]);

  const login = async (email: string, password: string): Promise<{ ok: boolean; user?: User; error?: string }> => {
    const found = users.find(u => u.email === email);
    if (!found) return { ok: false, error: 'El correo no está registrado' };
    if (passwords[email] !== password) return { ok: false, error: 'Contraseña incorrecta' };
    setUser(found);
    return { ok: true, user: found };
  };

  const register = async (name: string, email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    if (users.find(u => u.email === email)) return { ok: false, error: 'Este correo ya está registrado' };
    const newUser: User = {
      id: Date.now().toString(), name, email, role: 'user',
      enrolledCourses: [], joinedAt: new Date().toISOString().split('T')[0],
    };
    setUsers(prev => [...prev, newUser]);
    setPasswords(prev => ({ ...prev, [email]: password }));
    setUser(newUser);
    return { ok: true };
  };

  const logout = () => setUser(null);

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    if (user?.id === id) setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const enrollInCourse = (courseId: string) => {
    if (!user) return;
    const updated = { ...user, enrolledCourses: [...new Set([...user.enrolledCourses, courseId])] };
    setUser(updated);
    setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
  };

  const isEnrolled = (courseId: string) => !!user?.enrolledCourses.includes(courseId);

  const addPurchase = (purchase: Omit<Purchase, 'id'>) => {
    setPurchases(prev => [{ ...purchase, id: Date.now().toString() }, ...prev]);
  };

  const cancelPurchase = (purchaseId: string) => {
    setPurchases(prev => prev.map(p =>
      p.id === purchaseId && p.status === 'preparing' ? { ...p, status: 'cancelled' } : p
    ));
  };

  const addReview = (review: Omit<Review, 'id'>) => {
    setReviews(prev => {
      const exists = prev.find(r => r.userId === review.userId && r.productId === review.productId);
      if (exists) return prev.map(r => r.id === exists.id ? { ...r, ...review } : r);
      return [{ ...review, id: Date.now().toString() }, ...prev];
    });
  };

  const getUserPurchases = (userId: string) => purchases.filter(p => p.userId === userId);
  const getUserReviews = (userId: string) => reviews.filter(r => r.userId === userId);
  const getProductReviews = (productId: string) => reviews.filter(r => r.productId === productId);

  const markVideoComplete = (courseId: string, videoId: string) => {
    setCourseProgress(prev => {
      const existing = prev[courseId] ?? [];
      if (existing.includes(videoId)) return prev;
      return { ...prev, [courseId]: [...existing, videoId] };
    });
  };
  const getCompletedVideos = (courseId: string) => courseProgress[courseId] ?? [];

  return (
    <AuthContext.Provider value={{
      user, users, purchases, reviews,
      adminProducts, setAdminProducts, adminCourses, setAdminCourses, discountRules, setDiscountRules,
      courseProgress, markVideoComplete, getCompletedVideos,
      login, register, logout, enrollInCourse, isEnrolled, updateUser,
      addPurchase, cancelPurchase, addReview, getUserPurchases, getUserReviews, getProductReviews,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
