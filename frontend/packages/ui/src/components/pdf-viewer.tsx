'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

interface PDFViewerProps {
  url: string;
  title: string;
  thumbnail?: string;
}

export function PDFViewer({ url, title, thumbnail }: PDFViewerProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = url;
      link.download = title;
      link.target = '_blank';
      link.click();
      
      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted/30 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted/30 rounded-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Failed to load PDF</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={handleOpenInNewTab}
          >
            Open in New Tab
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* PDF Preview */}
      <div className="relative">
        <img 
          src={thumbnail || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop'} 
          alt={title}
          className="w-full h-64 object-cover rounded-xl"
        />
        <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium">PDF Document</p>
          </div>
        </div>
      </div>

      {/* PDF Controls */}
      <div className="flex items-center justify-center space-x-4 p-4 bg-muted/30 rounded-lg">
        <Button
          onClick={handleOpenInNewTab}
          className="flex items-center space-x-2"
        >
          <ExternalLink className="h-4 w-4" />
          <span>View PDF</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center space-x-2"
        >
          {isDownloading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
