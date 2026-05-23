export const metadata = { title: "Courses Familiales", description: "Menus & courses adaptés" };
export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f0f1a" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#0f0f1a" }}>{children}</body>
    </html>
  );
}
