export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          nombre: string;
          usuario: string;
          rol: 'administrador' | 'tecnico' | 'operador';
          estado: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['usuarios']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['usuarios']['Insert']>;
      };
      clientes: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['clientes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['clientes']['Insert']>;
      };
      contratos: {
        Row: {
          id: string;
          id_cliente: string;
          tipo_servicio: 'internet' | 'cable' | 'telefonia' | 'combo';
          fecha_inicio: string;
          estado: 'activo' | 'suspendido' | 'cancelado';
          monto_mensual: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['contratos']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['contratos']['Insert']>;
      };
      instalaciones: {
        Row: {
          id: string;
          id_cliente: string;
          direccion_instalacion: string;
          fecha_instalacion: string;
          tecnico_responsable: string;
          observaciones: string;
          estado: 'programada' | 'completada' | 'cancelada';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['instalaciones']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['instalaciones']['Insert']>;
      };
      pagos: {
        Row: {
          id: string;
          id_cliente: string;
          monto: number;
          fecha_pago: string;
          estado_pago: 'completado' | 'pendiente' | 'rechazado';
          metodo_pago: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['pagos']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['pagos']['Insert']>;
      };
      incidencias: {
        Row: {
          id: string;
          id_cliente: string;
          tipo_incidencia: 'falla_servicio' | 'soporte_tecnico' | 'facturacion' | 'otro';
          descripcion: string;
          fecha: string;
          estado: 'abierta' | 'en_proceso' | 'resuelta' | 'cerrada';
          prioridad: 'baja' | 'media' | 'alta' | 'critica';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['incidencias']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['incidencias']['Insert']>;
      };
      acciones_preventivas: {
        Row: {
          id: string;
          id_incidencia: string;
          descripcion: string;
          fecha: string;
          estado: 'planificada' | 'en_ejecucion' | 'completada';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['acciones_preventivas']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['acciones_preventivas']['Insert']>;
      };
    };
  };
}

export type Cliente = Database['public']['Tables']['clientes']['Row'];
export type Contrato = Database['public']['Tables']['contratos']['Row'];
export type Instalacion = Database['public']['Tables']['instalaciones']['Row'];
export type Pago = Database['public']['Tables']['pagos']['Row'];
export type Incidencia = Database['public']['Tables']['incidencias']['Row'];
export type AccionPreventiva = Database['public']['Tables']['acciones_preventivas']['Row'];
