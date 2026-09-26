export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzjCDuMKqfxk7Te3H1T45LYMUpqe6HXq2kwoOxCR596-n4w017vwfOwhPaxou0jMSEi/exec';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    
    let url = `${GAS_URL}?action=get_homework`;
    if (roomId) url += `&roomId=${roomId}`;
    
    const res = await fetch(url, { cache: 'no-store' });
    const result = await res.json();
    if (result.homework) {
      result.homework.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const res = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'add_homework', ...data })
    });
    return NextResponse.json(await res.json());
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hwId = searchParams.get('hwId');
    const res = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete_homework', hwId })
    });
    return NextResponse.json(await res.json());
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
