export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
const GAS_URL = 'https://script.google.com/macros/s/AKfycbx9GklGAyE0_T10RZaRUmPrYoELLIUNOCbv5STxDcCZDFd1NQkHH763RRiUclna4mDjwg/exec';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || '';
    const res = await fetch(`${GAS_URL}?action=get_attendance&eventId=${eventId}`, { cache: 'no-store' });
    return NextResponse.json(await res.json());
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const res = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'submit_attendance', ...data })
    });
    return NextResponse.json(await res.json());
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
