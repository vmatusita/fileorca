import type { GuideTexts } from '../types.ts';

export default {
  title: 'Hipoteca a 15 o 30 años: el costo real de cada plazo',
  description: 'Lo que cuesta al mes una hipoteca a 15 años y lo que ahorra en intereses frente a una a 30 años, calculado pago a pago con varias tasas y una calculadora.',
  h1: 'Hipoteca a 15 o 30 años: el costo real',
  lead: 'El plazo corto pide más cada mes y devuelve mucho más en intereses. Aquí está cuánto, con los números calculados.',
  intro: [
    'Quienes compran vivienda en Estados Unidos con una tasa fija suelen elegir entre dos plazos: 15 años y 30 años. La pregunta parece simple, pero las dos respuestas tiran hacia lados opuestos. El préstamo a 30 años mantiene bajo el pago mensual; el préstamo a 15 años termina de pagar la casa en la mitad del tiempo y cobra muchos menos intereses en el camino.',
    'Esta guía pasa los dos préstamos por el mismo motor de la calculadora de abajo, con una vivienda de ejemplo: un precio de {price} con {down} de pago inicial, es decir, un préstamo de {loan}, a una tasa de ejemplo del {rate} en los dos plazos. Cambia cualquier número en la calculadora para ver tu propio caso.',
  ],
  calcHeading: 'Prueba los dos plazos',
  calcIntro: 'La calculadora empieza con el ejemplo de esta guía. Cada número del texto de abajo sale del mismo motor.',
  sections: [
    {
      heading: 'El pago mensual',
      paragraphs: [
        'Al {rate}, el préstamo a 30 años cuesta {p30} al mes de capital e intereses. El préstamo a 15 años cuesta {p15}: {more} más cada mes. Los impuestos, el seguro y el PMI, si lo hay, se suman a los dos y son iguales en ambos plazos, así que no cambian la comparación.',
        'El pago a 15 años no es el doble del pago a 30 años, aunque el tiempo se reduce a la mitad. En los primeros años de un préstamo a 30 años, la mayor parte de cada pago son intereses; reducir el tiempo a la mitad elimina gran parte de esos intereses, así que el pago sube mucho menos de lo que podrías esperar.',
      ],
    },
    {
      heading: 'Los intereses durante la vida del préstamo',
      paragraphs: [
        'En 30 años se pagan {i30} de intereses, para un total de {paid30}. En 15 años los intereses son {i15}, para un total de {paid15}. El plazo corto ahorra {saved} de intereses por la misma casa.',
        'La razón es el saldo. Los intereses se cobran cada mes sobre lo que aún se debe, y el préstamo a 15 años baja ese saldo mucho más rápido. Después de cinco años, quien tiene el préstamo a 15 años ya pagó {paidDown15y5} de capital y todavía debe {balance15y5}; quien tiene el de 30 años ya pagó {paidDown30y5} y todavía debe {balance30y5}. A la mitad de su plazo, en el año 15, al préstamo a 30 años todavía le quedan {balance30y15}.',
      ],
    },
    {
      heading: 'Cuando la tasa a 15 años es más baja',
      paragraphs: [
        'Los prestamistas suelen ofrecer una tasa más baja para el plazo corto, porque su dinero queda prestado menos tiempo. Eso agranda la diferencia de intereses. Si el préstamo a 15 años del ejemplo tuviera una tasa del {lowerRate} y el de 30 años siguiera al {rate}, el pago a 15 años sería de {lowerP15}, {lowerMore} más que el de 30 años, y el ahorro de intereses crecería a {lowerSaved}.',
        'Usa en la calculadora de arriba las tasas de tus propias Estimaciones de Préstamo. Los valores con los que empieza son ejemplos, no ofertas. El CFPB aconseja pedir una Estimación de Préstamo a por lo menos tres prestamistas: es un formulario estándar, así que la tasa, el pago y los costos de cierre de la primera página se pueden comparar línea por línea, también entre los dos plazos.',
      ],
    },
    {
      heading: 'Lo que te cuesta el plazo corto',
      paragraphs: [
        'El precio del préstamo a 15 años es la flexibilidad. Un pago {more} más alto cada mes es dinero que no puede ir a un fondo de emergencia, al ahorro para la jubilación ni a deudas con una tasa más alta. Si tus ingresos bajan durante unos meses, un pago fijo más grande es más difícil de cumplir.',
        'Un camino intermedio es tomar el préstamo a 30 años y pagar de más cuando puedas. Mantienes el pago obligatorio más bajo y aun así acortas el préstamo. La calculadora de pagos adicionales muestra cuánto ahorra un monto adicional fijo cada mes en el mismo préstamo; un préstamo sin multa por pago anticipado te deja hacerlo en cualquier momento.',
      ],
    },
  ],
  tableHeading: 'Los dos plazos con cinco tasas',
  tableIntro: 'El mismo préstamo de {loan}, con los dos plazos a la misma tasa, para que la tabla muestre solo el efecto del plazo. Los intereses son el total durante la vida de cada préstamo.',
  tableCaption: 'Pago mensual y total de intereses de un préstamo a 15 años y uno a 30 años con cinco tasas de ejemplo',
  tableNote: 'Calculado con el motor de este sitio el {date}, mes a mes y en centavos. Las tasas son ejemplos, no ofertas.',
  formulaHeading: 'La fórmula',
  formula: [
    'Cada pago es M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), donde P es el préstamo, r es la tasa anual dividida entre 12 y n es 180 o 360 pagos.',
    'Cada mes, los intereses son el saldo por r, redondeados al centavo, y el resto del pago reduce el saldo. El último pago es lo que falte para cerrarlo.',
  ],
  premisesHeading: 'Supuestos',
  premises: [
    'Los dos préstamos son de tasa fija, con pagos mensuales iguales, por el mismo monto.',
    'Los impuestos, el seguro, el PMI y los costos de cierre quedan fuera: son iguales en los dos plazos.',
    'Las tasas son ejemplos elegidos para esta guía; tu prestamista te da la tuya.',
  ],
  exampleHeading: 'Ejemplo resuelto',
  example: [
    'Préstamo de {loan} al {rate}. Treinta años: {p30} al mes y {i30} de intereses. Quince años: {p15} al mes y {i15} de intereses. Diferencia: {more} más al mes con el préstamo a 15 años, que paga {saved} menos de intereses.',
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), "Su conjunto de herramientas para préstamos hipotecarios: Guía paso a paso", con cómo pedir y comparar por lo menos tres Estimaciones de Préstamo (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/documents/cfpb_your-home-loan-toolkit_es.pdf',
    },
    {
      label: 'CFPB, Regulation Z, formulario H-28(B), muestra de la Estimación de Préstamo, con la tasa, el pago y los costos de cierre en la primera página (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/201403_cfpb_loanestimate_spanish_H28B.pdf',
    },
    { label: 'Corporación Federal de Seguro de Depósitos (FDIC), "Hipotecas", con los plazos de 15, 20 o 30 años de los préstamos de tasa fija (en español)', href: 'https://www.fdic.gov/espanol/hipotecas' },
    { label: 'CFPB, Regulation Z, Apéndice H, los formularios de la Estimación de Préstamo, con la muestra H-24(B) de tasa fija (en inglés)', href: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/h/' },
  ],
  disclaimerHeading: 'Guía educativa',
  disclaimer: 'Esta guía es educativa, no asesoría financiera ni una oferta de préstamo. Tu prestamista fija tu tasa y tu pago.',
  relatedHeading: 'Calculadoras para el siguiente paso',
  words: { head: ['Tasa', 'Pago a 15 años', 'Pago a 30 años', 'Intereses a 15 años', 'Intereses a 30 años', 'Intereses ahorrados'] },
} satisfies GuideTexts<'guides-15-vs-30-year-mortgage'>;
