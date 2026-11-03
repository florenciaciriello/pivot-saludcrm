# Pivot SaludCRM — Deploy sin GitHub

## Backend en Railway
1. Instalar Railway CLI:
   npm.cmd install -g @railway/cli
2. Entrar a backend.
3. Ejecutar railway login (o railway up y autenticarse cuando lo pida).
4. Ejecutar railway init y crear proyecto `pivot-saludcrm`.
5. Crear servicio vacío desde Railway dashboard (nombre sugerido `backend`) si `railway up` no lo crea automáticamente.
6. Desplegar desde la carpeta backend con `railway up`.
7. En Railway > servicio backend > Variables agregar `JWT_SECRET` con un valor largo y privado.
8. En Railway > servicio backend > Volumes agregar un volumen montado en `/app/data`.
9. En Railway > servicio backend > Networking > Generate Domain.
10. Probar `https://TU-DOMINIO/api/health`.

## Frontend en Vercel
1. Instalar Vercel CLI:
   npm.cmd install -g vercel
2. Entrar a frontend.
3. Ejecutar `vercel login`.
4. Ejecutar `vercel link` y crear un proyecto nuevo.
5. Ejecutar `vercel env add VITE_API_URL production` y pegar la URL del backend SIN `/api`.
6. Ejecutar `vercel --prod`.
7. Abrir la URL que devuelve Vercel.

Usuario inicial:
admin@saludcrm.com
Admin123!
