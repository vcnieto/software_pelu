import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Pencil, Trash2, Phone, Mail, Search, User, FileText, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import BodyTreatmentCards from "@/components/clients/BodyTreatmentCards";
import FacialSkinCards from "@/components/clients/FacialSkinCards";
import AestheticHistoryCards from "@/components/clients/AestheticHistoryCards";
import { MassageDlmCards } from "@/components/clients/MassageDlmCards";
import { EyelashEyebrowCards } from "@/components/clients/EyelashEyebrowCards";
import { WaxingTreatmentCards } from "@/components/clients/WaxingTreatmentCards";
import { HairScalpCards } from "@/components/clients/HairScalpCards";
import VisagismCards from "@/components/clients/VisagismCards";
import MakeupProfessionalCards from "@/components/clients/MakeupProfessionalCards";

interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  birth_date?: string | null;
}

const Clients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "", birthDate: null as Date | null });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [birthDateOpen, setBirthDateOpen] = useState(false);

  useEffect(() => {
    if (user) fetchClients();
  }, [user]);

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("*").order("name");
    setClients(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const birthDateString = form.birthDate
      ? form.birthDate.toISOString().split("T")[0]
      : null;
    if (editing) {
      await supabase
        .from("clients")
        .update({
          name: form.name,
          phone: form.phone || null,
          email: form.email || null,
          notes: form.notes || null,
          birth_date: birthDateString,
        })
        .eq("id", editing.id);
      toast.success("Cliente actualizado");
    } else {
      await supabase.from("clients").insert({
        user_id: user!.id,
        name: form.name,
        phone: form.phone || null,
        email: form.email || null,
        notes: form.notes || null,
        birth_date: birthDateString,
      });
      toast.success("Cliente añadido");
    }
    setOpen(false);
    setEditing(null);
    setForm({ name: "", phone: "", email: "", notes: "", birthDate: null });
    fetchClients();
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este cliente? Se eliminarán también todas sus fichas.")) {
      await supabase.from("clients").delete().eq("id", id);
      toast.success("Cliente eliminado");
      fetchClients();
      if (selectedClient?.id === id) {
        setProfileOpen(false);
        setSelectedClient(null);
      }
    }
  };

  const openClientProfile = (client: Client) => {
    setSelectedClient(client);
    setProfileOpen(true);
  };

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Sidebar>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-display font-semibold">Clientes</h1>
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) {
                setEditing(null);
                setForm({ name: "", phone: "", email: "", notes: "", birthDate: null });
                setBirthDateOpen(false);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="btn-primary-gradient gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Editar" : "Nuevo"} Cliente</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nombre *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Fecha de nacimiento</Label>
                  <Popover open={birthDateOpen} onOpenChange={setBirthDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.birthDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.birthDate
                          ? format(form.birthDate, "PPP", { locale: es })
                          : "Seleccionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.birthDate || undefined}
                        onSelect={(d) => {
                          setForm({ ...form, birthDate: d || null });
                          setBirthDateOpen(false);
                        }}
                        captionLayout="dropdown"
                        fromYear={1940}
                        toYear={new Date().getFullYear()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Notas</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full btn-primary-gradient">
                  {editing ? "Guardar" : "Añadir"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid gap-4">
          {filtered.map((client) => (
            <Card key={client.id} className="card-hover">
              <CardContent className="p-4 flex items-center justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => openClientProfile(client)}
                >
                  <p className="font-display font-semibold text-lg">{client.name}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    {client.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {client.phone}
                      </span>
                    )}
                    {client.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {client.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openClientProfile(client)}
                    title="Ver fichas"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(client);
                      setForm({
                        name: client.name,
                        phone: client.phone || "",
                        email: client.email || "",
                        notes: client.notes || "",
                        birthDate: client.birth_date ? new Date(client.birth_date) : null,
                      });
                      setBirthDateOpen(false);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(client.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No hay clientes</p>
          )}
        </div>
      </div>

      {/* Client Profile Sheet */}
      <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedClient && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold">{selectedClient.name}</p>
                    <p className="text-sm text-muted-foreground font-normal">
                      Perfil del cliente
                    </p>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-6">
                {/* Contact Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Información de contacto
                  </h3>
                  <div className="space-y-2">
                    {selectedClient.birth_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {format(new Date(selectedClient.birth_date), "d 'de' MMMM, yyyy", {
                            locale: es,
                          })}
                        </span>
                      </div>
                    )}
                    {selectedClient.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedClient.phone}</span>
                      </div>
                    )}
                    {selectedClient.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedClient.email}</span>
                      </div>
                    )}
                    {!selectedClient.phone && !selectedClient.email && (
                      <p className="text-sm text-muted-foreground italic">
                        Sin información de contacto
                      </p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedClient.notes && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Notas
                    </h3>
                    <p className="text-sm">{selectedClient.notes}</p>
                  </div>
                )}

                {/* Cards Section */}
                <div className="pt-4 border-t space-y-6">
                  <AestheticHistoryCards
                    clientId={selectedClient.id}
                    clientName={selectedClient.name}
                    clientPhone={selectedClient.phone}
                    clientEmail={selectedClient.email}
                    clientBirthDate={selectedClient.birth_date}
                  />

                  <div className="pt-4 border-t">
                    <VisagismCards
                      clientId={selectedClient.id}
                      clientName={selectedClient.name}
                      clientPhone={selectedClient.phone}
                      clientEmail={selectedClient.email}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <MakeupProfessionalCards
                      clientId={selectedClient.id}
                      clientName={selectedClient.name}
                      clientPhone={selectedClient.phone}
                      clientEmail={selectedClient.email}
                    />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <BodyTreatmentCards
                      clientId={selectedClient.id}
                      clientName={selectedClient.name}
                    />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <FacialSkinCards
                      clientId={selectedClient.id}
                      clientName={selectedClient.name}
                    />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <MassageDlmCards clientId={selectedClient.id} />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <EyelashEyebrowCards clientId={selectedClient.id} />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <WaxingTreatmentCards clientId={selectedClient.id} />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <HairScalpCards
                      clientId={selectedClient.id}
                      clientPhone={selectedClient.phone}
                      clientEmail={selectedClient.email}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Sidebar>
  );
};

export default Clients;
