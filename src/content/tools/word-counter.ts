import { ToolSEOContent } from '../../types/seoContent';

export const wordCounterSEO: ToolSEOContent = {
  toolId: 'word-counter',
  seoTitle: 'Free Word Counter - Character, Sentence & Reading Time Tool',
  metaDescription: 'Count words, characters, sentences, paragraphs, and estimated reading time in real time. Free, accurate, and private writing analysis tool.',
  h1: 'Free Online Word & Character Counter Tool',
  introduction: `
The Word Counter on NuvoraTools provides real-time text analysis for writers, students, SEO copywriters, journalists, and social media managers. Keeping track of exact word counts, character limits, sentence structures, and estimated speaking times is vital when writing academic essays, meta descriptions, tweets, blog articles, or speeches.

As you type or paste text into our clean writing canvas, the counter instantly computes real-time metric statistics, including total word count, total character count (with and without spaces), sentence count, paragraph count, and estimated reading/speaking duration.

In addition, our advanced text inspector calculates readability metrics, average sentence length, keyword density frequencies, and social media character limits (X/Twitter, LinkedIn, Facebook, and Google Meta Title constraints). Your text remains 100% private in browser memory.
  `.trim(),
  howToSteps: [
    {
      stepNumber: 1,
      title: 'Paste or Type Your Text',
      description: 'Enter your article, essay, or social media caption directly into the interactive text editor canvas above.',
    },
    {
      stepNumber: 2,
      title: 'Review Metric Statistics',
      description: 'Observe real-time counts for words, characters (with/without spaces), sentences, paragraphs, and reading time.',
    },
    {
      stepNumber: 3,
      title: 'Check Social Media & SEO Limits',
      description: 'Monitor progress bars for X/Twitter (280 chars), LinkedIn (3000 chars), and SEO Meta Description thresholds (160 chars).',
    },
    {
      stepNumber: 4,
      title: 'Analyze Keyword Density',
      description: 'Inspect top keyword frequency lists to optimize your search engine optimization (SEO) copy.',
    },
  ],
  features: [
    'Real-time Live Analytics: Instant metric updates without clicking buttons or waiting for page refreshes.',
    'Comprehensive Text Metrics: Words, characters with spaces, characters without spaces, sentences, and paragraphs.',
    'Reading & Speaking Time Estimates: Calculated based on average human reading speeds (200 wpm) and speaking speeds (130 wpm).',
    'Social Media Limit Tracker: Real-time progress indicators for Twitter/X, LinkedIn, Facebook, and Instagram captions.',
    'SEO Meta Character Counters: Stay within Google search snippet title (60 chars) and meta description (160 chars) limits.',
    'Top Keyword Frequency Table: See top repeated 1-word and 2-word combinations to prevent keyword stuffing.',
  ],
  benefits: [
    'Avoid Social Media Truncation: Ensure post captions fit within network character caps before publishing.',
    'Hit Academic Target Lengths: Easily track essay word count minimums for high school and university assignments.',
    'Improve Content Readability: Keep sentence lengths balanced for better reader engagement.',
    'Complete Text Privacy: Draft confidential corporate communications safely without cloud text storage.',
  ],
  commonUseCases: [
    'SEO Content Writing: Drafting meta descriptions and blog posts optimized for search engine SERPs.',
    'Academic Essay Writing: Meeting strict essay word limits for college applications and research papers.',
    'Social Media Marketing: Crafting Twitter/X threads, LinkedIn posts, and YouTube descriptions.',
    'Speechwriting & Scripting: Estimating exact presentation speech durations based on word count.',
  ],
  tipsAndBestPractices: [
    'Target 150-160 Chars for Meta Descriptions: Keep primary web page descriptions under 160 characters to prevent Google truncation.',
    'Aim for 15-20 Words Per Sentence: Shorter, punchier sentences improve web content readability scores.',
  ],
  faq: [
    {
      question: 'Is this word counter free to use?',
      answer: 'Yes, it is 100% free with unlimited text length analysis and zero registration.',
    },
    {
      question: 'Does this tool count spaces as characters?',
      answer: 'The counter provides two separate figures: total characters including spaces and total characters excluding spaces.',
    },
    {
      question: 'How is reading time calculated?',
      answer: 'Estimated reading time is calculated using a standard benchmark of 200 words per minute (wpm).',
    },
    {
      question: 'How is speaking time calculated?',
      answer: 'Estimated speaking time uses a standard verbal speech rate of 130 words per minute (wpm).',
    },
    {
      question: 'Is my text saved or stored on any server?',
      answer: 'No. Your text remains strictly inside your local browser window. Nothing is saved or sent to external servers.',
    },
    {
      question: 'What is the character limit for Twitter/X?',
      answer: 'Standard X (Twitter) posts have a limit of 280 characters.',
    },
    {
      question: 'What is the ideal meta description length for SEO?',
      answer: 'Search engines typically truncate meta descriptions longer than 155 to 160 characters.',
    },
    {
      question: 'Can I analyze large documents like book chapters?',
      answer: 'Yes! Because processing happens in browser memory, you can paste long articles or book chapters without lag.',
    },
  ],
  relatedToolIds: ['lorem-ipsum-generator', 'ai-invoice-generator', 'percentage-calculator'],
  conclusion: `
The Word Counter on NuvoraTools is the essential text inspection tool for digital writers. Analyze word counts, character limits, and reading times instantly with complete privacy.
  `.trim(),
  keywords: ['word counter', 'character counter', 'reading time calculator', 'sentence counter', 'text analyzer', 'seo meta description counter'],
  ogTitle: 'Free Word Counter - Real-Time Character & Text Analytics',
  ogDescription: 'Count words, characters, sentences, paragraphs, and reading times instantly with live keyword frequency analysis.',
  twitterTitle: 'Free Word & Character Counter Tool',
  twitterDescription: 'Instant browser word count and character analyzer with social media limit trackers.',
};
