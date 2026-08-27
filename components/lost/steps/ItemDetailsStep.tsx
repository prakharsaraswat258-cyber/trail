'use client';

import React from 'react';
import { ITEM_CATEGORIES } from '../../../lib/constants/itemCategories';
import { BentoCard } from '../../ui/BentoCard';
import { Input } from '../../ui/Input';

interface ItemDetailsStepProps {
  formData: {
    category: string;
    itemName: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}

export default function ItemDetailsStep({
  formData,
  errors,
  onChange,
  headingRef,
}: ItemDetailsStepProps) {
  return (
    <BentoCard className="p-6 sm:p-8 space-y-6">
      <div className="border-b border-border pb-4">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold text-text-primary tracking-tight outline-none"
        >
          Step 1: Item Category & Name
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Tell us what type of item you lost and provide a clear name.
        </p>
      </div>

      <div className="space-y-5">
        {/* Category Select */}
        <div className="w-full flex flex-col gap-1.5">
          <label
            htmlFor="lost-item-category"
            className="text-sm font-semibold text-text-secondary select-none"
          >
            Item Category *
          </label>
          <select
            id="lost-item-category"
            value={formData.category}
            onChange={(e) => onChange('category', e.target.value)}
            className={`w-full min-h-[44px] px-4 py-2.5 text-sm text-text-primary bg-surface border rounded-lg transition-colors focus:outline-none focus:ring-2 cursor-pointer ${
              errors.category
                ? 'border-error focus:border-error focus:ring-error/15'
                : 'border-border-strong focus:border-accent focus:ring-accent/15'
            }`}
          >
            <option value="" disabled>
              Select a category…
            </option>
            {ITEM_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-[13px] text-error mt-0.5" id="category-error">
              {errors.category}
            </p>
          )}
        </div>

        {/* Item Name Input */}
        <Input
          id="lost-item-name"
          label="Item Name *"
          placeholder="e.g. Apple iPhone 15 Pro, Brown Leather Bifold Wallet, Blue Hydro Flask"
          value={formData.itemName}
          onChange={(e) => onChange('itemName', e.target.value)}
          error={errors.itemName}
          helperText="Include the brand or model if you remember it."
        />
      </div>
    </BentoCard>
  );
}
