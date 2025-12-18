# Tigo Perú Telecom Operations Web App

Sistema integral de gestión de operaciones para telecomunicaciones, desarrollado para Tigo Perú. Esta aplicación web permite administrar clientes, contratos, instalaciones, pagos, incidencias y mantenimiento preventivo de manera centralizada y eficiente.

![Tigo Operations](https://img.shields.io/badge/Status-Development-blue)
![Tech Stack](https://img.shields.io/badge/Stack-React%20|%20TypeScript%20|%20Vite%20|%20Supabase-green)

## 📋 Características Principales

El sistema cuenta con los siguientes módulos:

*   **📊 Dashboard Ejecutivo**: Visualización de KPIs en tiempo real (Zonas críticas, ranking de planes, desempeño técnico, ingresos mensuales).
*   **👥 Gestión de Clientes**: Base de datos centralizada de abonados con historial de servicios.
*   **📝 Contratos**: Administración de planes (Internet, Cable, Telefonía) y estados del servicio (Activo, Suspendido, Cancelado).
*   **🛠️ Instalaciones**: Programación y seguimiento de instalaciones técnicas con geolocalización.
*   **💰 Pagos y Facturación**: Registro de pagos, control de morosidad y métodos de pago.
*   **⚠️ Incidencias (Helpdesk)**: Sistema de tickets para reportar fallas de servicio.
*   **🛡️ Acciones Preventivas**: Generación automática de órdenes de trabajo para mantenimiento basado en incidencias.
*   **📦 Inventario**: Control de stock de equipos (módems, cable, herramientas).
*   **🔐 Gestión de Usuarios**: Administración de roles (Administrador, Técnico, Operador).

---

## 🚀 Tecnologías Utilizadas

*   **Frontend**: React 18, TypeScript, Vite
*   **Estilos**: Tailwind CSS 3
*   **Iconos**: Lucide React
*   **Backend / Base de Datos**: Supabase (PostgreSQL)
*   **Gráficos**: Recharts (para el Dashboard)

---

## ⚙️ Configuración e Instalación

Sigue estos pasos para levantar el proyecto en tu entorno local.

### 1. Requisitos Previos

*   Node.js (v18 o superior)
*   NPM (v9 o superior)
*   Una cuenta activa en [Supabase](https://supabase.com/)

### 2. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd tigol
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto (puedes copiar `.env.example` si existe) y añade tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-publica
```

### 5. Configurar la Base de Datos (Supabase)

El proyecto incluye una carpeta `sqls/` con todo lo necesario para configurar tu base de datos en Supabase. Ejecuta los scripts en el **SQL Editor** de Supabase en el siguiente orden:

1.  **`sqls/creacion_tablas.sql`**:
    *   Crea todas las tablas (clientes, contratos, etc.).
    *   Configura las políticas de seguridad (Row Level Security).
    *   Crea las Vistas SQL necesarias para los reportes del Dashboard.

2.  **`sqls/triggers.sql`**:
    *   Instala la lógica de negocio automatizada (Triggers).
    *   *Ejemplo*: Al crear un contrato, se crea una instalación pendiente automáticamente.

3.  **`sqls/datos.sql`** (Opcional):
    *   Puebla la base de datos con datos de prueba coherentes para desarrollo y testing.
    *   **Nota**: Este script limpia (borra) los datos existentes antes de insertar los nuevos.

---

## ▶️ Ejecutar el Proyecto

Para iniciar el servidor de desarrollo local:

```bash
npm run dev
```

La aplicación estará disponible típicamente en `http://localhost:5173`.

---

## 🤖 Automatización y Lógica de Negocio

El sistema cuenta con "Triggers" inteligentes en la base de datos para agilizar la operación:

1.  **Contrato ➡️ Instalación**: Al registrar un nuevo contrato, el sistema crea automáticamente una orden de instalación en estado "Pendiente" con la dirección del cliente.
2.  **Incidencia ➡️ Acción Preventiva**: Al reportar una falla técnica, se genera automáticamente una orden de trabajo (acción preventiva) para que los técnicos la atiendan.
3.  **Instalación Completada ➡️ Activación**: Cuando un técnico marca una instalación como "Completada", el estado del cliente y su contrato pasan automáticamente a "Activo".
4.  **Resolución de Incidencia**: Al cerrar un ticket de incidencia, la orden de trabajo asociada se marca como completada automáticamente.
5.  **Validación de Pagos**: El sistema impide a nivel de base de datos ingresar pagos con montos negativos o cero.
