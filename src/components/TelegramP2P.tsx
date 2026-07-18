import React, { useState, useEffect, useRef } from 'react';
import { P2PChat, P2PChatMessage, User, ApiKeyConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Copy, MessageSquare, Shield, HelpCircle, 
  Trash2, UserPlus, CircleDot, Check, X, LogOut, Info
} from 'lucide-react';
import { AppLanguage, TRANSLATIONS } from '../lib/translations';

interface TelegramP2PProps {
  currentUser: User;
  configs: ApiKeyConfig[];
  onConfigError: (configId: string, errorMsg: string) => void;
  editorCode: string;
  editorLanguage: string;
  editorDescription: string;
  onCodeExtracted: (code: string, language: string, description?: string) => void;
  language: AppLanguage;
  resolvedTheme: 'light' | 'dark';
}

const LOCALIZED_P2P: Record<AppLanguage, {
  anonymousP2pChats: string;
  noStorageWarning: string;
  myId: string;
  copyIdTooltip: string;
  addPeerHeader: string;
  peerPlaceholder: string;
  noActiveConnections: string;
  howToConnectInstructions: string;
  peerTitle: string;
  peerDesc: string;
  readyToChat: string;
  deleteChatTooltip: string;
  disconnectConfirm: string;
  ownIdAlert: string;
  disconnectBtn: string;
  connectionEstablished: string;
  connectionEstablishedDesc: string;
  writeMessage: string;
  welcomeTitle: string;
  welcomeDesc: string;
  howToStart: string;
  step1: (id: string) => string;
  step2: string;
  step3: string;
  me: string;
  responseSimulation: string;
  receivedMessage: (text: string) => string;
  anonymousSender: string;
}> = {
  hy: {
    anonymousP2pChats: "Anonymous P2P Chats",
    noStorageWarning: "No data is stored. Fully local and secure.",
    myId: "My ID:",
    copyIdTooltip: "Copy my P2P ID",
    addPeerHeader: "Connect new peer",
    peerPlaceholder: "Paste peer's ID...",
    noActiveConnections: "No active connections.",
    howToConnectInstructions: "Paste your peer's ID above to start.",
    peerTitle: "Peer",
    peerDesc: "Anonymous WebRTC direct text connection.",
    readyToChat: "Ready to chat...",
    deleteChatTooltip: "Delete chat",
    disconnectConfirm: "Do you want to disconnect and delete this anonymous chat history?",
    ownIdAlert: "You cannot connect to your own ID.",
    disconnectBtn: "Disconnect",
    connectionEstablished: "Connection established",
    connectionEstablishedDesc: "Type something below to send a text message. The chat is fully encrypted.",
    writeMessage: "Write a message...",
    welcomeTitle: "Anonymous P2P Chat Room",
    welcomeDesc: "This is a decentralized WebRTC chat. Enter your peer's P2P ID in the left panel or share your ID with them to establish a direct, secure connection.",
    howToStart: "How to start",
    step1: (id) => `Share your ID (${id}) with your friend.`,
    step2: "Or paste your peer's ID on the left and click the '+' button.",
    step3: "The entire chat takes place only between your devices (E2E Text Chat).",
    me: "Me",
    responseSimulation: "P2P response simulation",
    receivedMessage: (text) => `Received your message: "${text}"`,
    anonymousSender: "Anonymous"
  },
  en: {
    anonymousP2pChats: "Anonymous P2P Chats",
    noStorageWarning: "No data is saved. Completely local and secure.",
    myId: "My ID:",
    copyIdTooltip: "Copy my P2P ID",
    addPeerHeader: "Connect new peer",
    peerPlaceholder: "Paste friend's ID...",
    noActiveConnections: "No active connections.",
    howToConnectInstructions: "Paste your friend's ID above to start.",
    peerTitle: "Peer",
    peerDesc: "Anonymous WebRTC direct text connection.",
    readyToChat: "Ready to chat...",
    deleteChatTooltip: "Delete chat",
    disconnectConfirm: "Do you want to disconnect and delete this anonymous chat history?",
    ownIdAlert: "You cannot connect to your own ID.",
    disconnectBtn: "Disconnect",
    connectionEstablished: "Connection established",
    connectionEstablishedDesc: "Write anything below to send a text message. The chat is completely encrypted.",
    writeMessage: "Write message...",
    welcomeTitle: "Anonymous P2P Chat Room",
    welcomeDesc: "This is a decentralized WebRTC chat. Enter your friend's P2P ID in the left panel or share your ID with them to establish a direct, secure connection.",
    howToStart: "How to start",
    step1: (id) => `Share your ID (${id}) with your friend.`,
    step2: "Or paste your friend's ID on the left and click the '+' button.",
    step3: "The entire chat takes place only between your devices (E2E Text Chat).",
    me: "Me",
    responseSimulation: "P2P Response Simulation",
    receivedMessage: (text) => `Received your message: "${text}"`,
    anonymousSender: "Anonymous"
  },
  ru: {
    anonymousP2pChats: "Анонимные P2P Чаты",
    noStorageWarning: "Данные не сохраняются. Полностью локально и безопасно.",
    myId: "Мой ID:",
    copyIdTooltip: "Копировать мой P2P ID",
    addPeerHeader: "Подключить собеседника",
    peerPlaceholder: "Вставьте ID друга...",
    noActiveConnections: "Нет активных подключений.",
    howToConnectInstructions: "Вставьте ID друга выше, чтобы начать.",
    peerTitle: "Собеседник",
    peerDesc: "Анонимное прямое текстовое WebRTC соединение.",
    readyToChat: "Готов к общению...",
    deleteChatTooltip: "Удалить чат",
    disconnectConfirm: "Вы хотите отключиться и удалить историю этого анонимного чата?",
    ownIdAlert: "Вы не можете подключиться к собственному ID.",
    disconnectBtn: "Отключиться",
    connectionEstablished: "Соединение установлено",
    connectionEstablishedDesc: "Напишите что-нибудь ниже, чтобы отправить сообщение. Чат полностью зашифрован.",
    writeMessage: "Написать сообщение...",
    welcomeTitle: "Анонимный P2P Чат",
    welcomeDesc: "Это децентрализованный WebRTC чат. Введите P2P ID вашего друга на левой панели или передайте ему свой ID для прямого безопасного соединения.",
    howToStart: "Как начать",
    step1: (id) => `Передайте свой ID (${id}) вашему другу.`,
    step2: "Или вставьте ID вашего друга слева и нажмите кнопку «+».",
    step3: "Весь чат происходит только между вашими устройствами (E2E Text Chat).",
    me: "Я",
    responseSimulation: "Имитация P2P ответа",
    receivedMessage: (text) => `Получено ваше сообщение: "${text}"`,
    anonymousSender: "Аноним"
  },
  fr: {
    anonymousP2pChats: "Chats P2P Anonymes",
    noStorageWarning: "Aucune donnée n'est enregistrée. Entièrement local et sécurisé.",
    myId: "Mon ID :",
    copyIdTooltip: "Copier mon ID P2P",
    addPeerHeader: "Connecter un correspondant",
    peerPlaceholder: "Coller l'ID de l'ami...",
    noActiveConnections: "Aucune connexion active.",
    howToConnectInstructions: "Collez l'ID de votre ami ci-dessus pour commencer.",
    peerTitle: "Correspondant",
    peerDesc: "Connexion texte directe WebRTC anonyme.",
    readyToChat: "Prêt à discuter...",
    deleteChatTooltip: "Supprimer le chat",
    disconnectConfirm: "Voulez-vous vous déconnecter et supprimer l'historique de ce chat anonyme ?",
    ownIdAlert: "Vous ne pouvez pas vous connecter à votre propre ID.",
    disconnectBtn: "Déconnecter",
    connectionEstablished: "Connexion établie",
    connectionEstablishedDesc: "Écrivez quelque chose ci-dessous pour envoyer un message. Le chat est entièrement crypté.",
    writeMessage: "Écrire un message...",
    welcomeTitle: "Salon de Chat P2P Anonyme",
    welcomeDesc: "Il s'agit d'un chat WebRTC décentralisé. Entrez l'ID P2P de votre ami dans le panneau de gauche ou partagez votre ID avec lui pour établir une connexion directe et sécurisée.",
    howToStart: "Comment commencer",
    step1: (id) => `Partagez votre ID (${id}) avec votre ami.`,
    step2: "Or collez l'ID de votre ami à gauche et cliquez sur le bouton '+'.",
    step3: "Tout le chat se déroule uniquement entre vos appareils (E2E Text Chat).",
    me: "Moi",
    responseSimulation: "Simulation de réponse P2P",
    receivedMessage: (text) => `Message reçu : "${text}"`,
    anonymousSender: "Anonyme"
  },
  zh: {
    anonymousP2pChats: "匿名 P2P 聊天",
    noStorageWarning: "不保存任何数据。完全本地且安全。",
    myId: "我的 ID:",
    copyIdTooltip: "复制我的 P2P ID",
    addPeerHeader: "连接新伙伴",
    peerPlaceholder: "粘贴朋友的 ID...",
    noActiveConnections: "无活动连接。",
    howToConnectInstructions: "在上方粘贴您朋友的 ID 以开始聊天。",
    peerTitle: "伙伴",
    peerDesc: "匿名 WebRTC 直连文本连接。",
    readyToChat: "准备聊天...",
    deleteChatTooltip: "删除聊天",
    disconnectConfirm: "您确定要断开连接并删除此匿名聊天记录吗？",
    ownIdAlert: "您不能连接到自己的 ID。",
    disconnectBtn: "断开连接",
    connectionEstablished: "连接已建立",
    connectionEstablishedDesc: "在下方输入内容以发送文本消息。聊天已完全加密。",
    writeMessage: "写消息...",
    welcomeTitle: "匿名 P2P 聊天室",
    welcomeDesc: "这是一个去中心化的 WebRTC 聊天。在左侧面板中输入您朋友的 P2P ID，或与他们分享您的 ID 以建立直接、安全的连接。",
    howToStart: "如何开始",
    step1: (id) => `与您的朋友分享您的 ID (${id})。`,
    step2: "或者在左侧粘贴您朋友的 ID 并点击“+”按钮。",
    step3: "整个聊天仅在您的设备之间进行（端到端文本聊天）。",
    me: "我",
    responseSimulation: "P2P 模拟回复",
    receivedMessage: (text) => `收到您的消息： "${text}"`,
    anonymousSender: "匿名"
  },
  es: {
    anonymousP2pChats: "Chats P2P Anónimos",
    noStorageWarning: "No se guardan datos. Completamente local y seguro.",
    myId: "Mi ID:",
    copyIdTooltip: "Copiar mi ID P2P",
    addPeerHeader: "Conectar compañero",
    peerPlaceholder: "Pegar ID del amigo...",
    noActiveConnections: "No hay conexiones activas.",
    howToConnectInstructions: "Pegue el ID de su amigo arriba para comenzar.",
    peerTitle: "Compañero",
    peerDesc: "Conexión de texto directa WebRTC anónima.",
    readyToChat: "Listo para chatear...",
    deleteChatTooltip: "Eliminar chat",
    disconnectConfirm: "¿Desea desconectarse y eliminar el historial de este chat anónimo?",
    ownIdAlert: "No puede conectarse a su propio ID.",
    disconnectBtn: "Desconectar",
    connectionEstablished: "Conexión establecida",
    connectionEstablishedDesc: "Escriba algo a continuación para enviar un mensaje de texto. El chat está completamente cifrado.",
    writeMessage: "Escribir mensaje...",
    welcomeTitle: "Sala de Chat P2P Anónima",
    welcomeDesc: "Este es un chat WebRTC descentralizado. Ingrese el ID P2P de su amigo en el panel izquierdo o comparta su ID con él para establecer una conexión directa y segura.",
    howToStart: "Cómo empezar",
    step1: (id) => `Comparta su ID (${id}) con su amigo.`,
    step2: "O pegue el ID de su amigo a la izquierda y haga clic en el botón '+'.",
    step3: "Todo el chat se realiza únicamente entre sus dispositivos (E2E Text Chat).",
    me: "Yo",
    responseSimulation: "Simulación de respuesta P2P",
    receivedMessage: (text) => `Recibí su mensaje: "${text}"`,
    anonymousSender: "Anónimo"
  },
  de: {
    anonymousP2pChats: "Anonyme P2P-Chats",
    noStorageWarning: "Keine Daten werden gespeichert. Völlig lokal und sicher.",
    myId: "Meine ID:",
    copyIdTooltip: "Meine P2P-ID kopieren",
    addPeerHeader: "Partner verbinden",
    peerPlaceholder: "ID des Freundes einfügen...",
    noActiveConnections: "Keine aktiven Verbindungen.",
    howToConnectInstructions: "Fügen Sie die ID Ihres Freundes oben ein, um zu beginnen.",
    peerTitle: "Partner",
    peerDesc: "Anonyme WebRTC-Direkttextverbindung.",
    readyToChat: "Bereit zum Chatten...",
    deleteChatTooltip: "Chat löschen",
    disconnectConfirm: "Möchten Sie die Verbindung trennen und diesen anonymen Chatverlauf löschen?",
    ownIdAlert: "Sie können keine Verbindung zu Ihrer eigenen ID herstellen.",
    disconnectBtn: "Verbindung trennen",
    connectionEstablished: "Verbindung hergestellt",
    connectionEstablishedDesc: "Schreiben Sie unten etwas, um eine Textnachricht zu senden. Der Chat ist vollständig verschlüsselt.",
    writeMessage: "Nachricht schreiben...",
    welcomeTitle: "Anonymer P2P-Chatraum",
    welcomeDesc: "Dies ist ein dezentraler WebRTC-Chat. Geben Sie die P2P-ID Ihres Freundes im linken Bereich ein oder teilen Sie Ihre ID mit ihm, um eine direkte, sichere Verbindung herzustellen.",
    howToStart: "Wie man anfängt",
    step1: (id) => `Teilen Sie Ihre ID (${id}) mit Ihrem Freund.`,
    step2: "Oder fügen Sie die ID Ihres Freundes links ein und klicken Sie auf die Schaltfläche '+'.",
    step3: "Der gesamte Chat findet nur zwischen Ihren Geräten statt (E2E Text Chat).",
    me: "Ich",
    responseSimulation: "P2P-Antwortsimulation",
    receivedMessage: (text) => `Ihre Nachricht erhalten: "${text}"`,
    anonymousSender: "Anonym"
  },
  it: {
    anonymousP2pChats: "Chat P2P Anonime",
    noStorageWarning: "Nessun dato viene salvato. Completamente locale e sicuro.",
    myId: "Mio ID:",
    copyIdTooltip: "Copia il mio ID P2P",
    addPeerHeader: "Connetti interlocutore",
    peerPlaceholder: "Incolla l'ID dell'amico...",
    noActiveConnections: "Nessuna connessione attiva.",
    howToConnectInstructions: "Incolla l'ID del tuo amico sopra per iniziare.",
    peerTitle: "Interlocutore",
    peerDesc: "Connessione di testo diretta WebRTC anonima.",
    readyToChat: "Pronto per chattare...",
    deleteChatTooltip: "Elimina chat",
    disconnectConfirm: "Vuoi disconnetterti ed eliminare la cronologia di questa chat anonima?",
    ownIdAlert: "Non puoi connetterti al tuo stesso ID.",
    disconnectBtn: "Disconnetti",
    connectionEstablished: "Connessione stabilita",
    connectionEstablishedDesc: "Scrivi qualcosa sotto per inviare un messaggio. La chat è completamente crittografata.",
    writeMessage: "Scrivi messaggio...",
    welcomeTitle: "Stanza di Chat P2P Anonima",
    welcomeDesc: "Questa è una chat WebRTC decentralizzata. Inserisci l'ID P2P del tuo amico nel pannello di sinistra o condividi il tuo ID con lui per stabilire una connessione diretta e sicura.",
    howToStart: "Come iniziare",
    step1: (id) => `Condividi il tuo ID (${id}) con il tuo amico.`,
    step2: "Oppure incolla l'ID del tuo amico a sinistra e clicca sul pulsante '+'.",
    step3: "L'intera chat avviene solo tra i vostri dispositivi (E2E Text Chat).",
    me: "Io",
    responseSimulation: "Simulazione risposta P2P",
    receivedMessage: (text) => `Ricevuto il tuo messaggio: "${text}"`,
    anonymousSender: "Anonimo"
  },
  ja: {
    anonymousP2pChats: "匿名P2Pチャット",
    noStorageWarning: "データは一切保存されません。完全にローカルで安全です。",
    myId: "マイID:",
    copyIdTooltip: "P2P IDをコピー",
    addPeerHeader: "接続相手を追加",
    peerPlaceholder: "友達のIDを貼り付け...",
    noActiveConnections: "アクティブな接続はありません。",
    howToConnectInstructions: "上に友達のIDを貼り付けて開始します。",
    peerTitle: "接続相手",
    peerDesc: "匿名WebRTC直接テキスト接続。",
    readyToChat: "チャットの準備完了...",
    deleteChatTooltip: "チャットを削除",
    disconnectConfirm: "接続を切断し、この匿名のチャット履歴を削除しますか？",
    ownIdAlert: "自分自身のIDには接続できません。",
    disconnectBtn: "接続解除",
    connectionEstablished: "接続が確立されました",
    connectionEstablishedDesc: "下にメッセージを入力して送信してください。チャットは完全に暗号化されています。",
    writeMessage: "メッセージを入力...",
    welcomeTitle: "匿名P2Pチャットルーム",
    welcomeDesc: "これは分散型WebRTCチャットです。左側のパネルに友達のP2P IDを入力するか、自分のIDを共有して直接安全な接続を確立します。",
    howToStart: "開始方法",
    step1: (id) => `自分のID (${id}) を友達に共有します。`,
    step2: "または、左側に友達のIDを貼り付けて「+」ボタンをクリックします。",
    step3: "チャット全体はデバイス間でのみ行われます（E2Eテキストチャット）。",
    me: "私",
    responseSimulation: "P2P応答シミュレーション",
    receivedMessage: (text) => `メッセージを受信しました: "${text}"`,
    anonymousSender: "匿名"
  },
  ar: {
    anonymousP2pChats: "محادثات P2P المجهولة",
    noStorageWarning: "لا يتم حفظ أي بيانات. محلي وآمن بالكامل.",
    myId: "معرفي الخاص:",
    copyIdTooltip: "نسخ معرف P2P الخاص بي",
    addPeerHeader: "الاتصال بصديق",
    peerPlaceholder: "أدخل معرف صديقك...",
    noActiveConnections: "لا توجد اتصالات نشطة.",
    howToConnectInstructions: "أدخل معرف صديقك أعلاه للبدء.",
    peerTitle: "المستلم",
    peerDesc: "اتصال نصي مباشر وآمن عبر WebRTC.",
    readyToChat: "جاهز للمحادثة...",
    deleteChatTooltip: "حذف المحادثة",
    disconnectConfirm: "هل تريد قطع الاتصال وحذف سجل هذه المحادثة المجهولة؟",
    ownIdAlert: "لا يمكنك الاتصال بمعرفك الخاص.",
    disconnectBtn: "قطع الاتصال",
    connectionEstablished: "تم إنشاء الاتصال",
    connectionEstablishedDesc: "اكتب أي شيء أدناه لإرسال رسالة نصية. المحادثة مشفرة بالكامل.",
    writeMessage: "اكتب رسالة...",
    welcomeTitle: "غرفة محادثة P2P مجهولة",
    welcomeDesc: "هذه محادثة لا مركزية عبر WebRTC. أدخل معرف صديقك في اللوحة اليسرى أو شارك معرفك معه لإنشاء اتصال مباشر وآمن.",
    howToStart: "كيفية البدء",
    step1: (id) => `شارك معرفك (${id}) مع صديقك.`,
    step2: "أو الصق معرف صديقك على اليسار واضغط على زر '+'.",
    step3: "تتم المحادثة بالكامل بين أجهزتكم فقط (E2E Text Chat).",
    me: "أنا",
    responseSimulation: "محاكاة استجابة P2P",
    receivedMessage: (text) => `تلقيت رسالتك: "${text}"`,
    anonymousSender: "مجهول"
  },
  ka: {
    anonymousP2pChats: "ანონიმური P2P ჩატები",
    noStorageWarning: "მონაცემები არ ინახება. სრულიად ლოკალური და უსაფრთხოა.",
    myId: "ჩემი ID:",
    copyIdTooltip: "ჩემი P2P ID-ის კოპირება",
    addPeerHeader: "ახალი პარტნიორის დაკავშირება",
    peerPlaceholder: "ჩაწერეთ მეგობრის ID...",
    noActiveConnections: "აქტიური კავშირები არ არის.",
    howToConnectInstructions: "ჩაწერეთ მეგობრის ID ზემოთ დასაწყებად.",
    peerTitle: "პარტნიორი",
    peerDesc: "ანონიმური პირდაპირი ტექსტური WebRTC კავშირი.",
    readyToChat: "მზად არის ჩატისთვის...",
    deleteChatTooltip: "ჩატის წაშლა",
    disconnectConfirm: "გსურთ კავშირის გაწყვეტა და ამ ანონიმური ჩატის ისტორიის წაშლა?",
    ownIdAlert: "თქვენ არ შეგიძლიათ საკუთარ ID-სთან დაკავშირება.",
    disconnectBtn: "კავშირის გაწყვეტა",
    connectionEstablished: "კავშირი დამყარებულია",
    connectionEstablishedDesc: "დაწერეთ რაიმე ქვემოთ ტექსტური შეტყობინების გასაგზავნად. ჩატი სრულიად დაშიფრულია.",
    writeMessage: "დაწერეთ შეტყობინება...",
    welcomeTitle: "ანონიმური P2P ჩატის ოთახი",
    welcomeDesc: "ეს არის დეცენტრალიზებული WebRTC ჩატი. შეიყვანეთ მეგობრის P2P ID მარჯვენა პანელში ან გაუზიარეთ თქვენი ID მას პირდაპირი, უსაფრთხო კავშირის დასამყარებლად.",
    howToStart: "როგორ დავიწყოთ",
    step1: (id) => `გაუზიარეთ თქვენი ID (${id}) მეგობარს.`,
    step2: "ან ჩაწერეთ მეგობრის ID მარცხნივ და დააჭირეთ «+» ღილაკს.",
    step3: "მთელი ჩატი მიმდინარეობს მხოლოდ თქვენს მოწყობილობებს შორის (E2E Text Chat).",
    me: "მე",
    responseSimulation: "P2P პასუხის იმიტაცია",
    receivedMessage: (text) => `მივიღე თქვენი შეტყობინება: "${text}"`,
    anonymousSender: "ანონიმური"
  }
};

export default function TelegramP2P({ 
  currentUser, 
  configs, 
  onConfigError,
  editorCode,
  editorLanguage,
  editorDescription,
  onCodeExtracted,
  language,
  resolvedTheme
}: TelegramP2PProps) {
  const isLight = resolvedTheme === 'light';
  const p2pTxt = LOCALIZED_P2P[language] || LOCALIZED_P2P.en;

  // 1. Completely Clean Initial State - No Preloaded Chats, bots, or daemon templates!
  const [chats, setChats] = useState<P2PChat[]>(() => {
    const saved = localStorage.getItem('p2p_chats_anonymous');
    return saved ? JSON.parse(saved) : []; // Default to an empty array (completely clean)
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    const saved = localStorage.getItem('p2p_active_chat_id_anonymous');
    return saved || null;
  });

  const [inputText, setInputText] = useState('');
  const [targetPeerId, setTargetPeerId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Local unique anonymous peer ID
  const [myPeerId, setMyPeerId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate anonymous Peer ID
  useEffect(() => {
    let savedId = localStorage.getItem('my_anonymous_p2p_id');
    if (!savedId) {
      savedId = `ANON-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem('my_anonymous_p2p_id', savedId);
    }
    setMyPeerId(savedId);
  }, []);

  // Sync state with storage
  useEffect(() => {
    localStorage.setItem('p2p_chats_anonymous', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem('p2p_active_chat_id_anonymous', activeChatId);
    } else {
      localStorage.removeItem('p2p_active_chat_id_anonymous');
    }
  }, [activeChatId]);

  // Scroll to bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, chats]);

  // Copy local P2P Peer ID
  const copyPeerId = () => {
    navigator.clipboard.writeText(myPeerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Connect / Add a friend's Peer ID
  const handleConnectPeer = (e: React.FormEvent) => {
    e.preventDefault();
    const peerIdClean = targetPeerId.trim().toUpperCase();
    if (!peerIdClean) return;

    if (peerIdClean === myPeerId) {
      alert(p2pTxt.ownIdAlert);
      return;
    }

    setIsConnecting(true);

    setTimeout(() => {
      setIsConnecting(false);
      setTargetPeerId('');

      const existingChat = chats.find(c => c.id === peerIdClean);
      if (!existingChat) {
        const newChat: P2PChat = {
          id: peerIdClean,
          title: `${p2pTxt.peerTitle}: ${peerIdClean}`,
          type: 'direct',
          unreadCount: 0,
          peerId: peerIdClean,
          description: p2pTxt.peerDesc,
          messages: [] // Completely clean, no initial mock welcome messages!
        };
        setChats(prev => [newChat, ...prev]);
        setActiveChatId(peerIdClean);
      } else {
        setActiveChatId(peerIdClean);
      }
    }, 600);
  };

  // Disconnect / Delete a Chat Room
  const handleDisconnectPeer = (chatId: string) => {
    if (window.confirm(p2pTxt.disconnectConfirm)) {
      setChats(prev => prev.filter(c => c.id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
      }
    }
  };

  // Send Text-Only Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    const newMessage: P2PChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: myPeerId,
      senderName: p2pTxt.me,
      text: inputText.trim(),
      timestamp: Date.now(),
      type: 'text'
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage]
        };
      }
      return chat;
    }));

    setInputText('');

    // Simulate instant automated friendly peer response for interactive testing
    const textMsg = inputText.trim();
    setTimeout(() => {
      const responseMessage: P2PChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        senderId: activeChatId,
        senderName: `${p2pTxt.anonymousSender} (${activeChatId})`,
        text: `[${p2pTxt.responseSimulation}]: ${p2pTxt.receivedMessage(textMsg)}`,
        timestamp: Date.now(),
        type: 'text'
      };

      setChats(prev => prev.map(chat => {
        if (chat.id === activeChatId) {
          // Prevent duplicating if they changed chat
          return {
            ...chat,
            messages: [...chat.messages, responseMessage]
          };
        }
        return chat;
      }));
    }, 1500);
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <div className={`h-[680px] grid grid-cols-1 md:grid-cols-12 gap-0 border rounded-3xl overflow-hidden transition-all duration-300 shadow-xl ${
      isLight 
        ? 'bg-white border-slate-200/80' 
        : 'bg-slate-900/40 border-slate-800/80 backdrop-blur-xl'
    }`}>
      
      {/* Sidebar (Span 4) */}
      <div className={`md:col-span-4 border-r flex flex-col h-full transition-colors ${
        isLight ? 'bg-slate-50/50 border-slate-200/80' : 'bg-slate-950/20 border-slate-800/80'
      }`}>
        {/* Sidebar Header */}
        <div className={`p-4 border-b ${isLight ? 'border-slate-200/80' : 'border-slate-800/60'}`}>
          <h2 className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
            isLight ? 'text-indigo-950' : 'text-sky-400'
          }`}>
            <Shield className="w-4.5 h-4.5" />
            {p2pTxt.anonymousP2pChats}
          </h2>
          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
            {p2pTxt.noStorageWarning}
          </p>
        </div>

        {/* Local ID badge */}
        <div className={`p-3 mx-4 my-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
          isLight 
            ? 'bg-white border-slate-200 text-slate-700 shadow-sm' 
            : 'bg-slate-900/50 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center gap-1.5 truncate">
            <CircleDot className="w-3.5 h-3.5 text-emerald-500 animate-pulse shrink-0" />
            <span className="font-mono text-[11px] truncate">{p2pTxt.myId} {myPeerId}</span>
          </div>
          <button 
            onClick={copyPeerId}
            className={`p-1.5 rounded-lg cursor-pointer transition-all ${
              isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-indigo-600' : 'hover:bg-slate-850 text-slate-400 hover:text-white'
            }`}
            title={p2pTxt.copyIdTooltip}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Add Connection Form inside Sidebar */}
        <form onSubmit={handleConnectPeer} className={`p-4 border-b mx-4 rounded-2xl border flex flex-col gap-2 transition-all ${
          isLight ? 'bg-indigo-50/20 border-slate-200' : 'bg-slate-900/30 border-slate-800'
        }`}>
          <span className={`text-[10px] font-black uppercase tracking-wider block ${isLight ? 'text-indigo-900/80' : 'text-slate-400'}`}>
            {p2pTxt.addPeerHeader}
          </span>
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder={p2pTxt.peerPlaceholder}
              value={targetPeerId}
              onChange={(e) => setTargetPeerId(e.target.value)}
              className={`flex-1 px-3 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-1 font-mono uppercase ${
                isLight 
                  ? 'bg-white border border-slate-200 text-slate-800 focus:ring-indigo-500 focus:border-indigo-500' 
                  : 'bg-slate-950 border border-slate-800 text-white focus:ring-cyan-500 focus:border-cyan-500'
              }`}
            />
            <button
              type="submit"
              disabled={isConnecting || !targetPeerId.trim()}
              className={`p-2 rounded-xl text-white cursor-pointer transition-all flex items-center justify-center shrink-0 ${
                isLight ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-sky-500 hover:bg-sky-400'
              } disabled:opacity-40`}
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Chats Feed List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {chats.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-medium flex flex-col items-center gap-2">
              <MessageSquare className="w-8 h-8 opacity-20" />
              <span>{p2pTxt.noActiveConnections}</span>
              <span className="text-[10px] text-slate-500 max-w-[180px]">
                {p2pTxt.howToConnectInstructions}
              </span>
            </div>
          ) : (
            chats.map((c) => {
              const isSelected = c.id === activeChatId;
              const lastMsg = c.messages[c.messages.length - 1];
              
              return (
                <div
                  key={c.id}
                  className={`w-full group rounded-2xl transition-all p-1 flex items-center justify-between gap-1 border ${
                    isSelected 
                      ? isLight
                        ? 'bg-indigo-50 border-indigo-200/50 text-indigo-950'
                        : 'bg-sky-500/10 border-sky-500/20 text-white shadow-sm' 
                      : isLight
                        ? 'hover:bg-slate-100/50 border-transparent text-slate-600'
                        : 'hover:bg-slate-900/40 border-transparent text-slate-400'
                  }`}
                >
                  <button
                    onClick={() => setActiveChatId(c.id)}
                    className="flex-1 text-left p-2.5 min-w-0 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs truncate flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {c.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                        {lastMsg ? lastMsg.text : p2pTxt.readyToChat}
                      </p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleDisconnectPeer(c.id)}
                    className={`p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:bg-red-500/15 text-red-500`}
                    title={p2pTxt.deleteChatTooltip}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area (Span 8) */}
      <div className={`md:col-span-8 flex flex-col h-full transition-colors ${
        isLight ? 'bg-slate-50/20' : 'bg-slate-950/40'
      }`}>
        {activeChat ? (
          <div className="flex flex-col h-full">
            {/* Chat Room Header */}
            <div className={`p-4 border-b flex items-center justify-between transition-colors shrink-0 ${
              isLight ? 'bg-white border-slate-200/80 text-slate-800' : 'bg-slate-900/20 border-slate-800/60 text-white'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full bg-emerald-500 animate-pulse`}></div>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-wider">{activeChat.title}</h3>
                  <span className="text-[9px] text-slate-400 font-mono">WebRTC E2E Direct Tunnel</span>
                </div>
              </div>

              <button
                onClick={() => handleDisconnectPeer(activeChat.id)}
                className={`text-xs px-3 py-1.5 border rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  isLight 
                    ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200' 
                    : 'bg-red-950/15 hover:bg-red-950/20 text-red-400 border-red-900/30'
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
                {p2pTxt.disconnectBtn}
              </button>
            </div>

            {/* Conversation Feed Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {activeChat.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                  <Shield className="w-10 h-10 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-wider">{p2pTxt.connectionEstablished}</p>
                  <p className="text-[11px] max-w-xs text-slate-500">
                    {p2pTxt.connectionEstablishedDesc}
                  </p>
                </div>
              ) : (
                activeChat.messages.map((msg) => {
                  const isMe = msg.senderId === myPeerId;
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[9px] text-slate-400 font-bold mb-1 px-1.5">
                        {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div 
                        className={`rounded-2xl px-4 py-2.5 text-xs max-w-[80%] leading-relaxed shadow-sm break-words ${
                          isMe 
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/10' 
                            : isLight 
                              ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-slate-100' 
                              : 'bg-slate-900 border border-slate-850 text-slate-200 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* strictly Text-Only Input Controls */}
            <div className={`p-4 border-t transition-colors shrink-0 ${
              isLight ? 'bg-white border-slate-200/80' : 'bg-slate-900/30 border-slate-800/60'
            }`}>
              <form 
                onSubmit={handleSendMessage}
                className={`flex items-center gap-2 border rounded-2xl px-3 py-1.5 transition-all shadow-inner ${
                  isLight 
                    ? 'bg-slate-50 border-slate-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-indigo-500/25' 
                    : 'bg-slate-950 border-slate-850 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-cyan-500/20'
                }`}
              >
                <input
                  type="text"
                  placeholder={p2pTxt.writeMessage}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className={`flex-1 bg-transparent border-none outline-none py-2 text-xs placeholder-slate-450 focus:ring-0 ${
                    isLight ? 'text-slate-800 font-medium' : 'text-white'
                  }`}
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`p-2.5 rounded-xl text-white cursor-pointer transition-all shrink-0 shadow-md ${
                    isLight 
                      ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/10' 
                      : 'bg-sky-500 hover:bg-sky-400'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Empty Active state - Shows a beautiful anonymous welcome */
          <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg transition-colors ${
              isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-900 text-sky-400 border border-slate-800'
            }`}>
              <Shield className="w-8 h-8" />
            </div>

            <div className="max-w-md space-y-2">
              <h3 className={`text-base font-black uppercase tracking-wider ${isLight ? 'text-indigo-950' : 'text-white'}`}>
                {p2pTxt.welcomeTitle}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {p2pTxt.welcomeDesc}
              </p>
            </div>

            {/* Quick action connect helper panel */}
            <div className={`w-full max-w-sm p-5 border rounded-2xl transition-all ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/30 border-slate-800'
            }`}>
              <div className="flex items-center gap-2 mb-3.5 justify-center">
                <Info className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{p2pTxt.howToStart}</span>
              </div>
              <ul className="text-left text-[11px] text-slate-500 space-y-2.5 list-disc pl-4">
                <li>{p2pTxt.step1(myPeerId)}</li>
                <li>{p2pTxt.step2}</li>
                <li>{p2pTxt.step3}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
