// Social media platform configuration
import { 
  Building2, Globe, Send, Video, Heart, Calendar, Ghost, Dribbble,
  Linkedin, Twitter, Github, Instagram, Facebook, Youtube,
  MessageCircle as WhatsApp, Link as LinkIcon, Download,
  BookOpen, Users, Star, Sparkles, ArrowRight, Send as Telegram,
  MessageSquare as Discord, Twitch, AtSign as Threads,
  Coffee as BuyMeACoffee, Heart as Patreon, Rss as Substack,
  Check, Briefcase, Music, DollarSign
} from 'lucide-react';

export const SOCIAL_CATEGORIES = {
  professional: {
    title: 'Professional Networks',
    icon: Building2,
    color: 'from-blue-50 to-white border-blue-100',
    iconColor: 'text-blue-600',
    links: {
      linkedin: {
        icon: Linkedin,
        color: '#0A66C2',
        label: 'LinkedIn',
        placeholder: 'username (e.g., johndoe)'
      },
      github: {
        icon: Github,
        color: '#24292F',
        label: 'GitHub',
        placeholder: 'username (e.g., johndoe)'
      },
      portfolio: {
        icon: Globe,
        color: '#000000',
        label: 'Portfolio',
        placeholder: 'https://example.com'
      },
      upwork: {
        icon: Briefcase,
        color: '#14A800',
        label: 'Upwork',
        placeholder: 'username'
      },
      behance: {
        icon: Globe,
        color: '#1769FF',
        label: 'Behance',
        placeholder: 'username'
      },
      dribbble: {
        icon: Dribbble,
        color: '#EA4C89',
        label: 'Dribbble',
        placeholder: 'username'
      }
    }
  },
  social: {
    title: 'Social Media',
    icon: Globe,
    color: 'from-pink-50 to-white border-pink-100',
    iconColor: 'text-pink-600',
    links: {
      instagram: {
        icon: Instagram,
        color: '#E4405F',
        label: 'Instagram',
        placeholder: 'username (without @)'
      },
      twitter: {
        icon: Twitter,
        color: '#1DA1F2',
        label: 'Twitter',
        placeholder: 'username (without @)'
      },
      facebook: {
        icon: Facebook,
        color: '#1877F2',
        label: 'Facebook',
        placeholder: 'username'
      },
      youtube: {
        icon: Youtube,
        color: '#FF0000',
        label: 'YouTube',
        placeholder: 'username or @channel'
      },
      threads: {
        icon: Threads,
        label: 'Threads',
        color: '#000000',
        placeholder: 'username (without @)'
      },
      tiktok: {
        icon: Video,
        color: '#000000',
        label: 'TikTok',
        placeholder: 'username (without @)'
      }
    }
  },
  messaging: {
    title: 'Messaging',
    icon: Send,
    color: 'from-green-50 to-white border-green-100',
    iconColor: 'text-green-600',
    links: {
      whatsapp: {
        icon: WhatsApp,
        color: '#25D366',
        label: 'WhatsApp',
        placeholder: '+1234567890'
      },
      telegram: {
        icon: Telegram,
        color: '#26A5E4',
        label: 'Telegram',
        placeholder: 'username (without @)'
      },
      discord: {
        icon: Discord,
        color: '#5865F2',
        label: 'Discord',
        placeholder: 'username#0000'
      },
      signal: {
        icon: Send,
        color: '#3A76F0',
        label: 'Signal',
        placeholder: '+1234567890'
      },
      skype: {
        icon: Globe,
        color: '#00AFF0',
        label: 'Skype',
        placeholder: 'username'
      }
    }
  },
  content: {
    title: 'Content Platforms',
    icon: Video,
    color: 'from-purple-50 to-white border-purple-100',
    iconColor: 'text-purple-600',
    links: {
      medium: {
        icon: Globe,
        color: '#000000',
        label: 'Medium',
        placeholder: 'username (without @)'
      },
      substack: {
        icon: Substack,
        color: '#FF6719',
        label: 'Substack',
        placeholder: 'newsletter-name'
      },
      twitch: {
        icon: Twitch,
        color: '#9146FF',
        label: 'Twitch',
        placeholder: 'username'
      },
      soundcloud: {
        icon: Music,
        color: '#FF3300',
        label: 'SoundCloud',
        placeholder: 'username'
      },
      spotify: {
        icon: Music,
        color: '#1DB954',
        label: 'Spotify',
        placeholder: 'username'
      }
    }
  },
  support: {
    title: 'Support & Donations',
    icon: Heart,
    color: 'from-rose-50 to-white border-rose-100',
    iconColor: 'text-rose-600',
    links: {
      patreon: {
        icon: Patreon,
        color: '#FF424D',
        label: 'Patreon',
        placeholder: 'username'
      },
      buymeacoffee: {
        icon: BuyMeACoffee,
        color: '#FFDD00',
        label: 'Buy Me a Coffee',
        placeholder: 'username'
      },
      paypal: {
        icon: DollarSign,
        color: '#003087',
        label: 'PayPal',
        placeholder: 'username'
      },
      wise: {
        icon: DollarSign,
        color: '#00B9FF',
        label: 'Wise',
        placeholder: 'username'
      }
    }
  },
  scheduling: {
    title: 'Scheduling',
    icon: Calendar,
    color: 'from-amber-50 to-white border-amber-100',
    iconColor: 'text-amber-600',
    links: {
      calendly: {
        icon: Calendar,
        color: '#006BFF',
        label: 'Calendly',
        placeholder: 'username'
      },
      cal_com: {
        icon: Calendar,
        color: '#000000',
        label: 'Cal.com',
        placeholder: 'username'
      }
    }
  },
  gaming: {
    title: 'Gaming',
    icon: Ghost,
    color: 'from-violet-50 to-white border-violet-100',
    iconColor: 'text-violet-600',
    links: {
      steam: {
        icon: Ghost,
        color: '#000000',
        label: 'Steam',
        placeholder: 'username'
      },
      playstation: {
        icon: Ghost,
        color: '#003791',
        label: 'PlayStation',
        placeholder: 'PSN ID'
      },
      xbox: {
        icon: Ghost,
        color: '#107C10',
        label: 'Xbox',
        placeholder: 'Gamertag'
      }
    }
  }
};