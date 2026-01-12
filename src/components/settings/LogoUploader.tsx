import { useState, useRef } from "react";
import { useBusinessSettings } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X, ImageIcon } from "lucide-react";

const LogoUploader = () => {
  const { settings, updateSettings, uploadLogo } = useBusinessSettings();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(settings?.logo_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecciona una imagen válida");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen no puede superar los 2MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const url = await uploadLogo(file);
      if (url) {
        await updateSettings({ logo_url: url });
        toast.success("Logo actualizado correctamente");
      } else {
        toast.error("Error al subir el logo");
        setPreview(settings?.logo_url || null);
      }
    } catch {
      toast.error("Error al subir el logo");
      setPreview(settings?.logo_url || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await updateSettings({ logo_url: null });
      setPreview(null);
      toast.success("Logo eliminado");
    } catch {
      toast.error("Error al eliminar el logo");
    }
  };

  return (
    <div className="flex items-start gap-6">
      {/* Logo Preview */}
      <div className="relative">
        <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border bg-muted/50 flex items-center justify-center overflow-hidden">
          {preview ? (
            <img
              src={preview}
              alt="Logo del negocio"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        {preview && (
          <button
            onClick={handleRemoveLogo}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Upload Button */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Subiendo..." : preview ? "Cambiar Logo" : "Subir Logo"}
        </Button>
        <p className="text-xs text-muted-foreground">
          PNG, JPG o WebP. Máximo 2MB.
        </p>
      </div>
    </div>
  );
};

export default LogoUploader;
