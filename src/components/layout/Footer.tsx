export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-6 text-center">
        <p>&copy; {new Date().getFullYear()} Bazar M&M. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
