"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#16161e",
          color: "#f0f0f0",
          border: "1px solid #2a2a3a",
          borderRadius: "12px",
          fontSize: "14px",
          padding: "12px 16px",
        },
        success: {
          iconTheme: {
            primary: "#4ade80",
            secondary: "#16161e",
          },
        },
        error: {
          iconTheme: {
            primary: "#f87171",
            secondary: "#16161e",
          },
        },
      }}
    />
  );
}
