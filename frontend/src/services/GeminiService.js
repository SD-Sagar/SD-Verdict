import { GoogleGenerativeAI } from "@google/generative-ai";

// Retrieve the Gemini API key from environment variables or custom input
export const getApiKey = () => {
  const localKey = localStorage.getItem("SD_VERDICT_GEMINI_API_KEY");
  if (localKey && localKey.trim() !== "") {
    return localKey;
  }
  return import.meta.env.VITE_GEMINI_API_KEY || "";
};

export const hasApiKey = () => {
  const key = getApiKey();
  return typeof key === "string" && key.trim() !== "";
};

// Generates fallback mock classification data for preview/testing
const getMockClassification = (items) => {
  const itemNames = items.map(i => i.toLowerCase());
  const combinedNames = itemNames.join(" ");

  // People / Sensitive
  const hasPerson = itemNames.some(i => 
    i.includes("elon") || i.includes("musk") || i.includes("sagar") || i.includes("dey") || 
    i.includes("modi") || i.includes("trump") || i.includes("obama") || i.includes("person") ||
    i.includes("human") || i.includes("user") || i.includes("ceo")
  );

  if (hasPerson) {
    return {
      mode: "NEUTRAL",
      reason: "Detected biological human entities or public figures. Defaulting to Neutral Mode for objective, non-scoring analysis.",
      categories: [
        { id: "cat1", name: "Societal Influence" },
        { id: "cat2", name: "Domain Expertise" },
        { id: "cat3", name: "Historical Impact" },
        { id: "cat4", name: "Core Methodology" }
      ]
    };
  }

  // Cross-Domain (Absurd/Abstract)
  const isCrossDomain = items.length >= 2 && (
    (combinedNames.includes("tree") && combinedNames.includes("laptop")) ||
    (combinedNames.includes("rock") && combinedNames.includes("sky")) ||
    (combinedNames.includes("coffee") && combinedNames.includes("book"))
  );

  if (isCrossDomain) {
    return {
      mode: "ANALYTICAL",
      reason: "Entities exist in completely disjoint ontological spaces. Comparing them requires abstract structural analysis rather than direct competition.",
      categories: [
        { id: "cat1", name: "Carbon Footprint" },
        { id: "cat2", name: "Utility & Purpose" },
        { id: "cat3", name: "Information Density" },
        { id: "cat4", name: "Existential Longevity" }
      ]
    };
  }

  // Tech / Phones
  if (combinedNames.includes("iphone") || combinedNames.includes("s25") || combinedNames.includes("pixel") || combinedNames.includes("phone")) {
    return {
      mode: "RANKING",
      reason: "Both entities are flagship mobile devices. Initiating hardware and ecosystem comparison matrix.",
      categories: [
        { id: "cat1", name: "Computational Power" },
        { id: "cat2", name: "Optical Sensors (Camera)" },
        { id: "cat3", name: "Display Architecture" },
        { id: "cat4", name: "Ecosystem Synergy" }
      ]
    };
  }
  
  // Tech / PC / GPUs
  if (combinedNames.includes("rtx") || combinedNames.includes("rx ") || combinedNames.includes("gpu") || combinedNames.includes("pc")) {
    return {
      mode: "RANKING",
      reason: "High-performance computing hardware detected. Evaluating silicon efficiency and raw throughput.",
      categories: [
        { id: "cat1", name: "Rasterization Throughput" },
        { id: "cat2", name: "Ray Tracing Cores" },
        { id: "cat3", name: "VRAM Bandwidth" },
        { id: "cat4", name: "Thermal Efficiency" }
      ]
    };
  }

  // Default Fallback
  return {
    mode: "RANKING",
    reason: "Evaluating diverse entities based on physical attributes, environmental impact, and conceptual scope.",
    categories: [
      { id: "cat1", name: "Physical Scale & Density" },
      { id: "cat2", name: "Environmental Dynamics" },
      { id: "cat3", name: "Utility to Ecosystem" },
      { id: "cat4", name: "Aesthetic Composition" }
    ]
  };
};

const getMockVerdict = (items, categories, mode) => {
  const confidence = Math.floor(Math.random() * 8) + 88; // 88-95%
  const lowerItems = items.map(i => i.toLowerCase());
  
  if (mode === "NEUTRAL") {
    const matrix = {};
    items.forEach((item, idx) => {
      matrix[item] = {};
      categories.forEach((cat) => {
        matrix[item][cat.name] = `${item} operates within a vastly different framework regarding ${cat.name}. Attempting to quantify this numerically would inherently corrupt the analysis by applying a biased scalar metric to a complex, multi-dimensional ontological state.`;
      });
    });

    return {
      confidence,
      reasoningSummary: `Analysis complete. We are comparing ${items.join(" and ")}, which is a categorically absurd or sensitive juxtaposition. A standard 'winner' metric is logically void here. The engine refuses to reduce these to a simplistic score.`,
      tradeOffs: [
        `${items[0]} functions under a set of rules completely alien to ${items[1] || "the alternatives"}.`,
        "Direct numerical ranking is intellectually dishonest for these specific entities.",
        "Each subject dominates its own respective sector of reality."
      ],
      winner: null,
      matrix
    };
  } 
  
  // RANKING or ANALYTICAL
  const scores = {};
  const totals = {};
  
  items.forEach((item, idx) => {
    scores[item] = {};
    totals[item] = 0;
    
    categories.forEach(cat => {
      const isFirstItem = idx === 0;
      let score = Math.floor(Math.random() * 20) + 75; // 75-95
      let reason = `Demonstrates highly capable metrics in ${cat.name.toLowerCase()}.`;

      const c = cat.name.toLowerCase();
      const i = item.toLowerCase();

      // Dynamic Mock Reasons based on keywords
      if (c.includes("computational") || c.includes("processing")) {
        score = isFirstItem ? 96 : 89;
        reason = isFirstItem 
          ? "Leverages a 3nm fabrication node resulting in a 15% IPC uplift and superior single-core sustained loads." 
          : "Shows remarkable multi-thread capability but throttles under extended synthetic benchmarks.";
      } else if (c.includes("optical") || c.includes("camera")) {
        score = isFirstItem ? 92 : 95;
        reason = isFirstItem
          ? "Exceptional computational photography and video stabilization via custom ISP."
          : "Dominates in raw sensor size and optical zoom capabilities, resolving higher detail at extreme focal lengths.";
      } else if (c.includes("display")) {
        score = isFirstItem ? 94 : 92;
        reason = isFirstItem ? "Class-leading peak brightness and color accuracy." : "Slightly superior PWM dimming rates for eye comfort.";
      } else if (c.includes("ecosystem")) {
        score = isFirstItem ? 98 : 85;
        reason = isFirstItem ? "Unmatched vertical integration across hardware and software." : "Highly open and customizable, though fragmented.";
      } else if (c.includes("rasterization") || c.includes("ray tracing")) {
        score = isFirstItem ? 97 : 82;
        reason = isFirstItem ? "Dedicated silicon accelerators provide a massive advantage in BVH traversal." : "Relies heavily on brute-force rasterization, struggling in heavy RT workloads.";
      }

      scores[item][cat.name] = { score, reason };
      totals[item] += score;
    });
  });

  let winner = null;
  if (mode === "RANKING" && items.length > 0) {
    let maxScore = -1;
    items.forEach(item => {
      if (totals[item] > maxScore) {
        maxScore = totals[item];
        winner = item;
      }
    });
  }

  return {
    confidence,
    reasoningSummary: `Both ${items.join(" and ")} represent pinnacle engineering in their class. While they share similar target demographics, their architectural approaches to solving the same problems are fundamentally opposed.`,
    tradeOffs: [
      `${items[0]} prioritizes deeply optimized, proprietary architectures to maximize efficiency.`,
      `${items[1] || "The alternative"} brute-forces performance through sheer hardware capability and open versatility.`,
      "The final decision hinges entirely on whether the user values seamless ecosystem integration or raw, unrestricted computational freedom."
    ],
    winner,
    scores
  };
};

// 1. Entity Classification
export const classifyAndGenerateCategories = async (items, apiKeyOverride) => {
  const apiKey = apiKeyOverride || getApiKey();

  if (!apiKey) {
    // Return mock data if no key is configured
    console.log("GeminiService: Using mock classification (No API Key)");
    return new Promise((resolve) => {
      setTimeout(() => resolve(getMockClassification(items)), 800);
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are an elite, highly intelligent classification engine for a decision intelligence application called SD Verdict.
Analyze the following comparison items: ${JSON.stringify(items)}.
First, determine the specific domain (e.g., "GPUs", "Frameworks", "Public Figures vs Objects", "Abstract Concepts").
Then, classify the comparison into one of three modes:
1. "RANKING" (same-domain comparisons, like iPhone vs Pixel, RTX 3090 vs RX 6500 XT. Can be scored and ranked).
2. "ANALYTICAL" (cross-domain comparisons, like tree vs laptop, coffee vs books. Can be analyzed structurally but no winner).
3. "NEUTRAL" (sensitive, asymmetric, invalid, political figures, or private individuals, e.g. PM Modi vs Tree, Gemini vs Chat, Rock vs Sky. MUST NOT have ranking or numeric scores. Treat comparisons involving living people or absurd matchups as NEUTRAL).

Next, generate 3 to 5 highly specific, creatively named comparison categories. 
CRITICAL RULE: DO NOT use generic, boring names like "Performance", "Design", "Value", or "Features". Make them ALIVE, engaging, and hyper-tailored to the specific items. Use domain-specific jargon (e.g., "VRAM Bandwidth" for GPUs, "Ecosystem Synergy" for tech, "Photosynthetic Output" for plants).

Return a JSON object matching this schema exactly:
{
  "mode": "RANKING" | "ANALYTICAL" | "NEUTRAL",
  "reason": "Brief, witty explanation of why this mode was selected and what these entities fundamentally are.",
  "categories": [
    { "id": "cat1", "name": "Vibrant Category Name" }
  ]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);

    // Ensure IDs are present
    if (data.categories) {
      data.categories = data.categories.map((c, idx) => ({
        id: c.id || `cat-${idx + 1}`,
        name: c.name
      }));
    }
    return data;
  } catch (err) {
    console.error("GeminiService Error (classification):", err);
    // Graceful fallback to mock data
    return getMockClassification(items);
  }
};

// 2. Detailed Verdict Generation
export const generateDetailedVerdict = async (items, categories, mode, apiKeyOverride) => {
  const apiKey = apiKeyOverride || getApiKey();

  if (!apiKey) {
    console.log("GeminiService: Using mock verdict (No API Key)");
    return new Promise((resolve) => {
      setTimeout(() => resolve(getMockVerdict(items, categories, mode)), 1200);
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: { responseMimeType: "application/json" }
    });

    let prompt = "";
    const catNames = categories.map(c => c.name);

    if (mode === "NEUTRAL") {
      prompt = `You are an elite, highly intelligent AI decision engine. Evaluate these items: ${JSON.stringify(items)} across these highly specific categories: ${JSON.stringify(catNames)}.
This is a NEUTRAL mode comparison because it is asymmetric, absurd, or involves people (e.g., "Modi vs Tree", "Rock vs Sky").
CRITICAL INSTRUCTIONS:
1. DO NOT output any numeric scores, rankings, or designate a winner. 
2. Explicitly REFUSE to compare them in a conventional sense, but do it in a witty, highly engaging, and lively manner!
3. Highlight the absurdity of the comparison or the fundamentally distinct nature of the entities. Make the analysis fun, insightful, and non-repetitive.
4. Explain what these entities actually are in the real world.
Return a JSON object matching this schema exactly:
{
  "confidence": number (10-100),
  "reasoningSummary": "A lively, witty, and highly engaging summary explaining the fundamental nature of these items and the sheer absurdity or complexity of comparing them. Refuse a conventional winner.",
  "tradeOffs": ["Witty insight 1", "Witty insight 2", "Witty insight 3"],
  "winner": null,
  "matrix": {
    "itemName1": {
      "categoryName1": "Lively, non-boring description of itemName1 under categoryName1",
      "categoryName2": "Lively, non-boring description of itemName1 under categoryName2"
    }
  }
}`;
    } else {
      const isRanking = mode === "RANKING";
      prompt = `You are an elite, expert AI decision engine. Evaluate these items: ${JSON.stringify(items)} across these highly specific categories: ${JSON.stringify(catNames)}.
Comparison Mode: ${mode}.
CRITICAL INSTRUCTIONS:
1. Identify EXACTLY what these items are (e.g., "High-end GPUs", "Web Frameworks").
2. Provide deep, expert-level analysis using appropriate domain jargon. Do not be generic or repetitive. Make the analysis read like it was written by an absolute elite expert in the field.
3. ${isRanking ? "Provide numeric scores (0 to 100) per category for each item. Declare an absolute winner from the list of items based on the scores." : "Provide numeric scores (0 to 100) per category for each item. Do NOT declare a winner (winner should be null)."}

Return a JSON object matching this schema exactly:
{
  "confidence": number (0-100, based on evaluation certainty),
  "reasoningSummary": "An elite, expert-level breakdown of how the items compare. Explicitly mention what the items actually are (e.g. 'Both are high-end desktop GPUs...').",
  "tradeOffs": ["Deep technical or structural trade-off 1 (max 20 words)", "Deep technical or structural trade-off 2 (max 20 words)", "Deep technical or structural trade-off 3 (max 20 words)"],
  "winner": ${isRanking ? '"Name of the winning item (exactly matches one of the items)"' : "null"},
  "scores": {
    "itemName1": {
      "categoryName1": { "score": number (0-100), "reason": "Expert, highly specific explanation (max 15 words)" },
      "categoryName2": { "score": number (0-100), "reason": "Expert, highly specific explanation (max 15 words)" }
    }
  }
}`;
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);
    return data;
  } catch (err) {
    console.error("GeminiService Error (verdict):", err);
    // Graceful fallback to mock data
    return getMockVerdict(items, categories, mode);
  }
};
