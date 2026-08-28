'use client';

import React, { useState, useEffect } from 'react';
import PostCard from './components/PostCard';
import SkeletonCard from './components/SkeletonCard';
import ConfirmDialog from './components/ConfirmDialog';
import ClaimsDrawer from './components/ClaimsDrawer';
import ActionSheet from './components/ActionSheet';

// Initial seed mock data
const INITIAL_POSTS = [
  {
    post_id: 'post_mac_01',
    user_id: 'student_auth_id',
    type: 'LOST',
    title: 'Apple MacBook Pro 96W Charger (White)',
    category: 'Electronics',
    location: 'Central Library, 2nd Floor Study Room 14',
    description: 'White Apple USB-C power brick with braided charging cable and small initial sticker.',
    image_url: '',
    status: 'OPEN',
    claim_requests: [],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    post_id: 'post_mac_02',
    user_id: 'student_auth_id',
    type: 'FOUND',
    title: 'MagSafe 3 MacBook Charger (Space Gray)',
    category: 'Electronics',
    location: 'Science Complex, Room 204',
    description: 'Braided Space Gray MagSafe 3 cable with dual USB-C power brick.',
    image_url: '',
    status: 'OPEN',
    claim_requests: [
      {
        claim_id: 'clm_101',
        claimant_id: 'student_552',
        proof_note: 'Left it by the second monitor at desk 5.',
        status: 'PENDING',
      },
    ],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    post_id: 'post_7894',
    user_id: 'student_auth_id',
    type: 'LOST',
    title: 'ASUS Laptop Bag (Black/Red)',
    category: 'Bags',
    location: 'Block 34, 2nd Floor',
    description: 'Black backpack with ASUS ROG logo, containing charger and notebook.',
    image_url: '',
    status: 'OPEN',
    claim_requests: [
      {
        claim_id: 'clm_102',
        claimant_id: 'student_123',
        proof_note: 'Blue carabiner attached to the left shoulder strap.',
        status: 'PENDING',
      },
    ],
    // 4 days ago to be eligible for Bump (> 3 days)
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    post_id: 'post_7895',
    user_id: 'student_auth_id',
    type: 'LOST',
    title: 'AirPods Pro Case (2nd Gen - White)',
    category: 'Electronics',
    location: 'Library, Silent Study Zone 3',
    description: 'White case with a small scratch near the lightning port.',
    image_url: '',
    status: 'OPEN',
    claim_requests: [],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    post_id: 'post_7896',
    user_id: 'student_auth_id',
    type: 'FOUND',
    title: 'Blue Hydro Flask Water Bottle (Olive/Blue)',
    category: 'Accessories',
    location: 'Sports Complex, Court 2',
    description: '32oz wide mouth with stickers from national parks.',
    image_url: '',
    status: 'IN_CLAIM',
    claim_requests: [
      {
        claim_id: 'clm_103',
        claimant_id: 'student_456',
        proof_note: 'Has a Yosemite sticker and a slight dent at the bottom.',
        status: 'PENDING',
      },
    ],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    post_id: 'post_7897',
    user_id: 'student_auth_id',
    type: 'FOUND',
    title: 'Student ID Card — John Doe',
    category: 'Documents',
    location: 'Cafeteria, Table 12',
    description: 'Computer Science Department ID card found under chair.',
    image_url: '',
    status: 'RESOLVED',
    claim_requests: [
      {
        claim_id: 'clm_104',
        claimant_id: 'student_789',
        proof_note: 'Provided matching student registration portal screenshot.',
        status: 'APPROVED',
      },
    ],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    post_id: 'post_7898',
    user_id: 'student_auth_id',
    type: 'LOST',
    title: 'Texas Instruments TI-84 Plus Calculator (Black)',
    category: 'Electronics',
    location: 'Math Building, Room 104',
    description: 'Black calculator with initials PD written on the battery cover.',
    image_url: '',
    status: 'RESOLVED',
    claim_requests: [],
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function MyPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'resolved'
  const [isScrolled, setIsScrolled] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);

  // Modal / Drawer states
  const [deletingPost, setDeletingPost] = useState(null);
  const [claimsDrawerPost, setClaimsDrawerPost] = useState(null);
  const [actionSheetPost, setActionSheetPost] = useState(null);

  // Initial simulated fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setPosts(INITIAL_POSTS);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Scroll listener for sticky header border
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keep claimsDrawerPost in sync with posts state updates
  useEffect(() => {
    if (claimsDrawerPost) {
      const updated = posts.find((p) => p.post_id === claimsDrawerPost.post_id);
      if (updated) {
        setClaimsDrawerPost(updated);
      }
    }
  }, [posts]);

  // ----------------------------------------------------
  // Mock API Functions (pure state mutation with 300ms delay)
  // ----------------------------------------------------

  const patchPostStatus = async (id, status) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    setPosts((prev) =>
      prev.map((p) =>
        p.post_id === id
          ? { ...p, status, updated_at: new Date().toISOString() }
          : p
      )
    );
  };

  const patchPostEdit = async (id, fields) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    setPosts((prev) =>
      prev.map((p) =>
        p.post_id === id
          ? { ...p, ...fields, updated_at: new Date().toISOString() }
          : p
      )
    );
  };

  const deletePost = async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    setPosts((prev) => prev.filter((p) => p.post_id !== id));
  };

  const actionClaim = async (postId, claimId, action) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    setPosts((prev) =>
      prev.map((p) => {
        if (p.post_id !== postId) return p;
        const updatedClaims = (p.claim_requests || []).map((c) => {
          if (c.claim_id !== claimId) return c;
          return {
            ...c,
            status: action === 'approve' ? 'APPROVED' : 'REJECTED',
          };
        });
        const nextStatus = action === 'approve' ? 'IN_CLAIM' : p.status;
        return {
          ...p,
          status: nextStatus,
          claim_requests: updatedClaims,
          updated_at: new Date().toISOString(),
        };
      })
    );
  };

  const handleBump = async (postId) => {
    const now = new Date().toISOString();
    await patchPostEdit(postId, { updated_at: now });
    setPosts((prev) => {
      const target = prev.find((p) => p.post_id === postId);
      if (!target) return prev;
      const remaining = prev.filter((p) => p.post_id !== postId);
      return [{ ...target, updated_at: now }, ...remaining];
    });
  };

  const handleConfirmDelete = async () => {
    if (!deletingPost) return;
    const targetId = deletingPost.post_id;
    setDeletingPost(null);
    if (claimsDrawerPost?.post_id === targetId) {
      setClaimsDrawerPost(null);
    }
    if (editingPostId === targetId) {
      setEditingPostId(null);
    }
    await deletePost(targetId);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const activePosts = posts.filter(
    (p) => p.status === 'OPEN' || p.status === 'IN_CLAIM'
  );
  const resolvedPosts = posts.filter((p) => p.status === 'RESOLVED');
  const tabPosts = activeTab === 'active' ? activePosts : resolvedPosts;

  const displayedPosts = tabPosts.filter((post) => {
    if (
      filterCategory !== 'All' &&
      post.category.toLowerCase() !== filterCategory.toLowerCase()
    ) {
      return false;
    }

    const clean = searchQuery.trim().toLowerCase();
    if (!clean) return true;

    const tokens = clean.split(/\s+/).filter(Boolean);
    const searchable = [
      post.title,
      post.category,
      post.location,
      post.description || '',
      post.type,
      post.status,
    ]
      .join(' ')
      .toLowerCase();

    return tokens.every((token) => searchable.includes(token));
  });

  const checkBumpEligible = (post) => {
    if (!post || post.status !== 'OPEN') return false;
    const now = new Date().getTime();
    const createdTime = new Date(post.created_at).getTime();
    return now - createdTime > 3 * 24 * 60 * 60 * 1000;
  };

  const categoriesList = ['All', 'Electronics', 'Bags', 'Accessories', 'Documents'];

  return (
    <div className="bg-[#FAF8F3] min-h-screen text-[#1C1B18] flex justify-center">
      {/* Mobile Shell Container */}
      <div className="w-full max-w-md min-h-screen bg-[#FAF8F3] flex flex-col sm:border-x sm:border-black/7 sm:shadow-xl relative">
        
        {/* Sticky Mobile App Header */}
        <header
          className={`sticky top-0 z-20 bg-[#FAF8F3] px-4 pt-4 pb-3 space-y-3 transition-colors duration-150 ${
            isScrolled ? 'border-b border-black/7 shadow-sm' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <a
              href="/search"
              className="text-xs font-semibold text-[#C96442] hover:text-[#B5572E] flex items-center gap-1.5 bg-[#F2E8E2] px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search / Report Lost</span>
            </a>
            <span className="text-xs font-semibold text-[#6E6B5F] bg-[#ECEAE2] px-2.5 py-1 rounded-full">
              {posts.length} Total Posts
            </span>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#1C1B18] tracking-tight">
              My Posts
            </h1>
          </div>

          {/* Search Bar within My Posts */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A8A49A]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts (e.g. MacBook charger, bag)..."
              className="w-full bg-white border border-black/14 text-[#1C1B18] placeholder-[#A8A49A] rounded-xl pl-9 pr-9 py-2 text-xs focus:outline-none focus:border-[#C96442] focus:ring-2 focus:ring-[#C96442]/15 shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#A8A49A] hover:text-[#1C1B18]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category Quick Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterCategory === cat
                    ? 'bg-[#1C1B18] text-white'
                    : 'bg-[#ECEAE2] text-[#6E6B5F] hover:text-[#1C1B18]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Full-width mobile segmented tab switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#ECEAE2] rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('active');
                setEditingPostId(null);
              }}
              className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold active:scale-[0.97] transition-all duration-100 flex items-center justify-center gap-1.5 ${
                activeTab === 'active'
                  ? 'bg-[#C96442] text-white shadow-sm'
                  : 'bg-transparent text-[#6E6B5F] hover:text-[#1C1B18]'
              }`}
            >
              <span>Active</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'active'
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-[#6E6B5F]'
                }`}
              >
                {activePosts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('resolved');
                setEditingPostId(null);
              }}
              className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold active:scale-[0.97] transition-all duration-100 flex items-center justify-center gap-1.5 ${
                activeTab === 'resolved'
                  ? 'bg-[#C96442] text-white shadow-sm'
                  : 'bg-transparent text-[#6E6B5F] hover:text-[#1C1B18]'
              }`}
            >
              <span>Resolved</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'resolved'
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-[#6E6B5F]'
                }`}
              >
                {resolvedPosts.length}
              </span>
            </button>
          </div>
        </header>

        {/* Mobile Posts Feed */}
        <main className="flex-1 px-4 py-4 space-y-3 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
          {loading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : displayedPosts.length === 0 ? (
            activeTab === 'active' ? (
              <div className="text-center py-16 bg-white border border-black/7 rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#F3F1EB] flex items-center justify-center mx-auto mb-3 text-[#A8A49A]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-[#1C1B18] mb-1">
                  No active posts
                </h2>
                <p className="text-xs text-[#6E6B5F]">
                  You have no items currently open or under verification.
                </p>
              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-black/7 rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#F3F1EB] flex items-center justify-center mx-auto mb-3 text-[#A8A49A]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-[#6E6B5F]">
                  Resolved posts will appear here.
                </p>
              </div>
            )
          ) : (
            displayedPosts.map((post) => (
              <PostCard
                key={post.post_id}
                post={post}
                isEditing={editingPostId === post.post_id}
                onStartEdit={(id) => setEditingPostId(id)}
                onCancelEdit={() => setEditingPostId(null)}
                onStatusChange={patchPostStatus}
                onEditSave={patchPostEdit}
                onBump={handleBump}
                onDeleteClick={(p) => setDeletingPost(p)}
                onViewClaims={(p) => setClaimsDrawerPost(p)}
                onOpenActionSheet={(p) => setActionSheetPost(p)}
              />
            ))
          )}
        </main>

        {/* Claims Bottom Sheet Drawer */}
        <ClaimsDrawer
          isOpen={Boolean(claimsDrawerPost)}
          onClose={() => setClaimsDrawerPost(null)}
          post={claimsDrawerPost}
          onApproveClaim={(postId, claimId) =>
            actionClaim(postId, claimId, 'approve')
          }
          onRejectClaim={(postId, claimId) =>
            actionClaim(postId, claimId, 'reject')
          }
        />

        {/* Mobile Action Sheet */}
        <ActionSheet
          isOpen={Boolean(actionSheetPost)}
          onClose={() => setActionSheetPost(null)}
          post={actionSheetPost}
          isBumpEligible={checkBumpEligible(actionSheetPost)}
          onEdit={() => {
            if (actionSheetPost) {
              setEditingPostId(actionSheetPost.post_id);
            }
          }}
          onBump={() => {
            if (actionSheetPost) {
              handleBump(actionSheetPost.post_id);
            }
          }}
          onDelete={() => {
            if (actionSheetPost) {
              setDeletingPost(actionSheetPost);
            }
          }}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmDialog
          isOpen={Boolean(deletingPost)}
          onClose={() => setDeletingPost(null)}
          onConfirm={handleConfirmDelete}
          title="Delete this post? This can't be undone."
        />
      </div>
    </div>
  );
}
