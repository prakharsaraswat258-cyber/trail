import { createClient } from './supabase/client';

/**
 * Submit claim to Supabase claims table
 * @param {string} itemId - Found item ID or reference code
 * @param {{ name: string, contact: string, proof: string }} claimData
 * @returns {Promise<{ success: boolean, claimId: string, itemId: string }>}
 */
export async function submitClaim(itemId, claimData) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required. Please sign in to submit a claim.');
  }

  // Check if itemId is already a valid UUID; if not, look up the UUID by reference code
  let targetFoundItemId = itemId;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemId);

  if (!isUuid) {
    const { data: foundItem } = await supabase
      .from('found_items_public')
      .select('id')
      .eq('reference_code', itemId)
      .maybeSingle();

    if (foundItem?.id) {
      targetFoundItemId = foundItem.id;
    }
  }

  const fullName = claimData.fullName || claimData.name || '';
  const contact = claimData.contact || '';
  const proof = claimData.proof || claimData.proof_note || '';

  const isUserUuid = user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
  const claimantId = isUserUuid ? user.id : 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  const { data, error } = await supabase
    .from('claims')
    .insert({
      found_item_id: targetFoundItemId,
      claimant_id: claimantId,
      full_name: fullName,
      contact: contact,
      proof: proof,
      status: 'PENDING',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    claimId: data.id,
    itemId: targetFoundItemId,
  };
}
