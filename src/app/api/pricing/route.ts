import { NextResponse } from 'next/server';

const PRICING_URL = 'https://pricing.thetanuts.finance/all';

export async function GET() {
  try {
    const response = await fetch(PRICING_URL, {
      next: { revalidate: 30 }, // cache for 30 seconds on the server
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pricing' },
      { status: 500 }
    );
  }
}
