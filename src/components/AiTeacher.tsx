import React, { useState, useRef, useEffect } from 'react';
import { ApiKeyConfig, ChatMessage, SearchResult } from '../types';
import { executeAiTeacherPrompt, simulateWebSearch } from '../lib/ai';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Sparkles, AlertCircle, FileUp, Globe, CornerDownLeft, 
  HelpCircle, Check, Loader2, BookOpen, BrainCircuit, CodeXml, 
  ChevronRight, Play, Wand2, Award, Bug, Lightbulb, FileText, CheckCircle2
} from 'lucide-react';
import { AppLanguage } from '../lib/translations';

const SYSTEM_LANGUAGES: Record<AppLanguage, string> = {
  hy: 'Armenian (Հայերեն)',
  en: 'English',
  ru: 'Russian (Русский)',
  fr: 'French (Français)',
  zh: 'Chinese (中文)',
  es: 'Spanish (Español)',
  de: 'German (Deutsch)',
  it: 'Italian (Italiano)',
  ja: 'Japanese (日本語)',
  ar: 'Arabic (العربية)',
  ka: 'Georgian (ქართული)'
};

const LOCALIZED_TEXTS: Record<string, any> = {
  hy: {
    academicLab: "AI Ակադեմիական Լաբորատորիա՝",
    explain: "Բացատրել",
    explainTooltip: "Բացատրել Monaco Editor-ի կոդը",
    optimize: "Օպտիմալացնել",
    optimizeTooltip: "Օպտիմալացնել Monaco Editor-ի կոդը",
    check: "Ստուգել",
    checkTooltip: "Ստուգել Monaco Editor-ի կոդի սխալները",
    test: "Թեստ",
    testTooltip: "Ստեղծել ինտերակտիվ թեստ",
    you: "Դուք",
    system: "Համակարգ",
    aiTeacher: "AI Ուսուցիչ",
    searchAttached: "Որոնման տվյալներ կցված՝",
    thinking: "AI Ուսուցիչը մտածում է...",
    coordinating: "Համակարգում ենք գործիքների տվյալները և վերլուծում...",
    attachedData: "Կցված տվյալներ՝",
    attachTooltip: "Կցել Օրինակ Ֆայլ (ընթերցման համար)",
    searchTooltip: "Որոնել համացանցում",
    placeholder: "Հարցրեք ամեն ինչ կամ կատարեք վերլուծություն...",
    pressEnter: "Սեղմեք Enter ուղարկելու համար",
    openCode: "Բացել կոդը",
    hideCode: "Թաքցնել կոդը",
    fileAttachedAlert: (name: string, size: string) => `📎 Ֆայլը կցված է՝ "${name}" (${size} KB): AI-ն կկարդա սրա պարունակությունը հաջորդ հարցում:`,
    monacoEmptyExplain: "Monaco Editor-ը դատարկ է, կոդ չկա վերլուծելու համար:",
    monacoEmptyOptimize: "Monaco Editor-ը դատարկ է, կոդ չկա օպտիմալացնելու համար:",
    monacoEmptyCheck: "Monaco Editor-ը դատարկ է, սխալներ փնտրելու համար կոդ չկա:",
    errorPrefix: "🚨 Սխալ՝ ",
    errorFallback: "Չհաջողվեց կապ հաստատել AI-ի հետ",
  },
  en: {
    academicLab: "AI Academic Lab:",
    explain: "Explain",
    explainTooltip: "Explain the code in Monaco Editor",
    optimize: "Optimize",
    optimizeTooltip: "Optimize the code in Monaco Editor",
    check: "Check",
    checkTooltip: "Check the code in Monaco Editor for bugs",
    test: "Quiz",
    testTooltip: "Generate an interactive quiz",
    you: "You",
    system: "System",
    aiTeacher: "AI Teacher",
    searchAttached: "Search data attached:",
    thinking: "AI Teacher is thinking...",
    coordinating: "Coordinating tool data and analyzing...",
    attachedData: "Attached data:",
    attachTooltip: "Attach Sample File (for reading)",
    searchTooltip: "Search the web",
    placeholder: "Ask anything or perform analysis...",
    pressEnter: "Press Enter to send",
    openCode: "Open Code",
    hideCode: "Hide Code",
    fileAttachedAlert: (name: string, size: string) => `📎 File attached: "${name}" (${size} KB): AI will read its content in the next request.`,
    monacoEmptyExplain: "Monaco Editor is empty, there is no code to analyze.",
    monacoEmptyOptimize: "Monaco Editor is empty, there is no code to optimize.",
    monacoEmptyCheck: "Monaco Editor is empty, there is no code to check for bugs.",
    errorPrefix: "🚨 Error: ",
    errorFallback: "Failed to connect to the AI",
  },
  ru: {
    academicLab: "Академическая Лаборатория AI:",
    explain: "Объяснить",
    explainTooltip: "Объяснить код в Monaco Editor",
    optimize: "Оптимизировать",
    optimizeTooltip: "Оптимизировать код в Monaco Editor",
    check: "Проверить",
    checkTooltip: "Проверить код в Monaco Editor на ошибки",
    test: "Тест",
    testTooltip: "Создать интерактивный тест",
    you: "Вы",
    system: "Система",
    aiTeacher: "Учитель AI",
    searchAttached: "Результаты поиска прикреплены:",
    thinking: "Учитель AI думает...",
    coordinating: "Координируем данные инструментов и анализируем...",
    attachedData: "Прикрепленные данные:",
    attachTooltip: "Прикрепить файл (для чтения)",
    searchTooltip: "Искать в интернете",
    placeholder: "Спросите о чем угодно или выполните анализ...",
    pressEnter: "Нажмите Enter для отправки",
    openCode: "Открыть код",
    hideCode: "Скрыть код",
    fileAttachedAlert: (name: string, size: string) => `📎 Файл прикреплен: "${name}" (${size} КБ): AI прочитает его содержимое в следующем запросе.`,
    monacoEmptyExplain: "Редактор Monaco пуст, нет кода для анализа.",
    monacoEmptyOptimize: "Редактор Monaco пуст, нет кода для оптимизации.",
    monacoEmptyCheck: "Редактор Monaco пуст, нет кода для проверки на ошибки.",
    errorPrefix: "🚨 Ошибка: ",
    errorFallback: "Не удалось связаться с AI",
  },
  fr: {
    academicLab: "Labo Académique IA:",
    explain: "Expliquer",
    explainTooltip: "Expliquer le code dans Monaco Editor",
    optimize: "Optimiser",
    optimizeTooltip: "Optimiser le code dans Monaco Editor",
    check: "Vérifier",
    checkTooltip: "Vérifier les bogues dans Monaco Editor",
    test: "Quiz",
    testTooltip: "Générer un quiz interactif",
    you: "Vous",
    system: "Système",
    aiTeacher: "Professeur IA",
    searchAttached: "Contexte de recherche joint:",
    thinking: "Le professeur IA réfléchit...",
    coordinating: "Coordination des données d'outils et analyse...",
    attachedData: "Données jointes:",
    attachTooltip: "Joindre un fichier exemple (pour lecture)",
    searchTooltip: "Rechercher sur le web",
    placeholder: "Posez une question ou analysez...",
    pressEnter: "Appuyez sur Entrée pour envoyer",
    openCode: "Ouvrir le code",
    hideCode: "Masquer le code",
    fileAttachedAlert: (name: string, size: string) => `📎 Fichier joint: "${name}" (${size} KB): L'IA lira son contenu dans la prochaine requête.`,
    monacoEmptyExplain: "Monaco Editor est vide, aucun code à analyser.",
    monacoEmptyOptimize: "Monaco Editor est vide, aucun code à optimiser.",
    monacoEmptyCheck: "Monaco Editor est vide, aucun code pour chercher des bogues.",
    errorPrefix: "🚨 Erreur: ",
    errorFallback: "Échec de connexion à l'IA",
  },
  zh: {
    academicLab: "AI 学术实验室:",
    explain: "解释",
    explainTooltip: "解释 Monaco 编辑器中的代码",
    optimize: "优化",
    optimizeTooltip: "优化 Monaco 编辑器中的代码",
    check: "检查",
    checkTooltip: "检查 Monaco 编辑器中的代码错误",
    test: "测试",
    testTooltip: "生成互动测试",
    you: "您",
    system: "系统",
    aiTeacher: "AI 导师",
    searchAttached: "已附加搜索上下文:",
    thinking: "AI 导师正在思考...",
    coordinating: "正在协调工具数据并进行分析...",
    attachedData: "已附加数据:",
    attachTooltip: "附加样例文件（用于读取）",
    searchTooltip: "搜索网页",
    placeholder: "向 AI 提问或进行代码分析...",
    pressEnter: "按回车键发送",
    openCode: "打开代码",
    hideCode: "隐藏代码",
    fileAttachedAlert: (name: string, size: string) => `📎 文件已附加: "${name}" (${size} KB): AI 将在下一个请求中读取其内容。`,
    monacoEmptyExplain: "Monaco 编辑器为空，没有代码可供分析。",
    monacoEmptyOptimize: "Monaco 编辑器为空，没有代码可供优化。",
    monacoEmptyCheck: "Monaco 编辑器为空，没有代码可供检查错误。",
    errorPrefix: "🚨 错误: ",
    errorFallback: "连接 AI 失败",
  },
  es: {
    academicLab: "Laboratorio Académico IA:",
    explain: "Explicar",
    explainTooltip: "Explicar el código en Monaco Editor",
    optimize: "Optimizar",
    optimizeTooltip: "Optimizar el código en Monaco Editor",
    check: "Verificar",
    checkTooltip: "Verificar errores en Monaco Editor",
    test: "Quiz",
    testTooltip: "Generar un quiz interactivo",
    you: "Tú",
    system: "Sistema",
    aiTeacher: "Profesor IA",
    searchAttached: "Contexto de búsqueda adjunto:",
    thinking: "El profesor IA está pensando...",
    coordinating: "Coordinando datos de herramientas y analizando...",
    attachedData: "Datos adjuntos:",
    attachTooltip: "Adjuntar archivo de ejemplo (para lectura)",
    searchTooltip: "Buscar en la web",
    placeholder: "Pregunta lo que sea o realiza un análisis...",
    pressEnter: "Presiona Enter para enviar",
    openCode: "Abrir Código",
    hideCode: "Ocultar Código",
    fileAttachedAlert: (name: string, size: string) => `📎 Archivo adjunto: "${name}" (${size} KB): IA leerá su contenido en la próxima solicitud.`,
    monacoEmptyExplain: "Monaco Editor está vacío, no hay código para analizar.",
    monacoEmptyOptimize: "Monaco Editor está vacío, no hay código para optimizar.",
    monacoEmptyCheck: "Monaco Editor está vacío, no hay código para buscar errores.",
    errorPrefix: "🚨 Error: ",
    errorFallback: "No se pudo conectar con la IA",
  },
  de: {
    academicLab: "KI Akademisches Labor:",
    explain: "Erklären",
    explainTooltip: "Code im Monaco Editor erklären",
    optimize: "Optimieren",
    optimizeTooltip: "Code im Monaco Editor optimieren",
    check: "Prüfen",
    checkTooltip: "Code im Monaco Editor auf Fehler prüfen",
    test: "Test",
    testTooltip: "Interaktiven Test erstellen",
    you: "Du",
    system: "System",
    aiTeacher: "KI-Lehrer",
    searchAttached: "Suchkontext angehängt:",
    thinking: "KI-Lehrer denkt nach...",
    coordinating: "Werkzeugdaten werden koordiniert und analysiert...",
    attachedData: "Angehängte Daten:",
    attachTooltip: "Beispieldatei anhängen (zum Lesen)",
    searchTooltip: "Im Internet suchen",
    placeholder: "Frage alles oder führe eine Analyse durch...",
    pressEnter: "Drücke Enter zum Senden",
    openCode: "Code öffnen",
    hideCode: "Code ausblenden",
    fileAttachedAlert: (name: string, size: string) => `📎 Datei angehängt: "${name}" (${size} KB): Die KI liest den Inhalt bei der nächsten Anfrage.`,
    monacoEmptyExplain: "Monaco Editor ist leer, kein Code zum Analysieren.",
    monacoEmptyOptimize: "Monaco Editor ist leer, kein Code zum Optimieren.",
    monacoEmptyCheck: "Monaco Editor ist leer, kein Code zum Suchen nach Fehlern.",
    errorPrefix: "🚨 Fehler: ",
    errorFallback: "Verbindung zur KI fehlgeschlagen",
  },
  it: {
    academicLab: "Laboratorio Accademico IA:",
    explain: "Spiega",
    explainTooltip: "Spiega il codice nel Monaco Editor",
    optimize: "Ottimizza",
    optimizeTooltip: "Ottimizza il codice nel Monaco Editor",
    check: "Verifica",
    checkTooltip: "Verifica la presenza di bug nel Monaco Editor",
    test: "Quiz",
    testTooltip: "Genera un quiz interattivo",
    you: "Tu",
    system: "Sistema",
    aiTeacher: "Docente IA",
    searchAttached: "Contesto di ricerca allegato:",
    thinking: "Il docente IA sta pensando...",
    coordinating: "Coordinando i dati degli strumenti e analizzando...",
    attachedData: "Dati allegati:",
    attachTooltip: "Allega file di esempio (per la lettura)",
    searchTooltip: "Cerca sul web",
    placeholder: "Chiedi qualsiasi cosa o esegui un'analisi...",
    pressEnter: "Premi Invio per inviare",
    openCode: "Apri Codice",
    hideCode: "Nascondi Codice",
    fileAttachedAlert: (name: string, size: string) => `📎 File allegato: "${name}" (${size} KB): L'IA leggerà il contenuto nella prossima richiesta.`,
    monacoEmptyExplain: "Il Monaco Editor è vuoto, nessun codice da analizzare.",
    monacoEmptyOptimize: "Il Monaco Editor è vuoto, nessun codice da ottimizzare.",
    monacoEmptyCheck: "Il Monaco Editor è vuoto, nessun codice per la ricerca di bug.",
    errorPrefix: "🚨 Errore: ",
    errorFallback: "Impossibile connettersi all'IA",
  },
  ja: {
    academicLab: "AI 学術ラボ:",
    explain: "説明する",
    explainTooltip: "Monaco エディターのコードを説明する",
    optimize: "最適化する",
    optimizeTooltip: "Monaco エディターのコードを最適化する",
    check: "チェック",
    checkTooltip: "Monaco エディターのコードのバグをチェックする",
    test: "小テスト",
    testTooltip: "インタラクティブな小テストを生成する",
    you: "あなた",
    system: "システム",
    aiTeacher: "AI 教師",
    searchAttached: "検索コンテキストが添付されました:",
    thinking: "AI 教師が考えています...",
    coordinating: "ツールデータを調整し、分析しています...",
    attachedData: "添付データ:",
    attachTooltip: "サンプルファイルを添付（読み取り用）",
    searchTooltip: "ウェブを検索する",
    placeholder: "何でも質問するか、コード分析を実行します...",
    pressEnter: "Enter キーを押して送信",
    openCode: "コードを開く",
    hideCode: "コードを隠す",
    fileAttachedAlert: (name: string, size: string) => `📎 ファイルが添付されました: "${name}" (${size} KB): AI は次のリクエストで内容を読み取ります。`,
    monacoEmptyExplain: "Monaco エディターが空です。分析するコードがありません。",
    monacoEmptyOptimize: "Monaco エディターが空です。最適化するコードがありません。",
    monacoEmptyCheck: "Monaco エディターが空です。バグをチェックするコードがありません。",
    errorPrefix: "🚨 エラー: ",
    errorFallback: "AI との接続に失敗しました",
  },
  ar: {
    academicLab: "مختبر الذكاء الاصطناعي الأكاديمي:",
    explain: "شرح",
    explainTooltip: "شرح الكود في محرر موناكو",
    optimize: "تحسين",
    optimizeTooltip: "تحسين الكود في محرر موناكو",
    check: "فحص",
    checkTooltip: "فحص الكود في محرر موناكو بحثًا عن الأخطاء",
    test: "اختبار",
    testTooltip: "توليد اختبار تفاعلي",
    you: "أنت",
    system: "النظام",
    aiTeacher: "المعلم الذكي",
    searchAttached: "تم إرفاق سياق البحث:",
    thinking: "المعلم الذكي يفكر...",
    coordinating: "تنسيق بيانات الأدوات والتحليل...",
    attachedData: "البيانات المرفقة:",
    attachTooltip: "إرفاق ملف عينة (للقراءة)",
    searchTooltip: "البحث في الويب",
    placeholder: "اسأل عن أي شيء أو قم بإجراء تحليل...",
    pressEnter: "اضغط Enter للإرسال",
    openCode: "فتح الكود",
    hideCode: "إخفاء الكود",
    fileAttachedAlert: (name: string, size: string) => `📎 تم إرفاق الملف: "${name}" (${size} كيلوبايت): سيقرأ الذكاء الاصطناعي المحتوى في الطلب التالي.`,
    monacoEmptyExplain: "محرر موناكو فارغ، لا يوجد كود لتحليله.",
    monacoEmptyOptimize: "محرر موناكو فارغ، لا يوجد كود لتحسينه.",
    monacoEmptyCheck: "محرر موناكو فارغ، لا يوجد كود لفحصه.",
    errorPrefix: "🚨 خطأ: ",
    errorFallback: "فشل الاتصال بالذكاء الاصطناعي",
  },
  ka: {
    academicLab: "AI აკადემიური ლაბორატორია:",
    explain: "განმარტება",
    explainTooltip: "კოდის განმარტება Monaco რედაქტორში",
    optimize: "ოპტიმიზაცია",
    optimizeTooltip: "კოდის ოპტიმიზაცია Monaco რედაქტორში",
    check: "შემოწმება",
    checkTooltip: "კოდის შემოწმება შეცდომებზე Monaco რედაქტორში",
    test: "ქვიზი",
    testTooltip: "ინტერაქტიული ქვიზის გენერირება",
    you: "თვენ",
    system: "სისტემა",
    aiTeacher: "AI მასწავლებელი",
    searchAttached: "ძიების კონტექსტი დამატებულია:",
    thinking: "AI მასწავლებელი ფიქრობს...",
    coordinating: "ხდება ხელსაწყოების მონაცემების კოორდინაცია და ანალიზი...",
    attachedData: "დამატებული მონაცემები:",
    attachTooltip: "ნიმუშის ფაილის დამატება (წასაკითხად)",
    searchTooltip: "ძიება ინტერნეტში",
    placeholder: "ჰკითხეთ ნებისმიერი რამ ან შეასრულეთ ანალიზი...",
    pressEnter: "გასაგზავნად დააჭირეთ Enter-ს",
    openCode: "კოდის გახსნა",
    hideCode: "კოდის დამალვა",
    fileAttachedAlert: (name: string, size: string) => `📎 ფაილი დამატებულია: "${name}" (${size} კბ): AI წაიკითხავს შიგთავსს შემდეგ მოთხოვნაში.`,
    monacoEmptyExplain: "Monaco რედაქტორი ცარიელია, ანალიზისთვის კოდი არ არის.",
    monacoEmptyOptimize: "Monaco რედაქტორი ცარიელია, ოპტიმიზაციისთვის კოდი არ არის.",
    monacoEmptyCheck: "Monaco რედაქტორი ცარიელია, შეცდომების შესამოწმებელი კოდი არ არის.",
    errorPrefix: "🚨 შეცდომა: ",
    errorFallback: "AI-სთან დაკავშირება ვერ მოხერხდა",
  },
};

interface AiTeacherProps {
  currentUser?: any;
  configs: ApiKeyConfig[];
  onConfigError: (configId: string, errorMsg: string) => void;
  editorCode: string;
  editorLanguage: string;
  editorDescription?: string;
  onCodeExtracted: (code: string, language: string, description?: string) => void;
  onFilesExtracted?: (files: { path: string; content: string }[]) => void;
  language: AppLanguage;
  resolvedTheme: 'light' | 'dark';
  showEditor: boolean;
  setShowEditor: (show: boolean) => void;
  messages?: ChatMessage[];
  setMessages?: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export default function AiTeacher({
  currentUser,
  configs,
  onConfigError,
  editorCode,
  editorLanguage,
  editorDescription,
  onCodeExtracted,
  onFilesExtracted,
  language,
  resolvedTheme,
  showEditor,
  setShowEditor,
  messages: externalMessages,
  setMessages: externalSetMessages,
}: AiTeacherProps) {
  const [internalMessages, setInternalMessages] = useState<ChatMessage[]>([]);
  const messages = externalMessages || internalMessages;
  const setMessages = externalSetMessages || setInternalMessages;

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentKeyLabel, setCurrentKeyLabel] = useState<string | null>(null);
  
  // Custom context states
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; content: string }>>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const txt = LOCALIZED_TEXTS[language] || LOCALIZED_TEXTS['en'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle file uploads client-side
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setAttachedFiles(prev => [...prev, { name: file.name, content }]);
      
      // Inject system alert to conversation
      const fileAlert: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        sender: 'system',
        text: txt.fileAttachedAlert(file.name, (file.size / 1024).toFixed(1)),
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, fileAlert]);
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Perform search
  const handleWebSearch = async () => {
    if (!inputText.trim()) return;
    setIsSearching(true);
    try {
      const results = await simulateWebSearch(inputText);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Generic custom assistant runner
  const handleSendMessage = async (textToSend?: string, customSystemInstruction?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() && attachedFiles.length === 0) return;

    // 1. Add user message
    const userMsgId = Math.random().toString(36).substr(2, 9);
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString(),
      searchResults: searchResults || undefined
    };

    setMessages(prev => [...prev, newUserMessage]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    // 2. Build prompt context (inject files and web search results)
    let fullPrompt = text;
    
    if (searchResults && searchResults.length > 0) {
      const searchContext = searchResults.map((r, i) => `[Search result ${i+1}] ${r.title}\nSource: ${r.url}\nContent: ${r.snippet}`).join('\n\n');
      fullPrompt = `[Web Search Context]:\n${searchContext}\n\n[User Query]:\n${fullPrompt}`;
    }

    if (attachedFiles.length > 0) {
      const fileContext = attachedFiles.map(f => `[Attached file content - ${f.name}]:\n${f.content}`).join('\n\n');
      fullPrompt = `[Attached Files Context]:\n${fileContext}\n\n${fullPrompt}`;
    }

    setAttachedFiles([]);
    setSearchResults(null);

    // System instruction to optimize learning and code editing
    const userLangLabel = SYSTEM_LANGUAGES[language] || 'Armenian';
    const systemInstruction = customSystemInstruction || `
      You are the world's most powerful, caring, and intelligent AI Teacher (AI Teacher Studio).
      Your goal is to help the user write clean, professional, and fully functional web applications from scratch.
      
      CRITICAL INSTRUCTIONS:
      1. Write code completely from scratch inside the user's workspace.
      2. No complex surrounding explanations or extra text is needed - focus on returning the code blocks.
      3. Always use clean, standard English file names: "index.html", "src/index.js", "src/utils.js", "src/style.css".
      4. To write or update multiple files in the workspace, format your output using explicit file headers exactly like this:

      File: index.html
      \`\`\`html
      ...your html code...
      \`\`\`

      File: src/index.js
      \`\`\`javascript
      ...your javascript code...
      \`\`\`

      File: src/style.css
      \`\`\`css
      ...your css code...
      \`\`\`

      Make sure to always write clean, working, pure code from scratch without any mock templates or half-written logic. Respond in the user's selected language: ${userLangLabel}. Keep technical terms or code blocks in English.
    `;

    try {
      const response = await executeAiTeacherPrompt(
        configs,
        systemInstruction,
        messages,
        fullPrompt,
        onConfigError
      );

      if (response.extractedFiles && response.extractedFiles.length > 0) {
        if (onFilesExtracted) {
          onFilesExtracted(response.extractedFiles);
        } else if (response.codeBlock) {
          onCodeExtracted(
            response.codeBlock.code, 
            response.codeBlock.language, 
            response.codeBlock.description
          );
        }
        if (window.innerWidth >= 1024) {
          setShowEditor(true);
        }
      } else if (response.codeBlock) {
        onCodeExtracted(
          response.codeBlock.code, 
          response.codeBlock.language, 
          response.codeBlock.description
        );
        if (window.innerWidth >= 1024) {
          setShowEditor(true);
        }
      }

      const aiMsgId = Math.random().toString(36).substr(2, 9);
      const newAiMessage: ChatMessage = {
        id: aiMsgId,
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString(),
        activeKeyLabel: response.usedConfig.label
      };

      setMessages(prev => [...prev, newAiMessage]);
      setCurrentKeyLabel(response.usedConfig.label);

    } catch (err: any) {
      const errorMsgId = Math.random().toString(36).substr(2, 9);
      const errorMsg: ChatMessage = {
        id: errorMsgId,
        sender: 'system',
        text: `${txt.errorPrefix}${err.message || txt.errorFallback}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Deep tool integration actions:
  const runCodeExplainer = () => {
    if (!editorCode.trim()) {
      alert(txt.monacoEmptyExplain);
      return;
    }
    const prompt = `Please analyze and explain this ${editorLanguage} code line-by-line. Give me a detailed, educational, clear, and comprehensive explanation.\n\n\`\`\`${editorLanguage}\n${editorCode}\n\`\`\``;
    const sysInstruction = `You are an expert computer science professor. Explain the code line-by-line, stating its purpose, used functions, variables, and data structures. Respond strictly in the user's selected language: ${SYSTEM_LANGUAGES[language]}. Use elegant markdown formatting.`;
    handleSendMessage(prompt, sysInstruction);
  };

  const runCodeOptimizer = () => {
    if (!editorCode.trim()) {
      alert(txt.monacoEmptyOptimize);
      return;
    }
    const prompt = `Optimize this ${editorLanguage} code, improving its performance, readability, and elegance. Please write the complete, perfect optimized code in a standard markdown block so the Monaco Editor can automatically ingest it.\n\n\`\`\`${editorLanguage}\n${editorCode}\n\`\`\``;
    const sysInstruction = `You are a principal software engineer and performance optimization specialist. Provide the optimized code block and explain what changes you made. Respond strictly in the user's selected language: ${SYSTEM_LANGUAGES[language]}. Always include the code block so it can be auto-loaded.`;
    handleSendMessage(prompt, sysInstruction);
  };

  const runBugFinder = () => {
    if (!editorCode.trim()) {
      alert(txt.monacoEmptyCheck);
      return;
    }
    const prompt = `Perform a static analysis of this ${editorLanguage} code. Find all potential bugs, security vulnerabilities, or bad practices, and explain how to fix them.\n\n\`\`\`${editorLanguage}\n${editorCode}\n\`\`\``;
    const sysInstruction = `You are an expert code auditor. Identify bugs, explain the risks, and propose fixes point-by-point. Respond strictly in the user's selected language: ${SYSTEM_LANGUAGES[language]}.`;
    handleSendMessage(prompt, sysInstruction);
  };

  const runQuizGenerator = () => {
    const prompt = `Create an interactive academic quiz/test consisting of 3 multiple-choice questions (A, B, C, D) based on our current topic or the code in Monaco Editor. Help me check my understanding.`;
    const sysInstruction = `You are a university professor. Create a multiple-choice quiz with 3 questions. Do NOT provide correct answers immediately. Wait for the user to answer, then grade and explain. Respond strictly in the user's selected language: ${SYSTEM_LANGUAGES[language]}.`;
    handleSendMessage(prompt, sysInstruction);
  };

  const isLight = resolvedTheme === 'light';

  return (
    <div className={`h-full flex flex-col border rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-300 shadow-xl ${
      isLight 
        ? 'bg-white/90 border-slate-200/80' 
        : 'bg-slate-900/40 border-slate-800/80'
    }`}>
      {/* Teacher Status Bar */}
      <div className={`px-4 py-3 border-b flex items-center justify-between transition-colors ${
        isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-950/60 border-slate-800/60'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full animate-ping ${isLight ? 'bg-indigo-600' : 'bg-cyan-400'}`}></div>
          <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
            isLight ? 'text-indigo-600' : 'text-cyan-400'
          }`}>
            <BrainCircuit className="w-4 h-4" />
            AI Teacher Studio
          </span>
        </div>

        {/* Current Active Pool Indicator */}
        <div className="flex items-center gap-2">
          {currentKeyLabel && (
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
              isLight 
                ? 'bg-slate-100 border-slate-200 text-slate-600' 
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}>
              Active Key: {currentKeyLabel}
            </span>
          )}
          <button
            onClick={() => setShowEditor(!showEditor)}
            className={`lg:hidden text-xs border px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 font-bold ${
              isLight 
                ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200' 
                : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/20'
            }`}
          >
            <CodeXml className="w-3.5 h-3.5" />
            {showEditor ? txt.hideCode : txt.openCode}
          </button>
        </div>
      </div>



      {/* NEW: Deeply Integrated AI Learning Lab Workbench Tools Section */}
      <div className={`px-4 py-2.5 border-b flex flex-wrap gap-1.5 items-center justify-between transition-colors ${
        isLight ? 'bg-slate-50/50 border-slate-200/80' : 'bg-slate-950/40 border-slate-800/50'
      }`}>
        <div className="flex items-center gap-1.5 shrink-0">
          <Sparkles className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-cyan-400'}`} />
          <span className={`text-[10px] font-black uppercase tracking-wider ${
            isLight ? 'text-slate-600' : 'text-slate-300'
          }`}>
            {txt.academicLab}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={runCodeExplainer}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              isLight 
                ? 'bg-white border-slate-200 hover:border-indigo-400 text-slate-700 hover:bg-slate-50' 
                : 'bg-slate-900 border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:bg-slate-800'
            } disabled:opacity-40`}
            title={txt.explainTooltip}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            {txt.explain}
          </button>

          <button
            onClick={runCodeOptimizer}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              isLight 
                ? 'bg-white border-slate-200 hover:border-indigo-400 text-slate-700 hover:bg-slate-50' 
                : 'bg-slate-900 border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:bg-slate-800'
            } disabled:opacity-40`}
            title={txt.optimizeTooltip}
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-500" />
            {txt.optimize}
          </button>

          <button
            onClick={runBugFinder}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              isLight 
                ? 'bg-white border-slate-200 hover:border-indigo-400 text-slate-700 hover:bg-slate-50' 
                : 'bg-slate-900 border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:bg-slate-800'
            } disabled:opacity-40`}
            title={txt.checkTooltip}
          >
            <Bug className="w-3.5 h-3.5 text-rose-500" />
            {txt.check}
          </button>

          <button
            onClick={runQuizGenerator}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              isLight 
                ? 'bg-white border-slate-200 hover:border-indigo-400 text-slate-700 hover:bg-slate-50' 
                : 'bg-slate-900 border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:bg-slate-800'
            } disabled:opacity-40`}
            title={txt.testTooltip}
          >
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            {txt.test}
          </button>
        </div>
      </div>

      {/* Active Conversation Feed */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
        isLight ? 'bg-slate-50/10' : 'bg-slate-950/10'
      }`}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : msg.sender === 'system' ? 'items-center' : 'items-start'
            }`}
          >
            {/* Header (Sender label) */}
            <span className="text-[10px] text-slate-400 font-bold font-mono mb-1 px-1">
              {msg.sender === 'user' ? txt.you : msg.sender === 'system' ? txt.system : txt.aiTeacher} • {msg.timestamp}
            </span>

            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/10 rounded-tr-none'
                  : msg.sender === 'system'
                    ? isLight
                      ? 'bg-slate-100 border border-slate-200 text-slate-500 text-xs font-mono rounded-xl'
                      : 'bg-slate-950/60 border border-slate-800/60 text-slate-400 text-xs font-mono rounded-xl'
                    : isLight
                      ? 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none shadow-sm shadow-slate-100'
                      : 'bg-slate-950/40 border border-slate-800/80 text-slate-200 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

              {/* Show associated search results inside chat bubble */}
              {msg.searchResults && (
                <div className="mt-3 pt-3 border-t border-slate-200/50 text-xs space-y-2">
                  <div className={`flex items-center gap-1.5 font-bold ${isLight ? 'text-indigo-600' : 'text-cyan-300'}`}>
                     <Globe className="w-3.5 h-3.5" />
                     <span>{txt.searchAttached}</span>
                  </div>
                  {msg.searchResults.map((res, idx) => (
                    <div key={idx} className={`p-2 rounded-lg border ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black/20 border-white/5 text-slate-300'
                    }`}>
                      <a href={res.url} target="_blank" rel="noreferrer" className={`underline font-bold block mb-0.5 ${
                        isLight ? 'text-indigo-600 hover:text-indigo-800' : 'text-cyan-300 hover:text-cyan-400'
                      }`}>
                        {res.title}
                      </a>
                      <p className="text-[11px] leading-relaxed line-clamp-2">{res.snippet}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active API source credit label */}
            {msg.sender === 'ai' && msg.activeKeyLabel && (
              <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">
                Generated via: {msg.activeKeyLabel}
              </span>
            )}
          </div>
        ))}

        {/* Typing placeholder loader */}
        {isLoading && (
          <div className="flex flex-col items-start animate-pulse">
            <span className="text-[10px] text-slate-400 font-bold font-mono mb-1 px-1">{txt.thinking}</span>
            <div className={`border rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 ${
              isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-950/40 border-slate-800/80 text-slate-300'
            }`}>
              <Loader2 className={`w-4 h-4 animate-spin ${isLight ? 'text-indigo-600' : 'text-cyan-400'}`} />
              <span className="text-xs font-mono">{txt.coordinating}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Active Context Indicators (Files, Pending Search results) */}
      {(attachedFiles.length > 0 || searchResults) && (
        <div className={`px-4 py-2 border-t flex flex-wrap gap-2 items-center transition-colors ${
          isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-950/80 border-slate-800/60'
        }`}>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{txt.attachedData}</span>
          
          {attachedFiles.map((file, i) => (
            <span key={i} className={`text-xs px-2.5 py-1 rounded-full font-mono flex items-center gap-1 border ${
              isLight 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
            }`}>
              📎 {file.name}
              <button 
                onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}
                className="hover:text-red-500 cursor-pointer text-slate-400 ml-1 font-bold"
              >
                ×
              </button>
            </span>
          ))}

          {searchResults && (
            <span className={`text-xs px-2.5 py-1 rounded-full font-mono flex items-center gap-1 border animate-pulse ${
              isLight 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              🌐 Web Search Results Context
              <button 
                onClick={() => setSearchResults(null)}
                className="hover:text-red-500 cursor-pointer text-slate-400 ml-1 font-bold"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* Input controls Panel */}
      <div className={`p-4 border-t shrink-0 transition-colors ${
        isLight ? 'bg-slate-50/50 border-slate-200/80' : 'bg-slate-950/60 border-slate-800/60'
      }`}>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className={`flex items-center gap-2 border rounded-2xl px-3 py-1.5 transition-all shadow-inner ${
            isLight 
              ? 'bg-white border-slate-200/80 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/25' 
              : 'bg-slate-900 border-slate-800 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/20'
          }`}
        >
          {/* File Upload Hidden Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
            className="hidden" 
            accept=".txt,.js,.ts,.json,.csv,.py,.html,.css,.xml"
          />

          <div className="flex gap-1 shrink-0">
            {/* File Upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={txt.attachTooltip}
            >
              <FileUp className="w-4.5 h-4.5" />
            </button>

            {/* Google/Duck Search button */}
            <button
              type="button"
              onClick={handleWebSearch}
              disabled={isSearching || !inputText.trim()}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                searchResults 
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-200/50' 
                  : isLight 
                    ? 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 disabled:opacity-30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40'
              }`}
              title={txt.searchTooltip}
            >
              {isSearching ? (
                <Loader2 className={`w-4.5 h-4.5 animate-spin ${isLight ? 'text-indigo-600' : 'text-cyan-400'}`} />
              ) : (
                <Globe className="w-4.5 h-4.5" />
              )}
            </button>
          </div>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={txt.placeholder}
            className={`flex-1 bg-transparent border-none outline-none py-2 text-sm placeholder-slate-450 focus:ring-0 ${
              isLight ? 'text-slate-800' : 'text-white'
            }`}
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={(!inputText.trim() && attachedFiles.length === 0) || isLoading}
            className={`p-2.5 rounded-xl text-white transition-all cursor-pointer shrink-0 shadow-md ${
              isLight 
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:opacity-95 shadow-indigo-500/10 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 disabled:opacity-30'
            } disabled:cursor-not-allowed`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-2.5 px-1 text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <CornerDownLeft className="w-3.5 h-3.5" />
            {txt.pressEnter}
          </span>
          <span>
            AWESchool Academic Labs • Deeply Integrated
          </span>
        </div>
      </div>
    </div>
  );
}
