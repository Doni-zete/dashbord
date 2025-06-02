document.addEventListener('DOMContentLoaded', () => {
  const calendarGrid = document.getElementById('calendar-grid');
  const goalList = document.getElementById('goal-list');
  const weeklyProgressSpan = document.getElementById('weekly-progress');
  const dayProgressBars = document.querySelectorAll('.day-progress-bars .bar');
  const dayProgressLabels = document.querySelectorAll('.day-progress-labels span');
  const motivationalQuoteElement = document.getElementById('motivational-quote');
  const currentMonthYearElement = document.getElementById('current-month-year');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');
  const calendarHeader = document.getElementById('calendar-header'); // Onde o cabeçalho do calendário será gerado

  const numberOfGoals = goalList.children.length;
  const daysInWeek = 7; // Domingo, Segunda, Terça... Sábado (0-6)

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const weekDayNames = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

  // Definir variável CSS para o número de metas, crucial para o alinhamento de grid
  document.documentElement.style.setProperty('--num-goals', numberOfGoals);

  // --- Frases Motivacionais Locais ---
  async function displayDailyQuote() {
    try {
      const response = await fetch('quotes.json');
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

  // --- Lógica do Calendário Anual com Rolagem Horizontal (Novo Layout) ---
  function generateCalendar(month, year) {
    calendarGrid.innerHTML = ''; // Limpa o grid do calendário
    calendarHeader.innerHTML = ''; // Limpa o cabeçalho do calendário
    currentMonthYearElement.textContent = `${monthNames[month]} ${year}`;

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Último dia do mês

    // Calcula o dia da semana do primeiro dia do mês (0 = Domingo, 6 = Sábado)
    const firstDayOfWeek = firstDayOfMonth.getDay();

    // 1. Gerar o Cabeçalho do Calendário (Dias da Semana e Números dos Dias)
    // Precisamos de células vazias no cabeçalho também para alinhar o dia 1
    for (let i = 0;i < firstDayOfWeek;i++) {
      const emptyDayName = document.createElement('div');
      emptyDayName.classList.add('calendar-day-name', 'empty-cell');
      calendarHeader.appendChild(emptyDayName);

      const emptyDayNumber = document.createElement('div');
      emptyDayNumber.classList.add('calendar-day-number-header', 'empty-cell');
      calendarHeader.appendChild(emptyDayNumber);
    }

    for (let day = 1;day <= daysInMonth;day++) {
      const currentDate = new Date(year, month, day);
      const dayOfWeek = currentDate.getDay(); // 0 (Dom) - 6 (Sáb)

      // Criar elementos para o nome do dia da semana (dom, seg, etc.)
      const dayNameElement = document.createElement('div');
      dayNameElement.classList.add('calendar-day-name');
      dayNameElement.textContent = weekDayNames[dayOfWeek];
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Domingo ou Sábado
        dayNameElement.classList.add('weekend');
      }
      calendarHeader.appendChild(dayNameElement);

      // Criar elementos para o número do dia (1, 2, 3, etc.)
      const dayNumberHeaderElement = document.createElement('div');
      dayNumberHeaderElement.classList.add('calendar-day-number-header');
      dayNumberHeaderElement.textContent = day;
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Domingo ou Sábado
        dayNumberHeaderElement.classList.add('weekend');
      }
      calendarHeader.appendChild(dayNumberHeaderElement);
    }

    // 2. Gerar o Grid de Checkboxes
    // Primeiro, preencher as células vazias para alinhar a primeira coluna de checkboxes com o dia 1
    for (let i = 0;i < firstDayOfWeek;i++) {
      for (let goalIndex = 0;goalIndex < numberOfGoals;goalIndex++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-cell', 'empty-cell');
        calendarGrid.appendChild(emptyCell);
      }
    }

    for (let day = 1;day <= daysInMonth;day++) {
      const formattedMonth = String(month + 1).padStart(2, '0');
      const formattedDay = String(day).padStart(2, '0');
      const fullDate = `${year}-${formattedMonth}-${formattedDay}`;

      for (let goalIndex = 0;goalIndex < numberOfGoals;goalIndex++) {
        const calendarCell = document.createElement('div');
        calendarCell.classList.add('calendar-cell');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `goal-${goalIndex}-${fullDate}`;
        checkbox.dataset.goalIndex = goalIndex;
        checkbox.dataset.date = fullDate;

        checkbox.addEventListener('change', updateProgress);
        calendarCell.appendChild(checkbox);
        calendarGrid.appendChild(calendarCell);
      }
    }

    loadProgressFromLocalStorage(); // Carrega o progresso após gerar o calendário
  }

  function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    } else if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
    // Opcional: rolar para o início do calendário ao mudar o mês
    document.querySelector('.calendar-scroll-container').scrollLeft = 0;
  }

  prevMonthBtn.addEventListener('click', () => changeMonth(-1));
  nextMonthBtn.addEventListener('click', () => changeMonth(1));

  // --- Lógica de Progresso (Revisada para o novo layout) ---
  function updateProgress() {
    let totalCheckedGoalsCurrentMonth = 0;
    const dailyCheckedCounts = Array(daysInWeek).fill(0); // Para as 7 barras de progresso diárias

    const visibleCheckboxes = calendarGrid.querySelectorAll('input[type="checkbox"]');
    visibleCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        totalCheckedGoalsCurrentMonth++;
        const dateParts = checkbox.dataset.date.split('-');
        const dayOfWeek = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).getDay();
        dailyCheckedCounts[dayOfWeek]++;
      }
    });

    const totalPossibleGoalsInMonth = numberOfGoals * (calendarGrid.children.length / numberOfGoals);
    const overallMonthlyProgress = (totalPossibleGoalsInMonth > 0) ? (totalCheckedGoalsCurrentMonth / totalPossibleGoalsInMonth) * 100 : 0;
    weeklyProgressSpan.textContent = `${Math.round(overallMonthlyProgress)}%`;
    document.querySelector('.main-progress-bar').style.width = `${overallMonthlyProgress}%`;

    dailyCheckedCounts.forEach((count, index) => {
      let daysInMonthForThisDayOfWeek = 0;
      const tempDate = new Date(currentYear, currentMonth, 1);
      while (tempDate.getMonth() === currentMonth) {
        if (tempDate.getDay() === index) {
          daysInMonthForThisDayOfWeek++;
        }
        tempDate.setDate(tempDate.getDate() + 1);
      }

      const dailyPercentage = (daysInMonthForThisDayOfWeek > 0) ? (count / (numberOfGoals * daysInMonthForThisDayOfWeek)) * 100 : 0;
      dayProgressBars[index].style.height = `${dailyPercentage}%`;
      dayProgressLabels[index].textContent = `${Math.round(dailyPercentage)}%`;
    });

    saveProgressToLocalStorage();
  }

  function saveProgressToLocalStorage() {
    const checkboxStates = {};
    const allCheckboxesInMonth = calendarGrid.querySelectorAll('input[type="checkbox"]');
    allCheckboxesInMonth.forEach(checkbox => {
      checkboxStates[checkbox.id] = checkbox.checked;
    });
    localStorage.setItem(`calendarProgress-${currentYear}-${currentMonth}`, JSON.stringify(checkboxStates));
  }

  function loadProgressFromLocalStorage() {
    const savedProgress = localStorage.getItem(`calendarProgress-${currentYear}-${currentMonth}`);
    if (savedProgress) {
      const checkboxStates = JSON.parse(savedProgress);
      const allCheckboxesInMonth = calendarGrid.querySelectorAll('input[type="checkbox"]');
      allCheckboxesInMonth.forEach(checkbox => {
        checkbox.checked = checkboxStates[checkbox.id] || false;
      });
    }
    updateProgress();
  }

  // --- Chamar as funções ao carregar a página ---
  displayDailyQuote();
  generateCalendar(currentMonth, currentYear);
});