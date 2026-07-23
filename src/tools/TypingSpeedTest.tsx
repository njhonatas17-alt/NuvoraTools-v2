import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Keyboard,
  RotateCcw,
  Volume2,
  VolumeX,
  Share2,
  Copy,
  Check,
  Star,
  Zap,
  Award,
  Clock,
  Target,
  BarChart2,
  Trash2,
  Maximize2,
  Minimize2,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  Code,
  Hash,
  Quote,
  ShieldAlert,
  Globe
} from 'lucide-react';
import { useTranslation } from '../i18n/i18nContext';
import {
  copyToClipboard,
  triggerConfetti,
  getFavoriteToolIds,
  toggleFavoriteTool,
  trackRecentlyUsedTool,
} from '../lib/utils';

// Sound Synth Helper (Web Audio API - no external assets needed)
const playSoundEffect = (type: 'key' | 'error' | 'finish' | 'record', soundEnabled: boolean) => {
  if (!soundEnabled) return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'key') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'finish' || type === 'record') {
      const notes = type === 'record' ? [523.25, 659.25, 783.99, 1046.50] : [440, 554.37, 659.25];
      notes.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        g.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.07);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.07 + 0.25);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(ctx.currentTime + idx * 0.07);
        o.stop(ctx.currentTime + idx * 0.07 + 0.25);
      });
    }
  } catch {
    // Ignore audio autoplay restrictions
  }
};

// Text Corpora per Language & Game Mode
const TEXT_CORPUS: Record<string, Record<string, string[]>> = {
  en: {
    classic: [
      'Technology evolves rapidly every single day empowering developers worldwide to construct high performance applications.',
      'The key to mastering touch typing is maintaining steady rhythm, correct finger posture, and consistent daily practice.',
      'Software engineering combines creative problem solving, algorithmic thinking, and methodical attention to user experience details.',
      'Building accessible web tools guarantees that everyone regardless of ability can interact seamlessly with digital services.',
      'Modern web browsers execute JavaScript at lightning speeds enabling rich interactive desktop-class experiences right in the cloud.'
    ],
    random: [
      'system cloud code function data variable reactive network speed index array object logic algorithm compile render state',
      'keyboard monitor stream interface module layout design server client async promise future stream signal focus shadow context',
      'digital platform metric visual optimize terminal build deploy pipeline microservice security session storage vector token'
    ],
    numbers: [
      'In 2026 sales grew by 14.5% reaching $1,250,000 across 3,450 transactions averaging $362.31 per order.',
      'Version 4.18.2 reduced bundle latency by 42ms resulting in 99.99% uptime for over 50,000 active concurrent users.',
      'Coordinates at 37.7749 N and 122.4194 W recorded temperature variations between -5.4°C and +32.8°C across 365 days.'
    ],
    code: [
      'const calculateWpm = (chars: number, timeInSeconds: number) => Math.round((chars / 5) / (timeInSeconds / 60));',
      'function useDebounce<T>(value: T, delay: number): T { const [debounced, setDebounced] = useState(value); return debounced; }',
      'export const fetchUserData = async (id: string): Promise<User> => { const res = await fetch(`/api/user/${id}`); return res.json(); };'
    ],
    quotes: [
      'Simplicity is prerequisite for reliability. Software engineering is the art of structuring complex logic simply.',
      'First do it, then do it right, then do it better. Continuous iteration is the secret to remarkable craftsmanship.',
      'Programs must be written for people to read, and only incidentally for machines to execute effortlessly.'
    ],
    programmer: [
      'Git commit push merge rebase cherry-pick checkout branch stash fetch pull rebase origin main release patch v2.0.0',
      'Docker container Kubernetes pod deployment ingress service configmap secret volume cluster scaling auto-repair node',
      'React useEffect useState useMemo useCallback useRef useContext useReducer props state JSX component shadow DOM Virtual DOM'
    ],
    noPunctuation: [
      'typing fast requires focus and muscle memory without looking down at the keyboard keys everyday practice improves wpm',
      'clean code is easy to read maintain scale and test across distributed teams building modern web applications'
    ],
    hard: [
      'Cryptographic hashes like SHA-256 (e.g., 0x8f4a2b9e) ensure immutable data integrity across distributed P2P protocols!',
      'Optimizing O(N log N) sorting algorithms with ~98.6% efficiency requires profiling RAM allocations & cache line hits?'
    ]
  },
  pt: {
    classic: [
      'A tecnologia evolui rapidamente todos os dias capacitando desenvolvedores em todo o mundo a criar aplicações de alta performance.',
      'O segredo para dominar a digitação é manter um ritmo constante, postura correta dos dedos e prática diária consistente.',
      'A engenharia de software combina resolução criativa de problemas, raciocínio algorítmico e atenção aos detalhes da experiência.',
      'Construir ferramentas web acessíveis garante que todas as pessoas possam interagir perfeitamente com os serviços digitais.',
      'Os navegadores modernos executam código a velocidades impressionantes permitindo experiências ricas no cliente.'
    ],
    random: [
      'sistema nuvem código função dados variável rede velocidade índice vetor objeto lógica algoritmo compilar renderizar estado',
      'teclado monitor interface módulo layout servidor cliente assíncrono promessa sinal foco contexto memória registro token',
      'plataforma digital métrica visual otimizar terminal compilar segurança sessão armazenamento estrutura evento resposta'
    ],
    numbers: [
      'Em 2026 as vendas cresceram 15,8% atingindo R$ 1.450.000 em 4.200 transações com média de R$ 345,20 por pedido.',
      'A versão 3.12.0 reduziu a latência em 45ms garantindo 99,9% de disponibilidade para mais de 80.000 usuários ativos.'
    ],
    code: [
      'const calcularVelocidade = (caracteres: number, tempoSegundos: number) => Math.round((caracteres / 5) / (tempoSegundos / 60));',
      'const [status, setStatus] = useState<string>("aguardando"); useEffect(() => { console.log(status); }, [status]);'
    ],
    quotes: [
      'A simplicidade é o último grau de sofisticação. Código limpo e intuitivo supera qualquer estrutura desnecessariamente complexa.',
      'A melhor forma de prever o futuro é construí-lo através de inovação, dedicação diária e excelente execução técnica.'
    ],
    programmer: [
      'Desenvolvimento web frontend backend banco de dados PostgreSQL React TypeScript Tailwind CSS Vite Node.js API REST GraphQL',
      'Estrutura de dados pilha fila árvore grafo ordenação busca binária complexidade de tempo espaço armazenamento em memória'
    ],
    noPunctuation: [
      'digitar rapidamente exige foco e memória muscular sem olhar para o teclado a prática diária melhora sua precisão e velocidade',
      'desenvolver software de qualidade exige atenção aos detalhes testes automatizados e foco constante na experiência do usuário'
    ],
    hard: [
      'Chaves criptográficas de 256-bits (ex: 0x9f3b1a7e) garantem total segurança em transações financeiras digitais via HTTPS!',
      'Qual o impacto da latência de ~12.4ms em redes 5G ao processar 100.000 requisições simultâneas em servidores distribuídos?'
    ]
  },
  es: {
    classic: [
      'La tecnología evoluciona rápidamente cada día permitiendo a los desarrolladores crear aplicaciones de alto rendimiento.',
      'La clave para dominar la mecanografía es mantener un ritmo constante, una postura correcta de los dedos y práctica diaria.',
      'La ingeniería de software combina resolución creativa de problemas, pensamiento algorítmico y atención al detalle de usuario.'
    ],
    random: [
      'sistema nube código función datos variable red velocidad índice matriz objeto lógica algoritmo compilar estado',
      'teclado monitor interfaz módulo diseño servidor cliente asíncrono señal foco contexto memoria registro token'
    ],
    numbers: [
      'En 2026 las ventas aumentaron un 18.2% alcanzando $2,350,000 en 5,100 transacciones con un promedio de $460.78.',
      'La actualización v2.4 redujo la latencia en 38ms logrando un 99.9% de disponibilidad para 65,000 usuarios activos.'
    ],
    code: [
      'const obtenerDatos = async (url: string): Promise<Resultado> => { const respuesta = await fetch(url); return respuesta.json(); };'
    ],
    quotes: [
      'La simplicidad es el requisito previo para la fiabilidad. El código limpio siempre resulta más fácil de mantener y escalar.'
    ],
    programmer: [
      'Desarrollo web frontend backend base de datos React TypeScript Tailwind CSS Vite Node REST API Docker microservicios'
    ],
    noPunctuation: [
      'mecanografiar rápido requiere enfoque y memoria muscular sin mirar el teclado la práctica diaria mejora la precisión',
      'el código limpio es fácil de leer mantener y escalar en equipos distribuidos de desarrollo web'
    ],
    hard: [
      '¡Los hashes de 256 bits (ej. 0x7a8f9c) garantizan integridad en redes P2P distribuidas con una precisión del 99.9%!'
    ]
  },
  fr: {
    classic: [
      'La technologie évolue rapidement chaque jour permettant aux développeurs de créer des applications web très performantes.',
      'La clé pour maîtriser la dactylographie est de maintenir un rythme régulier, une bonne posture et une pratique quotidienne.'
    ],
    random: [
      'système nuage code fonction données variable réseau vitesse indice tableau objet logique algorithme état',
      'clavier écran interface module serveur client asynchrone signal focus contexte mémoire registre jeton'
    ],
    numbers: [
      'En 2026 les ventes ont augmenté de 16,4% atteignant 1 850 000 € sur 4 100 transactions avec une moyenne de 451,20 €.'
    ],
    code: [
      'export const calculerPrecision = (corrects: number, total: number) => Math.round((corrects / total) * 100);'
    ],
    quotes: [
      'La simplicité est la condition préalable à la fiabilité. Un code clair est toujours plus facile à maintenir.'
    ],
    programmer: [
      'Développement web frontend backend base de données React TypeScript Tailwind CSS Vite Node API REST Docker'
    ],
    noPunctuation: [
      'taper rapidement exige de la concentration et de la mémoire musculaire sans regarder le clavier la pratique régulière améliore la vitesse'
    ],
    hard: [
      'L\'optimisation des algorithmes O(N log N) avec ~99,4% d\'efficacité nécessite une gestion rigoureuse de la mémoire RAM !'
    ]
  },
  de: {
    classic: [
      'Die Technologie entwickelt sich jeden Tag rasant weiter und ermöglicht Entwicklern weltweit die Erstellung von Hochleistungs-Anwendungen.',
      'Der Schlüssel zum Beherrschen des Tastschreibens liegt in einem stetigen Rhythmus, korrekter Fingerhaltung und täglicher Praxis.'
    ],
    random: [
      'System Cloud Code Funktion Daten Variable Netzwerk Geschwindigkeit Index Array Objekt Logik Algorithmus Zustand',
      'Tastatur Monitor Schnittstelle Modul Server Client Asynchron Signal Fokus Kontext Speicher Token'
    ],
    numbers: [
      'Im Jahr 2026 stieg der Umsatz um 17,2% auf 2.150.000 € bei 4.800 Transaktionen mit durchschnittlich 447,90 € pro Bestellung.'
    ],
    code: [
      'const berechneGeschwindigkeit = (zeichen: number, zeitInSekunden: number) => Math.round((zeichen / 5) / (zeitInSekunden / 60));'
    ],
    quotes: [
      'Einfachheit ist die Voraussetzung für Zuverlässigkeit. Sauberer Code ist stets leichter zu pflegen und zu skalieren.'
    ],
    programmer: [
      'Webentwicklung Frontend Backend Datenbank React TypeScript Tailwind CSS Vite Node REST API Docker Microservices'
    ],
    noPunctuation: [
      'schnelles tippen erfordert konzentration und muskelgedächtnis ohne auf die tastatur zu schauen tägliches üben verbessert die geschwindigkeit'
    ],
    hard: [
      'Kryptografische Hashes wie SHA-256 (z.B. 0x3e4f5a) garantieren höchste Datensicherheit mit ~99.9% Zuverlässigkeit!'
    ]
  }
};

const DURATION_OPTIONS = [15, 30, 60, 120];

const MODE_OPTIONS = [
  { id: 'classic', icon: FileText },
  { id: 'random', icon: Sparkles },
  { id: 'numbers', icon: Hash },
  { id: 'code', icon: Code },
  { id: 'quotes', icon: Quote },
  { id: 'programmer', icon: Code },
  { id: 'noPunctuation', icon: Zap },
  { id: 'hard', icon: ShieldAlert },
];

interface TestHistoryItem {
  id: string;
  timestamp: number;
  wpm: number;
  cpm: number;
  accuracy: number;
  duration: number;
  mode: string;
  language: string;
}

const STORAGE_KEY_HISTORY = 'nuvoratools_typing_history';
const STORAGE_KEY_STATS = 'nuvoratools_typing_stats';

export default function TypingSpeedTest() {
  const { t, language: appLang } = useTranslation();

  // Settings state
  const [duration, setDuration] = useState<number>(30);
  const [testLang, setTestLang] = useState<string>(appLang || 'en');
  const [mode, setMode] = useState<string>('classic');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sync testLang with appLang if valid
  useEffect(() => {
    if (['en', 'pt', 'es', 'fr', 'de'].includes(appLang)) {
      setTestLang(appLang);
    }
  }, [appLang]);

  // Game state
  const [status, setStatus] = useState<'idle' | 'running' | 'finished'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [targetText, setTargetText] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const lastTextIndexRef = useRef<number>(-1);

  // Character hit counters
  const [correctChars, setCorrectChars] = useState<number>(0);
  const [incorrectChars, setIncorrectChars] = useState<number>(0);
  const [correctWords, setCorrectWords] = useState<number>(0);
  const [incorrectWords, setIncorrectWords] = useState<number>(0);

  // Personal Best & History
  const [personalBest, setPersonalBest] = useState<number>(0);
  const [history, setHistory] = useState<TestHistoryItem[]>([]);
  const [copiedResult, setCopiedResult] = useState<boolean>(false);

  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize & Load Local Storage
  useEffect(() => {
    trackRecentlyUsedTool('typing-speed-test');
    const favs = getFavoriteToolIds();
    setIsFavorite(favs.includes('typing-speed-test'));

    try {
      const storedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory) as TestHistoryItem[];
        setHistory(parsed);
        const pb = Math.max(0, ...parsed.map((item) => item.wpm));
        setPersonalBest(pb);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleToggleFavorite = () => {
    const updated = toggleFavoriteTool('typing-speed-test');
    setIsFavorite(updated.includes('typing-speed-test'));
  };

  // Generate target text based on language and mode
  const selectNextText = useCallback(() => {
    const langCorpus = TEXT_CORPUS[testLang] || TEXT_CORPUS.en;
    const modeTexts = langCorpus[mode] || langCorpus.classic || TEXT_CORPUS.en.classic;

    let nextIdx = Math.floor(Math.random() * modeTexts.length);
    if (modeTexts.length > 1 && nextIdx === lastTextIndexRef.current) {
      nextIdx = (nextIdx + 1) % modeTexts.length;
    }
    lastTextIndexRef.current = nextIdx;
    setTargetText(modeTexts[nextIdx]);
  }, [testLang, mode]);

  // Reset test state
  const resetTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('idle');
    setTimeLeft(duration);
    setUserInput('');
    setCorrectChars(0);
    setIncorrectChars(0);
    setCorrectWords(0);
    setIncorrectWords(0);
    selectNextText();
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, [duration, selectNextText]);

  useEffect(() => {
    resetTest();
  }, [resetTest]);

  // Timer Tick Handler
  useEffect(() => {
    if (status === 'running') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Calculate live WPM, CPM, and Accuracy
  const timeElapsed = useMemo(() => {
    if (status === 'idle') return 0;
    const elapsed = duration - timeLeft;
    return elapsed > 0 ? elapsed : 1;
  }, [status, duration, timeLeft]);

  const liveWpm = useMemo(() => {
    if (timeElapsed === 0) return 0;
    const wpm = Math.round((correctChars / 5) / (timeElapsed / 60));
    return wpm >= 0 ? wpm : 0;
  }, [correctChars, timeElapsed]);

  const liveCpm = useMemo(() => {
    if (timeElapsed === 0) return 0;
    const cpm = Math.round(correctChars / (timeElapsed / 60));
    return cpm >= 0 ? cpm : 0;
  }, [correctChars, timeElapsed]);

  const totalTypedAttempts = correctChars + incorrectChars;
  const liveAccuracy = useMemo(() => {
    if (totalTypedAttempts === 0) return 100;
    return Math.min(100, Math.max(0, Math.round((correctChars / totalTypedAttempts) * 100)));
  }, [correctChars, totalTypedAttempts]);

  // Finish test trigger
  const handleFinishTest = useCallback(() => {
    setStatus('finished');
    if (timerRef.current) clearInterval(timerRef.current);

    const finalWpm = liveWpm;
    const isNewPb = finalWpm > personalBest;

    if (isNewPb) {
      setPersonalBest(finalWpm);
      triggerConfetti();
      playSoundEffect('record', soundEnabled);
    } else {
      playSoundEffect('finish', soundEnabled);
    }

    // Save history
    const newItem: TestHistoryItem = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      wpm: finalWpm,
      cpm: liveCpm,
      accuracy: liveAccuracy,
      duration,
      mode,
      language: testLang,
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, 20);
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      } catch {
        // storage overflow
      }
      return updated;
    });
  }, [liveWpm, personalBest, soundEnabled, liveCpm, liveAccuracy, duration, mode, testLang]);

  const handleFinishTestRef = useRef(handleFinishTest);
  useEffect(() => {
    handleFinishTestRef.current = handleFinishTest;
  }, [handleFinishTest]);

  useEffect(() => {
    if (status === 'running' && timeLeft === 0) {
      handleFinishTestRef.current();
    }
  }, [timeLeft, status]);

  // Keyboard Typing Event Handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (status === 'finished') return;

    if (status === 'idle') {
      setStatus('running');
    }

    const prevLength = userInput.length;
    setUserInput(val);

    // Key stroke sound & character evaluation
    if (val.length > prevLength) {
      const addedChar = val[val.length - 1];
      const targetChar = targetText[val.length - 1];

      if (addedChar === targetChar) {
        setCorrectChars((c) => c + 1);
        playSoundEffect('key', soundEnabled);
      } else {
        setIncorrectChars((c) => c + 1);
        playSoundEffect('error', soundEnabled);
      }
    }

    // If user completed full target text
    if (val.length >= targetText.length) {
      // Evaluate word accuracy
      const targetWords = targetText.trim().split(/\s+/);
      const userWords = val.trim().split(/\s+/);

      let correctW = 0;
      let incorrectW = 0;

      targetWords.forEach((tw, idx) => {
        if (userWords[idx] === tw) {
          correctW++;
        } else {
          incorrectW++;
        }
      });

      setCorrectWords(correctW);
      setIncorrectWords(incorrectW);

      handleFinishTest();
    }
  };

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    setPersonalBest(0);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  };

  const handleCopyResults = async () => {
    const text = `⌨️ NuvoraTools Typing Test Results:
⚡ Speed: ${liveWpm} WPM (${liveCpm} CPM)
🎯 Accuracy: ${liveAccuracy}%
⏱️ Duration: ${duration}s
🌐 Mode: ${mode.toUpperCase()}
🔥 Personal Best: ${personalBest} WPM`;

    const success = await copyToClipboard(text);
    if (success) {
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2000);
      triggerConfetti();
    }
  };

  // Render individual target characters with status feedback
  const renderedText = useMemo(() => {
    return targetText.split('').map((char, idx) => {
      let charStatusClass = 'text-slate-400 dark:text-slate-500';
      const isCurrent = idx === userInput.length;

      if (idx < userInput.length) {
        if (userInput[idx] === char) {
          charStatusClass = 'text-emerald-600 dark:text-emerald-400 font-semibold';
        } else {
          charStatusClass = 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 rounded px-0.5 font-bold';
        }
      }

      return (
        <span
          key={idx}
          className={`relative text-lg sm:text-2xl font-mono transition-colors ${charStatusClass} ${
            isCurrent && status === 'running' ? 'border-b-2 border-indigo-500 animate-pulse bg-indigo-50 dark:bg-indigo-950/40' : ''
          }`}
        >
          {char}
        </span>
      );
    });
  }, [targetText, userInput, status]);

  return (
    <div ref={containerRef} className="space-y-8 max-w-6xl mx-auto bg-slate-50 dark:bg-slate-950 p-2 sm:p-4 rounded-3xl">
      {/* Tool Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-indigo-100 flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5" />
                {t('badge.utility', 'Utility')}
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-950/40 text-xs font-semibold text-indigo-200">
                100% Client-Side
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t('tool.typing-speed-test.title', 'Typing Speed Test')}
            </h1>
            <p className="text-sm text-indigo-100 max-w-2xl leading-relaxed">
              {t('tool.typing-speed-test.desc', 'Measure your typing speed in WPM and CPM with real-time accuracy feedback, multiple languages, programmer code modes, and personal records.')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all"
              title={soundEnabled ? 'Sound On' : 'Sound Off'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-300" />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all hidden sm:flex"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={handleToggleFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                isFavorite
                  ? 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-950' : ''}`} />
              {isFavorite ? t('type.inFavorites', 'In Favorites') : t('type.addFavorite', 'Add to Favorites')}
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Test Duration, Language & Game Mode Selectors */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Duration Selector */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              {t('type.durationLabel', 'Test Duration')}
            </label>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
              {DURATION_OPTIONS.map((sec) => (
                <button
                  key={sec}
                  onClick={() => {
                    setDuration(sec);
                    resetTest();
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    duration === sec
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Test Language Selector */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              {t('type.languageLabel', 'Text Language')}
            </label>
            <select
              value={testLang}
              onChange={(e) => {
                setTestLang(e.target.value);
                resetTest();
              }}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="en">English 🇺🇸</option>
              <option value="pt">Português 🇧🇷</option>
              <option value="es">Español 🇪🇸</option>
              <option value="fr">Français 🇫🇷</option>
              <option value="de">Deutsch 🇩🇪</option>
            </select>
          </div>

          {/* Personal Best Badge */}
          <div className="flex items-center justify-start md:justify-end gap-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
            <Award className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <span className="block text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 tracking-wider">
                {t('type.personalBest', 'Personal Best')}
              </span>
              <span className="font-extrabold text-base text-amber-950 dark:text-amber-200 font-mono">
                {personalBest} WPM
              </span>
            </div>
          </div>
        </div>

        {/* Game Mode Pills */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t('type.modeLabel', 'Typing Mode')}
          </label>
          <div className="flex flex-wrap gap-2">
            {MODE_OPTIONS.map((m) => {
              const IconComp = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setMode(m.id);
                    resetTest();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    mode === m.id
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  {t(`type.mode.${m.id}`, m.id)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Interactive Typing Arena */}
      <div
        onClick={() => hiddenInputRef.current?.focus()}
        className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-lg space-y-6 cursor-text relative transition-all hover:border-indigo-400 dark:hover:border-indigo-800"
      >
        {/* Hidden Input Catching Keystrokes */}
        <input
          ref={hiddenInputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          disabled={status === 'finished'}
          className="opacity-0 absolute inset-0 w-full h-full cursor-text z-10"
          autoFocus
        />

        {/* Live Metrics Header Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 text-center">
          <div>
            <span className="block text-[11px] font-bold uppercase text-slate-400">
              {t('type.timer', 'Time Remaining')}
            </span>
            <span
              className={`font-mono text-2xl sm:text-3xl font-extrabold ${
                timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-slate-900 dark:text-white'
              }`}
            >
              {timeLeft}s
            </span>
          </div>

          <div>
            <span className="block text-[11px] font-bold uppercase text-slate-400">
              {t('type.wpm', 'Speed (WPM)')}
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {liveWpm}
            </span>
          </div>

          <div>
            <span className="block text-[11px] font-bold uppercase text-slate-400">
              {t('type.accuracy', 'Accuracy')}
            </span>
            <span
              className={`font-mono text-2xl sm:text-3xl font-extrabold ${
                liveAccuracy >= 95
                  ? 'text-emerald-500'
                  : liveAccuracy >= 85
                  ? 'text-amber-500'
                  : 'text-rose-500'
              }`}
            >
              {liveAccuracy}%
            </span>
          </div>

          <div>
            <span className="block text-[11px] font-bold uppercase text-slate-400">
              {t('type.cpm', 'CPM')}
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-700 dark:text-slate-300">
              {liveCpm}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, ((duration - timeLeft) / duration) * 100)}%` }}
          />
        </div>

        {/* Text Display Canvas */}
        <div className="min-h-[140px] p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 leading-relaxed tracking-wide select-none flex flex-wrap items-center gap-0.5">
          {renderedText}
        </div>

        {/* Interactive Guidance Prompt */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            {status === 'idle'
              ? t('type.startPrompt', 'Click anywhere or start typing to begin the test...')
              : status === 'running'
              ? t('type.typingInProgress', 'Keep typing! Maintain high accuracy...')
              : t('type.testComplete', 'Test completed! View your final score below.')}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetTest}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors z-20"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
              {t('type.restart', 'Restart Test')}
            </button>
            <button
              type="button"
              onClick={() => {
                selectNextText();
                resetTest();
              }}
              className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-2 transition-colors z-20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t('type.newText', 'New Text')}
            </button>
          </div>
        </div>
      </div>

      {/* Finished Modal / Results Summary Card */}
      {status === 'finished' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white border border-indigo-500/30 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <TrophyIcon className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-black">{t('type.resultsTitle', 'Test Completed!')}</h3>
                <p className="text-xs text-slate-400">
                  {t('type.resultsDesc', 'Here is your performance breakdown for this session.')}
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyResults}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              {copiedResult ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  {t('type.copied', 'Results Copied!')}
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  {t('type.shareResults', 'Share / Copy')}
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <span className="block text-[10px] font-bold uppercase text-slate-400">
                {t('type.finalWpm', 'Final WPM')}
              </span>
              <span className="font-mono text-3xl font-black text-indigo-400">{liveWpm}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <span className="block text-[10px] font-bold uppercase text-slate-400">
                {t('type.accuracy', 'Accuracy')}
              </span>
              <span className="font-mono text-3xl font-black text-emerald-400">{liveAccuracy}%</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <span className="block text-[10px] font-bold uppercase text-slate-400">
                {t('type.cpm', 'CPM')}
              </span>
              <span className="font-mono text-3xl font-black text-slate-200">{liveCpm}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <span className="block text-[10px] font-bold uppercase text-slate-400">
                {t('type.correctKeyStrokes', 'Correct / Incorrect Chars')}
              </span>
              <span className="font-mono text-lg font-bold text-slate-200">
                <span className="text-emerald-400">{correctChars}</span> /{' '}
                <span className="text-rose-400">{incorrectChars}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Local History & Analytics Card */}
      {history.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-500" />
              {t('type.historyTitle', 'Recent Tests History')} ({history.length})
            </h3>
            <button
              onClick={handleClearHistory}
              className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('type.clearHistory', 'Clear Stats')}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3 rounded-l-xl">{t('type.date', 'Date')}</th>
                  <th className="p-3">{t('type.wpm', 'Speed')}</th>
                  <th className="p-3">{t('type.accuracy', 'Accuracy')}</th>
                  <th className="p-3">{t('type.cpm', 'CPM')}</th>
                  <th className="p-3">{t('type.mode', 'Mode')}</th>
                  <th className="p-3 rounded-r-xl">{t('type.duration', 'Duration')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                    <td className="p-3 text-slate-500 font-sans">
                      {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{item.wpm} WPM</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400">{item.accuracy}%</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{item.cpm}</td>
                    <td className="p-3 font-sans uppercase text-[10px] font-bold text-slate-500">{item.mode}</td>
                    <td className="p-3 font-sans text-slate-500">{item.duration}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TrophyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
