import { Outlet } from 'react-router';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import CustomCursor from './CustomCursor';

export default function Layout() {
  return (
    <div className="min-h-screen overflow-x-hidden w-full">
      <CustomCursor />
      <Header />
      <main className="overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
