import Groq from 'groq-sdk';
import Search from '../models/Search.js';
import { MEDICAL_SYSTEM_PROMPT } from '../config/medicalPrompt.js';

export const medicalSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const normalizedQuery = query.toLowerCase().trim();

    // Check Search model for cached query
    const cachedSearch = await Search.findOne({
      query: normalizedQuery,
      userId: req.user.id
    });

    if (cachedSearch) {
      return res.status(200).json({ source: 'cache', data: cachedSearch.response });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: MEDICAL_SYSTEM_PROMPT },
        { role: 'user', content: `User searched for: "${query}"` }
      ],
      response_format: { type: 'json_object' }
    });

    // Parse JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      console.error('JSON parse error. Raw response:', completion.choices[0].message.content);
      return res.status(500).json({ message: 'Error parsing response from AI model', raw: completion.choices[0].message.content });
    }

    // Save to Search model
    const newSearch = new Search({
      userId: req.user.id,
      query: normalizedQuery,
      response: parsedResponse,
    });

    await newSearch.save();

    return res.status(200).json({ source: 'ai', data: parsedResponse });

  } catch (error) {
    console.error('Error in medicalSearch:', error?.message || error);
    return res.status(500).json({ message: error?.message || 'Server error during search' });
  }
};

export const getSearchHistory = async (req, res) => {
  try {
    const history = await Search.find({ userId: req.user.id })
      .sort({ cachedAt: -1 })
      .limit(20);

    return res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching search history:', error);
    return res.status(500).json({ message: 'Server error fetching history' });
  }
};
