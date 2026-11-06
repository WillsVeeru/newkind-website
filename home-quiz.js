(() => {
  const modal = document.querySelector('[data-home-quiz-modal]');
  const form = modal?.querySelector('[data-home-quiz-form]');
  if (!modal || !form) return;

  const panels = [...form.querySelectorAll('[data-home-quiz-panel]')];
  const programChoices = [...form.querySelectorAll('[name="program"]')];
  const subprogramSelect = form.querySelector('#home-quiz-subprogram');
  const stagesContainer = form.querySelector('[data-home-quiz-stages]');
  const goalsContainer = form.querySelector('[data-home-quiz-goals]');
  const stepLabel = modal.querySelector('[data-home-quiz-step-label]');
  const percentLabel = modal.querySelector('[data-home-quiz-percent]');
  const progressBar = modal.querySelector('[data-home-quiz-progress-bar]');
  const guidanceTitle = modal.querySelector('[data-home-quiz-guidance-title]');
  const guidanceCopy = modal.querySelector('[data-home-quiz-guidance-copy]');
  const errorMessage = modal.querySelector('[data-home-quiz-error]');
  const backButton = modal.querySelector('[data-home-quiz-back]');
  const nextButton = modal.querySelector('[data-home-quiz-next]');
  const submitButton = modal.querySelector('[data-home-quiz-submit]');
  const resultCopy = modal.querySelector('[data-home-quiz-result-copy]');
  const resultTags = modal.querySelector('[data-home-quiz-result-tags]');
  let currentStep = 1;
  let lastTrigger = null;

  const programs = {
    fertility: {
      label: 'Fertility',
      subprograms: [
        'Natural Fertility Program',
        'IUI/IVF Preparation Program',
        'Egg Freezing Prep Program',
        'PMOS Balance Program'
      ],
      stages: [
        'Planning to conceive',
        'Trying to conceive',
        'Considering IUI or IVF',
        'Exploring egg freezing',
        'Managing PCOS or cycle concerns'
      ],
      stageNotes: {
        'Planning to conceive': 'A care conversation can help you organize questions about your health and the support you may want while planning.',
        'Trying to conceive': 'Every journey is different. A qualified clinician can help you decide which personal questions or next steps to discuss.',
        'Considering IUI or IVF': 'Your fertility specialist remains the best person to guide treatment decisions. Support can also focus on nutrition, wellbeing, and preparation.',
        'Exploring egg freezing': 'A specialist can explain the medical process and timing. NewKind support can complement that conversation with personalized wellbeing guidance.',
        'Managing PCOS or cycle concerns': 'Cycle concerns can have different causes. A clinician can assess your situation; nutrition and lifestyle support can be tailored alongside medical care.'
      },
      goals: [
        ['Understand my fertility health', 'A clinician-led conversation can help you organize questions about your fertility health and care options.'],
        ['Prepare for a fertility treatment', 'Treatment decisions belong with your fertility specialist; support can help you feel informed and cared for throughout the process.'],
        ['Improve nutrition and lifestyle', 'Nutrition and realistic daily habits can be discussed in the context of your own needs and clinical guidance.'],
        ['Get support with PCOS or cycle health', 'PCOS and cycle needs vary. A qualified clinician can assess your concerns and help coordinate appropriate support.'],
        ['Talk through my options', 'A discovery call is a low-pressure way to share what matters to you and learn about available support.']
      ],
      intro: 'Fertility care is personal. A team conversation can explore your goals alongside medical care, nutrition, and emotional wellbeing.'
    },
    pregnancy: {
      label: 'Pregnancy',
      subprograms: ['Pregnancy Wellness Program', 'Postpartum Recovery Program'],
      stages: [
        'Planning or newly pregnant',
        'First trimester',
        'Second trimester',
        'Third trimester',
        'Recovering after delivery'
      ],
      stageNotes: {
        'Planning or newly pregnant': 'Your prenatal clinician can guide your individual care. NewKind can complement it with practical nutrition, movement, and wellbeing support.',
        'First trimester': 'Pregnancy needs vary. Keep your prenatal care team informed and ask them which nutrition or activity guidance is right for you.',
        'Second trimester': 'Your prenatal care team can tailor guidance to your pregnancy. Support can focus on practical routines and questions you want to discuss.',
        'Third trimester': 'Your clinician can guide preparation for birth and any health concerns. Additional support can help you plan routines and wellbeing around your needs.',
        'Recovering after delivery': 'Recovery is individual. Your clinician should guide your care; support can be paced around nutrition, gentle movement, and emotional wellbeing.'
      },
      goals: [
        ['Nutrition support', 'Nutrition guidance can be tailored to your stage and discussed alongside your prenatal or postpartum care.'],
        ['Safe movement and activity', 'Ask your clinician what movement is appropriate for you; support can help you explore comfortable, guided options.'],
        ['Emotional wellbeing', 'Emotional support is a valid part of care. A team conversation can help you explore what feels supportive.'],
        ['Birth or recovery preparation', 'Your clinician can advise on medical preparation; practical support can help you think through routines and questions.'],
        ['Postpartum recovery', 'Postpartum care can include a conversation about recovery, nutrition, movement, and emotional wellbeing at your pace.']
      ],
      intro: 'Pregnancy and postpartum needs can change over time. Your prenatal or postpartum clinician guides medical care; NewKind support can complement it.'
    },
    'weight-loss': {
      label: 'Weight Loss',
      subprograms: ['GLP-1 Weight Management Program', 'Sustainable Weight Loss Program'],
      stages: [
        'Exploring medically guided support',
        'Building sustainable habits',
        'Currently using prescribed weight-management medication',
        'Managing weight alongside another health concern',
        'Not sure where to begin'
      ],
      stageNotes: {
        'Exploring medically guided support': 'A qualified clinician can discuss what options may be appropriate for your health. This quiz does not assess medication suitability.',
        'Building sustainable habits': 'Small, realistic changes can be easier to maintain. A care team can help explore nutrition, movement, and behavior support that fits your life.',
        'Currently using prescribed weight-management medication': 'Continue to follow your prescriber’s guidance. A care team can discuss complementary nutrition and lifestyle support.',
        'Managing weight alongside another health concern': 'Weight and health are influenced by many factors. Your clinician can coordinate care around your full health history and goals.',
        'Not sure where to begin': 'You do not need to have a plan before reaching out. A discovery conversation can help you understand the available approaches.'
      },
      goals: [
        ['Clinician-guided options', 'A qualified clinician can discuss benefits, risks, and suitability of medical options for your circumstances.'],
        ['Nutrition support', 'Personalized nutrition support can focus on practical, sustainable choices rather than one-size-fits-all rules.'],
        ['Movement and activity', 'Movement goals should fit your abilities, preferences, and health. You can explore supportive options with the care team.'],
        ['Long-term habit support', 'Ongoing support can help you work toward realistic routines and review what is working for you.'],
        ['Support alongside another health concern', 'Your care team can take your wider health context into account and coordinate guidance with your clinician.']
      ],
      intro: 'Weight management is individual. A clinician can discuss medical options; broader support can include nutrition, movement, and sustainable habits.'
    }
  };

  const selectedProgram = () => programs[form.querySelector('[name="program"]:checked')?.value];
  const checkedStage = () => form.querySelector('[name="stage"]:checked')?.value || '';
  const selectedGoals = () => [...form.querySelectorAll('[name="goal"]:checked')].map((input) => input.value);
  const setGuidance = (title, copy) => {
    guidanceTitle.textContent = title;
    guidanceCopy.textContent = copy;
  };

  function makeChoice({ name, value, label, description = '', type = 'radio', className = '' }) {
    const choice = document.createElement('label');
    choice.className = `home-quiz-choice ${className}`.trim();
    const input = document.createElement('input');
    input.type = type;
    input.name = name;
    input.value = value;
    input.required = type === 'radio' && name === 'stage';

    const text = document.createElement('span');
    const title = document.createElement('strong');
    title.textContent = label;
    text.append(title);
    if (description) {
      const detail = document.createElement('small');
      detail.textContent = description;
      text.append(detail);
    }
    choice.append(input, text);
    return choice;
  }

  function updateStages() {
    const program = selectedProgram();
    if (!program) return;
    stagesContainer.replaceChildren(...program.stages.map((stage, index) => {
      const choice = makeChoice({
        name: 'stage',
        value: stage,
        label: stage,
        className: 'home-quiz-choice-stage'
      });
      if (index === 0) choice.querySelector('input').required = true;
      return choice;
    }));
  }

  function updateProgramDetails() {
    const program = selectedProgram();
    if (!program) return;
    const subprogramOptions = program.subprograms.map((subprogram) => new Option(subprogram, subprogram));
    const placeholder = new Option('Choose a program', '', true, true);
    placeholder.disabled = true;
    subprogramSelect.replaceChildren(placeholder, ...subprogramOptions);
    updateStages();
    goalsContainer.replaceChildren(...program.goals.map(([goal, description]) => makeChoice({
      name: 'goal',
      value: goal,
      label: goal,
      description,
      type: 'checkbox',
      className: 'home-quiz-choice-goal'
    })));
  }

  function updateContextualGuidance() {
    const program = selectedProgram();
    if (!program) {
      setGuidance('Personalized, not one-size-fits-all.', 'Choose a focus area and we’ll share helpful context as you go. Your answers are only used to shape this on-page guide.');
      return;
    }
    if (currentStep === 1) {
      setGuidance(`${program.label} support`, program.intro);
      return;
    }
    if (currentStep === 2) {
      const stage = checkedStage();
      const subprogram = subprogramSelect.value;
      const stageNote = program.stageNotes[stage];
      setGuidance(
        stage ? 'A note for your stage' : subprogram || `${program.label} journey`,
        stageNote || 'Choose the stage that feels closest. We’ll use it to shape the information shown here, not to make a medical assessment.'
      );
      return;
    }
    if (currentStep === 3) {
      const goals = selectedGoals();
      if (!goals.length) {
        setGuidance('Your priorities matter.', 'Select the areas you would like to explore. We’ll summarize them as topics for a conversation with the care team.');
        return;
      }
      const notes = goals.map((goal) => program.goals.find(([label]) => label === goal)?.[1]).filter(Boolean);
      setGuidance(
        goals.length === 1 ? 'A helpful area to explore' : `${goals.length} areas to explore`,
        goals.length === 1 ? notes[0] : `You’re interested in ${goals.join(', ').toLowerCase()}. The care team can discuss how these priorities fit together with your health needs.`
      );
      return;
    }
    if (currentStep === 4) {
      setGuidance('Your information', 'Add your contact details, then review your personalized starting point before submitting your answers.');
      return;
    }
    setGuidance('Your next step', 'Review your starting point, then submit to open an email with your answers for the NewKind team.');
  }

  function updateResult() {
    const program = selectedProgram();
    if (!program) return;
    const subprogram = subprogramSelect.value;
    const stage = checkedStage();
    const goals = selectedGoals();
    resultCopy.textContent = `You’re exploring ${subprogram || program.label} within ${program.label}.${stage ? ` Your current stage is ${stage.toLowerCase()}.` : ''} Use your selected priorities to guide a conversation with the NewKind care team about medical care, nutrition, movement, and emotional wellbeing support.`;
    resultTags.replaceChildren(...[program.label, subprogram, ...goals].filter(Boolean).map((text) => {
      const tag = document.createElement('span');
      tag.textContent = text;
      return tag;
    }));
  }

  function showStep(step) {
    currentStep = step;
    panels.forEach((panel) => { panel.hidden = Number(panel.dataset.homeQuizPanel) !== step; });
    const percent = Math.round((step / panels.length) * 100);
    stepLabel.textContent = `Step ${step} of ${panels.length}`;
    percentLabel.textContent = `${percent}%`;
    progressBar.style.width = `${percent}%`;
    backButton.hidden = step === 1;
    nextButton.hidden = step >= panels.length;
    submitButton.hidden = step !== panels.length;
    errorMessage.hidden = true;
    if (step === 5) updateResult();
    updateContextualGuidance();
    const firstInput = panels[step - 1].querySelector('input:not([type="hidden"]), select');
    firstInput?.focus({ preventScroll: true });
  }

  function validateStep() {
    const panel = panels[currentStep - 1];
    if (currentStep === 1 && !selectedProgram()) {
      errorMessage.textContent = 'Choose a program to continue.';
      errorMessage.hidden = false;
      programChoices[0]?.focus();
      return false;
    }
    if (currentStep === 2 && !subprogramSelect.value) {
      errorMessage.textContent = 'Choose a program to continue.';
      errorMessage.hidden = false;
      subprogramSelect.focus();
      return false;
    }
    if (currentStep === 2 && !checkedStage()) {
      errorMessage.textContent = 'Choose the stage that best describes you.';
      errorMessage.hidden = false;
      stagesContainer.querySelector('input')?.focus();
      return false;
    }
    if (currentStep === 4) {
      const requiredFields = [...panel.querySelectorAll('input[required]')];
      const invalidField = requiredFields.find((field) => !field.checkValidity());
      if (invalidField) {
        invalidField.reportValidity();
        invalidField.focus();
        return false;
      }
    }
    if (currentStep === 3 && !selectedGoals().length) {
      errorMessage.textContent = 'Select at least one area you would like support with.';
      errorMessage.hidden = false;
      goalsContainer.querySelector('input')?.focus();
      return false;
    }
    errorMessage.hidden = true;
    return true;
  }

  function resetQuiz() {
    form.reset();
    subprogramSelect.replaceChildren();
    stagesContainer.replaceChildren();
    goalsContainer.replaceChildren();
    showStep(1);
  }

  function closeQuiz({ restoreFocus = true } = {}) {
    if (modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('home-quiz-open');
    if (restoreFocus && lastTrigger?.isConnected) lastTrigger.focus();
  }

  document.querySelectorAll('[data-open-home-quiz]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      lastTrigger = trigger;
      resetQuiz();
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('home-quiz-open');
      requestAnimationFrame(() => programChoices[0]?.focus());
    });
  });

  modal.querySelector('[data-close-home-quiz]').addEventListener('click', () => closeQuiz());
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeQuiz();
  });
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeQuiz();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...modal.querySelectorAll('button,input,select,a[href]')]
      .filter((element) => !element.disabled && !element.closest('[hidden]'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  programChoices.forEach((choice) => choice.addEventListener('change', () => {
    updateProgramDetails();
    updateContextualGuidance();
  }));
  subprogramSelect.addEventListener('change', updateContextualGuidance);
  stagesContainer.addEventListener('change', updateContextualGuidance);
  goalsContainer.addEventListener('change', updateContextualGuidance);
  nextButton.addEventListener('click', () => {
    if (currentStep === 1 && selectedProgram()) updateProgramDetails();
    if (validateStep()) showStep(Math.min(currentStep + 1, panels.length));
  });
  backButton.addEventListener('click', () => showStep(Math.max(currentStep - 1, 1)));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (currentStep !== panels.length || !validateStep()) return;

    const values = new FormData(form);
    const message = [
      `Name: ${values.get('name')}`,
      `Email: ${values.get('email')}`,
      `Phone: ${values.get('phone')}`,
      `Main program: ${selectedProgram()?.label || ''}`,
      `Subprogram: ${values.get('subprogram')}`,
      `Current stage: ${values.get('stage')}`,
      `Support priorities: ${values.getAll('goal').join(', ')}`,
      '',
      'Additional information: These are program interests shared through the NewKind website quiz.'
    ].join('\r\n');
    window.location.href = `mailto:hello@newkind.com?subject=${encodeURIComponent('NewKind program finder enquiry')}&body=${encodeURIComponent(message)}`;
  });
})();
