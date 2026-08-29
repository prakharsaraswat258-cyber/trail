'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { BottomNav } from '@/components/browse/BottomNav';
import PostCard from './components/PostCard';
import SkeletonCard from './components/SkeletonCard';
import ConfirmDialog from './components/ConfirmDialog';
import ClaimsDrawer from './components/ClaimsDrawer';
import ActionSheet from './components/ActionSheet';
import { ITEM_CATEGORIES } from '@/lib/constants/itemCategories';

export default function MyPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'resolved'
  const [isScrolled, setIsScrolled] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modal / Drawer states
  const [deletingPost, setDeletingPost] = useState(null);
  const [claimsDrawerPost, setClaimsDrawerPost] = useState(null);
  const [actionSheetPost, setActionSheetPost] = useState(null);

  // Initial auth verification and real Supabase data fetch
  useEffect(() => {
    async function loadUserPosts() {
      setLoading(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login?redirect=/my-posts');
          return;
        }

        const userId = user.id;

        // Fetch user's found items and lost reports in parallel
        const [foundRes, lostRes] = await Promise.all([
          supabase
            .from('found_items')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
          supabase
            .from('lost_reports')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
        ]);

        const foundRows = foundRes.data || [];
        const lostRows = lostRes.data || [];

        // Fetch claims on the user's found items
        const claimsByFoundItemId = {};
        const foundIds = foundRows.map((r) => r.id);
        if (foundIds.length > 0) {
          const { data: claimsData } = await supabase
            .from('claims')
            .select('*')
            .in('found_item_id', foundIds)
            .order('created_at', { ascending: false });

          (claimsData || []).forEach((c) => {
            if (!claimsByFoundItemId[c.found_item_id]) {
              claimsByFoundItemId[c.found_item_id] = [];
            }
            claimsByFoundItemId[c.found_item_id].push({
              claim_id: c.id,
              claimant_id: c.claimant_id,
              proof_note: c.proof || c.contact || '',
              status: c.status ? c.status.toUpperCase() : 'PENDING',
              created_at: c.created_at,
            });
          });
        }

        // Map found_items to Post shape expected by PostCard & ClaimsDrawer
        const mappedFound = foundRows.map((row) => {
          const itemClaims = claimsByFoundItemId[row.id] || [];
          let status = 'OPEN';
          if (row.status === 'returned') {
            status = 'RESOLVED';
          } else if (itemClaims.some((c) => c.status === 'APPROVED')) {
            status = 'IN_CLAIM';
          } else {
            status = 'OPEN';
          }

          const locParts = [
            row.location_building,
            row.location_floor ? row.location_floor : null,
            row.location_landmark_or_room ? row.location_landmark_or_room : null,
          ].filter(Boolean);

          const photo =
            Array.isArray(row.photos) && row.photos.length > 0
              ? row.photos[0]
              : '';

          return {
            post_id: row.id,
            user_id: row.user_id,
            type: 'FOUND',
            title: row.item_name || 'Found Item',
            category: row.category || 'Other',
            location: locParts.join(' · ') || 'Campus',
            description: row.description || '',
            image_url: photo,
            status,
            claim_requests: itemClaims,
            created_at: row.created_at,
            updated_at: row.updated_at || row.created_at,
          };
        });

        // Map lost_reports to Post shape expected by PostCard & ClaimsDrawer
        const mappedLost = lostRows.map((row) => {
          let status = 'OPEN';
          if (row.status === 'resolved') {
            status = 'RESOLVED';
          } else if (row.status === 'potential_match') {
            status = 'IN_CLAIM';
          } else {
            status = 'OPEN';
          }

          const locParts = [
            row.location_building,
            row.location_area ? row.location_area : null,
          ].filter(Boolean);

          const photo =
            Array.isArray(row.photos) && row.photos.length > 0
              ? row.photos[0]
              : '';

          return {
            post_id: row.id,
            user_id: row.user_id,
            type: 'LOST',
            title: row.item_name || 'Lost Item',
            category: row.category || 'Other',
            location: locParts.join(' · ') || 'Campus',
            description: row.description || '',
            image_url: photo,
            status,
            claim_requests: [],
            created_at: row.created_at,
            updated_at: row.updated_at || row.created_at,
          };
        });

        const combined = [...mappedFound, ...mappedLost].sort((a, b) => {
          const timeA = new Date(a.updated_at || a.created_at).getTime();
          const timeB = new Date(b.updated_at || b.created_at).getTime();
          return timeB - timeA;
        });

        setPosts(combined);
      } catch (err) {
        console.error('Failed to load posts from Supabase:', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    loadUserPosts();
  }, [router]);

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

  const categoriesList = ['All', ...ITEM_CATEGORIES];

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
            <div className="flex items-center gap-2">
              <Link
                href="/browse"
                aria-label="Back to browse"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#6E6B5F] hover:text-[#1C1B18] hover:bg-[#ECEAE2] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-[#1C1B18] tracking-tight">
                My Posts
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/search"
                className="text-xs font-semibold text-[#C96442] hover:text-[#B5572E] flex items-center gap-1.5 bg-[#F2E8E2] px-2.5 py-1 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search</span>
              </Link>
              <span className="text-xs font-semibold text-[#6E6B5F] bg-[#ECEAE2] px-2.5 py-1 rounded-full">
                {posts.length}
              </span>
            </div>
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
        <main className="flex-1 px-4 py-4 space-y-3 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
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
                <h2 className="text-base font-bold text-[#1C1B18] mb-1">
                  No resolved posts
                </h2>
                <p className="text-xs text-[#6E6B5F]">
                  Posts marked as returned or recovered will appear here.
                </p>
              </div>
            )
          ) : (
            displayedPosts.map((post) => (
              <PostCard
                key={post.post_id}
                post={post}
                isBumpEligible={checkBumpEligible(post)}
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

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}

