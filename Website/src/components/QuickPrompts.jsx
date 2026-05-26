import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Lightbulb, Zap } from 'lucide-react';

const QuickPrompts = ({ onPromptSelect, activeMode }) => {
  const promptSets = {
    chat: [
      { icon: Sparkles, text: "Explain quantum computing", color: "from-purple-600 to-blue-600" },
      { icon: Brain, text: "Help me brainstorm ideas", color: "from-pink-600 to-red-600" },
      { icon: Lightbulb, text: "Suggest productivity tips", color: "from-yellow-600 to-orange-600" },
      { icon: Zap, text: "Create a workout plan", color: "from-green-600 to-teal-600" },
    ],
    search: [
      { icon: Sparkles, text: "Latest AI breakthroughs", color: "from-purple-600 to-blue-600" },
      { icon: Brain, text: "How does blockchain work", color: "from-pink-600 to-red-600" },
      { icon: Lightbulb, text: "Best tech companies 2026", color: "from-yellow-600 to-orange-600" },
      { icon: Zap, text: "Space exploration news", color: "from-green-600 to-teal-600" },
    ],
    PDF: [
      { icon: Sparkles, text: "Search academic papers", color: "from-purple-600 to-blue-600" },
      { icon: Brain, text: "Find research documents", color: "from-pink-600 to-red-600" },
      { icon: Lightbulb, text: "Look for guides", color: "from-yellow-600 to-orange-600" },
      { icon: Zap, text: "Find PDFs by topic", color: "from-green-600 to-teal-600" },
    ],
  };

  const prompts = promptSets[activeMode] || promptSets.chat;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 py-6">
      {prompts.map((prompt, index) => {
        const Icon = prompt.icon;
        return (
          <motion.button
            key={index}
            onClick={() => onPromptSelect(prompt.text)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-xl text-left border border-zinc-800/50 hover:border-zinc-700 transition-all duration-300 bg-gradient-to-br ${prompt.color} opacity-10 hover:opacity-20 group`}
          >
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 mt-0.5 text-white group-hover:text-blue-300 transition-colors flex-shrink-0" />
              <span className="text-white text-sm font-medium group-hover:text-blue-100 transition-colors leading-relaxed">
                {prompt.text}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default QuickPrompts;
