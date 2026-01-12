"use client"

import { useLayoutContext } from "@/contexts/LayoutContext"
import Header from "@/components/Header/Header"
import Footer from "@/components/Footer/Footer"
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop"
import Cart from "@/components/Cart/Cart"
import Auth from "@/components/Auth/Auth"
import UserProfile from "@/components/UserProfile/UserProfile"
import OrderHistory from "@/components/OrderHistory/OrderHistory"
import OrderForm from "@/components/OrderForm/OrderForm"
import Toast from "@/components/Toast/Toast"
import { usePathname } from "next/navigation"

export default function ClientLayout({ children }) {
    const {
        isCartOpen,
        closeCart,
        openCart,
        isAuthOpen,
        authTab,
        closeAuth,
        openAuth,
        isOrderHistoryOpen,
        closeOrderHistory,
        openOrderHistory,
        isUserProfileOpen,
        closeUserProfile,
        openUserProfile,
        isOrderFormOpen,
        closeOrderForm,
        orderFormItems,
        openOrderForm,
        toast,
        showToast,
        hideToast
    } = useLayoutContext()

    const pathname = usePathname()
    // Check if current page is admin or other pages that don't need header/footer
    const isAdminRequest = pathname?.startsWith('/admin')

    // Handler wrappers for Header
    const handleCartClick = () => openCart()
    const handleLoginClick = () => openAuth('login')
    const handleProfileClick = () => openUserProfile()
    const handleOrderHistoryClick = () => openOrderHistory()

    if (isAdminRequest) {
        return <>{children}</>
    }

    return (
        <>
            <Header
                onCartClick={handleCartClick}
                onLoginClick={handleLoginClick}
                onProfileClick={handleProfileClick}
                onOrderHistoryClick={handleOrderHistoryClick}
            />

            <main className="min-h-screen pt-16 lg:pt-20">
                {children}
            </main>

            <Footer />
            <ScrollToTop />

            {/* Global Modals */}
            <Cart
                isOpen={isCartOpen}
                onClose={closeCart}
                onLoginClick={() => {
                    closeCart()
                    openAuth("login")
                }}
            />

            <Auth
                isOpen={isAuthOpen}
                onClose={closeAuth}
                initialTab={authTab}
            />

            <UserProfile
                isOpen={isUserProfileOpen}
                onClose={closeUserProfile}
            />

            <OrderHistory
                isOpen={isOrderHistoryOpen}
                onClose={closeOrderHistory}
            />

            <OrderForm
                isOpen={isOrderFormOpen}
                onClose={closeOrderForm}
                items={orderFormItems}
            />

            {toast.visible && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.visible}
                    onClose={hideToast}
                />
            )}
        </>
    )
}
