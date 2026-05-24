export const metadata = {
  title: "Courses Familiales",
  description: "Menus & courses adaptés",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Courses",
    statusBarStyle: "black-translucent"
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png"
  }
};

export const viewport = {
  themeColor: "#0f0f1a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0, background: "#0f0f1a" }}>{children}</body>
    </html>
  );
}
