import type { GuideTexts } from '../types.ts';

export default {
  title: 'Punto de equilibrio del refinanciamiento: cómo hallar tu mes',
  description: 'Dos formas de hallar el mes en que un refinanciamiento recupera sus costos de cierre, por qué no coinciden si cambia el plazo, y una calculadora para tu préstamo.',
  h1: 'Refinanciamiento: halla tu mes de equilibrio',
  lead: 'Una tasa más baja ahorra dinero solo después de recuperar lo que costó obtenerla. Así se encuentra ese mes, con un atajo común que puede confundir.',
  intro: [
    'Refinanciar reemplaza tu hipoteca por un préstamo nuevo, por lo general a una tasa más baja, y ese préstamo nuevo trae costos de cierre: la tasación, el título, los cargos del prestamista. El mes de equilibrio es cuando lo que ahorras ya pagó esos costos. Antes de ese mes, refinanciar te costó dinero; después, empieza a ahorrar.',
    'Esta guía resuelve un ejemplo con el motor de la calculadora de abajo: {balance} que aún se deben al {rate}, con {left} por delante, refinanciados en un préstamo nuevo a {newTerm} a una tasa de ejemplo del {newRate}, con {costs} de costos de cierre pagados al cierre.',
  ],
  calcHeading: 'Halla el equilibrio de tu préstamo',
  calcIntro: 'La calculadora empieza con el ejemplo de esta guía. Cada número del texto de abajo sale del mismo motor.',
  sections: [
    {
      heading: 'El atajo: los costos de cierre divididos entre el ahorro mensual',
      paragraphs: [
        'El pago actual es de {currentPayment}; el nuevo sería de {newPayment}, así que el pago baja {savings} al mes. La regla habitual divide los costos de cierre entre esa baja: {costs} ÷ {savings} da el mes {simple}. La guía de refinanciamiento de la Reserva Federal usa esta clase de división para saber cuánto tiempo toma recuperar los costos, y el CFPB también pide pensar cuánto tardan los ahorros mensuales en pagar el costo de refinanciar.',
        'El atajo es rápido, y funciona bien cuando el préstamo nuevo tiene el mismo plazo que le queda al anterior. Cuando el plazo cambia, puede confundir, porque parte de un pago más bajo viene de repartir la misma deuda en más años, no de pagar menos intereses.',
      ],
    },
    {
      heading: 'Contar intereses en lugar de pagos',
      paragraphs: [
        'Una prueba más estricta pregunta cuándo los intereses que evitas ya cubrieron los costos de cierre. Cada mes, suma los intereses pagados hasta entonces en el préstamo nuevo, más los costos de cierre, y compara el total con los intereses que el préstamo actual habría cobrado hasta ese momento. En el ejemplo eso pasa en el mes {breakEven}, más tarde de lo que dice el atajo.',
        'Durante toda la vida de los préstamos, el panorama cambia otra vez. El préstamo nuevo cobra {newInterest} de intereses contra {currentInterest} del actual, un ahorro de solo {interestDiff}, porque dura cinco años más. Contando los costos de cierre, el préstamo nuevo cuesta {costDiff} más en total, aunque el pago sea más bajo cada mes.',
      ],
    },
    {
      heading: 'Mantener el mismo plazo',
      paragraphs: [
        'Si el préstamo nuevo durara 25 años, lo mismo que le queda al actual, el pago sería de {sameTermPayment}, una baja de solo {sameTermSavings} al mes. El atajo diría ahora el mes {sameTermSimple}. Contando intereses, el equilibrio llega en el mes {sameTermBreakEven}, y durante la vida del préstamo los intereses bajan {sameTermInterest}.',
        'Así que el atajo puede equivocarse en las dos direcciones: parecía demasiado bueno con el préstamo más largo y demasiado pesimista con el mismo plazo. La prueba de intereses da la misma respuesta, sea cual sea la dirección en que se mueva el pago.',
      ],
    },
    {
      heading: 'Pagar los costos o sumarlos al préstamo',
      paragraphs: [
        'Muchos prestamistas te dejan sumar los costos de cierre al nuevo saldo, u ofrecen un préstamo sin costos de cierre con una tasa más alta. El CFPB señala que, de una forma o de otra, los costos no desaparecen. En el ejemplo, sumar los {costs} al préstamo sube el pago a {rolledPayment} y lleva el equilibrio por intereses al mes {rolledBreakEven}, porque ahora también pagas intereses sobre los costos.',
        'Sea cual sea el método, compara el equilibrio con el tiempo que piensas quedarte con la vivienda. Si podrías vender antes, lo más probable es que refinanciar cueste más de lo que ahorra.',
      ],
    },
  ],
  tableHeading: 'Equilibrio según los costos de cierre y la nueva tasa',
  tableIntro: 'El mismo saldo de {balance} al {rate} con {left} por delante, refinanciado en un préstamo a 30 años. El atajo y la prueba de intereses, uno al lado del otro.',
  tableCaption: 'Ahorro mensual y mes de equilibrio según los costos de cierre y la nueva tasa, con los dos métodos',
  tableNote: 'Calculado con el motor de este sitio el {date}, mes a mes y en centavos. Las tasas son ejemplos.',
  formulaHeading: 'Los dos métodos',
  formula: [
    'Atajo: mes de equilibrio = costos de cierre ÷ (pago actual − pago nuevo), redondeado hacia arriba.',
    'Prueba de intereses: el primer mes m en que los costos de cierre más los intereses pagados en el préstamo nuevo hasta el mes m son menores o iguales que los intereses que el préstamo actual habría cobrado hasta el mes m. Cada pago es M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), y cada mes los intereses son el saldo por r, redondeados al centavo.',
  ],
  premisesHeading: 'Supuestos',
  premises: [
    'Los dos préstamos son de tasa fija, con pagos mensuales iguales; el pago actual se calcula a partir del saldo, la tasa y los meses que quedan.',
    'Sin multa por pago anticipado, sin efecto en los impuestos y sin cambios en la cuenta de depósito en garantía.',
    'Las tasas y los costos son ejemplos elegidos para esta guía.',
  ],
  exampleHeading: 'Ejemplo resuelto',
  example: [
    'Préstamo actual: {balance} al {rate}, con {left} por delante, {currentPayment} al mes. Préstamo nuevo: {newTerm} al {newRate}, {newPayment} al mes y {costs} de costos de cierre. Atajo: mes {simple}. Prueba de intereses: mes {breakEven}.',
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), "Su conjunto de herramientas para préstamos hipotecarios: Guía paso a paso", con el costo de refinanciar, el tiempo para recuperarlo y la tasa más alta a cambio de un crédito del prestamista (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/documents/cfpb_your-home-loan-toolkit_es.pdf',
    },
    {
      label: 'CFPB, Regulation Z, formulario H-28(C), muestra de la Estimación de Préstamo de un refinanciamiento, con los costos de cierre (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/201403_cfpb_loanestimate_spanish_H28C.pdf',
    },
    { label: 'Reserva Federal, guía del consumidor sobre el refinanciamiento de hipotecas (en inglés)', href: 'https://www.federalreserve.gov/pubs/refinancings/' },
    {
      label: 'CFPB, si existe un préstamo o un refinanciamiento sin costos de cierre (en inglés)',
      href: 'https://www.consumerfinance.gov/ask-cfpb/is-there-such-a-thing-as-a-no-cost-or-no-closing-loan-or-refinancing-en-141/',
    },
  ],
  disclaimerHeading: 'Guía educativa',
  disclaimer: 'Esta guía es educativa, no asesoría financiera ni una oferta de préstamo. Un prestamista decide si calificas y con qué tasa y costos.',
  relatedHeading: 'Calculadoras para el siguiente paso',
  words: {
    head: ['Costos de cierre', 'Nueva tasa', 'Ahorro mensual', 'Atajo: costos ÷ ahorro', 'Equilibrio por intereses'],
    month: 'mes {n}',
    never: 'nunca',
  },
} satisfies GuideTexts<'guides-refinance-break-even'>;
