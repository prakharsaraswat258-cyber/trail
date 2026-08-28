/**
 * Mock claim submission contract
 */
export async function submitClaim(itemId, claimData) {
  // claimData: { name: string, contact: string, proof: string }
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    success: true,
    claimId: `mock-${Date.now()}`,
    itemId,
  };
}
