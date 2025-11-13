import { useState, useCallback } from 'react';
import { Resource } from '@/lib/api/resources';
import { ResourcesApi } from '@/lib/api/resources';

interface UseResourceViewerReturn {
  // State
  selectedResource: Resource | null;
  viewingArticle: Resource | null;
  isViewerOpen: boolean;
  isArticleViewerOpen: boolean;
  
  // Actions
  handleViewResource: (resource: Resource) => Promise<void>;
  handleCloseViewer: () => void;
  handleCloseArticleViewer: () => void;
  
  // Setters (for preview functionality)
  setViewingArticle: (article: Resource | null) => void;
  setIsArticleViewerOpen: (open: boolean) => void;
  setSelectedResource: (resource: Resource | null) => void;
  setIsViewerOpen: (open: boolean) => void;
}

/**
 * Shared hook for handling resource viewing across all dashboard pages.
 * Ensures consistent behavior: articles use ArticleViewerV2, other resources use ResourceViewerModalV2.
 * 
 * @param trackViews - Whether to track views in analytics (default: true)
 * @returns Resource viewer state and handlers
 */
export function useResourceViewer(trackViews: boolean = true): UseResourceViewerReturn {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [viewingArticle, setViewingArticle] = useState<Resource | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isArticleViewerOpen, setIsArticleViewerOpen] = useState(false);

  const handleViewResource = useCallback(async (resource: Resource) => {
    // Track view if enabled
    if (trackViews) {
      try {
        await ResourcesApi.trackView(resource.id);
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    }

    // Route to appropriate viewer based on resource type
    if (resource.type === 'article') {
      setViewingArticle(resource);
      setIsArticleViewerOpen(true);
    } else {
      setSelectedResource(resource);
      setIsViewerOpen(true);
    }
  }, [trackViews]);

  const handleCloseViewer = useCallback(() => {
    setIsViewerOpen(false);
    setSelectedResource(null);
  }, []);

  const handleCloseArticleViewer = useCallback(() => {
    setIsArticleViewerOpen(false);
    setViewingArticle(null);
  }, []);

  return {
    // State
    selectedResource,
    viewingArticle,
    isViewerOpen,
    isArticleViewerOpen,
    
    // Actions
    handleViewResource,
    handleCloseViewer,
    handleCloseArticleViewer,
    
    // Setters (for preview and other use cases)
    setViewingArticle,
    setIsArticleViewerOpen,
    setSelectedResource,
    setIsViewerOpen,
  };
}

