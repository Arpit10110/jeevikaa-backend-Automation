import puppeteer from "puppeteer";

const findnearpharma = async () => {
  const browser = await puppeteer.launch({
    headless: false, // Keep this false for debugging
    defaultViewport: null,
    args: ["--start-maximized"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
  );

  await page.goto(
    "https://www.google.co.in/maps/@28.4889339,77.5012906,16z?entry=ttu&g_ep=EgoyMDI1MDUyNy4wIKXMDSoASAFQAw%3D%3D",
    { waitUntil: "networkidle2" }
  );

  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds for page to settle

  const googlemap_search = await page.waitForSelector("#searchboxinput", {
    timeout: 10000,
  });
  await googlemap_search.type("nearest medical shop", { delay: 100 });
  await page.keyboard.press("Enter");

  try {
    await page.waitForSelector(
      'div[aria-label="Results for nearest medical shop"]',
      { timeout: 60000 }
    );
    console.log("Main results container found!");
  } catch (error) {
    console.error(
      "Error: Main results container not found within timeout. Please verify the exact 'aria-label' on the page.",
      error
    );
    await browser.close();
    return;
  }

  const medicalStores = await page.evaluate(() => {
    console.log("--- Inside page.evaluate (Browser Context) ---");

    const mainResultsContainer = document.querySelector('div[aria-label="Results for nearest medical shop"]');

    if (!mainResultsContainer) {
      console.error("DEBUG: mainResultsContainer is null inside evaluate. Critical issue.");
      return [];
    }

    const allNv2PKDivs = mainResultsContainer.querySelectorAll('div > div.Nv2PK');
    console.log(`DEBUG: Raw Nv2PK divs found using 'div > div.Nv2PK': ${allNv2PKDivs.length}`);

    if (allNv2PKDivs.length === 0) {
      console.warn("DEBUG: No 'div > div.Nv2PK' elements found within the main results container. Check selector or loading.");
      return [];
    }

    const storeDivs = Array.from(allNv2PKDivs).slice(1);
    console.log(`DEBUG: Nv2PK Divs for scraping (after slice(1)): ${storeDivs.length}`);

    if (storeDivs.length === 0) {
      console.warn("DEBUG: No individual store divs remaining after slicing. Check if slice(1) is appropriate.");
      return [];
    }

    const stores = [];
    storeDivs.forEach((div, index) => {
      console.log(`\nDEBUG: Processing Nv2PK div #${index + 1} (out of ${storeDivs.length})`);
      console.log("DEBUG: Current Nv2PK div outerHTML (first 500 chars):", div.outerHTML.substring(0, 500));

      let name = "";
      let phoneNumber = "";
      let address = "";
      let link = "";
      let status = "";

      // --- GET NAME AND LINK ---
      const mainAnchor = div.querySelector('a.hfpxzc');
      if (mainAnchor) {
          name = mainAnchor.getAttribute('aria-label') || '';
          link = mainAnchor.href || '';
          console.log(`DEBUG: Found name: "${name}" (from aria-label)`);
          console.log(`DEBUG: Found link: "${link}" (from href)`);
      } else {
          console.warn("DEBUG: Main anchor (a.hfpxzc) NOT found in this Nv2PK div. Skipping this result.");
          return;
      }

      // --- GET PHONE NUMBER (Fixed) ---
      // Based on the HTML structure, phone numbers are in spans with class "UsdlK"
      const phoneElement = div.querySelector('span.UsdlK');
      if (phoneElement) {
        phoneNumber = phoneElement.textContent.trim();
        console.log(`DEBUG: Found phone (UsdlK class): "${phoneNumber}"`);
      } else {
        // Backup: look for phone patterns in spans with aria-label containing "Phone"
        const phoneAriaElement = div.querySelector('span[aria-label^="Phone:"]');
        if (phoneAriaElement) {
          phoneNumber = phoneAriaElement.textContent.replace("Phone:", "").trim();
          console.log(`DEBUG: Found phone (aria-label): "${phoneNumber}"`);
        } else {
          // Final backup: regex search for phone patterns
          const allSpans = div.querySelectorAll("span");
          for (const span of allSpans) {
            const text = span.textContent.trim();
            // Updated regex to match Indian phone numbers and international formats
            if (/(?:\+91|0)?[\s-]?[6-9]\d{9}|(?:\d{3}[\s-]?\d{3}[\s-]?\d{4})/.test(text)) {
              phoneNumber = text;
              console.log(`DEBUG: Found phone (regex match): "${phoneNumber}"`);
              break;
            }
          }
        }
        if (!phoneNumber) console.warn(`DEBUG: Phone number NOT found for: "${name}"`);
      }

      // --- GET ADDRESS (Fixed) ---
      // Address is typically in spans that are not phone numbers or status
      // Look for descriptive text that contains location indicators
      const allSpans = div.querySelectorAll('span');
      for (const span of allSpans) {
        const text = span.textContent.trim();
        
        // Skip if it's the phone number we already found
        if (text === phoneNumber) continue;
        
        // Skip if it's clearly a status (contains open/closed keywords)
        if (text.includes('Open') || text.includes('Closed') || text.includes('Closes') || text.includes('Opens') || text.includes('24 hours')) continue;
        
        // Skip if it's clearly a phone number pattern
        if (/(?:\+91|0)?[\s-]?[6-9]\d{9}|(?:\d{3}[\s-]?\d{3}[\s-]?\d{4})/.test(text)) continue;
        
        // Skip very short text (likely not addresses)
        if (text.length < 5) continue;
        
        // Skip if it's the store name
        if (text.toLowerCase().includes(name.toLowerCase().split(' ')[0])) continue;
        
        // Look for address-like patterns
        if (text.includes(',') || 
            text.includes('Sector') || 
            text.includes('Road') || 
            text.includes('Shop') ||
            text.includes('Near') ||
            text.includes('Main') ||
            text.includes('Market') ||
            text.includes('Complex') ||
            /\d{6}/.test(text) || // Postal code pattern
            text.includes('·') // Often separates address components
        ) {
          address = text;
          console.log(`DEBUG: Found address: "${address}"`);
          break;
        }
      }
      
      if (!address) {
        console.warn(`DEBUG: Address NOT found for: "${name}"`);
      }

      // --- GET STATUS ---
      const statusElement = div.querySelector(".HBPvJd.fontBodyMedium");
      if (statusElement) {
        status = statusElement.textContent.trim();
        console.log(`DEBUG: Found status (.HBPvJd.fontBodyMedium): "${status}"`);
      } else {
        // Look for status in spans containing timing keywords
        for (const span of allSpans) {
          const text = span.textContent.trim();
          if (
            text.includes("Open") ||
            text.includes("Closed") ||
            text.includes("Opens") ||
            text.includes("Closes") ||
            text.includes("24 hours")
          ) {
            status = text;
            console.log(`DEBUG: Found status (keyword match): "${status}"`);
            break;
          }
        }
        if (!status) console.warn(`DEBUG: Status NOT found for: "${name}"`);
      }

      // Add store to results
      if (name && name.toLowerCase() !== "sponsored") {
        stores.push({
          name,
          phoneNumber: phoneNumber || "Not available",
          address: address || "Not available", 
          link,
          status: status || "Not available",
        });
        console.log(`DEBUG: Successfully added store: "${name}"`);
        console.log(`DEBUG: Phone: "${phoneNumber}", Address: "${address}", Status: "${status}"`);
      } else {
          console.warn(`DEBUG: Skipping potentially invalid or sponsored entry: "${name}"`);
      }
    });

    return stores;
  });

  console.log("Medical Stores (Final Result - Terminal):", medicalStores);

//   await browser.close();
};

findnearpharma();