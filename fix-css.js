const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public/frontend');
const files = fs.readdirSync(dir).filter(f => f.startsWith('admin-') && f !== 'admin-login.html');

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the completely broken lines with the correct lines
    // First, let's target the exact lines that are broken.
    
    const settingsRegex = /<a href="admin-settings\.html"[^>]*>/g;
    const contactRegex = /<a href="admin-contact\.html"[^>]*>/g;
    const usersRegex = /<a href="admin-users\.html"[^>]*>/g;
    
    const correctSettings = '<a href="admin-settings.html" class="super-admin-only flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium text-sm transition-colors">';
    const correctContact = '<a href="admin-contact.html" class="super-admin-only flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium text-sm transition-colors">';
    const correctUsers = '<a href="admin-users.html" class="super-admin-only flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium text-sm transition-colors">';
    
    content = content.replace(settingsRegex, correctSettings);
    content = content.replace(contactRegex, correctContact);
    content = content.replace(usersRegex, correctUsers);
    
    fs.writeFileSync(filePath, content);
    console.log('Restored perfect CSS for ' + file);
}
