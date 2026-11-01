/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RouterProvider, useRouter } from './router/Router';
import { GraphQLProvider } from './graphql/client';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

function AppContent() {
  const { route } = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-stone-200">
      <Header />

      <main className="flex-1">
        {route === '/home' && <HomePage />}
        {route === '/products' && <ProductsPage />}
        {route === '/contact' && <ContactPage />}
        {route === '/admin' && <AdminDashboardPage />}
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <GraphQLProvider>
        <AppContent />
      </GraphQLProvider>
    </RouterProvider>
  );
}
