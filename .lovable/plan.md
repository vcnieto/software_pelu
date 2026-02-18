
# Plan de Optimizacion del Proyecto - Salon de Belleza

## Estado actual del proyecto

El proyecto esta bien construido con una arquitectura limpia: autenticacion, rutas protegidas, sidebar responsiva, y paginas para gestionar clientes, servicios, profesionales, citas y calendario. La base de datos tiene RLS correctamente configurado.

## Problemas detectados y mejoras propuestas

### 1. Errores de manejo de datos (Prioridad alta)

**Problema**: No se manejan errores en las llamadas a la base de datos en varias paginas. Si falla una consulta, la app se queda sin feedback.

- **Clients.tsx**: `fetchClients`, `handleSubmit` y `handleDelete` no tienen try/catch ni feedback de error
- **Services.tsx**: Mismo problema en todas las operaciones
- **Professionals.tsx**: Mismo problema
- **Appointments.tsx**: `fetchAppointments` sin manejo de errores

**Solucion**: Envolver todas las operaciones de base de datos en try/catch con toast de error para el usuario.

---

### 2. Optimizacion de rendimiento - React Query (Prioridad alta)

**Problema**: Todas las paginas usan `useState` + `useEffect` + funciones `fetch` manuales para cargar datos. Esto causa:
- Re-fetches innecesarios al navegar entre paginas
- Sin cache de datos
- Sin estados de loading/error automaticos
- El usuario ya tiene `@tanstack/react-query` instalado pero no se usa en ninguna pagina

**Solucion**: Migrar las consultas principales a React Query con `useQuery` para:
- Cache automatico (datos se mantienen al navegar entre paginas)
- Re-fetch inteligente solo cuando es necesario
- Estados de loading y error automaticos
- La app se sentira mucho mas rapida al no recargar datos cada vez

Paginas a migrar: Dashboard, Clients, Services, Professionals, Appointments, Calendar.

---

### 3. Codigo duplicado en Calendar.tsx (Prioridad media)

**Problema**: La funcion `getOverlappingGroups` esta definida identica 2 veces dentro del mismo archivo (una en la vista semanal y otra en la vista diaria).

**Solucion**: Extraerla como funcion utilitaria una sola vez fuera del render.

---

### 4. Optimizacion del Dashboard (Prioridad media)

**Problema**: El Dashboard hace multiples queries por separado y recalcula `getAppointmentStatus` en cada render para el resumen, lo cual se ejecuta innecesariamente.

**Solucion**: Usar `useMemo` para los calculos derivados como el resumen de citas completadas/pendientes.

---

### 5. Appointments.tsx sin paginacion (Prioridad media)

**Problema**: La pagina de citas carga TODAS las citas sin limite. Con el tiempo, esto sera cada vez mas lento.

**Solucion**: Limitar a las citas de los ultimos 30 dias por defecto, o implementar paginacion basica.

---

### 6. Tipado seguro (Prioridad baja)

**Problema**: En `Professionals.tsx` y `Appointments.tsx` se usa `any[]` como tipo de estado.

**Solucion**: Definir interfaces tipadas para profesionales y citas, mejorando la mantenibilidad.

---

## Detalles tecnicos de la implementacion

### React Query - Estructura de hooks personalizados

Se crearan hooks reutilizables en `src/hooks/`:

- `useClients()` - Consulta y cache de clientes
- `useServices()` - Consulta y cache de servicios  
- `useProfessionals()` - Consulta y cache de profesionales
- `useAppointments(filters)` - Consulta con filtros de fecha
- `useDashboardStats()` - Stats del dashboard

Cada hook encapsulara la logica de `useQuery` con las keys de cache apropiadas y funciones de invalidacion para cuando se crean/editan/eliminan registros.

### Manejo de errores

Patron uniforme en todas las operaciones de escritura:

```text
try {
  await operacion de base de datos
  toast.success("Mensaje de exito")
  invalidar cache de React Query
} catch (error) {
  toast.error("Mensaje de error descriptivo")
}
```

### Archivos a crear
- `src/hooks/useClients.ts`
- `src/hooks/useServices.ts`
- `src/hooks/useProfessionals.ts`
- `src/hooks/useAppointments.ts`

### Archivos a modificar
- `src/pages/Dashboard.tsx` - Migrar a React Query + useMemo
- `src/pages/Clients.tsx` - Migrar a React Query + error handling
- `src/pages/Services.tsx` - Migrar a React Query + error handling
- `src/pages/Professionals.tsx` - Migrar a React Query + tipado + error handling
- `src/pages/Appointments.tsx` - Migrar a React Query + tipado + limitar citas + error handling
- `src/pages/Calendar.tsx` - Migrar a React Query + extraer funcion duplicada
- `src/components/appointments/AppointmentFormDialog.tsx` - Error handling mejorado

## Resultado esperado

- La app cargara datos de forma instantanea al navegar entre paginas (cache)
- Errores de red o base de datos mostraran mensajes claros al usuario
- El codigo sera mas limpio, mantenible y con menos duplicacion
- La pagina de citas no se degradara con el tiempo
- Todo el tipado sera seguro, evitando bugs en produccion
