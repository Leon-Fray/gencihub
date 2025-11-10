import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
  }

  try {
    // Here we will call the external API
    // For now, let's simulate a successful cancellation
    console.log(`Attempting to cancel order: ${orderId}`)
    
    // Replace with actual external API call
    const externalApiResponse = await fetch(`https://upvotehub.com/ajax/v2/cancelOrder/${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any necessary authentication headers here
        // 'Authorization': `Bearer ${process.env.UPVOTEHUB_API_KEY}`,
      },
    });

    if (!externalApiResponse.ok) {
      const errorData = await externalApiResponse.json();
      throw new Error(errorData.message || 'Failed to cancel order with external API');
    }

    const externalApiData = await externalApiResponse.json();

    return NextResponse.json({ message: `Order ${orderId} cancelled successfully`, externalApiData }, { status: 200 })
  } catch (error) {
    console.error(`Error cancelling order ${orderId}:`, error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel upvote order' },
      { status: 500 }
    )
  }
}
