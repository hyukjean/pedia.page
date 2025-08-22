/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI } from '@google/genai';
import { 
  createFlashcardElement, 
  createPreviewCardElement, 
  type Flashcard, 
  type FlashcardCallbacks 
} from './components/components.tsx';

// --- TYPE DEFINITIONS ---
type Language = 'en' | 'ja' | 'ko' | 'de' | 'it' | 'no';

type Translations = Record<string, string>;

// --- DOM ELEMENT SELECTION ---
const topicInput = document.getElementById('topicInput') as HTMLTextAreaElement;
const flashcardsContainer = document.getElementById('flashcardsContainer') as HTMLDivElement;
const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
const chatbotWindow = document.getElementById('chatbotWindow') as HTMLDivElement;
const chatbotHeader = chatbotWindow.querySelector('.modal-header') as HTMLDivElement;
const languageSelectorButton = document.getElementById('languageSelectorButton') as HTMLButtonElement;
const languageDropdown = document.getElementById('languageDropdown') as HTMLUListElement;
const selectedCardsPreview = document.getElementById('selectedCardsPreview') as HTMLDivElement;
const detailOptions = document.querySelectorAll('.detail-option') as NodeListOf<HTMLButtonElement>;
const logoLink = document.getElementById('logoLink') as HTMLAnchorElement;

// Bottom bar elements
const bottomInputBar = document.getElementById('bottomInputBar') as HTMLDivElement;
const topicInputBottom = document.getElementById('topicInputBottom') as HTMLTextAreaElement;
const selectedCardsPreviewBottom = document.getElementById('selectedCardsPreviewBottom') as HTMLDivElement;
const detailOptionsBottom = document.querySelectorAll('.detail-option-bottom') as NodeListOf<HTMLButtonElement>;
const errorMessageBottom = document.getElementById('errorMessageBottom') as HTMLDivElement;

// --- APPLICATION STATE ---
let currentFlashcards: Flashcard[] = [];
let selectedCards: Flashcard[] = [];
let currentLanguage: Language = 'en';
let placeholderInterval: number;
let isInitialView = true;
let contentDetail: 'basic' | 'detailed' = 'basic';


// --- I18N TRANSLATIONS ---
const translations: Record<Language, Translations> = {
  en: {
    appDescription: "Select cards with '+' to combine topics or create a new topic to get started.",
    createTopicButton: 'Create New Topic',
    modalTitle: 'Ask away',
    placeholder: 'e.g., Explain the fall of the Roman Empire',
    generateButton: 'Generate',
    cardsLabel: 'Number of Cards:',
    detailBasic: 'Basic',
    detailDetailed: 'Detailed',
    errorTopic: 'Please enter a topic.',
    errorGenerating: 'Making clear...',
    errorNoCards: 'Unable to generate valid flashcards. Please try a different topic.',
    errorEmptyResponse: 'Failed to generate flashcards or received empty response. Please try again.',
    errorUnknown: 'An error occurred: ',
    generating: 'Making knowledge clear...',
  },
  ja: {
    appDescription: "「+」でカードを選択してトピックを組み合わせるか、新しいトピックを作成して開始します。",
    createTopicButton: '新しいトピックを作成',
    modalTitle: '新しいカードを生成',
    placeholder: '例：ローマ帝国の崩壊を説明してください',
    generateButton: '生成する',
    cardsLabel: 'カードの枚数：',
    detailBasic: '基本',
    detailDetailed: '詳細',
    errorTopic: 'トピックを入力してください。',
    errorGenerating: 'カードを生成しています...',
    errorNoCards: '有効なフラッシュカードを生成できませんでした。別のトピックをお試しください。',
    errorEmptyResponse: 'フラッシュカードの生成に失敗したか、空の応答を受信しました。もう一度お試しください。',
    errorUnknown: 'エラーが発生しました：',
    generating: 'フラッシュカードを生成しています...',
  },
  ko: {
    appDescription: "'+'로 카드를 선택하여 주제를 결합하거나 새 주제를 만들어 시작하세요.",
    createTopicButton: '새 주제 만들기',
    modalTitle: '새 카드 생성',
    placeholder: '예: 로마 제국의 멸망을 설명하시오',
    generateButton: '생성하기',
    cardsLabel: '카드 수:',
    detailBasic: '기본',
    detailDetailed: '상세',
    errorTopic: '주제를 입력하세요.',
    errorGenerating: '명확하게 만드는 중...',
    errorNoCards: '유효한 플래시카드를 생성할 수 없습니다. 다른 주제를 시도해 보세요.',
    errorEmptyResponse: '플래시카드를 생성하지 못했거나 빈 응답을 받았습니다. 다시 시도해 주세요.',
    errorUnknown: '오류가 발생했습니다: ',
    generating: '지식을 명확하게 정리하는 중...',
  },
  de: {
    appDescription: "Wähle Karten mit '+' aus, um Themen zu kombinieren, oder erstelle ein neues Thema, um zu beginnen.",
    createTopicButton: 'Neues Thema erstellen',
    modalTitle: 'Neue Karten generieren',
    placeholder: 'z.B. Erklären Sie den Untergang des Römischen Reiches',
    generateButton: 'Generieren',
    cardsLabel: 'Anzahl der Karten:',
    detailBasic: 'Grundlegend',
    detailDetailed: 'Detailliert',
    errorTopic: 'Bitte geben Sie ein Thema ein.',
    errorGenerating: 'Karten werden generiert...',
    errorNoCards: 'Es konnten keine gültigen Lernkarten generiert werden. Bitte versuchen Sie ein anderes Thema.',
    errorEmptyResponse: 'Fehler beim Generieren der Lernkarten oder leere Antwort erhalten. Bitte versuchen Sie es erneut.',
    errorUnknown: 'Ein Fehler ist aufgetreten: ',
    generating: 'Lernkarten werden generiert...',
  },
  it: {
    appDescription: "Seleziona le carte con '+' per combinare argomenti o crea un nuovo argomento per iniziare.",
    createTopicButton: 'Crea Nuovo Argomento',
    modalTitle: 'Genera Nuove Carte',
    placeholder: 'es. Spiega la caduta dell\'Impero Romano',
    generateButton: 'Genera',
    cardsLabel: 'Numero di Carte:',
    detailBasic: 'Base',
    detailDetailed: 'Dettagliato',
    errorTopic: 'Inserisci un argomento.',
    errorGenerating: 'Generazione delle carte in corso...',
    errorNoCards: 'Impossibile generare flashcard valide. Prova un argomento diverso.',
    errorEmptyResponse: 'Impossibile generare flashcard o risposta vuota ricevuta. Riprova.',
    errorUnknown: 'Si è verificato un errore: ',
    generating: 'Sto generando le flashcard...',
  },
  no: {
    appDescription: "Velg kort med '+' for å kombinere emner, eller opprett et nytt emne for å begynne.",
    createTopicButton: 'Opprett Nytt Emne',
    modalTitle: 'Generer Nye Kort',
    placeholder: 'f.eks. Forklar Romerrikets fall',
    generateButton: 'Generer',
    cardsLabel: 'Antall Kort:',
    detailBasic: 'Grunnleggende',
    detailDetailed: 'Detaljert',
    errorTopic: 'Vennligst skriv inn et emne.',
    errorGenerating: 'Genererer kort...',
    errorNoCards: 'Kunne ikke generere gyldige flashkort. Prøv et annet emne.',
    errorEmptyResponse: 'Kunne ikke generere flashkort eller mottok tomt svar. Vennligst prøv igjen.',
    errorUnknown: 'En feil oppstod: ',
    generating: 'Genererer flashkort...',
  },
};
const placeholderExamples: Record<Language, string[]> = {
  en: ['Explain the process of photosynthesis', 'What are the core principles of Stoicism?', 'Summarize the plot of Hamlet', 'How does a blockchain work?'],
  ja: ['光合成のプロセスを説明してください', 'ストア派の核となる原則は何ですか？', 'ハムレットのあらすじを要約してください', 'ブロックチェーンはどのように機能しますか？'],
  ko: ['광합성 과정을 설명해주세요', '스토아학파의 핵심 원칙은 무엇인가요?', '햄릿의 줄거리를 요약해주세요', '블록체인은 어떻게 작동하나요?'],
  de: ['Erklären Sie den Prozess der Photosynthese', 'Was sind die Grundprinzipien des Stoizismus?', 'Fassen Sie die Handlung von Hamlet zusammen', 'Wie funktioniert eine Blockchain?'],
  it: ['Spiega il processo della fotosintesi', 'Quali sono i principi fondamentali dello Stoicismo?', 'Riassumi la trama di Amleto', 'Come funziona una blockchain?'],
  no: ['Forklar prosessen med fotosyntese', 'Hva er kjerneprinsippene i stoisismen?', 'Oppsummer handlingen i Hamlet', 'Hvordan fungerer en blokkjede?'],
};

// --- API INITIALIZATION ---
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

// --- UI LOGIC ---

/** Gets the card count range based on current detail setting */
const getCardCount = () => {
  const ranges = {
    basic: { min: 9, max: 12 },
    detailed: { min: 12, max: 18 }
  };
  const range = ranges[contentDetail];
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
};

/** Switches the UI from initial centered view to the main app view */
const activateAppView = () => {
    if (isInitialView) {
        isInitialView = false;
        document.body.classList.add('app-active');
        // Show bottom input bar
        bottomInputBar.classList.remove('hidden');
        // Clear initial input
        topicInput.value = '';
    }
};

/** Updates all UI text based on the current language */
const setLanguage = (lang: Language) => {
  currentLanguage = lang;
  document.documentElement.lang = lang;
  const translation = translations[lang];
  document.querySelectorAll('[data-translate-key]').forEach((el) => {
    const key = el.getAttribute('data-translate-key');
    if (key && translation[key]) {
      el.textContent = translation[key];
    }
  });

  if (currentFlashcards.length > 0) {
    currentFlashcards = [];
    selectedCards = [];
    flashcardsContainer.innerHTML = '';
    renderSelectedCardsPreview();
  }

  startPlaceholderAnimation();
};

/** Starts the dynamic placeholder animation */
const startPlaceholderAnimation = () => {
  clearInterval(placeholderInterval);
  const examples = placeholderExamples[currentLanguage];
  let currentExampleIndex = 0;

  const animate = () => {
    if (document.activeElement === topicInput || topicInput.value !== '') {
        topicInput.placeholder = translations[currentLanguage]['placeholder'];
        return;
    }
    topicInput.placeholder = examples[currentExampleIndex];
    currentExampleIndex = (currentExampleIndex + 1) % examples.length;
  };

  animate();
  placeholderInterval = window.setInterval(animate, 3000);
};


/** Renders the small preview cards in the modal */
const renderSelectedCardsPreview = () => {
  // Update main preview
  selectedCardsPreview.innerHTML = '';
  // Update bottom preview
  selectedCardsPreviewBottom.innerHTML = '';
  
  selectedCards.forEach((card) => {
    const previewElement = createPreviewCardElement(card, (cardToRemove) => {
      const cardEl = Array.from(document.querySelectorAll('.flashcard')).find(el => 
        el.querySelector('.term')?.textContent === cardToRemove.term
      );
      toggleCardSelection(cardToRemove, cardEl as HTMLDivElement | null);
    });
    
    const bottomPreviewElement = createPreviewCardElement(card, (cardToRemove) => {
      const cardEl = Array.from(document.querySelectorAll('.flashcard')).find(el => 
        el.querySelector('.term')?.textContent === cardToRemove.term
      );
      toggleCardSelection(cardToRemove, cardEl as HTMLDivElement | null);
    });
    
    selectedCardsPreview.appendChild(previewElement);
    selectedCardsPreviewBottom.appendChild(bottomPreviewElement);
  });
};

/** Toggles a card's selected state */
const toggleCardSelection = (card: Flashcard, cardDiv: HTMLDivElement | null) => {
  const index = selectedCards.findIndex(sc => sc.term === card.term);
  if (index > -1) {
    selectedCards.splice(index, 1);
  } else {
    selectedCards.push(card);
  }

  document.querySelectorAll('.flashcard').forEach(el => {
      const elTerm = el.querySelector('.term')?.textContent;
      if (elTerm === card.term) {
          const addButton = el.querySelector('.add-button');
          if (index > -1) {
              el.classList.remove('selected');
              addButton?.setAttribute('aria-label', `Select ${card.term}`);
          } else {
              el.classList.add('selected');
              addButton?.setAttribute('aria-label', `Deselect ${card.term}`);
          }
      }
  });

  renderSelectedCardsPreview();
};

/** Creates and displays flashcard elements */
const displayFlashcards = (flashcards: Flashcard[]) => {
  currentFlashcards = flashcards;
  flashcardsContainer.innerHTML = '';
  
  const callbacks: FlashcardCallbacks = {
    onCardClick: (flashcard) => {
      // Card flip is handled by CSS, no additional logic needed
    },
    onAddButtonClick: (flashcard) => {
      const cardDiv = Array.from(document.querySelectorAll('.flashcard')).find(el => 
        el.querySelector('.term')?.textContent === flashcard.term
      ) as HTMLDivElement;
      toggleCardSelection(flashcard, cardDiv);
    }
  };

  flashcards.forEach((flashcard) => {
    const isSelected = selectedCards.some(sc => sc.term === flashcard.term);
    const cardElement = createFlashcardElement(flashcard, isSelected, callbacks);
    flashcardsContainer.appendChild(cardElement);
  });
};

// --- LOGO NAVIGATION ---
logoLink.addEventListener('click', (e) => {
  e.preventDefault();
  
  // Reset to initial view
  if (!isInitialView) {
    // Reset state
    currentFlashcards = [];
    selectedCards = [];
    isInitialView = true;
    contentDetail = 'basic';
    
    // Clear inputs
    topicInput.value = '';
    topicInputBottom.value = '';
    
    // Clear error messages
    errorMessage.textContent = '';
    errorMessageBottom.textContent = '';
    
    // Reset flashcards container
    flashcardsContainer.innerHTML = '';
    
    // Update previews
    renderSelectedCardsPreview();
    selectedCardsPreviewBottom.innerHTML = ''; // Clear bottom preview
    
    // Reset detail options
    detailOptions.forEach(opt => opt.classList.remove('active'));
    detailOptionsBottom.forEach(opt => opt.classList.remove('active'));
    detailOptions[0]?.classList.add('active'); // Default to basic
    detailOptionsBottom[0]?.classList.add('active'); // Default to basic
    
    // Return to initial view
    document.body.classList.remove('app-active');
  }
});

// === INPUT SYSTEM SETUP ===
// Enhanced loading animation function
function showLoadingAnimation(errorElement: HTMLDivElement): any {
  const messages = [
    'Making clear...',
    'Processing knowledge...',
    'Organizing thoughts...',
    'Almost ready...'
  ];
  
  let messageIndex = 0;
  const interval = setInterval(() => {
    const message = messages[messageIndex];
    errorElement.innerHTML = `<span class="loading-text flowing-gradient flowing-gradient--slow">${message}</span>`;
    messageIndex = (messageIndex + 1) % messages.length;
  }, 1500);
  
  return interval;
}

// Auto-resize textarea function
function setupAutoResize(textarea: HTMLTextAreaElement): void {
  // For single line input, keep fixed height
  textarea.style.height = '42px';
}

// Animated placeholder system
function setupAnimatedPlaceholder(textareaWrapper: HTMLElement, textarea: HTMLTextAreaElement): void {
  const placeholderElement = document.createElement('div');
  placeholderElement.className = 'animated-placeholder';
  textareaWrapper.appendChild(placeholderElement);

  const prompts = [
    'What would you like to learn about?',
    'Add new cards...',
    'Explain quantum computing...',
    'How does photosynthesis work?',
    'Tell me about the Renaissance...',
    'What is machine learning?'
  ];

  let currentPromptIndex = 0;
  let currentText = '';
  let isTyping = false;

  function typeText(text: string, callback?: () => void) {
    if (isTyping || textarea.value.trim() !== '') return;
    isTyping = true;
    currentText = '';
    let charIndex = 0;

    // Add flowing gradient class when typing starts
    placeholderElement.classList.add('flowing-gradient');

    const typeInterval = setInterval(() => {
      if (textarea.value.trim() !== '') {
        clearInterval(typeInterval);
        isTyping = false;
        placeholderElement.classList.remove('flowing-gradient');
        return;
      }
      
      if (charIndex < text.length) {
        currentText += text[charIndex];
        placeholderElement.textContent = currentText;
        charIndex++;
      } else {
        clearInterval(typeInterval);
        isTyping = false;
        // Keep gradient for a moment after typing
        setTimeout(() => {
          placeholderElement.classList.remove('flowing-gradient');
        }, 500);
        if (callback) callback();
      }
    }, 50);
  }

  function fadeOut(callback: () => void) {
    placeholderElement.style.transition = 'opacity 0.5s ease';
    placeholderElement.style.opacity = '0';
    setTimeout(() => {
      callback();
      placeholderElement.style.opacity = '1';
    }, 500);
  }

  function cyclePrompts() {
    if (textarea.value.trim() === '') {
      const prompt = prompts[currentPromptIndex];
      fadeOut(() => {
        typeText(prompt, () => {
          setTimeout(() => {
            currentPromptIndex = (currentPromptIndex + 1) % prompts.length;
            cyclePrompts();
          }, 2000);
        });
      });
    } else {
      setTimeout(cyclePrompts, 1000);
    }
  }

  textarea.addEventListener('input', () => {
    if (textarea.value.trim() !== '') {
      placeholderElement.classList.add('hidden');
    } else {
      placeholderElement.classList.remove('hidden');
      if (!isTyping) {
        setTimeout(cyclePrompts, 500);
      }
    }
  });

  textarea.addEventListener('focus', () => {
    if (textarea.value.trim() !== '') {
      placeholderElement.classList.add('hidden');
    }
  });

  textarea.addEventListener('blur', () => {
    if (textarea.value.trim() === '') {
      placeholderElement.classList.remove('hidden');
    }
  });

  // Start the animation cycle
  typeText(prompts[0], () => {
    setTimeout(() => {
      currentPromptIndex = 1;
      cyclePrompts();
    }, 2000);
  });
}

// --- MAIN INPUT SYSTEM ---
async function handleMainGenerate() {
  const topic = topicInput.value.trim();
  const combinedTopics = selectedCards.map(c => c.term).join(', ');

  if (!topic && selectedCards.length === 0) {
    errorMessage.textContent = translations[currentLanguage]['errorTopic'];
    return;
  }

  errorMessage.textContent = translations[currentLanguage]['generating'];
  topicInput.disabled = true;

  try {
    const languageName = new Intl.DisplayNames([currentLanguage], { type: 'language' }).of(currentLanguage);
    const cardCountValue = getCardCount();
    let prompt = `Generate ${cardCountValue} flashcards. Each flashcard should have a term and a definition. The flashcards should be in ${languageName}.`;

    if (contentDetail === 'detailed') {
      prompt += ' The definition should be detailed and comprehensive.';
    } else {
      prompt += ' The definition should be concise.';
    }

    if (selectedCards.length > 0) {
        prompt += ` The topic should explore the connections between: ${combinedTopics}.`;
        if (topic) {
            prompt += ` Also, incorporate this related concept: "${topic}".`;
        }
    } else {
        prompt += ` The topic is "${topic}".`;
    }

    prompt += ` Format the output as a list of "Term: Definition" pairs, with each pair on a new line. Do not include numbering or bullet points. Example:
Hello: Bonjour
Goodbye: Au revoir`;

    const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    const responseText = result?.text ?? '';

    if (responseText) {
      const newFlashcards: Flashcard[] = responseText
        .split('\n')
        .map((line) => {
          const parts = line.split(':');
          if (parts.length >= 2 && parts[0].trim()) {
            const term = parts[0].trim().replace(/^\*\s*/, '');
            const definition = parts.slice(1).join(':').trim();
            if (definition) return { term, definition };
          }
          return null;
        })
        .filter((card): card is Flashcard => card !== null);

      if (newFlashcards.length > 0) {
        errorMessage.textContent = '';
        displayFlashcards(newFlashcards);
        activateAppView();
        selectedCards = [];
        renderSelectedCardsPreview();
        topicInput.value = '';
      } else {
        errorMessage.textContent = translations[currentLanguage]['errorNoCards'];
      }
    } else {
      errorMessage.textContent = translations[currentLanguage]['errorEmptyResponse'];
    }
  } catch (error: unknown) {
    console.error('Error generating content:', error);
    const detailedError = (error as Error)?.message || 'An unknown error occurred';
    errorMessage.textContent = `${translations[currentLanguage]['errorUnknown']}${detailedError}`;
  } finally {
    topicInput.disabled = false;
  }
}

// --- EVENT LISTENERS ---
detailOptions.forEach(option => {
    option.addEventListener('click', () => {
        detailOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        contentDetail = option.dataset.detail as 'basic' | 'detailed';
    });
});

// Bottom bar event listeners
detailOptionsBottom.forEach(option => {
    option.addEventListener('click', () => {
        detailOptionsBottom.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        contentDetail = option.dataset.detail as 'basic' | 'detailed';
    });
});

// Add Enter key functionality
topicInputBottom.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    await handleGenerate();
  }
});

async function handleGenerate() {
  const topic = topicInputBottom.value.trim();
  const combinedTopics = selectedCards.map(c => c.term).join(', ');

  if (!topic && selectedCards.length === 0) {
    errorMessageBottom.textContent = translations[currentLanguage]['errorTopic'];
    return;
  }

  const loadingInterval = showLoadingAnimation(errorMessageBottom);
  topicInputBottom.disabled = true;

  try {
    const languageName = new Intl.DisplayNames([currentLanguage], { type: 'language' }).of(currentLanguage);
    const cardCountValue = getCardCount();
    let prompt = `Generate ${cardCountValue} flashcards. Each flashcard should have a term and a definition. The flashcards should be in ${languageName}.`;

    if (contentDetail === 'detailed') {
      prompt += ' The definition should be detailed and comprehensive.';
    } else {
      prompt += ' The definition should be concise.';
    }

    if (selectedCards.length > 0) {
        prompt += ` The topic should explore the connections between: ${combinedTopics}.`;
        if (topic) {
            prompt += ` Also, incorporate this related concept: "${topic}".`;
        }
    } else {
        prompt += ` The topic is "${topic}".`;
    }

    prompt += ` Format the output as a list of "Term: Definition" pairs, with each pair on a new line. Do not include numbering or bullet points. Example:
Hello: Bonjour
Goodbye: Au revoir`;

    const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    const responseText = result?.text ?? '';

    if (responseText) {
      const newFlashcards: Flashcard[] = responseText
        .split('\n')
        .map((line) => {
          const parts = line.split(':');
          if (parts.length >= 2 && parts[0].trim()) {
            const term = parts[0].trim().replace(/^\*\s*/, '');
            const definition = parts.slice(1).join(':').trim();
            if (definition) return { term, definition };
          }
          return null;
        })
        .filter((card): card is Flashcard => card !== null);

      if (newFlashcards.length > 0) {
        clearInterval(loadingInterval);
        errorMessageBottom.textContent = '';
        displayFlashcards(newFlashcards);
        selectedCards = [];
        renderSelectedCardsPreview();
        topicInputBottom.value = '';
      } else {
        clearInterval(loadingInterval);
        errorMessageBottom.textContent = translations[currentLanguage]['errorNoCards'];
      }
    } else {
      clearInterval(loadingInterval);
      errorMessageBottom.textContent = translations[currentLanguage]['errorEmptyResponse'];
    }
  } catch (error: unknown) {
    clearInterval(loadingInterval);
    console.error('Error generating content:', error);
    const detailedError = (error as Error)?.message || 'An unknown error occurred';
    errorMessageBottom.textContent = `${translations[currentLanguage]['errorUnknown']}${detailedError}`;
  } finally {
    topicInputBottom.disabled = false;
  }
}

languageSelectorButton.addEventListener('click', (e) => {
    e.stopPropagation();
    languageDropdown.classList.toggle('hidden');
});

languageDropdown.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName === 'LI') {
    const lang = target.dataset.lang as Language;
    if (lang) {
      setLanguage(lang);
      languageDropdown.classList.add('hidden');
    }
  }
});

document.addEventListener('click', (e) => {
    if(!languageDropdown.classList.contains('hidden')) {
        languageDropdown.classList.add('hidden');
    }
});

detailOptions.forEach(option => {
    option.addEventListener('click', () => {
        detailOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        contentDetail = option.dataset.detail as 'basic' | 'detailed';
    });
});

chatbotWindow.addEventListener('click', e => e.stopPropagation());

// === INPUT SYSTEM INITIALIZATION ===
// Main input system
topicInput.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    await handleMainGenerate();
  }
});

// Bottom input system
topicInputBottom.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    await handleGenerate();
  }
});

// Setup auto-resize for textareas
setupAutoResize(topicInput);
setupAutoResize(topicInputBottom);

// Setup animated placeholders
const mainTextareaWrapper = document.querySelector('#topicInput').parentElement as HTMLElement;
const bottomTextareaWrapper = document.querySelector('#topicInputBottom').parentElement as HTMLElement;

setupAnimatedPlaceholder(mainTextareaWrapper, topicInput);
setupAnimatedPlaceholder(bottomTextareaWrapper, topicInputBottom);

// Bottom detail options
detailOptionsBottom.forEach(option => {
    option.addEventListener('click', () => {
        detailOptionsBottom.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        contentDetail = option.dataset.detail as 'basic' | 'detailed';
    });
});

// --- INITIALIZATION ---
setLanguage('en');
topicInput.focus();
startPlaceholderAnimation();