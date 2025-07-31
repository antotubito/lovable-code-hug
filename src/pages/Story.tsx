import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export function Story() {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // Load likes count on mount
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const { data, error } = await supabase
          .from('feedback')
          .select('id')
          .eq('message', 'story_like');
        
        if (error) throw error;
        setLikes(data?.length || 0);
        
        // Check if user has already liked
        const hasLikedStory = localStorage.getItem('dislink_story_liked') === 'true';
        setHasLiked(hasLikedStory);
      } catch (error) {
        console.error('Error fetching likes:', error);
      }
    };
    
    fetchLikes();
  }, []);

  const handleLike = async () => {
    if (hasLiked || isLiking) return;
    
    setIsLiking(true);
    try {
      // Add like to database
      const { error } = await supabase
        .from('feedback')
        .insert([
          { message: 'story_like' }
        ]);
      
      if (error) throw error;
      
      // Update local state
      setLikes(prev => prev + 1);
      setHasLiked(true);
      
      // Save to localStorage to prevent multiple likes
      localStorage.setItem('dislink_story_liked', 'true');
    } catch (error) {
      console.error('Error adding like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Our Story</h1>
              <Link
                to="/waitlist"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Home
              </Link>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8 prose max-w-none">
            <p className="text-lg leading-relaxed text-gray-700">
              Dislink was born from a simple observation: in our increasingly connected world, 
              meaningful relationships often get lost in the digital noise. We saw professionals 
              and individuals struggling to maintain the connections they made at conferences, 
              meetups, social events, and through mutual friends. Important details about where 
              they met, shared interests, and common connections would fade with time.
            </p>

            <p className="text-lg leading-relaxed text-gray-700 mt-6">
              We believed there had to be a better way to nurture these relationships. That's why 
              we created Dislink - not just as another networking app, but as a platform that 
              understands the human side of connections. We focused on capturing the context of 
              relationships - the where, when, and why of how people meet - because these details 
              matter in building lasting bonds.
            </p>

            <p className="text-lg leading-relaxed text-gray-700 mt-6">
              Dislink isn't about collecting contacts; it's about enriching relationships. It's 
              about remembering that person you met at a conference who shared your passion for 
              sustainable technology, or that fellow expat you connected with who introduced you 
              to a whole new community. It's about turning chance encounters into meaningful 
              connections that last.
            </p>

            <p className="text-lg leading-relaxed text-gray-700 mt-6">
              Our journey began in a small coffee shop in Lisbon, where our founding team first 
              sketched out the idea on napkins. We were frustrated by how many potentially valuable 
              connections we'd lost track of over the years - people we'd met at events, conferences, 
              or through mutual friends, but whose context we'd forgotten.
            </p>

            <p className="text-lg leading-relaxed text-gray-700 mt-6">
              We realized that the missing piece in digital networking wasn't the ability to connect - 
              it was the ability to remember the human stories behind those connections. The shared 
              moments, the common interests, the circumstances that brought people together in the 
              first place.
            </p>

            <p className="text-lg leading-relaxed text-gray-700 mt-6">
              And so, Dislink was born - a tool designed not just to connect people, but to help them 
              stay meaningfully connected. A platform that values the quality of connections over quantity, 
              and that understands that the most valuable professional relationships are built on 
              authentic human connections.
            </p>

            <p className="text-lg leading-relaxed text-gray-700 mt-6">
              Today, we're proud to be helping thousands of professionals around the world build 
              stronger, more meaningful networks. But we're just getting started. Our vision is to 
              transform how people think about professional networking - from a transactional 
              activity to a meaningful practice that enriches both professional and personal lives.
            </p>

            <div className="mt-12 flex flex-col items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                disabled={hasLiked || isLiking}
                className={`inline-flex items-center px-6 py-3 rounded-full shadow-md text-white font-medium transition-colors ${
                  hasLiked 
                    ? 'bg-pink-500 cursor-default' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <Heart className={`h-5 w-5 mr-2 ${hasLiked ? 'fill-current' : ''}`} />
                {hasLiked ? 'Thank You!' : 'Like Our Story'}
              </motion.button>
              
              <div className="mt-4 text-gray-600">
                <span className="font-medium">{likes}</span> people liked this story
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}