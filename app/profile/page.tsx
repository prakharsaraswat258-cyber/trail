'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit3, ShieldCheck, Check, Sparkles, Gift, Clock, Award, ChevronRight, Copy } from 'lucide-react';
import { BottomNav } from '@/components/browse/BottomNav';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { useToast } from '@/components/ui/Toast';

// Default student identity matching LPU standard credentials
const DEFAULT_STUDENT = {
  name: 'Prakhar Saraswat',
  regNo: '12204589',
  rollNo: 'RK22GHA42',
  course: 'B.Tech - Computer Science & Engineering (CSE)',
  school: 'School of Computer Science & Engineering',
  semester: '6th Semester',
  academicYear: '3rd Year (Class of 2026)',
  section: 'K22GH',
  email: 'prakhar.12204589@lpu.in',
  phone: '+91 98765 43210',
  residence: 'Hostel BH-4, Room 312',
  campus: 'LPU Main Campus, Jalandhar-Delhi G.T. Road',
  avatarBg: '#C96442',
  avatarInitials: 'PS',
  memberSince: 'August 2023',
  verified: true,
};

// Reward Perks Catalog available to LPU students
const DEFAULT_PERKS = [
  {
    id: 'perk_umc_review',
    title: 'Minor UMC Leniency Review Request',
    points: 450,
    category: 'Proctorial Board',
    description: 'Submit a formal community karma plea to the Proctorial & UMC Committee for minor disciplinary/attendance infraction leniency.',
    icon: '⚖️',
    color: 'bg-red-50 text-red-700 border-red-200',
    available: true,
  },
  {
    id: 'perk_nss_leader',
    title: 'NSS Leader Selection & Recommendation',
    points: 350,
    category: 'Leadership & NSS',
    description: 'Priority nomination and Faculty Coordinator endorsement for National Service Scheme (NSS) Student Wing Leader post.',
    icon: '🎖️',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    available: true,
  },
  {
    id: 'perk_free_printing',
    title: 'Free Printing at Campus Tuck Shops',
    points: 100,
    category: 'Campus Utility',
    description: 'Voucher for 100 free pages of black/white printing & binding across all hostel and block tuck shops.',
    icon: '🖨️',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    available: true,
  },
  {
    id: 'perk_extended_library',
    title: 'Extended Borrowing Time for Library Books',
    points: 150,
    category: 'Central Library',
    description: 'Extends Central Library book issue limit to 6 books with +14 days extra borrow duration & zero overdue fines.',
    icon: '📚',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    available: true,
  },
];

// Initial Karma Ledger / Credit Transactions
const INITIAL_TRANSACTIONS = [
  {
    id: 'tx_1',
    title: 'Returned Apple AirPods Pro (2nd Gen)',
    location: 'Central Library Desk',
    points: 150,
    type: 'EARN',
    date: 'Yesterday, 3:45 PM',
    refId: 'POST-8921',
  },
  {
    id: 'tx_2',
    title: 'Reported & Handed Over Student ID Card',
    location: 'Block 34 Security Office',
    points: 100,
    type: 'EARN',
    date: '2 days ago',
    refId: 'POST-8874',
  },
  {
    id: 'tx_3',
    title: 'Redeemed Free Printing at Campus Tuck Shops',
    location: 'Block 13 Tuck Shop',
    points: 100,
    type: 'REDEEM',
    date: '3 days ago',
    refId: 'VOUCH-4412',
  },
  {
    id: 'tx_4',
    title: 'Reported Found MacBook Charger',
    location: 'Science Complex, Rm 204',
    points: 100,
    type: 'EARN',
    date: '5 days ago',
    refId: 'POST-8810',
  },
  {
    id: 'tx_5',
    title: 'Campus Samaritan Monthly Bonus',
    location: 'LPU Find Community Hub',
    points: 100,
    type: 'EARN',
    date: '10 days ago',
    refId: 'SYS-BONUS',
  },
];

export default function ProfilePage() {
  const [student, setStudent] = useState(DEFAULT_STUDENT);
  const [credits, setCredits] = useState(750);
  const [perks] = useState(DEFAULT_PERKS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [metrics] = useState({
    reportedCount: 14,
    returnedCount: 12,
    successRate: '98%',
    trustScore: '4.9★',
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'ledger'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ ...DEFAULT_STUDENT });
  const [confirmingPerk, setConfirmingPerk] = useState<typeof DEFAULT_PERKS[0] | null>(null);
  const [redeemModalPerk, setRedeemModalPerk] = useState<typeof DEFAULT_PERKS[0] | null>(null);
  const [activeVoucherCode, setActiveVoucherCode] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lpufind_student_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        setStudent(parsed);
        setEditFormData(parsed);
      }
    } catch {}
  }, []);

  const handleCopyRegNo = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(student.regNo).catch(() => {});
      }
      showToast('Registration Number Copied', {
        message: `${student.regNo} copied to clipboard.`,
        type: 'success',
      });
    } catch {
      // Gracefully handle clipboard errors
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = editFormData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'LP';

    const updated = {
      ...editFormData,
      avatarInitials: initials,
    };

    setStudent(updated);
    try {
      localStorage.setItem('lpufind_student_profile', JSON.stringify(updated));
    } catch {}
    setIsEditModalOpen(false);
    showToast('Profile details updated successfully!', { type: 'success' });
  };

  const handleRedeemPerk = (perk: typeof DEFAULT_PERKS[0]) => {
    if (credits < perk.points) {
      showToast('Insufficient Credits', {
        message: `Need ${perk.points - credits} more credits to redeem this perk!`,
        type: 'error',
      });
      return;
    }

    const voucher = 'LPU-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + perk.points;
    const newCredits = credits - perk.points;
    const newTx = {
      id: 'tx_' + Date.now(),
      title: `Redeemed ${perk.title}`,
      location: perk.category,
      points: perk.points,
      type: 'REDEEM',
      date: 'Just now',
      refId: voucher,
    };

    setCredits(newCredits);
    setTransactions([newTx, ...transactions]);
    setActiveVoucherCode(voucher);
    setRedeemModalPerk(perk);
  };

  const getTierInfo = (pts: number) => {
    if (pts >= 1000) {
      return { name: 'Platinum Guardian', level: 4, nextGoal: 1500, color: 'text-purple-700 bg-purple-50 border-purple-200' };
    } else if (pts >= 500) {
      return { name: 'Campus Champion (Gold)', level: 3, nextGoal: 1000, color: 'text-amber-700 bg-amber-50 border-amber-200' };
    } else if (pts >= 250) {
      return { name: 'Honorable Finder (Silver)', level: 2, nextGoal: 500, color: 'text-slate-700 bg-slate-100 border-slate-200' };
    } else {
      return { name: 'Rising Scout (Bronze)', level: 1, nextGoal: 250, color: 'text-orange-700 bg-orange-50 border-orange-200' };
    }
  };

  const tier = getTierInfo(credits);
  const progressPercent = Math.min(100, Math.round((credits / tier.nextGoal) * 100));

  return (
    <div className="bg-[#FAF8F3] min-h-screen text-[#1C1B18] flex justify-center pb-24">
      <div className="w-full max-w-md min-h-screen bg-[#FAF8F3] flex flex-col sm:border-x sm:border-black/7 sm:shadow-xl relative">
        {/* Header Sticky Navigation */}
        <header className="sticky top-0 z-20 bg-[#FAF8F3] px-4 pt-4 pb-3 border-b border-black/7 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Link
                href="/browse"
                aria-label="Back to browse"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#6E6B5F] hover:text-[#1C1B18] hover:bg-[#ECEAE2] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-[#1C1B18] tracking-tight">Student Profile</h1>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <button
                type="button"
                onClick={() => {
                  setEditFormData({ ...student });
                  setIsEditModalOpen(true);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#C96442] hover:bg-[#B5572E] text-white active:scale-95 transition-all shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-4 space-y-4">
          {/* STUDENT HERO CARD */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-black/7 p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-4">
              {/* Student Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-[#C96442] text-white flex items-center justify-center font-extrabold text-2xl shadow-md border-2 border-[#FFFFFF] flex-shrink-0">
                {student.avatarInitials}
              </div>

              {/* Student Primary Meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-lg font-extrabold text-[#1C1B18] truncate leading-snug">{student.name}</h2>
                  {student.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <button
                    type="button"
                    onClick={handleCopyRegNo}
                    className="inline-flex items-center gap-1 text-xs text-[#6E6B5F] hover:text-[#1C1B18] font-mono group focus:outline-none transition-colors"
                    title="Click to copy registration number"
                    aria-label={`Copy Registration Number ${student.regNo}`}
                  >
                    <span>Reg: {student.regNo}</span>
                    <Copy className="w-3 h-3 text-[#A8A49A] group-hover:text-[#C96442] transition-colors" />
                  </button>
                </div>
                <p className="text-xs text-[#6E6B5F] truncate">{student.course}</p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-4 gap-2 pt-4 mt-4 border-t border-black/7 text-center">
              <div className="p-2 rounded-xl bg-[#F3F1EB]">
                <span className="block text-[10px] text-[#6E6B5F] font-medium uppercase">Reported</span>
                <span className="text-sm font-extrabold text-[#1C1B18]">{metrics.reportedCount}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#F3F1EB]">
                <span className="block text-[10px] text-[#6E6B5F] font-medium uppercase">Returned</span>
                <span className="text-sm font-extrabold text-[#059669]">{metrics.returnedCount}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#F3F1EB]">
                <span className="block text-[10px] text-[#6E6B5F] font-medium uppercase">Success</span>
                <span className="text-sm font-extrabold text-[#1C1B18]">{metrics.successRate}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#F3F1EB]">
                <span className="block text-[10px] text-[#6E6B5F] font-medium uppercase">Trust</span>
                <span className="text-sm font-extrabold text-[#C96442]">{metrics.trustScore}</span>
              </div>
            </div>
          </div>

          {/* KARMA REWARD BALANCE CARD */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-black/7 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E6B5F]">Karma Credits Balance</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-black text-[#C96442]">{credits}</span>
                  <span className="text-xs font-semibold text-[#6E6B5F]">Credits</span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${tier.color}`}>
                {tier.name}
              </span>
            </div>

            {/* Progress Bar to Next Tier */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] font-medium text-[#6E6B5F]">
                <span>Progress to next tier</span>
                <span>{credits} / {tier.nextGoal} pts</span>
              </div>
              <div className="w-full h-2 bg-[#F3F1EB] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C96442] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* TABS SELECTOR */}
          <div className="grid grid-cols-3 bg-[#F3F1EB] p-1 rounded-xl gap-1 text-xs font-bold text-[#6E6B5F]">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`py-2 rounded-lg transition-all ${
                activeTab === 'overview' ? 'bg-[#FFFFFF] text-[#1C1B18] shadow-sm' : 'hover:text-[#1C1B18]'
              }`}
            >
              Academic
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rewards')}
              className={`py-2 rounded-lg transition-all ${
                activeTab === 'rewards' ? 'bg-[#FFFFFF] text-[#C96442] shadow-sm' : 'hover:text-[#1C1B18]'
              }`}
            >
              Rewards ({perks.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ledger')}
              className={`py-2 rounded-lg transition-all ${
                activeTab === 'ledger' ? 'bg-[#FFFFFF] text-[#1C1B18] shadow-sm' : 'hover:text-[#1C1B18]'
              }`}
            >
              History
            </button>
          </div>

          {/* TAB 1: ACADEMIC & CONTACT OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-black/7 p-4 shadow-sm space-y-3">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-black/7">
                  <span className="text-[#6E6B5F]">Roll Number</span>
                  <span className="font-semibold text-[#1C1B18] font-mono">{student.rollNo}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-black/7">
                  <span className="text-[#6E6B5F]">Section & Semester</span>
                  <span className="font-semibold text-[#1C1B18]">{student.section} ({student.semester})</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-black/7">
                  <span className="text-[#6E6B5F]">School</span>
                  <span className="font-semibold text-[#1C1B18] truncate max-w-[200px] text-right">{student.school}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-black/7">
                  <span className="text-[#6E6B5F]">Hostel / Residence</span>
                  <span className="font-semibold text-[#1C1B18]">{student.residence}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-black/7">
                  <span className="text-[#6E6B5F]">University Email</span>
                  <span className="font-semibold text-[#1C1B18]">{student.email}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#6E6B5F]">Contact Phone</span>
                  <span className="font-semibold text-[#1C1B18]">{student.phone}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REWARDS & PERKS STORE */}
          {activeTab === 'rewards' && (
            <div className="space-y-3">
              {perks.map((perk) => {
                const canAfford = credits >= perk.points;
                return (
                  <div
                    key={perk.id}
                    className="bg-[#FFFFFF] rounded-2xl border border-black/7 p-4 shadow-sm space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{perk.icon}</span>
                        <div>
                          <h3 className="text-sm font-bold text-[#1C1B18] leading-tight">{perk.title}</h3>
                          <span className="text-[10px] text-[#6E6B5F] font-medium">{perk.category}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-[#C96442] shrink-0 bg-[#F2E8E2] px-2 py-0.5 rounded-full">
                        {perk.points} pts
                      </span>
                    </div>

                    <p className="text-xs text-[#6E6B5F] leading-relaxed">{perk.description}</p>

                    <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setConfirmingPerk(perk)}
                        disabled={!canAfford}
                        className={`min-h-[36px] px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          canAfford
                            ? 'bg-[#C96442] hover:bg-[#B5572E] text-white active:scale-95 shadow-sm cursor-pointer'
                            : 'bg-[#F3F1EB] text-[#A8A49A] cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Redeem Perk' : `Need ${perk.points - credits} more pts`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: KARMA LEDGER HISTORY */}
          {activeTab === 'ledger' && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-black/7 p-4 shadow-sm space-y-3">
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-2 border-b border-black/7 last:border-0"
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <p className="text-xs font-bold text-[#1C1B18] truncate">{tx.title}</p>
                      <p className="text-[10px] text-[#6E6B5F]">{tx.date} • {tx.location}</p>
                    </div>
                    <span
                      className={`text-xs font-extrabold shrink-0 ${
                        tx.type === 'EARN' ? 'text-[#059669]' : 'text-[#DC2626]'
                      }`}
                    >
                      {tx.type === 'EARN' ? `+${tx.points}` : `-${tx.points}`} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* EDIT PROFILE MODAL */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog">
            <div className="bg-[#FFFFFF] rounded-2xl border border-black/7 p-5 max-w-sm w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/7">
                <h3 className="text-base font-bold text-[#1C1B18]">Edit Student Profile</h3>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-xs font-bold text-[#6E6B5F] hover:text-[#1C1B18]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#6E6B5F] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full min-h-[40px] px-3 bg-[#FAF8F3] border border-black/14 rounded-lg focus:outline-none focus:border-[#C96442]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#6E6B5F] mb-1">Course</label>
                  <input
                    type="text"
                    value={editFormData.course}
                    onChange={(e) => setEditFormData({ ...editFormData, course: e.target.value })}
                    className="w-full min-h-[40px] px-3 bg-[#FAF8F3] border border-black/14 rounded-lg focus:outline-none focus:border-[#C96442]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#6E6B5F] mb-1">Hostel / Room</label>
                  <input
                    type="text"
                    value={editFormData.residence}
                    onChange={(e) => setEditFormData({ ...editFormData, residence: e.target.value })}
                    className="w-full min-h-[40px] px-3 bg-[#FAF8F3] border border-black/14 rounded-lg focus:outline-none focus:border-[#C96442]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#6E6B5F] mb-1">Phone</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full min-h-[40px] px-3 bg-[#FAF8F3] border border-black/14 rounded-lg focus:outline-none focus:border-[#C96442]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="min-h-[40px] px-4 rounded-lg font-bold bg-[#F3F1EB] text-[#6E6B5F] hover:bg-[#ECEAE2]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="min-h-[40px] px-4 rounded-lg font-bold bg-[#C96442] hover:bg-[#B5572E] text-white shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CONFIRM REDEMPTION MODAL */}
        {confirmingPerk && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog">
            <div className="bg-[#FFFFFF] rounded-2xl border border-black/7 p-5 max-w-sm w-full shadow-2xl text-center space-y-4">
              <div className="text-4xl mx-auto">{confirmingPerk.icon}</div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#6E6B5F]">Confirm Redemption</span>
                <h3 className="text-base font-black text-[#1C1B18] mt-0.5">{confirmingPerk.title}</h3>
                <p className="text-xs text-[#6E6B5F] mt-1">{confirmingPerk.category}</p>
              </div>

              <div className="bg-[#F3F1EB] rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex justify-between text-[#6E6B5F]">
                  <span>Points Cost:</span>
                  <span className="font-bold text-[#C96442]">−{confirmingPerk.points} pts</span>
                </div>
                <div className="flex justify-between text-[#6E6B5F] pt-1 border-t border-black/7">
                  <span>Balance After:</span>
                  <span className="font-black text-[#1C1B18]">{credits - confirmingPerk.points} pts</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingPerk(null)}
                  className="min-h-[40px] rounded-xl text-xs font-bold text-[#6E6B5F] bg-[#F3F1EB] hover:bg-[#ECEAE2]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const perk = confirmingPerk;
                    setConfirmingPerk(null);
                    handleRedeemPerk(perk);
                  }}
                  className="min-h-[40px] rounded-xl text-xs font-bold bg-[#C96442] hover:bg-[#B5572E] text-white shadow-sm"
                >
                  Confirm &amp; Redeem
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VOUCHER GENERATED MODAL */}
        {activeVoucherCode && redeemModalPerk && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog">
            <div className="bg-[#FFFFFF] rounded-2xl border border-black/7 p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mx-auto">
                🎉
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Voucher Generated
                </span>
                <h3 className="text-base font-black text-[#1C1B18] mt-2">{redeemModalPerk.title}</h3>
              </div>

              <div className="bg-[#FAF8F3] border-2 border-dashed border-[#C96442]/40 rounded-xl p-4 space-y-1.5">
                <span className="text-[10px] text-[#6E6B5F] uppercase font-semibold">Voucher Pass Code</span>
                <div className="font-mono text-lg font-black text-[#C96442] tracking-wider select-all">
                  {activeVoucherCode}
                </div>
                <span className="text-[10px] text-[#6E6B5F] block">Deducted {redeemModalPerk.points} Karma Credits</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveVoucherCode(null);
                  setRedeemModalPerk(null);
                  showToast('Voucher Saved', {
                    message: 'Voucher saved to your active rewards!',
                    type: 'success',
                  });
                }}
                className="w-full min-h-[40px] bg-[#C96442] hover:bg-[#B5572E] text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
