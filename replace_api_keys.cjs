const fs = require('fs');
let content = fs.readFileSync('src/components/ApiKeySettings.tsx', 'utf-8');

content = content.replace(
  "import { Plus, Trash2",
  "import { AppLanguage, TRANSLATIONS } from '../lib/translations';\nimport { Plus, Trash2"
);

content = content.replace(
  "export default function ApiKeySettings({ configs, onSaveConfigs }: ApiKeySettingsProps) {",
  "export default function ApiKeySettings({ configs, onSaveConfigs }: ApiKeySettingsProps) {\n  const lang = (localStorage.getItem('aweschool_language') as AppLanguage) || 'hy';\n  const t = TRANSLATIONS[lang];"
);

content = content.replace("Ավելացնել API Բանալի", "{t.addApiKeyTitle}");
content = content.replace("Մուտքագրեք Ձեր AI ծառայությունների API բանալիները: Դուք կարող եք ավելացնել մի քանիսը, և համակարգը ավտոմատ կաշխատի load-balancing failover ռեժիմով. եթե մեկը սխալ տա, անմիջապես կօգտագործվի հաջորդը:", "{t.addApiKeyDesc}");
content = content.replace("Ծառայության Մատակարար", "{t.serviceProvider}");
content = content.replace("Անվանում (Label)", "{t.labelInput}");
content = content.replace('"Օրինակ՝ Gemini Pro 3.1"', "{t.labelPlaceholder}");
content = content.replace("API Բանալի (API Key)", "{t.apiKeyInput}");
content = content.replace("Մոդելի Անունը (Model Name)", "{t.modelNameInput}");
content = content.replace("Custom Endpoint (Օպցիոնալ)", "{t.customEndpointInput}");
content = content.replace("> Ավելացնել Բանալի", "> {t.addKeyBtn}");
content = content.replace("API Բանալիների Խումբ (Failover Pool)", "{t.apiKeysPoolTitle}");
content = content.replace("} բանալի", "} {t.keysCount}");
content = content.replace("Բանալիների ցուցակը դատարկ է:", "{t.emptyKeysList}");
content = content.replace("Ավելացրեք գոնե մեկ Gemini կամ OpenAI բանալի ձախ կողմից՝ աշխատանքը սկսելու համար:", "{t.emptyKeysDesc}");
content = content.replace('"Բարձրացնել առաջնահերթությունը"', "{t.moveUpPriority}");
content = content.replace('"Իջեցնել առաջնահերթությունը"', "{t.moveDownPriority}");
content = content.replace('"Ակտիվ և ստուգված"', "{t.activeAndVerified}");
content = content.replace('`Սխալ՝ ${config.lastError}`', "{`${t.errorStatus} ${config.lastError}`}");
content = content.replace('"Չստուգված"', "{t.untested}");
content = content.replace('"Թեստավորել միացումը"', "{t.testConnection}");
content = content.replace('"Ջնջել բանալին"', "{t.deleteKeyTitle}");
content = content.replace("Ապահով տեղային պահպանում", "{t.secureStorageTitle}");
content = content.replace("Ձեր API բանալիները պահվում են բացառապես Ձեր բրաուզերի տեղային հիշողության մեջ (LocalStorage): Դրանք երբեք չեն ուղարկվում որևէ երրորդ կողմի սերվերի, բացի ընտրված AI մոդելի պաշտոնական API-ներից:", "{t.secureStorageDesc}");

fs.writeFileSync('src/components/ApiKeySettings.tsx', content);
