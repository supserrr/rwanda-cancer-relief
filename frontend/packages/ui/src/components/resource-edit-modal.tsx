'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Badge } from './badge';
import { 
  X, 
  Upload, 
  FileText, 
  Video, 
  BookOpen,
  Play,
  Save,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Resource } from '@workspace/ui/lib/types';

interface ResourceEditModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedResource: Resource) => void;
  onDelete: (resourceId: string) => void;
}

export function ResourceEditModal({ 
  resource, 
  isOpen, 
  onClose, 
  onSave,
  onDelete
}: ResourceEditModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'article' as 'audio' | 'pdf' | 'video' | 'article',
    url: '',
    thumbnail: '',
    duration: '',
    tags: '',
    publisher: '',
    isPublic: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title,
        description: resource.description,
        type: resource.type,
        url: resource.url,
        thumbnail: resource.thumbnail || '',
        duration: resource.duration?.toString() || '',
        tags: resource.tags.join(', '),
        publisher: resource.publisher,
        isPublic: resource.isPublic
      });
    }
  }, [resource]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <Play className="h-5 w-5" />;
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'article':
        return <BookOpen className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const handleSave = async () => {
    if (!resource) return;
    
    setIsLoading(true);
    try {
      const updatedResource: Resource = {
        ...resource,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        url: formData.url,
        thumbnail: formData.thumbnail,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        publisher: formData.publisher,
        isPublic: formData.isPublic
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSave(updatedResource);
      onClose();
    } catch (error) {
      console.error('Error saving resource:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!resource) return;
    
    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onDelete(resource.id);
      onClose();
    } catch (error) {
      console.error('Error deleting resource:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file upload
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, url: url }));
    }
  };

  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate thumbnail upload
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, thumbnail: url }));
    }
  };

  if (!resource) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(formData.type)}
            Edit Resource
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resource Type and Status */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="type">Resource Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="publisher">Publisher</Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
                placeholder="Publisher name"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Resource title"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Resource description"
              rows={3}
            />
          </div>

          {/* URL and Duration */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="url">Resource URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com/resource"
              />
            </div>
            {(formData.type === 'audio' || formData.type === 'video') && (
              <div className="w-32">
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="15"
                />
              </div>
            )}
          </div>

          {/* Thumbnail */}
          <div>
            <Label htmlFor="thumbnail">Thumbnail URL</Label>
            <div className="flex items-center gap-2">
              <Input
                id="thumbnail"
                value={formData.thumbnail}
                onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                placeholder="https://example.com/thumbnail.jpg"
                className="flex-1"
              />
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {formData.thumbnail && (
              <div className="mt-2">
                <img 
                  src={formData.thumbnail} 
                  alt="Thumbnail preview" 
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="meditation, anxiety, stress-relief"
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.tags.split(',').map((tag, index) => {
                const trimmedTag = tag.trim();
                if (!trimmedTag) return null;
                return (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {trimmedTag}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <Label>Upload Resource File</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
              <input
                type="file"
                accept={formData.type === 'audio' ? 'audio/*' : formData.type === 'video' ? 'video/*' : formData.type === 'pdf' ? '.pdf' : '*'}
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload {formData.type} file
                </p>
              </label>
            </div>
          </div>

          {/* Visibility */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="isPublic">Make this resource public</Label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Delete Resource
                </>
              )}
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
