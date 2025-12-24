import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Clock, UserCircle } from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";

const PROFESSIONAL_COLORS = [
  "bg-primary/10 border-primary text-primary",
  "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400",
  "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400",
  "bg-violet-500/10 border-violet-500 text-violet-700 dark:text-violet-400",
  "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400",
];

const CalendarView = () => {
  const { user } = useAuth();
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: startOfWeek(monthStart, { weekStartsOn: 1 }), end: addDays(startOfWeek(monthEnd, { weekStartsOn: 1 }), 6) });
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  useEffect(() => { if (user) { fetchAppointments(); fetchProfessionals(); } }, [user, currentDate, view]);

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
    const { data } = await supabase.from("appointments").select("*, clients(name), services(name, duration), professionals(name)").gte("date", start).lte("date", end).order("start_time");
    setAppointments(data || []);
  };

  const fetchProfessionals = async () => {
    const { data } = await supabase.from("professionals").select("*").order("name");
    setProfessionals(data || []);
  };

  const getProfessionalColor = (professionalId: string) => {
    const index = professionals.findIndex(p => p.id === professionalId);
    return PROFESSIONAL_COLORS[index % PROFESSIONAL_COLORS.length];
  };

  const getAppointmentsForDay = (date: Date) => appointments.filter(a => a.date === format(date, "yyyy-MM-dd"));

  const navigate = (direction: number) => {
    if (view === "day") setCurrentDate(addDays(currentDate, direction));
    else if (view === "week") setCurrentDate(direction > 0 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    else setCurrentDate(direction > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
  };

  return (
    <Sidebar>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-display font-semibold">Calendario</h1>
          <div className="flex items-center gap-2">
            <Button variant={view === "day" ? "default" : "outline"} size="sm" onClick={() => setView("day")}>Día</Button>
            <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => setView("week")}>Semana</Button>
            <Button variant={view === "month" ? "default" : "outline"} size="sm" onClick={() => setView("month")}>Mes</Button>
          </div>
        </div>

        {/* Professional legend */}
        {professionals.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {professionals.map((pro, idx) => (
              <div key={pro.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border-l-2 ${PROFESSIONAL_COLORS[idx % PROFESSIONAL_COLORS.length]}`}>
                <UserCircle className="w-3 h-3" />
                {pro.name}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ChevronLeft className="w-5 h-5" /></Button>
          <h2 className="font-display text-xl font-semibold">
            {view === "day" && format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
            {view === "week" && `${format(weekStart, "d MMM", { locale: es })} - ${format(addDays(weekStart, 6), "d MMM yyyy", { locale: es })}`}
            {view === "month" && format(currentDate, "MMMM yyyy", { locale: es })}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => navigate(1)}><ChevronRight className="w-5 h-5" /></Button>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {view === "month" ? (
              <div>
                <div className="grid grid-cols-7 border-b">
                  {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(day => (
                    <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 divide-x">
                  {monthDays.map(day => {
                    const dayAppts = getAppointmentsForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    return (
                      <div key={day.toISOString()} className={`min-h-[100px] p-1 border-b ${!isCurrentMonth ? "bg-muted/30" : ""}`}>
                        <p className={`text-xs font-medium mb-1 ${!isCurrentMonth ? "text-muted-foreground/50" : ""}`}>{format(day, "d")}</p>
                        <div className="space-y-0.5">
                          {dayAppts.slice(0, 3).map(apt => (
                            <div key={apt.id} className={`text-[10px] px-1 py-0.5 rounded border-l-2 truncate ${getProfessionalColor(apt.professional_id)}`}>
                              {apt.start_time.slice(0, 5)} {apt.clients?.name}
                            </div>
                          ))}
                          {dayAppts.length > 3 && <p className="text-[10px] text-muted-foreground px-1">+{dayAppts.length - 3} más</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : view === "week" ? (
              <div className="grid grid-cols-7 divide-x border-b">
                {weekDays.map(day => (
                  <div key={day.toISOString()} className="p-3 text-center min-h-[200px]">
                    <p className="text-xs text-muted-foreground">{format(day, "EEE", { locale: es })}</p>
                    <p className="font-semibold text-lg">{format(day, "d")}</p>
                    <div className="mt-2 space-y-1">
                      {getAppointmentsForDay(day).map(apt => (
                        <div key={apt.id} className={`text-xs p-2 rounded border-l-2 ${getProfessionalColor(apt.professional_id)}`}>
                          <p className="font-medium">{apt.start_time.slice(0, 5)}</p>
                          <p className="truncate">{apt.clients?.name}</p>
                          {apt.professionals && <p className="truncate text-[10px] opacity-75">{apt.professionals.name}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {hours.map(hour => {
                  const hourAppts = getAppointmentsForDay(currentDate).filter(a => parseInt(a.start_time) === hour);
                  return (
                    <div key={hour} className="flex">
                      <div className="w-20 p-3 text-sm text-muted-foreground border-r">{`${hour}:00`}</div>
                      <div className="flex-1 p-2 min-h-[60px]">
                        {hourAppts.map(apt => (
                          <div key={apt.id} className={`p-2 rounded border-l-2 mb-1 ${getProfessionalColor(apt.professional_id)}`}>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span className="text-sm font-medium">{apt.start_time.slice(0, 5)} - {apt.clients?.name}</span>
                            </div>
                            <p className="text-xs opacity-75">{apt.services?.name}</p>
                            {apt.professionals && <p className="text-xs opacity-75 flex items-center gap-1"><UserCircle className="w-3 h-3" />{apt.professionals.name}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Sidebar>
  );
};
export default CalendarView;