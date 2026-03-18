import { NextRequest, NextResponse } from 'next/server';
import { sendAcknowledgementConfirmation } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Mock data for testing
    const mockFeatures = [
      { title: 'User Login & Authentication', description: 'Covers how to log in, reset passwords, and manage user roles and permissions.' },
      { title: 'Sales Transaction Processing', description: 'How to input sales, apply discounts, handle returns, and print receipts.' },
      { title: 'Inventory Management', description: 'Track stock levels, receive new inventory, and set reorder alerts.' },
      { title: 'Daily Sales Report', description: 'Generate end-of-day reports showing total sales, voids, and discounts.' },
      { title: 'System Settings & Configuration', description: 'Configure store info, tax rates, receipt templates, and printer settings.' },
    ];

    await sendAcknowledgementConfirmation({
      toEmail: email,
      toName: 'Test User',
      sessionTitle: 'POS System Training – Complete Walkthrough (Test)',
      trainerName: 'Trainer Admin',
      campaign: 'Q1 2026 Retail Campaign',
      position: 'Store Manager',
      features: mockFeatures,
      signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      acknowledgedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { 
        success: true, 
        message: `Test email sent to ${email}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send test email' },
      { status: 500 }
    );
  }
}
