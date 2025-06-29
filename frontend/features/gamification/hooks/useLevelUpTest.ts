import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { updateXP, selectGamificationData } from "../gamificationSlice";

export const useLevelUpTest = () => {
  const dispatch = useAppDispatch();
  const gamificationData = useAppSelector(selectGamificationData);

  const triggerLevelUp = () => {
    if (!gamificationData) return;

    const currentLevel = gamificationData.level || 1;
    const newLevel = currentLevel + 1;
    
    // Calculate XP needed for next level (simple formula)
    const xpForNextLevel = newLevel * 100; // 100 XP per level
    const xpGained = 50; // Amount of XP gained in this action

    dispatch(updateXP({
      totalXP: gamificationData.totalXP + xpGained,
      level: newLevel,
      xpToNextLevel: (newLevel + 1) * 100 - (gamificationData.totalXP + xpGained),
      xpGained: xpGained,
    }));
  };

  return { triggerLevelUp };
};