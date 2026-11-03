import type { GuideTexts } from '../types.ts';

export default {
  title: 'Alquilar o comprar: cuándo empieza a convenir comprar una vivienda',
  description: 'El año en que comprar una vivienda alcanza a alquilar, cómo lo mueven el valor de las viviendas y el rendimiento de los ahorros, y una calculadora para tus números.',
  h1: 'Alquilar o comprar: cuándo empieza a convenir comprar',
  lead: 'Comprar cuesta más al principio y puede salir ganando después. La pregunta es cuándo, y depende de números que nadie conoce de antemano.',
  intro: [
    'Alquilar y comprar son dos formas de pagar por un lugar donde vivir, y ninguna es siempre más barata. Comprar inmoviliza un pago inicial y suma costos que quien alquila nunca ve: intereses, impuestos sobre la propiedad, seguro, mantenimiento y, algún día, el costo de vender. Alquilar deja ese dinero libre para invertirlo. Con el tiempo, la vivienda puede subir de valor y el alquiler puede aumentar, y en algún momento quien compró puede quedar por delante.',
    'Esta guía sigue un ejemplo con el motor de la calculadora de abajo: una vivienda de {price} con {down} de pago inicial a una tasa de ejemplo del {rate}, frente a una vivienda parecida alquilada por {rent} al mes. Los otros valores del ejemplo son {tax} de impuestos sobre la propiedad y {insurance} de seguro al año, un mantenimiento del {upkeep} del valor al año, viviendas que suben de valor un {appreciation} al año, un alquiler que sube un {rentIncrease} al año, un costo de venta del {selling} y ahorros que rinden un {return} al año.',
  ],
  calcHeading: 'Compara alquilar y comprar',
  calcIntro: 'La calculadora empieza con el ejemplo de esta guía. Cada número del texto de abajo sale del mismo motor.',
  sections: [
    {
      heading: 'Cómo se comparan los dos caminos',
      paragraphs: [
        'Cada mes, quien compra paga la hipoteca, los impuestos, el seguro y el mantenimiento, y quien alquila paga el alquiler. El que gasta menos ese mes invierte la diferencia, así que la comparación es justa: ninguno de los dos puede gastar dinero que el otro tiene que apartar. Quien alquila también empieza con el pago inicial invertido.',
        'Al final de cada año, quien compró tiene lo que obtendría al vender la vivienda, menos el costo de venta y lo que aún debe del préstamo, más sus ahorros. Quien alquila tiene sus ahorros. Comprar alcanza a alquilar en el primer año en que vale por lo menos lo mismo que alquilar.',
      ],
    },
    {
      heading: 'El ejemplo, año por año',
      paragraphs: [
        'El pago de la hipoteca es de {payment} de capital e intereses. Después del primer año, comprar vale {firstYearBuyer} y alquilar, {firstYearRenter}: quien compró va atrás, sobre todo porque vender costaría el {selling} del valor y los primeros pagos son casi todo intereses.',
        'La diferencia se cierra a medida que la vivienda sube de valor y baja el saldo del préstamo. En este ejemplo, comprar alcanza a alquilar en el {breakEven}. Después de {years} años, comprar deja {buyer} y alquilar, {renter}. En el camino, quien compró paga {ownerCost} por la vivienda y quien alquila paga {rentPaid} de alquiler.',
      ],
    },
    {
      heading: 'Los dos números que más mueven la respuesta',
      paragraphs: [
        'El aumento del valor de la vivienda y el rendimiento de las inversiones deciden la mayor parte del resultado, y los dos son suposiciones sobre el futuro. La tabla de abajo mantiene todo lo demás del ejemplo y cambia esos dos números en un horizonte de 30 años. Cuando las viviendas suben de valor más rápido, comprar alcanza antes; cuando los ahorros rinden más, alquilar mantiene su ventaja por más tiempo, y con el rendimiento más alto de la tabla comprar solo alcanza si las viviendas suben de valor rápido.',
        'Con viviendas que no suben de valor, en el ejemplo comprar solo alcanza a alquilar en el {flatBreakEven}. Ninguna tasa de esta tabla es un pronóstico. El CFPB advierte que las calculadoras como esta se basan en suposiciones sobre la economía y sugiere probar varios escenarios, que es lo que hace la tabla.',
      ],
    },
    {
      heading: 'Lo que los números dejan fuera',
      paragraphs: [
        'Los impuestos quedan fuera: la deducción de los intereses de la hipoteca y el impuesto sobre las ganancias de capital dependen de tu situación, y el CFPB sugiere consultar a un asesor financiero o fiscal. También quedan fuera los costos de cierre de la compra, los costos de mudanza y el valor de la estabilidad o de la flexibilidad. Si podrías mudarte en pocos años, alquilar suele dejarte más opciones; si piensas quedarte mucho tiempo, comprar tiene más años para alcanzar a alquilar.',
      ],
    },
  ],
  tableHeading: 'Cuándo comprar alcanza a alquilar, según el valor de la vivienda y el rendimiento',
  tableIntro: 'El ejemplo de esta guía en un horizonte de 30 años, con la variación anual del valor de la vivienda (filas) y el rendimiento anual de los ahorros (columnas) cambiados.',
  tableCaption: 'El año en que comprar alcanza a alquilar, según la variación del valor de la vivienda y el rendimiento de los ahorros',
  tableNote: 'Calculado con el motor de este sitio el {date}, mes a mes y en centavos. Las tasas son ejemplos, no pronósticos.',
  formulaHeading: 'El método',
  formula: [
    'Costo mensual de quien compra = pago de la hipoteca + impuestos ÷ 12 + seguro ÷ 12 + cuota de la asociación de propietarios (HOA) + valor × mantenimiento ÷ 12. El camino más barato ahorra la diferencia; los ahorros crecen cada mes según el rendimiento anual ÷ 12.',
    'Al final de cada año: comprar = valor × (1 − costo de venta) − saldo del préstamo + ahorros; alquilar = ahorros. El valor de la vivienda y el alquiler cambian una vez al año según sus tasas.',
  ],
  premisesHeading: 'Supuestos',
  premises: [
    'Una hipoteca de tasa fija; los impuestos, el seguro y la cuota de HOA se mantienen en los montos que escribes.',
    'Los dos caminos invierten lo que ahorran, con el mismo rendimiento.',
    'Sin impuesto sobre la renta, deducciones, impuesto sobre las ganancias de capital ni costos de cierre de la compra.',
  ],
  exampleHeading: 'Ejemplo resuelto',
  example: [
    'Vivienda de {price}, {down} de pago inicial, tasa del {rate}, alquiler de {rent}. Comprar alcanza a alquilar en el {breakEven}. Después de {years} años: comprar {buyer}, alquilar {renter}.',
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), "¿Listo para comprar una casa?", con los costos de ser propietario, la mudanza y los costos de cierre (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/documents/cfpb_ready-to-buy-a-home_handout_es.pdf',
    },
    {
      label: 'CFPB, piensa si es el momento adecuado para comprar, con la flexibilidad de alquilar y los escenarios de las calculadoras (en inglés)',
      href: 'https://www.consumerfinance.gov/owning-a-home/prepare/consider-whether-its-the-right-time-for-you-to-buy/',
    },
    {
      label: 'CFPB, algunas consideraciones financieras de comprar una vivienda, con la consulta a un asesor financiero o fiscal (en inglés)',
      href: 'https://www.consumerfinance.gov/ask-cfpb/what-are-some-of-the-financial-considerations-of-buying-a-home-en-119/',
    },
  ],
  disclaimerHeading: 'Guía educativa',
  disclaimer: 'Esta guía es educativa, no asesoría financiera. Se basa en tasas elegidas para el ejemplo, y las tasas futuras no se conocen.',
  relatedHeading: 'Calculadoras para el siguiente paso',
  words: { head: 'Variación anual del valor de la vivienda', savings: 'Ahorros al {rate}', year: 'año {n}', notWithin: 'no alcanza en 30 años' },
} satisfies GuideTexts<'guides-rent-vs-buy-break-even'>;
