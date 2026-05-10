# Plan: Horario unificado por defecto para todos los usuarios

## Problema

Cuando un profesional tiene horario configurado solo para algunos días (ej. PILI no tiene domingos), al intentar agendar una cita ese día aparece "Cerrado este día" y no se puede crear la cita. Esto bloquea a los usuarios sin razón clara.

## Solución

Aplicar un **horario por defecto único de 09:00 a 21:00 para todos los profesionales y todos los días de la semana**, ignorando la configuración individual de `working_hours`. Así el software funciona igual para todos los usuarios sin excepciones.

## Cambios

**Archivo: `src/components/appointments/AppointmentFormDialog.tsx`**

1. Reemplazar la función `getWorkingHours()` para que siempre devuelva `{ start: "09:00", end: "21:00" }` sin consultar `working_hours` ni el día de la semana.
2. Eliminar la lógica de "isClosed" y el bloque visual rojo de "Cerrado este día" (ya no será necesario).
3. Las franjas horarias seguirán generándose cada 15 minutos entre 09:00 y 21:00, respetando la duración del servicio y los solapamientos con citas existentes (esa lógica se mantiene intacta).

## Resultado

- Cualquier usuario, en cualquier día de la semana, puede agendar citas entre 09:00 y 21:00.
- Ya no aparece nunca el mensaje "Cerrado este día".
- Sigue funcionando el bloqueo de solapamiento de citas (no se pueden crear dos citas que choquen).
- El comportamiento es idéntico para todos los profesionales y todas las cuentas.
