import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const morningEmojis = ['🌅', '🌞', '🌻', '🍀', '✨', '🌈', '🎈', '🦋', '🐣', '🌸'];
const afternoonEmojis = ['🌤️', '🌺', '🍃', '🌿', '🦄', '🎨', '🎭', '🎪', '🎡', '🎠'];
const eveningEmojis = ['🌙', '⭐', '🌟', '🦊', '🐰', '🐼', '🐨', '🦥', '🦝', '🦢'];
const nightEmojis = ['🌜', '💫', '🌠', '🎆', '🌃', '🦉', '🐱', '🦊', '🐇', '🦋'];

export function PositiveAffirmation() {
  const [affirmation, setAffirmation] = useState('');
  const [emoji, setEmoji] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    function updateAffirmation() {
      const now = new Date();
      const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      const hour = jakartaTime.getHours();

      let message = '';
      let emojiList: string[] = [];
      const username = user?.user_metadata?.username || 'Pejuang';

      if (hour >= 5 && hour < 12) {
        message = `Hai ${username}, Selamat pagi dan jangan lupa aktivitas yang sehat hari ini`;
        emojiList = morningEmojis;
      } else if (hour >= 12 && hour < 15) {
        message = `Hai ${username}, Selamat siang! Tetap semangat dan jaga energimu`;
        emojiList = afternoonEmojis;
      } else if (hour >= 15 && hour < 21) {
        message = `Hai ${username}, Selamat sore! Bagaimana harimu? Tetap positif ya`;
        emojiList = eveningEmojis;
      } else if ((hour >= 21 && hour <= 23) || (hour >= 0 && hour < 4.83)) {
        message = `Hai ${username}, Selamat malam jangan lupa tidur tepat waktu ya`;
        emojiList = nightEmojis;
      } else {
        message = `Hai ${username}, Selamat pagi! Sudah waktunya bangun dan memulai hari`;
        emojiList = morningEmojis;
      }

      const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
      
      setAffirmation(message);
      setEmoji(randomEmoji);
    }

    updateAffirmation();
    const interval = setInterval(updateAffirmation, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="mt-auto p-4 bg-gray-700 rounded-lg text-white text-sm">
      <p className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        {affirmation}
      </p>
    </div>
  );
}