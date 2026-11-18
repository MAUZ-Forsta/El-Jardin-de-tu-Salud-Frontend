import { RouterProvider } from 'react-router';
import { router } from './routes';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { PromotionProvider } from './context/PromotionContext';

export default function App() {
  return (
    <AuthProvider>
      <PromotionProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </PromotionProvider>
    </AuthProvider>
  );
}
