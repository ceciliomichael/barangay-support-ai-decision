import dotenv from 'dotenv';
import fetch from 'node-fetch';
import Concern from '../models/concern.js';

// Load environment variables
dotenv.config();

// Get environment variables
const API_URL = process.env.VITE_MISTRAL_API_URL;
const API_KEY = process.env.VITE_MISTRAL_API_KEY;
const MODEL = process.env.VITE_MISTRAL_MODEL;
const MAX_TOKENS = parseInt(process.env.VITE_MAX_TOKENS || '4000');
const TEMPERATURE = parseFloat(process.env.VITE_TEMPERATURE || '0.4');

// Rate limiting
const RATE_LIMIT_DELAY = 1500; // 1.5 seconds between requests
let processingQueue = [];
let isProcessingQueue = false;

// Define the waste verification tool
const WASTE_VERIFICATION_TOOL = {
  "type": "function",
  "function": {
    "name": "verify_waste_concern",
    "description": "Verify if a waste management concern is legitimate and requires attention from municipal services, considering public health and sanitation.",
    "parameters": {
      "type": "object",
      "properties": {
        "is_legitimate": {
          "type": "boolean",
          "description": "Whether the concern is a legitimate waste management or public sanitation issue"
        },
        "status": {
          "type": "string",
          "enum": ["approved", "rejected"],
          "description": "The verification status"
        },
        "reason": {
          "type": "string",
          "description": "A brief one-sentence explanation for the decision"
        },
        "confidence": {
          "type": "number",
          "description": "Confidence score between 0 and 1"
        },
        "category": {
          "type": "string",
          "enum": [
            "waste_collection",
            "recycling",
            "containers",
            "illegal_dumping",
            "public_cleanliness",
            "dead_animal",
            "hazardous_waste",
            "drainage",
            "odor_pests",
            "scheduling",
            "service_access",
            "commercial_promotion",
            "personal_dispute",
            "out_of_scope",
            "nonsensical",
            "inappropriate",
            "unrelated",
            "vague",
            "impossible",
            "other"
          ],
          "description": "Category of the waste concern or reason for rejection"
        }
      },
      "required": ["is_legitimate", "status", "reason", "confidence", "category"]
    }
  }
};

// System prompt for the AI assistant focused on waste management
// Read from environment variable or use default if not available
const SYSTEM_PROMPT = process.env.VITE_AI_SYSTEM_PROMPT || 
`You are an advanced AI assistant specializing in waste management concern verification, with expertise in municipal waste policies, environmental regulations, and community health standards. Your task is to analyze resident-submitted concerns and determine their legitimacy with high accuracy, considering public health and safety implications.

ASSESSMENT FRAMEWORK:
1. LEGITIMATE CONCERNS (APPROVE):
   - Waste collection issues (missed pickups, irregular service, overflowing bins)
   - Recycling problems (contamination, improper sorting, collection issues)
   - Waste containers (damaged, insufficient, inaccessible)
   - Illegal dumping (unauthorized disposal in public/private areas)
   - Public space cleanliness (streets, parks, waterways with waste; includes litter, debris, and minor hazards)
   - Dead animals in public spaces (requires removal for sanitation)
   - Hazardous waste (improper disposal of chemicals, medical waste, batteries)
   - Drainage issues (waste-blocked drainage systems causing problems)
   - Odor/pest issues (clearly related to waste management or sanitation)
   - Collection schedule confusion or complaints
   - Service access problems in underserved areas

2. ILLEGITIMATE CONCERNS (REJECT):
   - Commercial promotions or advertisements
   - Personal disputes unrelated to waste (neighbor conflicts, non-waste related)
   - Consultation requests outside waste management scope
   - Nonsensical, clearly fabricated, or hallucinated problems
   - Hate speech, harassment, or threatening content
   - Completely unrelated topics (traffic, utilities not connected to waste, noise complaints)
   - Vague complaints without specific waste management or public sanitation connection
   - Physically impossible scenarios
   - Content primarily selling products/services

YOUR TASK:
You will analyze waste management concerns using the verify_waste_concern function. For each concern:
1. Determine if it's legitimate based on the assessment framework, considering public health and sanitation implications.
2. Assign the appropriate status ('approved' or 'rejected').
3. Provide a brief, clear explanation for your decision.
4. Assign a confidence score (0.0-1.0) representing how certain you are.
5. Categorize the concern using the most specific category from the options.

Your analysis must be objective, focusing on waste management relevance and actionability.
For ambiguous cases, lean towards approving if there is a plausible public health, safety, or sanitation concern that municipal services might address. Consider:
- Whether municipal waste/sanitation services could realistically address the issue.
- If the concern affects public spaces or infrastructure.
- The potential impact on community health/safety.
- If there is sufficient specific detail to act upon.

The tool output will directly impact municipal resource allocation, so accuracy is critical.`;

// Process a single API request with rate limiting
const processApiRequest = async (messages, tools) => {
    // Prepare request body
    const requestBody = {
      model: MODEL,
      messages: messages,
      max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    tools: tools,
    tool_choice: "auto" // Let the model decide whether to use the tool
    };

    // Send request to Mistral API
    const response = await fetch(`${API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorData}`);
    }

  return await response.json();
};

// Process the queue with rate limiting
const processQueue = async () => {
  if (isProcessingQueue || processingQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  try {
    while (processingQueue.length > 0) {
      const { concern, resolve, reject } = processingQueue.shift();
      
      try {
        console.log(`Processing concern ID: ${concern._id}`);
        
        // Create messages array for the AI
        const messages = [
          { role: 'system', content: SYSTEM_PROMPT },
          { 
            role: 'user', 
            content: `I need you to verify if this waste management concern is legitimate or nonsense.
            
Concern: "${concern.text}"

Analyze this concern and use the verify_waste_concern function to provide a structured determination.`
          }
        ];

        // Send API request with tool definition
        const data = await processApiRequest(messages, [WASTE_VERIFICATION_TOOL]);
        
        let verificationResult;
        
        // Check if there's a function call in the response
        if (data.choices && 
            data.choices.length > 0 && 
            data.choices[0].message && 
            data.choices[0].message.tool_calls && 
            data.choices[0].message.tool_calls.length > 0) {
          
          // Get the function call result
          const toolCall = data.choices[0].message.tool_calls[0];
          
          if (toolCall.function && 
              toolCall.function.name === 'verify_waste_concern' && 
              toolCall.function.arguments) {
            
            // Parse the JSON arguments
            const args = JSON.parse(toolCall.function.arguments);
            
            verificationResult = {
              status: args.status,
              aiSuggestion: args.is_legitimate ? 'legitimate' : 'nonsense',
              aiReason: args.reason,
              confidence: args.confidence,
              category: args.category,
              processedAt: new Date()
            };
            console.log(`Tool call successful for concern ${concern._id}:`, verificationResult);
          } else {
            console.warn(`Unexpected tool call format for concern ${concern._id}:`, toolCall);
          }
        }
        
        // Fallback to traditional text analysis if tool calling fails
        if (!verificationResult) {
          console.log(`Tool calling failed or not supported for concern ${concern._id}, falling back to text analysis`);
          
          // Ensure content exists before accessing
          const aiResponse = data.choices?.[0]?.message?.content || 'Fallback: Unable to determine legitimacy';
          const isLegitimate = aiResponse.toLowerCase().includes('legitimate');
          
          verificationResult = {
            status: isLegitimate ? 'approved' : 'rejected',
            aiSuggestion: isLegitimate ? 'legitimate' : 'nonsense',
            aiReason: aiResponse,
            confidence: isLegitimate ? 0.6 : 0.7, // Assign default confidence for fallback
            category: isLegitimate ? 'other' : 'vague', // Assign default category for fallback
            processedAt: new Date()
          };
        }
        
        // Update concern with verification result
        const updatedConcern = await Concern.findByIdAndUpdate(
          concern._id,
          { verification: verificationResult },
        { new: true }
      );
      
        resolve(updatedConcern);
      } catch (error) {
        console.error(`Error processing concern ${concern._id}:`, error);
        // Update the concern as rejected on error to avoid infinite loops
        try {
          await Concern.findByIdAndUpdate(concern._id, {
            verification: {
              status: 'rejected',
              aiSuggestion: 'error',
              aiReason: `Error during processing: ${error.message}`,
              processedAt: new Date()
            }
          });
        } catch (updateError) {
          console.error(`Failed to update concern ${concern._id} after error:`, updateError);
        }
        reject(error);
      }
      
      // Apply rate limiting
      if (processingQueue.length > 0) {
        console.log(`Waiting ${RATE_LIMIT_DELAY}ms before next request (${processingQueue.length} remaining in queue)`);
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
      }
    }
  } finally {
    isProcessingQueue = false;
  }
};

// Process a concern with AI (queued implementation)
export const processWithAI = async (concern) => {
  return new Promise((resolve, reject) => {
    // Add to queue
    processingQueue.push({ concern, resolve, reject });
    console.log(`Added concern ID: ${concern._id} to queue. Queue length: ${processingQueue.length}`);
    
    // Start processing if not already running
    if (!isProcessingQueue) {
      processQueue().catch(error => {
        console.error('Error in queue processing:', error);
      });
    }
  });
};

// Process all pending concerns
export const processAllPendingConcerns = async () => {
  try {
    // Find all concerns with pending status
    const pendingConcerns = await Concern.find({
      $or: [
        { 'verification.status': 'pending' },
        { verification: { $exists: false } }
      ]
    });
    
    console.log(`Found ${pendingConcerns.length} pending concerns to process`);
    
    // Add all concerns to processing queue
    const processingPromises = pendingConcerns.map(concern => 
      processWithAI(concern)
        .then(processed => ({ success: true, concern: processed }))
        .catch(error => ({ success: false, concern, error: error.message }))
    );
    
    // Wait for all concerns to be processed
    return await Promise.all(processingPromises);
  } catch (error) {
    console.error('Error processing pending concerns:', error);
    throw error;
  }
}; 