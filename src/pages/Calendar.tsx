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
  professionals: { name: string; specialty: string; color?: string } | null;
}

const DEFAULT_COLOR = "#8B5CF6";

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
      .select("*, clients(name), services(name, duration, price), professionals(name, specialty, color)")
      .gte("date", start)
      .lte("date", end)
      .order("date")
      .order("start_time");
    setAppointments(data || []);
  };

  const getProfessionalColor = (professional: { color?: string } | null) => {
    return professional?.color || DEFAULT_COLOR;
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
      <div className="p-4 lg:p-6 h-[calc(100vh-4rem)] flex flex-col animate-fade-in">
        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
          {/* Left sidebar - Mini Calendar */}
          <div className="lg:w-64 shrink-0">
            <Card className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">
                  {format(currentDate, "MMMM 'de' yyyy", { locale: es })}
                </h3>
                <div className="flex gap-0.5">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-0.5 text-center mb-1.5">
                {["L", "M", "X", "J", "V", "S", "D"].map(day => (
                  <div key={day} className="text-[9px] font-medium text-muted-foreground py-0.5">{day}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-0.5">
                {monthDays.slice(0, 42).map(day => {
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isSelected = isSameDay(day, selectedDate);
                  const hasAppointments = getAppointmentsForDay(day).length > 0;
                  
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDayClick(day)}
                      className={`
                        text-[10px] p-1 rounded transition-colors relative
                        ${!isCurrentMonth ? "text-muted-foreground/40" : ""}
                        ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
                        ${isToday(day) && !isSelected ? "border border-primary" : ""}
                      `}
                    >
                      {format(day, "d")}
                      {hasAppointments && !isSelected && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Main Calendar Area */}
          <div className="flex-1 min-w-0 flex flex-col min-h-0">
            {/* Header with navigation and view toggles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <h2 className="font-display text-lg font-semibold capitalize">
                  {view === "day" && format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
                  {view === "week" && `${format(weekStart, "d", { locale: es })} – ${format(addDays(weekStart, 6), "d 'de' MMM yyyy", { locale: es })}`}
                  {(view === "month" || view === "list") && format(currentDate, "MMMM 'de' yyyy", { locale: es })}
                </h2>
              </div>
              
              <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
                <Button 
                  variant={view === "month" ? "default" : "ghost"} 
                  size="sm" 
                  className="text-xs h-7 px-3"
                  onClick={() => setView("month")}
                >
                  Mes
                </Button>
                <Button 
                  variant={view === "week" ? "default" : "ghost"} 
                  size="sm"
                  className="text-xs h-7 px-3"
                  onClick={() => setView("week")}
                >
                  Semana
                </Button>
                <Button 
                  variant={view === "day" ? "default" : "ghost"} 
                  size="sm"
                  className="text-xs h-7 px-3"
                  onClick={() => setView("day")}
                >
                  Día
                </Button>
                <Button 
                  variant={view === "list" ? "default" : "ghost"} 
                  size="sm"
                  className="text-xs h-7 px-3"
                  onClick={() => setView("list")}
                >
                  Lista
                </Button>
              </div>
            </div>

            {/* Calendar Views */}
            <Card className="flex-1 overflow-hidden flex flex-col min-h-0">
              <CardContent className="p-0 flex-1 overflow-hidden flex flex-col min-h-0">
                {/* MONTH VIEW */}
                {view === "month" && (
                  <div className="flex flex-col h-full">
                    <div className="grid grid-cols-7 border-b bg-muted/30">
                      {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map(day => (
                        <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                      {monthDays.slice(0, 42).map((day, idx) => {
                        const dayAppts = getAppointmentsForDay(day);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isCurrentDay = isToday(day);
                        
                        return (
                          <div 
                            key={day.toISOString()} 
                            onClick={() => handleDayClick(day)}
                            className={`
                              p-1.5 border-b border-r cursor-pointer transition-colors hover:bg-muted/30 flex flex-col overflow-hidden
                              ${!isCurrentMonth ? "bg-muted/20" : ""}
                              ${idx % 7 === 0 ? "border-l-0" : ""}
                            `}
                          >
                            <p className={`
                              text-xs font-medium mb-1 shrink-0
                              ${!isCurrentMonth ? "text-muted-foreground/40" : ""}
                              ${isCurrentDay ? "w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]" : ""}
                            `}>
                              {format(day, "d")}
                            </p>
                            <div className="space-y-0.5 overflow-hidden flex-1">
                            {dayAppts.slice(0, 4).map(apt => {
                                const color = getProfessionalColor(apt.professionals);
                                return (
                                  <div 
                                    key={apt.id} 
                                    onClick={(e) => { e.stopPropagation(); handleAppointmentClick(apt); }}
                                    className="text-[9px] leading-tight px-1.5 py-0.5 rounded cursor-pointer truncate hover:opacity-80 border-l-2"
                                    style={{ 
                                      backgroundColor: color + "20", 
                                      borderColor: color,
                                      color: color
                                    }}
                                  >
                                    <span className="font-medium">{apt.start_time.slice(0, 5)}</span> {apt.services?.name || apt.clients?.name}
                                  </div>
                                );
                              })}
                              {dayAppts.length > 4 && (
                                <p className="text-[9px] text-muted-foreground px-0.5">+{dayAppts.length - 4} más</p>
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
                  <div className="flex flex-col h-full overflow-hidden">
                    {/* Week header */}
                    <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b bg-muted/30 shrink-0">
                      <div className="py-2 text-xs font-medium text-muted-foreground border-r" />
                      {weekDays.map(day => (
                        <div 
                          key={day.toISOString()} 
                          className={`py-2 text-center border-r last:border-r-0 ${isToday(day) ? 'bg-primary/10' : ''}`}
                        >
                          <p className="text-[10px] text-muted-foreground uppercase">
                            {format(day, "EEE", { locale: es })}
                          </p>
                          <p className={`text-sm font-semibold ${isToday(day) ? 'text-primary' : ''}`}>
                            {format(day, "d")}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Hours grid - scrollable with continuous timeline */}
                    <div className="flex-1 overflow-auto relative">
                      <div className="grid grid-cols-[60px_repeat(7,1fr)]" style={{ height: `${hours.length * 64}px` }}>
                        {/* Hour labels column */}
                        <div className="relative border-r">
                          {hours.map((hour, idx) => (
                            <div 
                              key={hour} 
                              className="absolute w-full text-[10px] text-muted-foreground text-right pr-2"
                              style={{ top: `${idx * 64}px`, height: '64px' }}
                            >
                              {String(hour).padStart(2, '0')}:00
                            </div>
                          ))}
                        </div>
                        
                        {/* Day columns with appointments */}
                        {weekDays.map(day => {
                          const dayAppts = getAppointmentsForDay(day);
                          
                          // Group overlapping appointments
                          const getOverlappingGroups = (appts: Appointment[]) => {
                            const groups: Appointment[][] = [];
                            const sorted = [...appts].sort((a, b) => a.start_time.localeCompare(b.start_time));
                            
                            sorted.forEach(apt => {
                              const [h, m] = apt.start_time.split(":").map(Number);
                              const aptStart = h * 60 + m;
                              const aptEnd = aptStart + apt.duration;
                              
                              let addedToGroup = false;
                              for (const group of groups) {
                                const overlaps = group.some(existing => {
                                  const [eh, em] = existing.start_time.split(":").map(Number);
                                  const existingStart = eh * 60 + em;
                                  const existingEnd = existingStart + existing.duration;
                                  return aptStart < existingEnd && aptEnd > existingStart;
                                });
                                if (overlaps) {
                                  group.push(apt);
                                  addedToGroup = true;
                                  break;
                                }
                              }
                              if (!addedToGroup) {
                                groups.push([apt]);
                              }
                            });
                            return groups;
                          };
                          
                          const groups = getOverlappingGroups(dayAppts);
                          
                          return (
                            <div 
                              key={day.toISOString()} 
                              className={`relative border-r last:border-r-0 ${isToday(day) ? 'bg-primary/5' : ''}`}
                            >
                              {/* Hour grid lines */}
                              {hours.map((hour, idx) => (
                                <div 
                                  key={hour}
                                  className="absolute w-full border-b"
                                  style={{ top: `${idx * 64}px`, height: '64px' }}
                                />
                              ))}
                              
                              {/* Appointments */}
                              {groups.flatMap(group => 
                                group.map((apt, aptIndex) => {
                                  const color = getProfessionalColor(apt.professionals);
                                  const [startH, startM] = apt.start_time.split(":").map(Number);
                                  const topPx = ((startH - hours[0]) * 64) + ((startM / 60) * 64);
                                  const heightPx = Math.max((apt.duration / 60) * 64, 24);
                                  const totalInGroup = group.length;
                                  const widthPercent = totalInGroup > 1 ? (100 / totalInGroup) - 1 : 98;
                                  const leftPercent = totalInGroup > 1 ? aptIndex * (100 / totalInGroup) + 1 : 1;
                                  
                                  return (
                                    <div 
                                      key={apt.id}
                                      onClick={() => handleAppointmentClick(apt)}
                                      style={{ 
                                        top: `${topPx}px`,
                                        height: `${heightPx}px`,
                                        backgroundColor: color + "20",
                                        borderColor: color,
                                        color: color,
                                        width: `${widthPercent}%`,
                                        left: `${leftPercent}%`
                                      }}
                                      className="absolute p-1 rounded cursor-pointer overflow-hidden z-10 border-l-2 hover:opacity-90 transition-opacity"
                                    >
                                      <p className="text-[9px] font-semibold leading-none">
                                        {apt.start_time.slice(0, 5)}
                                      </p>
                                      <p className="text-[9px] truncate leading-tight mt-0.5">{apt.services?.name}</p>
                                      <p className="text-[8px] truncate opacity-75">{apt.clients?.name}</p>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* DAY VIEW */}
                {view === "day" && (
                  <div className="flex flex-col h-full overflow-hidden">
                    {/* Day header */}
                    <div className="border-b bg-muted/30 py-3 px-4 shrink-0">
                      <p className="text-sm font-semibold text-center">
                        {format(currentDate, "EEEE", { locale: es })}
                      </p>
                      <p className={`text-2xl font-bold text-center ${isToday(currentDate) ? 'text-primary' : ''}`}>
                        {format(currentDate, "d")}
                      </p>
                    </div>
                    
                    {/* Hours grid - continuous timeline */}
                    <div className="flex-1 overflow-auto">
                      <div className="grid grid-cols-[80px_1fr] relative" style={{ height: `${hours.length * 80}px` }}>
                        {/* Hour labels column */}
                        <div className="relative border-r">
                          {hours.map((hour, idx) => (
                            <div 
                              key={hour} 
                              className="absolute w-full text-xs text-muted-foreground text-right pr-3 font-medium"
                              style={{ top: `${idx * 80}px`, height: '80px' }}
                            >
                              {String(hour).padStart(2, '0')}:00
                            </div>
                          ))}
                        </div>
                        
                        {/* Appointments column */}
                        <div className="relative">
                          {/* Hour grid lines */}
                          {hours.map((hour, idx) => (
                            <div 
                              key={hour}
                              className="absolute w-full border-b"
                              style={{ top: `${idx * 80}px`, height: '80px' }}
                            />
                          ))}
                          
                          {/* Appointments */}
                          {(() => {
                            const dayAppts = getAppointmentsForDay(currentDate);
                            
                            // Group overlapping appointments
                            const getOverlappingGroups = (appts: Appointment[]) => {
                              const groups: Appointment[][] = [];
                              const sorted = [...appts].sort((a, b) => a.start_time.localeCompare(b.start_time));
                              
                              sorted.forEach(apt => {
                                const [h, m] = apt.start_time.split(":").map(Number);
                                const aptStart = h * 60 + m;
                                const aptEnd = aptStart + apt.duration;
                                
                                let addedToGroup = false;
                                for (const group of groups) {
                                  const overlaps = group.some(existing => {
                                    const [eh, em] = existing.start_time.split(":").map(Number);
                                    const existingStart = eh * 60 + em;
                                    const existingEnd = existingStart + existing.duration;
                                    return aptStart < existingEnd && aptEnd > existingStart;
                                  });
                                  if (overlaps) {
                                    group.push(apt);
                                    addedToGroup = true;
                                    break;
                                  }
                                }
                                if (!addedToGroup) {
                                  groups.push([apt]);
                                }
                              });
                              return groups;
                            };
                            
                            const groups = getOverlappingGroups(dayAppts);
                            
                            return groups.flatMap(group => 
                              group.map((apt, aptIndex) => {
                                const color = getProfessionalColor(apt.professionals);
                                const [startH, startM] = apt.start_time.split(":").map(Number);
                                const topPx = ((startH - hours[0]) * 80) + ((startM / 60) * 80);
                                const heightPx = Math.max((apt.duration / 60) * 80, 36);
                                const totalInGroup = group.length;
                                const widthPercent = totalInGroup > 1 ? (100 / totalInGroup) - 0.5 : 99;
                                const leftPercent = totalInGroup > 1 ? aptIndex * (100 / totalInGroup) + 0.5 : 0.5;
                                
                                return (
                                  <div 
                                    key={apt.id}
                                    onClick={() => handleAppointmentClick(apt)}
                                    style={{ 
                                      top: `${topPx}px`,
                                      height: `${heightPx}px`,
                                      backgroundColor: color + "20",
                                      borderColor: color,
                                      color: color,
                                      width: `calc(${widthPercent}% - 8px)`,
                                      left: `calc(${leftPercent}% + 4px)`
                                    }}
                                    className="absolute p-2 rounded-lg cursor-pointer overflow-hidden border-l-[3px] hover:opacity-90 transition-opacity shadow-sm z-10"
                                  >
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-semibold">
                                        {apt.start_time.slice(0, 5)} - {getEndTime(apt.start_time, apt.duration)}
                                      </p>
                                    </div>
                                    <p className="text-sm font-medium truncate mt-0.5">{apt.services?.name}</p>
                                    <p className="text-xs truncate opacity-80">Cliente: {apt.clients?.name}</p>
                                    {apt.professionals && (
                                      <p className="text-xs truncate opacity-80">Prof: {apt.professionals.name}</p>
                                    )}
                                  </div>
                                );
                              })
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* LIST VIEW */}
                {view === "list" && (
                  <div className="flex-1 overflow-auto">
                    {Object.keys(groupedAppointments).length === 0 ? (
                      <div className="p-12 text-center text-muted-foreground">
                        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No hay citas programadas para este período</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {Object.entries(groupedAppointments)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([date, appts]) => (
                            <div key={date} className="py-4 px-5">
                              <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed">
                                <h3 className="font-semibold text-sm">
                                  {format(new Date(date + "T00:00:00"), "EEEE, d 'de' MMMM", { locale: es })}
                                </h3>
                                <span className="text-xs bg-muted px-2 py-1 rounded-full">
                                  {appts.length} {appts.length === 1 ? 'cita' : 'citas'}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {appts.map(apt => {
                                  const color = getProfessionalColor(apt.professionals);
                                  return (
                                    <div 
                                      key={apt.id}
                                      onClick={() => handleAppointmentClick(apt)}
                                      style={{ 
                                        backgroundColor: color + "20",
                                        borderColor: color
                                      }}
                                      className="flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all hover:opacity-80 border-l-[3px]"
                                    >
                                      <div className="text-sm font-medium whitespace-nowrap min-w-[100px]">
                                        {apt.start_time.slice(0, 5)} - {getEndTime(apt.start_time, apt.duration)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium" style={{ color }}>{apt.services?.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {apt.clients?.name} {apt.professionals && `• ${apt.professionals.name}`}
                                        </p>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {apt.duration} min
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))
                        }
                      </div>
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