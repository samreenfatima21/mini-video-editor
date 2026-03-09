import { dark } from "@clerk/themes";

export const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#7c5cfc",
    colorSuccess: "#00d4aa",
    colorBackground: "#1e1e35",
    colorInputBackground: "#252545",
    colorInputText: "#e8e8f0",
    colorText: "#e8e8f0",
    colorTextSecondary: "#8888a8",
    borderRadius: "12px",
    fontFamily:
      'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, sans-serif',
  },
  elements: {
    card: {
      backgroundColor: "#1e1e35",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "16px",
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
    },
    headerTitle: {
      color: "#e8e8f0",
    },
    headerSubtitle: {
      color: "#8888a8",
    },
    formButtonPrimary: {
      background: "linear-gradient(135deg, #7c5cfc, #6a48e8)",
      border: "none",
      borderRadius: "10px",
      fontWeight: "600",
      "&:hover": {
        background: "linear-gradient(135deg, #8d70ff, #7c5cfc)",
      },
    },
    formFieldInput: {
      backgroundColor: "#252545",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "10px",
      color: "#e8e8f0",
      "&:focus": {
        borderColor: "#7c5cfc",
        boxShadow: "0 0 0 2px rgba(124,92,252,0.2)",
      },
    },
    formFieldLabel: {
      color: "#8888a8",
    },
    socialButtonsBlockButton: {
      backgroundColor: "#252545",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "10px",
      color: "#e8e8f0",
      "&:hover": {
        backgroundColor: "#2d2d55",
        borderColor: "rgba(255,255,255,0.12)",
      },
    },
    socialButtonsBlockButtonText: {
      color: "#e8e8f0",
    },
    dividerLine: {
      backgroundColor: "rgba(255,255,255,0.06)",
    },
    dividerText: {
      color: "#555570",
    },
    footerActionLink: {
      color: "#7c5cfc",
      "&:hover": {
        color: "#8d70ff",
      },
    },
    footerActionText: {
      color: "#555570",
    },
    identityPreviewEditButton: {
      color: "#7c5cfc",
    },
    formFieldInputShowPasswordButton: {
      color: "#8888a8",
    },
    otpCodeFieldInput: {
      backgroundColor: "#252545",
      border: "1px solid rgba(255,255,255,0.06)",
      color: "#e8e8f0",
    },
    userButtonAvatarBox: {
      width: "28px",
      height: "28px",
    },
  },
};
