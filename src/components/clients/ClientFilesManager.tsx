import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Upload, Download, Trash2, File, Loader2, Eye } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface ClientFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  created_at: string;
}

interface ClientFilesManagerProps {
  clientId: string;
  clientName: string;
}

export const ClientFilesManager = ({ clientId, clientName }: ClientFilesManagerProps) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<ClientFile | null>(null);
  const [previewFile, setPreviewFile] = useState<ClientFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, [clientId]);

  const fetchFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("client_files")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setFiles(data);
    }
    setLoading(false);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate PDF
    if (file.type !== "application/pdf") {
      toast.error("Solo se permiten archivos PDF");
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo no puede superar los 10MB");
      return;
    }

    setUploading(true);

    try {
      // Create unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${user.id}/${clientId}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("client-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase.from("client_files").insert({
        user_id: user.id,
        client_id: clientId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
      });

      if (dbError) throw dbError;

      toast.success("Archivo subido correctamente");
      fetchFiles();
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error("Error al subir el archivo");
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handlePreview = async (file: ClientFile) => {
    setPreviewFile(file);
    setLoadingPreview(true);
    
    try {
      const { data, error } = await supabase.storage
        .from("client-files")
        .createSignedUrl(file.file_path, 3600); // URL válida por 1 hora

      if (error) throw error;
      
      setPreviewUrl(data.signedUrl);
    } catch (error) {
      console.error("Error getting preview URL:", error);
      toast.error("Error al cargar la vista previa");
      setPreviewFile(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const closePreview = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  const handleDownload = async (file: ClientFile) => {
    try {
      const { data, error } = await supabase.storage
        .from("client-files")
        .download(file.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Error al descargar el archivo");
    }
  };

  const confirmDelete = (file: ClientFile) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("client-files")
        .remove([fileToDelete.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("client_files")
        .delete()
        .eq("id", fileToDelete.id);

      if (dbError) throw dbError;

      toast.success("Archivo eliminado");
      fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Error al eliminar el archivo");
    } finally {
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Archivos
        </h3>
        <Button
          size="sm"
          onClick={handleFileSelect}
          disabled={uploading}
          className="gap-2"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Subir PDF
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {files.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-4 text-center">
          No hay archivos subidos
        </p>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <Card key={file.id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <File className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{file.file_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{format(new Date(file.created_at), "d MMM yyyy", { locale: es })}</span>
                        <span>•</span>
                        <span>{formatFileSize(file.file_size)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePreview(file)}
                      title="Ver"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(file)}
                      title="Descargar"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(file)}
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* PDF Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={closePreview}>
        <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-2 pr-8">
              <File className="w-5 h-5 text-red-600" />
              <span className="truncate">{previewFile?.file_name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-full min-h-0">
            {loadingPreview ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : previewUrl ? (
              <iframe
                src={previewUrl}
                className="w-full h-[calc(85vh-80px)] border-0"
                title={previewFile?.file_name}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El archivo "{fileToDelete?.file_name}" será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientFilesManager;
