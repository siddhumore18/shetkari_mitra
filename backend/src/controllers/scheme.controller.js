import { getRecommendedSchemes } from '../services/gemini.service.js';
import User from '../models/user.model.js';

export const getSchemes = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const language = req.query.lang || user.language || 'en';
        const schemes = await getRecommendedSchemes(user, language, user.groqApiKey);

        if (!schemes || !schemes.recommendations) {
            return res.status(200).json({ 
                recommendations: [], 
                summary: language === 'mr' ? "शिफारसी लोड करण्यात अक्षम." : "Unable to load recommendations." 
            });
        }

        // Pass descriptive keywords for the frontend to fetch specific images
        const enhancedSchemes = {
            ...schemes,
            recommendations: (schemes.recommendations || []).map(s => ({
                ...s,
                imageKeywords: `farming,india,${s.imageUrl || s.imageKeywords || s.title}`
            }))
        };

        res.status(200).json(enhancedSchemes);
    } catch (error) {
        console.error('Error fetching schemes:', error);
        res.status(500).json({ message: 'AI Service Error: ' + error.message });
    }
};
