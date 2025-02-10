import React, { useState, useEffect } from 'react';

const morningEmojis = ['🌅', '🌞', '🌻', '🍀', '✨', '🌈', '🎈', '🦋', '🐣', '🌸'];
const afternoonEmojis = ['🌤️', '🌺', '🍃', '🌿', '🦄', '🎨', '🎭', '🎪', '🎡', '🎠'];
const eveningEmojis = ['🌙', '⭐', '🌟', '🦊', '🐰', '🐼', '🐨', '🦥', '🦝', '🦢'];
const nightEmojis = ['🌜', '💫', '🌠', '🎆', '🌃', '🦉', '🐱', '🦊', '🐇', '🦋'];

export function PositiveAffirmation() {
  const [affirmation, setAffirmation] = useState('');
  const [emoji, setEmoji] = useState('');

  useEffect(() => {
    function updateAffirmation() {
      const now = new Date();
      const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      const hour = jakartaTime.getHours();

      let message = '';
      let emojiList: string[] = [];

      if (hour >= 5 && hour < 12) {
        message = 'Hay Pejuang, Selamat pagi dan jangan lupa aktivitas yang sehat hari ini';
        emojiList = morningEmojis;
      } else if (hour >= 12 && hour < 15) {
        message = 'Hay Pejuang, Selamat siang! Tetap semangat dan jaga energimu';
        emojiList = afternoonEmojis;
      } else if (hour >= 15 && hour < 21) { // Changed from 18 to 21 (9 PM)
        message = 'Hay Pejuang, Selamat sore! Bagaimana harimu? Tetap positif ya';
        emojiList = eveningEmojis;
      } else if ((hour >= 21 && hour <= 23) || (hour >= 0 && hour < 4.83)) { // 4.83 is approximately 4:50 AM
        message = 'Hay Pejuang, Selamat malam jangan lupa tidur tepat waktu ya';
        emojiList = nightEmojis;
      } else {
        message = 'Hay Pejuang, Selamat pagi! Sudah waktunya bangun dan memulai hari';
        emojiList = morningEmojis;
      }

      const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
      
      setAffirmation(message);
      setEmoji(randomEmoji);
    }

    updateAffirmation();
    const interval = setInterval(updateAffirmation, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-auto p-4 bg-gray-700 rounded-lg text-white text-sm">
      <p className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        {affirmation}
      </p>
    </div>
  );
}