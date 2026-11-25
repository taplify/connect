"use client";
import "@/styles/globals.css";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-[#f5f6f8] font-poppins text-primary-900 antialiased">
        <div className="flex flex-1 flex-col lg:flex-row">
          <div className="lg:hidden">
            <Header />
          </div>

          <aside className="hidden h-screen flex-none bg-[#f5f6f8] p-4 lg:sticky lg:top-0 lg:flex lg:flex-col">
            <Sidebar />
          </aside>

          <main className="flex-1 overflow-x-hidden">{children}</main>
        </div>
      </body>
    </html>
  );
}
