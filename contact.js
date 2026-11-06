(() => {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const programSelect = form.querySelector('#contact-program');
  const subprogramSelect = form.querySelector('#contact-subprogram');
  const stageSelect = form.querySelector('#quiz-stage');
  const stageLabel = form.querySelector('[data-stage-label]');
  const goalOptions = form.querySelector('[data-goal-options]');
  const panels = [...form.querySelectorAll('[data-quiz-panel]')];
  const stepLabel = form.querySelector('[data-quiz-step-label]');
  const progressPercent = form.querySelector('[data-quiz-progress-percent]');
  const progressBar = form.querySelector('[data-quiz-progress-bar]');
  const nextButton = form.querySelector('[data-quiz-next]');
  const backButton = form.querySelector('[data-quiz-back]');
  const submitButton = form.querySelector('[data-quiz-submit]');
  let currentStep = 1;

  const programChoices = {
    fertility: ['Natural Fertility Program', 'IUI/IVF Preparation Program', 'Egg Freezing Prep Program', 'PCOS Balance Program'],
    pregnancy: ['Pregnancy Wellness Program', 'Postpartum Recovery Program'],
    'weight-loss': ['GLP-1 Weight Management Program', 'Sustainable Weight Loss Program'],
    'not-sure': ['Help me choose a program']
  };
  const programDetails = {
    fertility: {
      question: 'Where are you in your fertility journey?',
      stages: ['Planning to conceive', 'Trying to conceive', 'Considering IUI or IVF', 'Exploring egg freezing', 'Managing PCOS or cycle concerns'],
      goals: ['Understand my fertility health', 'Prepare for a fertility treatment', 'Improve nutrition and lifestyle', 'Get support with PCOS or cycle health', 'Talk through my options']
    },
    pregnancy: {
      question: 'Which stage of pregnancy are you in?',
      stages: ['First trimester', 'Second trimester', 'Third trimester', 'Planning or newly pregnant', 'Prefer to discuss with the team'],
      goals: ['Medical guidance', 'Nutrition support', 'Safe movement or pregnancy yoga', 'Emotional wellbeing', 'Birth preparation']
    },
    postpartum: {
      question: 'How long has it been since your delivery?',
      stages: ['Less than 6 weeks', '6 weeks to 6 months', 'More than 6 months', 'Expecting soon and planning ahead', 'Prefer to discuss with the team'],
      goals: ['Physical recovery', 'Nutrition and energy', 'Gentle movement', 'Emotional wellbeing', 'Breastfeeding nutrition or support']
    },
    'weight-loss': {
      question: 'What best describes your current goal?',
      stages: ['Explore medically guided weight management', 'Build sustainable nutrition and activity habits', 'Understand GLP-1 support', 'Manage weight alongside another health concern', 'Prefer to discuss with the team'],
      goals: ['Medical guidance', 'Nutrition planning', 'Movement and activity', 'Long-term habit support', 'Understand available program options']
    },
    'not-sure': {
      question: 'Which area would you like help with?',
      stages: ['Fertility', 'Pregnancy', 'Postpartum recovery', 'Weight management', 'I’m not sure yet'],
      goals: ['Understand which program may fit', 'Talk through my health goals', 'Ask a general question', 'Speak with the care team']
    }
  };

  function fillSelect(select, placeholder, options) {
    select.replaceChildren(new Option(placeholder, '', true, true));
    select.options[0].disabled = true;
    options.forEach((option) => select.add(new Option(option, option)));
    select.disabled = options.length === 0;
  }

  function updateProgramQuestions() {
    const program = programSelect.value;
    fillSelect(subprogramSelect, 'Select a subprogram', programChoices[program] || []);
    updateProgramDetails();
  }

  function updateProgramDetails() {
    const program = programSelect.value;
    const detailsKey = program === 'pregnancy' && subprogramSelect.value === 'Postpartum Recovery Program'
      ? 'postpartum'
      : program;
    const details = programDetails[detailsKey];
    stageLabel.textContent = details?.question || 'Your current stage';
    fillSelect(stageSelect, 'Select an answer', details?.stages || []);
    goalOptions.replaceChildren(...(details?.goals || []).map((goal, index) => {
      const label = document.createElement('label');
      label.className = 'quiz-choice';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'goals';
      input.value = goal;
      input.id = `quiz-goal-${index + 1}`;
      const text = document.createElement('span');
      text.textContent = goal;
      label.append(input, text);
      return label;
    }));
  }

  function showStep(step) {
    currentStep = step;
    panels.forEach((panel) => { panel.hidden = Number(panel.dataset.quizPanel) !== step; });
    const percent = Math.round((step / panels.length) * 100);
    stepLabel.textContent = `Step ${step} of ${panels.length}`;
    progressPercent.textContent = `${percent}%`;
    progressBar.style.width = `${percent}%`;
    backButton.hidden = step === 1;
    nextButton.hidden = step === panels.length;
    submitButton.hidden = step !== panels.length;
    panels[step - 1].querySelector('select, input, textarea')?.focus({ preventScroll: true });
  }

  function validateStep() {
    const panel = panels[currentStep - 1];
    const controls = [...panel.querySelectorAll('select, input, textarea')].filter((control) => control.required && !control.disabled);
    for (const control of controls) {
      if (!control.checkValidity()) {
        control.reportValidity();
        control.focus();
        return false;
      }
    }
    if (currentStep === 3 && !form.querySelector('[name="goals"]:checked')) {
      goalOptions.setAttribute('aria-invalid', 'true');
      goalOptions.scrollIntoView({ behavior: 'smooth', block: 'center' });
      goalOptions.querySelector('input')?.focus();
      let error = form.querySelector('[data-goal-error]');
      if (!error) {
        error = document.createElement('p');
        error.className = 'quiz-error';
        error.dataset.goalError = '';
        error.textContent = 'Choose at least one area so we can guide you.';
        goalOptions.after(error);
      }
      return false;
    }
    goalOptions.removeAttribute('aria-invalid');
    form.querySelector('[data-goal-error]')?.remove();
    return true;
  }

  programSelect.addEventListener('change', updateProgramQuestions);
  subprogramSelect.addEventListener('change', updateProgramDetails);
  goalOptions.addEventListener('change', () => {
    if (form.querySelector('[name="goals"]:checked')) {
      goalOptions.removeAttribute('aria-invalid');
      form.querySelector('[data-goal-error]')?.remove();
    }
  });
  nextButton.addEventListener('click', () => {
    if (validateStep()) showStep(Math.min(currentStep + 1, panels.length));
  });
  backButton.addEventListener('click', () => showStep(Math.max(currentStep - 1, 1)));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateStep()) return;
    const values = new FormData(form);
    const answers = [
      `Name: ${values.get('name')}`,
      `Email: ${values.get('email')}`,
      `Phone: ${values.get('phone') || 'Not provided'}`,
      `Main program: ${programSelect.options[programSelect.selectedIndex].text}`,
      `Subprogram: ${values.get('subprogram')}`,
      `${stageLabel.textContent}: ${values.get('stage')}`,
      `Support goals: ${values.getAll('goals').join(', ')}`,
      `Additional context: ${values.get('stageNote') || 'Not provided'}`,
      `Main question: ${values.get('goalNote') || 'Not provided'}`
    ].join('\r\n');
    window.location.href = `mailto:hello@newkind.com?subject=${encodeURIComponent('NewKind program finder quiz')}&body=${encodeURIComponent(answers)}`;
  });

  showStep(1);
})();
