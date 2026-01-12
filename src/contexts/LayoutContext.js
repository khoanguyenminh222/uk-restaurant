"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

const LayoutContext = createContext()

export function LayoutProvider({ children }) {
    // Modal states
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isAuthOpen, setIsAuthOpen] = useState(false)
    const [authTab, setAuthTab] = useState("login") // "login" | "register"
    const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false)
    const [isUserProfileOpen, setIsUserProfileOpen] = useState(false)
    const [isOrderFormOpen, setIsOrderFormOpen] = useState(false)
    const [orderFormItems, setOrderFormItems] = useState(null)

    // Toast state
    const [toast, setToast] = useState({ message: '', type: 'info', visible: false })

    // Shared handlers
    const openCart = () => setIsCartOpen(true)
    const closeCart = () => setIsCartOpen(false)

    const openAuth = (tab = "login") => {
        setAuthTab(tab)
        setIsAuthOpen(true)
    }
    const closeAuth = () => setIsAuthOpen(false)

    const openOrderHistory = () => setIsOrderHistoryOpen(true)
    const closeOrderHistory = () => setIsOrderHistoryOpen(false)

    const openUserProfile = () => setIsUserProfileOpen(true)
    const closeUserProfile = () => setIsUserProfileOpen(false)

    const openOrderForm = (items) => {
        setOrderFormItems(items)
        setIsOrderFormOpen(true)
    }
    const closeOrderForm = () => {
        setIsOrderFormOpen(false)
        setOrderFormItems(null)
    }

    const showToast = (message, type = 'info') => {
        setToast({ message, type, visible: true })
        setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }))
        }, 3000)
    }

    const hideToast = () => {
        setToast(prev => ({ ...prev, visible: false }))
    }

    return (
        <LayoutContext.Provider value={{
            isCartOpen,
            openCart,
            closeCart,
            isAuthOpen,
            authTab,
            openAuth,
            closeAuth,
            isOrderHistoryOpen,
            openOrderHistory,
            closeOrderHistory,
            isUserProfileOpen,
            openUserProfile,
            closeUserProfile,
            isOrderFormOpen,
            orderFormItems,
            openOrderForm,
            closeOrderForm,
            toast,
            showToast,
            hideToast
        }}>
            {children}
        </LayoutContext.Provider>
    )
}

export const useLayoutContext = () => useContext(LayoutContext)
