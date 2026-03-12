import https from 'https';
import { URL } from 'url';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Syncs booking data to Google Sheets via a Web App (Apps Script)
 * Uses built-in https for maximum compatibility and redirect handling.
 */
export const syncBookingToSheet = async (bookingData) => {
    const webhookUrl = process.env.GOOGLE_SHEET_BOOKING_WEBHOOK;
    
    if (!webhookUrl || webhookUrl === 'your_deployment_url_here') {
        console.warn('⚠️ Google Sheet Booking Webhook URL not configured in .env');
        return;
    }

    console.log(`📡 Attempting to sync booking ${bookingData.bookingId} to Google Sheets...`);

    const postData = JSON.stringify({
        type: 'BOOKING_ENQUIRY',
        data: {
            ...bookingData,
            timestamp: new Date().toLocaleString()
        }
    });

    return new Promise((resolve, reject) => {
        const urlOptions = new URL(webhookUrl);
        const options = {
            hostname: urlOptions.hostname,
            path: urlOptions.pathname + urlOptions.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 400) {
                    console.log('✅ Successfully synced to Google Sheets');
                    resolve(true);
                } else {
                    console.error(`❌ Google Sheets Error: ${res.statusCode}`);
                    resolve(false);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`❌ Sync Request Error: ${e.message}`);
            resolve(false);
        });

        req.write(postData);
        req.end();
    });
};

/**
 * Fetches package data from a published Google Sheet (JSON format)
 */
export const fetchPackagesFromSheet = async () => {
    const sheetUrl = process.env.GOOGLE_SHEET_PACKAGE_DATA_URL;

    if (!sheetUrl || sheetUrl === 'your_published_json_url_here') {
        console.warn('⚠️ Google Sheet Package Data URL not configured in .env');
        return [];
    }

    return new Promise((resolve, reject) => {
        https.get(sheetUrl, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.error('❌ Failed to parse Sheet JSON:', e.message);
                    resolve([]);
                }
            });
        }).on('error', (e) => {
            console.error(`❌ Fetch Error: ${e.message}`);
            resolve([]);
        });
    });
};
