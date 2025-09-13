// Import global styles and fonts
import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { ThemeProvider } from '@/components/theme-provider'
 
const inter = Inter({ subsets: ['latin'] })
 
export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
}
 
export default function GlobalNotFound() {
  return (
      <html lang="en" className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
              <body className="flex items-center justify-center h-screen">
                  <div className="">
                      <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
                      <p className="text-lg">This page does not exist.</p>
                      <Button className="mt-4">Go back to home</Button>
                  </div>

              </body>
          </ThemeProvider>
      </html>
  )
}