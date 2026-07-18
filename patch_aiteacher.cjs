const fs = require('fs');
let content = fs.readFileSync('src/components/AiTeacher.tsx', 'utf-8');
const search = `  const [internalMessages, setInternalMessages] = useState<ChatMessage[]>([]);
  const messages = externalMessages || internalMessages;
  const setMessages = externalSetMessages || setInternalMessages;`;

const replace = `  const [internalMessages, setInternalMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('ai_teacher_messages');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load chat history', e);
    }
    return [];
  });
  
  useEffect(() => {
    if (!externalMessages) {
      localStorage.setItem('ai_teacher_messages', JSON.stringify(internalMessages));
    }
  }, [internalMessages, externalMessages]);

  const messages = externalMessages || internalMessages;
  const setMessages = externalSetMessages || setInternalMessages;`;

content = content.replace(search, replace);
fs.writeFileSync('src/components/AiTeacher.tsx', content);
