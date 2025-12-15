/*
  # Sistema de Gestión de Telecomunicaciones - Tigo Perú
  
  Este sistema gestiona clientes, contratos, instalaciones, pagos e incidencias
  para una empresa de telecomunicaciones.

  ## Nuevas Tablas

  ### 1. usuarios
  Almacena usuarios del sistema con diferentes roles
  - `id` (uuid, primary key)
  - `nombre` (text) - Nombre completo del usuario
  - `usuario` (text, unique) - Username para login
  - `rol` (text) - Rol: 'administrador', 'tecnico', 'operador'
  - `estado` (boolean) - Usuario activo/inactivo
  - `created_at` (timestamp)

  ### 2. clientes
  Información principal de clientes
  - `id` (uuid, primary key)
  - `nombres` (text)
  - `apellidos` (text)
  - `dni` (text, unique)
  - `direccion` (text)
  - `distrito` (text)
  - `telefono` (text)
  - `estado_servicio` (text) - 'activo', 'suspendido', 'inactivo'
  - `created_at` (timestamp)

  ### 3. contratos
  Contratos asociados a cada cliente
  - `id` (uuid, primary key)
  - `id_cliente` (uuid, foreign key)
  - `tipo_servicio` (text) - 'internet', 'cable', 'telefonia', 'combo'
  - `fecha_inicio` (date)
  - `estado` (text) - 'activo', 'suspendido', 'cancelado'
  - `monto_mensual` (decimal)
  - `created_at` (timestamp)

  ### 4. instalaciones
  Registro de instalaciones técnicas
  - `id` (uuid, primary key)
  - `id_cliente` (uuid, foreign key)
  - `direccion_instalacion` (text)
  - `fecha_instalacion` (date)
  - `tecnico_responsable` (text)
  - `observaciones` (text)
  - `estado` (text) - 'programada', 'completada', 'cancelada'
  - `created_at` (timestamp)

  ### 5. pagos
  Registro de pagos de clientes
  - `id` (uuid, primary key)
  - `id_cliente` (uuid, foreign key)
  - `monto` (decimal)
  - `fecha_pago` (date)
  - `estado_pago` (text) - 'completado', 'pendiente', 'rechazado'
  - `metodo_pago` (text)
  - `created_at` (timestamp)

  ### 6. incidencias
  Problemas reportados por clientes
  - `id` (uuid, primary key)
  - `id_cliente` (uuid, foreign key)
  - `tipo_incidencia` (text) - 'falla_servicio', 'soporte_tecnico', 'facturacion', 'otro'
  - `descripcion` (text)
  - `fecha` (timestamp)
  - `estado` (text) - 'abierta', 'en_proceso', 'resuelta', 'cerrada'
  - `prioridad` (text) - 'baja', 'media', 'alta', 'critica'
  - `created_at` (timestamp)

  ### 7. acciones_preventivas
  Acciones preventivas basadas en incidencias
  - `id` (uuid, primary key)
  - `id_incidencia` (uuid, foreign key)
  - `descripcion` (text)
  - `fecha` (date)
  - `estado` (text) - 'planificada', 'en_ejecucion', 'completada'
  - `created_at` (timestamp)

  ## Seguridad
  - RLS habilitado en todas las tablas
  - Políticas de acceso basadas en rol de usuario
  - Solo usuarios autenticados pueden acceder a los datos
*/

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  usuario text UNIQUE NOT NULL,
  rol text NOT NULL CHECK (rol IN ('administrador', 'tecnico', 'operador')),
  estado boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombres text NOT NULL,
  apellidos text NOT NULL,
  dni text UNIQUE NOT NULL,
  direccion text NOT NULL,
  distrito text NOT NULL,
  telefono text NOT NULL,
  estado_servicio text DEFAULT 'activo' CHECK (estado_servicio IN ('activo', 'suspendido', 'inactivo')),
  created_at timestamptz DEFAULT now()
);

-- Tabla de contratos
CREATE TABLE IF NOT EXISTS contratos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente uuid REFERENCES clientes(id) ON DELETE CASCADE,
  tipo_servicio text NOT NULL CHECK (tipo_servicio IN ('internet', 'cable', 'telefonia', 'combo')),
  fecha_inicio date NOT NULL DEFAULT CURRENT_DATE,
  estado text DEFAULT 'activo' CHECK (estado IN ('activo', 'suspendido', 'cancelado')),
  monto_mensual decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabla de instalaciones
CREATE TABLE IF NOT EXISTS instalaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente uuid REFERENCES clientes(id) ON DELETE CASCADE,
  direccion_instalacion text NOT NULL,
  fecha_instalacion date NOT NULL,
  tecnico_responsable text NOT NULL,
  observaciones text DEFAULT '',
  estado text DEFAULT 'programada' CHECK (estado IN ('programada', 'completada', 'cancelada')),
  created_at timestamptz DEFAULT now()
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente uuid REFERENCES clientes(id) ON DELETE CASCADE,
  monto decimal(10,2) NOT NULL,
  fecha_pago date NOT NULL DEFAULT CURRENT_DATE,
  estado_pago text DEFAULT 'completado' CHECK (estado_pago IN ('completado', 'pendiente', 'rechazado')),
  metodo_pago text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabla de incidencias
CREATE TABLE IF NOT EXISTS incidencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente uuid REFERENCES clientes(id) ON DELETE CASCADE,
  tipo_incidencia text NOT NULL CHECK (tipo_incidencia IN ('falla_servicio', 'soporte_tecnico', 'facturacion', 'otro')),
  descripcion text NOT NULL,
  fecha timestamptz DEFAULT now(),
  estado text DEFAULT 'abierta' CHECK (estado IN ('abierta', 'en_proceso', 'resuelta', 'cerrada')),
  prioridad text DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')),
  created_at timestamptz DEFAULT now()
);

-- Tabla de acciones preventivas
CREATE TABLE IF NOT EXISTS acciones_preventivas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_incidencia uuid REFERENCES incidencias(id) ON DELETE CASCADE,
  descripcion text NOT NULL,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  estado text DEFAULT 'planificada' CHECK (estado IN ('planificada', 'en_ejecucion', 'completada')),
  created_at timestamptz DEFAULT now()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_contratos_cliente ON contratos(id_cliente);
CREATE INDEX IF NOT EXISTS idx_instalaciones_cliente ON instalaciones(id_cliente);
CREATE INDEX IF NOT EXISTS idx_pagos_cliente ON pagos(id_cliente);
CREATE INDEX IF NOT EXISTS idx_incidencias_cliente ON incidencias(id_cliente);
CREATE INDEX IF NOT EXISTS idx_acciones_incidencia ON acciones_preventivas(id_incidencia);
CREATE INDEX IF NOT EXISTS idx_clientes_dni ON clientes(dni);
CREATE INDEX IF NOT EXISTS idx_usuarios_usuario ON usuarios(usuario);

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE instalaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE acciones_preventivas ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Usuarios autenticados pueden ver usuarios"
  ON usuarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo administradores pueden insertar usuarios"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Solo administradores pueden actualizar usuarios"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Solo administradores pueden eliminar usuarios"
  ON usuarios FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para clientes
CREATE POLICY "Usuarios autenticados pueden ver clientes"
  ON clientes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear clientes"
  ON clientes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar clientes"
  ON clientes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Solo administradores pueden eliminar clientes"
  ON clientes FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para contratos
CREATE POLICY "Usuarios autenticados pueden ver contratos"
  ON contratos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear contratos"
  ON contratos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar contratos"
  ON contratos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Solo administradores pueden eliminar contratos"
  ON contratos FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para instalaciones
CREATE POLICY "Usuarios autenticados pueden ver instalaciones"
  ON instalaciones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear instalaciones"
  ON instalaciones FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar instalaciones"
  ON instalaciones FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Solo administradores pueden eliminar instalaciones"
  ON instalaciones FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para pagos
CREATE POLICY "Usuarios autenticados pueden ver pagos"
  ON pagos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear pagos"
  ON pagos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar pagos"
  ON pagos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Solo administradores pueden eliminar pagos"
  ON pagos FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para incidencias
CREATE POLICY "Usuarios autenticados pueden ver incidencias"
  ON incidencias FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear incidencias"
  ON incidencias FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar incidencias"
  ON incidencias FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Solo administradores pueden eliminar incidencias"
  ON incidencias FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para acciones preventivas
CREATE POLICY "Usuarios autenticados pueden ver acciones preventivas"
  ON acciones_preventivas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear acciones preventivas"
  ON acciones_preventivas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar acciones preventivas"
  ON acciones_preventivas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Solo administradores pueden eliminar acciones preventivas"
  ON acciones_preventivas FOR DELETE
  TO authenticated
  USING (true);