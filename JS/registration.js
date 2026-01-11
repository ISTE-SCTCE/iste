// ../JS/registration.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registration-form");
    const statusDiv = document.getElementById("submission-status");

    // 🚨 CRITICAL: Replace this URL with your actual deployed Google Apps Script URL
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwSaurzyOEbeJoKTVgCqVhy-esPWq2HpU6UOtfK_7Ds5p7Kisz736_m2k6UnwnWP2Jg/exec";

    // --- Forum Selection Logic ---
    const membershipRadios = document.querySelectorAll('input[name="Membership"]');
    const forumCheckboxes = document.querySelectorAll('input[name="Forum"]');

    function updateForumAccessibility() {
        const isMembershipSelected = Array.from(membershipRadios).some(r => r.checked);
        forumCheckboxes.forEach(checkbox => {
            checkbox.disabled = !isMembershipSelected;
            // Visual feedback: dim the option if disabled
            if (checkbox.parentElement) {
                checkbox.parentElement.style.opacity = isMembershipSelected ? "1" : "0.5";
                checkbox.parentElement.style.pointerEvents = isMembershipSelected ? "auto" : "none";
            }
        });
    }

    // Initial check (in case browser restores state on reload)
    updateForumAccessibility();

    // Listen for changes
    membershipRadios.forEach(radio => {
        radio.addEventListener('change', updateForumAccessibility);
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        statusDiv.innerHTML = "<p>Submitting... Please wait.</p>";

        // 1. Get the Raw Form Data using the constructor (most reliable)
        const formData = new FormData(form);

        // 2. Client-side Validation Check (check for Membership and TransactionID)
        if (!formData.get('Membership')) {
            statusDiv.innerHTML = "<p style='color:red;'>Please select a membership option.</p>";
            return;
        }
        if (!formData.get('TransactionID')) {
            statusDiv.innerHTML = "<p style='color:red;'>Please enter the Transaction ID.</p>";
            return;
        }

        // 3. SEND DATA TO GOOGLE APPS SCRIPT
        try {
            const response = await fetch(SCRIPT_URL, {
                method: "POST",
                body: formData, // Sends all fields, including multiple 'Forum' values
                // IMPORTANT: Headers MUST NOT be set manually for FormData
            });

            if (response.ok) {
                const result = await response.json();
                statusDiv.innerHTML = `<p style='color:green;'>Registration successful! ${result.message || 'Data logged.'}</p>`;
                form.reset();
            } else {
                const errorText = await response.text();
                console.error("Server Error Response:", errorText);
                statusDiv.innerHTML = `<p style='color:red;'>Submission failed. Server responded: ${response.status}.</p>`;
            }
        } catch (error) {
            console.error("Fetch/Network Error:", error);
            statusDiv.innerHTML = "<p style='color:red;'>Network error or connection issue. Please try again.</p>";
        }
    });
});