/*
  # 2. DATOS DE PRUEBA (SEED DATA)
*/

TRUNCATE TABLE acciones_preventivas CASCADE;
TRUNCATE TABLE incidencias CASCADE;
TRUNCATE TABLE pagos CASCADE;
TRUNCATE TABLE instalaciones CASCADE;
TRUNCATE TABLE contratos CASCADE;
TRUNCATE TABLE clientes CASCADE;
TRUNCATE TABLE usuarios CASCADE;
TRUNCATE TABLE inventario CASCADE;

INSERT INTO usuarios (nombre, usuario, rol, estado) VALUES
('Juan Pérez', 'admin', 'administrador', true),
('Carlos Técnico', 'ctecnico', 'tecnico', true),
('Ana Operadora', 'aoperadora', 'operador', true),
('Soporte Tigo', 'soporte', 'tecnico', true);

INSERT INTO clientes (id, nombres, apellidos, dni, direccion, distrito, telefono, estado_servicio) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Luis', 'García', '45678901', 'Av. Larco 123', 'Miraflores', '987654321', 'activo'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'María', 'López', '45678902', 'Jr. Unión 456', 'Lima', '987654322', 'activo'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Jorge', 'Martínez', '45678903', 'Av. Arequipa 789', 'Lince', '987654323', 'suspendido'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Elena', 'Rodríguez', '45678904', 'Calle Los Pinos 234', 'Miraflores', '987654324', 'activo'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Carlos', 'Sánchez', '45678905', 'Av. Brasil 345', 'Jesus Maria', '987654325', 'inactivo'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Patricia', 'Díaz', '45678906', 'Jr. Ica 567', 'Lima', '987654326', 'activo'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Roberto', 'Vega', '45678907', 'Av. Pardo 890', 'Miraflores', '987654327', 'suspendido'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Sofia', 'Mendoza', '45678908', 'Calle Las Begonias 111', 'San Isidro', '987654328', 'activo'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'Miguel', 'Torres', '45678909', 'Av. Salaverry 222', 'Jesus Maria', '987654329', 'activo'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'Lucía', 'Ramírez', '45678910', 'Jr. Cusco 333', 'Lima', '987654330', 'activo');

INSERT INTO contratos (id_cliente, tipo_servicio, fecha_inicio, estado, monto_mensual) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '100 Mbps - Fibra', CURRENT_DATE - INTERVAL '6 months', 'activo', 99.90),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '50 Mbps - HFC', CURRENT_DATE - INTERVAL '4 months', 'activo', 79.90),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '30 Mbps - HFC', CURRENT_DATE - INTERVAL '1 year', 'suspendido', 69.90),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Dúo 60 Mbps + TV', CURRENT_DATE - INTERVAL '2 months', 'activo', 89.90),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', '30 Mbps - HFC', CURRENT_DATE - INTERVAL '2 years', 'cancelado', 69.90),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', '200 Mbps - Fibra', CURRENT_DATE - INTERVAL '1 month', 'activo', 129.90),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', '100 Mbps - Fibra', CURRENT_DATE - INTERVAL '5 months', 'suspendido', 99.90),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', '200 Mbps - Fibra', CURRENT_DATE - INTERVAL '3 months', 'activo', 129.90),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', '50 Mbps - HFC', CURRENT_DATE - INTERVAL '4 months', 'activo', 79.90),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'Dúo 60 Mbps + TV', CURRENT_DATE - INTERVAL '2 months', 'activo', 89.90);

INSERT INTO instalaciones (id_cliente, direccion_instalacion, fecha_instalacion, tecnico_responsable, estado, latitud, longitud, observaciones, referencias) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Av. Larco 123', CURRENT_DATE - INTERVAL '5 days', 'Carlos Técnico', 'completada', -12.119, -77.029, 'Instalación exitosa', 'Frente al parque'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Jr. Ica 567', CURRENT_DATE - INTERVAL '2 days', 'Soporte Tigo', 'completada', -12.046, -77.030, 'Cliente satisfecho', 'Puerta verde'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Calle Las Begonias 111', CURRENT_DATE + INTERVAL '1 day', 'Carlos Técnico', 'programada', -12.091, -77.024, 'Llamar antes de ir', 'Cerca a via expresa');

INSERT INTO pagos (id_cliente, monto, fecha_pago, estado_pago, metodo_pago) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 99.90, CURRENT_DATE, 'completado', 'Yape'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 79.90, CURRENT_DATE - INTERVAL '1 day', 'completado', 'Transferencia'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 89.90, CURRENT_DATE - INTERVAL '2 days', 'completado', 'Plin'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 129.90, CURRENT_DATE - INTERVAL '5 days', 'completado', 'Efectivo'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 99.90, CURRENT_DATE - INTERVAL '1 month', 'completado', 'Yape'), 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 89.90, CURRENT_DATE - INTERVAL '1 month', 'completado', 'Plin'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 69.90, CURRENT_DATE - INTERVAL '5 days', 'pendiente', 'Transferencia'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 99.90, CURRENT_DATE - INTERVAL '10 days', 'rechazado', 'Tarjeta'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 69.90, CURRENT_DATE - INTERVAL '35 days', 'pendiente', 'Transferencia'); 

INSERT INTO incidencias (id, id_cliente, tipo_incidencia, descripcion, fecha, estado, prioridad) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'falla_servicio', 'Internet lento en las noches', CURRENT_TIMESTAMP - INTERVAL '2 days', 'en_proceso', 'media'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'falla_servicio', 'Cortes intermitentes', CURRENT_TIMESTAMP - INTERVAL '1 day', 'abierta', 'alta'), 
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'falla_servicio', 'No hay señal', CURRENT_TIMESTAMP - INTERVAL '3 hours', 'abierta', 'critica'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'falla_servicio', 'Módem reiniciándose', CURRENT_TIMESTAMP - INTERVAL '5 days', 'resuelta', 'baja');

INSERT INTO acciones_preventivas (id_incidencia, descripcion, fecha, estado) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'Cambiar conectores y revisar potencia', CURRENT_DATE + INTERVAL '1 day', 'planificada'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 'Visita técnica de emergencia', CURRENT_DATE, 'en_ejecucion');

INSERT INTO inventario (nombre, tipo, modelo, serie, estado, cantidad) VALUES
('Módem XPON Doble Banda', 'modem', 'Huawei HG8145V5', 'HWTC88991122', 'nuevo', 1),
('Módem XPON Doble Banda', 'modem', 'Huawei HG8145V5', 'HWTC88991123', 'nuevo', 1),
('Módem XPON Doble Banda', 'modem', 'Huawei HG8145V5', 'HWTC88991124', 'usado', 1),
('Bobina Cable Fibra Drop 1km', 'fibra', 'Drop Flat 2 Hilos', NULL, 'nuevo', 5),
('Conectores SC/APC', 'conector', 'Genérico Verde', NULL, 'nuevo', 200),
('Fusionadora de Fibra', 'herramienta', 'Comptyco A-81S', 'FUS2024001', 'en_uso', 1),
('Cable UTP Cat6 Bobina', 'cable', 'Dixon Exterior', NULL, 'nuevo', 2),
('Router TP-Link', 'otro', 'Archer C6', 'TP998877', 'nuevo', 1);
