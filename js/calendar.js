// js/calendar.js

export function generateCalendar(year, month) {
  const calendarGrid = document.getElementById('calendar-grid');
  const calendarHeader = document.getElementById('calendar-header');
  const monthDisplay = document.getElementById('month-display');

  // Clear previous calendar content
  calendarGrid.innerHTML = '';
  calendarHeader.innerHTML = '';

  // Set month and year display
  const monthName = new Date(year, month).toLocaleString('pt-br', { month: 'long' });
  monthDisplay.textContent = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`; // Capitalize first letter

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Generate calendar header (Day names and numbers)
  for (let i = 1;i <= daysInMonth;i++) {
    const date = new Date(year, month, i);
    const dayName = daysOfWeek[date.getDay()];
    const isWeekend = (date.getDay() === 0 || date.getDay() === 6); // Sunday (0) or Saturday (6)

    const dayNameDiv = document.createElement('div');
    dayNameDiv.classList.add('calendar-day-name');
    if (isWeekend) {
      dayNameDiv.classList.add('weekend');
    }
    dayNameDiv.textContent = dayName;
    calendarHeader.appendChild(dayNameDiv);

    const dayNumberDiv = document.createElement('div');
    dayNumberDiv.classList.add('calendar-day-number-header');
    if (isWeekend) {
      dayNumberDiv.classList.add('weekend');
    }
    dayNumberDiv.textContent = i;
    calendarHeader.appendChild(dayNumberDiv);
  }

  // Generate calendar grid (checkboxes for each goal and day)
  const numberOfGoals = document.getElementById('goal-list').children.length; // Get dynamic number of goals

  for (let day = 1;day <= daysInMonth;day++) {
    for (let goalIndex = 0;goalIndex < numberOfGoals;goalIndex++) {
      const cell = document.createElement('div');
      cell.classList.add('calendar-cell');

      const dateId = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `checkbox-${dateId}-goal${goalIndex}`; // Unique ID for each checkbox
      checkbox.dataset.date = dateId; // Store date for easy access

      cell.appendChild(checkbox);
      calendarGrid.appendChild(cell);
    }
  }
}