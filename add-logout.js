const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public/frontend');
const files = fs.readdirSync(dir).filter(f => f.startsWith('admin-') && f !== 'admin-login.html');

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add id to admin user name
    content = content.replace(
        '<span class="text-sm font-bold text-slate-900">المدير العام</span>',
        '<span class="text-sm font-bold text-slate-900" id="admin-user-name">المدير العام</span>'
    );

    // Add id to admin role
    content = content.replace(
        '<span class="text-[10px] text-brand-gold">مدير النظام</span>',
        '<span class="text-[10px] text-brand-gold" id="admin-user-role">مدير النظام</span>'
    );

    // Add logout button below the profile box
    const profileBox = `                <div class="flex flex-col">
                    <span class="text-sm font-bold text-slate-900" id="admin-user-name">المدير العام</span>
                    <span class="text-[10px] text-brand-gold" id="admin-user-role">مدير النظام</span>
                </div>
            </div>`;
    
    const replacementBox = `                <div class="flex flex-col">
                    <span class="text-sm font-bold text-slate-900" id="admin-user-name">المدير العام</span>
                    <span class="text-[10px] text-brand-gold" id="admin-user-role">مدير النظام</span>
                </div>
            </div>
            <button onclick="logout()" class="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors text-xs font-bold">
                <i class="fa-solid fa-arrow-right-from-bracket"></i> تسجيل الخروج
            </button>`;

    if (!content.includes('onclick="logout()"')) {
        content = content.replace(profileBox, replacementBox);
    }
    
    // Also inject JS to update the role text
    const jsToInject = `
            // Set name if available
            const nameEl = document.getElementById('admin-user-name');
            const roleEl = document.getElementById('admin-user-role');
            if (nameEl && localStorage.getItem('adminName')) {
                nameEl.textContent = localStorage.getItem('adminName');
            }
            if (roleEl && localStorage.getItem('adminRole')) {
                roleEl.textContent = localStorage.getItem('adminRole') === 'super_admin' ? 'مدير النظام' : 'مشرف عقارات';
            }
    `;
    
    content = content.replace(
        `const nameEl = document.getElementById('admin-user-name');
            if (nameEl && localStorage.getItem('adminName')) {
                nameEl.textContent = localStorage.getItem('adminName');
            }`,
        jsToInject
    );

    fs.writeFileSync(filePath, content);
    console.log('Added logout button to ' + file);
}
