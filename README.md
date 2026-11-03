# Pivot SaludCRM — Entrega final 12/11

CRM especializado en la comercialización de planes de salud desarrollado por Grupo Pivot para Gestión Aplicada al Desarrollo de Software II (UNLaM).

## Funcionalidades incluidas

- Login y autenticación con JWT.
- Usuarios con roles: Administrador, Asesor y Responsable Comercial.
- Permisos validados en backend.
- Gestión de empresas y contactos con responsables y baja lógica mediante estados.
- Gestión completa de planes de salud por prestadora, modalidad y cobertura.
- Oportunidades con empresa/contacto, responsable, plan, etapa, origen y valores.
- Embudo comercial configurable.
- Cambio de etapas con historial de etapa anterior, nueva etapa, fecha/hora y usuario.
- Cierre de oportunidades como Ganadas o Perdidas.
- Valor final obligatorio para oportunidades ganadas.
- Motivo de pérdida obligatorio para oportunidades perdidas.
- Reapertura de oportunidades cerradas únicamente para Administrador/Responsable Comercial.
- Registro de actividades realizadas: llamada, email, mensaje, reuniones, demostración, propuesta, nota, etc.
- Historial comercial cronológico para empresa, contacto y oportunidad.
- Configuración de etapas, tipos de actividad, orígenes y motivos de pérdida.
- Búsqueda, filtros y paginación en empresas, contactos y oportunidades.
- Persistencia SQLite compatible con volumen de Railway.
- Migraciones automáticas: se puede desplegar sobre la base de la primera entrega sin borrar los datos existentes.

## Usuarios de demostración

- Administrador: `admin@saludcrm.com` / `Admin123!`
- Asesor: `asesor@saludcrm.com` / `Asesor123!`
- Responsable comercial: `responsable@saludcrm.com` / `Responsable123!`

> Cambiar las contraseñas para un uso no académico.

## Ejecutar localmente

### Backend

```powershell
cd backend
npm.cmd install
npm.cmd run dev
```

API: `http://localhost:3001`

### Frontend

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Web: normalmente `http://localhost:5173`

## Actualizar la versión online existente

La aplicación fue preparada para conservar la arquitectura anterior: frontend en Vercel, backend en Railway y SQLite en el volumen persistente.

### 1. Backend / Railway

Desde la carpeta `backend` vinculada al mismo proyecto Railway:

```powershell
railway.cmd up
```

No crear un proyecto nuevo. El backend ejecutará las migraciones automáticamente cuando arranque.

### 2. Frontend / Vercel

Desde la carpeta `frontend`, vincularla al proyecto Vercel existente si fuera necesario:

```powershell
vercel.cmd link
```

Elegir el proyecto existente `pivot-saludcrm`. Verificar que `VITE_API_URL` siga apuntando al dominio público de Railway.

Luego:

```powershell
vercel.cmd --prod
```

## Importante sobre los datos existentes

No reemplazar ni borrar el volumen de Railway. El archivo `saludcrm.db` existente será reutilizado y las nuevas tablas/campos se crean automáticamente.
