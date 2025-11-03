'use client';

export default function BackupComponent() {
  const handleBackup = async () => {
    console.log('Generando backup...');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Backup de Datos</h3>
      <p className="text-gray-600 mb-4">
        Descarga una copia de seguridad de todos los datos del sistema
      </p>
      <button
        onClick={handleBackup}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
      >
        Descargar Backup
      </button>
    </div>
  );
}
