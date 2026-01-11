"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, X, CircleX } from "lucide-react"

export default function Toast({ message, isVisible, onClose, type = "success" }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-72 ${type === "success"
        ? "bg-green-600 text-white"
        : "bg-red-600 text-white"
        }`}>
        {type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <CircleX className="w-5 h-5 shrink-0" />}
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="shrink-0 p-1 hover:bg-white/20 rounded transition-colors cursor-pointer"
          aria-label="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

