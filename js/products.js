// js/products.js
import { productData } from './data.js';

export function generateProductGrid(productListElement, productHeaderElement, productGridElement) {
  productListElement.innerHTML = '';
  productHeaderElement.innerHTML = '';
  productGridElement.innerHTML = '';

  const platforms = ["facebook", "tiktok", "pinterest", "instagram", "shopeeVideos", "youtubeShorts"];

  // 1. Gerar os nomes dos produtos na lista lateral
  productData.forEach(product => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<span class="product-text">${product.produto}</span>`;
    productListElement.appendChild(listItem);
  });

  // 2. Gerar o Cabeçalho das Plataformas
  platforms.forEach(platform => {
    const headerCell = document.createElement('div');
    headerCell.classList.add('product-platform-header');
    headerCell.textContent = platform.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    productHeaderElement.appendChild(headerCell);
  });

  // 3. Gerar o Grid de Status dos Produtos
  document.documentElement.style.setProperty('--num-products', productData.length); // Definir variável CSS aqui

  productData.forEach(product => {
    platforms.forEach(platform => {
      const statusCell = document.createElement('div');
      statusCell.classList.add('calendar-cell');

      const status = product[platform];
      statusCell.textContent = status;

      if (status === "Concluído") {
        statusCell.classList.add('status-concluido');
      } else if (status === "Não Concluiu") {
        statusCell.classList.add('status-nao-concluiu');
      }
      productGridElement.appendChild(statusCell);
    });
  });
}