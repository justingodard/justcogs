// scripts/fetchDiscogs.js
const fs = require('fs');
const fetch = require('node-fetch');

const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN; // set in GitHub secrets
const USERNAME = process.env.DISCOGS_USERNAME || 'justingodard'; // from GitHub secrets or default
const OUTPUT_DIR = './data'; // folder in your repo
const DISCOGS_API = 'https://api.discogs.com';

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Rate limiting: wait between requests (Discogs allows ~60 requests/min)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJson(url, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Discogs token=${DISCOGS_TOKEN}`,
                'User-Agent': 'Justcogs/1.0 +https://justingodard.github.io/justcogs/'
            }
        });
        
        // Handle rate limiting
        if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000; // Default 60 seconds
            if (attempt < retries - 1) {
                console.warn(`Rate limited. Waiting ${waitTime/1000} seconds before retry...`);
                await delay(waitTime);
                continue;
            }
        }
        
        if (!response.ok) {
            throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
    }
    throw new Error(`Failed after ${retries} attempts`);
}

async function main() {
    try {
        console.log(`Fetching Discogs collection for user: ${USERNAME}`);
        
        // Fetch folders
        console.log('Fetching collection folders...');
        const foldersData = await fetchJson(`${DISCOGS_API}/users/${USERNAME}/collection/folders`);
        fs.writeFileSync(`${OUTPUT_DIR}/folders.json`, JSON.stringify(foldersData, null, 2));
        await delay(1200); // Rate limit: ~50 requests/min

        const folders = foldersData.folders || [];
        const allFolder = folders.find(f => f.id === 0) || folders[0];
        if (!allFolder) {
            throw new Error('No collection folders found.');
        }

        // Fetch first page to get pagination info
        console.log('Fetching collection page 1...');
        const firstPageData = await fetchJson(
            `${DISCOGS_API}/users/${USERNAME}/collection/folders/${allFolder.id}/releases?per_page=100&page=1`
        );
        await delay(1200);

        const pagination = firstPageData.pagination || {};
        const totalPages = pagination.pages || 1;
        const totalItems = pagination.items || 0;
        console.log(`Found ${totalItems} items across ${totalPages} pages`);

        // Collect all releases from first page
        let allReleases = firstPageData.releases || [];

        // Fetch remaining pages with rate limiting
        for (let page = 2; page <= totalPages; page++) {
            console.log(`Fetching collection page ${page}/${totalPages}...`);
            const pageData = await fetchJson(
                `${DISCOGS_API}/users/${USERNAME}/collection/folders/${allFolder.id}/releases?per_page=100&page=${page}`
            );
            allReleases = allReleases.concat(pageData.releases || []);
            
            // Rate limit: wait 1.2 seconds between requests (~50 requests/min)
            if (page < totalPages) {
                await delay(1200);
            }
        }

        // Save consolidated collection data
        const collectionData = {
            pagination: pagination,
            releases: allReleases,
            lastUpdated: new Date().toISOString()
        };
        fs.writeFileSync(`${OUTPUT_DIR}/collection.json`, JSON.stringify(collectionData, null, 2));

        console.log(`✅ Successfully fetched ${allReleases.length} releases`);
        console.log(`📁 Data saved to ${OUTPUT_DIR}/collection.json`);
    } catch (err) {
        console.error('❌ Error fetching Discogs data:', err);
        process.exit(1);
    }
}

main();