import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Scissors, UserCircle, FileText, X } from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, isToday, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

interface Appointment {
  id: string;
  date: string;
  start_time: string;
  duration: number;
  notes: string | null;
  status: string;
  clients: { name: string } | null;
  services: { name: string; duration: number; price: number } | null;
  professionals: { name: string; specialty: string } | null;
}

// Colors for professionals - using theme-compatible colors
const PROFESSIONAL_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "Llarina": { bg: "bg-blue-500/20", border: "border-blue-500", text: "text-blue-700 dark:text-blue-300" },
  "Yarina": { bg: "bg-blue-500/20", border: "border-blue-500", text: "text-blue-700 dark:text-blue-300" },
  "Pili": { bg: "bg-red-500/20", border: "border-red-500", text: "text-red-700 dark:text-red-300" },
  "Paula": { bg: "bg-green-500/20", border: "border-green-500", text: "text-green-700 dark:text-green-300" },
};

const DEFAULT_COLOR = { bg: "bg-primary/20", border: "border-primary", text: "text-primary" };

const CalendarView = () => {
  const { user } = useAuth();
  const [view, setView] = useState<"month" | "week" | "day" | "list">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ 
    start: startOfWeek(monthStart, { weekStartsOn: 1 }), 
    end: addDays(startOfWeek(addDays(monthEnd, 6), { weekStartsOn: 1 }), 6) 
  }).slice(0, 42); // Ensure 6 weeks
  const hours = Array.from({ length: 14 }, (_, i) => i + 6); // 6:00 to 19:00

  useEffect(() => { 
    if (user) { 
      fetchAppointments(); 
    } 
  }, [user, currentDate, view]);

  const fetchAppointments = async () => {
    let start: string, end: string;
    if (view === "day") {
      start = end = format(currentDate, "yyyy-MM-dd");
    } else if (view === "week") {
      start = format(weekStart, "yyyy-MM-dd");
      end = format(addDays(weekStart, 6), "yyyy-MM-dd");
    } else {
      start = format(monthDays[0], "yyyy-MM-dd");
      end = format(monthDays[monthDays.length - 1], "yyyy-MM-dd");
    }
    const { data } = await supabase
      .from("appointments")
      .select("*, clients(name), services(name, duration, price), professionals(name, specialty)")
      .gte("date", start)
      .lte("date", end)
      .order("date")
      .order("start_time");
    setAppointments(data || []);
  };

  const getProfessionalColor = (professionalName: string | undefined) => {
    if (!professionalName) return DEFAULT_COLOR;
    return PROFESSIONAL_COLORS[professionalName] || DEFAULT_COLOR;
  };

  const getAppointmentsForDay = (date: Date) => 
    appointments.filter(a => a.date === format(date, "yyyy-MM-dd"));

  const getEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
  };

  const navigate = (direction: number) => {
    if (view === "day") setCurrentDate(addDays(currentDate, direction));
    else if (view === "week") setCurrentDate(direction > 0 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    else setCurrentDate(direction > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
  };

  const handleAppointmentClick = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setDetailOpen(true);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
    if (view === "month") {
      setView("day");
    }
  };

  // Group appointments by date for list view
  const groupedAppointments = appointments.reduce((acc, apt) => {
    const date = apt.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const getWeekdayName = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return format(date, "EEEE", { locale: es }).toUpperCase();
  };

  return (
    <Sidebar>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar - Mini Calendar */}
          <div className="lg:w-72 shrink-0">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-sm">
                  {format(currentDate, "MMMM 'de' yyyy", { locale: es })}
                </h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(day => (
                  <div key={day} className="text-[10px] font-medium text-muted-foreground py-1">{day}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {monthDays.slice(0, 42).map(day => {
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isSelected = isSameDay(day, selectedDate);
                  const hasAppointments = getAppointmentsForDay(day).length > 0;
                  
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDayClick(day)}
                      className={`
                        text-xs p-1.5 rounded-md transition-colors relative
                        ${!isCurrentMonth ? "text-muted-foreground/40" : ""}
                        ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
                        ${isToday(day) && !isSelected ? "border border-primary" : ""}
                      `}
                    >
                      {format(day, "d")}
                      {hasAppointments && !isSelected && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Main Calendar Area */}
          <div className="flex-1 min-w-0">
            {/* Header with navigation and view toggles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate(1)}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
                <h2 className="font-display text-xl font-semibold capitalize">
                  {view === "day" && format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
                  {view === "week" && `${format(weekStart, "d", { locale: es })} – ${format(addDays(weekStart, 6), "d 'de' MMM yyyy", { locale: es })}`}
                  {(view === "month" || view === "list") && format(currentDate, "MMMM 'de' yyyy", { locale: es })}
                </h2>
              </div>
              
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button 
                  variant={view === "month" ? "default" : "ghost"} 
                  size="sm" 
                  className="text-xs"
                  onClick={() => setView("month")}
                >
                  Mes
                </Button>
                <Button 
                  variant={view === "week" ? "default" : "ghost"} 
                  size="sm"
                  className="text-xs"
                  onClick={() => setView("week")}
                >
                  Semana
                </Button>
                <Button 
                  variant={view === "day" ? "default" : "ghost"} 
                  size="sm"
                  className="text-xs"
                  onClick={() => setView("day")}
                >
                  Día
                </Button>
                <Button 
                  variant={view === "list" ? "default" : "ghost"} 
                  size="sm"
                  className="text-xs"
                  onClick={() => setView("list")}
                >
                  Lista
                </Button>
              </div>
            </div>

            {/* Calendar Views */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* MONTH VIEW */}
                {view === "month" && (
                  <div>
                    <div className="grid grid-cols-7 border-b bg-muted/30">
                      {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map(day => (
                        <div key={day} className="p-3 text-center text-xs font-semibold text-muted-foreground">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7">
                      {monthDays.slice(0, 42).map((day, idx) => {
                        const dayAppts = getAppointmentsForDay(day);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isCurrentDay = isToday(day);
                        
                        return (
                          <div 
                            key={day.toISOString()} 
                            onClick={() => handleDayClick(day)}
                            className={`
                              min-h-[120px] p-2 border-b border-r cursor-pointer transition-colors hover:bg-muted/30
                              ${!isCurrentMonth ? "bg-muted/20" : ""}
                              ${idx % 7 === 0 ? "border-l-0" : ""}
                            `}
                          >
                            <p className={`
                              text-sm font-medium mb-2
                              ${!isCurrentMonth ? "text-muted-foreground/40" : ""}
                              ${isCurrentDay ? "w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center" : ""}
                            `}>
                              {format(day, "d")}
                            </p>
                            <div className="space-y-1">
                              {dayAppts.slice(0, 3).map(apt => {
                                const color = getProfessionalColor(apt.professionals?.name);
                                return (
                                  <div 
                                    key={apt.id} 
                                    onClick={(e) => { e.stopPropagation(); handleAppointmentClick(apt); }}
                                    className={`
                                      text-[10px] px-2 py-1 rounded cursor-pointer truncate
                                      ${color.bg} ${color.text} hover:opacity-80
                                    `}
                                  >
                                    {apt.services?.name || apt.clients?.name}
                                  </div>
                                );
                              })}
                              {dayAppts.length > 3 && (
                                <p className="text-[10px] text-muted-foreground px-1">+{dayAppts.length - 3} más</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* WEEK VIEW */}
                {view === "week" && (
                  <div className="overflow-auto max-h-[600px]">
                    {/* Week header */}
                    <div className="grid grid-cols-8 border-b bg-muted/30 sticky top-0 z-10">
                      <div className="p-2 text-xs font-medium text-muted-foreground border-r" />
                      {weekDays.map(day => (
                        <div key={day.toISOString()} className="p-2 text-center border-r last:border-r-0">
                          <p className="text-[10px] text-muted-foreground uppercase">
                            {format(day, "EEE", { locale: es })} {format(day, "d/MM")}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* All day row */}
                    <div className="grid grid-cols-8 border-b">
                      <div className="p-2 text-[10px] text-muted-foreground border-r">All-Day</div>
                      {weekDays.map(day => (
                        <div key={day.toISOString()} className="p-1 border-r last:border-r-0 min-h-[30px]" />
                      ))}
                    </div>
                    
                    {/* Hours grid */}
                    {hours.map(hour => (
                      <div key={hour} className="grid grid-cols-8 border-b last:border-b-0">
                        <div className="p-2 text-[10px] text-muted-foreground border-r text-right pr-3">
                          {hour}
                        </div>
                        {weekDays.map(day => {
                          const dayAppts = getAppointmentsForDay(day);
                          const hourAppts = dayAppts.filter(a => {
                            const startHour = parseInt(a.start_time.split(":")[0]);
                            return startHour === hour;
                          });
                          
                          return (
                            <div key={day.toISOString()} className="p-0.5 border-r last:border-r-0 min-h-[50px] relative">
                              {hourAppts.map(apt => {
                                const color = getProfessionalColor(apt.professionals?.name);
                                const durationRows = Math.ceil(apt.duration / 60);
                                
                                return (
                                  <div 
                                    key={apt.id}
                                    onClick={() => handleAppointmentClick(apt)}
                                    style={{ height: `${durationRows * 50 - 4}px` }}
                                    className={`
                                      absolute left-0.5 right-0.5 p-1.5 rounded cursor-pointer overflow-hidden
                                      ${color.bg} ${color.text} border-l-2 ${color.border}
                                    `}
                                  >
                                    <p className="text-[10px] font-medium">
                                      {apt.start_time.slice(0, 5)} - {getEndTime(apt.start_time, apt.duration)}
                                    </p>
                                    <p className="text-[10px] truncate">{apt.services?.name}</p>
                                    <p className="text-[9px] truncate opacity-75">{apt.clients?.name}</p>
                                    {apt.professionals && (
                                      <p className="text-[9px] truncate opacity-75">Prof: {apt.professionals.name}</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}

                {/* DAY VIEW */}
                {view === "day" && (
                  <div className="overflow-auto max-h-[600px]">
                    {/* Day header */}
                    <div className="border-b bg-muted/30 p-3 sticky top-0 z-10">
                      <p className="text-xs text-muted-foreground uppercase text-center">
                        {format(currentDate, "EEEE", { locale: es }).toUpperCase()}
                      </p>
                    </div>
                    
                    {/* All day row */}
                    <div className="grid grid-cols-[80px_1fr] border-b">
                      <div className="p-2 text-[10px] text-muted-foreground border-r">All-Day</div>
                      <div className="p-1 min-h-[30px]" />
                    </div>
                    
                    {/* Hours grid */}
                    {hours.map(hour => {
                      const dayAppts = getAppointmentsForDay(currentDate);
                      const hourAppts = dayAppts.filter(a => {
                        const startHour = parseInt(a.start_time.split(":")[0]);
                        return startHour === hour;
                      });
                      
                      return (
                        <div key={hour} className="grid grid-cols-[80px_1fr] border-b last:border-b-0">
                          <div className="p-2 text-[10px] text-muted-foreground border-r text-right pr-3">
                            {hour}
                          </div>
                          <div className="p-0.5 min-h-[50px] relative">
                            {hourAppts.map(apt => {
                              const color = getProfessionalColor(apt.professionals?.name);
                              const durationRows = Math.ceil(apt.duration / 60);
                              
                              return (
                                <div 
                                  key={apt.id}
                                  onClick={() => handleAppointmentClick(apt)}
                                  style={{ height: `${durationRows * 50 - 4}px` }}
                                  className={`
                                    absolute left-0.5 right-0.5 p-2 rounded cursor-pointer overflow-hidden
                                    ${color.bg} ${color.text} border-l-2 ${color.border}
                                  `}
                                >
                                  <p className="text-xs font-medium">
                                    {apt.start_time.slice(0, 5)} - {getEndTime(apt.start_time, apt.duration)}
                                  </p>
                                  <p className="text-xs truncate font-medium">{apt.services?.name}</p>
                                  <p className="text-xs truncate">Cliente: {apt.clients?.name}</p>
                                  {apt.professionals && (
                                    <p className="text-xs truncate">Profesional: {apt.professionals.name}</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* LIST VIEW */}
                {view === "list" && (
                  <div className="divide-y">
                    {Object.keys(groupedAppointments).length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No hay citas programadas para este período</p>
                      </div>
                    ) : (
                      Object.entries(groupedAppointments)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([date, appts]) => (
                          <div key={date} className="py-4 px-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-sm uppercase">
                                {format(new Date(date + "T00:00:00"), "d 'DE' MMMM 'DE' yyyy", { locale: es }).toUpperCase()}
                              </h3>
                              <span className="text-sm text-muted-foreground uppercase">
                                {getWeekdayName(date)}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {appts.map(apt => {
                                const color = getProfessionalColor(apt.professionals?.name);
                                return (
                                  <div 
                                    key={apt.id}
                                    onClick={() => handleAppointmentClick(apt)}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border"
                                  >
                                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                                      {apt.start_time.slice(0, 5)} - {getEndTime(apt.start_time, apt.duration)}
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${color.bg.replace('/20', '')} ${color.border.replace('border-', 'bg-')}`} />
                                    <div className="flex-1 min-w-0">
                                      <span className="text-sm">
                                        {apt.services?.name} - {apt.clients?.name}
                                        {apt.professionals && ` (${apt.professionals.name})`}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Appointment Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-xl font-display leading-tight">
              {selectedAppointment?.services?.name || "Cita"}
              <span className="block text-sm font-normal text-muted-foreground mt-1">
                {selectedAppointment?.clients?.name}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4 pt-2">
              {/* Date and Time */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm">
                    {format(new Date(selectedAppointment.date + "T00:00:00"), "d/MM/yyyy", { locale: es })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm">
                    {selectedAppointment.start_time.slice(0, 5)} - {getEndTime(selectedAppointment.start_time, selectedAppointment.duration)}
                  </p>
                </div>
              </div>

              {/* Service */}
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Servicio</p>
                <p className="text-sm">{selectedAppointment.services?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedAppointment.duration} min - {selectedAppointment.services?.price?.toFixed(2)}€
                </p>
              </div>

              {/* Client */}
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Cliente</p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">{selectedAppointment.clients?.name}</p>
                </div>
              </div>

              {/* Professional */}
              {selectedAppointment.professionals && (
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Profesional</p>
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm">{selectedAppointment.professionals.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedAppointment.professionals.specialty}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedAppointment.notes && (
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Notas</p>
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm">{selectedAppointment.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
};

export default CalendarView;