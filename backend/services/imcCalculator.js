const calculateIMC = (weight, height) => {
  if (!weight || !height || weight <= 0 || height <= 0) return { imc: 0, category: '' };
  const heightInMeters = height / 100;
  const imc = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));

  let category = '';
  if (imc < 18.5) category = 'Abaixo do Peso';
  else if (imc < 25) category = 'Peso Normal';
  else if (imc < 30) category = 'Sobrepeso';
  else if (imc < 35) category = 'Obesidade Grau I';
  else if (imc < 40) category = 'Obesidade Grau II';
  else category = 'Obesidade Grau III';

  return { imc, category };
};

module.exports = { calculateIMC };
