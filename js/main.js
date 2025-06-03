// js/main.js

import { updateProgress, saveProgressToLocalStorage, loadProgressFromLocalStorage, setNumberOfGoals } from './progress.js';
import { generateCalendar } from './calendar.js'; // Importe sua função de geração de calendário

let currentMonth = new Date().getMonth(); // Mês atual (0-indexado)
let currentYear = new Date().getFullYear(); // Ano atual

const calendarGrid = document.getElementById('calendar-grid');
const goalsList = document.getElementById('goal-list');
const monthDisplay = document.getElementById('month-display'); // Added to update month display

// Função para obter o número de metas. Adapte se suas metas forem dinâmicas.
function getNumberOfGoals() {
  // Retorna o número de elementos <li> na lista de metas
  return goalsList ? goalsList.children.length : 0;
}

// Função para formatar o nome do mês
function getMonthName(monthIndex) {
  const date = new Date(currentYear, monthIndex);
  return date.toLocaleString('pt-br', { month: 'long' });
}

// Função principal que orquestra a renderização do calendário e o carregamento/salvamento do progresso
function renderCalendarAndProgress() {
  console.log(`Renderizando calendário para ${currentMonth + 1}/${currentYear}...`); // Debugging

  // Update the month display
  monthDisplay.textContent = `${getMonthName(currentMonth)} ${currentYear}`;

  // 1. Define o número de metas para o módulo de progresso.
  // Isso é importante para cálculos de progresso e para a altura do grid do calendário.
  setNumberOfGoals(getNumberOfGoals());

  // 2. Gerar o HTML do calendário para o mês e ano atuais.
  // Esta função deve limpar o grid e o cabeçalho, e adicionar os novos elementos (dias e checkboxes).
  generateCalendar(currentYear, currentMonth);
  console.log("Calendário gerado no DOM."); // Debugging

  // 3. Carregar o progresso para o mês atualmente exibido do localStorage.
  // Esta função também chamará updateProgress() após carregar os estados.
  loadProgressFromLocalStorage(calendarGrid, currentYear, currentMonth);
  console.log("Progresso carregado e atualizado."); // Debugging

  // 4. Adicionar event listeners aos checkboxes (AGORA que eles estão no DOM).
  // É importante fazer isso *depois* da renderização e do carregamento, pois os elementos são recriados.
  const allCheckboxes = calendarGrid.querySelectorAll('input[type="checkbox"]');
  allCheckboxes.forEach(checkbox => {
    // É bom remover listeners antigos para evitar que se acumulem ao mudar de mês
    checkbox.removeEventListener('change', handleCheckboxChange);
    checkbox.addEventListener('change', handleCheckboxChange);
  });
  console.log(`Total de ${allCheckboxes.length} checkboxes encontrados para adicionar listeners.`); // Debugging
}

// Handler para o evento de mudança do checkbox (ticado/desticado)
function handleCheckboxChange(event) {
  // O 'event.target' é o checkbox que foi clicado.
  console.log(`Checkbox ${event.target.id} alterado. Novo estado: ${event.target.checked}`); // Debugging
  saveProgressToLocalStorage(currentYear, currentMonth, calendarGrid);
  updateProgress(); // Atualiza as barras de progresso imediatamente
}

// Event Listeners para os botões de navegação do calendário
document.getElementById('prev-month-btn').addEventListener('click', () => {
  console.log("Clicou em 'Anterior'."); // Debugging
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11; // Volta para dezembro
    currentYear--;      // Volta um ano
  }
  renderCalendarAndProgress(); // Redesenha o calendário e carrega o progresso do novo mês
});

document.getElementById('next-month-btn').addEventListener('click', () => {
  console.log("Clicou em 'Próximo'."); // Debugging
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0; // Vai para janeiro
    currentYear++;      // Avança um ano
  }
  renderCalendarAndProgress(); // Redesenha o calendário e carrega o progresso do novo mês
});

// Chamar a função de renderização na carga inicial completa da página
document.addEventListener('DOMContentLoaded', renderCalendarAndProgress);
console.log("DOM content loaded event listener adicionado."); // Debugging