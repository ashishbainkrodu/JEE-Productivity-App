import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface WebIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

const iconMap: { [key: string]: string } = {
  'home': '🏠',
  'calendar-today': '📅',
  'book': '📚',
  'analytics': '📊',
  'settings': '⚙️',
  'add': '➕',
  'edit': '✏️',
  'delete': '🗑️',
  'check': '✅',
  'close': '❌',
  'arrow-back': '⬅️',
  'arrow-forward': '➡️',
  'menu': '☰',
  'search': '🔍',
  'notifications': '🔔',
  'person': '👤',
  'school': '🎓',
  'timer': '⏰',
  'flag': '🚩',
  'star': '⭐',
  'fire': '🔥',
  'trophy': '🏆',
  'target': '🎯',
  'lightbulb': '💡',
  'brain': '🧠',
  'pencil': '✏️',
  'calculator': '🧮',
  'microscope': '🔬',
  'atom': '⚛️',
  'function': 'ƒ',
  'pi': 'π',
  'infinity': '∞',
  'sum': '∑',
  'integral': '∫',
  'derivative': 'd/dx',
  'limit': 'lim',
  'root': '√',
  'square': 'x²',
  'cube': 'x³',
  'power': 'xⁿ',
  'fraction': '⅟',
  'half': '½',
  'third': '⅓',
  'quarter': '¼',
  'fifth': '⅕',
  'sixth': '⅙',
  'seventh': '⅐',
  'eighth': '⅛',
  'ninth': '⅑',
  'tenth': '⅒'
};

const WebIcon: React.FC<WebIconProps> = ({ name, size = 24, color = '#000', style }) => {
  const icon = iconMap[name] || '❓';
  
  return (
    <Text style={[styles.icon, { fontSize: size, color }, style]}>
      {icon}
    </Text>
  );
};

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
    lineHeight: 1,
  },
});

export default WebIcon;
