import React, { useState } from 'react';

/**
 * EditForm component
 * Inline editing form for post details.
 */
export default function EditForm({ post, onSave, onCancel }) {
  const [title, setTitle] = useState(post.title || '');
  const [category, setCategory] = useState(post.category || 'Electronics');
  const [location, setLocation] = useState(post.location || '');
  const [description, setDescription] = useState(post.description || '');

  const categories = ['Electronics', 'Documents', 'Bags', 'Accessories', 'Other'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title: title.trim(),
      category,
      location: location.trim(),
      description: description.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-black/7 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-[#6E6B5F] mb-1">
          Title
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Item title"
          className="w-full bg-white border border-black/14 text-[#1C1B18] placeholder-[#A8A49A] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#C96442] focus:ring-2 focus:ring-[#C96442]/15"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#6E6B5F] mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white border border-black/14 text-[#1C1B18] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#C96442] focus:ring-2 focus:ring-[#C96442]/15"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#6E6B5F] mb-1">
            Location
          </label>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Block 34, 2nd Floor"
            className="w-full bg-white border border-black/14 text-[#1C1B18] placeholder-[#A8A49A] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#C96442] focus:ring-2 focus:ring-[#C96442]/15"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#6E6B5F] mb-1">
          Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed item description (optional)"
          className="w-full bg-white border border-black/14 text-[#1C1B18] placeholder-[#A8A49A] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#C96442] focus:ring-2 focus:ring-[#C96442]/15 resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[44px] px-3 py-2 text-sm font-medium text-[#6E6B5F] hover:text-[#1C1B18] active:scale-[0.97] transition-transform duration-100 flex items-center justify-center rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="min-h-[44px] px-5 py-2 bg-[#C96442] hover:bg-[#B5572E] text-white text-sm font-medium rounded-lg active:scale-[0.97] transition-transform duration-100 flex items-center justify-center"
        >
          Save
        </button>
      </div>
    </form>
  );
}
