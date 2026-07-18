const fs = require('fs');

let content = fs.readFileSync('App_original.tsx', 'utf-8');

// Translations patch
content = content.replace(/Ուշադրություն՝/g, 'Warning:');
content = content.replace(/t\.missingApiKeyNotice/g, 't.activeKeysWarning');

// load workspace patch
const loadSearch = `  // Load workspace state from server
  useEffect(() => {
    if (user?.name) {
      fetch(\`/api/load-workspace?username=\${encodeURIComponent(user.name)}\`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('No server workspace saved yet');
        })
        .then(data => {
          if (data && data.files && data.files.length > 0) {
            setFiles(data.files);
            setFolders(data.folders || []);
            const mainHtml = data.files.find((f: any) => f.name === 'index.html') || data.files[0];
            setSelectedFileId(mainHtml.id);
            if (data.chats) {
              setChats(data.chats);
            }
          }
        })
        .catch(err => console.log('Notice:', err.message));
    }
  }, [user?.name]);`;
const loadReplace = `  // Workspace is exclusively loaded from localStorage in the useState initializers.`;
content = content.replace(loadSearch, loadReplace);

// save workspace patch
const saveSearch = `  // Save workspace state to server and localStorage
  useEffect(() => {
    if (user?.name && files.length > 0) {
      localStorage.setItem('vfs_files_v2', JSON.stringify(files));
      localStorage.setItem('vfs_folders_v2', JSON.stringify(folders));
      localStorage.setItem('vfs_selected_file_id_v2', selectedFileId);
      localStorage.setItem('vfs_chats_v2', JSON.stringify(chats));

      fetch('/api/save-workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.name,
          files,
          folders,
          chats
        })
      }).catch(err => console.error('Failed to save workspace to server:', err));
    }
  }, [user, files, folders, selectedFileId, chats]);`;
const saveReplace = `  // Save workspace state to localStorage
  useEffect(() => {
    if (user?.name && files.length > 0) {
      localStorage.setItem('vfs_files_v2', JSON.stringify(files));
      localStorage.setItem('vfs_folders_v2', JSON.stringify(folders));
      localStorage.setItem('vfs_selected_file_id_v2', selectedFileId);
      localStorage.setItem('vfs_chats_v2', JSON.stringify(chats));
    }
  }, [user, files, folders, selectedFileId, chats]);`;
content = content.replace(saveSearch, saveReplace);

fs.writeFileSync('src/App.tsx', content);
