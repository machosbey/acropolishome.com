const fs = require('fs');
const path = 'C:\\Users\\TUF FX553V\\Desktop\\اكروبوليس\\public\\UPLOADS';
const files = fs.readdirSync(path);
fs.writeFileSync('C:\\Users\\TUF FX553V\\Desktop\\اكروبوليس\\ls_uploads.txt', files.join('\n'));
