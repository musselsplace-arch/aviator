import { ChatMessage } from '../types';

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'c1',
    username: 'Luka_Tbilisi',
    avatar: '👨‍✈️',
    text: 'წითელზე მაქვს დაზღვევა, ავიატორი 10x-მდე უნდა ავიდეს! 🚀',
    time: '11:41',
  },
  {
    id: 'c2',
    username: 'GeoSniper',
    avatar: '🎯',
    text: 'Green Zero-ზე დავდე 20₾, x14 ჯეკპოტი მინდა 🍀',
    time: '11:42',
  },
  {
    id: 'c3',
    username: 'Nika_Batumi',
    avatar: '⚡',
    text: 'წინა რაუნდში 18x-ზე გამოვიტანე, საღოლ! 🔥🔥',
    time: '11:43',
    isWin: true,
  },
  {
    id: 'c4',
    username: 'Giga_Pilot',
    avatar: '🚀',
    text: 'დაზღვევამ მომიგო წეღან, 1.20-ზე რომ ჩამოვარდა გადამარჩინა 🛡️',
    time: '11:44',
  },
  {
    id: 'c5',
    username: 'Alex_Kutaisi',
    avatar: '🎲',
    text: 'შავი ზონა მოდის, აბა ვნახოთ!',
    time: '11:45',
  },
];

export const BOT_REACTIONS_HIGH = [
  'ვააა რა მაღლა ადის! 🚀🚀',
  'HOLD!! გააჩერეთ არ დააჭიროთ ჯერ! 🔥',
  '10x-ს გაცდააა! 😱💸',
  'კოსმოსში მივფრინავთ! 🌌✨',
  'არ ჩამოვარდე გეხვეწებიიი 🚀',
  'Green Zero ზონააა, x14 მოდის! 🟢🍀',
];

export const BOT_REACTIONS_CRASH = [
  'აუუუუ 1.15x-ზე ჩამოვარდა 💔😭',
  'კაია წითელი დაზღვევა რომ მქონდა! 🛡️',
  'უცებ გაფრინდა... მომდევნოზე დავიბრუნებ 😤',
  'ვინ მოასწრო ქეშაუთი? 💸',
  'მომდევნო რაუნდში მწვანე 0-ზე ვდებ! 🟢',
];
