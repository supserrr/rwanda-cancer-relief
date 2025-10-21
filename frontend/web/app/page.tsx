import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Navbar } from "@workspace/ui/components/ui/mini-navbar"
import { SvgFollowScroll } from "@workspace/ui/components/ui/svg-follow-scroll"
import { ThemeToggle } from "@/components/theme-toggle"

/**
 * Rwanda Cancer Relief - Landing Page
 * 
 * Main homepage - Building together!
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Navigation */}
      <Navbar />
      
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      {/* Hero Section with SVG Scroll Animation + Feature Spotlight */}
      <SvgFollowScroll />

      {/* Quick Access to Demos (Dev Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4">
          <a href="http://localhost:4000" target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline">
              📦 Component Demos (Port 4000)
            </Button>
          </a>
        </div>
      )}
    </div>
  )
}
