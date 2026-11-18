import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import Home from './components/Home';
import Shop from './components/Shop';
import ProductDetail from './components/ProductDetail';
import Courses from './components/Courses';
import CoursePlayer from './components/CoursePlayer';
import CourseCheckout from './components/CourseCheckout';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import UserProfile from './components/UserProfile';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'tienda', Component: Shop },
      { path: 'tienda/:id', Component: ProductDetail },
      { path: 'cursos', Component: Courses },
      { path: 'cursos/:id/ver', Component: CoursePlayer },
      { path: 'carrito', Component: Cart },
      { path: 'pago', Component: Checkout },
      { path: 'pago/curso/:id', Component: CourseCheckout },
      { path: 'perfil', Component: UserProfile },
    ],
  },
]);
