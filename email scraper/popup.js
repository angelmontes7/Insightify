let scrapeEmails = document.getElementById('scrapeEmails');
let list = document.getElementById('emailList');
let uniqueEmails = new Set(); // Using a Set to store unique emails

// Handler to receive emails from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Get emails
    let emails = request.emails;

    // Filter out duplicate emails
    let uniqueEmailArray = Array.from(uniqueEmails); // Convert Set to Array
    let uniqueEmailSet = new Set(uniqueEmailArray.concat(emails));

    // Clear previous list
    list.innerHTML = '';

    // Display unique emails on popup
    if (uniqueEmailSet.size === 0) {
        // No email
        let li = document.createElement("li");
        li.innerText = "No email found";
        list.appendChild(li);
    } else {
        // Display unique emails
        uniqueEmailSet.forEach((email) => {
            let li = document.createElement("li");
            li.innerText = email;
            list.appendChild(li);
        });
    }
})

// Button's click event listener
scrapeEmails.addEventListener("click", async () => {
    // Get current active tab
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Execute script to parse emails on page
    chrome.scripting.executeScript({ target: { tabId: tab.id }, func: scrapeEmailsFromPage });
})

// Function to scrape emails
function scrapeEmailsFromPage() {
    // RegEx to parse emails from html code
    const emailRegEx = /[\w\.=-]+@[\w\.-]+\.[\w]{2,3}/gim;

    // Parse emails from the HTML of the page
    let emails = document.body.innerHTML.match(emailRegEx);

    // Send unique emails to popup
    chrome.runtime.sendMessage({ emails });
}
