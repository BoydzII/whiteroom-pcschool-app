export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbx9GklGAyE0_T10RZaRUmPrYoELLIUNOCbv5STxDcCZDFd1NQkHH763RRiUclna4mDjwg/exec';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomName = searchParams.get('roomName') || '';
    const res = await fetch(`${GAS_URL}?action=get_students&roomName=${encodeURIComponent(roomName)}`, { cache: 'no-store' });
    return NextResponse.json(await res.json());
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
