'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  ThumbsUp, 
  Users, 
  Plus,
  Search,
  Heart,
  Filter,
  X,
  ChevronDown,
  Calendar,
  TrendingUp,
  Star,
  Send,
  ChevronUp
} from 'lucide-react';

interface Comment {
  id: number;
  postId: number;
  author: string;
  authorRole: string;
  content: string;
  time: string;
  timeStamp: Date;
  likes: number;
}

export function Community() {
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track which posts the current user has liked
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  // Comment system states
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  const [newComments, setNewComments] = useState<{ [postId: number]: string }>({});
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      postId: 1,
      author: 'Suresh Patil',
      authorRole: 'Farmer',
      content: 'Great advice! I had similar issues last season. The copper-based fungicide worked well for me too.',
      time: '1 hour ago',
      timeStamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      likes: 3
    },
    {
      id: 2,
      postId: 1,
      author: 'Dr. Meera Singh',
      authorRole: 'Expert',
      content: 'Adding to this - proper spacing between plants and good air circulation are crucial for prevention.',
      time: '45 minutes ago',
      timeStamp: new Date(Date.now() - 45 * 60 * 1000),
      likes: 7
    },
    {
      id: 3,
      postId: 2,
      author: 'Ramesh Joshi',
      authorRole: 'Farmer',
      content: 'I use vermicompost mixed with neem cake. Works wonderfully for wheat.',
      time: '3 hours ago',
      timeStamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      likes: 5
    }
  ]);

  // Filter states
  const [filters, setFilters] = useState({
    authorRole: 'all', // all, farmer, seller, expert
    sortBy: 'recent', // recent, popular, mostLiked, mostCommented
    timeRange: 'all', // all, today, week, month
    tags: [] as string[]
  });

  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Best practices for tomato leaf blight prevention',
      content: 'I\'ve been dealing with leaf blight in my tomato crops. After consulting with agricultural experts, here are the methods that worked for me...',
      author: 'Rajesh Kumar',
      authorRole: 'Farmer',
      time: '2 hours ago',
      timeStamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      likes: 24,
      comments: 8,
      tags: ['tomato', 'disease', 'prevention']
    },
    {
      id: 2,
      title: 'Organic fertilizer recommendations for wheat',
      content: 'Looking for organic fertilizer suggestions for wheat crops. What has worked well for your farms?',
      author: 'Priya Sharma',
      authorRole: 'Farmer',
      time: '4 hours ago',
      timeStamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      likes: 18,
      comments: 12,
      tags: ['wheat', 'organic', 'fertilizer']
    },
    {
      id: 3,
      title: 'Smart irrigation system setup guide',
      content: 'I recently installed a smart irrigation system on my farm. Here\'s a detailed guide on how to set it up and optimize water usage...',
      author: 'Tech Solutions India',
      authorRole: 'Seller',
      time: '1 day ago',
      timeStamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      likes: 45,
      comments: 23,
      tags: ['irrigation', 'technology', 'water']
    },
    {
      id: 4,
      title: 'Seasonal crop rotation strategies',
      content: 'Effective crop rotation can significantly improve soil health and yield. Let me share my 3-year rotation plan...',
      author: 'Dr. Amit Patel',
      authorRole: 'Expert',
      time: '2 days ago',
      timeStamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      likes: 67,
      comments: 34,
      tags: ['rotation', 'soil', 'planning']
    },
    {
      id: 5,
      title: 'Pest control methods for cotton crops',
      content: 'Sharing effective pest control strategies that have worked on my cotton farm. These methods are both economical and environmentally friendly...',
      author: 'Suresh Patil',
      authorRole: 'Farmer',
      time: '3 days ago',
      timeStamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      likes: 32,
      comments: 15,
      tags: ['cotton', 'pest', 'control', 'organic']
    },
    {
      id: 6,
      title: 'Drip irrigation benefits and installation',
      content: 'After installing drip irrigation on my vegetable farm, I\'ve seen 40% water savings and better crop yields. Here\'s my experience...',
      author: 'Meera Joshi',
      authorRole: 'Farmer',
      time: '4 days ago',
      timeStamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      likes: 28,
      comments: 19,
      tags: ['irrigation', 'water', 'vegetables', 'efficiency']
    }
  ]);

  // Get all unique tags from posts
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));

  const handleCreatePost = () => {
    if (newPostTitle.trim() && newPostContent.trim()) {
      // Create new post object
      const newPost = {
        id: posts.length + 1,
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        author: 'You', // In a real app, this would come from user context
        authorRole: 'Farmer', // This would also come from user context
        time: 'Just now',
        timeStamp: new Date(),
        likes: 0,
        comments: 0,
        tags: [] // Could be extracted from content or added separately
      };

      // Add new post to the beginning of the posts array
      setPosts(prevPosts => [newPost, ...prevPosts]);

      // Clear form and hide it
      setNewPostTitle('');
      setNewPostContent('');
      setShowNewPost(false);

      // Show success feedback (optional)
      console.log('New post created successfully:', newPost);
    }
  };

  const handleLikeToggle = (postId: number) => {
    const isCurrentlyLiked = likedPosts.has(postId);
    
    // Update the liked posts set
    setLikedPosts(prevLikedPosts => {
      const newLikedPosts = new Set(prevLikedPosts);
      if (isCurrentlyLiked) {
        newLikedPosts.delete(postId);
      } else {
        newLikedPosts.add(postId);
      }
      return newLikedPosts;
    });

    // Update the post's like count
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: isCurrentlyLiked ? post.likes - 1 : post.likes + 1 
            }
          : post
      )
    );
  };

  const toggleComments = (postId: number) => {
    setExpandedPosts(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(postId)) {
        newExpanded.delete(postId);
      } else {
        newExpanded.add(postId);
      }
      return newExpanded;
    });
  };

  const handleCommentChange = (postId: number, value: string) => {
    setNewComments(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  const handleAddComment = (postId: number) => {
    const commentText = newComments[postId]?.trim();
    if (!commentText) return;

    // Create new comment
    const newComment: Comment = {
      id: comments.length + 1,
      postId: postId,
      author: 'You', // In a real app, this would come from user context
      authorRole: 'Farmer', // This would also come from user context
      content: commentText,
      time: 'Just now',
      timeStamp: new Date(),
      likes: 0
    };

    // Add comment to comments array
    setComments(prev => [...prev, newComment]);

    // Update post comment count
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, comments: post.comments + 1 }
          : post
      )
    );

    // Clear the comment input for this post
    setNewComments(prev => ({
      ...prev,
      [postId]: ''
    }));

    // Ensure comments section is expanded
    setExpandedPosts(prev => new Set([...prev, postId]));
  };

  const getCommentsForPost = (postId: number) => {
    return comments
      .filter(comment => comment.postId === postId)
      .sort((a, b) => b.timeStamp.getTime() - a.timeStamp.getTime());
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleTagFilter = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const clearFilters = () => {
    setFilters({
      authorRole: 'all',
      sortBy: 'recent',
      timeRange: 'all',
      tags: []
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const hasActiveFilters = () => {
    return filters.authorRole !== 'all' || 
           filters.sortBy !== 'recent' || 
           filters.timeRange !== 'all' || 
           filters.tags.length > 0;
  };

  const hasActiveSearch = () => {
    return searchQuery.trim().length > 0;
  };

  // Search function - searches in title, content, author, and tags
  const searchPosts = (posts: any[], query: string) => {
    if (!query.trim()) return posts;
    
    const searchTerm = query.toLowerCase().trim();
    
    return posts.filter(post => {
      // Search in title
      if (post.title.toLowerCase().includes(searchTerm)) return true;
      
      // Search in content
      if (post.content.toLowerCase().includes(searchTerm)) return true;
      
      // Search in author name
      if (post.author.toLowerCase().includes(searchTerm)) return true;
      
      // Search in tags
      if (post.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))) return true;
      
      return false;
    });
  };

  // Filter and sort posts
  const filteredPosts = posts
    .filter(post => {
      // Filter by author role
      if (filters.authorRole !== 'all' && post.authorRole.toLowerCase() !== filters.authorRole) {
        return false;
      }

      // Filter by time range
      if (filters.timeRange !== 'all') {
        const now = new Date();
        const postTime = post.timeStamp;
        const timeDiff = now.getTime() - postTime.getTime();
        
        switch (filters.timeRange) {
          case 'today':
            if (timeDiff > 24 * 60 * 60 * 1000) return false;
            break;
          case 'week':
            if (timeDiff > 7 * 24 * 60 * 60 * 1000) return false;
            break;
          case 'month':
            if (timeDiff > 30 * 24 * 60 * 60 * 1000) return false;
            break;
        }
      }

      // Filter by tags
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => post.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      return true;
    })
    .filter(post => {
      // Apply search filter
      if (hasActiveSearch()) {
        return searchPosts([post], searchQuery).length > 0;
      }
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'popular':
          return (b.likes + b.comments) - (a.likes + a.comments);
        case 'mostLiked':
          return b.likes - a.likes;
        case 'mostCommented':
          return b.comments - a.comments;
        case 'recent':
        default:
          return b.timeStamp.getTime() - a.timeStamp.getTime();
      }
    });

  // Highlight search terms in text
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Community</h2>
        <Button 
          onClick={() => setShowNewPost(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search discussions, topics, authors..." 
                className="pl-10 pr-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {hasActiveSearch() && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="relative">
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filter
                {hasActiveFilters() && (
                  <Badge className="ml-1 bg-green-600 text-white text-xs px-1.5 py-0.5">
                    {[
                      filters.authorRole !== 'all',
                      filters.sortBy !== 'recent',
                      filters.timeRange !== 'all',
                      filters.tags.length > 0
                    ].filter(Boolean).length}
                  </Badge>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>

              {/* Filter Panel */}
              {showFilters && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowFilters(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Author Role Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Author Role</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'all', label: 'All' },
                          { key: 'farmer', label: 'Farmers' },
                          { key: 'seller', label: 'Sellers' },
                          { key: 'expert', label: 'Experts' }
                        ].map((role) => (
                          <Button
                            key={role.key}
                            variant={filters.authorRole === role.key ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFilterChange('authorRole', role.key)}
                            className={filters.authorRole === role.key ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            {role.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Sort By Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'recent', label: 'Recent', icon: Calendar },
                          { key: 'popular', label: 'Popular', icon: TrendingUp },
                          { key: 'mostLiked', label: 'Most Liked', icon: ThumbsUp },
                          { key: 'mostCommented', label: 'Most Discussed', icon: MessageSquare }
                        ].map((sort) => {
                          const IconComponent = sort.icon;
                          return (
                            <Button
                              key={sort.key}
                              variant={filters.sortBy === sort.key ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleFilterChange('sortBy', sort.key)}
                              className={`flex items-center gap-1 ${filters.sortBy === sort.key ? "bg-green-600 hover:bg-green-700" : ""}`}
                            >
                              <IconComponent className="w-3 h-3" />
                              {sort.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Range Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'all', label: 'All Time' },
                          { key: 'today', label: 'Today' },
                          { key: 'week', label: 'This Week' },
                          { key: 'month', label: 'This Month' }
                        ].map((time) => (
                          <Button
                            key={time.key}
                            variant={filters.timeRange === time.key ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFilterChange('timeRange', time.key)}
                            className={filters.timeRange === time.key ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            {time.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Tags Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
                      <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                        {allTags.map((tag) => (
                          <Button
                            key={tag}
                            variant={filters.tags.includes(tag) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleTagFilter(tag)}
                            className={`text-xs h-7 ${filters.tags.includes(tag) ? "bg-green-600 hover:bg-green-700" : ""}`}
                          >
                            #{tag}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex gap-2 pt-2 border-t dark:border-gray-700">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={clearFilters}
                        className="flex-1"
                      >
                        Clear All
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => setShowFilters(false)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Filters and Search Display */}
          {(hasActiveFilters() || hasActiveSearch()) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
              
              {/* Search Query Badge */}
              {hasActiveSearch() && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  <Search className="w-3 h-3" />
                  "{searchQuery}"
                  <button onClick={clearSearch}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {filters.authorRole !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  Role: {filters.authorRole}
                  <button onClick={() => handleFilterChange('authorRole', 'all')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.sortBy !== 'recent' && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  Sort: {filters.sortBy}
                  <button onClick={() => handleFilterChange('sortBy', 'recent')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.timeRange !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  Time: {filters.timeRange}
                  <button onClick={() => handleFilterChange('timeRange', 'all')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-xs">
                  #{tag}
                  <button onClick={() => toggleTagFilter(tag)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  clearFilters();
                  clearSearch();
                }} 
                className="text-xs h-6"
              >
                Clear All
              </Button>
            </div>
          )}

          {/* Results Count */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {hasActiveSearch() ? (
              <>
                Found {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''} for "{searchQuery}"
                {filteredPosts.length !== posts.length && ` (${posts.length} total posts)`}
              </>
            ) : (
              `Showing ${filteredPosts.length} of ${posts.length} posts`
            )}
          </div>

          {showNewPost && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Create New Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Post title..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Share your knowledge, ask questions, or discuss farming topics..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewPost(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreatePost} 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!newPostTitle.trim() || !newPostContent.trim()}
                  >
                    Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {hasActiveSearch() ? 'No search results found' : 'No posts found'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {hasActiveSearch() 
                      ? `Try searching for different keywords or check your spelling.`
                      : 'Try adjusting your filters or search criteria.'
                    }
                  </p>
                  {(hasActiveSearch() || hasActiveFilters()) && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        clearFilters();
                        clearSearch();
                      }}
                      className="mt-4"
                    >
                      Clear all filters and search
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredPosts.map((post) => {
                const postComments = getCommentsForPost(post.id);
                const isExpanded = expandedPosts.has(post.id);
                
                return (
                  <Card key={post.id} className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h3 className="font-black text-gray-900 dark:text-white">
                                {hasActiveSearch() ? highlightSearchTerm(post.author, searchQuery) : post.author}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">{post.authorRole}</Badge>
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{post.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2">
                            {hasActiveSearch() ? highlightSearchTerm(post.title, searchQuery) : post.title}
                          </h4>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {hasActiveSearch() ? highlightSearchTerm(post.content, searchQuery) : post.content}
                          </p>
                        </div>
                        
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <Badge 
                                key={tag} 
                                variant="outline" 
                                className={`text-xs font-semibold ${
                                  hasActiveSearch() && tag.toLowerCase().includes(searchQuery.toLowerCase())
                                    ? 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700'
                                    : ''
                                }`}
                              >
                                #{hasActiveSearch() ? highlightSearchTerm(tag, searchQuery) : tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 pt-2 border-t dark:border-gray-700">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`flex items-center gap-1 font-semibold transition-colors ${
                              likedPosts.has(post.id) 
                                ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300' 
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                            onClick={() => handleLikeToggle(post.id)}
                          >
                            <ThumbsUp 
                              className={`w-4 h-4 ${
                                likedPosts.has(post.id) ? 'fill-current' : ''
                              }`} 
                            />
                            {post.likes}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center gap-1 font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            onClick={() => toggleComments(post.id)}
                          >
                            <MessageSquare className="w-4 h-4" />
                            {post.comments}
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3 ml-1" />
                            ) : (
                              <ChevronDown className="w-3 h-3 ml-1" />
                            )}
                          </Button>
                        </div>

                        {/* Comments Section */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t dark:border-gray-700 space-y-4">
                            {/* Add Comment Form */}
                            <div className="flex gap-3">
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                                <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <Textarea
                                  placeholder="Write a comment..."
                                  value={newComments[post.id] || ''}
                                  onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                  rows={2}
                                  className="resize-none"
                                />
                                <div className="flex justify-end">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddComment(post.id)}
                                    disabled={!newComments[post.id]?.trim()}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Send className="w-3 h-3 mr-1" />
                                    Comment
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Existing Comments */}
                            {postComments.length > 0 && (
                              <div className="space-y-3">
                                <h5 className="font-semibold text-gray-900 dark:text-white text-sm">
                                  Comments ({postComments.length})
                                </h5>
                                {postComments.map((comment) => (
                                  <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                                      <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                          {comment.author}
                                        </span>
                                        <Badge variant="outline" className="text-xs">
                                          {comment.authorRole}
                                        </Badge>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {comment.time}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                        {comment.content}
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                                          <ThumbsUp className="w-3 h-3 mr-1" />
                                          {comment.likes}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {postComments.length === 0 && (
                              <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                                No comments yet. Be the first to comment!
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Community Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active Members</span>
                  <span className="font-black text-gray-900 dark:text-white">2,847</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Posts Today</span>
                  <span className="font-black text-gray-900 dark:text-white">{posts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Expert Responses</span>
                  <span className="font-black text-gray-900 dark:text-white">89%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Popular Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['Disease Management', 'Organic Farming', 'Crop Rotation', 'Irrigation', 'Soil Health'].map((topic) => (
                  <Badge key={topic} variant="outline" className="w-full justify-start font-semibold">
                    #{topic.toLowerCase().replace(' ', '')}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Search Suggestions */}
          {hasActiveSearch() && filteredPosts.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Found {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} matching "{searchQuery}"
                  </div>
                  {filteredPosts.slice(0, 3).map((post) => (
                    <div key={post.id} className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      • {post.title}
                    </div>
                  ))}
                  {filteredPosts.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ...and {filteredPosts.length - 3} more
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}