/*******************  ANI AI Assistant  *******************/

// API Configuration
const WEATHER_API_KEY = "79f115636a4cf2563e05d2ec3b2f664e";
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

// DOM Elements
const aiCore = document.getElementById('aiCore');
const coreStatus = document.getElementById('coreStatus');
const corePulse = document.querySelector('.core-pulse');
const listeningIndicator = document.getElementById('listeningIndicator');
const processingIndicator = document.getElementById('processingIndicator');
const voiceVisualizer = document.getElementById('voiceVisualizer');
const startListeningBtn = document.getElementById('startListening');
const stopListeningBtn = document.getElementById('stopListening');
const commandLog = document.getElementById('commandLog');
const timeDisplay = document.getElementById('time');
const dateDisplay = document.getElementById('date');
const batteryDisplay = document.getElementById('battery');
const networkDisplay = document.getElementById('network');
const weatherContent = document.getElementById('weatherContent');
const refreshWeatherBtn = document.getElementById('refreshWeather');
const voiceStatus = document.getElementById('voiceStatus');
const speechStatus = document.getElementById('speechStatus');
const networkStatus = document.getElementById('networkStatus');
const textCommandInput = document.getElementById('textCommandInput');
const sendTextCommand = document.getElementById('sendTextCommand');
const voiceModeBtn = document.getElementById('voiceModeBtn');
const textModeBtn = document.getElementById('textModeBtn');

// Modal Elements
const userGuideBtn = document.getElementById('userGuideBtn');
const closeModalBtn = document.getElementById('closeModal');
const modalOverlay = document.querySelector('.modal-overlay');

// Mobile Nav Elements
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

// Application State
let isListening = false;
let recognition = null;
let synthesis = null;
let currentWeather = null;
let visualizerInterval = null;
let lastCommandTime = 0;
const commandCooldown = 1000; // 1 second cooldown between commands
let currentMode = 'voice'; // 'voice' or 'text'

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initApplication();
});

function initApplication() {
    // Initialize speech recognition
    initSpeechRecognition();

    // Initialize speech synthesis
    initSpeechSynthesis();

    // Start clock
    updateClock();
    setInterval(updateClock, 1000);

    // Get battery status
    getBatteryStatus();

    // Get weather
    getWeather();

    // Setup event listeners
    setupEventListeners();

    // Create particles
    createParticles();

    // Add initial log entry
    addLogEntry("ANI AI Assistant initialized. Say 'Hello ANI' to begin.", "system");

    // Speak welcome message after a short delay
    setTimeout(() => {
        speak("ANI AI Assistant is ready. How can I assist you today?");
    }, 1000);
}

// Initialize Speech Recognition
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            isListening = true;
            updateUIForListening();
            addLogEntry("Listening...", "system");
            startVoiceVisualizer();
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim();
            addLogEntry(`You said: "${transcript}"`, "user");
            processCommand(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            addLogEntry(`Recognition error: ${event.error}`, "system");
            stopListening();
        };

        recognition.onend = () => {
            if (isListening) {
                // Restart recognition if still in listening mode
                setTimeout(() => {
                    if (isListening) {
                        recognition.start();
                    }
                }, 100);
            } else {
                stopVoiceVisualizer();
                updateUIForIdle();
            }
        };

        voiceStatus.textContent = "Ready";
        voiceStatus.classList.add("active");
    } else {
        voiceStatus.textContent = "Unavailable";
        addLogEntry("Speech recognition is not supported in this browser.", "system");
    }
}

// Initialize Speech Synthesis
function initSpeechSynthesis() {
    if ('speechSynthesis' in window) {
        synthesis = window.speechSynthesis;

        // Get available voices
        setTimeout(() => {
            const voices = synthesis.getVoices();
            if (voices.length > 0) {
                speechStatus.textContent = "Ready";
                speechStatus.classList.add("active");
            }
        }, 500);
    } else {
        speechStatus.textContent = "Unavailable";
        addLogEntry("Speech synthesis is not supported in this browser.", "system");
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Voice control buttons
    startListeningBtn.addEventListener('click', startListening);
    stopListeningBtn.addEventListener('click', stopListening);

    // Text command input
    textCommandInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendTextCommandHandler();
        }
    });

    sendTextCommand.addEventListener('click', sendTextCommandHandler);

    // Mode toggle buttons
    voiceModeBtn.addEventListener('click', () => {
        switchMode('voice');
    });

    textModeBtn.addEventListener('click', () => {
        switchMode('text');
    });

    // Weather refresh button
    refreshWeatherBtn.addEventListener('click', getWeather);

    // Network status
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Battery status updates
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            battery.addEventListener('levelchange', getBatteryStatus);
            battery.addEventListener('chargingchange', getBatteryStatus);
        });
    }

    // User Guide Modal
    if (userGuideBtn) {
        userGuideBtn.addEventListener('click', showUserGuide);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                hideModal();
            }
        });
    }

    // Mobile Navigation Toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const isExpanded = navMenu.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu && navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !navToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// Modal Functions
function showUserGuide() {
    if (modalOverlay) {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
}

function hideModal() {
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Mode Switching
function switchMode(mode) {
    currentMode = mode;

    if (mode === 'voice') {
        // Switch to voice mode
        voiceModeBtn.classList.add('active');
        textModeBtn.classList.remove('active');
        textCommandInput.style.opacity = '0.6';
        textCommandInput.disabled = true;
        startListeningBtn.disabled = false;

        // Stop voice listening if active
        if (isListening) {
            stopListening();
        }

        speak("Switched to voice mode. Click the microphone button to start speaking.");
        addLogEntry("Switched to voice mode.", "system");
    } else if (mode === 'text') {
        // Switch to text mode
        textModeBtn.classList.add('active');
        voiceModeBtn.classList.remove('active');
        textCommandInput.style.opacity = '1';
        textCommandInput.disabled = false;
        textCommandInput.focus();
        textCommandInput.select();

        // Stop voice listening if active
        if (isListening) {
            stopListening();
        }

        // Disable voice buttons in text mode
        startListeningBtn.disabled = true;
        stopListeningBtn.disabled = true;

        speak("Switched to text mode. Type your command and press Enter.");
        addLogEntry("Switched to text mode.", "system");
    }
}

// Text Command Handler
function sendTextCommandHandler() {
    const command = textCommandInput.value.trim();

    if (!command) {
        return;
    }

    // Clear input immediately
    textCommandInput.value = '';

    addLogEntry(`You typed: "${command}"`, "user");

    // Process command immediately
    setTimeout(() => {
        processCommand(command);
    }, 100);
}

// Voice Control Functions
function startListening() {
    if (!recognition) {
        addLogEntry("Speech recognition is not available.", "system");
        return;
    }

    try {
        recognition.start();
        startListeningBtn.disabled = true;
        stopListeningBtn.disabled = false;
    } catch (error) {
        console.error("Failed to start recognition:", error);
        addLogEntry("Failed to start voice recognition.", "system");
    }
}

function stopListening() {
    isListening = false;

    if (recognition) {
        recognition.stop();
    }

    startListeningBtn.disabled = false;
    stopListeningBtn.disabled = true;
    updateUIForIdle();
    addLogEntry("Stopped listening.", "system");
}

// Process Commands (works for both voice and text)
function processCommand(command) {
    const now = Date.now();
    if (now - lastCommandTime < commandCooldown) {
        return; // Ignore commands during cooldown
    }
    lastCommandTime = now;

    const originalCommand = command;
    command = command.toLowerCase();
    addLogEntry(`Processing command: "${originalCommand}"`, "system");

    // Update UI for processing
    updateUIForProcessing();

    // Check for greetings
    if (command.includes("hello") || command.includes("hi") || command.includes("hey")) {
        if (command.includes("ani")) {
            respondToGreeting();
            return;
        }
    }

    // Check for mode switching commands
    if (command.includes("switch to voice") || command.includes("voice mode")) {
        switchMode('voice');
        return;
    } else if (command.includes("switch to text") || command.includes("text mode")) {
        switchMode('text');
        return;
    }

    // Check for math operations
    if (command.includes("calculate") || command.includes("add") || command.includes("subtract") ||
        command.includes("multiply") || command.includes("divide") || command.includes("plus") ||
        command.includes("minus") || command.includes("times") || command.includes("math") ||
        command.includes("square") || command.includes("cube") || command.includes("root") ||
        command.includes("percentage") || command.includes("%") ||
        /^(\d+(\s+)?[+\-*/]\s*\d+)/.test(command)) {
        calculateMath(originalCommand);
        return;
    }

    // Check for specific commands
    if (command.includes("open") || command.includes("go to") || command.includes("navigate to")) {
        handleNavigation(command);
    } else if (command.includes("search") || command.includes("google")) {
        handleSearch(command);
    } else if (command.includes("time") || command.includes("clock")) {
        tellTime();
    } else if (command.includes("weather") || command.includes("temperature")) {
        tellWeather();
    } else if (command.includes("reload") || command.includes("refresh")) {
        reloadPage();
    } else if (command.includes("go back") || command.includes("back")) {
        goBack();
    } else if (command.includes("go forward") || command.includes("forward")) {
        goForward();
    } else if (command.includes("battery") || command.includes("power")) {
        tellBattery();
    } else if (command.includes("network") || command.includes("connection")) {
        tellNetworkStatus();
    } else if (command.includes("what can you do") || command.includes("help") || command.includes("capabilities") || command.includes("commands")) {
        tellCapabilities();
    } else if (command.includes("user guide") || command.includes("guide")) {
        showUserGuide();
    } else if (command.includes("clear log") || command.includes("clear history")) {
        clearCommandLog();
    } else if (command.includes("thank you") || command.includes("thanks")) {
        speak("You're welcome! Is there anything else I can help you with?");
        updateUIForSpeaking();
    } else if (command.includes("goodbye") || command.includes("bye") || command.includes("exit")) {
        speak("Goodbye! Have a great day!");
        updateUIForSpeaking();
        setTimeout(() => {
            updateUIForIdle();
        }, 2000);
    } else {
        // Default response for unrecognized commands
        setTimeout(() => {
            const response = `I heard: "${originalCommand}". ANI did not understand this command. Type "help" to see available commands.`;
            speak(response);
            updateUIForSpeaking();
        }, 1000);
    }
}

// Math Calculation Function
function calculateMath(command) {
    // Remove common words and get the math expression
    let expression = command
        .replace(/calculate|what is|how much is|add|subtract|multiply|divide|plus|minus|times|divided by/gi, '')
        .replace(/square of|cube of|power of|square root of|cube root of/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Handle square
    if (command.includes('square') && command.includes('of')) {
        const numberMatch = command.match(/square of (\d+(\.\d+)?)/i);
        if (numberMatch) {
            const num = parseFloat(numberMatch[1]);
            const result = num * num;
            const response = `The square of ${num} is ${result}.`;
            speak(response);
            updateUIForSpeaking();
            addLogEntry(`ANI: ${response}`, "system");
            return;
        }
    }

    // Handle cube
    if (command.includes('cube') && command.includes('of')) {
        const numberMatch = command.match(/cube of (\d+(\.\d+)?)/i);
        if (numberMatch) {
            const num = parseFloat(numberMatch[1]);
            const result = num * num * num;
            const response = `The cube of ${num} is ${result}.`;
            speak(response);
            updateUIForSpeaking();
            addLogEntry(`ANI: ${response}`, "system");
            return;
        }
    }

    // Handle square root
    if (command.includes('square root')) {
        const numberMatch = command.match(/square root of (\d+(\.\d+)?)/i);
        if (numberMatch) {
            const num = parseFloat(numberMatch[1]);
            if (num >= 0) {
                const result = Math.sqrt(num).toFixed(2);
                const response = `The square root of ${num} is approximately ${result}.`;
                speak(response);
                updateUIForSpeaking();
                addLogEntry(`ANI: ${response}`, "system");
            } else {
                const response = "I cannot calculate the square root of a negative number.";
                speak(response);
                updateUIForSpeaking();
                addLogEntry(`ANI: ${response}`, "system");
            }
            return;
        }
    }

    // Handle cube root
    if (command.includes('cube root')) {
        const numberMatch = command.match(/cube root of ([-+]?\d+(\.\d+)?)/i);
        if (numberMatch) {
            const num = parseFloat(numberMatch[1]);
            const result = Math.cbrt(num).toFixed(2);
            const response = `The cube root of ${num} is approximately ${result}.`;
            speak(response);
            updateUIForSpeaking();
            addLogEntry(`ANI: ${response}`, "system");
            return;
        }
    }

    // Handle power
    if (command.includes('power') || command.includes('to the power')) {
        const powerMatch = command.match(/(\d+(\.\d+)?)\s+(to the power of|raised to|power)\s+(\d+(\.\d+)?)/i);
        if (powerMatch) {
            const base = parseFloat(powerMatch[1]);
            const exponent = parseFloat(powerMatch[4]);
            const result = Math.pow(base, exponent);
            const response = `${base} to the power of ${exponent} is ${result}.`;
            speak(response);
            updateUIForSpeaking();
            addLogEntry(`ANI: ${response}`, "system");
            return;
        }
    }

    // Handle percentage
    if (command.includes('percentage') || command.includes('%')) {
        const percentageMatch = command.match(/(\d+(\.\d+)?)\s*(percent|percentage|%)\s*(of)?\s*(\d+(\.\d+)?)?/i);
        if (percentageMatch) {
            const percentage = parseFloat(percentageMatch[1]);
            let number = parseFloat(percentageMatch[5]) || 100;
            const result = (percentage / 100) * number;
            const response = `${percentage}% of ${number} is ${result}.`;
            speak(response);
            updateUIForSpeaking();
            addLogEntry(`ANI: ${response}`, "system");
            return;
        }
    }

    // Replace words with operators
    expression = expression
        .replace(/plus/gi, '+')
        .replace(/minus/gi, '-')
        .replace(/times|multiplied by/gi, '*')
        .replace(/divided by|over/gi, '/')
        .replace(/modulo|mod/gi, '%');

    // Clean up the expression
    expression = expression.replace(/[^\d+\-*/().%\s]/g, '');

    try {
        // Evaluate the expression safely
        const result = safeEval(expression);
        if (result !== null) {
            const response = `The result is ${result}.`;
            speak(response);
            updateUIForSpeaking();
            addLogEntry(`ANI: ${response}`, "system");
        } else {
            const response = "I couldn't calculate that. Please try a simpler math expression.";
            speak(response);
            updateUIForSpeaking();
            addLogEntry(`ANI: ${response}`, "system");
        }
    } catch (error) {
        console.error('Math calculation error:', error);
        const response = "I encountered an error while calculating. Please check your expression.";
        speak(response);
        updateUIForSpeaking();
        addLogEntry(`ANI: ${response}`, "system");
    }
}

// Safe Evaluation Function
function safeEval(expression) {
    try {
        // Remove any whitespace
        expression = expression.replace(/\s+/g, '');

        // Validate the expression contains only allowed characters
        if (!/^[\d+\-*/().%]+$/.test(expression)) {
            return null;
        }

        // Use Function constructor for safe evaluation
        return new Function('return ' + expression)();
    } catch (error) {
        console.error('Evaluation error:', error);
        return null;
    }
}

// Navigation Commands
function handleNavigation(command) {
    let url = "";
    let siteName = "";

    if (command.includes("youtube")) {
        url = "https://www.youtube.com";
        siteName = "YouTube";
    } else if (command.includes("google")) {
        url = "https://www.google.com";
        siteName = "Google";
    } else if (command.includes("github")) {
        url = "https://github.com";
        siteName = "GitHub";
    } else if (command.includes("instagram")) {
        url = "https://www.instagram.com";
        siteName = "Instagram";
    } else if (command.includes("facebook")) {
        url = "https://www.facebook.com";
        siteName = "Facebook";
    } else if (command.includes("twitter") || command.includes("x")) {
        url = "https://twitter.com";
        siteName = "Twitter";
    } else if (command.includes("linkedin")) {
        url = "https://www.linkedin.com";
        siteName = "LinkedIn";
    } else if (command.includes("whatsapp")) {
        url = "https://web.whatsapp.com";
        siteName = "WhatsApp Web";
    } else if (command.includes("gmail")) {
        url = "https://mail.google.com";
        siteName = "Gmail";
    } else if (command.includes("reddit")) {
        url = "https://www.reddit.com";
        siteName = "Reddit";
    } else {
        // Try to extract a URL from the command
        const urlMatch = command.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
            url = urlMatch[0];
            siteName = "the website";
        } else {
            const response = "I'm not sure which website you want to open. Please specify a site like YouTube, Google, or GitHub.";
            speak(response);
            updateUIForSpeaking();
            addLogEntry(`ANI: ${response}`, "system");
            return;
        }
    }

    setTimeout(() => {
        const response = `Opening ${siteName}.`;
        speak(response);
        updateUIForSpeaking();
        addLogEntry(`ANI: ${response}`, "system");

        // Open in new tab
        setTimeout(() => {
            window.open(url, '_blank');
        }, 1000);
    }, 1000);
}

// Search Commands 
function handleSearch(command) {
    // Extract search query
    let query = "";

    if (command.includes("search for")) {
        query = command.split("search for")[1].trim();
    } else if (command.includes("google")) {
        query = command.split("google")[1].trim();
    } else {
        query = command.replace("search", "").trim();
    }

    if (query) {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

        setTimeout(() => {
            const response = `Searching for ${query}.`;
            speak(response);
            updateUIForSpeaking();
            addLogEntry(`ANI: ${response}`, "system");

            setTimeout(() => {
                window.open(searchUrl, '_blank');
            }, 1000);
        }, 1000);
    } else {
        const response = "What would you like me to search for?";
        speak(response);
        updateUIForSpeaking();
        addLogEntry(`ANI: ${response}`, "system");
    }
}

// System Commands
function tellTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const hour = now.getHours();
    const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

    setTimeout(() => {
        const response = `The time is ${timeString}. Good ${timeOfDay}.`;
        speak(response);
        updateUIForSpeaking();
        addLogEntry(`ANI: ${response}`, "system");
    }, 1000);
}

function tellWeather() {
    if (currentWeather) {
        const { name, main, weather } = currentWeather;
        const temp = Math.round(main.temp);
        const condition = weather[0].description;

        setTimeout(() => {
            const response = `The current weather in ${name} is ${temp} degrees Celsius with ${condition}.`;
            speak(response);
            updateUIForSpeaking();
            addLogEntry(`ANI: ${response}`, "system");
        }, 1000);
    } else {
        setTimeout(() => {
            const response = "I'm currently fetching weather information. Please try again in a moment.";
            speak(response);
            updateUIForSpeaking();
            addLogEntry(`ANI: ${response}`, "system");
            getWeather();
        }, 1000);
    }
}

function reloadPage() {
    setTimeout(() => {
        const response = "Reloading the page.";
        speak(response);
        updateUIForSpeaking();
        addLogEntry(`ANI: ${response}`, "system");

        setTimeout(() => {
            location.reload();
        }, 1000);
    }, 1000);
}

function goBack() {
    if (window.history.length > 1) {
        setTimeout(() => {
            const response = "Going back.";
            speak(response);
            updateUIForSpeaking();
            addLogEntry(`ANI: ${response}`, "system");

            setTimeout(() => {
                window.history.back();
            }, 1000);
        }, 1000);
    } else {
        const response = "There's no page to go back to.";
        speak(response);
        updateUIForSpeaking();
        addLogEntry(`ANI: ${response}`, "system");
    }
}

function goForward() {
    setTimeout(() => {
        const response = "Going forward.";
        speak(response);
        updateUIForSpeaking();
        addLogEntry(`ANI: ${response}`, "system");

        setTimeout(() => {
            window.history.forward();
        }, 1000);
    }, 1000);
}

function tellBattery() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            const level = Math.round(battery.level * 100);
            const status = battery.charging ? "charging" : "discharging";

            setTimeout(() => {
                const response = `Your battery is at ${level} percent and currently ${status}.`;
                speak(response);
                updateUIForSpeaking();
                addLogEntry(`ANI: ${response}`, "system");
            }, 1000);
        });
    } else {
        const response = "I can't access battery information in this browser.";
        speak(response);
        updateUIForSpeaking();
        addLogEntry(`ANI: ${response}`, "system");
    }
}

function tellNetworkStatus() {
    const isOnline = navigator.onLine;
    const status = isOnline ? "online" : "offline";

    setTimeout(() => {
        const response = `You are currently ${status}.`;
        speak(response);
        updateUIForSpeaking();
        addLogEntry(`ANI: ${response}`, "system");
    }, 1000);
}

function tellCapabilities() {
    setTimeout(() => {
        const response = "To view the commands, open the User Guide, which is on the left side of the upper time display.";
        speak(response);
        updateUIForSpeaking();
        addLogEntry(`ANI: ${response}`, "system");
    }, 1000);
}

function clearCommandLog() {
    commandLog.innerHTML = '';
    addLogEntry("Command log cleared.", "system");
    speak("Command log cleared.");
    updateUIForSpeaking();
}

// Response Functions
function respondToGreeting() {
    const greetings = [
        "Hey Boss! I'm ANI, your AI assistant. What can I do for you?"
    ];

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

    setTimeout(() => {
        speak(randomGreeting);
        updateUIForSpeaking();
        addLogEntry(`ANI: ${randomGreeting}`, "system");
    }, 1000);
}

// Speech Synthesis
function speak(text) {
    if (!synthesis) {
        addLogEntry(`ANI: ${text}`, "system");
        updateUIForSpeaking();
        return;
    }

    // Cancel any ongoing speech
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Select a voice
    const voices = synthesis.getVoices();
    const preferredVoice = voices.find(voice =>
        voice.name.includes("Google") || voice.name.includes("Microsoft")
    );

    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
        updateUIForSpeaking();
    };

    utterance.onend = () => {
        setTimeout(() => {
            if (!isListening) {
                updateUIForIdle();
            }
        }, 500);
    };

    synthesis.speak(utterance);
}

// UI Update Functions
function updateUIForListening() {
    if (aiCore) {
        aiCore.style.boxShadow = `
            0 0 80px var(--primary-color),
            0 0 150px rgba(0, 217, 255, 0.7),
            inset 0 0 40px rgba(255, 255, 255, 0.9)
        `;
    }

    if (coreStatus) {
        coreStatus.textContent = "Listening";
        coreStatus.style.color = "var(--accent-color)";
        coreStatus.style.textShadow = "0 0 10px var(--accent-color)";
    }

    // Add pulse animation
    if (corePulse) {
        corePulse.style.animation = "pulse 0.8s ease-out infinite";
        corePulse.style.opacity = "0.7";
    }

    // Update indicators
    if (listeningIndicator) {
        listeningIndicator.classList.add("active");
    }
    
    if (processingIndicator) {
        processingIndicator.classList.remove("active");
    }
}

function updateUIForProcessing() {
    if (aiCore) {
        aiCore.style.boxShadow = `
            0 0 80px var(--secondary-color),
            0 0 150px rgba(157, 0, 255, 0.7),
            inset 0 0 40px rgba(255, 255, 255, 0.9)
        `;
    }

    if (coreStatus) {
        coreStatus.textContent = "Processing";
        coreStatus.style.color = "var(--secondary-color)";
        coreStatus.style.textShadow = "0 0 10px var(--secondary-color)";
    }

    // Faster pulse for processing
    if (corePulse) {
        corePulse.style.animation = "pulse 0.4s ease-out infinite";
    }

    // Update indicators
    if (listeningIndicator) {
        listeningIndicator.classList.remove("active");
    }
    
    if (processingIndicator) {
        processingIndicator.classList.add("active");
    }

    // Stop visualizer
    stopVoiceVisualizer();
}

function updateUIForSpeaking() {
    if (aiCore) {
        aiCore.style.boxShadow = `
            0 0 80px var(--success-color),
            0 0 150px rgba(0, 255, 136, 0.7),
            inset 0 0 40px rgba(255, 255, 255, 0.9)
        `;
    }

    if (coreStatus) {
        coreStatus.textContent = "Speaking";
        coreStatus.style.color = "var(--success-color)";
        coreStatus.style.textShadow = "0 0 10px var(--success-color)";
    }

    // Rhythmic pulse for speaking
    if (corePulse) {
        corePulse.style.animation = "pulse 0.6s ease-out infinite";
    }

    // Update indicators
    if (listeningIndicator) {
        listeningIndicator.classList.remove("active");
    }
    
    if (processingIndicator) {
        processingIndicator.classList.remove("active");
    }
}

function updateUIForIdle() {
    if (aiCore) {
        aiCore.style.boxShadow = `
            0 0 60px var(--primary-color),
            0 0 100px rgba(0, 217, 255, 0.5),
            inset 0 0 30px rgba(255, 255, 255, 0.8)
        `;
    }

    if (coreStatus) {
        coreStatus.textContent = "Idle";
        coreStatus.style.color = "var(--primary-color)";
        coreStatus.style.textShadow = "0 0 10px var(--primary-color)";
    }

    // Stop pulse animation
    if (corePulse) {
        corePulse.style.animation = "none";
        corePulse.style.opacity = "0";
    }

    // Update indicators
    if (listeningIndicator) {
        listeningIndicator.classList.remove("active");
    }
    
    if (processingIndicator) {
        processingIndicator.classList.remove("active");
    }
}

// Voice Visualizer
function startVoiceVisualizer() {
    stopVoiceVisualizer();

    if (!voiceVisualizer) return;

    const bars = voiceVisualizer.querySelectorAll('.bar');
    visualizerInterval = setInterval(() => {
        bars.forEach(bar => {
            // Random height for simulation
            const height = 20 + Math.random() * 80;
            bar.style.height = `${height}%`;

            // Random color variation
            const hue = 180 + Math.random() * 60;
            bar.style.background = `linear-gradient(to top, hsl(${hue}, 100%, 50%), var(--secondary-color))`;
        });
    }, 100);
}

function stopVoiceVisualizer() {
    if (visualizerInterval) {
        clearInterval(visualizerInterval);
        visualizerInterval = null;
    }

    // Reset bars
    if (voiceVisualizer) {
        const bars = voiceVisualizer.querySelectorAll('.bar');
        bars.forEach(bar => {
            bar.style.height = "20%";
            bar.style.background = "linear-gradient(to top, var(--primary-color), var(--secondary-color))";
        });
    }
}

// System Functions
function updateClock() {
    const now = new Date();

    // Update time
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (timeDisplay) timeDisplay.textContent = timeString;

    // Update date
    const dateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (dateDisplay) dateDisplay.textContent = dateString;
}

function getBatteryStatus() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            const level = Math.round(battery.level * 100);
            const isCharging = battery.charging;

            if (batteryDisplay) {
                batteryDisplay.textContent = `${level}%`;
                batteryDisplay.style.color = level > 20 ? "var(--success-color)" : "var(--warning-color)";
            }

            // Update battery icon
            if (batteryDisplay && batteryDisplay.previousElementSibling) {
                const batteryIcon = batteryDisplay.previousElementSibling;
                if (isCharging) {
                    batteryIcon.className = "fas fa-battery-charging";
                } else {
                    if (level > 80) {
                        batteryIcon.className = "fas fa-battery-full";
                    } else if (level > 60) {
                        batteryIcon.className = "fas fa-battery-three-quarters";
                    } else if (level > 40) {
                        batteryIcon.className = "fas fa-battery-half";
                    } else if (level > 20) {
                        batteryIcon.className = "fas fa-battery-quarter";
                    } else {
                        batteryIcon.className = "fas fa-battery-empty";
                    }
                }
            }
        });
    } else if (batteryDisplay) {
        batteryDisplay.textContent = "N/A";
    }
}

function updateNetworkStatus() {
    const isOnline = navigator.onLine;
    const status = isOnline ? "Online" : "Offline";
    const color = isOnline ? "var(--success-color)" : "var(--error-color)";

    if (networkDisplay) {
        networkDisplay.textContent = status;
        networkDisplay.style.color = color;
    }
    
    if (networkStatus) {
        networkStatus.textContent = status;
        networkStatus.style.color = color;
    }

    if (networkDisplay && networkDisplay.previousElementSibling) {
        const networkIcon = networkDisplay.previousElementSibling;
        networkIcon.style.color = color;
    }
}

async function getWeather() {
    try {
        // Get user's location
        if (!navigator.geolocation) {
            throw new Error("Geolocation not supported");
        }

        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 10000,
                maximumAge: 60000
            });
        });

        const { latitude, longitude } = position.coords;

        // Fetch weather data
        const response = await fetch(
            `${WEATHER_API_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();
        currentWeather = data;

        // Update UI
        updateWeatherUI(data);

    } catch (error) {
        console.error("Failed to get weather:", error);

        // Fallback to a default location (London)
        try {
            const response = await fetch(
                `${WEATHER_API_URL}?q=London&units=metric&appid=${WEATHER_API_KEY}`
            );

            if (response.ok) {
                const data = await response.json();
                currentWeather = data;
                updateWeatherUI(data);
            } else {
                throw new Error("Failed to fetch fallback weather");
            }
        } catch (fallbackError) {
            console.error("Fallback weather failed:", fallbackError);
            if (weatherContent) {
                weatherContent.innerHTML = `
                    <div class="weather-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="weather-details">
                        <div class="temperature">--°C</div>
                        <div class="condition">Weather unavailable</div>
                        <div class="location">Check connection</div>
                    </div>
                `;
            }
        }
    }
}

function updateWeatherUI(data) {
    if (!weatherContent) return;

    const { name, main, weather } = data;
    const temp = Math.round(main.temp);
    const condition = weather[0].description;
    const iconCode = weather[0].icon;

    // Map OpenWeatherMap icons to FontAwesome
    const iconMap = {
        '01d': 'fas fa-sun',
        '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun',
        '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud',
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud',
        '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-rain',
        '09n': 'fas fa-cloud-rain',
        '10d': 'fas fa-cloud-sun-rain',
        '10n': 'fas fa-cloud-moon-rain',
        '11d': 'fas fa-bolt',
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',
        '50n': 'fas fa-smog'
    };

    const iconClass = iconMap[iconCode] || 'fas fa-cloud';

    weatherContent.innerHTML = `
        <div class="weather-icon">
            <i class="${iconClass}"></i>
        </div>
        <div class="weather-details">
            <div class="temperature">${temp}°C</div>
            <div class="condition">${condition}</div>
            <div class="location">
                <i class="fas fa-map-marker-alt"></i> ${name}
            </div>
        </div>
    `;
}

// Utility Functions
function addLogEntry(text, type = "system") {
    if (!commandLog) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.innerHTML = `
        <span class="log-time">[${timeString}]</span>
        <span class="log-text">${text}</span>
    `;

    commandLog.appendChild(logEntry);

    // Scroll to bottom
    commandLog.scrollTop = commandLog.scrollHeight;
}

// Particle Background
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particleCount = 50;

    // Clear existing particles first
    particlesContainer.innerHTML = '';

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random size
        const size = Math.random() * 4 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;

        // Random color (blue/purple hues)
        const hue = 200 + Math.random() * 100;
        particle.style.backgroundColor = `hsl(${hue}, 100%, 70%)`;
        particle.style.boxShadow = `0 0 ${size * 2}px hsl(${hue}, 100%, 70%)`;

        // Random animation
        const duration = 20 + Math.random() * 30;
        const delay = Math.random() * 5;
        particle.style.animation = `float ${duration}s linear ${delay}s infinite`;

        particlesContainer.appendChild(particle);
    }

    // Add CSS for particles if not already added
    if (!document.getElementById('particle-styles')) {
        const style = document.createElement('style');
        style.id = 'particle-styles';
        style.textContent = `
            .particle {
                position: absolute;
                border-radius: 50%;
                opacity: 0.3;
                pointer-events: none;
            }
            
            @keyframes float {
                0% {
                    transform: translate(0, 0) rotate(0deg);
                    opacity: 0.3;
                }
                25% {
                    transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(90deg);
                    opacity: 0.6;
                }
                50% {
                    transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(180deg);
                    opacity: 0.3;
                }
                75% {
                    transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(270deg);
                    opacity: 0.6;
                }
                100% {
                    transform: translate(0, 0) rotate(360deg);
                    opacity: 0.3;
                }
            }
        `;

        document.head.appendChild(style);
    }
}

// Initialize network status
updateNetworkStatus();

// Initialize mode
switchMode('voice');

// Prevent form submission
document.addEventListener('submit', (e) => {
    e.preventDefault();
});

// Add error handling for missing elements
window.addEventListener('error', (e) => {
    console.warn('Script error:', e.message);
});

// Export functions for debugging (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        speak,
        processCommand,
        calculateMath,
        safeEval,
        getWeather,
        updateClock,
        getBatteryStatus
    };
}