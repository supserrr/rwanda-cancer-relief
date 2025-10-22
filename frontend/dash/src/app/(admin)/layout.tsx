import { Ubuntu } from "next/font/google"

const fontSans = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-sans",
})

export const metadata = {
  title: 'Rwanda Cancer Relief Admin',
  description: 'Admin dashboard for Rwanda Cancer Relief',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${fontSans.variable} font-sans antialiased`} style={{ fontFamily: 'Ubuntu, ui-sans-serif, system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
