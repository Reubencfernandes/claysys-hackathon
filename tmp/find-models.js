const apiKey = "AIzaSyCUsGFeQq5FdIwJcxcymzATLsv4ebHgEAQ";

async function findModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    const suitable = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    console.log("Suitable models for generateContent:");
    suitable.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
  } catch (error) {
    console.error("Error:", error);
  }
}

findModels();
