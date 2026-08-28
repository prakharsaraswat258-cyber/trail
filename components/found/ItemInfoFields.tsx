import React, { forwardRef } from "react";
import { ITEM_CATEGORIES, ItemCategory } from "@/lib/constants/itemCategories";
import { Input } from "@/components/ui/Input";

interface ItemInfoFieldsProps {
  itemName: string;
  category: ItemCategory | "";
  onItemNameChange: (val: string) => void;
  onCategoryChange: (val: ItemCategory) => void;
  nameError?: string;
  categoryError?: string;
}

export const ItemInfoFields = forwardRef<HTMLSelectElement, ItemInfoFieldsProps>(
  (
    {
      itemName,
      category,
      onItemNameChange,
      onCategoryChange,
      nameError,
      categoryError,
    },
    categoryRef
  ) => {
    return (
      <div className="w-full space-y-4">
        <div>
          <Input
            id="item-name-input"
            label="Item Name"
            required
            placeholder="e.g. Black JanSport backpack"
            value={itemName}
            onChange={(e) => onItemNameChange(e.target.value)}
            error={nameError}
            helperText="Keep it short and descriptive (brand, type, color)."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="item-category-select"
              className="block text-sm font-semibold text-text-primary"
            >
              Category <span className="text-accent">*</span>
            </label>
            <span className="text-xs text-text-muted">25% match weight</span>
          </div>

          <select
            ref={categoryRef}
            id="item-category-select"
            value={category}
            aria-invalid={Boolean(categoryError)}
            aria-describedby={categoryError ? "category-error" : undefined}
            onChange={(e) => onCategoryChange(e.target.value as ItemCategory)}
            className={`w-full min-h-[44px] px-3.5 py-2.5 bg-surface text-sm text-text-primary rounded-lg border transition-all duration-150 outline-none ${
              categoryError
                ? "border-error focus:border-error focus:ring-2 focus:ring-error/15"
                : "border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/15"
            } ${!category ? "text-text-muted" : "text-text-primary"}`}
          >
            <option value="" disabled>
              Select item category...
            </option>
            {ITEM_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="text-text-primary">
                {cat}
              </option>
            ))}
          </select>

          {categoryError && (
            <p id="category-error" className="mt-1.5 text-[13px] font-medium text-error flex items-center gap-1" role="alert">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{categoryError}</span>
            </p>
          )}
        </div>
      </div>
    );
  }
);

ItemInfoFields.displayName = "ItemInfoFields";
