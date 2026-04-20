import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middlewares/requireAuth";

const router = Router();

router.use(requireAuth);

router.post("/oracle", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { query, context } = req.body;

  // In a real implementation, we would call OpenAI/Gemini here.
  // For now, we mock the AI Oracle response.

  setTimeout(() => {
    res.json({
      message: `The Oracle has heard your request regarding "${query || 'your studies'}".`,
      advice: "Consistency is your greatest weapon. Do not falter.",
      quest: "Review 3 old topics today to gain 50 bonus XP.",
      flashcards: [
        { q: "What is the Pomodoro technique?", a: "25 min work, 5 min break." },
        { q: "What is Spaced Repetition?", a: "Reviewing material at increasing intervals to combat the forgetting curve." }
      ]
    });
  }, 1000); // simulate network delay
});

export default router;
