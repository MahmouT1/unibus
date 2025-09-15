import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb-simple-connection';

export async function POST(request) {
  try {
    const db = await getDatabase();
    const subscriptionsCollection = db.collection('subscriptions');
    
    const paymentData = await request.json();
    
    // Validate required fields
    const { studentId, studentEmail, paymentMethod, amount, confirmationDate, renewalDate } = paymentData;
    
    if (!studentId || !studentEmail || !paymentMethod || !amount || !confirmationDate || !renewalDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      );
    }

    // Find existing subscription or create new one
    let subscription = await subscriptionsCollection.findOne({ studentEmail: studentEmail.toLowerCase() });
    
    if (!subscription) {
      // Create new subscription
      subscription = {
        studentId: studentId,
        studentEmail: studentEmail.toLowerCase(),
        totalPaid: 0,
        payments: [],
        status: 'inactive',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Add new payment record
    const newPayment = {
      id: `payment_${Date.now()}`,
      amount: paymentAmount,
      paymentMethod: paymentMethod,
      paymentDate: new Date(),
      confirmationDate: new Date(confirmationDate),
      renewalDate: new Date(renewalDate),
      installmentType: paymentAmount >= 6000 ? 'full' : 'partial'
    };

    // Update subscription
    subscription.payments.push(newPayment);
    subscription.totalPaid += paymentAmount;
    subscription.confirmationDate = new Date(confirmationDate);
    subscription.renewalDate = new Date(renewalDate);
    subscription.lastPaymentDate = new Date();
    subscription.updatedAt = new Date();
    
    // Update status based on total paid amount
    if (subscription.totalPaid >= 6000) {
      subscription.status = 'active';
    } else if (subscription.totalPaid > 0) {
      subscription.status = 'partial';
    }

    // Save to database
    if (subscription._id) {
      await subscriptionsCollection.updateOne(
        { _id: subscription._id },
        { $set: subscription }
      );
    } else {
      await subscriptionsCollection.insertOne(subscription);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      payment: newPayment,
      subscription: {
        studentId: subscription.studentId,
        studentEmail: subscription.studentEmail,
        totalPaid: subscription.totalPaid,
        status: subscription.status,
        confirmationDate: subscription.confirmationDate,
        renewalDate: subscription.renewalDate,
        lastPaymentDate: subscription.lastPaymentDate,
        totalPayments: subscription.payments.length
      }
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve subscription data for a student or all subscriptions for admin
export async function GET(request) {
  try {
    const db = await getDatabase();
    const subscriptionsCollection = db.collection('subscriptions');
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const studentEmail = searchParams.get('studentEmail');
    const adminView = searchParams.get('admin') === 'true';

    if (adminView) {
      // Return all subscriptions for admin view
      const allSubscriptions = await subscriptionsCollection.find({}).toArray();
      
      const formattedSubscriptions = allSubscriptions.map(subscription => ({
        studentId: subscription.studentId || '',
        studentEmail: subscription.studentEmail || '',
        totalPaid: subscription.totalPaid || 0,
        status: subscription.status || 'inactive',
        confirmationDate: subscription.confirmationDate || null,
        renewalDate: subscription.renewalDate || null,
        lastPaymentDate: subscription.lastPaymentDate || null,
        totalPayments: subscription.payments ? subscription.payments.length : 0,
        payments: subscription.payments || []
      }));

      return NextResponse.json({
        success: true,
        subscriptions: formattedSubscriptions
      });
    }

    if (!studentId && !studentEmail) {
      return NextResponse.json(
        { error: 'Student ID or email is required' },
        { status: 400 }
      );
    }
    
    // Find student subscription by email (primary) or studentId (fallback)
    let subscription = null;
    if (studentEmail) {
      subscription = await subscriptionsCollection.findOne({ studentEmail: studentEmail.toLowerCase() });
    } else if (studentId) {
      subscription = await subscriptionsCollection.findOne({ studentId: studentId });
    }

    if (!subscription) {
      return NextResponse.json({
        success: true,
        subscription: null,
        message: 'No subscription found for this student'
      });
    }

    return NextResponse.json({
      success: true,
      subscription: {
        studentId: subscription.studentId || '',
        studentEmail: subscription.studentEmail || '',
        totalPaid: subscription.totalPaid || 0,
        status: subscription.status || 'inactive',
        confirmationDate: subscription.confirmationDate || null,
        renewalDate: subscription.renewalDate || null,
        lastPaymentDate: subscription.lastPaymentDate || null,
        totalPayments: subscription.payments ? subscription.payments.length : 0,
        payments: subscription.payments || []
      }
    });

  } catch (error) {
    console.error('Subscription retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}