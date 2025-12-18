/*
  # 1. CREACIÓN DE TABLAS Y ESTRUCTURA BASE
  # Incluye: Tablas, Índices, Políticas RLS y Vistas
*/

-- -----------------------------------------------------------------------------
-- SECCIÓN A: TABLAS BASE
-- -----------------------------------------------------------------------------

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
  tipo_servicio text NOT NULL, 
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
  latitud decimal(10,8),
  longitud decimal(11,8),
  referencias text,
  estado text DEFAULT 'programada' CHECK (estado IN ('programada', 'completada', 'cancelada', 'pendiente')),
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

-- Tabla de inventario
CREATE TABLE IF NOT EXISTS inventario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('modem', 'cable', 'fibra', 'conector', 'herramienta', 'otro')),
  modelo text,
  serie text UNIQUE, 
  estado text DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'usado', 'dañado', 'en_uso')),
  cantidad integer DEFAULT 1,
  fecha_adquisicion date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- SECCIÓN B: ÍNDICES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_contratos_cliente ON contratos(id_cliente);
CREATE INDEX IF NOT EXISTS idx_instalaciones_cliente ON instalaciones(id_cliente);
CREATE INDEX IF NOT EXISTS idx_pagos_cliente ON pagos(id_cliente);
CREATE INDEX IF NOT EXISTS idx_incidencias_cliente ON incidencias(id_cliente);
CREATE INDEX IF NOT EXISTS idx_acciones_incidencia ON acciones_preventivas(id_incidencia);
CREATE INDEX IF NOT EXISTS idx_clientes_dni ON clientes(dni);
CREATE INDEX IF NOT EXISTS idx_usuarios_usuario ON usuarios(usuario);

-- -----------------------------------------------------------------------------
-- SECCIÓN C: POLÍTICAS RLS (Acceso Público para desarrollo)
-- -----------------------------------------------------------------------------
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE instalaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE acciones_preventivas ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso total a usuarios" ON usuarios FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acceso total a clientes" ON clientes FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acceso total a contratos" ON contratos FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acceso total a instalaciones" ON instalaciones FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acceso total a pagos" ON pagos FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acceso total a incidencias" ON incidencias FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acceso total a acciones_preventivas" ON acciones_preventivas FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acceso total a inventario" ON inventario FOR ALL TO public USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- SECCIÓN D: VISTAS DEL DASHBOARD
-- -----------------------------------------------------------------------------

-- VISTA 1: Zonas Críticas
CREATE OR REPLACE VIEW rep_incidencias_distrito AS
SELECT 
  c.distrito,
  COUNT(i.id) as total_fallas
FROM incidencias i
JOIN clientes c ON i.id_cliente = c.id
GROUP BY c.distrito
ORDER BY total_fallas DESC;

-- VISTA 2: Ranking de Planes
CREATE OR REPLACE VIEW rep_ranking_planes AS
SELECT 
  tipo_servicio as plan_internet,
  COUNT(id) as cantidad
FROM contratos
WHERE estado = 'activo'
GROUP BY tipo_servicio
ORDER BY cantidad DESC;

-- VISTA 3: Top Técnicos
CREATE OR REPLACE VIEW rep_instalaciones_tecnico AS
SELECT 
  tecnico_responsable as tecnico_asignado,
  COUNT(id) as total
FROM instalaciones
WHERE estado = 'completada'
GROUP BY tecnico_responsable
ORDER BY total DESC;

-- VISTA 4: Ingresos Mensuales
CREATE OR REPLACE VIEW rep_ingresos_mes AS
SELECT 
  TO_CHAR(fecha_pago, 'MM-YYYY') as mes,
  SUM(monto) as total
FROM pagos
WHERE estado_pago = 'completado'
GROUP BY TO_CHAR(fecha_pago, 'MM-YYYY')
ORDER BY MIN(fecha_pago) DESC;

-- VISTA 5: Reporte de Morosos
CREATE OR REPLACE VIEW rep_morosos AS
SELECT 
  c.id,
  c.nombres,
  c.apellidos,
  c.telefono,
  (SELECT tipo_servicio FROM contratos co WHERE co.id_cliente = c.id LIMIT 1) as plan_internet,
  SUM(p.monto) as deuda_estimada
FROM pagos p
JOIN clientes c ON p.id_cliente = c.id
WHERE p.estado_pago = 'pendiente' OR p.estado_pago = 'rechazado'
GROUP BY c.id, c.nombres, c.apellidos, c.telefono;

GRANT SELECT ON rep_incidencias_distrito TO public;
GRANT SELECT ON rep_ranking_planes TO public;
GRANT SELECT ON rep_instalaciones_tecnico TO public;
GRANT SELECT ON rep_ingresos_mes TO public;
GRANT SELECT ON rep_morosos TO public;
