import RentabilidadChart from '@/components/reportes/RentabilidadChart';

export default function TestRentabilidadPage() {
    const mockData = [
        { "fecha": "2025-12-10", "venta_total": 134271, "costo_total": 71790, "ganancia": 62481, "margen": 46.53 }
    ];

    return (
        <div className="p-10 bg-gray-50 min-h-screen">
            <h1 className="text-2xl mb-4">Test Rentabilidad Page</h1>
            <RentabilidadChart data={mockData} />
        </div>
    );
}
