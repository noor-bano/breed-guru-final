import { NextResponse } from 'next/server';

const MOCK_BREEDS = [
  { breed: 'Gir', confidence: 0.87 },
  { breed: 'Sahiwal', confidence: 0.11 },
  { breed: 'Red Sindhi', confidence: 0.02 }
];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile || !(imageFile instanceof File)) {
      return NextResponse.json({ error: 'Image file is required.' }, { status: 400 });
    }

    // In a real-world scenario, you would send this image to a model endpoint for classification.
    // For this demo, we simulate a delay and return a mock response.
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({ predictions: MOCK_BREEDS });
  } catch (error) {
    console.error('API classification error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
