import { sendEmail } from '@/lib/resend';

// Enviar recibo de venta por email
export async function sendVentaRecibo(
  email: string,
  ventaData: any
): Promise<{ success: boolean; error?: any }> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f3f4f6; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #d1d5db; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bazar M&M</h1>
            <p>Recibo de Venta</p>
          </div>
          <div class="content">
            <h2>Recibo #${ventaData.id}</h2>
            <p><strong>Fecha:</strong> ${new Date(ventaData.created_at).toLocaleDateString('es-AR')}</p>
            <p><strong>Total:</strong> $${ventaData.total.toFixed(2)}</p>
            <p><strong>Método de Pago:</strong> ${ventaData.metodo_pago}</p>
            <p>Gracias por su compra!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Bazar M&M. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: `Recibo de Venta #${ventaData.id} - Bazar M&M`,
    html,
  });
}

// Enviar alerta de stock bajo
export async function sendStockAlert(
  email: string,
  productos: any[]
): Promise<{ success: boolean; error?: any }> {
  const productosHtml = productos
    .map(
      (p) => `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.stock_actual}</td>
        <td>${p.stock_minimo}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .alert { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #d1d5db; }
          th { background-color: #f3f4f6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="alert">
            <h2>⚠️ Alerta de Stock Bajo</h2>
            <p>Los siguientes productos están por debajo del stock mínimo:</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
              </tr>
            </thead>
            <tbody>
              ${productosHtml}
            </tbody>
          </table>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: 'Alerta: Stock Bajo - Bazar M&M',
    html,
  });
}

// Enviar resumen diario de ventas
export async function sendDailySalesSummary(
  email: string,
  stats: { totalVentas: number; cantidadTickets: number; topProductos: any[] }
): Promise<{ success: boolean; error?: any }> {
  const topProductosHtml = stats.topProductos
    .map(
      (p) => `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.cantidad}</td>
        <td>$${p.total.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
          .card { background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #d1d5db; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Resumen Diario de Ventas</h1>
            <p>${new Date().toLocaleDateString('es-AR')}</p>
          </div>
          
          <div class="card">
            <h2>Resumen General</h2>
            <p style="font-size: 24px; font-weight: bold;">$${stats.totalVentas.toFixed(2)}</p>
            <p>Tickets emitidos: ${stats.cantidadTickets}</p>
          </div>

          <h3>Productos Más Vendidos</h3>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${topProductosHtml}
            </tbody>
          </table>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: `Resumen de Ventas - ${new Date().toLocaleDateString('es-AR')}`,
    html,
  });
}

// Enviar correo de recuperación de contraseña
export async function sendResetPassword(
  email: string,
  resetLink: string
): Promise<{ success: boolean; error?: any }> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Recuperación de Contraseña - Bazar M&M</h2>
          <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente botón para continuar:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" class="button">Restablecer Contraseña</a>
          </p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: 'Restablecer Contraseña - Bazar M&M',
    html,
  });
}
