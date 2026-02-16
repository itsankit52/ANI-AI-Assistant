const commands = [
    {
        title: "About",
        icon: "fa-user-astronaut",
        commands: [
            { text: 'Hello, I\'m Ankit 👋', example: 'I\'ve created ANI, a futuristic AI assistant built using only HTML, CSS , and JavaScript . It features voice and text interaction, real-time system status, and a modern interface (Commands are given below).' }
        ]
    },
    {
        title: "Greetings",
        icon: "fa-hand-spock",
        commands: [
            { text: '"Hello ANI", "Hi ANI", "hey ANI"', example: 'with "ani" for special greeting' }
        ]
    },
    {
        title: "Mode Switching",
        icon: "fa-exchange-alt",
        commands: [
            { text: '"switch to voice" / "voice mode"', example: 'Activates voice recognition mode' },
            { text: '"switch to text" / "text mode"', example: 'Switches to text input mode' }
        ]
    },
    {
        title: "Navigation Commands",
        icon: "fa-compass",
        commands: [
            { text: '"open youtube"', example: 'Opens YouTube website' },
            { text: '"open google"', example: 'Opens Google search' },
            { text: '"open github"', example: 'Opens GitHub' },
            { text: '"open instagram"', example: 'Opens Instagram' },
            { text: '"open facebook"', example: 'Opens Facebook' },
            { text: '"open twitter" / "open x"', example: 'Opens Twitter/X' },
            { text: '"open linkedin"', example: 'Opens LinkedIn' },
            { text: '"open whatsapp"', example: 'Opens WhatsApp Web' },
            { text: '"open gmail"', example: 'Opens Gmail' },
            { text: '"open reddit"', example: 'Opens Reddit' },
            { text: 'Phrases that work:', example: '"open [website]", "go to [website]", "navigate to [website]"' }
        ]
    },
    {
        title: "Search Commands",
        icon: "fa-search",
        commands: [
            { text: '"search for [query]"', example: 'Searches the web for your query' },
            { text: '"google [query]"', example: 'Uses Google to search' },
            { text: '"search [query]"', example: 'General search command' },
            { text: 'Examples:', example: '"search for artificial intelligence", "google weather in New York", "search JavaScript tutorials","etc...' }
        ]
    },
    {
        title: "Time & Date",
        icon: "fa-clock",
        commands: [
            { text: '"time"', example: 'Shows current time' },
            { text: '"what time is it?"', example: 'Tells you the current time' },
            { text: '"clock"', example: 'Displays clock' }
        ]
    },
    {
        title: "Weather",
        icon: "fa-cloud-sun",
        commands: [
            { text: '"weather"', example: 'Provides weather information' },
            { text: '"temperature"', example: 'Gives current temperature' },
            { text: '"what\'s the weather?"', example: 'Weather report' },
            { text: '"check weather"', example: 'Checks local weather' }
        ]
    },
    {
        title: "Browser Navigation",
        icon: "fa-window-restore",
        commands: [
            { text: '"reload" / "refresh"', example: 'Reloads current page' },
            { text: '"go back" / "back"', example: 'Navigates to previous page' },
            { text: '"go forward" / "forward"', example: 'Navigates forward in history' }
        ]
    },

    {
        title: "Calculation",
        icon: "fa-calculator",
        commands: [
            { text: '"Add" / "Substract" / "Multiplication" /"Division"', example: 'Calculate result' }
        ]
    },
    {
        title: "System Information",
        icon: "fa-info-circle",
        commands: [
            { text: '"battery" / "power" / "battery status" ', example: 'Shows battery status' },
            { text: '"network" / "connection" / "network status"', example: 'Checks network status' }
        ]
    },
    {
        title: "Help & Capabilities",
        icon: "fa-question-circle",
        commands: [
            { text: '"help" / "what can you do?"', example: '' },
        ]
    },
    {
        title: "Utility Commands",
        icon: "fa-cogs",
        commands: [
            { text: '"clear log" / "clear history"', example: 'Clears command history' },
            { text: '"thank you" / "thanks"', example: 'Thanks the assistant' },
            { text: '"goodbye" / "bye" / "exit"', example: 'Ends the session' }
        ]
    }
];

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements with null checks
    const openGuideBtn = document.getElementById('openGuideBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalContent = document.getElementById('modalContent');

    // Check if required elements exist
    if (!openGuideBtn || !closeModalBtn || !modalOverlay || !modalContent) {
        console.error('One or more required elements not found in the DOM');
        return; // Exit if essential elements are missing
    }

    // Function to render command categories
    function renderCommands() {
        modalContent.innerHTML = '';

        commands.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'command-category';

            const titleHTML = `
                <div class="category-title">
                    <div class="category-icon">
                        <i class="fas ${category.icon}"></i>
                    </div>
                    <span>${category.title}</span>
                </div>
            `;

            let commandsHTML = '<div class="command-list">';

            category.commands.forEach(command => {
                // Highlight examples within brackets
                let exampleHTML = command.example;
                if (exampleHTML.includes('[') && exampleHTML.includes(']')) {
                    exampleHTML = exampleHTML.replace(/\[(.*?)\]/g, '<span class="example-highlight">[$1]</span>');
                }

                commandsHTML += `
                    <div class="command-item">
                        <div class="command-text">${command.text}</div>
                        <div class="command-example">${exampleHTML}</div>
                    </div>
                `;
            });

            commandsHTML += '</div>';
            categoryElement.innerHTML = titleHTML + commandsHTML;
            modalContent.appendChild(categoryElement);
        });
    }

    // Open modal function with animation
    function openModal() {
        if (!modalOverlay) return;

        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Add ripple effect to button
        if (openGuideBtn) {
            const ripple = document.createElement('span');
            const rect = openGuideBtn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = rect.left + (rect.width / 2) - (size / 2);
            const y = rect.top + (rect.height / 2) - (size / 2);

            ripple.style.cssText = `
                position: fixed;
                border-radius: 50%;
                background: rgba(106, 17, 203, 0.6);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                top: ${y}px;
                left: ${x}px;
                z-index: 999;
            `;

            document.body.appendChild(ripple);

            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        }
    }

    // Close modal function
    function closeModal() {
        if (!modalOverlay) return;

        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Event Listeners with null checks
    if (openGuideBtn) {
        openGuideBtn.addEventListener('click', openModal);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside content
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

    // Initialize
    renderCommands();

    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});