// import { NextResponse } from 'next/server';
// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

// export async function POST(request: Request) {
//   try {
//     const { to, subject, html } = await request.json();

//     const data = await resend.emails.send({
//       from: 'Bazar M&M <noreply@bazarmm.com>',
//       to,
//       subject,
//       html,
//     });

//     return NextResponse.json({ success: true, data });
//   } catch (error) {
//     console.error('Error al enviar email:', error);
//     return NextResponse.json(
//       { error: 'Error al enviar el correo electrónico' },
//       { status: 500 }
//     );
//   }
// }
