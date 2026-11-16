// F19b (decision 5): guide 8 in Spanish, for the Hispanic audience of the US: the same engines, example, placeholders and
// structure as the English text (src/i18n/en/guide-how-much-house-can-i-afford.ts), with the terms of docs/i18n/es.md and of
// the Spanish calculator. Every number is a {placeholder} the engines fill at build (src/tools/calc/guides.ts, howMuchHouse);
// no digit is typed here. The 28% is the "regla de oro" of the CFPB toolkit in Spanish (page 4 of the print, 6 of the PDF),
// quoted through {front}; no source below gives the 36%. The {front}/{back} pair is said in one part only (the repetition gate).
import type { GuideTexts } from '../types.ts';

export default {
  title: 'Cuánta casa puedo pagar con mi ingreso: qué límite fija el precio',
  description: 'Cómo dos partes de tu ingreso se convierten en el precio de una vivienda, cuál de ellas lo fija y cómo lo mueven tus otras deudas, con un ejemplo.',
  words: {
    head: ['Otras deudas al mes', 'Límite que fija el precio', 'Margen para la vivienda', 'Precio de vivienda que puedes pagar'],
    front: 'Límite de vivienda, {rate}',
    back: 'Límite de deuda total, {rate}',
    both: 'Los dos límites',
  },
  h1: 'Cuánta casa puedo pagar con mi ingreso',
  lead: 'Dos partes de tu ingreso ponen un tope al pago de la vivienda. La que deja menos margen fija el precio.',
  intro: [
    'El precio de una vivienda parte de un pago mensual, y el pago parte de tu ingreso. La calculadora de abajo fija dos límites, cada uno una parte de tu ingreso mensual bruto: el límite de vivienda, solo para la vivienda, y el límite de deuda total, para la vivienda y tus otras deudas. El que deja menos margen limita el pago, y el pago limita el préstamo.',
    'Esta guía sigue a un hogar con el motor de la calculadora: {income} al año antes de impuestos, {debts} al mes de otras deudas, {down} de pago inicial, un préstamo de tasa fija a {term} con una tasa de ejemplo del {rate}, {tax} al año de impuestos sobre la propiedad, {insurance} de seguro y ninguna cuota de la asociación de propietarios (HOA). Con los dos límites iniciales, el precio llega a {price}.',
  ],
  calcHeading: 'Prueba con tus números',
  calcIntro: 'La calculadora empieza con este ejemplo, y cada número de la guía sale del mismo motor. Cambia las deudas o los límites y mira cuál fija el precio.',
  sections: [
    {
      heading: 'Dos límites, dos márgenes',
      paragraphs: [
        'El límite de vivienda toma el {front} de la doceava parte de {income}, lo que da {frontCap} al mes. Ese margen tiene que alcanzar para el capital, los intereses, los impuestos sobre la propiedad, el seguro de la vivienda y la cuota de HOA, si la hay. El CFPB agrupa el capital, los intereses, los impuestos y el seguro con la sigla PITI: las partes básicas de un pago hipotecario mensual.',
        'El límite de deuda total toma el {back} del mismo ingreso mensual, {backTotal}, y ese margen tiene que alcanzar para la vivienda y para todo lo demás que pagas de deudas cada mes. Al restar los {debts} de otras deudas, quedan {backCap} para la vivienda. Este límite pone un tope a la relación deudas-ingresos (DTI), que el CFPB define como todos los pagos mensuales de deudas divididos entre el ingreso mensual bruto.',
      ],
    },
    {
      heading: 'Qué límite fija el precio',
      paragraphs: [
        'En el ejemplo, el límite de vivienda deja {frontCap} y el límite de deuda total deja {backCap}, así que el de vivienda es el más estrecho y fija el precio. Primero salen de ese margen los impuestos de un mes, {taxMonth}, y el seguro de un mes, {insuranceMonth}. Lo que queda, {maxPI} al mes, va al capital y los intereses.',
        'Al {rate} a {term}, un pago de {maxPI} alcanza para un préstamo de {loan}. Con los {down} de pago inicial, el precio es {price}.',
        'Al límite de deuda total todavía le sobran {room} al mes. Las otras deudas podrían crecer esa cantidad antes de que ese límite pasara a ser el más estrecho: con {sameRoomDebts} al mes de deudas, los dos límites dejan el mismo margen.',
      ],
    },
    {
      heading: 'Qué hacen las otras deudas, y cuándo',
      paragraphs: [
        'Mientras el límite de vivienda fija el precio, las otras deudas no lo tocan. Sin ninguna otra deuda, el precio sigue siendo {noDebtsPrice}. Terminar de pagar las deudas de {debts} al mes dejaría ese dinero libre cada mes, pero con estos límites no subiría el precio.',
        'Por encima de {sameRoomDebts}, cada dólar de otra deuda sale del margen para la vivienda. Con {stepDebts} al mes de deudas, el precio es {stepPrice}; con {stepExtra} más, es {stepExtraPrice}, o sea, {stepDrop} menos. La tabla sigue ese ritmo: desde ese punto, cada {stepExtra} al mes de deudas le quita al precio unos {stepDrop}.',
        'El ritmo sale del préstamo. Al {rate} a {term}, {stepExtra} al mes es el pago de unos {stepDrop} de préstamo, así que, cuando el límite de deuda total es el más estrecho, el pago de un préstamo para auto de ese monto le quita esa cantidad al préstamo.',
      ],
    },
    {
      heading: 'Los costos de la vivienda también cuentan',
      paragraphs: [
        'Los impuestos sobre la propiedad, el seguro y la cuota de HOA salen del margen antes que el préstamo, con cualquiera de los dos límites. Una vivienda con impuestos o cuotas mensuales más altos deja un pago menor para el préstamo, así que el mismo ingreso llega a un precio más bajo. La fórmula de abajo muestra dónde entra cada uno.',
        'La tasa actúa del otro lado, en cuánto rinde un pago. Con una tasa más alta, una parte mayor de los mismos {maxPI} se va en intereses, así que alcanzan para un préstamo más pequeño, y el precio baja con él.',
      ],
    },
    {
      heading: 'Lo que los límites dejan fuera',
      paragraphs: [
        'La cuenta termina en el pago mensual. Deja fuera el seguro hipotecario privado (PMI), que según el CFPB es probable con un pago inicial pequeño, y los costos de cierre, que el CFPB sugiere restar de tus ahorros antes de decidir el pago inicial. Cualquiera de los dos puede bajar el precio que cabe.',
        'Los límites tampoco dicen nada de los servicios públicos, las reparaciones, el mantenimiento ni el ahorro para emergencias, que el CFPB pone entre los gastos que hay que planear antes de elegir un precio. Muestran lo que un ingreso puede cubrir según dos proporciones, no lo que a un hogar le resulta cómodo gastar.',
      ],
    },
    {
      heading: 'Reglas generales, no una ley',
      paragraphs: [
        'La calculadora parte del {front} para la vivienda y del {back} para todas las deudas, reglas generales comunes y no una ley. El conjunto de herramientas del CFPB para préstamos hipotecarios presenta la primera como una "regla de oro": un pago hipotecario mensual total, con el seguro hipotecario incluido, que no pase de esa parte de tu ingreso mensual antes de impuestos. Ninguna de las páginas del CFPB que cita esta guía da la segunda. La página del CFPB sobre la relación deudas-ingresos no da una cifra única: dice que cada producto de préstamo y cada prestamista tiene sus propios límites.',
        'Por eso un prestamista puede responder con otro precio. El mismo conjunto de herramientas dice que un prestamista puede aprobarte más o menos dinero según el conjunto de tu situación financiera, y un prestamista puede contar costos que la calculadora deja fuera. Si tu prestamista te da sus propios límites, escríbelos en los dos campos de límite y el precio cambia con ellos.',
      ],
    },
  ],
  tableHeading: 'El precio según las otras deudas al mes',
  tableIntro: 'El mismo hogar con distintos pagos de otras deudas cada mes. El límite de vivienda fija el precio en las primeras filas, y el límite de deuda total en las demás.',
  tableCaption: 'Límite que fija el precio, margen para la vivienda y precio de la vivienda, según las otras deudas al mes',
  tableNote: 'Calculado con el motor de este sitio el {date}. La tasa y los costos de la vivienda son ejemplos.',
  formulaHeading: 'La fórmula',
  formula: [
    'Ingreso mensual = la doceava parte del ingreso anual bruto. Margen de vivienda = ingreso mensual × límite de vivienda. Margen de deuda = ingreso mensual × límite de deuda total − otras deudas al mes. El menor de los dos márgenes es lo máximo que la vivienda puede costar al mes.',
    'Pago para el préstamo M = ese margen − la doceava parte de los impuestos sobre la propiedad del año − la doceava parte del seguro del año − la cuota de HOA de cada mes. El préstamo más grande L es el que M termina de pagar en pagos mensuales iguales durante el plazo, a una tasa mensual igual a la doceava parte de la tasa anual. Precio = L + pago inicial.',
  ],
  premisesHeading: 'Supuestos',
  premises: [
    'Los dos límites son partes del ingreso bruto, antes de impuestos. La calculadora empieza con los valores de esta guía; cada prestamista y cada programa de préstamos fija los suyos.',
    'Las otras deudas son sus pagos mensuales: un préstamo para auto, préstamos estudiantiles, el mínimo de una tarjeta.',
    'Una tasa fija y pagos mensuales iguales durante todo el plazo. La tasa, los impuestos y el seguro son ejemplos, no ofertas de un prestamista.',
    'Sin seguro hipotecario privado, costos de cierre ni reservas de efectivo, y sin cuota de HOA en el ejemplo.',
    'Cada margen y el préstamo más grande se redondean hacia abajo al centavo, como en la calculadora; los préstamos y los precios se muestran en dólares enteros.',
  ],
  exampleHeading: 'Ejemplo resuelto',
  example: [
    'Ingreso de {income} al año, otras deudas de {debts} al mes. Margen de vivienda: {frontCap}. Margen de deuda: {backTotal} − {debts} = {backCap}. El menor es {frontCap}; menos {taxMonth} de impuestos y {insuranceMonth} de seguro, quedan {maxPI}. Préstamo más grande, a {term} al {rate}: {loan}. Precio: {loan} + {down} = {price}.',
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), "Su conjunto de herramientas para préstamos hipotecarios: Guía paso a paso", con el pago hipotecario mensual total, la regla de oro sobre el ingreso, el seguro hipotecario privado (PMI) y lo que queda después de las deudas (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/documents/cfpb_your-home-loan-toolkit_es.pdf',
    },
    {
      label: 'CFPB, qué es la relación deudas-ingresos (DTI) (en inglés)',
      href: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-debt-to-income-ratio-why-is-the-43-debt-to-income-ratio-important-en-1791/',
    },
    {
      label: 'CFPB, cuánto quieres gastar en una vivienda: el pago inicial, los costos de cierre y los gastos de la vivienda (en inglés)',
      href: 'https://www.consumerfinance.gov/owning-a-home/prepare/figure-out-how-much-you-want-to-spend/',
    },
    { label: 'CFPB, qué es el PITI: capital, intereses, impuestos y seguro (en inglés)', href: 'https://www.consumerfinance.gov/ask-cfpb/what-is-piti-en-152/' },
  ],
  disclaimerHeading: 'Guía educativa',
  disclaimer: 'Esta guía es educativa, no asesoría financiera ni la aprobación de un préstamo. Un prestamista decide cuánto te presta, a qué tasa y con qué límites.',
  relatedHeading: 'Calculadoras para el siguiente paso',
} satisfies GuideTexts<'guides-how-much-house-can-i-afford'>;
