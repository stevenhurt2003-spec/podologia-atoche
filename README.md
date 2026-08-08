# Podología Clínica Atoche

Aplicación web de gestión clínica y financiera para **Podología Clínica Atoche** (Ica, Perú).

## Funcionalidades

- Registro de pacientes e historial clínico por paciente
- Registro de atenciones con 21 tratamientos podológicos, cada uno con rango
  referencial de precio y precio sugerido editable
- Agenda diaria de citas
- Control post-tratamiento con alertas por antigüedad y recordatorios por WhatsApp
- Reportes de ingresos: totales, cobrado vs. pendiente, distribución por
  tratamiento y método de pago, ticket promedio
- Métodos de pago del mercado peruano: Efectivo, Yape, Plin, Transferencia,
  Tarjeta y Pago pendiente
- Copia de seguridad en JSON (exportar / importar)

## Tecnología

React 19 · TypeScript · Vite · Tailwind CSS 4

Los datos se almacenan localmente en el navegador (`localStorage`). No requiere
servidor ni base de datos.

## Uso local

```bash
npm install
npm run dev
```

## Publicación

El despliegue a GitHub Pages es automático mediante GitHub Actions con cada
push a la rama `main`.

> **Nota:** el valor de `base` en `vite.config.ts` debe coincidir con el nombre
> del repositorio.

---

Desarrollado por **Hurtado Atoche, Andrés Steven** — Ica, Perú
