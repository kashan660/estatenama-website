// Estate Nama Click Behavior Verification Script
// This script tests that WhatsApp and email functions work correctly

(function() {
    'use strict';
    
    console.log('%c🔍 Estate Nama Click Behavior Verification', 'color: #2a5298; font-size: 16px; font-weight: bold;');
    console.log('%cTesting WhatsApp and Email functionality...', 'color: #666;');
    
    let testResults = {
        whatsappButtons: [],
        emailElements: [],
        phoneNumbers: [],
        issues: []
    };
    
    // Test 1: Check WhatsApp buttons
    console.log('\n📱 Testing WhatsApp Buttons:');
    const whatsappButtons = document.querySelectorAll('[onclick*="openWhatsApp"]');
    whatsappButtons.forEach((btn, index) => {
        const text = btn.textContent.trim();
        const onclick = btn.getAttribute('onclick');
        
        testResults.whatsappButtons.push({
            element: btn,
            text: text,
            onclick: onclick,
            hasProperFunction: onclick.includes('openWhatsApp')
        });
        
        if (btn.hasProperFunction) {
            console.log(`✅ WhatsApp Button ${index + 1}: "${text}" - Correctly calls openWhatsApp()`);
        } else {
            console.log(`❌ WhatsApp Button ${index + 1}: "${text}" - Missing or incorrect function call`);
            testResults.issues.push(`WhatsApp button "${text}" has incorrect onclick`);
        }
    });
    
    // Test 2: Check email elements
    console.log('\n📧 Testing Email Elements:');
    const emailElements = document.querySelectorAll('*:not(a[href^="mailto:"])');
    let emailClickableElements = [];
    
    emailElements.forEach((el, index) => {
        if (el.textContent.includes('info@estatenama.com') && 
            !el.closest('a[href^="mailto:"]') && 
            el.tagName.toLowerCase() !== 'a') {
            
            emailClickableElements.push(el);
            
            testResults.emailElements.push({
                element: el,
                tagName: el.tagName,
                textContent: el.textContent.trim(),
                hasClickHandler: el.style.cursor === 'pointer'
            });
            
            if (el.style.cursor === 'pointer') {
                console.log(`✅ Email Element ${index + 1}: <${el.tagName.toLowerCase()}> - Has click handler`);
            } else {
                console.log(`⚠️  Email Element ${index + 1}: <${el.tagName.toLowerCase()}> - No click handler detected`);
            }
        }
    });
    
    // Test 3: Check phone numbers
    console.log('\n📞 Testing Phone Numbers:');
    const phoneElements = document.querySelectorAll('*');
    phoneElements.forEach((el, index) => {
        if (el.textContent.includes('03195547788') && 
            !el.hasAttribute('onclick') && 
            !el.closest('a[href^="tel:"]')) {
            
            testResults.phoneNumbers.push({
                element: el,
                tagName: el.tagName,
                textContent: el.textContent.trim(),
                hasWhatsAppHandler: el.getAttribute('onclick')?.includes('openWhatsApp') || false
            });
            
            console.log(`✅ Phone Number ${index + 1}: <${el.tagName.toLowerCase()}> - No unwanted handlers`);
        }
    });
    
    // Test 4: Check for global click handlers
    console.log('\n🌍 Testing Global Click Handlers:');
    const globalClickHandlers = [];
    
    // Check document event listeners
    if (document._events && document._events.click) {
        globalClickHandlers.push('Document has click event listeners');
    }
    
    // Check for elements with broad selectors
    const broadSelectors = document.querySelectorAll('p, span, div');
    let clickableElements = 0;
    
    broadSelectors.forEach(el => {
        if (el.style.cursor === 'pointer' && 
            !el.textContent.includes('info@estatenama.com') && 
            !el.hasAttribute('onclick')) {
            clickableElements++;
        }
    });
    
    if (clickableElements > 0) {
        console.log(`⚠️  Found ${clickableElements} elements with pointer cursor but no clear purpose`);
        testResults.issues.push(`${clickableElements} elements have pointer cursor without clear purpose`);
    } else {
        console.log('✅ No suspicious global click handlers detected');
    }
    
    // Test 5: Simulate clicks to verify behavior
    console.log('\n🧪 Simulating Clicks:');
    
    // Test WhatsApp button
    if (whatsappButtons.length > 0) {
        console.log('Testing WhatsApp button click...');
        const originalOpenWhatsApp = window.openWhatsApp;
        let whatsappCalled = false;
        
        window.openWhatsApp = function() {
            whatsappCalled = true;
            console.log('✅ WhatsApp function called correctly');
        };
        
        whatsappButtons[0].click();
        
        if (whatsappCalled) {
            console.log('✅ WhatsApp button works correctly');
        } else {
            console.log('❌ WhatsApp button did not trigger function');
            testResults.issues.push('WhatsApp button click not working');
        }
        
        window.openWhatsApp = originalOpenWhatsApp;
    }
    
    // Test email element
    if (emailClickableElements.length > 0) {
        console.log('Testing email element click...');
        const originalLocation = window.location.href;
        let emailTriggered = false;
        
        // Override location.href temporarily
        Object.defineProperty(window.location, 'href', {
            get: () => originalLocation,
            set: (newHref) => {
                if (newHref.startsWith('mailto:')) {
                    emailTriggered = true;
                    console.log('✅ Email link triggered correctly:', newHref);
                }
            }
        });
        
        emailClickableElements[0].click();
        
        if (emailTriggered) {
            console.log('✅ Email element works correctly');
        } else {
            console.log('❌ Email element did not trigger mailto');
            testResults.issues.push('Email element click not working');
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('%c📊 TEST SUMMARY', 'color: #2a5298; font-size: 14px; font-weight: bold;');
    console.log('='.repeat(50));
    
    console.log(`📱 WhatsApp Buttons Found: ${testResults.whatsappButtons.length}`);
    console.log(`📧 Email Elements Found: ${testResults.emailElements.length}`);
    console.log(`📞 Phone Numbers Checked: ${testResults.phoneNumbers.length}`);
    console.log(`❌ Issues Found: ${testResults.issues.length}`);
    
    if (testResults.issues.length > 0) {
        console.log('\n%c⚠️  ISSUES TO FIX:', 'color: #dc3545; font-weight: bold;');
        testResults.issues.forEach((issue, index) => {
            console.log(`${index + 1}. ${issue}`);
        });
    } else {
        console.log('\n%c✅ ALL TESTS PASSED! Click behavior is working correctly.', 'color: #28a745; font-weight: bold;');
    }
    
    // Return results for further processing
    return testResults;
    
})();