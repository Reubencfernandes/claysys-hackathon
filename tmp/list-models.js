const apiKey = "AIzaSyCUsGFeQq5FdIwJcxcymzATLsv4ebHgEAQ"; // From .env.local

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
