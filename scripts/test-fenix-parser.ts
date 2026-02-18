
const { PDFService } = require('../src/services/pdfService');

const RAW_TEXT = `
DISTRIBUIDORA FENIX
SUCURSAL PEDIDOS
LIBERTADOR 1047, MORENO, BUENOS
AIRES
TEL: +541140480293
distribuidorafenixoficinas@gmail.com
PEDIDO
Nº 00008906
FECHA: 30/01/2026
RESPONSABLE INSCRIPTO - CUIT: 20369229991
INICIO ACT.: 17/01/2024         ING. BRUTOS: 20-36922999-1
X
SEÑOR/ES: PACCOT, FRANCOIVA: CONSUMIDOR FINALTIPO Y NRO DOC: DNI 43679787 
DOMICILIO: SAN MARTIN 1050PROVINCIA: ENTRE RIOS
LOCALIDAD:TELEFONOS: 3447 454545 - +543447454545
CORREO ELECTRONICO: paccotimport@gmail.com
VENDEDOR: BENITEZ, JULIOCONDICION PAGO:
PERSONA CONTACTO:
LUGAR ENTREGA: AVENIDA SAN MARTIN 1095 - COLON - COD. POSTAL: 3280 - ENTRE RIOS
TRANSPORTE ENTREGA:
FECHA ENTREGA:
OBSERVACIONES:

CTD ITEMS:
42,00
SUBTOTAL:$176.200,00
DESCUENTO:$0,00
TOTAL:
$176.200,00
Pagina: www.distribuidorafenix.com.ar                             Instagram @distribuidorafenixsa                       Tel:  011-36920205 (Ventas) /
011-40480293 (Administración)
Correo electrónico: distribuidorafenixoficinas@gmail.com    (para el envió de comprobantes o problemas administrativos)
Correo electrónico:  distribuidorafenixlocal@gmail.com         (para consultas de precios y stock)
Generado por www.duxsoftware.com.ar
CodigoDescripcion
Cant.Precio Uni.%
Desc
Sub Total
CUBIERTETRAMACUBIERTOS TRAMADOS X 24 EN CUBIERTERA CAROL -
1,0018.500,000,0018.500,00
CUB16SIMONCUBIERTOS X 16 PIEZAS DE PLASTICO EN BLISTER SIMONAGGIO -       
1,0011.500,000,0011.500,00
7791822370893VASO PUB DE VIDRIO RIGOLLOU X 6 UNIDADES -
2,002.300,000,004.600,00
7791231011004SET DE TAPERS X 3 CUADRADOS APILABLES (3.5 L., 2L., 1 L.) STAR -
2,004.600,000,009.200,00
PLATOFENIXPLATO DE VIDRIO PLAYO FENIX DURAX -
24,00800,000,0019.200,00
7798186101576HERVIDOR DE ALUMINIO N 12 -
1,004.400,000,004.400,00
ENSAACERO26ENSALADERA BOWLS DE ACERO 26 CM -
4,002.900,000,0011.600,00
7796631500103PLANCHA BIFERA DE CHAPA 25 X 50 CM PLANCHETA -
1,0028.500,000,0028.500,00
7798186100456OLLA DE ALUMINIO N 24 -
1,0019.900,000,0019.900,00
TORTA22MOLDE PARA TORTA N 22 REDONDO DE ALUM
`;

async function main() {
    console.log('🧪 Testing Fenix PDF Parsing with Raw Text');

    // We will need to expose a method to parse directly from text OR
    // mock the private method if we can't change the public API yet.
    // For now, let's assume we modify the service to have a public 'parseText' method
    // or we access the private method via 'any' casing if it was static.

    try {
        // @ts-ignore - access private method for testing if needed, or public if we refactor
        const result = await PDFService.parseText(RAW_TEXT);

        if (!result) {
            console.log("❌ Service not updated yet to support text parsing or Fenix data");
            // Create a dummy result to show what we expect
            return;
        }

        console.log('✅ Result:', JSON.stringify(result, null, 2));

        let passed = true;

        // Assertions
        const expectedTotal = 176200;
        if (Math.abs(result.total - expectedTotal) < 1) {
            console.log('✅ Total matches');
        } else {
            console.error(`❌ Total mismatch: got ${result.total}, expected ${expectedTotal}`);
            passed = false;
        }

        const expectedOrder = '00008906';
        if (result.numero_orden === expectedOrder) {
            console.log('✅ Order number matches');
        } else {
            console.error(`❌ Order number mismatch: got ${result.numero_orden}, expected ${expectedOrder}`);
            passed = false;
        }

        // Products check
        const expectedProducts = 9;
        if (result.productos.length >= expectedProducts) {
            console.log(`✅ Products count matches or exceeds (${result.productos.length})`);
        } else {
            console.error(`❌ Products count mismatch: got ${result.productos.length}, expected at least ${expectedProducts}`);
            passed = false;
        }

        const firstProduct = result.productos[0];
        if (firstProduct.cantidad === 1 && firstProduct.total === 18500) {
            console.log('✅ First product matches Qty/Total');
        } else {
            console.error('❌ First product mismatch', firstProduct);
            passed = false;
        }

        if (passed) console.log("🎉 ALL TESTS PASSED");

    } catch (err) {
        console.error('❌ Error during test execution:', err);
    }
}

main();
