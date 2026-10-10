import React, { useState } from 'react';
import {
  MessagesSquare,
  Plus,
  ThumbsUp,
  MessageCircle,
  Search,
  Filter,
  Share2,
  Tag,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CommunityPost } from '../types';

export const CommunityPage: React.FC = () => {
  const { communityPosts, createCommunityPost, togglePostUpvote, addCommentToPost, currentUser } =
    useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<CommunityPost['category']>('Discussion');
  const [newTags, setNewTags] = useState('React, Campus');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const categories = ['All', 'Announcement', 'Discussion', 'Achievement', 'Team Formation'];

  const filteredPosts = communityPosts.filter((post) => {
    if (selectedCategory !== 'All' && post.category !== selectedCategory) return false;
    if (
      searchQuery &&
      !post.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !post.content.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const tags = newTags.split(',').map((t) => t.trim()).filter(Boolean);
    createCommunityPost(newTitle, newContent, newCategory, tags);

    setNewTitle('');
    setNewContent('');
    setShowCreateModal(false);
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    addCommentToPost(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1DC] text-[#173D2A] text-xs font-semibold mb-2">
            <MessagesSquare className="w-3.5 h-3.5 text-[#26783C]" />
            Peer Collaboration Feed
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight">
            Campus Community
          </h1>
          <p className="text-sm text-[#687769] mt-1">
            Exchange ideas, announce milestones, ask questions, and celebrate developer wins.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#26783C] hover:bg-[#1C622F] text-white text-xs font-bold rounded-btn transition-colors w-fit shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Post</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#FAFCF5] p-4 rounded-card border border-[#DCE6D2] shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#687769]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions, project calls, queries..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#EAF1DC]/50 focus:bg-[#FAFCF5] border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#173D2A] text-white font-bold'
                  : 'bg-[#EAF1DC]/60 hover:bg-[#E4EDCF] text-[#1D3024] border border-[#DCE6D2]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Posts */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {filteredPosts.map((post) => {
          const isCommentsOpen = expandedComments[post.id] || false;

          return (
            <div
              key={post.id}
              className="bg-[#FAFCF5] border border-[#DCE6D2] rounded-card p-5 shadow-subtle hover:border-[#26783C]/40 transition-colors space-y-4"
            >
              {/* Author & Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-10 h-10 rounded-full object-cover border border-[#26783C]/30"
                  />
                  <div>
                    <div className="font-bold text-sm text-[#173D2A]">{post.authorName}</div>
                    <div className="text-[11px] text-[#687769]">{post.authorBranch}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF1DC] text-[#173D2A]">
                    {post.category}
                  </span>
                  <span className="text-[11px] text-[#A2BA95]">{post.createdAt}</span>
                </div>
              </div>

              {/* Title & Content */}
              <div>
                <h3 className="font-bold text-base text-[#173D2A] leading-snug">{post.title}</h3>
                <p className="text-xs text-[#687769] mt-2 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {post.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#EAF1DC] text-[#173D2A] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interactions Bar */}
              <div className="pt-3 border-t border-[#DCE6D2] flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => togglePostUpvote(post.id)}
                    className={`flex items-center gap-1.5 font-semibold transition-colors ${
                      post.isUpvoted ? 'text-[#26783C]' : 'text-[#687769] hover:text-[#173D2A]'
                    }`}
                  >
                    <ThumbsUp
                      className={`w-4 h-4 ${post.isUpvoted ? 'fill-[#26783C]' : ''}`}
                    />
                    <span>{post.upvotes} Upvotes</span>
                  </button>

                  <button
                    onClick={() =>
                      setExpandedComments((prev) => ({ ...prev, [post.id]: !isCommentsOpen }))
                    }
                    className="flex items-center gap-1.5 text-[#687769] hover:text-[#173D2A] font-medium transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.commentCount} Comments</span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {isCommentsOpen && (
                <div className="pt-3 border-t border-[#DCE6D2]/60 space-y-3">
                  <div className="space-y-2">
                    {post.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-[#EAF1DC]/40 p-2.5 rounded-xl border border-[#DCE6D2] flex items-start gap-2.5 text-xs"
                      >
                        <img
                          src={comment.authorAvatar}
                          alt={comment.authorName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#173D2A]">{comment.authorName}</span>
                            <span className="text-[10px] text-[#A2BA95]">{comment.createdAt}</span>
                          </div>
                          <p className="text-[#687769] mt-0.5">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add comment input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(post.id);
                      }}
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-1.5 text-xs bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="px-3 py-1.5 bg-[#26783C] hover:bg-[#1C622F] text-white rounded-btn text-xs font-semibold"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAFCF5] rounded-card border border-[#DCE6D2] p-6 max-w-lg w-full shadow-card text-[#1D3024] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCE6D2]">
              <div className="font-bold text-base text-[#173D2A] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#26783C]" />
                Create Community Post
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#687769] hover:text-[#173D2A] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                >
                  <option value="Discussion">Discussion</option>
                  <option value="Team Formation">Team Formation</option>
                  <option value="Announcement">Announcement</option>
                  <option value="Achievement">Achievement</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">Post Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Tips on LeetCode dynamic programming patterns"
                  className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">Content</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share details, context, code ideas or project requirements..."
                  className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. React, Algorithms, Hackathon"
                  className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#DCE6D2] text-[#687769] hover:bg-[#EAF1DC] rounded-btn font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#26783C] hover:bg-[#1C622F] text-white rounded-btn font-bold"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
