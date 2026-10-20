import fs from 'fs';

const atlasData = JSON.parse(fs.readFileSync('backup_safety/existing_atlas_data.json', 'utf8'));
const sqliteData = JSON.parse(fs.readFileSync('backup_safety/dump_portfolio_db.json', 'utf8'));

console.log('COMPARISON: Atlas vs SQLite');
console.log('==========================================');

console.log('\n--- PROFILES ---');
console.log('Atlas Profile:', JSON.stringify(atlasData.profiles?.[0], null, 2));
console.log('SQLite Profile:', JSON.stringify(sqliteData.profile?.rows?.[0], null, 2));

console.log('\n--- PROJECTS ---');
console.log('Atlas Projects:', atlasData.projects?.map(p => ({ name: p.name, liveUrl: p.liveUrl, githubUrl: p.githubUrl, image: p.image })));
console.log('SQLite Projects:', sqliteData.projects?.rows?.map(p => ({ name: p.name, liveUrl: p.live_url, githubUrl: p.github_url, image: p.main_image })));

console.log('\n--- SKILLS ---');
console.log('Atlas Skills count:', atlasData.skills?.length, atlasData.skills?.map(s => s.name));
console.log('SQLite Skills count:', sqliteData.skills?.count, sqliteData.skills?.rows?.map(s => s.name));

console.log('\n--- SERVICES ---');
console.log('Atlas Services count:', atlasData.services?.length, atlasData.services?.map(s => s.title));
console.log('SQLite Services count:', sqliteData.services?.count, sqliteData.services?.rows?.map(s => s.title));

console.log('\n--- SOCIAL LINKS ---');
console.log('Atlas Social count:', atlasData.sociallinks?.length, atlasData.sociallinks?.map(s => ({ platform: s.platform, url: s.url })));
console.log('SQLite Social count:', sqliteData.social_links?.count, sqliteData.social_links?.rows?.map(s => ({ platform: s.platform, url: s.url })));

console.log('\n--- CV ---');
console.log('Atlas CV:', atlasData.cvs);
console.log('SQLite CV count:', sqliteData.cv?.count);

console.log('\n--- CONTACT MESSAGES ---');
console.log('Atlas Messages count:', atlasData.contactmessages?.length, atlasData.contactmessages?.map(m => m.name));
console.log('SQLite Messages count:', sqliteData.contact_messages?.count, sqliteData.contact_messages?.rows?.map(m => m.name));

console.log('\n--- SITE SETTINGS ---');
console.log('Atlas Settings:', atlasData.sitesettings?.[0]);
console.log('SQLite Settings:', sqliteData.site_settings?.rows?.[0]);
