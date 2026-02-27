export const metadata = {
  title: 'PocketChange',
  description: 'Frontend for PocketChange app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}