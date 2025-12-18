/*
  # 3. TRIGGERS Y AUTOMATIZACIÓN
  # Este script contiene toda la lógica de negocio automática de la base de datos.
*/

-- -----------------------------------------------------------------------------
-- CHECK: Estado 'pendiente' en Instalaciones
-- -----------------------------------------------------------------------------
ALTER TABLE public.instalaciones DROP CONSTRAINT IF EXISTS instalaciones_estado_check;
ALTER TABLE public.instalaciones ADD CONSTRAINT instalaciones_estado_check 
  CHECK (estado IN ('programada', 'completada', 'cancelada', 'pendiente'));


-- -----------------------------------------------------------------------------
-- TRIGGER 1: Contrato -> Instalación Automática
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_contract()
RETURNS TRIGGER AS $$
DECLARE
  v_direccion text;
BEGIN
  -- Obtener la dirección del cliente asociado al contrato
  SELECT direccion INTO v_direccion FROM public.clientes WHERE id = NEW.id_cliente;

  -- Insertar la instalación automáticamente
  INSERT INTO public.instalaciones (
    id_cliente,
    direccion_instalacion,
    fecha_instalacion,
    tecnico_responsable,
    observaciones, 
    estado
  ) VALUES (
    NEW.id_cliente,
    COALESCE(v_direccion, 'Dirección no encontrada'), 
    NEW.fecha_inicio, 
    'Por asignar', 
    'Instalación generada automáticamente por Contrato ID: ' || NEW.id,
    'pendiente'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_contract_created ON public.contratos;

CREATE TRIGGER on_contract_created
  AFTER INSERT ON public.contratos
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_contract();


-- -----------------------------------------------------------------------------
-- TRIGGER 2: Incidencia -> Acción Preventiva Automática
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_incidencia()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.acciones_preventivas (
    id_incidencia,
    descripcion,
    fecha,
    estado
  ) VALUES (
    NEW.id,
    'Acción preventiva automática por incidencia: ' || NEW.tipo_incidencia || '. ' || COALESCE(NEW.descripcion, ''),
    CURRENT_DATE,
    'planificada'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_incidencia_created ON public.incidencias;

CREATE TRIGGER on_incidencia_created
  AFTER INSERT ON public.incidencias
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_incidencia();


-- -----------------------------------------------------------------------------
-- TRIGGER 3: Instalación Completada -> Activar Cliente y Contrato
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_installation_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'completada' AND OLD.estado != 'completada' THEN
    -- Actualizar estado del cliente a 'activo'
    UPDATE public.clientes
    SET estado_servicio = 'activo'
    WHERE id = NEW.id_cliente;
    
    -- Actualizar contrato a 'activo' si no lo está
    UPDATE public.contratos
    SET estado = 'activo'
    WHERE id_cliente = NEW.id_cliente AND estado != 'activo';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_installation_completed ON public.instalaciones;

CREATE TRIGGER on_installation_completed
  AFTER UPDATE ON public.instalaciones
  FOR EACH ROW EXECUTE FUNCTION public.handle_installation_completed();


-- -----------------------------------------------------------------------------
-- TRIGGER 4: Incidencia Resuelta -> Completar Acción Preventiva
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_incidence_resolved()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.estado = 'resuelta' OR NEW.estado = 'cerrada') AND (OLD.estado != 'resuelta' AND OLD.estado != 'cerrada') THEN
    UPDATE public.acciones_preventivas
    SET estado = 'completada'
    WHERE id_incidencia = NEW.id AND estado != 'completada';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_incidence_resolved ON public.incidencias;

CREATE TRIGGER on_incidence_resolved
  AFTER UPDATE ON public.incidencias
  FOR EACH ROW EXECUTE FUNCTION public.handle_incidence_resolved();


-- -----------------------------------------------------------------------------
-- TRIGGER 5: Validación de Pagos
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_payment_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.monto <= 0 THEN
    RAISE EXCEPTION 'El monto del pago debe ser mayor a 0. Monto recibido: %', NEW.monto;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_payment_amount ON public.pagos;

CREATE TRIGGER check_payment_amount
  BEFORE INSERT OR UPDATE ON public.pagos
  FOR EACH ROW EXECUTE FUNCTION public.validate_payment_amount();
