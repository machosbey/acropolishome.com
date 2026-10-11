const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public/frontend');
const files = fs.readdirSync(dir).filter(f => f.startsWith('admin-') && f !== 'admin-login.html');

const authScript = `
    <script>
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) window.location.href = 'admin-login.html';
        
        document.addEventListener('DOMContentLoaded', () => {
            const role = localStorage.getItem('adminRole');
            if (role !== 'super_admin') {
                document.querySelectorAll('.super-admin-only').forEach(el => el.style.display = 'none');
                
                const restrictedPages = ['admin-settings.html', 'admin-contact.html', 'admin-users.html'];
                if (restrictedPages.some(page => window.location.pathname.includes(page))) {
                    window.location.href = 'admin-dashboard.html';
                }
            }
            
            // Set name if available
            const nameEl = document.getElementById('admin-user-name');
            if (nameEl && localStorage.getItem('adminName')) {
                nameEl.textContent = localStorage.getItem('adminName');
            }
        });
        
        function logout() {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminRole');
            localStorage.removeItem('adminName');
            window.location.href = 'admin-login.html';
        }
    </script>
</head>
`;

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Inject auth script
    if (!content.includes('adminToken = localStorage')) {
        content = content.replace('</head>', authScript);
    }
    
    // Add super-admin-only class to restricted links in sidebar
    content = content.replace(/<a href="admin-settings.html"/g, '<a href="admin-settings.html" class="super-admin-only');
    content = content.replace(/<a href="admin-contact.html"/g, '<a href="admin-contact.html" class="super-admin-only');
    content = content.replace(/<a href="admin-users.html"/g, '<a href="admin-users.html" class="super-admin-only');

    // Fetch Interceptor for API calls
    const fetchInterceptor = `
    <script>
        const originalFetch = window.fetch;
        window.fetch = async function() {
            let [resource, config] = arguments;
            if(resource.includes('/api/admin/') || resource.includes('/api/auth/')) {
                config = config || {};
                config.headers = config.headers || {};
                config.headers['Authorization'] = localStorage.getItem('adminToken');
            }
            const response = await originalFetch(resource, config);
            if(response.status === 401 || response.status === 403) {
                localStorage.removeItem('adminToken');
                window.location.href = 'admin-login.html';
            }
            return response;
        };
        
        // Verify token on page load
        if (localStorage.getItem('adminToken') && !window.location.pathname.includes('admin-login.html')) {
            fetch('/api/auth/me').catch(err => console.log(err));
        }
    </script>
    `;
    if (!content.includes('originalFetch')) {
        content = content.replace('</body>', fetchInterceptor + '\n</body>');
    }
    
    fs.writeFileSync(filePath, content);
    console.log('Patched ' + file);
}
