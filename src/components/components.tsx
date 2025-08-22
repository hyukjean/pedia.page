// === FLASHCARD COMPONENT SYSTEM ===

// --- TYPE DEFINITIONS ---
export interface Flashcard {
  term: string;
  definition: string;
}

export interface FlashcardCallbacks {
  onCardClick: (flashcard: Flashcard) => void;
  onAddButtonClick: (flashcard: Flashcard) => void;
}

/** Creates a single flashcard element */
export const createFlashcardElement = (
  flashcard: Flashcard, 
  isSelected: boolean,
  callbacks: FlashcardCallbacks
): HTMLDivElement => {
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('flashcard');
  
  if (isSelected) {
    cardDiv.classList.add('selected');
  }

  cardDiv.innerHTML = `
    <div class="flashcard-inner">
      <div class="flashcard-front">
        <button class="add-button" aria-label="${isSelected ? 'Deselect' : 'Select'} ${flashcard.term}">
           <svg class="icon-plus" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
           <svg class="icon-check" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </button>
        <div class="term">${flashcard.term}</div>
      </div>
      <div class="flashcard-back">
        <div class="definition">${flashcard.definition}</div>
      </div>
    </div>
  `;

  // Add event listeners
  cardDiv.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('.add-button')) {
      cardDiv.classList.toggle('flipped');
      callbacks.onCardClick(flashcard);
    }
  });

  const addButton = cardDiv.querySelector('.add-button') as HTMLButtonElement;
  addButton.addEventListener('click', (e) => {
    e.stopPropagation();
    callbacks.onAddButtonClick(flashcard);
  });

  return cardDiv;
};

/** Creates a preview card element for selected cards */
export const createPreviewCardElement = (
  card: Flashcard,
  onRemove: (card: Flashcard) => void
): HTMLDivElement => {
  const previewDiv = document.createElement('div');
  previewDiv.classList.add('preview-card');
  previewDiv.textContent = card.term;

  const removeButton = document.createElement('button');
  removeButton.innerHTML = '&times;';
  removeButton.ariaLabel = `Remove ${card.term}`;
  removeButton.onclick = () => onRemove(card);
  
  previewDiv.appendChild(removeButton);
  return previewDiv;
};

// === INPUT COMPONENT SYSTEM ===

interface InputComponentConfig {
  textareaId: string;
  buttonId: string;
  errorMessageId: string;
  selectedCardsPreviewId: string;
  detailOptions: NodeListOf<HTMLButtonElement>;
  onGenerate: () => Promise<void>;
}

class InputComponent {
  private textarea: HTMLTextAreaElement;
  private button: HTMLButtonElement;
  private errorMessage: HTMLDivElement;
  private selectedCardsPreview: HTMLDivElement;
  private detailOptions: NodeListOf<HTMLButtonElement>;
  private onGenerate: () => Promise<void>;
  private loadingInterval?: number;

  constructor(config: InputComponentConfig) {
    this.textarea = document.getElementById(config.textareaId) as HTMLTextAreaElement;
    this.button = document.getElementById(config.buttonId) as HTMLButtonElement;
    this.errorMessage = document.getElementById(config.errorMessageId) as HTMLDivElement;
    this.selectedCardsPreview = document.getElementById(config.selectedCardsPreviewId) as HTMLDivElement;
    this.detailOptions = config.detailOptions;
    this.onGenerate = config.onGenerate;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Button click
    this.button.addEventListener('click', async () => {
      await this.handleGenerate();
    });

    // Enter key functionality
    this.textarea.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        await this.handleGenerate();
      }
    });

    // Auto-resize textarea
    this.textarea.addEventListener('input', () => {
      this.autoResize();
    });

    // Detail option selection
    this.detailOptions.forEach(option => {
      option.addEventListener('click', () => {
        this.detailOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        // Update global contentDetail
        (window as any).contentDetail = option.dataset.detail as 'basic' | 'detailed';
      });
    });
  }

  private autoResize(): void {
    this.textarea.style.height = 'auto';
    this.textarea.style.height = Math.min(this.textarea.scrollHeight, 120) + 'px';
  }

  private showLoadingAnimation(): number {
    const messages = [
      'Making clear...',
      'Processing knowledge...',
      'Organizing thoughts...',
      'Almost ready...'
    ];
    
    let messageIndex = 0;
    const interval = setInterval(() => {
      const message = messages[messageIndex];
      this.errorMessage.innerHTML = `<span class="loading-text typing-animation">${message}</span>`;
      messageIndex = (messageIndex + 1) % messages.length;
    }, 1500);
    
    return interval;
  }

  private async handleGenerate(): Promise<void> {
    const topic = this.textarea.value.trim();
    const selectedCards = (window as any).selectedCards || [];

    if (!topic && selectedCards.length === 0) {
      const translations = (window as any).translations;
      const currentLanguage = (window as any).currentLanguage;
      this.errorMessage.textContent = translations[currentLanguage]['errorTopic'];
      return;
    }

    this.loadingInterval = this.showLoadingAnimation();
    this.button.disabled = true;

    try {
      await this.onGenerate();
      this.clearError();
      this.clearInput();
    } catch (error) {
      console.error('Generation error:', error);
      this.showError('An error occurred while generating cards.');
    } finally {
      this.clearLoading();
      this.button.disabled = false;
    }
  }

  public showError(message: string): void {
    this.clearLoading();
    this.errorMessage.textContent = message;
  }

  public clearError(): void {
    this.clearLoading();
    this.errorMessage.textContent = '';
  }

  private clearLoading(): void {
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
      this.loadingInterval = undefined;
    }
  }

  private clearInput(): void {
    this.textarea.value = '';
    this.autoResize();
  }

  public getValue(): string {
    return this.textarea.value.trim();
  }
}

// Export for global use
(window as any).InputComponent = InputComponent;
