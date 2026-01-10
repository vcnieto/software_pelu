import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { FileText, Upload, Download, Trash2, File, Loader2, Eye, X, Maximize2, Minimize2, ExternalLink } from "lucide-react";
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

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
      // Descargar el archivo como blob para evitar bloqueos del navegador
      const { data, error } = await supabase.storage
        .from("client-files")
        .download(file.file_path);

      if (error) throw error;
      
      // Crear URL local desde el blob
      const blobUrl = URL.createObjectURL(data);
      setPreviewUrl(blobUrl);
    } catch (error) {
      console.error("Error getting preview URL:", error);
      toast.error("Error al cargar la vista previa");
      setPreviewFile(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const closePreview = useCallback(() => {
    // Limpiar el blob URL para liberar memoria
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewFile(null);
    setPreviewUrl(null);
    setIsFullscreen(false);
  }, [previewUrl]);

  const openInNewTab = async (file: ClientFile) => {
    try {
      const { data, error } = await supabase.storage
        .from("client-files")
        .download(file.file_path);

      if (error) throw error;
      
      const blobUrl = URL.createObjectURL(data);
      window.open(blobUrl, '_blank');
    } catch (error) {
      console.error("Error opening file:", error);
      toast.error("Error al abrir el archivo");
    }
  };

  const toggleFullscreen = () => {
    if (!previewContainerRef.current) return;
    
    if (!isFullscreen) {
      if (previewContainerRef.current.requestFullscreen) {
        previewContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Listener para detectar cambios en pantalla completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Limpiar blob URL cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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

      {/* PDF Preview Modal */}
      {previewFile && (
        <div 
          ref={previewContainerRef}
          className="fixed inset-0 z-50 bg-black/90 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur border-b">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center flex-shrink-0">
                <File className="w-4 h-4 text-red-600" />
              </div>
              <span className="font-medium truncate">{previewFile.file_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openInNewTab(previewFile)}
                title="Abrir en nueva pestaña"
                className="h-8 w-8"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                className="h-8 w-8"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={closePreview}
                title="Cerrar"
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* PDF Content */}
          <div className="flex-1 overflow-hidden">
            {loadingPreview ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Cargando documento...</span>
              </div>
            ) : previewUrl ? (
              <iframe
                src={`${previewUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                className="w-full h-full border-0 bg-white"
                title={previewFile.file_name}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <File className="w-12 h-12 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">No se pudo cargar el documento</span>
              </div>
            )}
          </div>
        </div>
      )}

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
