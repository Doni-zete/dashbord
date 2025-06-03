// js/quotes.js

export async function displayDailyQuote(elementId) {
  const motivationalQuoteElement = document.getElementById(elementId);
  try {
    const response = await fetch('quotes.json'); // Assumindo quotes.json está na raiz do projeto
    const quotes = await response.json();

    if (quotes && quotes.length > 0) {
      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 0);
      const diff = today - startOfYear;
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);

      const quoteIndex = (dayOfYear - 1 + quotes.length) % quotes.length;
      const dailyQuote = quotes[quoteIndex];

      motivationalQuoteElement.textContent = `${dailyQuote.quote} - ${dailyQuote.author}`;
    } else {
      motivationalQuoteElement.textContent = "Não foi possível carregar as frases motivacionais do arquivo.";
    }
  } catch (error) {
    console.error('Erro ao carregar frases motivacionais:', error);
    motivationalQuoteElement.textContent = "Erro ao carregar a frase motivacional do dia. Verifique o arquivo quotes.json.";
  }
}