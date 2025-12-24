import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { es } from "date-fns/locale";

const CalendarView = () => {
  const { user } = useAuth();
  const [view, setView] = useState<"day" | "week">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  useEffect(() => { if (user) fetchAppointments(); }, [user, currentDate, view]);

  const fetchAppointments = async () => {
    const start = view === "day" ? format(currentDate, "yyyy-MM-dd") : format(weekStart, "yyyy-MM-dd");
    const end = view === "day" ? format(currentDate, "yyyy-MM-dd") : format(addDays(weekStart, 6), "yyyy-MM-dd");
    const { data } = await supabase.from("appointments").select("*, clients(name), services(name)").gte("date", start).lte("date", end).order("start_time");
    setAppointments(data || []);
  };

  const getAppointmentsForDay = (date: Date) => appointments.filter(a => a.date === format(date, "yyyy-MM-dd"));

  const navigate = (direction: number) => {
    if (view === "day") setCurrentDate(addDays(currentDate, direction));
    else setCurrentDate(direction > 0 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
  };

  return (
    <Sidebar>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-display font-semibold">Calendario</h1>
          <div className="flex items-center gap-2">
            <Button variant={view === "day" ? "default" : "outline"} size="sm" onClick={() => setView("day")}>Día</Button>
            <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => setView("week")}>Semana</Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ChevronLeft className="w-5 h-5" /></Button>
          <h2 className="font-display text-xl font-semibold">
            {view === "day" ? format(currentDate, "EEEE, d 'de' MMMM", { locale: es }) : `${format(weekStart, "d MMM", { locale: es })} - ${format(addDays(weekStart, 6), "d MMM yyyy", { locale: es })}`}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => navigate(1)}><ChevronRight className="w-5 h-5" /></Button>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {view === "week" ? (
              <div className="grid grid-cols-7 divide-x border-b">
                {weekDays.map(day => (
                  <div key={day.toISOString()} className="p-3 text-center min-h-[200px]">
                    <p className="text-xs text-muted-foreground">{format(day, "EEE", { locale: es })}</p>
                    <p className="font-semibold text-lg">{format(day, "d")}</p>
                    <div className="mt-2 space-y-1">
                      {getAppointmentsForDay(day).map(apt => (
                        <div key={apt.id} className="text-xs p-2 rounded bg-primary/10 border-l-2 border-primary">
                          <p className="font-medium">{apt.start_time.slice(0, 5)}</p>
                          <p className="truncate">{apt.clients?.name}</p>
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
                          <div key={apt.id} className="p-2 rounded bg-primary/10 border-l-2 border-primary mb-1">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span className="text-sm font-medium">{apt.start_time.slice(0, 5)} - {apt.clients?.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{apt.services?.name}</p>
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