// js/progress.js

let numberOfGoals; // Será definido pelo main.js

export function setNumberOfGoals(count) {
  numberOfGoals = count;
  // Set CSS variable for dynamic height calculation in calendar.css
  document.documentElement.style.setProperty('--num-goals', count);
}

export function updateProgress() {
  const calendarGrid = document.getElementById('calendar-grid');
  const weeklyProgressSpan = document.getElementById('weekly-progress');
  const mainProgressBar = document.querySelector('.main-progress-bar');
  const dayProgressBars = document.querySelectorAll('.day-progress-bars .bar');
  const dayProgressLabels = document.querySelectorAll('.day-progress-labels span');

  // Validação básica para garantir que os elementos existem
  if (!calendarGrid || !weeklyProgressSpan || !mainProgressBar || dayProgressBars.length === 0 || dayProgressLabels.length === 0) {
    console.warn("Elementos do progresso não encontrados. Verifique o HTML ou a ordem de execução.");
    return;
  }

  let totalCheckedGoalsCurrentMonth = 0;
  const dailyCheckedCounts = Array(7).fill(0); // Para os 7 dias da semana (0=Dom, 6=Sáb)

  const visibleCheckboxes = calendarGrid.querySelectorAll('input[type="checkbox"]');

  // Se não há checkboxes, resetar o progresso visualmente
  if (visibleCheckboxes.length === 0 || numberOfGoals === 0) {
    weeklyProgressSpan.textContent = `0%`;
    mainProgressBar.style.width = `0%`;
    dayProgressBars.forEach(bar => bar.style.height = `0%`);
    dayProgressLabels.forEach(label => label.textContent = `0%`);
    return;
  }

  // Inferir o mês e ano exibidos a partir do primeiro checkbox.
  // Isso garante que estamos calculando o progresso para o mês que está sendo mostrado.
  let displayedMonth;
  let displayedYear;
  if (visibleCheckboxes.length > 0) {
    const firstCheckboxDateParts = visibleCheckboxes[0].dataset.date.split('-');
    displayedYear = parseInt(firstCheckboxDateParts[0]);
    displayedMonth = parseInt(firstCheckboxDateParts[1]) - 1; // Mês é 0-indexado
  } else {
    // Fallback: se por algum motivo não houver checkboxes, usa a data atual
    const today = new Date();
    displayedYear = today.getFullYear();
    displayedMonth = today.getMonth();
  }

  visibleCheckboxes.forEach(checkbox => {
    if (checkbox.checked) {
      totalCheckedGoalsCurrentMonth++;
      const dateParts = checkbox.dataset.date.split('-');
      const dayOfWeek = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2])).getDay();
      dailyCheckedCounts[dayOfWeek]++;
    }
  });

  // Calcular o progresso total do mês
  // Conta apenas as células que não são 'empty-cell' para o cálculo preciso de dias
  // totalActualCells should be the number of actual days * numberOfGoals
  const totalActualDaysInMonth = calendarGrid.querySelectorAll('.calendar-cell:not(.empty-cell)')[0] ?
    (calendarGrid.querySelectorAll('.calendar-cell:not(.empty-cell)').length / numberOfGoals) : 0;

  const totalPossibleGoalsInMonth = totalActualDaysInMonth * numberOfGoals; // Correct calculation

  const overallMonthlyProgress = (totalPossibleGoalsInMonth > 0) ?
    (totalCheckedGoalsCurrentMonth / totalPossibleGoalsInMonth) * 100 : 0;

  weeklyProgressSpan.textContent = `${Math.round(overallMonthlyProgress)}%`;
  mainProgressBar.style.width = `${overallMonthlyProgress}%`;

  // Para as barras diárias (progresso por dia da semana)
  dailyCheckedCounts.forEach((count, index) => {
    let daysInMonthForThisDayOfWeek = 0;
    const tempDate = new Date(displayedYear, displayedMonth, 1);
    while (tempDate.getMonth() === displayedMonth) {
      if (tempDate.getDay() === index) {
        daysInMonthForThisDayOfWeek++;
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }

    const dailyPossibleGoals = numberOfGoals * daysInMonthForThisDayOfWeek;
    const dailyPercentage = (dailyPossibleGoals > 0) ? (count / dailyPossibleGoals) * 100 : 0;

    // Garante que o elemento existe antes de tentar manipular
    if (dayProgressBars[index]) {
      dayProgressBars[index].style.height = `${dailyPercentage}%`;
    }
    if (dayProgressLabels[index]) {
      dayProgressLabels[index].textContent = `${Math.round(dailyPercentage)}%`;
    }
  });
}

// Salva o estado de todos os checkboxes do calendário atualmente exibido no localStorage
export function saveProgressToLocalStorage(year, month, calendarGrid) {
  const checkboxStates = {};
  const allCheckboxesInMonth = calendarGrid.querySelectorAll('input[type="checkbox"]');
  allCheckboxesInMonth.forEach(checkbox => {
    // Usa o ID único do checkbox como chave para o estado
    checkboxStates[checkbox.id] = checkbox.checked;
  });
  // A chave do localStorage deve ser única por ano e mês para separar os progressos
  localStorage.setItem(`calendarProgress-${year}-${month}`, JSON.stringify(checkboxStates));
}

// Carrega o estado dos checkboxes para o mês e ano especificados do localStorage
export function loadProgressFromLocalStorage(calendarGrid, year, month) {
  const savedProgress = localStorage.getItem(`calendarProgress-${year}-${month}`);
  if (savedProgress) {
    const checkboxStates = JSON.parse(savedProgress);
    const allCheckboxesInMonth = calendarGrid.querySelectorAll('input[type="checkbox"]');
    allCheckboxesInMonth.forEach(checkbox => {
      // Aplica o estado salvo se existir e for true, caso contrário, false
      checkbox.checked = checkboxStates[checkbox.id] === true;
    });
  } else {
    // Se não houver progresso salvo para este mês, desmarca todos os checkboxes
    // para evitar que o estado de um mês anterior "vaze" ou que venham marcados por padrão.
    const allCheckboxesInMonth = calendarGrid.querySelectorAll('input[type="checkbox"]');
    allCheckboxesInMonth.forEach(checkbox => {
      checkbox.checked = false;
    });
  }
  // Sempre atualiza o progresso visual após carregar (ou resetar) os estados dos checkboxes
  updateProgress();
}