/**
 * Entry Save Dialog
 * 
 * Privacy-first component for journals, memos, and notes.
 * Entries are TEMPORARY by default. User must explicitly save to device or discard.
 * NOTHING is stored in app/DB/localStorage unless user saves to device.
 */

import React, { useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Shield } from 'lucide-react';

interface EntrySaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  onSaveToDevice: () => void;
  onDiscard: () => void;
  entryType?: 'journal' | 'memo' | 'note' | 'list' | 'entry';
}

export function EntrySaveDialog({
  open,
  onOpenChange,
  title,
  content,
  onSaveToDevice,
  onDiscard,
  entryType = 'entry',
}: EntrySaveDialogProps) {
  const typeLabel = entryType || 'entry';
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            What would you like to do with this {typeLabel}?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Nothing you write here is stored unless you save it to your device.
              <strong className="text-foreground"> You're in control.</strong>
            </p>
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="text-muted-foreground">
                If you don't save, this {typeLabel} will disappear when you leave.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel asChild>
            <Button
              variant="destructive"
              onClick={onDiscard}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Discard (disappears)
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={onSaveToDevice}
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Save a copy to my device
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Utility: Save content to device using native share/download
export function saveToDevice(content: string, filename: string, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  
  // Try native share if available (mobile)
  if (navigator.share && navigator.canShare({ files: [new File([blob], filename, { type: mimeType })] })) {
    navigator.share({
      files: [new File([blob], filename, { type: mimeType })],
      title: filename,
    }).catch(() => {
      // Fallback to download
      downloadFile(blob, filename);
    });
  } else {
    downloadFile(blob, filename);
  }
}

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Hook for managing temporary entries
export function useTemporaryEntry() {
  const [content, setContent] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const promptSave = useCallback(() => {
    if (content.trim()) {
      setShowSaveDialog(true);
    }
  }, [content]);
  
  const handleSaveToDevice = useCallback((filename: string) => {
    saveToDevice(content, filename);
    setContent('');
    setShowSaveDialog(false);
  }, [content]);
  
  const handleDiscard = useCallback(() => {
    setContent('');
    setShowSaveDialog(false);
  }, []);
  
  const reset = useCallback(() => {
    setContent('');
    setShowSaveDialog(false);
  }, []);
  
  return {
    content,
    setContent,
    showSaveDialog,
    setShowSaveDialog,
    promptSave,
    handleSaveToDevice,
    handleDiscard,
    reset,
  };
}

export default EntrySaveDialog;
