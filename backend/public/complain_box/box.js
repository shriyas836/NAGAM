
document.addEventListener("DOMContentLoaded", function () {
  const chatbotButton = document.getElementById("chatbot");
  const chatContainer = document.querySelector(".chat-container");

  chatbotButton.addEventListener("click", function (event) {
      event.stopPropagation(); // Prevent click from propagating to document
      if (chatContainer.style.display === "none" || chatContainer.style.display === "") {
          chatContainer.style.display = "flex"; // Show chatbot
      } else {
          chatContainer.style.display = "none"; // Hide chatbot
      }
  });

  // Click anywhere outside to close chatbot
  document.addEventListener("click", function (event) {
      if (!chatContainer.contains(event.target) && event.target !== chatbotButton) {
          chatContainer.style.display = "none"; // Hide chatbot
      }
  });
});


window.addEventListener("DOMContentLoaded", function () {
  const sendButton = document.getElementById('send-button');
  const userInput = document.getElementById('user-input');

  if (sendButton && userInput) {
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  } else {
    console.error("send-button or user-input not found.");
  }
});


// Bot responses
const botResponses = {
  "greetings": "Hello! How can I assist you today?.Please **log in** first. If you're new, please **sign up** and create an account. If you've **forgotten your password**, reset it using the **OTP sent to your email**.",
  "contact_info": "📞 **Nagar Nigam Contact Details:**\n\n" + 
                  "👤 **Chairman**\n📞 01432-246388\n\n" + 
                  "👤 **Commissioner**\n📞 01432-247246\n\n" + 
                  "☎️ **Toll-Free Number:** 1064\n\n" + 
                  "📲 **WhatsApp Number:** 9413502834\n\n" + 
                  "For further assistance, please visit the official Nagar Nigam",
  "issue_prompt": "Tell me the locality and your address (e.g., street name, street number).",
  "landmark_prompt": "Please provide a nearby landmark for better identification.",
  "issue_confirmation": "We will look over your request. The request has been sent to the respective department.",
  "address_error": "Invalid entry detected. Please provide a valid address including a street name and number.",
  "street_light_problem": "Please provide your address and nearby locality (ward and zone) for the street light issue. We will use this information to file your complaint. Kindly enter these details in the complaint form.",

"sewage_options": "You selected 'Sewage'. Now, please provide your address and nearby locality (ward and zone) so we can register your complaint accordingly. Kindly fill in these details in the complaint form.",  

"garbage_options": "You selected 'Garbage'. Now, please provide your address and nearby locality (ward and zone) for better complaint resolution. Make sure to enter these details in the complaint form.",  

"stray_animals_options": "Could you please specify the type of animal?\n1. Dog\n2. Cat\n3. Other. Also, provide your address and nearby locality (ward and zone) to help us address the issue effectively. Kindly enter these details in the complaint form.",

"stray_animals_other_prompt": "You selected 'Other'. Please provide a detailed description of the issue you are facing with the stray animal (you can type as much as needed). Additionally, share your address and nearby locality (ward and zone) so we can take appropriate action. Kindly fill these details in the complaint form.",  

 "time_response": "The admin will let you know soon when your issue will be resolved through email. Regards, Nagar Nigam.",

  "appreciation_response": "You're welcome! would you like to **provide feedback**,click on feedback button to give feedback",
  "farewell_response": "Goodbye! Have a great day!\n\nBefore you leave, would you like to **provide feedback** on your experience?  \n\n🔹 To give feedback, please **log in** first ,if done logout.  \n\nWe value your feedback and appreciate your time!,...Also do logout if you want.",
  "farewell_feedback": "Goodbye! Have a great day! \n\nBefore you leave, would you like to **provide feedback** on your experience?  \n\n🔹 To give feedback, please **log in** first. \n\nWe value your feedback and appreciate your time!",
  "default": "I'm sorry, I didn't understand that. Can you please provide more details? or Can you please rephrase your query?"
};

// State variables to track input stages
let awaitingIssueType = false;
let awaitingAddress = false;
let awaitingSewageOption = false;
let awaitingGarbageOption = false;
let awaitingStrayAnimalOption = false;
let awaitingAnimalProblem = false;
let awaitingLocation = false;
let collectedAddress = {};
let currentIssue = "";

// Main function to process messages
function sendMessage() {
  const userInputField = document.getElementById('user-input');
  const userInput = userInputField.value.trim();

  if (userInput) {
    addUserMessage(userInput);
    setTimeout(() => {
      addBotMessage(getBotResponse(userInput));
    }, 500);
    userInputField.value = '';
  } else {
    alert('Please type a message before sending.');
  }
}

function addUserMessage(message) {
  const chatBox = document.getElementById('chat-box');
  const messageElement = document.createElement('div');
  messageElement.className = 'chat-message user-message';
  messageElement.innerText = message;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 
function addBotMessage(message) {
  const chatBox = document.getElementById('chat-box');
  const messageElement = document.createElement('div');
  messageElement.className = 'chat-message bot-message';
  
  // Use innerHTML instead of innerText to allow clickable links
  messageElement.innerHTML = message; 
  
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to check if user is logged in
function isUserLoggedIn() {
  return localStorage.getItem("token") !== null; // Check if JWT token exists
}
// Function to check if user is logged in (JWT stored in localStorage)
function isUserLoggedIn() {
  return localStorage.getItem("token") !== null;
}
// Function to check if user is asking for Nagar Nigam contact details
function isContactQuery(userInput) {
  const contactKeywords = [
    "contact", "phone number", "call", "helpline", "toll free", "commissioner", "chairman",
    "whatsapp", "how to contact", "complaint number", "admin number", "support number"
  ];

  return contactKeywords.some(keyword => userInput.toLowerCase().includes(keyword));
}

// Function to handle chatbot greetings based on login status
function getGreetingMessage() {
  if (!isUserLoggedIn()) {
    return botResponses["greetings"];
  } else {
    return "Hello! How can I assist you today?";
  }
}

// Function to get chatbot response
function getBotResponse(userInput) {
  const lowerCaseInput = userInput.toLowerCase();

  // Define complaint link dynamically based on login status
  let complaintLink = isUserLoggedIn()
    ? '<a href="/complain_form/comp.html" target="_blank" style="color: blue; text-decoration: underline;">Click here to submit your complaint</a>'
    : '<a href="/login/login_final.html" target="_blank" style="color: red; text-decoration: underline;">Please log in to submit your complaint</a>';

  // Handle appreciation inputs
  if (["okay", "ok", "okh", "thanks", "thank you","thanku", "thankyou","thanx"].some(word => lowerCaseInput.includes(word))) {
    return botResponses["appreciation_response"];
  }

  // // Handle farewell inputs
  // if (["bye", "byeee","bie","byee", "byeeeyyee"].some(word => lowerCaseInput.includes(word))) {
  //   return botResponses["farewell_response"];
  // }
  // Handle farewell inputs
const farewellKeywords = [
  "bye", "byeee", "bie", "byee", "byeeeyyee", "goodbye", "see you", 
  "see ya", "take care", "later", "catch you later", "farewell", 
  "adios", "ciao", "sayonara", "so long", "peace out"
];

if (farewellKeywords.some(word => lowerCaseInput.includes(word))) {
  return botResponses["farewell_response"];
}


  // Detect time-related queries
const timeKeywords = [
  "how much time", "when will it be solved", "how long", "what time", "time", 
  "till when", "time you will take", "time it will take", "time taken", "time required", 
  "duration", "expected time", "estimated time", "ETA", "waiting time", 
  "deadline", "completion time", "resolve time", "fix time"
];

if (timeKeywords.some(phrase => lowerCaseInput.includes(phrase))) {
  return botResponses["time_response"];
}

  // // Detect greetings
  // if (["hello", "hi","hii", "hey", "good morning", "good afternoon", "good evening"].some(greeting => lowerCaseInput.includes(greeting))) {
  //   return botResponses["greetings"];
  // }
  // Detect greetings (accepts any case format)
const greetings = ["hello", "hi", "hii", "hey", "good morning", "good afternoon", "good evening"];

// Check if user input matches any greeting exactly
if (greetings.some(greeting => userInput.includes(greeting))) {
    return botResponses["greetings"];
}
// Detect feedback-related queries
const feedbackKeywords = [
  "give feedback", "how to give feedback", "feedback", "rate experience", "provide feedback",
  "review", "leave a review", "opinion", "suggestion", "comment", "submit feedback"
];

if (feedbackKeywords.some(phrase => lowerCaseInput.includes(phrase))) {
  return botResponses["farewell_feedback"];
}




  // Detect issues and handle them
  if (lowerCaseInput.includes("street light")) {
    awaitingAddress = true;
    currentIssue = "street light";
    return botResponses["street_light_problem"] + "<br>" + complaintLink;
  }

  if (lowerCaseInput.includes("sewage")) {
    awaitingSewageOption = true;
    currentIssue = "sewage";
    return botResponses["sewage_options"] + "<br>" + complaintLink;
  }

  if (lowerCaseInput.includes("garbage")) {
    awaitingGarbageOption = true;
    currentIssue = "garbage";
    return botResponses["garbage_options"] + "<br>" + complaintLink;
  }

  if (lowerCaseInput.includes("stray animals")) {
    awaitingStrayAnimalOption = true;
    currentIssue = "stray animals";
    return botResponses["stray_animals_options"] + "<br>" + complaintLink;
  }

  // Handle sewage and garbage options
  if (awaitingSewageOption || awaitingGarbageOption) {
    const category = awaitingSewageOption ? 'Sewage' : 'Garbage';
    const optionsMap = {
      '1': category,
      '2': category,
      'drainage': 'Sewage',
      'waste water blockage': 'Sewage',
      'wet garbage': 'Garbage',
      'dry garbage': 'Garbage'
    };
  
    const selectedCategory = optionsMap[userInput.toLowerCase()];
  
    if (selectedCategory) {
      awaitingSewageOption = false;
      awaitingGarbageOption = false;
      awaitingAddress = true;
      return `You selected '${selectedCategory}'. Now, please provide your address and nearby locality.`;
    }
  
    if (awaitingAddress) {
      awaitingAddress = false;
      return `Complaint submitted successfully for ${category} at '${userInput}'. Thank you!`;
    }
  
    return `Invalid option. Please select 1 or 2 for '${category}'...`;
  }
  


  // Handle stray animal options
  if (awaitingStrayAnimalOption) {
    if (userInput === '1' || lowerCaseInput === 'dog') {
      awaitingStrayAnimalOption = false;
      awaitingAddress = true;
      return "You selected 'Dog'. Now, please provide your address and nearby locality.";
    }
    if (userInput === '2' || lowerCaseInput === 'cat') {
      awaitingStrayAnimalOption = false;
      awaitingAddress = true;
      return "You selected 'Cat'. Now, please provide your address and nearby locality.";
    }
    if (userInput === '3' || lowerCaseInput === 'other') {
      awaitingStrayAnimalOption = false;
      awaitingAnimalProblem = true;
      return botResponses["stray_animals_other_prompt"];
    }
    return "Invalid option. Please select 1 for 'Dog', 2 for 'Cat', or 3 for 'Other'.";
  }

 // Function to validate address input
function isValidAddress(input) {
  // Allow letters (capital & small), numbers, spaces, and common address symbols
  const addressPattern = /^[\w\s.,#\-()/]+$/; 

  // Ensure input length is reasonable (at least 5 characters)
  return addressPattern.test(input) && input.trim().length > 5;
}

// Handle address input
if (awaitingAddress) {
  if (!isValidAddress(userInput)) {
    return botResponses["address_error"]; // Invalid address format
  }
  
  awaitingAddress = false; // Reset the flag after receiving a valid address
  return botResponses["issue_confirmation"]; // Confirm issue after getting address
}

// Default response
return botResponses["default"];
}







