export interface PDFTemplate {
    id: string;
    nombre: string;
    proveedor_id?: string;
    activo: boolean;
    detect_keywords: string[];
    header_config: HeaderConfig;
    products_config: ProductsConfig;
    created_at?: string;
    updated_at?: string;
}

export interface HeaderConfig {
    order_regex?: string;  // Regex para encontrar el número de orden
    date_regex?: string;   // Regex para encontrar la fecha
    total_regex?: string;  // Regex para encontrar el total
    vendor_regex?: string; // Regex opcional para confirmar proveedor
}

export interface ProductsConfig {
    table_start_marker?: string; // Texto que indica inicio de tabla (ej: "Descripción")
    table_end_marker?: string;   // Texto que indica fin de tabla (ej: "Subtotal")
    line_regex?: string;         // Regex para parsear una línea de producto

    // Mapeo de grupos de captura del regex a campos del producto
    // Ej: { "qty": 1, "description": 2, "price": 3, "total": 4 }
    field_mapping: {
        sku?: number;
        description: number;
        qty: number;
        price: number;
        total?: number;
    };
}
