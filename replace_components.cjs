const fs = require('fs');

function replaceInFile(file, replacements) {
  let content = fs.readFileSync(file, 'utf-8');
  for (const [search, replace] of replacements) {
    // Escape string for regex if needed, or just use split/join
    content = content.split(search).join(replace);
  }
  fs.writeFileSync(file, content);
}

// AiTeacher.tsx
replaceInFile('src/components/AiTeacher.tsx', [
  ['"Բացատրել"', 't.explain || "Explain"'],
  ['"Բացատրել Monaco Editor-ի կոդը"', 't.explainTooltip || "Explain Monaco Editor code"'],
  ['"Օպտիմալացնել"', 't.optimize || "Optimize"'],
  ['"Օպտիմալացնել Monaco Editor-ի կոդը"', 't.optimizeTooltip || "Optimize Monaco Editor code"'],
  ['"Ստուգել"', 't.check || "Check"'],
  ['"Ստուգել Monaco Editor-ի կոդի սխալները"', 't.checkTooltip || "Check for errors in Monaco Editor code"'],
  ['"Թեստ"', 't.test || "Test"'],
  ['"Ստեղծել ինտերակտիվ թեստ"', 't.testTooltip || "Create interactive test"'],
  ['"Դուք"', 't.you || "You"'],
  ['"Համակարգ"', 't.system || "System"'],
  ['"AI Ուսուցիչ"', 't.aiTeacher || "AI Teacher"'],
  ['"Որոնման տվյալներ կցված՝"', 't.searchAttached || "Search data attached:"'],
  ['"AI Ուսուցիչը մտածում է..."', 't.thinking || "AI Teacher is thinking..."'],
  ['"Համակարգում ենք գործիքների տվյալները և վերլուծում..."', 't.coordinating || "Coordinating tool data and analyzing..."'],
  ['"Կցված տվյալներ՝"', 't.attachedData || "Attached data:"'],
  ['"Կցել Օրինակ Ֆայլ (ընթերցման համար)"', 't.attachTooltip || "Attach Example File (for reading)"'],
  ['"Որոնել համացանցում"', 't.searchTooltip || "Search the web"'],
  ['"Հարցրեք ամեն ինչ կամ կատարեք վերլուծություն..."', 't.placeholder || "Ask anything or analyze..."'],
  ['"Սեղմեք Enter ուղարկելու համար"', 't.pressEnter || "Press Enter to send"'],
  ['"Բացել կոդը"', 't.openCode || "Open code"'],
  ['"Թաքցնել կոդը"', 't.hideCode || "Hide code"'],
  ['`📎 Ֆայլը կցված է՝ "${name}" (${size} KB): AI-ն կկարդա սրա պարունակությունը հաջորդ հարցում:`', 't.fileAttachedAlert ? t.fileAttachedAlert(name, size) : `📎 File attached: "${name}" (${size} KB): AI will read its content in the next request.`'],
  ['"Monaco Editor-ը դատարկ է, կոդ չկա վերլուծելու համար:"', 't.monacoEmptyExplain || "Monaco Editor is empty, no code to analyze."'],
  ['"Monaco Editor-ը դատարկ է, կոդ չկա օպտիմալացնելու համար:"', 't.monacoEmptyOptimize || "Monaco Editor is empty, no code to optimize."'],
  ['"Monaco Editor-ը դատարկ է, սխալներ փնտրելու համար կոդ չկա:"', 't.monacoEmptyCheck || "Monaco Editor is empty, no code to check for errors."'],
  ['"🚨 Սխալ՝ "', 't.errorPrefix || "🚨 Error: "'],
  ['"Չհաջողվեց կապ հաստատել AI-ի հետ"', 't.errorFallback || "Failed to connect to AI"']
]);

// TelegramP2P.tsx
replaceInFile('src/components/TelegramP2P.tsx', [
  ['"Անանուն P2P Զրույցներ"', 't.anonymousP2pChats || "Anonymous P2P Chats"'],
  ['"Ոչ մի տվյալ չի պահվում: Ամբողջությամբ տեղային և անվտանգ:"', 't.noStorageWarning || "No data is stored. Fully local and secure."'],
  ['"Իմ ID՝"', 't.myId || "My ID:"'],
  ['"Պատճենել իմ P2P ID-ն"', 't.copyIdTooltip || "Copy my P2P ID"'],
  ['"Միացնել նոր զրուցակից"', 't.addPeerHeader || "Connect new peer"'],
  ['"Տեղադրեք ընկերոջ ID-ն..."', 't.peerPlaceholder || "Paste peer\'s ID..."'],
  ['"Չկա ոչ մի ակտիվ կապ:"', 't.noActiveConnections || "No active connections."'],
  ['"Տեղադրեք Ձեր ընկերոջ ID-ն վերևում՝ սկսելու համար:"', 't.howToConnectInstructions || "Paste your peer\'s ID above to start."'],
  ['"Զրուցակից"', 't.peerTitle || "Peer"'],
  ['"Անանուն WebRTC ուղիղ տեքստային կապ:"', 't.peerDesc || "Anonymous WebRTC direct text connection."'],
  ['"Պատրաստ է զրույցի..."', 't.readyToChat || "Ready to chat..."'],
  ['"Ջնջել զրույցը"', 't.deleteChatTooltip || "Delete chat"'],
  ['"Ցանկանու՞մ եք անջատել կապը և ջնջել այս անանուն զրույցի պատմությունը:"', 't.disconnectConfirm || "Do you want to disconnect and delete this anonymous chat history?"'],
  ['"Դուք չեք կարող միանալ Ձեր սեփական ID-ին:"', 't.ownIdAlert || "You cannot connect to your own ID."'],
  ['"Անջատել կապը"', 't.disconnectBtn || "Disconnect"'],
  ['"Կապը հաստատված է"', 't.connectionEstablished || "Connection established"'],
  ['"Գրեք որևէ բան ստորև՝ տեքստային հաղորդագրություն ուղարկելու համար: Զրույցը լիովին գաղտնագրված է:"', 't.connectionEstablishedDesc || "Type something below to send a text message. The chat is fully encrypted."'],
  ['"Գրել հաղորդագրություն..."', 't.writeMessage || "Write a message..."'],
  ['"Անանուն P2P Զրույցի Սրահ"', 't.welcomeTitle || "Anonymous P2P Chat Room"'],
  ['"Սա ապակենտրոնացված WebRTC զրույց է: Մուտքագրեք Ձեր ընկերոջ P2P ID-ն ձախ վահանակում կամ փոխանցեք Ձեր ID-ն նրանց՝ անմիջական, անվտանգ կապ հաստատելու համար:"', 't.welcomeDesc || "This is a decentralized WebRTC chat. Enter your peer\'s P2P ID in the left panel or share your ID with them to establish a direct, secure connection."'],
  ['"Ինչպե՞ս սկսել"', 't.howToStart || "How to start"'],
  ['`Փոխանցեք Ձեր ID-ն (${id}) Ձեր ընկերոջը:`', 't.step1 ? t.step1(id) : `Share your ID (${id}) with your friend.`'],
  ['"Կամ տեղադրեք Ձեր ընկերոջ ID-ն ձախ կողմում և սեղմեք «+» կոճակը:"', 't.step2 || "Or paste your peer\'s ID on the left and click the \'+\' button."'],
  ['"Ամբողջ զրույցը տեղի է ունենում միայն Ձեր սարքերի միջև (E2E Text Chat):"', 't.step3 || "The entire chat takes place only between your devices (E2E Text Chat)."'],
  ['"Ես"', 't.me || "Me"'],
  ['"P2P պատասխան իմիտացիա"', 't.responseSimulation || "P2P response simulation"'],
  ['`Ստացա Ձեր հաղորդագրությունը՝ "${text}"`', 't.receivedMessage ? t.receivedMessage(text) : `Received your message: "${text}"`'],
  ['"Անանուն"', 't.anonymousSender || "Anonymous"']
]);

// CodeWorkspace.tsx
replaceInFile('src/components/CodeWorkspace.tsx', [
  ['`// Ֆայլ՝ ${fullPath}\\n\\nexport function init() {\\n  console.log("Ինիցիալիզացված ${newItemName}");\\n}`', '`// File: ${fullPath}\\n\\nexport function init() {\\n  console.log("Initialized ${newItemName}");\\n}`'],
  ['`Ցանկանու՞մ եք ջնջել ${fileToDelete.path} ֆայլը:`', '`Do you want to delete the file ${fileToDelete.path}?`'],
  ['`Ցանկանու՞մ եք ջնջել ${folderPath} թղթապանակը և դրա ողջ պարունակությունը:`', '`Do you want to delete the folder ${folderPath} and all its contents?`'],
  ["'Սխալ ZIP արխիվացման ժամանակ: '", "'Error during ZIP archiving: '"],
  ["'ՍԽԱԼ. index.html ֆայլը չգտնվեց:'", "'ERROR: index.html file not found.'"],
  ['"Ստեղծել ֆայլ"', '"Create file"'],
  ['"Ջնջել թղթապանակը"', '"Delete folder"'],
  ['"Ջնջել ֆայլը"', '"Delete file"'],
  ['"Ընտրեք կամ ստեղծեք որևէ ֆայլ ձախ ցուցակից"', 't.selectFileHint || "Select or create any file from the left list"'],
  ['"Արդյունքի նախադիտումը պատրաստ չէ: Սեղմեք \\"Աշխատեցնել\\""', 't.previewNotReady || "Result preview is not ready. Click \'Run\'"'],
  ['"Սենդբոքսի Կոնսոլ (Sandbox Console Logs)"', 't.sandboxConsole || "Sandbox Console Logs"'],
  ['"Լոգերը դատարկ են..."', 't.logsEmpty || "Logs are empty..."'],
  ['"Մուտքագրեք հրաման (օրինակ՝ ls, cat index.html, help...)"', 't.commandPlaceholder || "Enter command (e.g. ls, cat index.html, help...)"'],
  ["'Վերականգնե՞լ սկզբնական ֆայլերի համակարգը: Սա կջնջի Ձեր ընթացիկ փոփոխությունները:'", "'Restore original file system? This will delete your current changes.'"],
  ['"Մաքրել / Վերականգնել Ֆայլային Համակարգը"', '"Clear / Restore File System"'],
  ['"ZIP Արտահանում"', '"Export ZIP"'],
  ['"Աշխատեցնել"', '"Run"']
]);
