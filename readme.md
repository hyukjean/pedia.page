# 📚 Pedia.page - AI-Powered Flashcard Generator

Pedia.page is an innovative AI-powered learning platform that transforms any topic into interactive flashcards. Using Google's Gemini AI, it creates personalized study materials with an elegant, modern interface featuring dynamic navigation and cross-platform support.

## ✨ Key Features

### 🤖 **AI-Powered Content Generation**
- **Google Gemini Integration**: Leverages Google's advanced AI to generate high-quality flashcards on any topic
- **Smart Content Scaling**: Adaptive card count based on topic complexity (9-18 cards)
- **Multi-Language Support**: Available in English, Japanese, Korean, German, Italian, and Norwegian

### 🎨 **Modern UI/UX Design**
- **Dynamic Island Navigation**: Floating, glassmorphism-style header with smooth animations
- **Liquid Glass Theme**: Clean, translucent design with backdrop blur effects
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Transitions**: Seamless animations between initial view and app state

### 🎯 **Intelligent Learning Controls**
- **Two Detail Levels**:
  - **Basic**: 9-12 cards with concise explanations
  - **Detailed**: 12-18 cards with comprehensive information
- **Card Selection System**: Interactive "+" buttons to combine topics
- **Bottom Input Bar**: Persistent quick-access input after card generation

### 📱 **Cross-Platform Compatibility**
- **PWA Support**: Full Progressive Web App capabilities
- **iOS Optimized**: Perfect home screen icons and native app experience
- **Android Ready**: Material Design compliant with Android Chrome support
- **Desktop Enhanced**: Optimized for keyboard navigation and large screens

## 🏗️ Project Structure

```
pedia.page/
├── index.html              # Main HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── src/                    # Source files
    ├── index.css           # CSS imports (modular)
    ├── index.tsx           # Main application logic
    ├── components/         # Reusable UI components
    │   └── components.tsx  # Flashcard and preview components
    ├── styles/             # Modular CSS files
    │   ├── global.css      # Global variables and base styles
    │   ├── layout.css      # Header, containers, layout
    │   ├── components.css  # UI components (buttons, inputs)
    │   ├── flashcard.css   # Flashcard-specific styles
    │   └── animations.css  # Animations and loading effects
    └── assets/             # Static assets
        ├── favicons/       # Multi-platform icons
        └── images/         # Logo and graphics
```

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, TypeScript
- **Build Tool**: Vite 6.3.5 with TypeScript 5.8.2
- **AI Integration**: Google Gemini API (`@google/genai` v0.12.0)
- **Styling**: Modular CSS with Glassmorphism effects
- **Icons & Assets**: SVG-based with multi-resolution favicon support

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Google Gemini API key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/pedia.page.git
   cd pedia.page
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_API_KEY=your_gemini_api_key_here
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

### 🔧 Development Scripts
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build optimized production bundle  
- `npm run preview`: Preview production build locally

## 📖 How to Use

### Initial Setup
1. Visit the application in your browser
2. You'll see the elegant glassmorphism interface with floating navigation
3. Click the Pedia.page logo to return home at any time

### Creating Flashcards
1. **Enter Your Topic**: Type any subject in the input field (e.g., "Explain photosynthesis")
2. **Choose Detail Level**: 
   - Select **Basic** for essential information (9-12 cards)
   - Select **Detailed** for comprehensive coverage (12-18 cards)
3. **Generate**: Click the "Generate" button and watch the AI create your flashcards
4. **Study**: Review your generated flashcards with clean, readable formatting

### Advanced Features
- **Topic Combination**: Use the "+" buttons to select and combine multiple flashcard topics
- **Language Selection**: Click the globe icon to switch interface languages
- **Mobile Use**: Add to home screen for app-like experience on mobile devices

## 📁 Project Structure

```
pedia.page/
├── 📄 index.html          # Main HTML file
├── 🎨 index.css           # Glassmorphism styles & animations  
├── ⚡ index.tsx           # TypeScript application logic
├── ⚙️ vite.config.ts      # Vite configuration
├── 📝 tsconfig.json       # TypeScript configuration
├── 📦 package.json        # Project dependencies
├── 🔐 .env               # Environment variables (API key)
└── 📁 assets/
    ├── 📁 favicons/       # All platform favicons
    │   ├── 🍎 apple-touch-icon.svg (180x180)
    │   ├── 🤖 android-chrome-*.svg (192x192, 512x512)
    │   ├── 🪟 mstile-150x150.svg
    │   ├── 📱 favicon-*.svg (16x16, 32x32)
    │   └── 📄 site.webmanifest
    ├── 📁 icons/          # Referenced icons
    └── 📁 images/         # Logo assets
        └── 🎨 pedia-logo.svg
```

## 🌟 Notable Features

### 🎭 **Dynamic Island Navigation**
- Floating header that adapts to content
- Smooth glassmorphism effects with backdrop blur
- Responsive sizing for all screen sizes

### 🎯 **Smart Content Generation**  
- Context-aware card count optimization
- Intelligent difficulty level adjustment
- Multi-language content generation

### 📱 **Mobile-First PWA**
- Works offline after first load
- App-like experience on mobile devices
- Perfect iOS home screen integration

### 🔄 **Seamless State Management**
- Smooth transitions between views
- Persistent bottom input bar
- Intelligent UI state preservation

## 🛣️ Future Roadmap

- [ ] **Enhanced Physics Engine**: Interactive card layouts with gravitational effects
- [ ] **User Accounts**: Save and organize flashcard sets
- [ ] **Spaced Repetition**: Intelligent review scheduling
- [ ] **Collaborative Learning**: Share and collaborate on flashcard sets
- [ ] **Advanced Analytics**: Learning progress tracking and insights
- [ ] **Voice Integration**: Audio pronunciation and voice commands
- [ ] **Framework Migration**: Potential React/Vue.js upgrade for complex features

## 📄 License

This project is private and not yet licensed for public use.

---

**Built with ❤️ using modern web technologies and AI innovation**
