import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const API_KEY = process.env.SCRAPINGANT_API_KEY;

async function debugScrapingAnt() {
  console.log('\n🔍 SCRAPINGANT DEBUG TEST');
  console.log('='.repeat(60));
  console.log('API Key:', API_KEY);
  console.log('='.repeat(60));

  const testUrl = 'https://www.airbnb.com/rooms/1558550319623454948';
  
  try {
    const response = await axios({
      method: 'GET',
      url: 'https://api.scrapingant.com/v2/general',
      params: {
        url: testUrl,
        x_api_key: API_KEY,
        browser: true,
        wait_for_selector: 'h1',
        proxy_country: 'US'
      },
      timeout: 30000
    });

    console.log('\n✅ Response received!');
    console.log('Status:', response.status);
    console.log('Has content:', !!response.data?.content);
    console.log('Content type:', typeof response.data?.content);
    console.log('Content length:', response.data?.content?.length || 0);
    
    if (response.data?.content) {
      // Save the response to a file for inspection
      fs.writeFileSync('scrapingant-response.html', response.data.content);
      console.log('📁 Response saved to scrapingant-response.html');
      
      // Show first 500 chars
      console.log('\n📄 First 500 chars of response:');
      console.log('-'.repeat(40));
      console.log(response.data.content.substring(0, 500));
      console.log('-'.repeat(40));
      
      // Check if it's HTML
      if (response.data.content.includes('<html')) {
        console.log('✅ Response contains HTML');
      } else {
        console.log('❌ Response is not HTML');
      }
    } else {
      console.log('❌ No content in response');
      console.log('Full response:', JSON.stringify(response.data, null, 2));
    }

  } catch (error) {
    console.log('\n❌ Request failed');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

debugScrapingAnt();