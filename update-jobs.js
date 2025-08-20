const fs = require('fs');
const https = require('https');

// Function to fetch RSS feed
function fetchRSS(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Function to parse RSS XML
function parseRSS(xmlData) {
  const items = [];
  const itemMatches = xmlData.match(/<item>([\s\S]*?)<\/item>/g);
  
  if (!itemMatches) return items;
  
  itemMatches.forEach(item => {
    // Try CDATA format first, then fall back to plain text
    let titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
    if (!titleMatch) {
      titleMatch = item.match(/<title>(.*?)<\/title>/);
    }
    
    const linkMatch = item.match(/<link>(.*?)<\/link>/);
    const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
    
    if (titleMatch && linkMatch && pubDateMatch) {
      items.push({
        title: titleMatch[1].trim(),
        link: linkMatch[1].trim(),
        pubDate: new Date(pubDateMatch[1].trim())
      });
    }
  });
  
  return items;
}

// Function to filter jobs by date (within last 30 days)
function filterRecentJobs(jobs) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return jobs.filter(job => job.pubDate >= thirtyDaysAgo);
}

// Function to format jobs as markdown
function formatJobsAsMarkdown(jobs) {
  if (jobs.length === 0) {
    return "## 🚫 No Current Openings\n\n*Check back soon for new opportunities!*";
  }
  
  let markdown = `## 🎯 ${jobs.length} Current Job Opening${jobs.length === 1 ? '' : 's'}\n\n`;
  
  jobs.forEach((job) => {
    const formattedDate = job.pubDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Calculate days ago
    const daysAgo = Math.floor((new Date() - job.pubDate) / (1000 * 60 * 60 * 24));
    const timeAgo = daysAgo === 0 ? '🔥 Today' : 
                   daysAgo === 1 ? '⭐ Yesterday' : 
                   daysAgo <= 7 ? `📅 ${daysAgo} days ago` : 
                   `📅 ${formattedDate}`;
    
    markdown += `### 💼 [${job.title}](${job.link})\n`;
    markdown += `**${timeAgo}** | 🌐 Remote\n\n`;
    markdown += `---\n\n`;
  });
  
  return markdown;
}

// Function to update README.md
function updateReadme(jobsMarkdown) {
  const readmePath = './README.md';
  
  // Check if README exists
  if (!fs.existsSync(readmePath)) {
    console.error('README.md file not found!');
    return;
  }
  
  let readmeContent = fs.readFileSync(readmePath, 'utf8');
  
  const now = new Date();
  const lastUpdated = now.toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
  
  // Update the last updated time
  readmeContent = readmeContent.replace(
    /\*Last updated: .*?\*/,
    `*Last updated: ${lastUpdated}*`
  );
  
  // Update the jobs section
  const jobsStartMarker = '<!-- JOBS_START -->';
  const jobsEndMarker = '<!-- JOBS_END -->';
  const startIndex = readmeContent.indexOf(jobsStartMarker);
  const endIndex = readmeContent.indexOf(jobsEndMarker);
  
  if (startIndex !== -1 && endIndex !== -1) {
    const beforeMarker = readmeContent.substring(0, startIndex + jobsStartMarker.length);
    const afterMarker = readmeContent.substring(endIndex);
    const newContent = beforeMarker + '\n' + jobsMarkdown + '\n' + afterMarker;
    
    fs.writeFileSync(readmePath, newContent, 'utf8');
    console.log('README.md updated successfully!');
  } else {
    console.error('Could not find job markers in README.md');
  }
}

// Main function
async function main() {
  try {
    console.log('Fetching RSS feed...');
    const rssData = await fetchRSS('https://benture.io/rss');
    
    console.log('Parsing RSS data...');
    const allJobs = parseRSS(rssData);
    
    console.log(`Found ${allJobs.length} total jobs`);
    
    console.log('Filtering recent jobs...');
    const recentJobs = filterRecentJobs(allJobs);
    
    console.log(`Found ${recentJobs.length} jobs from the last 30 days`);
    
    console.log('Updating README...');
    const jobsMarkdown = formatJobsAsMarkdown(recentJobs);
    updateReadme(jobsMarkdown);
    
    console.log('Job update completed successfully!');
    
  } catch (error) {
    console.error('Error updating jobs:', error);
    process.exit(1);
  }
}

main();