'use client';

import React, { useState } from 'react';
import { AnimatedPageHeader } from '@workspace/ui/components/animated-page-header';
import { AnimatedCard } from '@workspace/ui/components/animated-card';
import { ResourceCard } from '../../../../components/dashboard/shared/ResourceCard';
import { ResourceViewerModal } from '@workspace/ui/components/resource-viewer-modal';
import { ResourceEditModal } from '@workspace/ui/components/resource-edit-modal';
import { ArticleEditor } from '@workspace/ui/components/article-editor';
import { ArticleViewer } from '@workspace/ui/components/article-viewer';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { 
  Search, 
  Upload, 
  Plus, 
  FileText, 
  Video, 
  BookOpen,
  Play,
  Download,
  Edit,
  Trash2,
  Eye,
  Settings,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Copy,
  Share2,
  Archive,
  BarChart3,
  Users,
  Calendar,
  Tag,
  Globe,
  Lock,
  RefreshCw,
  MoreHorizontal,
  Star,
  StarOff,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { dummyResources } from '../../../../lib/dummy-data';
import { Resource } from '../../../../lib/types';
import { useAuth } from '../../../../hooks/use-auth';

export default function CounselorResourcesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArticleEditorOpen, setIsArticleEditorOpen] = useState(false);
  const [isArticleViewerOpen, setIsArticleViewerOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingArticle, setEditingArticle] = useState<Resource | null>(null);
  const [viewingArticle, setViewingArticle] = useState<Resource | null>(null);
  const [activeTab, setActiveTab] = useState('view');
  const [savedResources, setSavedResources] = useState<string[]>([]);
  const [resources, setResources] = useState<Resource[]>(dummyResources);
  
  // Enhanced state for better management
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const resourceTypes = ['all', 'audio', 'pdf', 'video', 'article'];
  const sortOptions = [
    { value: 'date', label: 'Date Created' },
    { value: 'title', label: 'Title' },
    { value: 'type', label: 'Type' },
    { value: 'publisher', label: 'Publisher' },
    { value: 'popularity', label: 'Popularity' }
  ];
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
    { value: 'featured', label: 'Featured' }
  ];
  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  // Get all unique tags from resources
  const allTags = Array.from(new Set(resources.flatMap(r => r.tags)));

  // Enhanced filtering and sorting
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => resource.tags.includes(tag));
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'public' && resource.isPublic) ||
                         (statusFilter === 'private' && !resource.isPublic);
    
    return matchesSearch && matchesType && matchesTags && matchesStatus;
  }).sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'publisher':
        comparison = a.publisher.localeCompare(b.publisher);
        break;
      case 'popularity':
        // Mock popularity based on saved count
        comparison = (savedResources.includes(a.id) ? 1 : 0) - (savedResources.includes(b.id) ? 1 : 0);
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getSavedResources = () => {
    return resources.filter(resource => savedResources.includes(resource.id));
  };

  // Statistics
  const stats = {
    total: resources.length,
    public: resources.filter(r => r.isPublic).length,
    private: resources.filter(r => !r.isPublic).length,
    byType: {
      audio: resources.filter(r => r.type === 'audio').length,
      pdf: resources.filter(r => r.type === 'pdf').length,
      video: resources.filter(r => r.type === 'video').length,
      article: resources.filter(r => r.type === 'article').length,
    },
    recent: resources.filter(r => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return r.createdAt > weekAgo;
    }).length
  };

  // Enhanced handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} on:`, selectedResources);
    // Implement bulk actions
    setIsRefreshing(false);
  };

  const handleDuplicateResource = (resource: Resource) => {
    const duplicated = {
      ...resource,
      id: Date.now().toString(),
      title: `${resource.title} (Copy)`,
      createdAt: new Date()
    };
    setResources(prev => [...prev, duplicated]);
  };

  const handleArchiveResource = (resourceId: string) => {
    // Implement archive functionality
    console.log('Archive resource:', resourceId);
  };

  const handleFeatureResource = (resourceId: string) => {
    // Implement feature functionality
    console.log('Feature resource:', resourceId);
  };

  const handleViewResource = (resource: Resource) => {
    setSelectedResource(resource);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedResource(null);
  };

  const handleDownloadResource = (resource: Resource) => {
    console.log('Download resource:', resource.title);
    // Implement download logic
  };

  const handleShareResource = (resource: Resource) => {
    console.log('Share resource:', resource.title);
    // Implement share logic
  };

  const handleBookmarkResource = (resource: Resource) => {
    console.log('Bookmark resource:', resource.title);
    // Toggle saved state
    setSavedResources(prev => 
      prev.includes(resource.id) 
        ? prev.filter(id => id !== resource.id)
        : [...prev, resource.id]
    );
  };

  const handleUnsaveResource = (resourceId: string) => {
    setSavedResources(prev => prev.filter(id => id !== resourceId));
  };

  const handleEditResource = (resource: Resource) => {
    if (resource.type === 'article') {
      setEditingArticle(resource);
      setIsArticleEditorOpen(true);
    } else {
      setEditingResource(resource);
      setIsEditOpen(true);
    }
  };

  const handleCreateArticle = () => {
    setEditingArticle(null);
    setIsArticleEditorOpen(true);
  };

  const handleViewArticle = (resource: Resource) => {
    setViewingArticle(resource);
    setIsArticleViewerOpen(true);
  };

  const handleSaveArticle = (article: Resource) => {
    setResources(prev => {
      const existingIndex = prev.findIndex(r => r.id === article.id);
      if (existingIndex >= 0) {
        // Update existing article
        const updated = [...prev];
        updated[existingIndex] = article;
        return updated;
      } else {
        // Add new article
        return [...prev, article];
      }
    });
    console.log('Article saved:', article.title);
  };

  const handleSaveResource = (updatedResource: Resource) => {
    setResources(prev => prev.map(r => r.id === updatedResource.id ? updatedResource : r));
    console.log('Resource updated:', updatedResource.title);
  };

  const handleDeleteResource = (resourceId: string) => {
    setResources(prev => prev.filter(r => r.id !== resourceId));
    console.log('Resource deleted:', resourceId);
  };

  const handleCloseEditModal = () => {
    setIsEditOpen(false);
    setEditingResource(null);
  };

  const handleCloseArticleEditor = () => {
    setIsArticleEditorOpen(false);
    setEditingArticle(null);
  };

  const handleCloseArticleViewer = () => {
    setIsArticleViewerOpen(false);
    setViewingArticle(null);
  };

  const handleUploadResource = () => {
    console.log('Upload new resource');
  };

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        title="Resource Management"
        description="View, upload, and manage educational resources for your patients"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View Resources
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Saved Resources
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Add Resources
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="mt-6">
          {/* Enhanced Search and Filters */}
          <div className="space-y-4">
            {/* Main Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search resources by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Quick Filters */}
              <div className="flex gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Tag Filters */}
            {allTags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filter by tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedTags(prev => 
                          prev.includes(tag) 
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found</span>
              </div>
            </div>
          </div>

          {/* Resources Display */}
          {filteredResources.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
                {filteredResources.map((resource, index) => (
                  <div key={resource.id} className="relative">
                    <ResourceCard
                      resource={resource}
                      onView={handleViewResource}
                      onDownload={handleDownloadResource}
                      onEdit={handleEditResource}
                      onDelete={(resource) => handleDeleteResource(resource.id)}
                      showEditActions={true}
                      delay={index * 0.1}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 mt-8">
                {filteredResources.map((resource, index) => (
                  <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 relative">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        {resource.type === 'audio' && <Play className="h-6 w-6" />}
                        {resource.type === 'pdf' && <FileText className="h-6 w-6" />}
                        {resource.type === 'video' && <Video className="h-6 w-6" />}
                        {resource.type === 'article' && <BookOpen className="h-6 w-6" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{resource.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {resource.type.toUpperCase()}
                          </Badge>
                          <Badge variant={resource.isPublic ? "default" : "secondary"} className="text-xs">
                            {resource.isPublic ? "Public" : "Private"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {resource.createdAt.toLocaleDateString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            by {resource.publisher}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewResource(resource)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditResource(resource)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDuplicateResource(resource)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadResource(resource)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleArchiveResource(resource.id)}>
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteResource(resource.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12 mt-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No resources found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <div className="space-y-4">
            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {getSavedResources().length} saved resource{getSavedResources().length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Your saved resources</span>
              </div>
            </div>

            {/* Saved Resources Grid */}
            {getSavedResources().length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
                {getSavedResources().map((resource, index) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onView={handleViewResource}
                    onDownload={handleDownloadResource}
                    onEdit={handleEditResource}
                    onDelete={(resource) => handleDeleteResource(resource.id)}
                    onUnsave={handleUnsaveResource}
                    showEditActions={true}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 mt-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No saved resources</h3>
                <p className="text-muted-foreground mb-4">
                  Save resources by clicking the bookmark icon when viewing them
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('view')}
                >
                  Browse All Resources
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <div className="space-y-6">
            {/* Resource Type Selection */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <AnimatedCard delay={0.1} className="p-6 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setActiveTab('upload-audio')}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Play className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium">Audio File</h4>
                  <p className="text-sm text-muted-foreground">Upload MP3, WAV, or M4A</p>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={0.2} className="p-6 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setActiveTab('upload-video')}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Video className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium">Video File</h4>
                  <p className="text-sm text-muted-foreground">Upload MP4, MOV, or AVI</p>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={0.3} className="p-6 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setActiveTab('upload-pdf')}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-red-600" />
                  </div>
                  <h4 className="font-medium">PDF Document</h4>
                  <p className="text-sm text-muted-foreground">Upload PDF files</p>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={0.4} className="p-6 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setActiveTab('create-article')}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium">Create Article</h4>
                  <p className="text-sm text-muted-foreground">Write new content</p>
                </div>
              </AnimatedCard>
            </div>

            {/* Additional Options */}
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatedCard delay={0.5} className="p-6 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setActiveTab('add-link')}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <ExternalLink className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Add External Link</h4>
                    <p className="text-sm text-muted-foreground">Link to YouTube, websites, or other resources</p>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={0.6} className="p-6 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setActiveTab('bulk-upload')}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Upload className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Bulk Upload</h4>
                    <p className="text-sm text-muted-foreground">Upload multiple files at once</p>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upload-audio" className="mt-6">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Upload Audio File</h3>
            <AnimatedCard className="p-8">
              <div className="border-2 border-dashed border-purple-200 rounded-lg p-8 text-center">
                <Play className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Drop your audio file here</h4>
                <p className="text-muted-foreground mb-4">
                  Supported formats: MP3, WAV, M4A, AAC (Max 100MB)
                </p>
                <Button onClick={handleUploadResource} className="bg-purple-600 hover:bg-purple-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Audio File
                </Button>
              </div>
            </AnimatedCard>
          </div>
        </TabsContent>

        <TabsContent value="upload-video" className="mt-6">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Upload Video File</h3>
            <AnimatedCard className="p-8">
              <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center">
                <Video className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Drop your video file here</h4>
                <p className="text-muted-foreground mb-4">
                  Supported formats: MP4, MOV, AVI, MKV (Max 500MB)
                </p>
                <Button onClick={handleUploadResource} className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Video File
                </Button>
              </div>
            </AnimatedCard>
          </div>
        </TabsContent>

        <TabsContent value="upload-pdf" className="mt-6">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Upload PDF Document</h3>
            <AnimatedCard className="p-8">
              <div className="border-2 border-dashed border-red-200 rounded-lg p-8 text-center">
                <FileText className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Drop your PDF file here</h4>
                <p className="text-muted-foreground mb-4">
                  Supported formats: PDF (Max 50MB)
                </p>
                <Button onClick={handleUploadResource} className="bg-red-600 hover:bg-red-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose PDF File
                </Button>
              </div>
            </AnimatedCard>
          </div>
        </TabsContent>

        <TabsContent value="add-link" className="mt-6">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Add External Link</h3>
            <AnimatedCard className="p-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Resource Title</label>
                  <Input placeholder="Enter resource title" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">URL</label>
                  <Input placeholder="https://example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea 
                    className="w-full" 
                    rows={3} 
                    placeholder="Describe this resource..."
                  />
                </div>
                <div className="flex gap-4">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('manage')}>
                    Cancel
                  </Button>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </TabsContent>

        <TabsContent value="bulk-upload" className="mt-6">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Bulk Upload</h3>
            <AnimatedCard className="p-8">
              <div className="border-2 border-dashed border-indigo-200 rounded-lg p-8 text-center">
                <Upload className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Upload multiple files at once</h4>
                <p className="text-muted-foreground mb-4">
                  Select multiple files to upload them all at once
                </p>
                <Button onClick={handleUploadResource} className="bg-indigo-600 hover:bg-indigo-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Multiple Files
                </Button>
              </div>
            </AnimatedCard>
          </div>
        </TabsContent>

        <TabsContent value="create-article" className="mt-6">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Create New Article</h3>
            <AnimatedCard className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Article Title</label>
                  <Input placeholder="Enter article title..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Description</label>
                  <Textarea placeholder="Brief description of the article..." rows={3} />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Tags</label>
                  <Input placeholder="Enter tags separated by commas..." />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-muted-foreground">Create rich content with our editor</span>
                  </div>
                  <Button onClick={() => setActiveTab('view')} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Article
                  </Button>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="space-y-6">
            {/* Statistics Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <AnimatedCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Resources</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </AnimatedCard>

              <AnimatedCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Public Resources</p>
                    <p className="text-2xl font-bold">{stats.public}</p>
                  </div>
                  <Globe className="h-8 w-8 text-muted-foreground" />
                </div>
              </AnimatedCard>

              <AnimatedCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Private Resources</p>
                    <p className="text-2xl font-bold">{stats.private}</p>
                  </div>
                  <Lock className="h-8 w-8 text-muted-foreground" />
                </div>
              </AnimatedCard>

              <AnimatedCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recent Uploads</p>
                    <p className="text-2xl font-bold">{stats.recent}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </AnimatedCard>
            </div>

            {/* Resource Type Breakdown */}
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Resource Types</h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Play className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold">{stats.byType.audio}</p>
                  <p className="text-sm text-muted-foreground">Audio Files</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <p className="text-2xl font-bold">{stats.byType.pdf}</p>
                  <p className="text-sm text-muted-foreground">PDF Documents</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Video className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">{stats.byType.video}</p>
                  <p className="text-sm text-muted-foreground">Videos</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">{stats.byType.article}</p>
                  <p className="text-sm text-muted-foreground">Articles</p>
                </div>
              </div>
            </AnimatedCard>

            {/* Recent Activity */}
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {resources.slice(0, 5).map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                        {resource.type === 'audio' && <Play className="h-4 w-4" />}
                        {resource.type === 'pdf' && <FileText className="h-4 w-4" />}
                        {resource.type === 'video' && <Video className="h-4 w-4" />}
                        {resource.type === 'article' && <BookOpen className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{resource.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Created {resource.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={resource.isPublic ? "default" : "secondary"} className="text-xs">
                      {resource.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>
                ))}
              </div>
            </AnimatedCard>

            {/* Popular Tags */}
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const count = resources.filter(r => r.tags.includes(tag)).length;
                  return (
                    <Badge key={tag} variant="outline" className="text-sm">
                      {tag} ({count})
                    </Badge>
                  );
                })}
              </div>
            </AnimatedCard>
          </div>
        </TabsContent>
      </Tabs>

      {/* Resource Viewer Modal */}
      {selectedResource && (
        <ResourceViewerModal
          resource={selectedResource}
          isOpen={isViewerOpen}
          onClose={handleCloseViewer}
          onDownload={handleDownloadResource}
          onShare={handleShareResource}
          onBookmark={handleBookmarkResource}
          onViewArticle={handleViewArticle}
        />
      )}

      {/* Resource Edit Modal */}
      {editingResource && (
        <ResourceEditModal
          resource={editingResource}
          isOpen={isEditOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveResource}
          onDelete={handleDeleteResource}
          onCreateArticle={handleCreateArticle}
        />
      )}

      {/* Article Editor */}
      {editingArticle && (
        <ArticleEditor
          article={editingArticle}
          isOpen={isArticleEditorOpen}
          onClose={handleCloseArticleEditor}
          onSave={handleSaveArticle}
        />
      )}

      {/* Article Viewer */}
      {viewingArticle && (
        <ArticleViewer
          article={viewingArticle}
          isOpen={isArticleViewerOpen}
          onClose={handleCloseArticleViewer}
          onShare={handleShareResource}
          onBookmark={handleBookmarkResource}
          onDownload={handleDownloadResource}
        />
      )}
    </div>
  );
}