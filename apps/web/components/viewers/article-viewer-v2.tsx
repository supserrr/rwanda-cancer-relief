'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Download, Share2, Bookmark, ExternalLink } from 'lucide-react';

interface ArticleLike {
  id: string;
  title: string;
  content?: string;
  description?: string;
  publisher?: string; // UUID - not displayed
  publisherName?: string; // Display name
  createdAt?: Date;
  thumbnail?: string;
  tags?: string[];
  url?: string; // External URL for external articles
}

interface ArticleViewerV2Props {
  article: ArticleLike | null;
  isOpen: boolean;
  onClose: () => void;
  onShare?: (article: ArticleLike) => void;
  onBookmark?: (article: ArticleLike) => void;
  onDownload?: (article: ArticleLike) => void;
}

export function ArticleViewerV2({ article, isOpen, onClose, onShare, onBookmark, onDownload }: ArticleViewerV2Props) {
  if (!article) return null;

  const wordCount = (article.content || article.description || '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 225));
  const publishedAt = article.createdAt ? new Date(article.createdAt) : undefined;
  
  // Check if this is an external article
  const isExternalArticle = !!article.url;
  let externalDomain: string | null = null;
  if (isExternalArticle && article.url) {
    try {
      externalDomain = new URL(article.url).hostname.replace('www.', '');
    } catch {
      // Invalid URL, ignore
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent wide className="max-h-[92vh] overflow-y-auto font-sans" style={{ fontFamily: 'var(--font-sans), Ubuntu, ui-sans-serif, system-ui, sans-serif' }}>
        <DialogHeader>
          <DialogTitle className="sr-only">{article.title}</DialogTitle>
          <DialogDescription className="sr-only">
            {isExternalArticle ? 'External article preview' : 'Article content'}
          </DialogDescription>
        </DialogHeader>
        <div className="mx-auto w-full max-w-4xl">
          {/* Cover Image Section - matching editor */}
          {article.thumbnail && (
            <div className="relative bg-muted/30 border-b mb-0">
              <div className="aspect-[21/9] overflow-hidden rounded-lg border bg-muted/20">
                <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Article Content Container - matching editor */}
          <div className="px-8 py-6 space-y-8">
            {/* Title - matching editor */}
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-foreground dark:text-foreground" style={{
                color: 'inherit',
                fontSize: '2.25rem',
                lineHeight: '2.5rem',
              }}>
                {article.title}
              </h1>
            </div>

            {/* Metadata - matching editor */}
            <div className="flex flex-wrap gap-4 pb-6 border-b">
              {article.publisherName && (
                <div className="flex-1 min-w-[200px]">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">Author</label>
                  <div className="inline-flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-semibold text-primary">
                      {article.publisherName.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm">{article.publisherName}</span>
                  </div>
                </div>
              )}
              {publishedAt && (
                <div className="flex-1 min-w-[200px]">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">Published</label>
                  <span className="text-sm">{publishedAt.toLocaleDateString()}</span>
                </div>
              )}
              {!isExternalArticle && (
                <div className="flex-1 min-w-[200px]">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">Reading Time</label>
                  <span className="text-sm">{readingMinutes} min read</span>
                </div>
              )}
              {isExternalArticle && externalDomain && (
                <div className="flex-1 min-w-[200px]">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">Source</label>
                  <Badge variant="outline" className="text-xs">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {externalDomain}
                  </Badge>
                </div>
              )}
            </div>

            {/* Excerpt - matching editor */}
            {article.description && !isExternalArticle && (
              <div>
                <label className="text-sm font-medium mb-2 block">Article Excerpt</label>
                <p className="text-base leading-relaxed text-foreground resize-none">
                  {article.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">This will be displayed in article previews and search results</p>
              </div>
            )}

            {/* Article body - matching editor content area */}
            <article className="w-full">
              {isExternalArticle ? (
                /* External article preview card - no content stored or displayed */
                <div className="border rounded-lg p-6 bg-muted/30 border-muted">
                  {article.description && (
                    <div className="mb-4">
                      <p className="text-base leading-relaxed text-foreground font-medium">
                        {article.description}
                      </p>
                    </div>
                  )}
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-4">
                      This is a preview of an external article. Click the button above to read the full content on the original website.
                    </p>
                    {article.url && (
                      <div className="flex items-center gap-2 text-sm">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline break-all"
                        >
                          {article.url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div 
                  dangerouslySetInnerHTML={{ __html: article.content || article.description || '' }}
                  className="article-content border-0 text-base leading-relaxed bg-transparent text-foreground dark:text-foreground font-sans"
                  style={{ 
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    color: 'inherit',
                    fontFamily: 'var(--font-sans), Ubuntu, ui-sans-serif, system-ui, sans-serif'
                  }}
                />
              )}
            </article>

            {/* Tags - matching editor */}
            {article.tags && article.tags.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Help patients find relevant content with descriptive tags</p>
              </div>
            )}
          </div>

          {/* Action bar - moved outside content container */}
          <div className="px-8 pb-6 flex items-center gap-2 flex-wrap">
            {isExternalArticle && article.url && (
              <Button 
                variant="default" 
                size="lg" 
                onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
                className="bg-primary hover:bg-primary/90 font-semibold"
              >
                <ExternalLink className="h-5 w-5 mr-2" /> Read Full Article
              </Button>
            )}
            {onShare && (
              <Button variant="outline" size="sm" onClick={() => onShare(article)}>
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
            )}
            {onBookmark && (
              <Button variant="outline" size="sm" onClick={() => onBookmark(article)}>
                <Bookmark className="h-4 w-4 mr-2" /> Bookmark
              </Button>
            )}
            {onDownload && !isExternalArticle && (
              <Button variant="outline" size="sm" onClick={() => onDownload(article)}>
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            )}
          </div>
          <style jsx global>{`
            .article-content {
              font-family: var(--font-sans), Ubuntu, ui-sans-serif, system-ui, sans-serif !important;
              font-weight: 500 !important;
            }
            .article-content * {
              color: inherit !important;
              font-family: inherit;
            }
            .article-content p,
            .article-content div:not(.article-image-container):not([data-embed="true"]):not([style*="position: relative"]),
            .article-content span,
            .article-content li,
            .article-content ul,
            .article-content ol,
            .article-content em,
            .article-content i,
            .article-content u,
            .article-content s {
              color: inherit !important;
              font-family: var(--font-sans), Ubuntu, ui-sans-serif, system-ui, sans-serif !important;
              font-weight: 500 !important;
            }
            .article-content h1,
            .article-content h2,
            .article-content h3,
            .article-content h4,
            .article-content h5,
            .article-content h6,
            .article-content strong,
            .article-content b {
              color: inherit !important;
              font-family: var(--font-sans), Ubuntu, ui-sans-serif, system-ui, sans-serif !important;
              font-weight: 700 !important;
            }
            .article-content img {
              max-width: 100%;
              height: auto;
              display: block;
              margin: 1rem auto;
              border-radius: 0.5rem;
            }
            .article-content .article-image-container {
              position: relative;
              display: inline-block;
              width: 100%;
              max-width: 100%;
              margin: 1rem 0;
            }
            .article-content .article-image-container img {
              margin: 0;
              width: 100%;
            }
            .article-content iframe {
              border: none;
              display: block;
            }
            .article-content div[data-embed="true"] {
              min-height: 200px;
              border-radius: 0.5rem;
              position: relative;
              margin: 1rem 0;
            }
            .article-content div[style*="position: relative"] {
              margin: 1rem 0;
              border-radius: 0.5rem;
              overflow: hidden;
            }
            .article-content div[style*="position: relative"] iframe {
              margin: 0;
            }
            .article-content a {
              color: hsl(var(--primary));
              text-decoration: underline;
              transition: opacity 0.2s;
            }
            .article-content a:hover {
              opacity: 0.8;
            }
          `}</style>

        </div>

        <DialogFooter className="gap-2">
          {isExternalArticle && article.url && (
            <Button 
              variant="default" 
              onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
              className="bg-primary hover:bg-primary/90 font-semibold"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Read Full Article
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
          {onShare && (
            <Button variant="outline" onClick={() => onShare(article)}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
          {onBookmark && (
            <Button variant="outline" onClick={() => onBookmark(article)}>
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmark
            </Button>
          )}
          {onDownload && !isExternalArticle && (
            <Button onClick={() => onDownload(article)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


