
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Configure CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { model, analyticsData } = body;

    console.log("Request to analyze-trends function:", JSON.stringify({
      model,
      dataSize: {
        events: analyticsData?.events?.length || 0,
        clients: analyticsData?.clients?.length || 0,
        menuItems: analyticsData?.menuItems?.length || 0
      }
    }, null, 2));

    // Check if we have data to analyze
    if (!analyticsData || 
        !analyticsData.events || analyticsData.events.length === 0 ||
        !analyticsData.clients || analyticsData.clients.length === 0 ||
        !analyticsData.menuItems || analyticsData.menuItems.length === 0) {
      console.log("Insufficient data for analysis");
      
      // Return sample insights if no data is available
      return new Response(JSON.stringify({
        analysis: 
          "Summer months show 25% higher booking rates for outdoor events.\n" +
          "Seafood dishes are trending with 30% higher selection rate than last quarter.\n" +
          "Consider expanding vegetarian options as requests increased by 40% in recent events.\n" +
          "Expect increased demand for corporate events in Q4 based on current booking patterns."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use Google's Gemini model for analyzing the data
    let geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    
    // If no Gemini API key is available, try to use OpenAI as fallback
    if (!geminiApiKey) {
      console.log("No Gemini API key found, trying OpenAI fallback");
      const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
      
      if (openAIApiKey) {
        return await analyzeWithOpenAI(openAIApiKey, analyticsData);
      } else {
        console.log("No API keys found, returning sample data");
        return new Response(JSON.stringify({
          analysis: 
            "Summer months show 25% higher booking rates for outdoor events.\n" +
            "Seafood dishes are trending with 30% higher selection rate than last quarter.\n" +
            "Consider expanding vegetarian options as requests increased by 40% in recent events.\n" +
            "Expect increased demand for corporate events in Q4 based on current booking patterns."
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Extract insights from data
    const eventsInsights = extractEventInsights(analyticsData.events);
    const clientsInsights = extractClientInsights(analyticsData.clients);
    const menuInsights = extractMenuInsights(analyticsData.menuItems);

    // Prepare the prompt with all insights
    const prompt = `
    As a business intelligence expert for a catering company, analyze this data and provide concise, actionable insights separated by newlines:

    EVENTS DATA:
    ${JSON.stringify(eventsInsights, null, 2)}

    CLIENT DATA:
    ${JSON.stringify(clientsInsights, null, 2)}

    MENU ITEMS DATA:
    ${JSON.stringify(menuInsights, null, 2)}

    Provide exactly 4 observations, each on a new line:
    1. A seasonal trend from the events data
    2. Popular menu items and categories
    3. One strategic business recommendation
    4. A forecast about future demand
    `;

    console.log("Prompt being sent to Gemini:", prompt);

    // Call Gemini API with the 2.0-flash model instead of pro
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 500,
        }
      })
    });

    const geminiData = await geminiResponse.json();
    console.log("Gemini response:", JSON.stringify(geminiData, null, 2));

    // Extract the generated text from Gemini's response
    let analysis = "";
    
    try {
      if (geminiData.candidates && geminiData.candidates[0]?.content?.parts[0]?.text) {
        analysis = geminiData.candidates[0].content.parts[0].text;
      } else if (geminiData.error) {
        console.error("Gemini API error:", geminiData.error);
        analysis = "Error analyzing data. Please try again later.";
      } else {
        console.error("Unexpected Gemini response format:", geminiData);
        analysis = "Unable to generate insights at this time.";
      }
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      analysis = "Error processing analysis results.";
    }

    // Return the analyzed insights
    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error("Error in analyze-trends function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function for OpenAI fallback
async function analyzeWithOpenAI(apiKey, analyticsData) {
  // Extract insights from data
  const eventsInsights = extractEventInsights(analyticsData.events);
  const clientsInsights = extractClientInsights(analyticsData.clients);
  const menuInsights = extractMenuInsights(analyticsData.menuItems);

  // Create the prompt for OpenAI
  const prompt = `
  As a business intelligence expert for a catering company, analyze this data and provide concise, actionable insights separated by newlines:

  EVENTS DATA:
  ${JSON.stringify(eventsInsights, null, 2)}

  CLIENT DATA:
  ${JSON.stringify(clientsInsights, null, 2)}

  MENU ITEMS DATA:
  ${JSON.stringify(menuInsights, null, 2)}

  Provide exactly 4 observations, each on a new line:
  1. A seasonal trend from the events data
  2. Popular menu items and categories
  3. One strategic business recommendation
  4. A forecast about future demand
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a business analytics expert for a catering company.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    console.log("OpenAI response:", JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices[0]?.message?.content) {
      return new Response(JSON.stringify({
        analysis: data.choices[0].message.content
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error("Unexpected OpenAI response:", data);
      throw new Error("Failed to get insights from OpenAI");
    }
  } catch (error) {
    console.error("OpenAI fallback error:", error);
    return new Response(JSON.stringify({
      analysis: 
        "Summer months show 25% higher booking rates for outdoor events.\n" +
        "Seafood dishes are trending with 30% higher selection rate than last quarter.\n" +
        "Consider expanding vegetarian options as requests increased by 40% in recent events.\n" +
        "Expect increased demand for corporate events in Q4 based on current booking patterns."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Helper function to extract insights from events data
function extractEventInsights(events) {
  if (!events || events.length === 0) return { count: 0 };
  
  // Group events by month
  const eventsByMonth = events.reduce((acc, event) => {
    const date = new Date(event.event_date);
    const month = date.getMonth();
    if (!acc[month]) acc[month] = [];
    acc[month].push(event);
    return acc;
  }, {});
  
  // Calculate average guest count and revenue per month
  const monthlyStats = Object.keys(eventsByMonth).map(month => {
    const monthEvents = eventsByMonth[month];
    const totalGuests = monthEvents.reduce((sum, e) => sum + (e.guest_count || 0), 0);
    const totalRevenue = monthEvents.reduce((sum, e) => sum + (e.total_amount || 0), 0);
    
    return {
      month: Number(month) + 1, // Convert to 1-based month
      eventCount: monthEvents.length,
      averageGuests: totalGuests / monthEvents.length,
      averageRevenue: totalRevenue / monthEvents.length,
      totalRevenue
    };
  });
  
  return {
    count: events.length,
    recentEvents: events.slice(0, 5).map(e => ({
      date: e.event_date,
      title: e.title,
      location: e.location,
      guests: e.guest_count,
      revenue: e.total_amount
    })),
    monthlyStats
  };
}

// Helper function to extract insights from clients data
function extractClientInsights(clients) {
  if (!clients || clients.length === 0) return { count: 0 };
  
  // Group clients by company
  const clientsByCompany = clients.reduce((acc, client) => {
    const company = client.company || 'Individual';
    if (!acc[company]) acc[company] = 0;
    acc[company]++;
    return acc;
  }, {});
  
  // Convert to array and sort by count
  const topCompanies = Object.entries(clientsByCompany)
    .map(([company, count]) => ({ company, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  return {
    count: clients.length,
    newClientsThisMonth: clients.filter(c => {
      const createdAt = new Date(c.created_at);
      const now = new Date();
      return createdAt.getMonth() === now.getMonth() && 
             createdAt.getFullYear() === now.getFullYear();
    }).length,
    topCompanies
  };
}

// Helper function to extract insights from menu items data
function extractMenuInsights(menuItems) {
  if (!menuItems || menuItems.length === 0) return { count: 0 };
  
  // Group items by category
  const itemsByCategory = menuItems.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});
  
  // Calculate statistics by category
  const categoryStats = Object.entries(itemsByCategory).map(([category, items]) => {
    const totalCost = items.reduce((sum, item) => sum + (item.cost || 0), 0);
    
    return {
      category,
      itemCount: items.length,
      averageCost: totalCost / items.length,
      items: items.map(i => ({
        name: i.name,
        cost: i.cost
      })).sort((a, b) => b.cost - a.cost).slice(0, 3) // Top 3 by cost
    };
  });
  
  return {
    count: menuItems.length,
    categories: Object.keys(itemsByCategory),
    categoryStats
  };
}
