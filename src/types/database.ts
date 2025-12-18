export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ClienteRow = {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  direccion: string;
  distrito: string;
  telefono: string;
  estado_servicio: 'activo' | 'suspendido' | 'inactivo';
  created_at: string;
};

export type ContratoRow = {
  id: string;
  id_cliente: string;
  tipo_servicio: 'internet' | 'cable' | 'telefonia' | 'combo'; // Be specific to match component
  fecha_inicio: string;
  estado: 'activo' | 'suspendido' | 'cancelado';
  monto_mensual: number;
  created_at: string;
};

export type InstalacionRow = {
  id: string;
  id_cliente: string;
  direccion_instalacion: string;
  fecha_instalacion: string;
  tecnico_responsable: string;
  observaciones: string;
  latitud: number | null;
  longitud: number | null;
  referencias: string | null;
  estado: 'programada' | 'completada' | 'cancelada' | 'pendiente';
  created_at: string;
};

export type PagoRow = {
  id: string;
  id_cliente: string;
  monto: number;
  fecha_pago: string;
  estado_pago: 'completado' | 'pendiente' | 'rechazado';
  metodo_pago: string;
  created_at: string;
};

export type IncidenciaRow = {
  id: string;
  id_cliente: string;
  tipo_incidencia: 'falla_servicio' | 'soporte_tecnico' | 'facturacion' | 'otro';
  descripcion: string;
  fecha: string;
  estado: 'abierta' | 'en_proceso' | 'resuelta' | 'cerrada';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  created_at: string;
};

export type AccionPreventivaRow = {
  id: string;
  id_incidencia: string;
  descripcion: string;
  fecha: string;
  estado: 'planificada' | 'en_ejecucion' | 'completada';
  created_at: string;
};

export type UsuarioRow = {
  id: string;
  nombre: string;
  usuario: string;
  rol: 'administrador' | 'tecnico' | 'operador';
  estado: boolean;
  created_at: string;
};

export type InventarioRow = {
  id: string;
  nombre: string;
  tipo: 'modem' | 'cable' | 'fibra' | 'conector' | 'herramienta' | 'otro';
  modelo: string | null;
  serie: string | null;
  estado: 'nuevo' | 'usado' | 'dañado' | 'en_uso';
  cantidad: number;
  fecha_adquisicion: string;
  created_at: string;
};

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: UsuarioRow;
        Insert: Omit<UsuarioRow, 'id' | 'created_at'>;
        Update: Partial<Omit<UsuarioRow, 'id' | 'created_at'>>;
      };
      clientes: {
        Row: ClienteRow;
        Insert: Omit<ClienteRow, 'id' | 'created_at'>;
        Update: Partial<Omit<ClienteRow, 'id' | 'created_at'>>;
      };
      contratos: {
        Row: ContratoRow;
        Insert: Omit<ContratoRow, 'id' | 'created_at'>;
        Update: Partial<Omit<ContratoRow, 'id' | 'created_at'>>;
      };
      instalaciones: {
        Row: InstalacionRow;
        Insert: Omit<InstalacionRow, 'id' | 'created_at'>;
        Update: Partial<Omit<InstalacionRow, 'id' | 'created_at'>>;
      };
      pagos: {
        Row: PagoRow;
        Insert: Omit<PagoRow, 'id' | 'created_at'>;
        Update: Partial<Omit<PagoRow, 'id' | 'created_at'>>;
      };
      incidencias: {
        Row: IncidenciaRow;
        Insert: Omit<IncidenciaRow, 'id' | 'created_at'>;
        Update: Partial<Omit<IncidenciaRow, 'id' | 'created_at'>>;
      };
      acciones_preventivas: {
        Row: AccionPreventivaRow;
        Insert: Omit<AccionPreventivaRow, 'id' | 'created_at'>;
        Update: Partial<Omit<AccionPreventivaRow, 'id' | 'created_at'>>;
      };
      inventario: {
        Row: InventarioRow;
        Insert: Omit<InventarioRow, 'id' | 'created_at'>;
        Update: Partial<Omit<InventarioRow, 'id' | 'created_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Cliente = ClienteRow;
export type Contrato = ContratoRow;
export type Instalacion = InstalacionRow;
export type Pago = PagoRow;
export type Incidencia = IncidenciaRow;
export type AccionPreventiva = AccionPreventivaRow;
export type Inventario = InventarioRow;
export type Usuario = UsuarioRow;
