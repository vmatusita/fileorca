// F19b (front T7; DECISOES § 780 and § 788): the guide to the credit card minimum payment in Spanish, for the Hispanic
// audience of the US: the English guide (front E7) translated and adapted, with the same keys, the same {placeholders} and
// the same structure. The calculator it embeds does not work out the minimum a statement asks for, and the guide never says
// it does. Every number comes from src/tools/calc/guides.ts (cases of the oracle), written in the Spanish format; no digit
// is typed here. The sources are the English CFPB pages, said "(en inglés)" (consumerfinance.gov/es/ redirects to English
// since July 2026), and the Spanish leaflet of the Federal Reserve on the credit card rules, which shows the minimum payment
// warning of a statement in Spanish.
import type { GuideTexts } from '../types.ts';

export default {
  title: 'Pago mínimo de la tarjeta de crédito: por qué tarda tanto',
  description: 'Por qué el saldo de una tarjeta casi no baja si el pago apenas cubre los intereses: un ejemplo junto a pagos fijos mayores, con las reglas del CFPB.',
  h1: 'Pago mínimo de la tarjeta de crédito: por qué tarda tanto',
  lead: 'Un pago apenas mayor que los intereses casi no deja nada para el saldo. Así se ve en una tarjeta.',
  intro: [
    'Todo estado de cuenta de una tarjeta de crédito pide un pago mínimo: lo que tienes que pagar antes de la fecha de vencimiento para que la cuenta no quede atrasada. Cada pago cubre primero los intereses del mes, y solo lo que sobra baja el saldo. Cuando el pago se acerca a los intereses, el saldo casi no se mueve, y el mes siguiente vuelve a cobrar intereses sobre casi el mismo monto.',
    'Esta guía hace las cuentas de una tarjeta con la calculadora de abajo: un saldo de {balance} con una tasa porcentual anual (APR) del {apr} y sin compras nuevas. La calculadora no da el mínimo que pide tu estado de cuenta, porque cada emisor de tarjetas tiene su propia fórmula para calcularlo. En cambio, la guía pone el pago que apenas cubre los intereses del primer mes al lado de pagos fijos mayores, y busca en el CFPB lo que un estado de cuenta tiene que decirte sobre pagar solo el mínimo.',
  ],
  calcHeading: 'Prueba un pago en esta tarjeta',
  calcIntro: 'La calculadora abre con el ejemplo de esta guía: {payment} al mes sobre {balance}. Escribe otro pago y mira cómo cambian los meses y los intereses; los números del texto de abajo salen del mismo motor.',
  sections: [
    {
      heading: 'Un pago igual a los intereses',
      paragraphs: [
        'En el primer mes, un saldo de {balance} al {apr} genera {firstInterest} de intereses. Un pago de exactamente ese monto cubre los intereses y deja el saldo donde estaba, mes tras mes. La calculadora avisa que con ese pago el saldo no baja y pide al menos {minimum} al mes.',
        'La Regulation Z, la regla del CFPB que fija, entre otras cosas, lo que debe mostrar el estado de cuenta de una tarjeta, también prevé este caso. Cuando los pagos mínimos no bajarían el saldo, el estado de cuenta tiene que advertir que, con solo el pago mínimo, la deuda nunca se termina de pagar, aunque no hagas más cargos con la tarjeta.',
      ],
    },
    {
      heading: 'Apenas por encima de los intereses',
      paragraphs: [
        'El primer pago en dólares enteros que supera esos intereses es {barely}. Con ese pago, el saldo baja {barelyToBalance} en el primer mes, y el resto se va en intereses. Después el saldo cae un poco, los intereses del mes siguiente caen con él, y la parte que queda para el saldo crece, despacio. La tarjeta se termina de pagar en {barelyTime}, después de {barelyCount} pagos.',
        'En esos años, los intereses suman {barelyInterest}, más de {barelyTimes} veces el saldo inicial, y los pagos llegan a {barelyPaid} en total. Los primeros pagos son casi solo intereses, y ahí se van los años.',
      ],
    },
    {
      heading: 'Unos pocos dólares más cambian mucho',
      paragraphs: [
        'Si subes el pago a {nextPayment}, la misma tarjeta queda saldada en {nextTime}, con {nextInterest} de intereses. Cada dólar que agregas va al saldo, así que el saldo baja antes, y cada mes que sigue cobra intereses sobre un saldo menor.',
        'La tabla de abajo muestra el mismo patrón hasta el pago más alto: cada pago mayor salda la tarjeta antes y con menos intereses que el anterior, y cada dólar agregado ahorra menos meses que los dólares anteriores. Cerca de los intereses, unos pocos dólares quitan años; más arriba, un dólar rinde mucho menos. Con {topPayment} al mes, la deuda desaparece en {topTime}, con {topInterest} de intereses.',
      ],
    },
    {
      heading: 'Por qué el mínimo del estado de cuenta es tan lento',
      paragraphs: [
        'El mínimo de un estado de cuenta real lo fija el emisor de la tarjeta, y las reglas cambian de un emisor a otro e incluso entre tarjetas del mismo emisor. En su informe sobre el mercado de tarjetas de crédito, el CFPB encontró que los emisores que analizó fijan el mínimo como un porcentaje del saldo del estado de cuenta, por lo común con los intereses y los cargos sumados aparte, y con un piso fijo en dólares.',
        'Con un mínimo armado así, la parte que baja el saldo es más o menos ese porcentaje del saldo. A medida que el saldo cae, esa parte también disminuye, así que cada mínimo le quita al saldo menos que el anterior, hasta que el mínimo llega al piso. La calculadora usa un solo pago para todos los meses y no sigue un mínimo que se achica; si escribes en ella tu mínimo actual, ves cuánto tarda ese monto si no cambia.',
      ],
    },
    {
      heading: 'El recuadro de tu estado de cuenta',
      paragraphs: [
        'La Regulation Z también obliga a los emisores a imprimir una advertencia de pago mínimo en el estado de cuenta de la tarjeta, fuera de algunos casos exentos: pagar solo el mínimo significa más intereses y más tiempo para saldar la deuda. Junto a ella, el estado de cuenta estima cuánto tiempo llevaría pagar el saldo actual con solo el mínimo y cuánto costaría en total, suponiendo que no hay cargos nuevos. Salvo que haya una excepción, como un mínimo que ya salda la deuda en {boxTime} o menos, también muestra el pago mensual que la saldaría en {boxTime}, el costo total de ese pago y cuánto ahorra.',
        'En la tarjeta de esta guía, según la calculadora, ese pago es de {boxPayment}, con {boxInterest} de intereses y {boxPaid} en total; el emisor hace su propia cuenta, así que el recuadro de un estado de cuenta real puede variar un poco. El ejemplo de {payment} queda justo por debajo y tarda {time}. El CFPB aclara que solo tienes que pagar el mínimo, no el monto del recuadro, y que el recuadro no tiene en cuenta las compras nuevas.',
      ],
    },
  ],
  tableHeading: 'Cada pago fijo: los meses y los intereses',
  tableIntro: 'Los mismos {balance} al {apr}, pagados con el mismo monto cada mes y sin compras nuevas. La segunda columna es lo que el primer pago le quita al saldo una vez cubiertos los {firstInterest} de intereses.',
  tableCaption: 'Para cada pago mensual fijo: lo que el primer pago le quita al saldo, el tiempo para saldar la tarjeta y los intereses totales',
  tableNote: 'Calculado con el motor de este sitio el {date}, mes a mes y en centavos. El saldo y la APR son ejemplos.',
  formulaHeading: 'La fórmula',
  formula: [
    'Cada mes: intereses = saldo × APR ÷ los meses del año, redondeados al centavo. Con el pago se cubren primero esos intereses; el saldo baja en pago − intereses, y los meses se cuentan hasta que un último pago deja el saldo en cero.',
    'Un pago fijo salda la tarjeta solo si es mayor que los intereses del primer mes. Para el pago que termina la deuda en un número fijo de meses, la calculadora hace la misma cuenta mes a mes y despeja el pago en lugar del tiempo.',
  ],
  premisesHeading: 'Supuestos',
  premises: [
    'No hay compras nuevas, cargos ni cambios de tasa mientras se paga la tarjeta, y cada pago llega a tiempo.',
    'Los intereses se cobran cada mes sobre el saldo. El CFPB explica que muchas compañías de tarjetas los calculan a diario sobre el saldo diario promedio, así que un estado de cuenta puede mostrar montos un poco distintos.',
    'El pago no cambia de un mes a otro, a diferencia del mínimo del estado de cuenta, que el emisor vuelve a calcular con cada saldo nuevo.',
  ],
  exampleHeading: 'Ejemplo resuelto',
  example: [
    'Tarjeta: {balance} al {apr}. Primer mes: {firstInterest} de intereses. Con {barely} al mes, el primer pago le quita {barelyToBalance} al saldo, y la tarjeta se salda en {barelyTime}, con {barelyInterest} de intereses. Con {payment} al mes, el primer pago le quita {toBalance}, y la tarjeta se salda en {count} pagos, {time}, con {interest} de intereses: {interestDiff} menos.',
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), Regulation Z, el estado de cuenta periódico, con las estimaciones de pago y la advertencia de pago mínimo (en inglés)',
      href: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/7/',
    },
    {
      label: 'Consejo de Gobernadores de la Reserva Federal, "Lo que necesita saber: nuevas reglas para las tarjetas de crédito", con la advertencia de pago mínimo del estado de cuenta (PDF, en español)',
      href: 'https://www.federalreserve.gov/consumerinfo/files/wyntk_ccrules_sp.pdf',
    },
    {
      label: 'CFPB, qué significa el recuadro del estado de cuenta que dice cuánto pagar al mes para terminar de pagar la deuda, si hay que pagar ese monto y qué pasa con las compras nuevas (en inglés)',
      href: 'https://www.consumerfinance.gov/ask-cfpb/a-box-on-my-credit-card-bill-says-that-i-will-pay-off-the-balance-in-three-years-if-i-pay-a-certain-amount-what-does-that-mean-do-i-have-to-pay-that-much-if-i-pay-that-much-and-make-new-purchases-will-i-still-owe-nothing-after-three-years-en-36/',
    },
    {
      label: 'CFPB, informe sobre el mercado de tarjetas de crédito para el consumidor, con la parte sobre el pago mínimo (PDF, en inglés)',
      href: 'https://files.consumerfinance.gov/f/documents/cfpb_consumer-credit-card-market-report_2023.pdf',
    },
    {
      label: 'CFPB, cómo calcula la compañía de tu tarjeta de crédito los intereses que debes (en inglés)',
      href: 'https://www.consumerfinance.gov/ask-cfpb/how-does-my-credit-card-company-calculate-the-amount-of-interest-i-owe-en-51/',
    },
  ],
  disclaimerHeading: 'Guía educativa',
  disclaimer: 'Esta guía es educativa, no asesoría financiera. El contrato y el estado de cuenta de tu tarjeta fijan el pago mínimo y los intereses que te cobran.',
  relatedHeading: 'Calculadoras para el siguiente paso',
  words: { head: ['Pago al mes', 'Primer mes, al saldo', 'Se termina de pagar en', 'Intereses totales'] },
} satisfies GuideTexts<'guides-credit-card-minimum-payment'>;
